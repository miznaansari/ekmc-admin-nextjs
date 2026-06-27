import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Card, useTheme } from '@mui/material';
// import authService from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
// import Logo from '../../assets/logo.png'; 

const GenerateOTP = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.generateOTP(mobileNumber);
      console.log('OTP generated:', response.data);

      // Redirect to the Reset Password page without passing the OTP
      navigate('/reset-password');
    } catch (error) {
      console.error('OTP generation failed:', error.response.data);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '90vw',
        padding: '16px',
        animation: 'zoomIn 1s ease', 
        '@keyframes zoomIn': {
          '0%': {
            transform: 'scale(0.9)',
            opacity: 0,
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 1,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        {/* <img src={Logo} alt="Logo" style={{ maxWidth: '80px', marginRight: '15px' }} /> */}
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
          >
            EKMC
          </Typography>
          <Typography
            variant="subtitle1"
            component="p"
            sx={{ color: theme.palette.primary.main }}
          >
            PLATFORM
          </Typography>
        </Box>
      </Box>
      <Card
        sx={{
          width: '100%',
          maxWidth: '500px',
          padding: '24px',
          borderRadius: '12px',
          backgroundColor: '#fff',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          animation: 'zoomIn 1s ease', 
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              fontSize: { xs: '1.5rem', sm: '2rem' }, 
            }}>
          Generate OTP
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Enter your mobile number to receive an OTP.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ textAlign: 'left', mb: 1 }}>
            <Typography variant="body1">
              Mobile Number <Typography component="span" color="error">*</Typography>
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              margin="dense"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
              sx={{ borderRadius: '8px' }}
            />
          </Box>
          <Box sx={{ display: 'block', alignItems: 'center', mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2, textTransform: 'capitalize', fontSize: '1rem', borderRadius: '8px' }}
            >
              Generate OTP
            </Button>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default GenerateOTP;
