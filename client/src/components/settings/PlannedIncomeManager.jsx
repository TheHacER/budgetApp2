import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

function PlannedIncomeManager() {
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);

    const fetchIncomes = () => {
        api.getActivePlannedIncome().then(setIncomes).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchIncomes();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            if (editingIncome) {
                await api.updatePlannedIncome(editingIncome.id, data);
            } else {
                await api.createPlannedIncome(data);
            }
            fetchIncomes();
            setIsDialogOpen(false);
            setEditingIncome(null);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeactivate = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this income source?')) {
            await api.deactivatePlannedIncome(id);
            fetchIncomes();
        }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

    if(loading) return <p>Loading...</p>

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => { setEditingIncome(null); setIsDialogOpen(true); }}><PlusCircle className="h-4 w-4 mr-2"/>Add Income Source</Button>
            </div>
             <div className="rounded-md border">
                <Table>
                    <TableHeader><TableRow><TableHead>Source</TableHead><TableHead>Amount</TableHead><TableHead>Day of Month</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {incomes.map(income => (
                            <TableRow key={income.id}>
                                <TableCell className="font-medium">{income.source_name}</TableCell>
                                <TableCell>{formatCurrency(income.amount)}</TableCell>
                                <TableCell>{income.day_of_month}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { setEditingIncome(income); setIsDialogOpen(true); }}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeactivate(income.id)}>Deactivate</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingIncome ? 'Edit' : 'Add'} Planned Income</DialogTitle></DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div><Label>Source Name</Label><Input name="source_name" defaultValue={editingIncome?.source_name} required /></div>
                        <div><Label>Amount (£)</Label><Input name="amount" type="number" step="0.01" defaultValue={editingIncome?.amount} required /></div>
                        <div><Label>Day of Month</Label><Input name="day_of_month" type="number" min="1" max="31" defaultValue={editingIncome?.day_of_month} required /></div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
export default PlannedIncomeManager;