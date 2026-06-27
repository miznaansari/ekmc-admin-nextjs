import React from 'react';
import { Box, Typography } from '@mui/material';
import Dashboard from '../../components/Dashboard/Dashboard';

const AdminDashboard = () => {
  return (
    <Box  sx={{ display: 'flex', minHeight: '100%', minwidth:'90%' }}>
      <Box sx={{ flexGrow: 1,m:1 }}>
      
      <Dashboard/></Box>
      
    </Box>
  );
};

export default AdminDashboard;
