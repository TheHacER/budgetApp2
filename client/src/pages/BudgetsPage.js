import React, { useState } from 'react';
import BudgetGrid from '../components/budgets/BudgetGrid';
import { Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Budgets</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{minWidth: 150}}>
            <InputLabel id="month-select-label">Month</InputLabel>
            <Select 
              labelId="month-select-label"
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Month"
            >
              {MONTHS.map((month, index) => (<MenuItem key={month} value={index + 1}>{month}</MenuItem>))}
            </Select>
          </FormControl>
          <FormControl sx={{minWidth: 120}}>
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select 
              labelId="year-select-label"
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Year"
            >
              {YEARS.map(year => (<MenuItem key={year} value={year}>{year}</MenuItem>))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <BudgetGrid year={selectedYear} month={selectedMonth} />
    </Box>
  );
}
export default BudgetsPage;