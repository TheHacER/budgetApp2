import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

function SavingsGoalModal({ isOpen, goal, accounts, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        ...goal,
        target_date: goal.target_date ? new Date(goal.target_date).toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({ priority: 'medium', current_amount: '0.00' });
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (goal && goal.id) {
        await api.updateSavingsGoal(goal.id, formData);
      } else {
        await api.createSavingsGoal(formData);
      }
      onSave();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{goal?.id ? 'Edit' : 'Add'} Savings Goal</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel id="account-select-label">Savings Account</InputLabel>
            <Select
              labelId="account-select-label"
              name="account_id"
              value={formData?.account_id?.toString() || ''}
              onChange={handleSelectChange}
              required
              label="Savings Account"
            >
              {accounts.map(acc => <MenuItem key={acc.id} value={acc.id.toString()}>{acc.name}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField
            name="title"
            label="Goal Title"
            value={formData?.title || ''}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="target_amount"
            label="Target Amount (£)"
            type="number"
            inputProps={{ step: "0.01" }}
            value={formData?.target_amount || ''}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="current_amount"
            label="Current Balance (£)"
            type="number"
            inputProps={{ step: "0.01" }}
            value={formData?.current_amount || '0.00'}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            name="target_date"
            label="Target Date"
            type="date"
            value={formData?.target_date || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              name="priority"
              value={formData?.priority || 'medium'}
              onChange={handleSelectChange}
              label="Priority"
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: '0 24px 24px' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save Goal</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default SavingsGoalModal;