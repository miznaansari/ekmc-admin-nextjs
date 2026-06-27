import {Box, 
    Grid, 
    TextField,
    Button,
    Typography,
    Autocomplete,
    Chip,
    MenuItem,
    Paper,
    Stack,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme,
    Avatar,
    Switch} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Close, Videocam } from "@mui/icons-material";
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import Demo from "../../ImageCroper/Demo";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';

const AddMilestone = ({ onSuccess, onCancel }) => {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
        setError,
        clearErrors
    } = useForm({
        defaultValues: {
            title: "",
            system_title: "",
            eatcoins_offered: "",
            status: 0,
            description: "",
            notes: "",
            contribution_arr: [{ contribution_id: null, quantity: 1 }]
        }
    });
    
    const baseurl = process.env.VITE_REACT_APP_BACKEND_URL;
    const token = localStorage.getItem("authToken");
    const [previewVideo, setPreviewVideo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [searchCafequery, setSearchCafequery] = useState("");
    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [taggedUsers, setTaggedusers] = useState([]);
    const [searchTagusers, setSearchTagUsers] = useState("");
    const [hashtags, setHashtags] = useState([]);
    const theme = useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [previewImage, setPreviewImage] = useState('');
    const [searchContribution, setSearchContribution] = useState('');
    const [contributions, setContributions] = useState([]);
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });
    
    const watchContributions = watch('contribution_arr', [{ contribution_id: null, quantity: 1 }]);

    // Add new contribution
    const addNewContr = () => {
        const contrs = [...watchContributions];
        contrs.push({ contribution_id: null, quantity: 1 });
        reset({ ...watch(), contribution_arr: contrs });
    }
    
    // Remove contribution
    const removeContr = (indexToRemove) => {
        const contrs = [...watchContributions];
        if (contrs.length > 1) {
            contrs.splice(indexToRemove, 1);
            reset({ ...watch(), contribution_arr: contrs });
        }
    }

    // Validate image
    const validateImage = () => {
        // Add your image validation logic here
        return true;
    }

    // Submit form
    const onSubmit = async (data) => {
        

        const payload = {
            ...data,
        }

        console.log("payload - ", payload)
        setLoading(true);

        try {
            const response = await axios.post(`${baseurl}/api/milestone/v1/milestone`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            console.log("submit milestone. response- ", response)
            if (response.status === 201) {
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            } else {
                setAlert({ open: true, severity: "error", message: "Error : error during submit!!" })
            }
        } catch (e) {
            console.log("error during submiting- ", e)
            setAlert({ open: true, severity: "error", message: "Error : error during submit!!" })
        } finally {
            setLoading(false);
        }
    }

    // Fetch contributions
    const fetchContributions = async () => {
        try {
            const response = await axios.get(`${baseurl}/api/contribution/v1/contribution`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: { search: searchContribution }
            })
            console.log("contrr- ", response)
            const contribution = response.data?.data?.data.map((contr) => ({
                label: contr.title,
                value: contr.id
            }))
            setContributions(contribution)
            console.log("formatted contrr- ", contribution)
        } catch (e) {
            console.log("error during fetching contributions=", e)
        }
    }

    useEffect(() => {
        fetchContributions();
    }, [searchContribution])

    return (
        <Box 
            sx={{ 
                height: isMobileScreen ? "95vh" : '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Header - Fixed */}
            <Box 
                sx={{ 
                    bgcolor: "#F7F7F7", 
                    p: 1,
                    flexShrink: 0,
                    zIndex: 999
                }}
            >
                <Paper sx={{ padding: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5">Add Contribution</Typography>
                        <IconButton onClick={() => {
                            if (typeof onCancel === 'function') {
                                onCancel();
                            }
                        }}>
                            <Close />
                        </IconButton>
                    </Stack>
                </Paper>
            </Box>
            {/* Main Content - Scrollable */}
            <Box 
                component="form" 
                onSubmit={handleSubmit(onSubmit)}
                sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                <Paper sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    m: 1,
                    overflow: 'hidden'
                }}>
                    {/* Scrollable content area */}
                    <Box sx={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        px: 2, 
                        pt: 2,
                        pb: 1
                    }}>
                        <Grid container spacing={2}>
                            {/* Title */}
                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="title"
                                    rules={{ required: "Title is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Title"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            required
                                            error={!!errors.title}
                                            helperText={errors.title?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* System Title */}
                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="system_title"
                                    rules={{ required: "System title is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="System Title"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            required
                                            error={!!errors.system_title}
                                            helperText={errors.system_title?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Eatcoins Offered */}
                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="eatcoins_offered"
                                    rules={{ 
                                        required: "Eatcoins offered is required",
                                        min: { value: 0, message: "Must be a positive number" }
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Eatcoins Offered"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            type="number"
                                            inputProps={{ min: 0 }}
                                            required
                                            error={!!errors.eatcoins_offered}
                                            helperText={errors.eatcoins_offered?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Description */}
                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="description"
                                    rules={{ required: "Description is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Description"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            multiline
                                            rows={3}
                                            required
                                            error={!!errors.description}
                                            helperText={errors.description?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Internal Notes */}
                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="notes"
                                    rules={{ required: "Internal note is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Internal Note"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            required
                                            margin="dense"
                                            multiline
                                            rows={2}
                                            error={!!errors.notes}
                                            helperText={errors.notes?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            {/* Add Contributions Section */}
                            <Grid width={"100%"} size={12}>
                                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                                    Add Contributions
                                </Typography>
                                
                                {watchContributions.map((addon, index) => (
                                    <Box key={index} sx={{ mb: 2 }}>
                                        <Grid container spacing={2} alignItems="flex-start">
                                            {/* Contribution Dropdown */}
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 5
                                                }}>
                                                <Controller
                                                    name={`contribution_arr[${index}].contribution_id`}
                                                    control={control}
                                                    rules={{ required: "Please select a contribution" }}
                                                    render={({ field: { value, onChange } }) => (
                                                        <Autocomplete
                                                            value={contributions.find(option => option.value === value) || null}
                                                            onChange={(event, newValue) => {
                                                                onChange(newValue ? newValue.value : null);
                                                            }}
                                                            options={contributions}
                                                            getOptionLabel={(option) => option.label}
                                                            isOptionEqualToValue={(option, value) => option.value === value?.value}
                                                            fullWidth
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    label="Contribution"
                                                                    size="small"
                                                                    margin="dense"
                                                                    fullWidth
                                                                    required
                                                                    error={!!errors.contribution_arr?.[index]?.contribution_id}
                                                                    helperText={errors.contribution_arr?.[index]?.contribution_id?.message}
                                                                />
                                                            )}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            
                                            {/* Quantity Field */}
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 5
                                                }}>
                                                <Controller
                                                    name={`contribution_arr[${index}].quantity`}
                                                    control={control}
                                                    rules={{ 
                                                        required: "Quantity is required",
                                                        min: { value: 1, message: "Quantity must be at least 1" }
                                                    }}
                                                    render={({ field }) => (
                                                        <TextField 
                                                            {...field} 
                                                            label="Quantity" 
                                                            type="number" 
                                                            size="small"
                                                            margin="dense" 
                                                            fullWidth 
                                                            required
                                                            inputProps={{ min: 1 }}
                                                            error={!!errors.contribution_arr?.[index]?.quantity}
                                                            helperText={errors.contribution_arr?.[index]?.quantity?.message}
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            
                                            {/* Remove Button */}
                                            <Grid
                                                size={{
                                                    xs: 12,
                                                    sm: 2
                                                }}>
                                                <Button 
                                                    variant='outlined' 
                                                    color='error' 
                                                    size="small" 
                                                    fullWidth
                                                    sx={{ 
                                                        mt: 1,
                                                        height: '40px'
                                                    }}
                                                    onClick={() => removeContr(index)}
                                                    disabled={watchContributions.length === 1}
                                                >
                                                    Remove
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ))}
                                
                                {/* Add New Contribution Button */}
                                <Button
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={addNewContr}
                                    color="secondary"
                                    variant="contained"
                                    sx={{ mt: 1 }}
                                >
                                    Add New Contribution
                                </Button>
                            </Grid>

                            {/* Status Switch */}
                            <Grid xs={12} width={"100%"}>
                                <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
                                    <Typography variant="body1" mr={2}>
                                        Status:
                                    </Typography>
    
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field: { value, onChange } }) => (
                                            <Switch
                                                checked={value === 1}
                                                onChange={(e) => onChange(e.target.checked ? 1 : 0)}
                                                color="secondary"
                                            />
                                        )}
                                    />

                                    <Typography variant="body2">
                                        {watch("status") === 1 ? "Active" : "Inactive"}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Footer Buttons - Fixed at bottom */}
                    <Box sx={{ 
                        p: 2, 
                        borderTop: '1px solid #e0e0e0',
                        flexShrink: 0
                    }}>
                        <Stack direction="row" spacing={1}>
                            <Button 
                                variant="outlined" 
                                color='error' 
                                sx={{ flex: 1 }} 
                                onClick={() => {
                                    if (typeof onCancel === 'function') {
                                        onCancel();
                                    }
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                sx={{ flex: 1 }} 
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Box>
            {/* Snackbar for alerts */}
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

export default AddMilestone;