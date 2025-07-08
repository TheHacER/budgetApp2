import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAllTransactions, getAllSubcategories, getAllVendors, uploadTransactionsFile } from '../services/api';
import CategorizationModal from '../components/CategorizationModal';
import SplitTransactionModal from '../components/SplitTransactionModal';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);
  const [transactionToCategorize, setTransactionToCategorize] = useState(null);
  const [transactionToSplit, setTransactionToSplit] = useState(null);

  const fetchPageData = useCallback(async () => {
    try {
      const [transactionsData, subcategoriesData, vendorsData] = await Promise.all([
        getAllTransactions(),
        getAllSubcategories(),
        getAllVendors()
      ]);
      setTransactions(transactionsData);
      setAllSubcategories(subcategoriesData);
      setAllVendors(vendorsData);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPageData();
  }, [fetchPageData]);

  const handleDataRefresh = () => {
    setTransactionToCategorize(null);
    setTransactionToSplit(null);
    fetchPageData();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMessage('');
    setError('');
    try {
      const result = await uploadTransactionsFile(file);
      setUploadMessage(result.message);
      handleDataRefresh();
    } catch (err) { setError(err.message); }
    finally {
      setUploading(false);
      if(fileInputRef.current) { fileInputRef.current.value = ""; }
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

  const renderActionButtons = (tx) => {
    if (tx.is_split) {
      return <Button variant="outline" size="sm" onClick={() => setTransactionToSplit(tx)}>View Split</Button>;
    }
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setTransactionToCategorize(tx)}>
          {tx.subcategory_id ? 'Edit' : 'Categorize'}
        </Button>
        {tx.is_debit && (
          <Button variant="secondary" size="sm" className="ml-2" onClick={() => setTransactionToSplit(tx)}>
            Split
          </Button>
        )}
      </>
    );
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
        <Card>
          <CardContent className="p-0">
            {loading && !uploading && <p className="p-4">Loading transactions...</p>}
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
                      {renderActionButtons(tx)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <CategorizationModal
        transaction={transactionToCategorize}
        allSubcategories={allSubcategories}
        allVendors={allVendors}
        onClose={() => setTransactionToCategorize(null)}
        onSave={handleDataRefresh}
      />
      <SplitTransactionModal
        transaction={transactionToSplit}
        allSubcategories={allSubcategories}
        onClose={() => setTransactionToSplit(null)}
        onSave={handleDataRefresh}
      />
    </>
  );
}

export default TransactionsPage;
