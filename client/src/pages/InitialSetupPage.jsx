import React, { useState } from 'react';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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
  const { login, reloadSettings } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!jurisdiction || !fiscalDayStart || !email || !password) {
      setError('All fields are required.');
      return;
    }
    try {
      // Step 1: Register the first user. The API now prevents further registrations.
      await api.register(email, password);

      // Step 2: Log in to get an auth token for subsequent requests.
      const loginData = await api.login(email, password);
      localStorage.setItem('authToken', loginData.token); // Manually set token for the next call

      // Step 3: Save the initial application settings.
      await api.saveAppSettings({
        jurisdiction,
        fiscal_day_start: parseInt(fiscalDayStart, 10),
      });

      // Step 4: Use the context's reload function to refresh the app state.
      // This will set the new token in the context and fetch the completed settings.
      await login(email, password);
      await reloadSettings();

    } catch (err) {
      setError(err.message);
      localStorage.removeItem('authToken'); // Clean up token on failure
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Initial Application Setup</CardTitle>
          <CardDescription>
            Welcome! Please create your admin account and configure your financial calendar.
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
                required
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