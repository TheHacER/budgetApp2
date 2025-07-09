import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function WithdrawalModal({ goal, onSave, onClose }) {
  const [allSubcategories, setAllSubcategories] = useState([]);

  useEffect(() => {
    if (goal) {
      api.getAllSubcategories().then(setAllSubcategories);
    }
  }, [goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const withdrawalData = Object.fromEntries(formData.entries());
    try {
      await api.withdrawFromSavingsGoal(goal.id, withdrawalData);
      onSave();
      onClose();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={!!goal} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Withdraw from "{goal.title}"</DialogTitle>
                <DialogDescription>
                    Transfer funds from your savings goal to a spending category. This will increase the budget for that category for the current month.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                    <Label htmlFor="amount">Amount to Withdraw (£)</Label>
                    <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div>
                    <Label htmlFor="subcategory_id">Spending Category</Label>
                    {/* CORRECTED: The field name is now subcategory_id */}
                    <Select name="subcategory_id" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category..." />
                        </SelectTrigger>
                        <SelectContent>
                            {allSubcategories.map(s => (
                                // CORRECTED: The > character is now properly escaped
                                <SelectItem key={s.id} value={s.id.toString()}>{s.category_name} &gt; {s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit">Confirm Withdrawal</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}

export default WithdrawalModal;