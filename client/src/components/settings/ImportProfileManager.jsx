import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

function ImportProfileManager() {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);

    const fetchProfiles = () => {
        api.getAllImportProfiles().then(setProfiles).finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            if (editingProfile) {
                await api.updateImportProfile(editingProfile.id, data);
            } else {
                await api.createImportProfile(data);
            }
            fetchProfiles();
            setIsDialogOpen(false);
            setEditingProfile(null);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this import profile?')) {
            await api.deleteImportProfile(id);
            fetchProfiles();
        }
    };

    const openDialog = (profile = null) => {
        setEditingProfile(profile);
        setIsDialogOpen(true);
    }

    if(loading) return <p>Loading...</p>

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => openDialog(null)}><PlusCircle className="h-4 w-4 mr-2"/>Add New Profile</Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Profile Name</TableHead>
                            <TableHead>Date Column</TableHead>
                            <TableHead>Description Column</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profiles.length > 0 ? profiles.map(profile => (
                            <TableRow key={profile.id}>
                                <TableCell className="font-medium">{profile.profile_name}</TableCell>
                                <TableCell>{profile.date_col}</TableCell>
                                <TableCell>{profile.description_col}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openDialog(profile)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(profile.id)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan="4" className="h-24 text-center">No import profiles created yet.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader><DialogTitle>{editingProfile ? 'Edit' : 'Add'} Import Profile</DialogTitle></DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Profile Name</Label>
                            <Input name="profile_name" defaultValue={editingProfile?.profile_name} placeholder="e.g., My Barclays Account" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Date Column Header</Label><Input name="date_col" defaultValue={editingProfile?.date_col} placeholder="Date" required /></div>
                            <div className="grid gap-2"><Label>Description Column Header</Label><Input name="description_col" defaultValue={editingProfile?.description_col} placeholder="Transaction" required /></div>
                        </div>
                        <p className="text-sm text-center text-muted-foreground py-2">--- Amount Columns (use one method) ---</p>
                        <div className="grid gap-2 p-4 border rounded-lg">
                            <Label>Method 1: Single Amount Column</Label>
                            <Input name="amount_col" defaultValue={editingProfile?.amount_col} placeholder="Amount (e.g., -12.34 for debits)" />
                            <p className="text-xs text-muted-foreground">Use this if debits and credits are in the same column (debits are negative).</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                            <div className="grid gap-2">
                                <Label>Method 2: Debit Column</Label>
                                <Input name="debit_col" defaultValue={editingProfile?.debit_col} placeholder="Paid Out" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Credit Column</Label>
                                <Input name="credit_col" defaultValue={editingProfile?.credit_col} placeholder="Paid In" />
                            </div>
                            <p className="text-xs text-muted-foreground col-span-2">Use this if debits and credits are in separate columns.</p>
                        </div>
                        <div className="grid gap-2"><Label>Date Format (Optional)</Label><Input name="date_format" defaultValue={editingProfile?.date_format} placeholder="e.g., YYYY-MM-DD" /><p className="text-xs text-muted-foreground">E.g., DD/MM/YYYY. Leave blank to auto-detect.</p></div>

                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                            <Button type="submit">Save Profile</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
export default ImportProfileManager;