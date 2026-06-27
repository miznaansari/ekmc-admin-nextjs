import { Close } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, IconButton, Paper, Snackbar, Stack, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import axios from "axios";
import { useState } from "react";

export default function ResetPassword({employeeId, onClose, onSuccess}){
    const theme = useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [newPassword, setNewPassword] = useState("");
    const [reEnterNewPassword, setReEnterNewPassword] = useState("");
    const token = localStorage.getItem("authToken");
    const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
    const [updating, setUpdating] = useState(false);

    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });

    const validatePasswords = () => {
        if (!newPassword || !reEnterNewPassword) {
            setAlert({open: true, severity: "error", message: "Please fill in both password fields"});
            return false;
        }
        
        if (newPassword !== reEnterNewPassword) {
            setAlert({open: true, severity: "error", message: "Passwords do not match"});
            return false;
        }
        
        if (newPassword.length < 6) {
            setAlert({open: true, severity: "error", message: "Password must be at least 6 characters long"});
            return false;
        }
        
        return true;
    };

    const handleUpdatePassword = async () => {
        if (!validatePasswords()) {
            return;
        }

        const payload = {
            new_password: newPassword,
            re_enter_new_password: reEnterNewPassword
        }
        
        try {
            setUpdating(true);
            const response = await axios.put(`${baseUrl}/api/v1/reset-password/${employeeId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("update password response- ", response);

            if (response.status === 200 || response.status === 201) {
                setAlert({open: true, severity: "success", message: "Password Updated Successfully!"});
                
                setNewPassword("");
                setReEnterNewPassword("");
                
                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess();
                    }, 2000); 
                }
            }

        } catch (e) {
            console.log("error during update the password- ", e);
            const errorMessage = e.response?.data?.message || "Password Update Failed!";
            setAlert({open: true, severity: "error", message: `Error: ${errorMessage}`});
        } finally {
            setUpdating(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleUpdatePassword();
    };
    
    return (
        <Box sx={{ height: isMobileScreen ? '95vh' : '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                position: 'sticky',
                top: 0,
                zIndex: 999,
                bgcolor: "#F7F7F7",
                p: 1,
                flexShrink: 0
            }}>
                <Paper sx={{ padding: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5">Reset Password</Typography>
                        <IconButton onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Stack>
                </Paper>
            </Box>
            
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    p: 1
                }}
            >
                <Paper sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    p: 2
                }}>
                    <TextField
                        label="New Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        size="small"
                        margin="dense"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={updating}
                    />
                    <TextField
                        label="Re Enter Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        size="small"
                        margin="dense"
                        required
                        value={reEnterNewPassword}
                        onChange={(e) => setReEnterNewPassword(e.target.value)}
                        disabled={updating}
                        error={reEnterNewPassword && newPassword !== reEnterNewPassword}
                        helperText={
                            reEnterNewPassword && newPassword !== reEnterNewPassword 
                                ? "Passwords do not match" 
                                : ""
                        }
                    />
                </Paper>
                
                <Box sx={{
                    flexShrink: 0,
                    p: 2,
                    borderTop: '1px solid #e0e0e0'
                }}>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            color='error'
                            sx={{ flex: 1 }}
                            onClick={onClose}
                            disabled={updating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            sx={{ flex: 1 }}
                            variant="contained"
                            disabled={updating || !newPassword || !reEnterNewPassword}
                        >
                            {updating ? <CircularProgress size={24} thickness={4} /> : 'Save'}
                        </Button>
                    </Stack>
                </Box>
            </Box>
            
            <Snackbar
                open={alert.open}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                autoHideDuration={3000}
                onClose={() => setAlert({ ...alert, open: false })}
            >
                <Alert severity={alert.severity} sx={{ width: "100%" }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}