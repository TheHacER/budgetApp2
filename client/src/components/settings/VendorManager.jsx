import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Box,
    Typography
} from '@mui/material';
import { MoreVert, AddCircle } from '@mui/icons-material';

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
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

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
        if(window.confirm('Are you absolutely sure? This will set the vendor for any associated transactions to null.')) {
            try {
                await api.deleteVendor(vendorId);
                fetchVendors();
              } catch (err) {
                alert(`Error: ${err.message}`);
              }
        }
        handleCloseMenu();
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.display_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleClickMenu = (event, vendor) => {
        setAnchorEl(event.currentTarget);
        setSelectedVendor(vendor);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    if (loading) return <p>Loading vendors...</p>;
    if (error) return <Typography color="error">Error: {error}</Typography>;

    return (
        <Box>
            <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
                <DialogTitle>Add New Vendor</DialogTitle>
                <form onSubmit={handleAddVendor}>
                    <DialogContent>
                        <TextField
                            label="Display Name"
                            value={newVendorDisplayName}
                            onChange={(e) => setNewVendorDisplayName(e.target.value)}
                            placeholder="e.g., Amazon UK"
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Internal Name / Rule"
                            value={newVendorInternalName}
                            onChange={(e) => setNewVendorInternalName(e.target.value)}
                            placeholder="e.g., amazon"
                            fullWidth
                            margin="normal"
                            helperText="This is the text used to match transactions, e.g., 'amazon' would match 'AMAZON.CO.UK'."
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: '0 24px 24px' }}>
                        <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Vendor</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
                <DialogTitle>Edit Vendor</DialogTitle>
                <form onSubmit={handleUpdateVendor}>
                    <DialogContent>
                        <TextField
                            label="Display Name"
                            value={editVendorDisplayName}
                            onChange={(e) => setEditVendorDisplayName(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <Typography variant="body2" color="textSecondary">Internal Name: {selectedVendor?.name}</Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: '0 24px 24px' }}>
                        <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Update Vendor</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <TextField
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ maxWidth: '400px' }}
                />
                <Button variant="contained" onClick={() => setIsAddDialogOpen(true)} startIcon={<AddCircle />}>
                    Add Vendor
                </Button>
            </Box>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Display Name</TableCell>
                        <TableCell>Internal Name (for rules)</TableCell>
                        <TableCell align="right">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredVendors.length > 0 ? (
                        filteredVendors.map(vendor => (
                            <TableRow key={vendor.id} hover>
                                <TableCell>{vendor.display_name}</TableCell>
                                <TableCell>{vendor.name}</TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={(e) => handleClickMenu(e, vendor)}>
                                        <MoreVert />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={openMenu && selectedVendor?.id === vendor.id}
                                        onClose={handleCloseMenu}
                                    >
                                        <MenuItem onClick={() => {
                                            handleEditVendor(vendor);
                                            handleCloseMenu();
                                        }}>Edit</MenuItem>
                                        <MenuItem onClick={() => handleDeleteVendor(vendor.id)}>Delete</MenuItem>
                                    </Menu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} align="center">
                                <Typography color="textSecondary" p={2}>No vendors found.</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    );
}

export default VendorManager;