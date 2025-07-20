import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SavingsIcon from '@mui/icons-material/Savings';
import SettingsIcon from '@mui/icons-material/Settings';

const drawerWidth = 240;
const collapsedWidth = 60;

const navItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Transactions', path: '/transactions', icon: <SwapHorizIcon /> },
    { text: 'Budgets', path: '/budgets', icon: <AssessmentIcon /> },
    { text: 'Savings', path: '/savings', icon: <SavingsIcon /> },
    { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
];

const Sidebar = ({ isOpen }) => {
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: isOpen ? drawerWidth : collapsedWidth,
                flexShrink: 0,
                transition: 'width 0.2s',
                '& .MuiDrawer-paper': {
                    width: isOpen ? drawerWidth : collapsedWidth,
                    boxSizing: 'border-box',
                    transition: 'width 0.2s',
                    overflowX: 'hidden',
                },
            }}
        >
            <List>
                {navItems.map((item) => (
                    <Tooltip title={isOpen ? '' : item.text} placement="right" key={item.text}>
                        <ListItem disablePadding component={Link} to={item.path}>
                            <ListItemButton selected={location.pathname === item.path}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                {isOpen && <ListItemText primary={item.text} />}
                            </ListItemButton>
                        </ListItem>
                    </Tooltip>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;