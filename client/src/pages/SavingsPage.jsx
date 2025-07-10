import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import SavingsDonutChart from '../components/charts/SavingsDonutChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { PlusCircle } from 'lucide-react';
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

  const allGoals = savingsAccounts.flatMap(acc => acc.goals.map(g => ({...g, accountName: acc.name})));

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Savings Goals</h1>
        <Button onClick={() => { setEditingGoal(null); setIsGoalModalOpen(true); }}><PlusCircle className="h-4 w-4 mr-2" /> Add Savings Goal</Button>
      </div>

      {loading && <p>Loading savings goals...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && allGoals.length > 0 ? (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allGoals.map(goal => (
             <Card key={goal.id}>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        {goal.title}
                        <Button variant="ghost" size="sm" onClick={() => { setEditingGoal(goal); setIsGoalModalOpen(true); }}>Edit</Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                     <SavingsDonutChart goal={goal} />
                </CardContent>
             </Card>
          ))}
        </div>
      ) : (
        !loading && <p className="text-center text-muted-foreground">You have not created any savings goals yet.</p>
      )}

      <SavingsGoalModal 
        isOpen={isGoalModalOpen}
        goal={editingGoal}
        accounts={savingsAccounts}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={() => {
            setIsGoalModalOpen(false);
            fetchSavings();
        }}
      />
    </div>
  );
}

export default SavingsPage;