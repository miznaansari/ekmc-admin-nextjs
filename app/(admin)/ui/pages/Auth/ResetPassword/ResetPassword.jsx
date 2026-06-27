import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, Card, Snackbar, Alert, useTheme } from '@mui/material';
// import authService from '../../services/authService';
import { useNavigate, useLocation } from '@/ui/utils/nextRouting';
// import Logo from '../assets/logo.png'; 

const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [data, setData] = useState({ otp: '', new_password: '', re_enter_new_password: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (location.state?.otp) {
      setData((prevState) => ({ ...prevState, otp: location.state.otp }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.new_password !== data.re_enter_new_password) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Passwords do not match.');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await authService.resetPassword(data);
      console.log('Password reset successful:', response.data);
      setSnackbarSeverity('success');
      setSnackbarMessage('Password changed successfully!');
      setSnackbarOpen(true);

     
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Password reset failed: ' + (error.response?.data?.msg || 'Unknown error'));
      setSnackbarOpen(true);
      console.error('Password reset failed:', error.response.data);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
        <Typography variant="h4" component="h2" gutterBottom  sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          Reset Password
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Enter the OTP sent to your mobile and set a new password.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ textAlign: 'left', mb: 1 }}>
            <Typography variant="body1">
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
          <Box sx={{ textAlign: 'left', mb: 1 }}>
            <Typography variant="body1">
              New Password <Typography component="span" color="error">*</Typography>
            </Typography>
            <TextField
              type="password"
              variant="outlined"
              fullWidth
              margin="dense"
              name="new_password"
              value={data.new_password}
              onChange={handleChange}
              required
              sx={{ borderRadius: '8px' }}
            />
          </Box>
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant="body1">
              Re-enter New Password <Typography component="span" color="error">*</Typography>
            </Typography>
            <TextField
              type="password"
              variant="outlined"
              fullWidth
              margin="dense"
              name="re_enter_new_password"
              value={data.re_enter_new_password}
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
              sx={{ mb: 2, textTransform: 'capitalize', fontSize: '1rem', borderRadius: '8px' }}
            >
              Reset Password
            </Button>
          </Box>
        </form>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResetPassword;
