import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar isOpen={isSidebarOpen} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${isSidebarOpen ? 240 : 60}px)` } }}>
        <Topbar onMenuClick={() => setSidebarOpen(!isSidebarOpen)} />
        <Box sx={{ mt: 8 }}> {/* This mt provides space for the fixed Topbar */}
            <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;