import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

function CategorizationModal({ transaction, allSubcategories, allVendors, onClose, onSave }) {
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [newVendorName, setNewVendorName] = useState('');

  const isOpen = !!transaction;

  useEffect(() => {
    if (transaction) {
      setSelectedSubcategory(transaction.subcategory_id?.toString() || '');
      setSelectedVendor(transaction.vendor_id?.toString() || '');
      setNewVendorName('');
    }
  }, [transaction]);

  const handleSave = async () => {
    try {
      let vendorIdToSave = selectedVendor;
      if (selectedVendor === 'new' && newVendorName) {
        const newVendor = await api.createVendor({ name: newVendorName.toLowerCase(), displayName: newVendorName });
        vendorIdToSave = newVendor.id.toString();
      }

      if (vendorIdToSave && vendorIdToSave !== transaction.vendor_id?.toString()) {
        await api.updateTransactionVendor(transaction.id, vendorIdToSave);
      }
      if (selectedSubcategory && selectedSubcategory !== transaction.subcategory_id?.toString()) {
        await api.categorizeTransaction(transaction.id, selectedSubcategory);
      }
      await onSave();
    } catch (error) {
      console.error("Failed to save categorization", error);
      alert("Error: " + error.message);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Categorize Transaction</DialogTitle>
          <DialogDescription>
            Assign a category and vendor to this transaction.
          </DialogDescription>
        </DialogHeader>

        {transaction && (
          <div className="py-4 space-y-4">
            <div className="bg-muted p-3 rounded-md text-sm">
              <div className="flex justify-between"><span>Date:</span> <strong>{transaction.transaction_date}</strong></div>
              <div className="flex justify-between"><span>Description:</span> <strong>{transaction.description_original}</strong></div>
              <div className="flex justify-between"><span>Amount:</span> <strong className={transaction.is_debit ? 'text-destructive' : 'text-green-600'}>{formatCurrency(transaction.amount)}</strong></div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select onValueChange={setSelectedVendor} value={selectedVendor}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="-- Select Vendor --" />
                </SelectTrigger>
                <SelectContent>
                  {allVendors.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.display_name}</SelectItem>)}
                  <SelectItem value="new">-- Create New Vendor --</SelectItem>
                </SelectContent>
              </Select>
              {selectedVendor === 'new' && (
                <Input
                  placeholder="New Vendor Name"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
               <Select onValueChange={setSelectedSubcategory} value={selectedSubcategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="-- Select Category --" />
                </SelectTrigger>
                <SelectContent>
                  {allSubcategories.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.category_name} > {s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CategorizationModal;
