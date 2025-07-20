import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../../services/api';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Typography
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const formatCurrency = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value || 0);

function BudgetGrid({ year, month }) {
    const [budgetData, setBudgetData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBudgetData = useCallback(async () => {
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
    }, [year, month]);

    useEffect(() => {
        fetchBudgetData();
    }, [fetchBudgetData]);

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
            fetchBudgetData();
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

    if (loading) return <Typography>Loading budgets...</Typography>;
    if (error) return <Typography color="error">Error: {error}</Typography>;

    return (
        <Box>
            {Object.entries(groupedBudgets).map(([categoryId, data]) => (
                <Accordion key={categoryId} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6">{data.category_name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Subcategory</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Carry-over</TableCell>
                                    <TableCell>Recurring Bills</TableCell>
                                    <TableCell>Budgeted</TableCell>
                                    <TableCell>Actual</TableCell>
                                    <TableCell>Remaining</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.subcategories.map((sc) => {
                                    const effectiveBudget = (parseFloat(sc.budgeted_amount) || 0) + (sc.carryover_amount || 0);
                                    const remaining = effectiveBudget - (sc.actual_spending || 0);
                                    return (
                                        <TableRow key={sc.subcategory_id} hover>
                                            <TableCell>{sc.subcategory_name}</TableCell>
                                            <TableCell>
                                                <FormControl size="small" sx={{minWidth: 120}}>
                                                    <Select
                                                        value={sc.budget_type}
                                                        onChange={(e) => handleBudgetChange(sc.subcategory_id, 'budget_type', e.target.value)}
                                                    >
                                                        <MenuItem value="allowance">Allowance</MenuItem>
                                                        <MenuItem value="rolling">Rolling</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell>{formatCurrency(sc.carryover_amount)}</TableCell>
                                            <TableCell>{formatCurrency(sc.recurring_bills_total)}</TableCell>
                                            <TableCell>
                                                <TextField
                                                    type="number"
                                                    value={sc.budgeted_amount}
                                                    onChange={(e) => handleBudgetChange(sc.subcategory_id, 'budgeted_amount', e.target.value)}
                                                    inputProps={{ min: sc.recurring_bills_total || 0, step: "0.01" }}
                                                    size="small"
                                                    sx={{width: '100px'}}
                                                />
                                            </TableCell>
                                            <TableCell>{formatCurrency(sc.actual_spending)}</TableCell>
                                            <TableCell sx={{ color: remaining < 0 ? 'error.main' : 'inherit' }}>
                                                {formatCurrency(remaining)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </AccordionDetails>
                </Accordion>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" onClick={handleSaveChanges}>Save All Changes</Button>
            </Box>
        </Box>
    );
}

export default BudgetGrid;