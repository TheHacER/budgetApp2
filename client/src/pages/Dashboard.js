import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import SavingsDonutChart from '../components/charts/SavingsDonutChart';
import { Card, CardContent, CardHeader, Grid, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, Cancel } from '@mui/icons-material';

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

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!data) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Income Received" />
            <CardContent>
              <Typography variant="h5" color="green">{formatCurrency(data.summary.totalIncome)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Total Spending" />
            <CardContent>
              <Typography variant="h5" color="error">{formatCurrency(data.summary.totalSpending)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Planned Surplus" />
            <CardContent>
              <Typography variant="h5">{formatCurrency(data.summary.plannedSurplus)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader title="Current Surplus" />
            <CardContent>
              <Typography variant="h5" color="primary">{formatCurrency(data.summary.currentSurplus)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Monthly Income Status" />
            <CardContent>
              {data.incomeStatus.map(item => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography>{item.source_name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{formatCurrency(item.amount)}</Typography>
                    {item.received ? <CheckCircle color="success" /> : <Cancel color="disabled" />}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="In-Month Cashflow" subheader="Daily actual cashflow for the current financial month." />
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.inMonthCashflow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).getDate()} />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual Balance" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        {data.savingsGoals && data.savingsGoals.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Savings Goals Progress" />
              <CardContent>
                <Grid container spacing={3}>
                  {data.savingsGoals.map(goal => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={goal.id}>
                      <SavingsDonutChart goal={goal} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="12-Month Cashflow Forecast" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.twelveMonthForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-GB', { month: 'short' })} />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="running_balance" name="Projected Balance" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;