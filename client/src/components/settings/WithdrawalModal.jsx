import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

function WithdrawalModal({ goal, onSave, onClose }) {
  const [allSubcategories, setAllSubcategories] = useState([]);

  useEffect(() => {
    if (goal) {
      api.getAllSubcategories().then(setAllSubcategories);
    }
  }, [goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const withdrawalData = Object.fromEntries(formData.entries());
    try {
      await api.withdrawFromSavingsGoal(goal.id, withdrawalData);
      onSave();
      onClose();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (!goal) return null;

  return (
    <Dialog open={!!goal} onClose={onClose}>
      <DialogTitle>Withdraw from "{goal.title}"</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <DialogContentText sx={{mb: 2}}>
            Transfer funds from your savings goal to a spending category. This will increase the budget for that category for the current month.
          </DialogContentText>
          <TextField
            name="amount"
            label="Amount to Withdraw (£)"
            type="number"
            inputProps={{ step: "0.01" }}
            required
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="category-withdraw-label">Spending Category</InputLabel>
            <Select labelId="category-withdraw-label" name="subcategory_id" required>
              {allSubcategories.map(s => (
                <MenuItem key={s.id} value={s.id.toString()}>{s.category_name} &gt; {s.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 24px' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Confirm Withdrawal</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default WithdrawalModal;