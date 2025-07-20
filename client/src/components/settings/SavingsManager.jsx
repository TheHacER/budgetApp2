import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Box,
    Typography,
} from '@mui/material';
import { AddCircle, Delete, Edit } from '@mui/icons-material';
import SavingsGoalModal from './SavingsGoalModal';

function SavingsManager() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
    const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [editingGoal, setEditingGoal] = useState(null);

    const fetchAccounts = () => {
        api.getAllSavingsAccounts()
            .then(setAccounts)
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const accountData = Object.fromEntries(formData.entries());
        try {
            if (editingAccount) {
                await api.updateSavingsAccount(editingAccount.id, accountData);
            } else {
                await api.createSavingsAccount(accountData);
            }
            fetchAccounts();
            setIsAccountDialogOpen(false);
            setEditingAccount(null);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDeleteAccount = async (accountId) => {
        if (window.confirm('Are you sure you want to delete this account and all its goals? This action cannot be undone.')) {
            try {
                await api.deleteSavingsAccount(accountId);
                fetchAccounts();
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    if (loading) return <p>Loading savings accounts...</p>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddCircle />}
                    onClick={() => {
                        setEditingAccount(null);
                        setIsAccountDialogOpen(true);
                    }}
                >
                    Add Savings Account
                </Button>
            </Box>

            {accounts.map(account => (
                <Accordion key={account.id}>
                    <AccordionSummary expandIcon={<Edit />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>{account.name} ({account.institution})</Typography>
                            <Typography>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(account.current_balance)}</Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
                                <Button variant="outlined" startIcon={<Edit />} onClick={() => {
                                    setEditingAccount(account);
                                    setIsAccountDialogOpen(true);
                                }}>Edit Account</Button>
                                <Button variant="contained" color="error" startIcon={<Delete />} onClick={() => handleDeleteAccount(account.id)}>Delete Account</Button>
                            </Box>
                            <Typography variant="body2" align="center">
                                Savings goals are now managed on the main 'Savings' page.
                            </Typography>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            ))}

            <Dialog open={isAccountDialogOpen} onClose={() => setIsAccountDialogOpen(false)}>
                <DialogTitle>{editingAccount ? 'Edit' : 'Add'} Savings Account</DialogTitle>
                <form onSubmit={handleSaveAccount}>
                    <DialogContent>
                        <TextField name="name" label="Account Name" defaultValue={editingAccount?.name} required fullWidth margin="normal" />
                        <TextField name="institution" label="Institution" defaultValue={editingAccount?.institution} fullWidth margin="normal" />
                        <TextField name="account_number" label="Account Number" defaultValue={editingAccount?.account_number} fullWidth margin="normal" />
                        <TextField name="current_balance" label="Starting Balance" type="number" inputProps={{ step: "0.01" }} defaultValue={editingAccount?.current_balance || '0.00'} required fullWidth margin="normal" />
                    </DialogContent>
                    <DialogActions sx={{ p: '0 24px 24px' }}>
                        <Button onClick={() => setIsAccountDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Account</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {isGoalDialogOpen && (
                <SavingsGoalModal
                    isOpen={isGoalDialogOpen}
                    goal={editingGoal}
                    accounts={accounts}
                    onClose={() => { setEditingGoal(null); setIsGoalDialogOpen(false); }}
                    onSave={() => {
                        setIsGoalDialogOpen(false);
                        setEditingGoal(null);
                        fetchAccounts();
                    }}
                />
            )}
        </Box>
    );
}

export default SavingsManager;