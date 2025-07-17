import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Button, buttonVariants } from '../ui/button';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

// This component can be used as a full-page manager or as a modal for creating a bill from a transaction
function RecurringBillsManager({ isOpen: externalIsOpen, onClose: externalOnClose, billToCreateFromTx = null, onSave: externalOnSave}) {
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Internal state for managing the dialog
  const [isInternalDialogOpen, setInternalDialogOpen] = useState(false);
  
  const [editingBill, setEditingBill] = useState(null);
  
  const getInitialFormData = () => ({
    vendor_id: '',
    subcategory_id: '',
    amount: '',
    day_of_month: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: '',
  });

  const [formData, setFormData] = useState(getInitialFormData());

  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : isInternalDialogOpen;

  const handleCloseDialog = () => {
    setEditingBill(null);
    setFormData(getInitialFormData()); 
    if (isControlled) {
      externalOnClose();
    } else {
      setInternalDialogOpen(false);
    }
  };
  
  const fetchPageData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.getActiveRecurringBills(),
      api.getAllVendors(),
      api.getAllSubcategories()
    ]).then(([billsData, vendorsData, subcategoriesData]) => {
      setBills(billsData);
      setVendors(vendorsData);
      setSubcategories(subcategoriesData);
      setError('');
    }).catch(err => {
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // Only fetch the full list of bills if we are in standalone mode.
    if (!isControlled) {
      fetchPageData();
    } else {
        // In modal mode, we still need vendors and subcategories for the form dropdowns
        setLoading(true);
         Promise.all([
          api.getAllVendors(),
          api.getAllSubcategories()
        ]).then(([vendorsData, subcategoriesData]) => {
            setVendors(vendorsData);
            setSubcategories(subcategoriesData);
            setLoading(false);
        }).catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isControlled, fetchPageData]);
  
  // Effect to handle opening the dialog and pre-filling form data from either an existing bill or a transaction
  useEffect(() => {
    if (isOpen) {
        if (billToCreateFromTx) {
            setEditingBill(null);
            setFormData({
                vendor_id: billToCreateFromTx.vendor_id?.toString() || '',
                subcategory_id: billToCreateFromTx.subcategory_id?.toString() || '',
                amount: billToCreateFromTx.amount || '',
                day_of_month: new Date(billToCreateFromTx.transaction_date).getUTCDate(), // Use UTC date to avoid timezone issues
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                notes: `From transaction: ${billToCreateFromTx.description_original}`,
            });
        } else if (editingBill) {
            setFormData({
                vendor_id: editingBill.vendor_id?.toString() || '',
                subcategory_id: editingBill.subcategory_id?.toString() || '',
                amount: editingBill.amount || '',
                day_of_month: editingBill.day_of_month || '',
                start_date: editingBill.start_date ? new Date(editingBill.start_date).toISOString().split('T')[0] : '',
                end_date: editingBill.end_date ? new Date(editingBill.end_date).toISOString().split('T')[0] : '',
                notes: editingBill.notes || '',
            });
        } else {
            setEditingBill(null);
            setFormData(getInitialFormData());
        }
    }
  }, [isOpen, editingBill, billToCreateFromTx]);

  const handleOpenDialog = (bill = null) => {
    setEditingBill(bill);
    setInternalDialogOpen(true);
  };
  
  const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, end_date: formData.end_date || null };
    try {
      if (editingBill) {
        await api.updateRecurringBill(editingBill.id, payload);
      } else {
        await api.createRecurringBill(payload);
      }
      
      if (isControlled && externalOnSave) {
        externalOnSave();
      } else {
        fetchPageData();
      }
      handleCloseDialog();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleDeactivate = async (billId) => {
    try {
      await api.deactivateRecurringBill(billId);
      fetchPageData();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

  const dialogComponent = (
        <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
            <DialogContent>
                <DialogHeader><DialogTitle>{editingBill ? 'Edit' : 'Add'} Recurring Bill</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2"><Label>Vendor</Label><Select name="vendor_id" onValueChange={(v) => handleSelectChange('vendor_id',v)} value={formData.vendor_id} required><SelectTrigger><SelectValue placeholder="Select a vendor" /></SelectTrigger><SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.display_name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Category</Label><Select name="subcategory_id" onValueChange={(v) => handleSelectChange('subcategory_id',v)} value={formData.subcategory_id} required><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{subcategories.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.category_name} &gt; {s.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label htmlFor="amount">Amount (£)</Label><Input id="amount" name="amount" type="number" step="0.01" value={formData.amount || ''} onChange={handleFormChange} required /></div>
                        <div className="grid gap-2"><Label htmlFor="day_of_month">Day of Month</Label><Input id="day_of_month" name="day_of_month" type="number" min="1" max="31" value={formData.day_of_month || ''} onChange={handleFormChange} required /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2"><Label htmlFor="start_date">Start Date</Label><Input id="start_date" name="start_date" type="date" value={formData.start_date || ''} onChange={handleFormChange} required /></div>
                      <div className="grid gap-2"><Label htmlFor="end_date">End Date (optional)</Label><Input id="end_date" name="end_date" type="date" value={formData.end_date || ''} onChange={handleFormChange} /></div>
                    </div>
                    <div className="grid gap-2"><Label htmlFor="notes">Notes</Label><Input id="notes" name="notes" value={formData.notes || ''} onChange={handleFormChange} /></div>
                    <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">{editingBill ? 'Update Bill' : 'Save Bill'}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
  );
  
  if (isControlled) {
      return dialogComponent;
  }
  
  if (loading && !isControlled) return <p>Loading recurring bills...</p>;
  if (error && !isControlled) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
        {dialogComponent}
        <div className="flex justify-end items-center"><Button onClick={() => handleOpenDialog()}><PlusCircle className="h-4 w-4 mr-2"/>Add Bill</Button></div>
        <div className="rounded-md border">
            <Table>
                <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Category</TableHead><TableHead>Amount</TableHead><TableHead>Day</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                    {bills.length > 0 ? ( bills.map(bill => (<TableRow key={bill.id}><TableCell className="font-medium">{bill.vendor_name}</TableCell><TableCell className="text-muted-foreground">{bill.subcategory_name}</TableCell><TableCell>{formatCurrency(bill.amount)}</TableCell><TableCell>{bill.day_of_month}</TableCell><TableCell className="text-right"><AlertDialog><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={() => handleOpenDialog(bill)}>Edit</DropdownMenuItem><AlertDialogTrigger asChild><DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem></AlertDialogTrigger></DropdownMenuContent></DropdownMenu><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will deactivate the recurring bill. It will no longer be included in future cashflow forecasts.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeactivate(bill.id)} className={buttonVariants({ variant: "destructive" })}>Deactivate</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></TableCell></TableRow>))) : ( <TableRow><TableCell colSpan="5" className="h-24 text-center">No active recurring bills found.</TableCell></TableRow> )}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}

export default RecurringBillsManager;