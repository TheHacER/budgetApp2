import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

function InitialSetupPage() {
  const [jurisdiction, setJurisdiction] = useState('');
  const [fiscalDayStart, setFiscalDayStart] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!jurisdiction || !fiscalDayStart || !email || !password) {
      setError('All fields are required.');
      return;
    }
    try {
      await api.register(email, password);
      await login(email, password);
      await api.saveAppSettings({ jurisdiction, fiscal_day_start: parseInt(fiscalDayStart, 10) });
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
            Welcome! Please configure your admin account and one-time financial settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label>Admin Account</Label>
                <div className="grid grid-cols-2 gap-4">
                    <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required/>
                    <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jurisdiction">Your Jurisdiction</Label>
              <Select onValueChange={setJurisdiction} value={jurisdiction}>
                <SelectTrigger id="jurisdiction"><SelectValue placeholder="Select your region..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="england-and-wales">England and Wales</SelectItem>
                  <SelectItem value="scotland">Scotland</SelectItem>
                  <SelectItem value="northern-ireland">Northern Ireland</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
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
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" className="w-full">Save Configuration and Start</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default InitialSetupPage;