import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import SavingsGoalModal from './SavingsGoalModal';

function SavingsManager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
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
                <div className="text-sm text-center text-muted-foreground py-4">
                    Savings goals are now managed on the main 'Savings' page.
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingAccount ? 'Edit' : 'Add'} Savings Account</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveAccount} className="space-y-4 py-4">
            <div><Label>Account Name</Label><Input name="name" defaultValue={editingAccount?.name} required /></div>
            <div><Label>Institution</Label><Input name="institution" defaultValue={editingAccount?.institution} /></div>
            <div><Label>Account Number</Label><Input name="account_number" defaultValue={editingAccount?.account_number} /></div>
             <div><Label>Starting Balance</Label><Input name="current_balance" type="number" step="0.01" defaultValue={editingAccount?.current_balance || '0.00'} required /></div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">Save Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <SavingsGoalModal 
        isOpen={isGoalDialogOpen}
        goal={editingGoal}
        accounts={accounts}
        onClose={() => setIsGoalDialogOpen(false)}
        onSave={() => {
            setIsGoalDialogOpen(false);
            fetchAccounts();
        }}
      />
    </div>
  );
}

export default SavingsManager;