import React, { useState, useEffect } from 'react';
import { getAllSavingsAccounts } from '../services/api';
import SavingsDonutChart from '../components/charts/SavingsDonutChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

function SavingsPage() {
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        setLoading(true);
        const savings = await getAllSavingsAccounts();
        setSavingsAccounts(savings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSavings();
  }, []);

  const allGoals = savingsAccounts.flatMap(acc => acc.goals);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Savings Goals</h1>
      </div>

      {loading && <p>Loading savings goals...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && allGoals.length > 0 ? (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allGoals.map(goal => (
             <Card key={goal.id}>
                <CardContent className="pt-6">
                     <SavingsDonutChart goal={goal} />
                </CardContent>
             </Card>
          ))}
        </div>
      ) : (
        !loading && <p className="text-center text-muted-foreground">You have not created any savings goals yet. Go to Settings -> Savings to add one.</p>
      )}
    </div>
  );
}

export default SavingsPage;