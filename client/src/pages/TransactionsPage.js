import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CategorizationModal from '../components/CategorizationModal';
import SplitTransactionModal from '../components/SplitTransactionModal';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tabs,
    Tab,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    IconButton,
    TextField,
    Box,
    Typography
} from '@mui/material';
import { ArrowUpward, Delete, Edit, Repeat, CloudUpload, ExpandMore } from '@mui/icons-material';
import RecurringBillsManager from '../components/settings/RecurringBillsManager';

const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', }).format(value || 0);

function TransactionsTable({ transactions, onCategorize, onSplit, onMakeRecurring }) {
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Vendor</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                        <TableCell>{new Date(tx.transaction_date).toLocaleDateString("en-GB")}</TableCell>
                        <TableCell>{tx.vendor_name || '--'}</TableCell>
                        <TableCell>{tx.description_original}</TableCell>
                        <TableCell>
                            {tx.is_split ? (<Typography variant="caption">Split</Typography>)
                                : tx.category_name ? (`${tx.category_name} > ${tx.subcategory_name}`)
                                    : (<Typography variant="caption" color="textSecondary">Uncategorized</Typography>)}
                        </TableCell>
                        <TableCell align="right" style={{ color: tx.is_debit ? 'text.secondary' : 'green' }}>
                            {tx.is_debit ? '-' : '+'}
                            {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell align="center">
                            {tx.is_split ? (
                                <Button size="small" variant="outlined" onClick={() => onSplit(tx)}>View Split</Button>
                            ) : (
                                <Box>
                                    <Button size="small" variant="outlined" onClick={() => onCategorize(tx)} startIcon={tx.subcategory_id ? <Edit /> : null}>{tx.subcategory_id ? 'Edit' : 'Categorize'}</Button>
                                    <IconButton size="small" onClick={() => onMakeRecurring(tx)}><Repeat /></IconButton>
                                    {tx.is_debit && (<Button size="small" variant="contained" onClick={() => onSplit(tx)}>Split</Button>)}
                                </Box>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function IgnoredTransactionsTab({ ignored, onRefresh }) {
    const handleReinstate = async (id) => {
        await api.reinstateTransaction(id);
        onRefresh();
    };

    const handlePurge = async () => {
        if (window.confirm('Are you sure you want to permanently delete all ignored transactions? This cannot be undone.')) {
            await api.purgeIgnoredTransactions();
            onRefresh();
        }
    };

    return (
        <Card>
            <CardHeader
                title="Ignored Duplicates"
                action={
                    ignored.length > 0 && (
                        <Button variant="contained" color="secondary" onClick={handlePurge} startIcon={<Delete />}>
                            Purge All
                        </Button>
                    )
                }
            />
            <CardContent>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ignored.length > 0 ? ignored.map(tx => (
                            <TableRow key={tx.id} hover>
                                <TableCell>{new Date(tx.transaction_date).toLocaleDateString("en-GB")}</TableCell>
                                <TableCell>{tx.description_original}</TableCell>
                                <TableCell align="right" style={{ color: tx.is_debit ? 'text.secondary' : 'green' }}>{formatCurrency(tx.amount)}</TableCell>
                                <TableCell align="center">
                                    <Button size="small" onClick={() => handleReinstate(tx.id)} startIcon={<ArrowUpward />}>
                                        Reinstate
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography color="textSecondary" p={2}>No ignored transactions found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

function TransactionsPage() {
    const { appSettings } = useAuth();
    const [allTransactions, setAllTransactions] = useState([]);
    const [ignoredTransactions, setIgnoredTransactions] = useState([]);
    const [allSubcategories, setAllSubcategories] = useState([]);
    const [allVendors, setAllVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [transactionToCategorize, setTransactionToCategorize] = useState(null);
    const [transactionToSplit, setTransactionToSplit] = useState(null);
    const [filter, setFilter] = useState('all');
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
    const [transactionToMakeRecurring, setTransactionToMakeRecurring] = useState(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isApplyingRules, setIsApplyingRules] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    const fetchPageData = useCallback(async () => {
        try {
            setLoading(true);
            const [transactionsData, ignoredData, subcategoriesData, vendorsData] = await Promise.all([
                api.getAllTransactions(),
                api.getIgnoredTransactions(),
                api.getAllSubcategories(),
                api.getAllVendors()
            ]);
            setAllTransactions(transactionsData);
            setIgnoredTransactions(ignoredData);
            setAllSubcategories(subcategoriesData);
            setAllVendors(vendorsData);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const filteredTransactions = useMemo(() => {
        if (filter === 'all') return allTransactions;
        if (filter === 'uncategorized') return allTransactions.filter(tx => !tx.subcategory_id && !tx.is_split);
        if (filter === 'spending') return allTransactions.filter(tx => tx.is_debit);
        if (filter === 'income') return allTransactions.filter(tx => !tx.is_debit);
        return allTransactions;
    }, [allTransactions, filter]);

    const groupedTransactions = useMemo(() => {
        if (!appSettings) return {};
        const fiscalDayStart = appSettings.fiscal_day_start;
        return filteredTransactions.reduce((acc, tx) => {
            const txDate = new Date(tx.transaction_date);
            let month = txDate.getMonth();
            let year = txDate.getFullYear();
            if (txDate.getDate() >= fiscalDayStart) { month += 1; }
            if (month > 11) { month = 0; year += 1; }
            const financialMonth = new Date(year, month, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' });
            if (!acc[financialMonth]) { acc[financialMonth] = []; }
            acc[financialMonth].push(tx);
            return acc;
        }, {});
    }, [filteredTransactions, appSettings]);

    const handleOpenImportModal = () => {
        setIsImportModalOpen(true);
        setUploadMessage('');
        setError('');
    };

    const handleImportSubmit = async () => {
        if (!accessToken || !startDate || !endDate) {
            alert('Please provide an access token, start date and end date');
            return;
        }
        setUploading(true);
        try {
            const result = await api.importTransactions(accessToken, startDate, endDate);
            setUploadMessage(result.message);
            fetchPageData();
            setIsImportModalOpen(false);
        } catch (err) { setError(err.message); }
        finally { setUploading(false); }
    };

    const handleApplyRules = async () => {
        setIsApplyingRules(true);
        setError('');
        try {
            const result = await api.applyCategorizationRules();
            alert(result.message);
            fetchPageData();
        } catch (err) { setError(err.message); }
        finally { setIsApplyingRules(false); }
    };

    const handleMakeRecurring = (transaction) => {
        setTransactionToMakeRecurring(transaction);
        setIsRecurringModalOpen(true);
    };

    return (
        <>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h4">Transactions</Typography>
                    <Box>
                        <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')}>All</Button>
                        <Button variant={filter === 'spending' ? 'contained' : 'outlined'} onClick={() => setFilter('spending')}>Spending</Button>
                        <Button variant={filter === 'income' ? 'contained' : 'outlined'} onClick={() => setFilter('income')}>Income</Button>
                        <Button variant={filter === 'uncategorized' ? 'contained' : 'outlined'} color="secondary" onClick={() => setFilter('uncategorized')}>Uncategorized</Button>
                        <Button onClick={handleApplyRules} variant="outlined" disabled={isApplyingRules}>Apply Rules</Button>
                        <Button onClick={handleOpenImportModal} variant="contained" disabled={uploading} startIcon={<CloudUpload />}>
                            {uploading ? 'Uploading...' : 'Upload Statement'}
                        </Button>
                    </Box>
                </Box>
                {uploadMessage && <Typography color="success.main">{uploadMessage}</Typography>}
                {error && <Typography color="error">{error}</Typography>}

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                        <Tab label="All Transactions" />
                        <Tab label={`Ignored Duplicates (${ignoredTransactions.length})`} />
                    </Tabs>
                </Box>
                {tabValue === 0 && (
                    <Box>
                        {loading ? <Typography>Loading transactions...</Typography> : Object.keys(groupedTransactions).map(month => (
                            <Accordion key={month} defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="h6">{month}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                    <TransactionsTable transactions={groupedTransactions[month]} onCategorize={setTransactionToCategorize} onSplit={setTransactionToSplit} onMakeRecurring={handleMakeRecurring} />
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}
                {tabValue === 1 && <IgnoredTransactionsTab ignored={ignoredTransactions} onRefresh={fetchPageData} />}
            </Box>
            <CategorizationModal transaction={transactionToCategorize} allSubcategories={allSubcategories} allVendors={allVendors} onClose={() => setTransactionToCategorize(null)} onSave={fetchPageData} />
            <SplitTransactionModal transaction={transactionToSplit} allSubcategories={allSubcategories} allVendors={allVendors} onClose={() => setTransactionToSplit(null)} onSave={fetchPageData} />
            {isRecurringModalOpen && (
                <RecurringBillsManager isOpen={isRecurringModalOpen} onClose={() => setIsRecurringModalOpen(false)} billToCreateFromTx={transactionToMakeRecurring} onSave={fetchPageData} />
            )}
            <Dialog open={isImportModalOpen} onClose={() => setIsImportModalOpen(false)}>
                <DialogTitle>Import Transactions from Plaid</DialogTitle>
                <DialogContent>
                    <TextField label="Access Token" fullWidth margin="normal" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
                    <TextField label="Start Date (YYYY-MM-DD)" fullWidth margin="normal" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <TextField label="End Date (YYYY-MM-DD)" fullWidth margin="normal" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleImportSubmit} variant="contained" disabled={uploading} startIcon={<CloudUpload />}>
                        {uploading ? 'Importing...' : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default TransactionsPage;