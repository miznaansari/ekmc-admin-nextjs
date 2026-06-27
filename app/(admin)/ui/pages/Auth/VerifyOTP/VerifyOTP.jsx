import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Card, useTheme } from '@mui/material';
import authService from '../../../services/authService';
import { useNavigate } from '@/ui/utils/nextRouting';
// import Logo from '../../assets/logo.png'; 

const VerifyOTP = () => {
  const [data, setData] = useState({ mobile_number: '', otp: '' });
  const [isOtpGenerated, setIsOtpGenerated] = useState(false); 
  const theme = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleGenerateOtp = async () => {
    try {
      const response = await authService.generateOTP(data.mobile_number);
      console.log('OTP generated:', response.data);
      setIsOtpGenerated(true); 
    } catch (error) {
      console.error('OTP generation failed:', error.response?.data);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.verifyOTP(data);
      console.log('OTP verified:', response.data);
      navigate('/dashboard', { state: { otp: data.otp } });
    } catch (error) {
      console.error('OTP verification failed:', error.response?.data);
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
        width: '100vw',
        padding: { xs: '8px', sm: '16px' }, 
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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: { xs: 2, sm: 4 }, 
        }}
      >
        {/* <img src={Logo} alt="Logo" style={{ maxWidth: '80px', marginRight: '15px' }} /> */}
        <Box>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              fontSize: { xs: '1.5rem', sm: '2rem' }, 
            }}
          >
            EKMC
          </Typography>
          <Typography
            variant="subtitle1"
            component="p"
            sx={{
              color: theme.palette.primary.main,
              fontSize: { xs: '1rem', sm: '1.25rem' }, 
            }}
          >
            PLATFORM
          </Typography>
        </Box>
      </Box>
      <Card
        sx={{
          width: '100%',
          maxWidth: { xs: '340px', sm: '500px' }, 
          padding: { xs: '16px', sm: '24px' }, 
          borderRadius: '12px',
          backgroundColor: '#fff',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            fontSize: { xs: '1.5rem', sm: '2rem' }, 
          }}
        >
          Admin Login
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          gutterBottom
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' }, 
          }}
        >
          Please enter your mobile number to receive an OTP.
        </Typography>
        <form onSubmit={handleVerifyOtp}>
          <Box sx={{ textAlign: 'left', mb: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Mobile Number <Typography component="span" color="error">*</Typography>
            </Typography>
            <TextField
              variant="outlined"
              fullWidth
              margin="dense"
              name="mobile_number"
              value={data.mobile_number}
              onChange={handleChange}
              required
              sx={{ borderRadius: '8px' }}
              disabled={isOtpGenerated} 
            />
          </Box>
          {!isOtpGenerated && (
            <Box sx={{ display: 'block', alignItems: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 2, textTransform: 'capitalize', fontSize: { xs: '0.875rem', sm: '1rem' }, borderRadius: '8px' }}
                onClick={handleGenerateOtp}
              >
                Generate OTP
              </Button>
            </Box>
          )}
          {isOtpGenerated && (
            <>
            
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  OTP <Typography component="span" color="error">*</Typography>
                </Typography>
                <TextField
                  variant="outlined"
                  fullWidth
                  margin="dense"
                  name="otp"
                  value={data.otp}
                  onChange={handleChange}
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
                  sx={{ mb: 2, textTransform: 'capitalize', fontSize: { xs: '0.875rem', sm: '1rem' }, borderRadius: '8px' }}
                >
                  
                  Login
                </Button>
              </Box>
            </>
          )}
        </form>
      </Card>
    </Box>
  );
};

export default VerifyOTP;
