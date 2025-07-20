import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import SavingsDonutChart from '../components/charts/SavingsDonutChart';
import { Card, CardContent, CardHeader, Button, Grid, Typography, Box } from '@mui/material';
import { AddCircle } from '@mui/icons-material';
import SavingsGoalModal from '../components/settings/SavingsGoalModal';

function SavingsPage() {
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const fetchSavings = async () => {
    try {
      setLoading(true);
      const savings = await api.getAllSavingsAccounts();
      setSavingsAccounts(savings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const allGoals = savingsAccounts.flatMap(acc => acc.goals.map(g => ({ ...g, accountName: acc.name })));

  const handleOpenModal = (goal = null) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  }

  const handleSave = () => {
    setIsGoalModalOpen(false);
    fetchSavings();
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Savings Goals</Typography>
        <Button
          variant="contained"
          startIcon={<AddCircle />}
          onClick={() => handleOpenModal(null)}
        >
          Add Savings Goal
        </Button>
      </Box>

      {loading && <Typography>Loading savings goals...</Typography>}
      {error && <Typography color="error">Error: {error}</Typography>}

      {!loading && allGoals.length > 0 ? (
        <Grid container spacing={3}>
          {allGoals.map(goal => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={goal.id}>
              <Card>
                <CardHeader
                  title={goal.title}
                  subheader={goal.accountName}
                  action={
                    <Button size="small" onClick={() => handleOpenModal(goal)}>Edit</Button>
                  }
                />
                <CardContent>
                  <SavingsDonutChart goal={goal} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        !loading && <Typography color="textSecondary">You have not created any savings goals yet. Add one to get started.</Typography>
      )}

      {isGoalModalOpen && (
          <SavingsGoalModal
            isOpen={isGoalModalOpen}
            goal={editingGoal}
            accounts={savingsAccounts}
            onClose={() => setIsGoalModalOpen(false)}
            onSave={handleSave}
        />
      )}
    </Box>
  );
}

export default SavingsPage;