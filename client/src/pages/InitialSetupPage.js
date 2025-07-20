import React, { useState, useRef } from 'react';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, CardContent, CardHeader, TextField, Select, MenuItem, FormControl, InputLabel, Typography, Box } from '@mui/material';

// This is the component for the "Restore from Backup" card.
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
      setTimeout(() => {
        onRestored();
        window.location.reload();
      }, 3000);
    } catch (err) {
      setError(err.message);
      setIsRestoring(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Restore From Backup"
        subheader="If you have a backup file, you can restore the application to its previous state here."
      />
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".db"
              disabled={isRestoring}
              style={{ display: 'none' }}
              id="backup-file-input"
            />
            <Button onClick={() => fileInputRef.current.click()} disabled={isRestoring} variant="outlined">
                Choose File
            </Button>
            <Button
              onClick={handleFileChange}
              disabled={isRestoring}
              variant="contained"
            >
                {isRestoring ? 'Restoring...' : 'Upload & Restore'}
            </Button>
        </Box>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </CardContent>
    </Card>
  );
}


// This is the main component for the Setup Page.
function InitialSetupPage() {
  const [jurisdiction, setJurisdiction] = useState('');
  const [fiscalDayStart, setFiscalDayStart] = useState('28');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, initializeApp } = useAuth();

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
      // Step 1: Register the new user
      await api.register(email, password);
      
      // Step 2: Get a temporary token by logging in
      const tempLoginData = await api.login(email, password);
      if (!tempLoginData.token) throw new Error("Failed to acquire temporary token for setup.");

      // Step 3: Save the initial settings with the token
      await api.saveAppSettings({
        jurisdiction,
        fiscal_day_start: parseInt(fiscalDayStart, 10),
      }, tempLoginData.token);

      // Step 4: Perform a final login to set the auth state in the app
      await login(email, password);
      
      // No need to reload, the AuthContext state change will trigger the redirect
      
    } catch (err) {
      setError(err.message);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 2, // Add padding for smaller screens
    }}>
        <Box sx={{ width: '100%', maxWidth: 500, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card>
                <CardHeader
                    title="Initial Application Setup"
                    subheader="Welcome! Please create your admin account and configure your financial calendar."
                />
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="subtitle1" gutterBottom>Admin Account</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                type="email"
                                label="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                fullWidth
                            />
                            <TextField
                                type="password"
                                label="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                fullWidth
                            />
                        </Box>
                        
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="jurisdiction-label">Your Jurisdiction</InputLabel>
                            <Select
                                labelId="jurisdiction-label"
                                value={jurisdiction}
                                onChange={e => setJurisdiction(e.target.value)}
                                disabled={isLoading}
                                required
                                label="Your Jurisdiction"
                            >
                                <MenuItem value="" disabled>Select your region...</MenuItem>
                                <MenuItem value="england-and-wales">England and Wales</MenuItem>
                                <MenuItem value="scotland">Scotland</MenuItem>
                                <MenuItem value="northern-ireland">Northern Ireland</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Financial Month Start Day"
                            type="number"
                            inputProps={{ min: "1", max: "28" }}
                            value={fiscalDayStart}
                            onChange={(e) => setFiscalDayStart(e.target.value)}
                            required
                            disabled={isLoading}
                            fullWidth
                            margin="normal"
                        />

                        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

                        <Button type="submit" variant="contained" fullWidth disabled={isLoading} sx={{ mt: 2, py: 1.5 }}>
                            {isLoading ? 'Saving...' : 'Save Configuration and Start'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <RestoreBackup onRestored={initializeApp} />
        </Box>
    </Box>
  );
}

export default InitialSetupPage;