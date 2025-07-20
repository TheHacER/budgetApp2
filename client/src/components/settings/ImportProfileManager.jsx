import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { MoreVert, AddCircle } from '@mui/icons-material';

function ImportProfileManager() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

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
    handleCloseMenu();
  };

  const openDialog = (profile = null) => {
    setEditingProfile(profile);
    setIsDialogOpen(true);
  }

  const handleClickMenu = (event, profile) => {
    setAnchorEl(event.currentTarget);
    setEditingProfile(profile);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          onClick={() => openDialog(null)}
        >
          Add New Profile
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Profile Name</TableCell>
            <TableCell>Date Column</TableCell>
            <TableCell>Description Column</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {profiles.length > 0 ? profiles.map(profile => (
            <TableRow key={profile.id} hover>
              <TableCell>{profile.profile_name}</TableCell>
              <TableCell>{profile.date_col}</TableCell>
              <TableCell>{profile.description_col}</TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => handleClickMenu(e, profile)}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu && editingProfile?.id === profile.id}
                  onClose={handleCloseMenu}
                >
                  <MenuItem onClick={() => {
                    openDialog(profile);
                    handleCloseMenu();
                  }}>Edit</MenuItem>
                  <MenuItem onClick={() => handleDelete(profile.id)}>Delete</MenuItem>
                </Menu>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="textSecondary" p={2}>No import profiles created yet.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProfile ? 'Edit' : 'Add'} Import Profile</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <TextField
              name="profile_name"
              label="Profile Name"
              defaultValue={editingProfile?.profile_name}
              placeholder="e.g., My Barclays Account"
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="date_col"
              label="Date Column Header"
              defaultValue={editingProfile?.date_col}
              placeholder="Date"
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="description_col"
              label="Description Column Header"
              defaultValue={editingProfile?.description_col}
              placeholder="Transaction"
              required
              fullWidth
              margin="normal"
            />
            <Typography variant="subtitle2" sx={{mt: 2}}>Amount Columns (use one method)</Typography>
            <Box sx={{p: 2, border: '1px solid #eee', borderRadius: 1, mt: 1}}>
                <Typography variant="caption">Method 1: Single Amount Column</Typography>
                <TextField
                    name="amount_col"
                    label="Amount Column"
                    defaultValue={editingProfile?.amount_col}
                    placeholder="Amount (e.g., -12.34 for debits)"
                    fullWidth
                    margin="normal"
                    helperText="Use this if debits and credits are in the same column (debits are negative)."
                />
            </Box>
             <Box sx={{p: 2, border: '1px solid #eee', borderRadius: 1, mt: 2}}>
                <Typography variant="caption">Method 2: Separate Debit/Credit Columns</Typography>
                <TextField
                    name="debit_col"
                    label="Debit Column"
                    defaultValue={editingProfile?.debit_col}
                    placeholder="Paid Out"
                    fullWidth
                    margin="normal"
                />
                <TextField
                    name="credit_col"
                    label="Credit Column"
                    defaultValue={editingProfile?.credit_col}
                    placeholder="Paid In"
                    fullWidth
                    margin="normal"
                />
            </Box>
            <TextField
              name="date_format"
              label="Date Format (Optional)"
              defaultValue={editingProfile?.date_format}
              placeholder="e.g., YYYY-MM-DD"
              fullWidth
              margin="normal"
              helperText="E.g., DD/MM/YYYY. Leave blank to auto-detect."
            />
          </DialogContent>
          <DialogActions sx={{ p: '0 24px 24px' }}>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save Profile</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default ImportProfileManager;