import React from 'react';
import { Box } from '@mui/material';
import LiveOrder from '../../../components/Orders/LiveOrder/LiveOrder';

function LiveOrderPage() {
  return (
    
       <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <Box sx={{ flexGrow: 1,m:1 }}>
    <LiveOrder/></Box>
    
  </Box>
    
  )
}

export default LiveOrderPage


