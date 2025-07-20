import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';

function CategorizationModal({ transaction, allSubcategories, allVendors, onClose, onSave }) {
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const [transactionType, setTransactionType] = useState('expense');
  const isOpen = !!transaction;

  useEffect(() => {
    if (transaction) {
      setSelectedSubcategory(transaction.subcategory_id?.toString() || '');
      setSelectedVendor(transaction.vendor_id?.toString() || '');
      setTransactionType(transaction.transaction_type || (transaction.is_debit ? 'expense' : 'income'));
      setNewVendorName('');
    }
  }, [transaction]);

  const handleSave = async () => {
    try {
      let vendorIdToSave = selectedVendor;
      if (selectedVendor === 'new' && newVendorName) {
        const newVendor = await api.createVendor({ name: newVendorName.toLowerCase().replace(/\s/g, ''), displayName: newVendorName });
        vendorIdToSave = newVendor.id.toString();
      }

      const payload = {
        subcategory_id: (transactionType === 'transfer' || transactionType === 'income') ? null : (selectedSubcategory || null),
        transaction_type: transactionType,
        vendor_id: (transactionType === 'transfer' || transactionType === 'income') ? null : (vendorIdToSave || null)
      };

      await api.categorizeTransaction(transaction.id, payload);

      await onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save categorization", error);
      alert("Error: " + error.message);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

  const showVendor = transactionType === 'expense' || transactionType === 'refund';
  const showCategory = transactionType === 'expense' || transactionType === 'refund';

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Categorize Transaction</DialogTitle>
      <DialogContent>
        {transaction && (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography>Date: <strong>{new Date(transaction.transaction_date).toLocaleDateString("en-GB")}</strong></Typography>
              <Typography>Description: <strong>{transaction.description_original}</strong></Typography>
              <Typography>Amount: <strong style={{ color: transaction.is_debit ? 'inherit' : 'green' }}>{formatCurrency(transaction.amount)}</strong></Typography>
            </Box>
            {!transaction.is_debit && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select labelId="transaction-type-label" value={transactionType} onChange={(e) => setTransactionType(e.target.value)}>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="refund">Refund</MenuItem>
                  <MenuItem value="transfer">Transfer</MenuItem>
                </Select>
              </FormControl>
            )}
            {showVendor && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="vendor-label">Vendor</InputLabel>
                <Select labelId="vendor-label" value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}>
                  {allVendors.map(v => <MenuItem key={v.id} value={v.id.toString()}>{v.display_name}</MenuItem>)}
                  <MenuItem value="new">-- Create New Vendor --</MenuItem>
                </Select>
                {selectedVendor === 'new' && (
                  <TextField
                    label="New Vendor Name"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                )}
              </FormControl>
            )}
            {showCategory && (
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select labelId="category-label" value={selectedSubcategory} onChange={(e) => setSelectedSubcategory(e.target.value)}>
                  {allSubcategories.map(s => (
                    <MenuItem key={s.id} value={s.id.toString()}>{s.category_name} &gt; {s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 24px' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CategorizationModal;