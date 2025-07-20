import React from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import CategoryManager from '../components/settings/CategoryManager';
import VendorManager from '../components/settings/VendorManager';
import RecurringBillsManager from '../components/settings/RecurringBillsManager';
import ApplicationSettings from '../components/settings/ApplicationSettings';
import SavingsManager from '../components/settings/SavingsManager';
import PlannedIncomeManager from '../components/settings/PlannedIncomeManager';
import BudgetUploadTool from '../components/settings/BudgetUploadTool';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function SettingsPage() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Settings</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="settings tabs" variant="scrollable" scrollButtons="auto">
                <Tab label="Categories" id="settings-tab-0" />
                <Tab label="Vendors" id="settings-tab-1" />
                <Tab label="Recurring Bills" id="settings-tab-2" />
                <Tab label="Planned Income" id="settings-tab-3" />
                <Tab label="Savings Accounts" id="settings-tab-4" />
                <Tab label="Budget Tools" id="settings-tab-5" />
                <Tab label="Application" id="settings-tab-6" />
            </Tabs>
        </Box>
        <TabPanel value={value} index={0}><CategoryManager /></TabPanel>
        <TabPanel value={value} index={1}><VendorManager /></TabPanel>
        <TabPanel value={value} index={2}><RecurringBillsManager /></TabPanel>
        <TabPanel value={value} index={3}><PlannedIncomeManager /></TabPanel>
        <TabPanel value={value} index={4}><SavingsManager /></TabPanel>
        <TabPanel value={value} index={5}><BudgetUploadTool /></TabPanel>
        <TabPanel value={value} index={6}><ApplicationSettings /></TabPanel>
    </Box>
  );
}

export default SettingsPage;