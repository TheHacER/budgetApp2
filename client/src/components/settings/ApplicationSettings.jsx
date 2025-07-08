import React, { useState } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';

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
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Manage application-wide data sources.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Public Holidays</p>
          <Button onClick={handleRefresh} disabled={isLoading}>
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
  );
}

export default ApplicationSettings;
