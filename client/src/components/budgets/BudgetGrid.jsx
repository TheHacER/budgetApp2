import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

function BudgetGrid({ year, month }) {
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBudgetData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getBudgetsByMonth(year, month);
      setBudgetData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [year, month]);

  const handleBudgetChange = (subcategoryId, field, value) => {
    setBudgetData(prevData =>
      prevData.map(item =>
        item.subcategory_id === subcategoryId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveChanges = async () => {
    const budgetsToSave = budgetData.map(item => ({
      subcategory_id: item.subcategory_id,
      year,
      month,
      amount: parseFloat(item.budgeted_amount || 0),
      budget_type: item.budget_type,
    }));
    try {
      await api.setBudgetsBulk(budgetsToSave);
      alert('Budgets saved successfully!');
      fetchBudgetData(); // Re-fetch to get fresh data
    } catch (err) {
      alert(`Error saving budgets: ${err.message}`);
    }
  };

  const groupedBudgets = useMemo(() => {
    return budgetData.reduce((acc, item) => {
      const { category_name, category_id } = item;
      if (!acc[category_id]) {
        acc[category_id] = {
          category_name,
          subcategories: [],
        };
      }
      acc[category_id].subcategories.push(item);
      return acc;
    }, {});
  }, [budgetData]);

  if (loading) return <p>Loading budgets...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={Object.keys(groupedBudgets)}>
        {Object.entries(groupedBudgets).map(([categoryId, data]) => (
          <AccordionItem key={categoryId} value={categoryId}>
            <AccordionTrigger className="text-xl font-semibold p-4 bg-muted rounded-md">
              {data.category_name}
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-1 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Subcategory</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Carry-over</TableHead>
                      <TableHead>Recurring Bills</TableHead>
                      <TableHead>Budgeted</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Remaining</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.subcategories.map((sc) => {
                      const effectiveBudget = (parseFloat(sc.budgeted_amount) || 0) + (sc.carryover_amount || 0);
                      const remaining = effectiveBudget - (sc.actual_spending || 0);
                      return (
                        <TableRow key={sc.subcategory_id}>
                          <TableCell className="font-medium">{sc.subcategory_name}</TableCell>
                          <TableCell>
                            <Select
                              value={sc.budget_type}
                              onValueChange={(value) => handleBudgetChange(sc.subcategory_id, 'budget_type', value)}
                            >
                              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="allowance">Allowance</SelectItem>
                                <SelectItem value="rolling">Rolling</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{formatCurrency(sc.carryover_amount)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatCurrency(sc.recurring_bills_total)}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="w-32"
                              value={sc.budgeted_amount}
                              onChange={(e) => handleBudgetChange(sc.subcategory_id, 'budgeted_amount', e.target.value)}
                              min={sc.recurring_bills_total || 0}
                            />
                          </TableCell>
                          <TableCell>{formatCurrency(sc.actual_spending)}</TableCell>
                          <TableCell className={remaining < 0 ? 'text-destructive' : ''}>
                            {formatCurrency(remaining)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <div className="flex justify-end mt-4">
        <Button onClick={handleSaveChanges}>Save All Changes</Button>
      </div>
    </div>
  );
}

export default BudgetGrid;