import React, { useState, useRef } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import ImportProfileManager from './ImportProfileManager';
import { Download, Upload, RotateCw } from 'lucide-react';

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage application-wide data sources and tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
            <p className="text-sm font-medium">Public Holidays</p>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              {isRefreshing ? <><RotateCw className="mr-2 h-4 w-4 animate-spin" /> Refreshing...</> : 'Refresh from GOV.UK'}
            </Button>
          </div>
        </CardContent>
        {(message && !error) && (
          <CardFooter>
            <p className="text-sm text-green-600">{message}</p>
          </CardFooter>
        )}
        {error && (
            <CardFooter>
                <p className="text-sm text-red-600">{error}</p>
            </CardFooter>
        )}
      </Card>

      <ImportProfileManager />

      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>Download a full backup of your database or restore from a previous backup file.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <Button onClick={handleBackup} disabled={isBackingUp}>
                {isBackingUp ? 'Generating...' : <> <Download className="mr-2 h-4 w-4" /> Download Full Backup</>}
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleRestore} style={{ display: 'none' }} accept=".db" />
            <Button onClick={triggerFileInput} variant="outline" disabled={isRestoring}>
                {isRestoring ? 'Restoring...' : <><Upload className="mr-2 h-4 w-4" /> Restore from Backup</>}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApplicationSettings;