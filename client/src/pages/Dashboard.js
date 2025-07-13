import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import SavingsDonutChart from '../components/charts/SavingsDonutChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, XCircle } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const dashboardData = await api.getDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="p-4 md:p-6">Loading dashboard...</p>;
  if (error) return <p className="p-4 md:p-6 text-red-600">Error: {error}</p>;
  if (!data) return null;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Top Row Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Income Received</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{formatCurrency(data.income.total)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Budgeted Spending</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{formatCurrency(data.budget.total)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Planned Surplus</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{formatCurrency(data.surplus.planned)}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Current Surplus</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{formatCurrency(data.surplus.current)}</p></CardContent>
        </Card>
      </div>

      {/* Second Row: Income Details & In-Month Cashflow */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader><CardTitle>Monthly Income Status</CardTitle></CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {data.income.breakdown.map(item => (
                        <li key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{item.source_name}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(item.amount)}</span>
                                {item.received ? <CheckCircle className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-gray-400"/>}
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>In-Month Cashflow</CardTitle><CardDescription>Daily actual cashflow for the current financial month.</CardDescription></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.inMonthCashflow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).getDate()} />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Actual Balance" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Savings Goals */}
      {data.savingsGoals.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Savings Goals Progress</CardTitle></CardHeader>
          <CardContent className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {data.savingsGoals.map(goal => (<SavingsDonutChart key={goal.id} goal={goal} />))}
          </CardContent>
        </Card>
      )}

      {/* 12-Month Forecast */}
      <Card>
        <CardHeader><CardTitle>12-Month Cashflow Forecast</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.twelveMonthForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-GB', { month: 'short' })} />
              <YAxis tickFormatter={formatCurrency} domain={['auto', 'auto']} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="running_balance" name="Projected Balance" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;