import React, { useState, useRef } from 'react';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

function RestoreBackup({ onRestored }) {
    const [isRestoring, setIsRestoring] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsRestoring(true);
        setError('');
        try {
            const result = await api.restoreBackup(file);
            alert(result.message + "\n\nThe application will now reload.");
            // Give the server time to restart before re-initializing the app
            setTimeout(() => {
                onRestored();
                window.location.reload(); // Force a full page reload
            }, 3000); 
        } catch (err) {
            setError(err.message);
            setIsRestoring(false);
        }
    };

    return (
        <Card className="mt-8 border-dashed">
            <CardHeader>
                <CardTitle>Restore From Backup</CardTitle>
                <CardDescription>If you have a backup file, you can restore the application to its previous state here. The application will restart.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".db" disabled={isRestoring} className="hidden" id="backup-file-input"/>
                <Button onClick={() => fileInputRef.current.click()} disabled={isRestoring} className="w-full">
                    {isRestoring ? 'Restoring...' : 'Upload & Restore'}
                </Button>
            </CardContent>
            {error && <CardContent><p className="text-sm text-red-600">{error}</p></CardContent>}
        </Card>
    );
}


function InitialSetupPage() {
  const [jurisdiction, setJurisdiction] = useState('');
  const [fiscalDayStart, setFiscalDayStart] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { initializeApp, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!jurisdiction || !fiscalDayStart || !email || !password) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
    try {
      await api.register(email, password);
      const tempLoginData = await api.login(email, password);
      if (!tempLoginData.token) throw new Error("Failed to acquire temporary token for setup.");
      
      await api.saveAppSettings({
        jurisdiction,
        fiscal_day_start: parseInt(fiscalDayStart, 10),
      }, tempLoginData.token);

      await login(email, password);

    } catch (err) {
      setError(err.message);
      localStorage.removeItem('authToken');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg">
        <Card>
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
                      <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading}/>
                      <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading}/>
                  </div>
              </div>
  
              <div className="space-y-2">
                <Label htmlFor="jurisdiction">Your Jurisdiction</Label>
                <Select onValueChange={setJurisdiction} value={jurisdiction} disabled={isLoading}>
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
                  disabled={isLoading}
                />
              </div>
  
              {error && <p className="text-sm text-red-600">{error}</p>}
  
              <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Configuration and Start'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <RestoreBackup onRestored={initializeApp} />
      </div>
    </div>
  );
}

export default InitialSetupPage;