import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { PlusCircle, Trash2, Edit, TrendingDown } from 'lucide-react'; // Added TrendingDown icon
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import WithdrawalModal from './WithdrawalModal'; // Import the new modal

function SavingsManager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [goalToWithdraw, setGoalToWithdraw] = useState(null); // New state for withdrawal
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);

  const fetchAccounts = () => {
    api.getAllSavingsAccounts()
      .then(setAccounts)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const accountData = Object.fromEntries(formData.entries());
    try {
      if (editingAccount) {
        await api.updateSavingsAccount(editingAccount.id, accountData);
      } else {
        await api.createSavingsAccount(accountData);
      }
      fetchAccounts();
      setIsAccountDialogOpen(false);
      setEditingAccount(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const goalData = Object.fromEntries(formData.entries());
    const finalGoalData = { ...goalData, account_id: editingGoal.account_id };

    try {
      if (editingGoal && editingGoal.id) {
        await api.updateSavingsGoal(editingGoal.id, finalGoalData);
      } else {
        await api.createSavingsGoal(finalGoalData);
      }
      fetchAccounts();
      setIsGoalDialogOpen(false);
      setEditingGoal(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account and all its goals? This action cannot be undone.')) {
        try {
            await api.deleteSavingsAccount(accountId);
            fetchAccounts();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    }
  };

  if (loading) return <p>Loading savings accounts...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingAccount(null); setIsAccountDialogOpen(true); }}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Savings Account
        </Button>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        {accounts.map(account => (
          <AccordionItem value={`account-${account.id}`} key={account.id} className="border rounded-md px-4">
            <AccordionTrigger>
              <div className="flex justify-between w-full pr-4 items-center">
                <span className="font-semibold text-lg">{account.name} ({account.institution})</span>
                <span className="text-muted-foreground">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(account.current_balance)}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div className="flex justify-end gap-2 border-b pb-4">
                   <Button variant="outline" size="sm" onClick={() => { setEditingAccount(account); setIsAccountDialogOpen(true); }}><Edit className="h-3 w-3 mr-2"/>Edit Account</Button>
                   <Button variant="destructive" size="sm" onClick={() => handleDeleteAccount(account.id)}><Trash2 className="h-3 w-3 mr-2"/>Delete Account</Button>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <h4 className="font-semibold">Goals</h4>
                    <Button variant="secondary" size="sm" onClick={() => { setEditingGoal({account_id: account.id}); setIsGoalDialogOpen(true); }}><PlusCircle className="h-4 w-4 mr-2"/>Add Goal</Button>
                </div>
                {account.goals && account.goals.length > 0 ? (
                  <ul className="space-y-2">
                    {account.goals.map(goal => (
                      <li key={goal.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <p className="font-medium">{goal.title}</p>
                          <p className="text-sm text-muted-foreground">Target: {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(goal.target_amount)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setGoalToWithdraw(goal)}><TrendingDown className="h-4 w-4 mr-2"/>Withdraw</Button>
                            <Button variant="ghost" size="icon" onClick={() => { setEditingGoal({...goal, account_id: account.id}); setIsGoalDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={async () => { if(window.confirm('Are you sure?')) { await api.deleteSavingsGoal(goal.id); fetchAccounts(); } }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">No savings goals for this account yet.</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <WithdrawalModal goal={goalToWithdraw} onClose={() => setGoalToWithdraw(null)} onSave={fetchAccounts} />

      {/* Dialog for Savings Account */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingAccount ? 'Edit' : 'Add'} Savings Account</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveAccount} className="space-y-4 py-4">
            <div><Label htmlFor="name">Account Name</Label><Input id="name" name="name" defaultValue={editingAccount?.name} required /></div>
            <div><Label htmlFor="institution">Institution</Label><Input id="institution" name="institution" defaultValue={editingAccount?.institution} /></div>
            <div><Label htmlFor="account_number">Account Number</Label><Input id="account_number" name="account_number" defaultValue={editingAccount?.account_number} /></div>
             <div><Label htmlFor="current_balance">Starting Balance</Label><Input id="current_balance" name="current_balance" type="number" step="0.01" defaultValue={editingAccount?.current_balance || '0.00'} required /></div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">Save Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Savings Goal */}
       <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingGoal?.id ? 'Edit' : 'Add'} Savings Goal</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveGoal} className="space-y-4 py-4">
            <Input type="hidden" name="account_id" value={editingGoal?.account_id} />
            <div><Label htmlFor="title">Goal Title</Label><Input id="title" name="title" defaultValue={editingGoal?.title} required /></div>
            <div><Label htmlFor="target_amount">Target Amount (£)</Label><Input id="target_amount" name="target_amount" type="number" step="0.01" defaultValue={editingGoal?.target_amount} required /></div>
             <div><Label htmlFor="starting_balance">Starting Balance (£)</Label><Input id="starting_balance" name="starting_balance" type="number" step="0.01" defaultValue={editingGoal?.starting_balance || '0.00'} required /></div>
            <div><Label htmlFor="target_date">Target Date</Label><Input id="target_date" name="target_date" type="date" defaultValue={editingGoal?.target_date ? new Date(editingGoal.target_date).toISOString().split('T')[0] : ''} /></div>
            <div><Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue={editingGoal?.priority || 'medium'}>
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
    </div>
  );
}

export default SavingsManager;