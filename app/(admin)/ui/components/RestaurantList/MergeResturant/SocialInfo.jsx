import { Alert, Box, Button, Grid, IconButton, InputAdornment, Paper, Snackbar, TextField, Tooltip, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const SocialInfo = ({cafeId, transferTargetCafeId = null, onSave = null}) => {
    const { control, handleSubmit, reset, getValues, watch } = useForm({
        defaultValues: {
            social_facebook_url: "",
            social_instagram_url: "",
            social_linkedin_url: "",
            social_twitter_url: "",
            website_url: "",
            zomato_url: "",
            swiggy_url: "",
            google_map_url: "",
            dineout_url: ""
        }
    });
    
    console.log("cafe id in ", cafeId);
    const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
    const token = localStorage.getItem('authToken');
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });
    const [initialFormValues, setInitialFormValues] = useState(null);
    const [isFormModified, setIsFormModified] = useState(false);
    const [copyingField, setCopyingField] = useState(null);
    
    // Watch all form fields for changes
    const formValues = watch();

    // Check if form data is modified compared to initial data
    const checkIfDataModified = useCallback(() => {
        if (!initialFormValues) return false;
        
        const currentValues = getValues();
        
        // Compare each field
        return Object.keys(currentValues).some(key => 
            currentValues[key] !== initialFormValues[key]
        );
    }, [getValues, initialFormValues]);

    // Update the modified status whenever form values change
    useEffect(() => {
        setIsFormModified(checkIfDataModified());
    }, [formValues, checkIfDataModified]);

    const showAlert = (severity, message) => {
        setAlert({ open: true, severity, message });
        setTimeout(() => {
            setAlert({ ...alert, open: false });
        }, 3000);
    };

    // Fetch social infos
    const fetchSocialInfo = async() => {
        try {
            const response = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${cafeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("response in social info- ", response.data?.data);
            const [data] = response.data?.data;
            
            // Prepare normalized data
            const formData = {
                social_facebook_url: data.social_facebook_url || "",
                social_instagram_url: data.social_instagram_url || "",
                social_linkedin_url: data.social_linkedin_url || "",
                social_twitter_url: data.social_twitter_url || "",
                website_url: data.website_url || "",
                zomato_url: data.zomato_url || "",
                swiggy_url: data.swiggy_url || "",
                google_map_url: data.google_map_url || "",
                dineout_url: data.dineout_url || ""
            };
            
            // Reset form with data
            reset(formData);
            
            // Store initial values for comparison
            setInitialFormValues({...formData});
            
            // Reset modification status
            setIsFormModified(false);
            
            console.log("data in social info= ", data);
        } catch(e) {
            console.log("error during fetching social info - ", e);
        }
    };
    
    useEffect(() => {
        if (cafeId) {
            fetchSocialInfo();
        }
    }, [cafeId]);

    useEffect(() => {
        const handleSocialInfoRefresh = (event) => {
            const affectedCafeIds = event.detail?.cafeIds || [];

            if (affectedCafeIds.includes(cafeId)) {
                fetchSocialInfo();
            }
        };

        window.addEventListener("cafe-social-updated", handleSocialInfoRefresh);
        return () => window.removeEventListener("cafe-social-updated", handleSocialInfoRefresh);
    }, [cafeId]);

    // Edit social infos
    const handleSubmitSocialInfo = async(data) => {
        try {
            const response = await axios.post(
                `${baseUrl}/api/user/admin/restaurant-edit-socialinfo/${cafeId}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log("response after submit - ", response);
            if (response.status === 200) {
                setAlert({
                    open: true, 
                    message: "Social info updated successfully", 
                    severity: "success"
                });
                window.dispatchEvent(
                    new CustomEvent("cafe-social-updated", {
                        detail: { cafeIds: [cafeId, transferTargetCafeId].filter(Boolean) },
                    })
                );
                onSave?.();
                
                // Reset modification status
                setIsFormModified(false);
            }
        } catch(e) {
            console.log("error during submitting social info- ", e);
            const message= e.response?.data?.msg
            setAlert({
                open: true,
                severity: "error",
                message:message || "Error updating social info"
            });
        }
    };

    const handleCopyFieldToTarget = async (fieldName, fieldLabel) => {
        if (!transferTargetCafeId) {
            showAlert("info", "No target cafe selected");
            return;
        }

        try {
            setCopyingField(fieldName);

            const sourceValues = getValues();

            const targetResponse = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${transferTargetCafeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const [targetData] = targetResponse.data?.data || [{}];
            const payload = {
                social_facebook_url: targetData.social_facebook_url || "",
                social_instagram_url: targetData.social_instagram_url || "",
                social_linkedin_url: targetData.social_linkedin_url || "",
                social_twitter_url: targetData.social_twitter_url || "",
                website_url: targetData.website_url || "",
                zomato_url: targetData.zomato_url || "",
                swiggy_url: targetData.swiggy_url || "",
                google_map_url: targetData.google_map_url || "",
                dineout_url: targetData.dineout_url || ""
            };

            payload[fieldName] = sourceValues[fieldName] || "";

            await axios.post(
                `${baseUrl}/api/user/admin/restaurant-edit-socialinfo/${transferTargetCafeId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            window.dispatchEvent(
                new CustomEvent("cafe-social-updated", {
                    detail: { cafeIds: [cafeId, transferTargetCafeId] },
                })
            );

            showAlert("success", `${fieldLabel} copied to cafe ${transferTargetCafeId}`);
        } catch (e) {
            console.log("error during field copy social info- ", e);
            showAlert("error", `Failed to copy ${fieldLabel}`);
        } finally {
            setCopyingField(null);
        }
    };
    
    // Fields configuration
    const socialFields = [
        { name: "website_url", label: "Website" },
        { name: "social_facebook_url", label: "Facebook" },
        { name: "social_instagram_url", label: "Instagram" },
        { name: "social_twitter_url", label: "Twitter" },
        { name: "social_linkedin_url", label: "LinkedIn" },
        { name: "swiggy_url", label: "Swiggy" },
        { name: "dineout_url", label: "Dineout" },
        { name: "google_map_url", label: "Google Maps" },
        { name: "zomato_url", label: "Zomato" }
    ];
    
    return (
        <Paper sx={{ p: 0 }}>
            <Box>
                <Typography variant="h5" mb={2}>
                    Social Info
                </Typography>

                <Grid container spacing={2}>
                    {socialFields.map(({ name, label }) => (
                        <Grid
                            key={name}
                            size={{
                                xs: 12,
                                md: 12
                            }}>
                            <Controller
                                name={name}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label={label}
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        multiline
                                        InputLabelProps={{ shrink: true }}
                                        InputProps={{
                                            endAdornment: transferTargetCafeId ? (
                                                <InputAdornment position="end">
                                                    <Tooltip title={`Copy ${label} to ${transferTargetCafeId}`} arrow>
                                                        <span>
                                                            <IconButton
                                                                edge="end"
                                                                size="small"
                                                                onClick={() => handleCopyFieldToTarget(name, label)}
                                                                disabled={copyingField === name}
                                                            >
                                                                <ContentCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </InputAdornment>
                                            ) : undefined,
                                            sx: {
                                              '& .MuiOutlinedInput-notchedOutline': {
                                               borderRadius: '4px',
                                              },
                                            }
                                          }}
                                    />
                                )}
                            />
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit(handleSubmitSocialInfo)}
                        disabled={!isFormModified}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
            {/* 🔔 Alert Snackbar */}
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
        </Paper>
    );
};

export default SocialInfo;