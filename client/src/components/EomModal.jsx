import React, { useState } from 'react';
import * as api from '../services/api';
import {
    Dialog, DialogContent, DialogTitle, DialogActions, Button, Box, Typography,
    List, ListItem, ListItemText, ListItemIcon, CircularProgress, Alert
} from '@mui/material';
import { CheckCircleOutline, ErrorOutline, HourglassEmpty, PlayCircleFilled } from '@mui/icons-material';

const EomModal = ({ open, onClose, financialMonth, onProcessComplete }) => {
    const [processing, setProcessing] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    const handleRunProcess = async () => {
        if (!financialMonth) return;

        setProcessing(true);
        setError('');
        setResults(null);

        try {
            const response = await api.runEomProcess(financialMonth.id);
            setResults(response.data.results);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'An unexpected error occurred.';
            const errorResults = err.response?.data?.results || [];
            setError(errorMsg);
            setResults(errorResults);
        } finally {
            setProcessing(false);
            if (onProcessComplete) {
                onProcessComplete();
            }
        }
    };

    const getStepStatusIcon = (step) => {
        if (step.success) {
            return <CheckCircleOutline color="success" />;
        }
        return <ErrorOutline color="error" />;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>End of Month Process</DialogTitle>
            <DialogContent>
                {financialMonth ? (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Running for: {financialMonth.month_name} {financialMonth.year}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            This will perform all end-of-month calculations in a single, secure process. This action cannot be undone.
                        </Typography>

                        {processing && (
                            <Box sx={{ textAlign: 'center', my: 3 }}>
                                <CircularProgress />
                                <Typography>Processing, please wait...</Typography>
                            </Box>
                        )}

                        {results && (
                            <List dense>
                                {results.map((result, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>{getStepStatusIcon(result)}</ListItemIcon>
                                        <ListItemText
                                            primary={result.name}
                                            secondary={result.error || (result.data && result.data.message)}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    </Box>
                ) : (
                    <Typography>No financial month selected.</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Cancel</Button>
                <Button
                    onClick={handleRunProcess}
                    variant="contained"
                    startIcon={<PlayCircleFilled />}
                    disabled={processing || !financialMonth}
                >
                    {processing ? 'Processing...' : 'Run End of Month'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EomModal;