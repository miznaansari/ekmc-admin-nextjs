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
    Switch,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Close, Videocam } from "@mui/icons-material";
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import Demo from "../../ImageCroper/Demo";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';

const EditMilestone = ({ onSuccess, onCancel , id, onDelete}) => {
    console.log("id in edit milestone-", id)
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isDirty },
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
    const [drawerLoading, setDrawerLoading] = useState(false);
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
    
    // State for discard confirmation dialog
    const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
    const [hasFormChanged, setHasFormChanged] = useState(false);
    const [originalFormData, setOriginalFormData] = useState(null);
    
    const watchContributions = watch('contribution_arr', [{ contribution_id: null, quantity: 1 }]);
    const watchedValues = watch(); // Watch all form values

    // Check if form has changed compared to original data
    useEffect(() => {
        if (originalFormData) {
            const currentFormData = JSON.stringify(watchedValues);
            const originalData = JSON.stringify(originalFormData);
            setHasFormChanged(currentFormData !== originalData);
        }
    }, [watchedValues, originalFormData]);

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

    //fetch milestone by id
    //fetch milestone by id
const fetchMilestone = async() => {
    try{
        setDrawerLoading(true);
        const response = await axios.get(`${baseurl}/api/milestone/v1/milestone`,{
            headers:{
                Authorization:`Bearer ${token}`
            },
            params:{
                milestone_id:id
            }
        })
        const data = response.data?.data?.data[0]
        console.log("milestone in edit - ", data);
        setValue('title',data.title)
        setValue('system_title', data.system_title);
        setValue('eatcoins_offered',data.eatcoins_offered)
        setValue('description', data.description)
        setValue('notes',data.notes)
        setValue('status',data.status)

        // Handle contributions array
        if (data.contributions && data.contributions.length > 0) {
            // Transform the contributions data to match form structure
            const contributionArray = data.contributions.map(contribution => ({
                contribution_id: contribution.id,
                quantity: contribution.quantity || 1 // Use quantity from the response, fallback to 1
            }));
            
            setValue('contribution_arr', contributionArray);
            
            // Also populate the contributions dropdown with the fetched data
            // This ensures the selected contributions appear correctly
            const contributionOptions = data.contributions.map(contribution => ({
                label: contribution.title,
                value: contribution.id
            }));
            
            // Merge with existing contributions to avoid duplicates
            setContributions(prevContributions => {
                const existingIds = prevContributions.map(c => c.value);
                const newContributions = contributionOptions.filter(c => !existingIds.includes(c.value));
                return [...prevContributions, ...newContributions];
            });
            
        } else if (data.contribution_ids) {
            // Fallback: if only contribution_ids string is available
            const contributionIds = data.contribution_ids.split(',').map(id => parseInt(id.trim()));
            const contributionArray = contributionIds.map(contributionId => ({
                contribution_id: contributionId,
                quantity: 1 // Default quantity since we don't have quantity info
            }));
            
            setValue('contribution_arr', contributionArray);
        }

        // Store original form data after setting values
        setTimeout(() => {
            setOriginalFormData(watch());
        }, 100);
    }catch(e){
        console.log("error during fetching milestone-", e);
        setAlert({ 
            open: true, 
            severity: "error", 
            message: "Error loading milestone data" 
        });
    }finally{
        setDrawerLoading(false)
    }
}

    useEffect(()=>{
        if(id) {
            fetchMilestone();
        }
    },[id])

    // Handle cancel with confirmation
    const handleCancel = () => {
        if (hasFormChanged) {
            setDiscardDialogOpen(true);
        } else {
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    };

    // Handle discard confirmation
    const handleDiscardConfirm = () => {
        setDiscardDialogOpen(false);
        if (typeof onCancel === 'function') {
            onCancel();
        }
    };

    const handleDiscardCancel = () => {
        setDiscardDialogOpen(false);
    };

    // Submit form
    const onSubmit = async (data) => {
        

        const payload = {
            ...data,
            milestone_id: id // Add milestone_id for edit operation
        }

        console.log("payload - ", payload)
        setLoading(true);

        try {
            // Use PUT method for editing
            const response = await axios.put(`${baseurl}/api/milestone/v1/milestone/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            console.log("update milestone. response- ", response)
            if (response.status === 200 || response.status === 201) {
                setAlert({ 
                    open: true, 
                    severity: "success", 
                    message: "Milestone updated successfully!" 
                });
                // Reset form changed state after successful submission
                setHasFormChanged(false);
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            } else {
                setAlert({ open: true, severity: "error", message: "Error: error during update!!" })
            }
        } catch (e) {
            console.log("error during updating- ", e)
            setAlert({ open: true, severity: "error", message: "Error: error during update!!" })
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

    // Show loading spinner while fetching milestone data
    if (drawerLoading) {
        return (
            <Box 
                sx={{ 
                    height: isMobileScreen ? "95vh" : '100vh', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading milestone data...
                </Typography>
            </Box>
        );
    }

    //delete milestone
    const handleDeleteMilestone= async()=>{
        try{
            const response= await axios.delete(`${baseurl}/api/milestone/v1/milestone/${id}`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            console.log("deleted response- ", response);

            if (response.status === 200 || response.status === 201) {
                setAlert({ 
                    open: true, 
                    severity: "success", 
                    message: "Milestone Deleted!" 
                });
                if (typeof onDelete === 'function') {
                    onDelete();
                }
            } else {
                setAlert({ open: true, severity: "error", message: "Error: error during Delete!!" })
            }

        }catch(e){
            console.log("error during delete milestone-", e);
            setAlert({ open: true, severity: "error", message: "Error: error during Delete!!" })
        }
    }

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
                        <Typography variant="h5">Edit Milestone</Typography>
                        <IconButton onClick={handleCancel}>
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
                                onClick={handleDeleteMilestone}
                                disabled={loading}
                            >
                                Delete
                            </Button>
                            <Button 
                                type="submit" 
                                sx={{ flex: 1 }} 
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} thickness={4} /> : 'Update Milestone'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Box>
            {/* Discard Changes Confirmation Dialog */}
            <Dialog
                open={discardDialogOpen}
                onClose={handleDiscardCancel}
                aria-labelledby="discard-dialog-title"
                aria-describedby="discard-dialog-description"
            >
                <DialogTitle id="discard-dialog-title">
                    Discard Changes?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="discard-dialog-description">
                        You have unsaved changes. Are you sure you want to discard them and close this form?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDiscardCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDiscardConfirm} color="error" variant="contained">
                        Yes, Discard
                    </Button>
                </DialogActions>
            </Dialog>
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

export default EditMilestone;