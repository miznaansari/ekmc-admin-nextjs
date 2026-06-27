import React from 'react'
import { Box } from '@mui/material'; 

import FindEateries from '../../components/FindEateries/FindEateries';
function FindEateriespage() {
  return (
    <Box>
      <Box  sx={{ display: 'flex', minHeight: '100vh', }}>
      <Box sx={{ flexGrow: 1,m:1 }}>
       
        <FindEateries/> </Box>
    </Box>
    </Box>
  )
}

export default FindEateriespage
