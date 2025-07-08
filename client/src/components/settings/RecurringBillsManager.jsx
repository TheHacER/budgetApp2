import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Button, buttonVariants } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

function RecurringBillsManager() {
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchPageData = () => {
    setLoading(true);
    Promise.all([
      api.getActiveRecurringBills(),
      api.getAllVendors(),
      api.getAllSubcategories()
    ]).then(([billsData, vendorsData, subcategoriesData]) => {
      setBills(billsData);
      setVendors(vendorsData);
      setSubcategories(subcategoriesData);
    }).catch(err => {
      setError(err.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const handleOpenDialog = (bill = null) => {
    setEditingBill(bill);
    setFormData({
      vendor_id: bill?.vendor_id?.toString() || '',
      subcategory_id: bill?.subcategory_id?.toString() || '',
      amount: bill?.amount || '',
      day_of_month: bill?.day_of_month || '',
      start_date: bill?.start_date ? new Date(bill.start_date).toISOString().split('T')[0] : '',
      notes: bill?.notes || '',
      end_date: bill?.end_date ? new Date(bill.end_date).toISOString().split('T')[0] : '',
      end_date_is_indefinite: bill ? bill.end_date_is_indefinite : true,
      is_ongoing: bill ? !bill.start_date : false
    });
    setIsDialogOpen(true);
  };

  const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));
  const handleCheckboxChange = (name, checked) => {
    const newFormData = { ...formData, [name]: checked };
    if (name === 'is_ongoing' && checked) { newFormData.start_date = ''; }
    if (name === 'end_date_is_indefinite' && checked) { newFormData.end_date = ''; }
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (payload.is_ongoing) {
      payload.start_date = new Date().toISOString().split('T')[0];
    }

    try {
      if (editingBill) {
        await api.updateRecurringBill(editingBill.id, payload);
      } else {
        await api.createRecurringBill(payload);
      }
      fetchPageData();
      setIsDialogOpen(false);
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const handleDeactivate = async (billId) => {
    try {
      await api.deactivateRecurringBill(billId);
      fetchPageData();
    } catch (err) { alert(`Error: ${err.message}`); }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

  if (loading) return <p>Loading recurring bills...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>{editingBill ? 'Edit' : 'Add'} Recurring Bill</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2"><Label>Vendor</Label><Select onValueChange={(v) => handleSelectChange('vendor_id',v)} value={formData.vendor_id}><SelectTrigger><SelectValue placeholder="Select a vendor" /></SelectTrigger><SelectContent>{vendors.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.display_name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid gap-2"><Label>Category</Label><Select onValueChange={(v) => handleSelectChange('subcategory_id',v)} value={formData.subcategory_id}><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{subcategories.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.category_name} > {s.name}</SelectItem>)}</SelectContent></Select></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2"><Label htmlFor="amount">Amount (£)</Label><Input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleFormChange} required /></div>
                        <div className="grid gap-2"><Label htmlFor="day_of_month">Day of Month</Label><Input id="day_of_month" name="day_of_month" type="number" min="1" max="31" value={formData.day_of_month} onChange={handleFormChange} required /></div>
                    </div>
                    <div className="grid gap-2"><Label htmlFor="start_date">Start Date</Label><Input id="start_date" name="start_date" type="date" value={formData.start_date} onChange={handleFormChange} disabled={formData.is_ongoing} /><div className="flex items-center space-x-2 mt-2"><Checkbox id="is_ongoing" checked={formData.is_ongoing} onCheckedChange={(c) => handleCheckboxChange('is_ongoing', c)} /><label htmlFor="is_ongoing" className="text-sm">Bill is already ongoing</label></div></div>
                    <div className="grid gap-2"><Label htmlFor="end_date">End Date</Label><Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleFormChange} disabled={formData.end_date_is_indefinite} /><div className="flex items-center space-x-2 mt-2"><Checkbox id="end_date_is_indefinite" checked={formData.end_date_is_indefinite} onCheckedChange={(c) => handleCheckboxChange('end_date_is_indefinite', c)} /><label htmlFor="end_date_is_indefinite" className="text-sm">This bill does not end</label></div></div>
                    <div className="grid gap-2"><Label htmlFor="notes">Notes</Label><Input id="notes" name="notes" value={formData.notes} onChange={handleFormChange} /></div>
                    <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">{editingBill ? 'Update Bill' : 'Save Bill'}</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        <div className="flex justify-end items-center"><Button onClick={() => handleOpenDialog()}>Add Bill</Button></div>
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
