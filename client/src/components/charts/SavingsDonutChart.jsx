import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SavingsDonutChart = ({ goal }) => {
  const savedAmount = goal.current_amount;
  const remainingAmount = goal.target_amount - savedAmount;

  const data = [
    { name: 'Saved', value: savedAmount > 0 ? savedAmount : 0 },
    { name: 'Remaining', value: remainingAmount > 0 ? remainingAmount : 0 },
  ];

  const COLORS = ['#16a34a', '#e5e7eb'];

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 border rounded-md bg-background shadow-sm">
          <p className="font-bold">{`${payload[0].name}: ${formatCurrency(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center">
        <h3 className="font-semibold text-lg">{goal.title}</h3>
        <div style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                     <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
            {formatCurrency(savedAmount)} / {formatCurrency(goal.target_amount)}
        </p>
    </div>
  );
};

export default SavingsDonutChart;