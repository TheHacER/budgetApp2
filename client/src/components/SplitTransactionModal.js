import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Box, Typography } from '@mui/material';
import { Delete, AddCircle } from '@mui/icons-material';

function SplitTransactionModal({ transaction, allSubcategories, allVendors, onClose, onSave }) {
  const [splits, setSplits] = useState([{ subcategory_id: '', amount: '' }]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [newVendorName, setNewVendorName] = useState('');
  const isOpen = !!transaction;

  useEffect(() => {
    if (transaction) {
      setSplits([{ subcategory_id: '', amount: '' }, { subcategory_id: '', amount: '' }]);
      setRemainingAmount(transaction.amount);
      setSelectedVendor(transaction.vendor_id?.toString() || '');
      setNewVendorName('');
    } else {
      setSplits([{ subcategory_id: '', amount: '' }]);
    }
  }, [transaction]);

  useEffect(() => {
    if (transaction) {
      const totalSplit = splits.reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
      setRemainingAmount(transaction.amount - totalSplit);
    }
  }, [splits, transaction]);

  const handleSplitChange = (index, field, value) => {
    const newSplits = [...splits];
    newSplits[index][field] = value;
    setSplits(newSplits);
  };

  const addSplit = () => setSplits([...splits, { subcategory_id: '', amount: '' }]);
  const removeSplit = (index) => setSplits(splits.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (Math.abs(remainingAmount) > 0.01) {
      alert('You must allocate the full transaction amount.');
      return;
    }
    try {
      let vendorIdToSave = selectedVendor;
      if (selectedVendor === 'new' && newVendorName) {
        const newVendor = await api.createVendor({ name: newVendorName.toLowerCase().replace(/\s/g, ''), displayName: newVendorName });
        vendorIdToSave = newVendor.id.toString();
      }

      const validSplits = splits.filter(s => s.subcategory_id && s.amount > 0);
      if (validSplits.length === 0) {
        alert("You must add at least one valid split line.");
        return;
      }

      const payload = {
        splits: validSplits,
        vendor_id: vendorIdToSave
      };

      await api.splitTransaction(transaction.id, payload);
      onSave();
      onClose();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Split Transaction</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{mb: 2}}>
          Divide the total amount across multiple categories. The remaining amount must be £0.00 to save.
        </DialogContentText>
        {transaction && (
          <Box>
            <Box sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography>{new Date(transaction.transaction_date).toLocaleDateString("en-GB")}: <strong>{transaction.description_original}</strong></Typography>
              <Typography>Total Amount: <strong>{formatCurrency(transaction.amount)}</strong></Typography>
              <Typography color={Math.abs(remainingAmount) < 0.01 ? 'success.main' : 'error'}>
                Remaining: {formatCurrency(remainingAmount)}
              </Typography>
            </Box>
            <FormControl fullWidth margin="normal">
              <InputLabel id="split-vendor-label">Vendor</InputLabel>
              <Select labelId="split-vendor-label" value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}>
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
            {splits.map((split, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id={`split-category-label-${index}`}>Category</InputLabel>
                  <Select
                    labelId={`split-category-label-${index}`}
                    value={split.subcategory_id}
                    onChange={(e) => handleSplitChange(index, 'subcategory_id', e.target.value)}
                  >
                    {allSubcategories.map(s => (
                      <MenuItem key={s.id} value={s.id.toString()}>{s.category_name} &gt; {s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Amount"
                  type="number"
                  value={split.amount}
                  onChange={(e) => handleSplitChange(index, 'amount', e.target.value)}
                  sx={{ width: '150px' }}
                />
                <IconButton onClick={() => removeSplit(index)} disabled={splits.length <= 1}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddCircle />} onClick={addSplit} sx={{ mt: 2 }}>
              Add another split
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 24px' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={Math.abs(remainingAmount) > 0.01} variant="contained">Save Split</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SplitTransactionModal;