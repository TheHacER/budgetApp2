import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SavingsDonutChart = ({ goal }) => {
  // FIX: Ensure both savedAmount and target_amount have fallbacks to prevent NaN
  const savedAmount = goal.current_amount || 0;
  const targetAmount = goal.target_amount || 0;
  const remainingAmount = targetAmount - savedAmount;

  const data = [
    { name: 'Saved', value: savedAmount > 0 ? savedAmount : 0 },
    { name: 'Remaining', value: remainingAmount > 0 ? remainingAmount : 0 },
  ];

  // If there's no data, create a single grey circle
  const finalData = (savedAmount === 0 && remainingAmount === 0) ? [{ name: 'Empty', value: 1 }] : data;
  const COLORS = (savedAmount === 0 && remainingAmount === 0) ? ['#e5e7eb'] : ['#16a34a', '#e5e7eb'];

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      if (payload[0].name === 'Empty') return null;
      return (
        <div className="p-2 border rounded-md bg-background shadow-sm">
          <p className="font-bold">{`${payload[0].name}: ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center">
        <div style={{ width: '100%', height: 150, position: 'relative' }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={finalData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        fill="#8884d8"
                        paddingAngle={finalData.length > 1 ? 5 : 0}
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
            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                <span className="text-xs text-muted-foreground">Saved</span>
                <span className="font-bold text-lg">{formatCurrency(savedAmount)}</span>
            </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
            Target: {formatCurrency(targetAmount)}
        </p>
    </div>
  );
};

export default SavingsDonutChart;
