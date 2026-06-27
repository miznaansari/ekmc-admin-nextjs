import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Card,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import authService from '../../../services/authService';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '@/assets/logo.png';
import { CircularProgress } from '@mui/material';
import instanceV1 from '../../../restaurant/authaxios';
import { startInitialSync } from '../../../indexedDB/startInitialSync';

const Login = () => {
  const [step, setStep] = useState('login');
  const [credentials, setCredentials] = useState({ mobile_number: '', password: '', user_role_id: '1' });
  const [showPassword, setShowPassword] = useState(false);
  const [otpData, setOtpData] = useState({ mobile_number: '', otp: '' });
  const [newPasswordData, setNewPasswordData] = useState({ otp: '', new_password: '', re_enter_new_password: '' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isOtpGenerated, setIsOtpGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/dashboard/insights", { replace: true });
    }
  }, [navigate]);

  // Load remembered credentials from localStorage on mount
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe') !== 'false'; // default to true
    setRememberMe(savedRememberMe);
    if (savedRememberMe) {
      const savedMobile = localStorage.getItem('savedMobileNumber') || '';
      const savedRoleId = localStorage.getItem('savedRoleId') || '1';
      setCredentials(prev => ({
        ...prev,
        mobile_number: savedMobile,
        user_role_id: savedRoleId
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (step === 'login') {
      setCredentials({ ...credentials, [name]: value });
    } else if (step === 'generateOtp' || step === 'verifyOtp') {
      setOtpData({ ...otpData, [name]: value });
    } else if (step === 'resetPassword') {
      setNewPasswordData({ ...newPasswordData, [name]: value });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      console.log('API Response:', response.data?.user_permission);
      localStorage.setItem('user_permission', JSON.stringify(response.data?.user_permission || []));

      if (response.status === 200 && response.data?.token) {
        const { token } = response.data;
        const firstName = response.data.resturantManagerProfile?.first_name;
        const lastName = response.data.resturantManagerProfile?.last_name;
        const email = response.data.resturantManagerProfile?.email;
        const mobile_number = response.data.resturantManagerProfile?.mobile_number;
        const profilePicId = response.data.resturantManagerProfile?.profile_pic_image_id;
        const userRole = response.data.resturantManagerProfile?.user_role_id;
        const api_key = response.data.resturantManagerProfile?.meta;

        // Store token and user details in local storage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('firstName', firstName);
        localStorage.setItem('email', email);
        localStorage.setItem('mobile_number', mobile_number);
        localStorage.setItem('api_key', JSON.stringify(api_key));
        localStorage.setItem('lastName', lastName);
        localStorage.setItem('profile_pic_image_id', profilePicId);

        // Handle Remember Me persistence
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedMobileNumber', credentials.mobile_number);
          localStorage.setItem('savedRoleId', credentials.user_role_id);
        } else {
          localStorage.setItem('rememberMe', 'false');
          localStorage.removeItem('savedMobileNumber');
          localStorage.removeItem('savedRoleId');
        }

        setSnackbarSeverity('success');
        setSnackbarMessage('Login successful!');
        setSnackbarOpen(true);
        startInitialSync();
        navigate('/dashboard/insights');
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage('Login failed: Token not found or invalid response.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Login failed: ' + (error.response?.data?.msg || 'Unknown error'));
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    setLoadingOtp(true);
    try {
      await authService.generateOTP(otpData.mobile_number, credentials.user_role_id);
      setIsOtpGenerated(true);
      setSnackbarSeverity('success');
      setSnackbarMessage('OTP sent successfully!');
      setSnackbarOpen(true);
      setStep('verifyOtp');
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('OTP generation failed: ' + (error.response?.data?.msg || 'Unknown error'));
      setSnackbarOpen(true);
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.verifyOTP(otpData);
      setNewPasswordData(prevState => ({
        ...prevState,
        otp: otpData.otp
      }));
      setSnackbarSeverity('success');
      setSnackbarMessage('OTP verified successfully!');
      setSnackbarOpen(true);
      setStep('resetPassword');
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('OTP verification failed: ' + (error.response?.data?.msg || 'Unknown error'));
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPasswordData.new_password !== newPasswordData.re_enter_new_password) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Passwords do not match.');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(newPasswordData);
      localStorage.removeItem('authToken');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('profile_pic_image_id');
      setCredentials({ mobile_number: '', password: '', user_role_id: '1' });
      setOtpData({ mobile_number: '', otp: '' });
      setNewPasswordData({ otp: '', new_password: '', re_enter_new_password: '' });
      setIsOtpGenerated(false);
      setSnackbarSeverity('success');
      setSnackbarMessage('Password reset successfully! Please login with your new password.');
      setSnackbarOpen(true);
      setTimeout(() => {
        setStep('login');
      }, 2000);
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Password reset failed: ' + (error.response?.data?.msg || 'Unknown error'));
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const goBack = () => {
    if (step === 'generateOtp') {
      setStep('login');
      setOtpData({ mobile_number: '', otp: '' });
      setIsOtpGenerated(false);
    } else if (step === 'verifyOtp') {
      setStep('generateOtp');
      setOtpData({ ...otpData, otp: '' });
      setIsOtpGenerated(false);
    } else if (step === 'resetPassword') {
      setStep('verifyOtp');
      setNewPasswordData({ otp: '', new_password: '', re_enter_new_password: '' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const instance = instanceV1();
      const res = await instance.get("/api/admin/role/v1/public");
      if (res?.data?.status) {
        const mappedRoles = res.data.all_roles.map((role) => ({
          id: String(role.id),
          name: role.role_name,
        }));
        setRoles(mappedRoles);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const handleChangeRole = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: String(value) });
  };

  const renderForm = () => {
    switch (step) {
      case 'login':
        return (
          <form onSubmit={handleLoginSubmit}>
            <TextField
              label="Mobile Number"
              variant="outlined"
              fullWidth
              size="small"
              margin="dense"
              name="mobile_number"
              value={credentials.mobile_number}
              onChange={handleChange}
              required
              InputLabelProps={{ required: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              size="small"
              margin="dense"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              InputLabelProps={{ required: true }}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth size="small" margin="dense" sx={{ mb: 2, textAlign: 'left' }}>
              <InputLabel required>Select Role</InputLabel>
              <Select
                name="user_role_id"
                value={credentials.user_role_id}
                label="Select Role"
                onChange={handleChangeRole}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: 'text.secondary', userSelect: 'none' }}>
                    Remember me
                  </Typography>
                }
              />
              <Link
                onClick={() => setStep('generateOtp')}
                color="primary"
                sx={{ fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot Password?
              </Link>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                py: 1.2,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 74, 0, 0.2)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0, 74, 0, 0.3)',
                }
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </form>
        );
      case 'generateOtp':
        return (
          <form onSubmit={handleGenerateOtp}>
            <IconButton onClick={goBack} sx={{ position: 'absolute', top: 16, left: 16, color: '#004A00' }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <TextField 
                label="Mobile Number"
                variant="outlined" 
                fullWidth 
                margin="dense" 
                name="mobile_number" 
                size='small'
                value={otpData.mobile_number} 
                onChange={handleChange} 
                required 
                InputLabelProps={{ required: true }}
              />
            </Box>
            <FormControl fullWidth size="small" margin="dense" sx={{ mb: 3, textAlign: 'left' }}>
              <InputLabel required>Select Role</InputLabel>
              <Select
                name="user_role_id"
                value={credentials.user_role_id}
                label="Select Role"
                onChange={handleChangeRole}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ py: 1.2, fontSize: '1rem', fontWeight: 600, borderRadius: '8px' }} 
              disabled={loadingOtp}
            >
              {loadingOtp ? <CircularProgress size={24} color="inherit" /> : "Send OTP"}
            </Button>
          </form>
        );
      case 'verifyOtp':
        return (
          <form onSubmit={handleVerifyOtp}>
            <IconButton onClick={goBack} sx={{ position: 'absolute', top: 16, left: 16, color: '#004A00' }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <TextField 
                variant="outlined" 
                fullWidth 
                label="Mobile Number"
                size='small'
                margin="dense" 
                name="mobile_number" 
                value={otpData.mobile_number} 
                onChange={handleChange} 
                required 
                disabled={isOtpGenerated} 
              />
            </Box>
            {isOtpGenerated && (
              <Box sx={{ textAlign: 'left', mb: 3 }}>
                <TextField 
                  variant="outlined" 
                  fullWidth 
                  size='small'
                  label="OTP"
                  margin="dense" 
                  name="otp" 
                  value={otpData.otp} 
                  onChange={handleChange} 
                  required 
                />
              </Box>
            )}
            {!isOtpGenerated ? (
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth 
                sx={{ py: 1.2, fontSize: '1rem', fontWeight: 600, borderRadius: '8px' }} 
                onClick={handleGenerateOtp}
                disabled={loadingOtp}
              >
                {loadingOtp ? <CircularProgress size={24} color="inherit" /> : "Generate OTP"}
              </Button>
            ) : (
              <Box>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ py: 1.2, fontSize: '1rem', fontWeight: 600, borderRadius: '8px', mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
                </Button>
                <Link 
                  onClick={handleGenerateOtp} 
                  color="primary" 
                  sx={{ fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
                >
                  Resend OTP
                </Link>
              </Box>
            )}
          </form>
        );
      case 'resetPassword':
        return (
          <form onSubmit={handleResetPasswordSubmit}>
            <IconButton onClick={goBack} sx={{ position: 'absolute', top: 16, left: 16, color: '#004A00' }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <TextField
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                size="small"
                margin="dense"
                name="new_password"
                value={newPasswordData.new_password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <TextField
                label="Re-enter New Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                size="small"
                margin="dense"
                name="re_enter_new_password"
                value={newPasswordData.re_enter_new_password}
                onChange={handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ py: 1.2, fontSize: '1rem', fontWeight: 600, borderRadius: '8px' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
            </Button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100vw',
      backgroundColor: '#F7FAF7',
      margin: -2, // Offset default theme base overrides if any
      overflow: 'hidden'
    }}>
      {/* Left Branding Panel (visible on md+) */}
      <Box sx={{ 
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '45%',
        background: 'linear-gradient(135deg, #002400 0%, #004A00 50%, #1a5e20 100%)',
        position: 'relative',
        padding: 4,
        color: '#FFFFFF',
        overflow: 'hidden'
      }}>
        {/* Ambient glow backgrounds */}
        <Box sx={{
          position: 'absolute',
          top: '-20%',
          right: '-20%',
          width: '60%',
          height: '60%',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }} />
        <Box sx={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '50%',
          height: '50%',
          background: 'rgba(255, 111, 0, 0.1)',
          borderRadius: '50%',
          filter: 'blur(100px)',
        }} />

        <Box sx={{ zIndex: 2, textAlign: 'center', maxWidth: '400px' }}>
          <img src={Logo.src || Logo} alt="Logo" style={{ width: '90px', height: 'auto', marginBottom: '24px', filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.3))' }} />
          <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '2px', mb: 1, textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            EKMC
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 300, letterSpacing: '4px', color: '#B2DFDB', mb: 4 }}>
            PLATFORM
          </Typography>
          <Box sx={{ width: '60px', height: '4px', backgroundColor: '#FF6F00', margin: '0 auto 24px auto', borderRadius: '2px' }} />
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6, fontWeight: 300 }}>
            Simplify operations, manage eateries, customize menus, and gain deep business insights in one unified dashboard.
          </Typography>
        </Box>
        <Box sx={{ position: 'absolute', bottom: 20, color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} EKMC Platform. All rights reserved.
        </Box>
      </Box>

      {/* Right Login Form Panel */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        padding: { xs: 3, md: 6 },
        position: 'relative'
      }}>
        {/* Decorative elements for mobile view */}
        <Box sx={{ 
          display: { xs: 'flex', md: 'none' }, 
          alignItems: 'center', 
          justifyContent: 'center', 
          mb: 4 
        }}>
          <img src={Logo.src || Logo} alt="Logo" style={{ maxWidth: '45px', marginRight: '15px' }} />
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#004A00' }}>EKMC</Typography>
            <Typography variant="subtitle1" component="p" sx={{ color: '#004A00', letterSpacing: '2px', fontSize: '0.8rem' }}>PLATFORM</Typography>
          </Box>
        </Box>

        <Paper sx={{ 
          position: 'relative',   
          width: '100%', 
          maxWidth: '420px', 
          padding: { xs: '32px 24px', sm: '40px 32px' }, 
          borderRadius: '16px', 
          backgroundColor: '#ffffff', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 74, 0, 0.08)',
          textAlign: 'center',
        }}>
          <Typography variant="h4" component="h2" sx={{ 
            fontWeight: 800, 
            color: '#004A00', 
            mb: 1,
            fontSize: { xs: '1.75rem', sm: '2rem' } 
          }}>
            {step === 'login' ? 'Welcome Back' : 
             step === 'generateOtp' ? 'Generate OTP' : 
             step === 'verifyOtp' ? 'Verify OTP' : 
             'Reset Password'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            {step === 'login' ? 'Please log in to your account' : 
             step === 'generateOtp' ? 'Enter your mobile number to get an OTP' : 
             step === 'verifyOtp' ? 'Verify the code sent to your device' : 
             'Enter a secure new password'}
          </Typography>

          {renderForm()}
        </Paper>
      </Box>
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

export default Login;


