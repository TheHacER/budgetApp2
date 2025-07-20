import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AppBar, Toolbar, Button, IconButton, Drawer, List, ListItem, ListItemText, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const getLinkStyle = (path) => ({
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    color: 'inherit',
    textDecoration: 'none',
    margin: '0 1rem',
  });

  const navLinks = (
    <>
      <Link to="/dashboard" style={getLinkStyle('/dashboard')}>Dashboard</Link>
      <Link to="/transactions" style={getLinkStyle('/transactions')}>Transactions</Link>
      <Link to="/budgets" style={getLinkStyle('/budgets')}>Budgets</Link>
      <Link to="/savings" style={getLinkStyle('/savings')}>Savings</Link>
      <Link to="/settings" style={getLinkStyle('/settings')}>Settings</Link>
    </>
  );

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        {/* Logo Placeholder */}
        <Box sx={{
          width: 40,
          height: 40,
          backgroundColor: 'primary.main',
          border: '2px solid white',
          borderRadius: '4px',
          mr: 2,
        }} />

        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
          {navLinks}
        </Box>

        {/* Spacer to push logout to the right */}
        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }} />

        <Button color="inherit" onClick={logout}>Logout</Button>

        {/* Mobile Menu Icon */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { md: 'none' }, ml: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={() => setDrawerOpen(false)}
            onKeyDown={() => setDrawerOpen(false)}
          >
            <List>
              {['Dashboard', 'Transactions', 'Budgets', 'Savings', 'Settings'].map((text) => (
                <ListItem button key={text} component={Link} to={`/${text.toLowerCase()}`}>
                  <ListItemText primary={text} />
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;