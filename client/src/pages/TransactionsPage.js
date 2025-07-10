import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CategorizationModal from '../components/CategorizationModal';
import SplitTransactionModal from '../components/SplitTransactionModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ArrowUpRight, Trash2 } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

function TransactionsTable({ transactions, onCategorize, onSplit }) {
    return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.transaction_date}</TableCell>
                <TableCell className="font-medium">{tx.vendor_name || '--'}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{tx.description_original}</TableCell>
                <TableCell>
                  {tx.is_split ? ( <span className="font-semibold text-purple-600">Split</span> ) 
                  : tx.category_name ? ( `${tx.category_name} > ${tx.subcategory_name}` ) 
                  : ( <span className="text-muted-foreground">Uncategorized</span> )}
                </TableCell>
                <TableCell className={`text-right font-bold ${tx.is_debit ? 'text-destructive' : 'text-green-600'}`}>
                  {tx.is_debit ? '-' : '+'}
                  {formatCurrency(tx.amount)}
                </TableCell>
                <TableCell className="text-center">
                    {tx.is_split ? (
                      <Button variant="outline" size="sm" onClick={() => onSplit(tx)}>View Split</Button>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => onCategorize(tx)}>{tx.subcategory_id ? 'Edit' : 'Categorize'}</Button>
                        {tx.is_debit && (<Button variant="secondary" size="sm" className="ml-2" onClick={() => onSplit(tx)}>Split</Button>)}
                      </>
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
    if(window.confirm('Are you sure you want to permanently delete all ignored transactions? This cannot be undone.')) {
      await api.purgeIgnoredTransactions();
      onRefresh();
    }
  };

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Ignored Duplicates</CardTitle>
                {ignored.length > 0 && <Button variant="destructive" onClick={handlePurge}><Trash2 className="h-4 w-4 mr-2"/> Purge All</Button>}
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {ignored.length > 0 ? ignored.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>{tx.transaction_date}</TableCell>
                            <TableCell>{tx.description_original}</TableCell>
                            <TableCell className={`text-right ${tx.is_debit ? 'text-destructive' : 'text-green-600'}`}>{formatCurrency(tx.amount)}</TableCell>
                            <TableCell className="text-center"><Button size="sm" onClick={() => handleReinstate(tx.id)}><ArrowUpRight className="h-4 w-4 mr-2"/>Reinstate</Button></TableCell>
                        </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No ignored transactions found.</TableCell></TableRow>}
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
  const fileInputRef = React.useRef(null);
  const [transactionToCategorize, setTransactionToCategorize] = useState(null);
  const [transactionToSplit, setTransactionToSplit] = useState(null);

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

  const groupedTransactions = useMemo(() => {
    if (!appSettings) return {};
    const fiscalDayStart = appSettings.fiscal_day_start;

    return allTransactions.reduce((acc, tx) => {
      const txDate = new Date(tx.transaction_date);
      let month = txDate.getMonth();
      let year = txDate.getFullYear();

      if (txDate.getDate() >= fiscalDayStart) {
        month += 1;
      }
      if (month > 11) {
          month = 0;
          year += 1;
      }

      const financialMonth = new Date(year, month, 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' });

      if (!acc[financialMonth]) {
        acc[financialMonth] = [];
      }
      acc[financialMonth].push(tx);
      return acc;
    }, {});
  }, [allTransactions, appSettings]);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMessage('');
    setError('');
    try {
      const result = await api.uploadTransactionsFile(file);
      setUploadMessage(result.message);
      fetchPageData();
    } catch (err) { setError(err.message); }
    finally {
      setUploading(false);
      if(fileInputRef.current) { fileInputRef.current.value = ""; }
    }
  };

  return (
    <>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} accept=".csv" />
          <Button onClick={() => fileInputRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Statement'}
          </Button>
        </div>
        {uploadMessage && <p className="text-green-600 mb-4">{uploadMessage}</p>}
        {error && <p className="text-red-600 mb-4">Error: {error}</p>}

        <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Transactions</TabsTrigger>
                <TabsTrigger value="ignored">Ignored Duplicates</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                 <Accordion type="single" collapsible defaultValue={Object.keys(groupedTransactions)[0]} className="w-full space-y-4">
                    {Object.entries(groupedTransactions).map(([month, transactions]) => (
                        <AccordionItem key={month} value={month}>
                            <AccordionTrigger className="text-xl font-semibold p-4 bg-muted rounded-md">{month}</AccordionTrigger>
                            <AccordionContent>
                                <div className="p-1">
                                   <TransactionsTable transactions={transactions} onCategorize={setTransactionToCategorize} onSplit={setTransactionToSplit} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </TabsContent>
             <TabsContent value="ignored">
                <IgnoredTransactionsTab ignored={ignoredTransactions} onRefresh={fetchPageData}/>
            </TabsContent>
        </Tabs>
      </div>

      <CategorizationModal
        transaction={transactionToCategorize}
        allSubcategories={allSubcategories}
        allVendors={allVendors}
        onClose={() => setTransactionToCategorize(null)}
        onSave={fetchPageData}
      />
      <SplitTransactionModal
        transaction={transactionToSplit}
        allSubcategories={allSubcategories}
        onClose={() => setTransactionToSplit(null)}
        onSave={fetchPageData}
      />
    </>
  );
}

export default TransactionsPage;