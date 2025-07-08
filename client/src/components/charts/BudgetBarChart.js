import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function BudgetBarChart({ data }) {
  const formatAsCurrency = (value) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  return (
    <div style={{ width: '100%', aspectRatio: '2 / 1', maxHeight: '400px' }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category_name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={formatAsCurrency} />
          <Tooltip
            formatter={formatAsCurrency}
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
            }}
          />
          <Legend />
          <Bar dataKey="budgeted" fill="hsl(var(--secondary-foreground))" name="Budgeted" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" fill="hsl(var(--primary))" name="Actual Spending" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BudgetBarChart;
