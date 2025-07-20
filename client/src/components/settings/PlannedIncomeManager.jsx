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
  Box
} from '@mui/material';
import { MoreVert, AddCircle } from '@mui/icons-material';

function PlannedIncomeManager() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

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
    handleCloseMenu();
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

  const handleClickMenu = (event, income) => {
    setAnchorEl(event.currentTarget);
    setEditingIncome(income);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  if (loading) return <p>Loading...</p>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          onClick={() => {
            setEditingIncome(null);
            setIsDialogOpen(true);
          }}
        >
          Add Income Source
        </Button>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Source</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Day of Month</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incomes.map(income => (
            <TableRow key={income.id} hover>
              <TableCell>{income.source_name}</TableCell>
              <TableCell>{formatCurrency(income.amount)}</TableCell>
              <TableCell>{income.day_of_month}</TableCell>
              <TableCell align="right">
                <IconButton onClick={(e) => handleClickMenu(e, income)}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={openMenu && editingIncome?.id === income.id}
                  onClose={handleCloseMenu}
                >
                  <MenuItem onClick={() => {
                    setIsDialogOpen(true);
                    handleCloseMenu();
                  }}>Edit</MenuItem>
                  <MenuItem onClick={() => handleDeactivate(income.id)}>Deactivate</MenuItem>
                </Menu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>{editingIncome ? 'Edit' : 'Add'} Planned Income</DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <TextField
              name="source_name"
              label="Source Name"
              defaultValue={editingIncome?.source_name}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="amount"
              label="Amount (£)"
              type="number"
              inputProps={{ step: "0.01" }}
              defaultValue={editingIncome?.amount}
              required
              fullWidth
              margin="normal"
            />
            <TextField
              name="day_of_month"
              label="Day of Month"
              type="number"
              inputProps={{ min: "1", max: "31" }}
              defaultValue={editingIncome?.day_of_month}
              required
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions sx={{ p: '0 24px 24px' }}>
            <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default PlannedIncomeManager;