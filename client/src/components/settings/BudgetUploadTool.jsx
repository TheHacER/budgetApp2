import React, { useState, useRef } from 'react';
import * as api from '../../services/api';
import { Button, Card, CardHeader, CardContent, CardActions, Typography, Box } from '@mui/material';
import { Download, Upload } from '@mui/icons-material';

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
      <CardHeader
        title="Budget Upload Tool"
        subheader="Download a CSV template, fill it out, and upload it to set your budgets for the year."
      />
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #eee', borderRadius: 1, mb: 2 }}>
          <Typography>1. Download Template</Typography>
          <Button onClick={handleDownload} variant="outlined" startIcon={<Download />}>
            Download
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #eee', borderRadius: 1 }}>
          <Box>
            <Typography>2. Upload Completed File</Typography>
            <input type="file" ref={fileInputRef} accept=".csv" style={{ marginTop: '1rem' }} />
          </Box>
          <Button onClick={handleUpload} disabled={isLoading} variant="contained" startIcon={<Upload />}>
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </Box>
      </CardContent>
      {(message || error) && (
        <CardActions sx={{px: 2, pb: 2}}>
          {message && <Typography color="success.main">{message}</Typography>}
          {error && <Typography color="error">{error}</Typography>}
        </CardActions>
      )}
    </Card>
  );
}
export default BudgetUploadTool;