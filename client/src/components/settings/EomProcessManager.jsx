import React, { useState } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

function EomProcessManager() {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed for previous month
    const [selectedYear, setSelectedYear] = useState(new Date().getMonth() === 0 ? currentYear - 1 : currentYear);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleRunProcess = async () => {
        setIsLoading(true);
        setResult(null);
        setError(null);
        try {
            const response = await api.runEomProcess(selectedYear, selectedMonth + 1); // API expects 1-indexed month
            setResult(response);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>End of Month Process</CardTitle>
                <CardDescription>
                    Select a month to close out. This will lock all transactions and budgets for that period and distribute any surplus from 'Allowance' budgets to your savings goals.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                        <SelectTrigger><SelectValue placeholder="Select Month" /></SelectTrigger>
                        <SelectContent>{MONTHS.map((month, index) => (<SelectItem key={month} value={index.toString()}>{month}</SelectItem>))}</SelectContent>
                    </Select>
                    <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                        <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                        <SelectContent>{YEARS.map(year => (<SelectItem key={year} value={year.toString()}>{year}</SelectItem>))}</SelectContent>
                    </Select>
                    <Button onClick={handleRunProcess} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Run End of Month'}
                    </Button>
                </div>
            </CardContent>
            {(result || error) && (
                <CardFooter>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {result && (
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p className="font-bold text-primary">{result.message}</p>
                            {result.allocations && result.allocations.length > 0 && (
                                <ul>
                                    {result.allocations.map((alloc, i) => (
                                        <li key={i}>- Allocated {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(alloc.allocated)} to "{alloc.goal}"</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}

export default EomProcessManager;