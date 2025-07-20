import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Typography, Box } from '@mui/material';

const SavingsDonutChart = ({ goal }) => {
  const savedAmount = goal.current_amount || 0;
  const targetAmount = goal.target_amount || 0;
  const remainingAmount = Math.max(0, targetAmount - savedAmount);

  const data = [
    { name: 'Saved', value: savedAmount > 0 ? savedAmount : 0 },
    { name: 'Remaining', value: remainingAmount > 0 ? remainingAmount : 0 },
  ];

  // If the goal is empty, show a single grey circle
  const finalData = (savedAmount === 0 && remainingAmount === 0) ? [{ name: 'Empty', value: 1 }] : data;
  const COLORS = (savedAmount === 0 && remainingAmount === 0) ? ['#e0e0e0'] : ['#4caf50', '#e0e0e0'];

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      if (payload[0].name === 'Empty') return null;
      return (
        <Box sx={{ p: 1, bgcolor: 'background.paper', border: '1px solid #ccc', borderRadius: 1 }}>
          <Typography variant="body2"><strong>{`${payload[0].name}: ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(payload[0].value)}`}</strong></Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
      <Box sx={{ width: '100%', height: 150, position: 'relative' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={finalData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              fill="#8884d8"
              paddingAngle={finalData.length > 1 ? 2 : 0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {finalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <Box sx={{
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            textAlign: 'center'
        }}>
          <Typography variant="caption" color="textSecondary">Saved</Typography>
          <Typography variant="h6"><strong>{formatCurrency(savedAmount)}</strong></Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Target: {formatCurrency(targetAmount)}
      </Typography>
    </Box>
  );
};

export default SavingsDonutChart;