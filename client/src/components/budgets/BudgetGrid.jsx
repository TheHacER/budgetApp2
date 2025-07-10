import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

function BudgetGrid({ year, month }) {
  const [budgetData, setBudgetData] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBudgetData = async () => {
      setLoading(true);
      try {
        const data = await api.getBudgetsByMonth(year, month);
        setBudgetData(data);
        const budgetMap = {};
        data.forEach(b => {
          budgetMap[b.category_id] = b.budgeted_amount;
        });
        setBudgets(budgetMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgetData();
  }, [year, month]);

  const handleBudgetChange = (categoryId, amount) => {
    setBudgets(prev => ({ ...prev, [categoryId]: amount }));
  };

  const handleSaveChanges = async () => {
    const budgetsToSave = budgetData.map(cat => ({
      category_id: cat.category_id,
      year,
      month,
      amount: parseFloat(budgets[cat.category_id] || 0)
    }));
    try {
      await api.setBudgetsBulk(budgetsToSave);
      alert('Budgets saved successfully!');
    } catch (err) {
      alert(`Error saving budgets: ${err.message}`);
    }
  };

  if (loading) return <p>Loading budgets...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Category</TableHead>
              <TableHead>Recurring Bills</TableHead>
              <TableHead>Budgeted Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetData.map((category) => (
              <TableRow key={category.category_id}>
                <TableCell className="font-medium">{category.category_name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(category.recurring_bills_total || 0)}
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-40"
                    placeholder="0.00"
                    value={budgets[category.category_id] || ''}
                    onChange={(e) => handleBudgetChange(category.category_id, e.target.value)}
                    min={category.recurring_bills_total || 0}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  );
}

export default BudgetGrid;