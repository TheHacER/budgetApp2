import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

  // Determine if vendor/category should be shown
  const showVendor = transactionType === 'expense' || transactionType === 'refund';
  const showCategory = transactionType === 'expense' || transactionType === 'refund';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader><DialogTitle>Categorize Transaction</DialogTitle></DialogHeader>
        {transaction && (
          <div className="py-4 space-y-4">
            <div className="bg-muted p-3 rounded-md text-sm">
              <div className="flex justify-between"><span>Date:</span> <strong>{new Date(transaction.transaction_date).toLocaleDateString("en-GB")}</strong></div>
              <div className="flex justify-between"><span>Description:</span> <strong>{transaction.description_original}</strong></div>
              <div className="flex justify-between"><span>Amount:</span> <strong className={transaction.is_debit ? 'text-destructive' : 'text-green-600'}>{formatCurrency(transaction.amount)}</strong></div>
            </div>
            {!transaction.is_debit && (
              <div className="grid gap-2">
                <Label>Transaction Type</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            )}
            {showVendor && (
              <div className="grid gap-2">
                <Label>Vendor</Label>
                <Select onValueChange={setSelectedVendor} value={selectedVendor}><SelectTrigger><SelectValue placeholder="-- Select Vendor --" /></SelectTrigger><SelectContent>{allVendors.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.display_name}</SelectItem>)}<SelectItem value="new">-- Create New Vendor --</SelectItem></SelectContent></Select>
                {selectedVendor === 'new' && ( <Input placeholder="New Vendor Name" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} className="mt-2" /> )}
              </div>
            )}
            {showCategory && (
              <div className="grid gap-2">
                <Label>Category</Label>
                 <Select onValueChange={setSelectedSubcategory} value={selectedSubcategory}><SelectTrigger><SelectValue placeholder="-- Select Category --" /></SelectTrigger><SelectContent>{allSubcategories.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.category_name} &gt; {s.name}</SelectItem>)}</SelectContent></Select>
              </div>
            )}
            
          </div>
        )}
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSave}>Save Changes</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default CategorizationModal;