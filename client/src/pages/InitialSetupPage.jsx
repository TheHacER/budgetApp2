import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveAppSettings } from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

function InitialSetupPage() {
  const [jurisdiction, setJurisdiction] = useState('');
  const [fiscalDayStart, setFiscalDayStart] = useState('');
  const [error, setError] = useState('');
  const { reloadSettings } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!jurisdiction || !fiscalDayStart) {
      setError('Please select a jurisdiction and enter a start day.');
      return;
    }
    try {
      await saveAppSettings({ jurisdiction, fiscal_day_start: parseInt(fiscalDayStart, 10) });
      await reloadSettings();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Initial Application Setup</CardTitle>
          <CardDescription>
            Welcome! Please configure these one-time settings for your financial calendar. This cannot be changed later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="jurisdiction">Your Jurisdiction</Label>
              <Select onValueChange={setJurisdiction} value={jurisdiction}>
                <SelectTrigger id="jurisdiction">
                  <SelectValue placeholder="Select your region..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="england-and-wales">England and Wales</SelectItem>
                  <SelectItem value="scotland">Scotland</SelectItem>
                  <SelectItem value="northern-ireland">Northern Ireland</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">This is used to fetch the correct public holidays.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fiscalDay">Financial Month Start Day</Label>
              <Input
                id="fiscalDay"
                type="number"
                min="1"
                max="28"
                placeholder="e.g., 28"
                value={fiscalDayStart}
                onChange={(e) => setFiscalDayStart(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Enter the day your financial month begins (1-28). This will be adjusted for weekends/holidays.</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full">
              Save Configuration and Start
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default InitialSetupPage;
