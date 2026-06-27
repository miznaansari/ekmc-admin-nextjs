import { 
    Alert, 
    Box, 
    Button, 
    FormControl, 
    FormControlLabel, 
    Grid, 
    InputAdornment, 
    InputLabel, 
    MenuItem, 
    Paper, 
    Radio, 
    RadioGroup, 
    Select, 
    Snackbar, 
    Stack, 
    TextField, 
    Typography 
} from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const AdditionalInfo = ({cafeId}) => {
    const { control, handleSubmit, reset, setValue, getValues, watch } = useForm({
        defaultValues: {
            currency: "",
            language: "",
            is_zomato: 0,
            zomato_commission: "",
            is_swiggy: 0,
            swiggy_commission: "",
            is_dinein: 0,
            is_takeaway: 0,
            upi: "",
            name_at_bank: "",
            cafe_detection_radius: null,
            is_user_location_required:null,
            is_oneview: 0,
        }
    });
    
    const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL; 
    const token = localStorage.getItem("authToken");
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });
    const [initialFormData, setInitialFormData] = useState({});
    const [isFormModified, setIsFormModified] = useState(false);
    
    // Watch all form values for changes
    const formValues = watch();

    //commission change button enable
    const zomatoCommission= watch("zomato_commission");
    const swiggyCommission= watch("swiggy_commission");
    const [initialZomatoCommission, setInitialZomatoCommission]=useState();
    const [initialSwiggyCommission, setInitialSwiggyCommission]=useState();
    const [isSwiggyCommissionModified, setIsSwiggyCommissionModifoed]=useState(false);
    const [isZomatoCommissionModified, setIsZomatoCommissionModified]=useState(false);


    //check is zomato commission change on enable update pricemenu button
    const checkIsZomatoCommissionModified= useCallback(()=>{
        return zomatoCommission != initialZomatoCommission;
    },[zomatoCommission,initialZomatoCommission]);

    useEffect(()=>{
        const isModified = checkIsZomatoCommissionModified();
        setIsZomatoCommissionModified(isModified);
    },[zomatoCommission, initialZomatoCommission, checkIsZomatoCommissionModified]);

    //check is swiggy modified or not 
    const checkIsSwiggyModified= useCallback(()=>{
        return swiggyCommission != initialSwiggyCommission;

    },[swiggyCommission, initialSwiggyCommission])

    useEffect(()=>{
        const isModified= checkIsSwiggyModified();
        setIsSwiggyCommissionModifoed(isModified);

    },[swiggyCommission, initialSwiggyCommission,checkIsSwiggyModified])

    const showAlert = (severity, message) => {
        setAlert({ open: true, severity, message });
        setTimeout(() => {
            setAlert({ ...alert, open: false });
        }, 3000);
    };

    // Improved comparison function with proper type handling
    const checkIfDataModified = useCallback(() => {
        if (!initialFormData || Object.keys(initialFormData).length === 0) return false;
        
        const currentValues = getValues();
        
        return Object.keys(currentValues).some(key => {
            // Skip commission fields in the comparison
            if (key === 'zomato_commission' || key === 'swiggy_commission') {
                return false;
            }
            
            // Handle specific transformations for certain fields
            let initialValue = initialFormData[key];
            let currentValue = currentValues[key];
            
            // Handle radio button values (convert to numbers for comparison)
            if (['is_zomato', 'is_swiggy', 'is_dinein', 'is_takeaway'].includes(key)) {
                initialValue = Number(initialValue);
                currentValue = Number(currentValue);
            }
            
            return currentValue !== initialValue;
        });
    }, [getValues, initialFormData]);

    // Update form modified state whenever form values change
    useEffect(() => {
        const isModified = checkIfDataModified();
        setIsFormModified(isModified);
    }, [formValues, checkIfDataModified]);

    // Fetch additional info
    const fetchAdditionalInfo = async() => {
        if (!cafeId) return;
        
        try {
            const response = await axios.get(`${baseUrl}/api/cafe-settings/v1/cafe-settings/${cafeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("additional info- ", response)
            
            if (response.data && response.data.data && response.data.data.length > 0) {
                const AdditionalData = response.data.data[0];
                
                // Format data for the form
                const formData = {
                    currency: AdditionalData.currency || "",
                    language: AdditionalData.language || "",
                    is_zomato: Number(AdditionalData.is_zomato) || 0,
                    zomato_commission: AdditionalData.zomato_commission ? `${AdditionalData.zomato_commission}` : "",
                    is_swiggy: Number(AdditionalData.is_swiggy) || 0,
                    swiggy_commission: AdditionalData.swiggy_commission ? `${AdditionalData.swiggy_commission}` : "",
                    is_dinein: Number(AdditionalData.is_dinein) || 0,
                    is_takeaway: Number(AdditionalData.is_takeaway) || 0,
                    upi: response.data.upi || "",
                    name_at_bank: response.data.name_at_bank || "",
                    cafe_detection_radius:AdditionalData.cafe_radius || 0,
                    is_user_location_required:AdditionalData.is_user_location_required || false,
                    is_oneview:AdditionalData.is_oneview || 0 
                };
                
                reset(formData);
                
                // Store initial form data for comparison but exclude commission fields
                const formIsmodifiedForm = {
                    currency: AdditionalData.currency || "",
                    language: AdditionalData.language || "",
                    is_zomato: Number(AdditionalData.is_zomato) || 0,
                    is_swiggy: Number(AdditionalData.is_swiggy) || 0,
                    is_dinein: Number(AdditionalData.is_dinein) || 0,
                    is_takeaway: Number(AdditionalData.is_takeaway) || 0,
                    upi: response.data.upi || "",
                    name_at_bank: response.data.name_at_bank || "",
                    cafe_detection_radius:response.data.cafe_detection_radius || 0,
                    is_user_location_required:response.data.is_user_location_required || false,
                    is_oneview:response.data.is_oneview || 0 
                };
                setInitialFormData(formIsmodifiedForm);
                setIsFormModified(false);
                setInitialZomatoCommission(AdditionalData.zomato_commission);
                setInitialSwiggyCommission(AdditionalData.swiggy_commission);
                setIsSwiggyCommissionModifoed(false);
                setIsZomatoCommissionModified(false);
            }
        } catch (e) {
            console.log("Error during fetching additional info: ", e);
            showAlert("error", "Failed to fetch cafe information");
        }
    };

    // Fetch data when cafeId changes
    useEffect(() => {
        if (cafeId) {
            fetchAdditionalInfo();
        }
    }, [cafeId]);

    // Handle main form submission
    const handleSubmitAdditionalInfo = async(data) => {
        const payload = {
            currency: data.currency || "",
            is_dinein: Number(data.is_dinein) || 0,
            is_takeaway: Number(data.is_takeaway) || 0,
            is_zomato: Number(data.is_zomato) || 0,
            is_swiggy: Number(data.is_swiggy) || 0,
            language: data.language || "",
            upi_id: data.upi || "",
            name_at_bank: data.name_at_bank || "",
            cafe_detection_radius: data.cafe_detection_radius || 0,
            is_user_location_required: data.is_user_location_required,
            is_oneview:data.is_oneview
        };
        
        try {
            const response = await axios.put(`${baseUrl}/api/cafe-settings/v1/settings/${cafeId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Update stored form data - explicitly exclude commission fields
            const formIsModified = {
                currency: data.currency || "",
                is_dinein: Number(data.is_dinein) || 0,
                is_takeaway: Number(data.is_takeaway) || 0,
                is_zomato: Number(data.is_zomato) || 0,
                is_swiggy: Number(data.is_swiggy) || 0,
                language: data.language || "",
                upi: data.upi || "",
                name_at_bank: data.name_at_bank || "",
                cafe_detection_radius: data.cafe_detection_radius || 0,
                is_user_location_required: data.is_user_location_required,
                is_oneview:data.is_oneview
            };
            
            if (response.status === 200) {
                showAlert("success", "Additional info updated!");
                
                // Update initial form data to match current values
                setInitialFormData(formIsModified);
                setIsFormModified(false);
            }
        } catch (e) {
            console.log("Error during submitting additional info: ", e);
            showAlert("error", "Additional info update failed!");
        }
    };

    // Handle Zomato commission update
    const handleZomatoCommisionUpdate = async(data) => {
        const stripPercent = (value) =>
            typeof value === "string" ? value.replace("%", "").trim() : value;
    
        const payload = {
            zomato_commison: stripPercent(data.zomato_commission) || "",
        };
        
        try {
            const response = await axios.put(`${baseUrl}/api/cafe-settings/v1/price/${cafeId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                showAlert("success", "Zomato commission updated!");
                setInitialZomatoCommission(data.zomato_commission);
                setIsZomatoCommissionModified(false);
            }
        } catch (e) {
            console.log("Error during update commission: ", e);
            showAlert("error", "Zomato commission update failed!");
        }
    };

    // Handle Swiggy commission update
    const handleSwiggyCommissionUpdate = async(data) => {
        const stripPercent = (value) =>
            typeof value === "string" ? value.replace("%", "").trim() : value;
    
        const payload = {
            swiggy_commison: stripPercent(data.swiggy_commission) || "",
        };
        
        try {
            const response = await axios.put(`${baseUrl}/api/cafe-settings/v1/price/${cafeId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                showAlert("success", "Swiggy commission updated!");
                setInitialSwiggyCommission(data.swiggy_commission);
                setIsSwiggyCommissionModifoed(false);
            }
        } catch (e) {
            console.log("Error during update swiggy commission: ", e);
            showAlert("error", "Swiggy commission update failed!");
        }
    };
    
    return (
        <Paper sx={{ width: '100%' }}>
            <Box sx={{ width: "100%" }}>
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
                
                <Typography variant="h5" p={2} pb={0}>Additional Info</Typography>
                <Stack p={2} pt={0}>
                    <Grid container spacing={2} mt={1} mb={"16px"}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Controller
                                name="currency"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth size="small" sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                         borderRadius: '4px',
                                        },
                                      }}>
                                        <InputLabel id="currency-select-label">Currency</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="currency-select-label"
                                            label="Currency"
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            <MenuItem value="USD">USD</MenuItem>
                                            <MenuItem value="EUR">EUR</MenuItem>
                                            <MenuItem value="INR">INR</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Controller 
                                name="language"
                                control={control}
                                render={({field}) => (
                                    <FormControl fullWidth size="small" sx={ {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                         borderRadius: '4px',
                                        },
                                      }}>
                                        <InputLabel id="language-select-label">Language</InputLabel>
                                        <Select
                                            {...field}
                                            labelId="language-select-label"
                                            label="Language"
                                        >
                                            <MenuItem value=""><em>None</em></MenuItem>
                                            <MenuItem value="ENGLISH">English</MenuItem>
                                            <MenuItem value="SPANISH">Spanish</MenuItem>
                                            <MenuItem value="FRENCH">French</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                    </Grid>

                    {/* Zomato Available */}
                    <Typography variant="body1">Zomato Available</Typography>
                    <Controller
                        name="is_zomato"
                        control={control}
                        render={({field}) => (
                            <RadioGroup
                                row
                                {...field}
                                value={Number(field.value)}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            >
                                <FormControlLabel value={1} control={<Radio color="secondary" />} label="Yes" />
                                <FormControlLabel value={0} control={<Radio color="secondary" />} label="No" />
                            </RadioGroup>
                        )}
                    />
                    
                    {/* Commission Block - DO NOT CHANGE */}
                    <Grid container spacing={2} mb={"16px"}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Controller
                                name="zomato_commission"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        label="Commission"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
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
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Button 
                                variant="contained" 
                                onClick={handleSubmit(handleZomatoCommisionUpdate)}
                                disabled={!isZomatoCommissionModified}
                            >
                                UPDATE MENU PRICE
                            </Button>
                        </Grid>
                    </Grid>

                    {/* Swiggy Available */}
                    <Typography variant="body1">Swiggy Available</Typography>
                    <Controller
                        name="is_swiggy"
                        control={control}
                        render={({field}) => (
                            <RadioGroup
                                row
                                {...field}
                                value={Number(field.value)}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            >
                                <FormControlLabel value={1} control={<Radio color="secondary" />} label="Yes" />
                                <FormControlLabel value={0} control={<Radio color="secondary" />} label="No" />
                            </RadioGroup>
                        )}
                    />
                    
                    {/* Commission Block - DO NOT CHANGE */}
                    <Grid container spacing={2} mb={"16px"}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Controller
                                name="swiggy_commission"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        label="Commission"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        InputProps={{
                                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
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
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Button 
                                variant="contained" 
                                onClick={handleSubmit(handleSwiggyCommissionUpdate)}
                                disabled={!isSwiggyCommissionModified}
                            >
                                UPDATE MENU PRICE
                            </Button>
                        </Grid>
                    </Grid>

                    {/* Dine-in Available */}
                    <Typography variant="body1">Dine-in Available</Typography>
                    <Controller
                        name="is_dinein"
                        control={control}
                        render={({field}) => (
                            <RadioGroup
                                {...field}
                                row
                                value={Number(field.value)}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            >
                                <FormControlLabel value={1} control={<Radio color="secondary" />} label="Yes" />
                                <FormControlLabel value={0} control={<Radio color="secondary" />} label="No" />
                            </RadioGroup>
                        )}
                    />
                    
                    {/* Takeaway Available */}
                    <Typography variant="body1">Takeaway Available</Typography>
                    <Controller
                        name="is_takeaway"
                        control={control}
                        render={({field}) => (
                            <RadioGroup
                                {...field}
                                row
                                value={Number(field.value)}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            >
                                <FormControlLabel value={1} control={<Radio color="secondary" />} label="Yes" />
                                <FormControlLabel value={0} control={<Radio color="secondary" />} label="No" />
                            </RadioGroup>
                        )}
                    />

                    {/* IS Oneview */}
                    <Typography variant="body1">One View</Typography>
                    <Controller
                        name="is_oneview"
                        control={control}
                        render={({field}) => (
                            <RadioGroup
                                {...field}
                                row
                                value={Number(field.value)}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            >
                                <FormControlLabel value={1} control={<Radio color="secondary" />} label="Yes" />
                                <FormControlLabel value={0} control={<Radio color="secondary" />} label="No" />
                            </RadioGroup>
                        )}
                    />

                    {/* is User location required */}

                    <Typography variant="body1">User location required</Typography>
                    <Controller
                        name="is_user_location_required"
                        control={control}
                        render={({field}) => (
                            <RadioGroup
                                {...field}
                                row
                                value={Number(field.value)}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            >
                                <FormControlLabel value={1} control={<Radio color="secondary" />} label="Yes" />
                                <FormControlLabel value={0} control={<Radio color="secondary" />} label="No" />
                            </RadioGroup>
                        )}
                    />

                    {/* Cafe detection radious */}

                     <Grid container spacing={2} mt={1} mb={"16px"}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Controller
                                name="cafe_detection_radius"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        label="Cafe detection radius"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        type="number"
                                        InputProps={{
                                            sx: {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                 borderRadius: '4px',
                                                },
                                              }
                                        }}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                    
                    <Grid container spacing={2} mt={1}>
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Controller
                                name="upi"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        label="UPI"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        InputProps={{
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
                        <Grid
                            size={{
                                xs: 12,
                                md: 6
                            }}>
                            <Controller 
                                name="name_at_bank"
                                control={control}
                                render={({field}) => (
                                    <TextField
                                        {...field}
                                        label="Name at Bank"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        InputProps={{
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
                    </Grid>

                    <Box sx={{ display: "flex", mt: 2 }}>
                        <Button 
                            variant="contained" 
                            onClick={handleSubmit(handleSubmitAdditionalInfo)} 
                            disabled={!isFormModified}
                        >
                            Save
                        </Button>
                    </Box>
                </Stack>
            </Box>
        </Paper>
    );
};

export default AdditionalInfo;