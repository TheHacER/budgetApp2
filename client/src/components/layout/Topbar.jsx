import React from 'react';
import { useAuth } from 'contexts/AuthContext';
import { AppBar, Toolbar, IconButton, Button, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import EomStatusButton from 'components/EomStatusButton';

const Topbar = ({ onMenuClick }) => {
    const { logout } = useAuth();

    return (
        <AppBar position="fixed" color="default" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={onMenuClick}
                    edge="start"
                >
                    <MenuIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <EomStatusButton />
                <Button color="inherit" onClick={logout} sx={{ ml: 2 }}>Logout</Button>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;