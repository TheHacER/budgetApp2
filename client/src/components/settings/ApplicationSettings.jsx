import React, { useState, useRef } from 'react';
import * as api from '../../services/api';
import { Button, Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import ImportProfileManager from './ImportProfileManager';
import { Download, Upload, Refresh } from '@mui/icons-material';

function ApplicationSettings() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMessage('');
    setError('');
    try {
      const response = await api.refreshHolidays();
      setMessage(response.message);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    setMessage('');
    setError('');
    try {
      await api.downloadBackup();
      setMessage('Backup downloaded successfully.');
    } catch (err) {
      setError(`Error creating backup: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!window.confirm('Are you sure you want to restore from this backup? This will overwrite all current data.')) {
        return;
    }

    setIsRestoring(true);
    setMessage('');
    setError('');

    try {
      const result = await api.restoreBackup(file);
      setMessage(result.message + " Page will now reload.");
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setError(`Error restoring from backup: ${err.message}`);
      setIsRestoring(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardHeader
          title="Data Management"
          subheader="Manage application-wide data sources and tools."
        />
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #eee', borderRadius: 1, mb: 2 }}>
            <Typography>Public Holidays</Typography>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outlined" startIcon={isRefreshing ? <Refresh /> : null}>
              {isRefreshing ? 'Refreshing...' : 'Refresh from GOV.UK'}
            </Button>
          </Box>
           {(message && !error) && (
            <Typography color="success.main" sx={{mt: 2}}>{message}</Typography>
           )}
           {error && (
            <Typography color="error" sx={{mt: 2}}>{error}</Typography>
           )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
            title="Transaction Import Profiles"
            subheader="Manage profiles for importing CSV statements from different banks."
        />
        <CardContent>
            <ImportProfileManager />
        </CardContent>
      </Card>


      <Card>
        <CardHeader
          title="Backup & Restore"
          subheader="Download a full backup of your database or restore from a previous backup file."
        />
        <CardContent>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={handleBackup} disabled={isBackingUp} variant="contained" startIcon={<Download />}>
                    {isBackingUp ? 'Generating...' : 'Download Full Backup'}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleRestore} style={{ display: 'none' }} accept=".db" />
                <Button onClick={triggerFileInput} variant="outlined" disabled={isRestoring} startIcon={<Upload />}>
                    {isRestoring ? 'Restoring...' : 'Restore from Backup'}
                </Button>
            </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ApplicationSettings;