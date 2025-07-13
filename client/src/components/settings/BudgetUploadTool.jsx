import React, { useState, useRef } from 'react';
import * as api from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Download, Upload } from 'lucide-react';

function BudgetUploadTool() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDownload = async () => {
    try {
      const csvData = await api.getBudgetTemplate();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const year = new Date().getFullYear();
      link.setAttribute('download', `budget_template_${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(`Error downloading template: ${err.message}`);
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }
    setIsLoading(true);
    setMessage('');
    setError('');
    try {
      const response = await api.uploadBudget(file);
      setMessage(response.message);
    } catch (err) {
      setError(`Error uploading budget: ${err.message}`);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Upload Tool</CardTitle>
        <CardDescription>
          Download a CSV template of your categories, fill it out, and upload it to set your budgets for the year.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <p className="font-medium">1. Download Template</p>
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex-grow">
            <p className="font-medium">2. Upload Completed File</p>
            <Input type="file" ref={fileInputRef} accept=".csv" className="mt-2" />
          </div>
          <Button onClick={handleUpload} disabled={isLoading} className="ml-4">
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </CardContent>
      {(message || error) && (
        <CardFooter>
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </CardFooter>
      )}
    </Card>
  );
}
export default BudgetUploadTool;
