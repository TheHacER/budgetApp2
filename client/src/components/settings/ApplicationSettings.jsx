import React, { useState } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import ImportProfileManager from './ImportProfileManager';

function ApplicationSettings() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    setMessage('');
    try {
      const response = await api.refreshHolidays();
      setMessage(response.message);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage application-wide data sources and tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Public Holidays</p>
            <Button onClick={handleRefresh} disabled={isLoading} variant="outline">
              {isLoading ? 'Refreshing...' : 'Refresh from GOV.UK'}
            </Button>
          </div>
        </CardContent>
        {message && (
          <CardFooter>
            <p className="text-sm text-muted-foreground">{message}</p>
          </CardFooter>
        )}
      </Card>

      <ImportProfileManager />

      <Card className="border-blue-500">
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>Download a full backup of your database or restore from a file.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This functionality will be implemented as the final step.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApplicationSettings;