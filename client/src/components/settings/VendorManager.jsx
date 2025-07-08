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

function VendorManager() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [newVendorDisplayName, setNewVendorDisplayName] = useState('');
  const [newVendorInternalName, setNewVendorInternalName] = useState('');
  const [editVendorDisplayName, setEditVendorDisplayName] = useState('');

  const fetchVendors = () => {
    setLoading(true);
    api.getAllVendors()
      .then(data => {
        setVendors(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      await api.createVendor({ name: newVendorInternalName, displayName: newVendorDisplayName });
      fetchVendors();
      setIsAddDialogOpen(false);
      setNewVendorDisplayName('');
      setNewVendorInternalName('');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setEditVendorDisplayName(vendor.display_name);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVendor = async (e) => {
    e.preventDefault();
    try {
      await api.updateVendor(selectedVendor.id, { name: selectedVendor.name, displayName: editVendorDisplayName });
      fetchVendors();
      setIsEditDialogOpen(false);
      setSelectedVendor(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    try {
      await api.deleteVendor(vendorId);
      fetchVendors();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading vendors...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add New Vendor</DialogTitle></DialogHeader>
                <form onSubmit={handleAddVendor} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="add-display-name">Display Name</Label>
                        <Input id="add-display-name" value={newVendorDisplayName} onChange={(e) => setNewVendorDisplayName(e.target.value)} placeholder="e.g., Amazon UK" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="add-internal-name">Internal Name / Rule</Label>
                        <Input id="add-internal-name" value={newVendorInternalName} onChange={(e) => setNewVendorInternalName(e.target.value)} placeholder="e.g., amazon" />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit">Save Vendor</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Edit Vendor</DialogTitle></DialogHeader>
                <form onSubmit={handleUpdateVendor} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-display-name">Display Name</Label>
                        <Input id="edit-display-name" value={editVendorDisplayName} onChange={(e) => setEditVendorDisplayName(e.target.value)} />
                    </div>
                     <div className="grid gap-2">
                        <Label>Internal Name</Label>
                        <p className="text-sm text-muted-foreground">{selectedVendor?.name}</p>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                        <Button type="submit">Update Vendor</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <div className="flex justify-between items-center">
            <Input placeholder="Search vendors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
            <Button onClick={() => setIsAddDialogOpen(true)}>Add Vendor</Button>
        </div>
        <div className="rounded-md border">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Internal Name (for rules)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredVendors.length > 0 ? (
                filteredVendors.map(vendor => (
                    <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.display_name}</TableCell>
                    <TableCell className="text-muted-foreground">{vendor.name}</TableCell>
                    <TableCell className="text-right">
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEditVendor(vendor)}>Edit</DropdownMenuItem>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone. This will set the vendor for any associated transactions to 'null'.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteVendor(vendor.id)} className={buttonVariants({ variant: "destructive" })}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">No vendors found.</TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
    </div>
  );
}

export default VendorManager;
