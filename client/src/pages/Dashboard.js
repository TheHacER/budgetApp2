import React, { useState, useEffect } from 'react';
import { getDashboardSummary, getForecast, getAllSavingsAccounts } from '../services/api'; // Added getAllSavingsAccounts
import BudgetBarChart from '../components/charts/BudgetBarChart';
import SavingsDonutChart from '../components/charts/SavingsDonutChart'; // Import the new chart
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [summaryData, setSummaryData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [savingsAccounts, setSavingsAccounts] = useState([]); // New state for savings
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all three sets of data in parallel
        const [summary, forecast, savings] = await Promise.all([
          getDashboardSummary(),
          getForecast(),
          getAllSavingsAccounts()
        ]);
        setSummaryData(summary);
        setForecastData(forecast);
        setSavingsAccounts(savings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

  const ForecastTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 border rounded-md bg-background shadow-sm">
          <p className="font-bold">{`Date: ${label}`}</p>
          <p className="text-sm text-primary">{`Projected Balance: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  const summary = summaryData?.month_to_date_summary;
  const allGoals = savingsAccounts.flatMap(acc => acc.goals);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {loading && <p>Loading financial summary...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {!loading && summaryData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Income</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{formatCurrency(summary.total_income)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Spending</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(summary.total_spending)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Surplus / Deficit</CardTitle></CardHeader>
            <CardContent><div className={`text-2xl font-bold ${summary.surplus_deficit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatCurrency(summary.surplus_deficit)}</div></CardContent>
          </Card>
        </div>
      )}

      {/* NEW: Savings Goals Section */}
      {!loading && allGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Your progress towards your financial goals.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {allGoals.map(goal => (
              <SavingsDonutChart key={goal.id} goal={goal} />
            ))}
          </CardContent>
        </Card>
      )}

      {!loading && forecastData && (
         <Card>
            <CardHeader>
              <CardTitle>12-Month Cashflow Forecast</CardTitle>
              <CardDescription>Projected balance based on your recurring bills.</CardDescription>
            </CardHeader>
            <CardContent>
               <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={forecastData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-GB', { month: 'short' })} />
                      <YAxis tickFormatter={formatCurrency} domain={['auto', 'auto']} />
                      <Tooltip content={<ForecastTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="running_balance" name="Projected Balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>
            </CardContent>
          </Card>
      )}

      {!loading && summaryData && (
        <Card>
          <CardHeader><CardTitle>Budget vs. Actual Spending</CardTitle></CardHeader>
          <CardContent><BudgetBarChart data={summaryData.budget_vs_actual} /></CardContent>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;