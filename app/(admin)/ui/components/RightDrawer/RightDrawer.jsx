// components/RightDrawer.jsx
import React from 'react';
import { Drawer, IconButton, Typography, Divider, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const RightDrawer = ({ open, onClose, title, children }) => (
  <Drawer
disableEnforceFocus    anchor="right"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: { xs: '90vw', sm: '50vw', md: '30vw' },
        height: '100vh',
        top: 0,
        right: 0,
        bottom: 0,
        position: 'fixed',
        m: 0,             // Removes margin
        p: 2,             // Optional: set to 0 to remove inner spacing
        borderRadius: 0,  // Remove any border radius
        boxSizing: 'border-box',
      },
    }}
    ModalProps={{
      BackdropProps: {
        sx: {
          top: 0,
          right: 0,
          bottom: 0,
        },
      },
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="h6">{title}</Typography>
      <IconButton onClick={onClose}>
        <CloseIcon />
      </IconButton>
    </Box>
    <Divider />
    <Box sx={{ mt: 2 }}>
      {children}
    </Box>
  </Drawer>
);

export default RightDrawer;
