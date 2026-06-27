import { Box } from '@mui/material';

import OrderHistory from '../../../components/Orders/OrderHistory/OrderHistory';

function Orderhistorypage() {
  return (
    
      <div>
       <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    
    <Box sx={{ flexGrow: 1,m:1 }}>
    
    <OrderHistory/>
    </Box>
    
  </Box>
    </div>
    
  )
}

export default Orderhistorypage; 


 