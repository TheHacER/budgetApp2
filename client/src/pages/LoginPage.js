import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, CardContent, CardHeader, TextField, Typography, Box } from '@mui/material';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card sx={{ minWidth: 340, maxWidth: '90%'}}>
        <CardHeader title="Login" subheader="Enter your credentials to access your budget." />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              id="email"
              type="email"
              label="Email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              id="password"
              type="password"
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            {error && <Typography color="error" sx={{mt: 2}}>{error}</Typography>}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5 }}>
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;