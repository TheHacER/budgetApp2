import React, { useState } from 'react';
import BudgetGrid from '../components/budgets/BudgetGrid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Month" /></SelectTrigger>
            <SelectContent>{MONTHS.map((month, index) => (<SelectItem key={month} value={(index + 1).toString()}>{month}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Select Year" /></SelectTrigger>
            <SelectContent>{YEARS.map(year => (<SelectItem key={year} value={year.toString()}>{year}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>
      <BudgetGrid year={selectedYear} month={selectedMonth} />
    </div>
  );
}
export default BudgetsPage;
