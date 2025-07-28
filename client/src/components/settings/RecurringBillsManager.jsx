import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    FormControl,
    InputLabel,
    Box,
    Typography
} from '@mui/material';
import { MoreVert, AddCircle } from '@mui/icons-material';

function RecurringBillsManager({ isOpen: externalIsOpen, onClose: externalOnClose, billToCreateFromTx = null, onSave: externalOnSave }) {
    const [bills, setBills] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isInternalDialogOpen, setInternalDialogOpen] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [newVendorName, setNewVendorName] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const getInitialFormData = () => ({
        vendor_id: '',
        subcategory_id: '',
        amount: '',
        day_of_month: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: '',
    });

    const [formData, setFormData] = useState(getInitialFormData());

    const isControlled = externalIsOpen !== undefined;
    const isOpen = isControlled ? externalIsOpen : isInternalDialogOpen;

    const handleCloseDialog = () => {
        setEditingBill(null);
        setFormData(getInitialFormData());
        setNewVendorName('');
        if (isControlled) {
            externalOnClose();
        } else {
            setInternalDialogOpen(false);
        }
    };

    const fetchPageData = useCallback(() => {
        setLoading(true);
        Promise.all([
            api.getActiveRecurringBills(),
            api.getAllVendors(),
            api.getAllSubcategories()
        ]).then(([billsData, vendorsData, subcategoriesData]) => {
            setBills(billsData);
            setVendors(vendorsData);
            setSubcategories(subcategoriesData);
            setError('');
        }).catch(err => {
            setError(err.message);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!isControlled) {
            fetchPageData();
        } else {
            setLoading(true);
            Promise.all([
                api.getAllVendors(),
                api.getAllSubcategories()
            ]).then(([vendorsData, subcategoriesData]) => {
                setVendors(vendorsData);
                setSubcategories(subcategoriesData);
                setLoading(false);
            }).catch(err => {
                setError(err.message);
                setLoading(false);
            });
        }
    }, [isControlled, fetchPageData]);

    useEffect(() => {
        if (isOpen) {
            if (billToCreateFromTx) {
                setEditingBill(null);
                setFormData({
                    vendor_id: billToCreateFromTx.vendor_id?.toString() || '',
                    subcategory_id: billToCreateFromTx.subcategory_id?.toString() || '',
                    amount: billToCreateFromTx.amount || '',
                    day_of_month: new Date(billToCreateFromTx.transaction_date).getUTCDate(),
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: '',
                    notes: `From transaction: ${billToCreateFromTx.description_original}`,
                });
                setNewVendorName('');
            } else if (editingBill) {
                setFormData({
                    vendor_id: editingBill.vendor_id?.toString() || '',
                    subcategory_id: editingBill.subcategory_id?.toString() || '',
                    amount: editingBill.amount || '',
                    day_of_month: editingBill.day_of_month || '',
                    start_date: editingBill.start_date ? new Date(editingBill.start_date).toISOString().split('T')[0] : '',
                    end_date: editingBill.end_date ? new Date(editingBill.end_date).toISOString().split('T')[0] : '',
                    notes: editingBill.notes || '',
                });
                setNewVendorName('');
            } else {
                setEditingBill(null);
                setFormData(getInitialFormData());
                setNewVendorName('');
            }
        }
    }, [isOpen, editingBill, billToCreateFromTx]);

    const handleOpenDialog = (bill = null) => {
        setEditingBill(bill);
        setInternalDialogOpen(true);
    };

    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, end_date: formData.end_date || null };
        try {
            let vendorIdToUse = payload.vendor_id;
            if (payload.vendor_id === 'new' && newVendorName) {
                const newVendor = await api.createVendor({ name: newVendorName.toLowerCase().replace(/\s/g, ''), displayName: newVendorName });
                vendorIdToUse = newVendor.id.toString();
            }

            const finalPayload = { ...payload, vendor_id: vendorIdToUse };

            if (editingBill) {
                await api.updateRecurringBill(editingBill.id, finalPayload);
            } else {
                await api.createRecurringBill(finalPayload);
            }

            if (isControlled && externalOnSave) {
                externalOnSave();
            } else {
                fetchPageData();
            }
            handleCloseDialog();
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleDeactivate = async (billId) => {
        if (window.confirm('Are you sure? This will deactivate the recurring bill. It will no longer be included in future cashflow forecasts.')) {
            try {
                await api.deactivateRecurringBill(billId);
                fetchPageData();
            } catch (err) { alert(`Error: ${err.message}`); }
        }
        handleCloseMenu();
    };

    const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

    const handleClickMenu = (event, bill) => {
        setAnchorEl(event.currentTarget);
        setEditingBill(bill);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const dialogComponent = (
        <Dialog open={isOpen} onClose={handleCloseDialog}>
            <DialogTitle>{editingBill ? 'Edit' : 'Add'} Recurring Bill</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="vendor-select-label">Vendor</InputLabel>
                        <Select labelId="vendor-select-label" name="vendor_id" value={formData.vendor_id} onChange={handleSelectChange} required>
                            {vendors.map(v => <MenuItem key={v.id} value={v.id.toString()}>{v.display_name}</MenuItem>)}
                            {isControlled && <MenuItem value="new">-- Create New Vendor --</MenuItem>}
                        </Select>
                        {isControlled && formData.vendor_id === 'new' && (
                            <TextField
                                label="New Vendor Name"
                                value={newVendorName}
                                onChange={(e) => setNewVendorName(e.target.value)}
                                fullWidth
                                margin="normal"
                            />
                        )}
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="category-select-label">Category</InputLabel>
                        <Select labelId="category-select-label" name="subcategory_id" value={formData.subcategory_id} onChange={handleSelectChange} required>
                            {subcategories.map(s => <MenuItem key={s.id} value={s.id.toString()}>{s.category_name} &gt; {s.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField
                        name="amount"
                        label="Amount (£)"
                        type="number"
                        inputProps={{ step: "0.01" }}
                        value={formData.amount}
                        onChange={handleFormChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="day_of_month"
                        label="Day of Month"
                        type="number"
                        inputProps={{ min: "1", max: "31" }}
                        value={formData.day_of_month}
                        onChange={handleFormChange}
                        required
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        name="start_date"
                        label="Start Date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleFormChange}
                        required
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        name="end_date"
                        label="End Date (optional)"
                        type="date"
                        value={formData.end_date}
                        onChange={handleFormChange}
                        fullWidth
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        name="notes"
                        label="Notes"
                        value={formData.notes}
                        onChange={handleFormChange}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions sx={{ p: '0 24px 24px' }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button type="submit" variant="contained">{editingBill ? 'Update Bill' : 'Save Bill'}</Button>
                </DialogActions>
            </form>
        </Dialog>
    );

    if (isControlled) {
        return dialogComponent;
    }

    if (loading && !isControlled) return <p>Loading recurring bills...</p>;
    if (error && !isControlled) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <Box>
            {dialogComponent}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddCircle />} onClick={() => handleOpenDialog()}>
                    Add Bill
                </Button>
            </Box>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Day</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {bills.length > 0 ? (
                        bills.map(bill => (
                            <TableRow key={bill.id} hover>
                                <TableCell>{bill.vendor_name}</TableCell>
                                <TableCell>{bill.subcategory_name}</TableCell>
                                <TableCell>{formatCurrency(bill.amount)}</TableCell>
                                <TableCell>{bill.day_of_month}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={(e) => handleClickMenu(e, bill)}>
                                        <MoreVert />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={openMenu && editingBill?.id === bill.id}
                                        onClose={handleCloseMenu}
                                    >
                                        <MenuItem onClick={() => {
                                            handleOpenDialog(bill);
                                            handleCloseMenu();
                                        }}>Edit</MenuItem>
                                        <MenuItem onClick={() => handleDeactivate(bill.id)}>Deactivate</MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <Typography color="textSecondary" p={2}>No active recurring bills found.</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}

export default RecurringBillsManager;