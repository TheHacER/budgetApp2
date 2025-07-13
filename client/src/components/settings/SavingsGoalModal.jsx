import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function SavingsGoalModal({ isOpen, goal, accounts, onClose, onSave }) {

    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (goal) {
            setFormData(goal);
        } else {
            setFormData({ priority: 'medium' });
        }
    }, [goal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (goal && goal.id) {
                await api.updateSavingsGoal(goal.id, formData);
            } else {
                await api.createSavingsGoal(formData);
            }
            onSave();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
         <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
              <DialogHeader><DialogTitle>{goal?.id ? 'Edit' : 'Add'} Savings Goal</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div>
                    <Label htmlFor="account_id">Savings Account</Label>
                    <Select name="account_id" value={formData?.account_id?.toString()} onValueChange={(v) => handleSelectChange('account_id', v)} required>
                        <SelectTrigger><SelectValue placeholder="Select an account..."/></SelectTrigger>
                        <SelectContent>{accounts.map(acc => <SelectItem key={acc.id} value={acc.id.toString()}>{acc.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div><Label htmlFor="title">Goal Title</Label><Input id="title" name="title" value={formData?.title || ''} onChange={handleChange} required /></div>
                <div><Label htmlFor="target_amount">Target Amount (£)</Label><Input id="target_amount" name="target_amount" type="number" step="0.01" value={formData?.target_amount || ''} onChange={handleChange} required /></div>
                <div><Label htmlFor="current_amount">Current Balance (£)</Label><Input id="current_amount" name="current_amount" type="number" step="0.01" value={formData?.current_amount || '0.00'} onChange={handleChange} required /></div>
                <div><Label htmlFor="target_date">Target Date</Label><Input id="target_date" name="target_date" type="date" value={formData?.target_date ? new Date(formData.target_date).toISOString().split('T')[0] : ''} onChange={handleChange} /></div>
                <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" value={formData?.priority || 'medium'} onValueChange={(v) => handleSelectChange('priority', v)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit">Save Goal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
    )
}
export default SavingsGoalModal;