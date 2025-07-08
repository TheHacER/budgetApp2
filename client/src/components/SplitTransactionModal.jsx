import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, PlusCircle } from 'lucide-react';

function SplitTransactionModal({ transaction, allSubcategories, onClose, onSave }) {
  const [splits, setSplits] = useState([{ subcategory_id: '', amount: '' }]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const isOpen = !!transaction;

  useEffect(() => {
    if (transaction) {
      setSplits([{ subcategory_id: '', amount: '' }, { subcategory_id: '', amount: '' }]);
      setRemainingAmount(transaction.amount);
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
      const validSplits = splits.filter(s => s.subcategory_id && s.amount);
      await api.splitTransaction(transaction.id, validSplits);
      onSave();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Split Transaction</DialogTitle>
          <DialogDescription>Divide the total amount across multiple categories. The remaining amount must be £0.00 to save.</DialogDescription>
        </DialogHeader>
        {transaction && (
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center bg-muted p-3 rounded-md">
              <div className="text-sm">
                <p>{transaction.transaction_date}: <span className="font-medium">{transaction.description_original}</span></p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{formatCurrency(transaction.amount)}</p>
                <p className={`text-sm font-medium ${Math.abs(remainingAmount) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                  Remaining: {formatCurrency(remainingAmount)}
                </p>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {splits.map((split, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Select onValueChange={(value) => handleSplitChange(index, 'subcategory_id', value)} value={split.subcategory_id}>
                      <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>{allSubcategories.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.category_name} > {s.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input type="number" placeholder="Amount" value={split.amount} onChange={(e) => handleSplitChange(index, 'amount', e.target.value)} className="w-32"/>
                  <Button variant="ghost" size="icon" onClick={() => removeSplit(index)} disabled={splits.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
             <Button variant="outline" size="sm" onClick={addSplit} className="mt-2"><PlusCircle className="h-4 w-4 mr-2"/>Add another split</Button>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={Math.abs(remainingAmount) > 0.01}>Save Split</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SplitTransactionModal;
