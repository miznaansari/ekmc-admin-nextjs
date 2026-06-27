import { 
    Box, 
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
    Grid2,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme,
    Avatar,
    Switch,
    FormControlLabel,
    Checkbox,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
    
 } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Close, Videocam } from "@mui/icons-material";

const EditLevel= ({onSuccess, onCancel, id})=>{
    console.log("level id- ", id)
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isDirty },
        setError,
        clearErrors,
        reset
    } = useForm({
        defaultValues:{
            level_id: "",
            starting_point: "",
            ending_point: "",
            status: 0,
            eatcoin_prize: "",
            internal_note: "",
            custom_message: ""
        }
    });
    
    const baseurl= import.meta.env.VITE_REACT_APP_BACKEND_URL;
    const token= localStorage.getItem("authToken");
    const [loading, setLoading]=useState(false);
    const theme= useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [enabled, setEnabled] = useState(false);
    const [enabledMessage, setEnabledMessage] = useState(false);
    const [loadDrawer, setLoadDrawer] = useState(false);
    const [initialValues, setInitialValues] = useState(null);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);

   
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });

    // Check if form has changes
    const hasChanges = () => {
        if (!initialValues) return false;
        
        const currentValues = watch();
        const currentEnabled = enabled;
        const currentEnabledMessage = enabledMessage;
        
        // Check form field changes
        const formChanged = Object.keys(initialValues.formData).some(key => {
            return String(currentValues[key] || "") !== String(initialValues.formData[key] || "");
        });
        
        // Check checkbox states
        const checkboxChanged = currentEnabled !== initialValues.enabled || 
                               currentEnabledMessage !== initialValues.enabledMessage;
        
        return formChanged || checkboxChanged;
    };

    // Handle cancel/close with confirmation
    const handleCancel = () => {
        if (hasChanges()) {
            setShowDiscardDialog(true);
        } else {
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    };

    // Confirm discard changes
    const handleDiscardConfirm = () => {
        setShowDiscardDialog(false);
        if (typeof onCancel === 'function') {
            onCancel();
        }
    };

    // Cancel discard dialog
    const handleDiscardCancel = () => {
        setShowDiscardDialog(false);
    };

    //fetch level
    const fetchLevel=async()=>{
        try{
            setLoadDrawer(true);
            const response= await axios.get(`${baseurl}/api/v1/level`,{
                headers:{
                    Authorization:`Bearer ${token}`
                },
                params:{
                    level_id:id
                }
            })

            console.log("response level= ", response.data.data.data[0])
            const data= response.data.data.data.data[0];

            const formData = {
                level_id: data.level_id,
                starting_point: String(data.starting_point || ""),
                ending_point: String(data.ending_point || ""),
                internal_note: String(data.internal_note || ""),
                eatcoin_prize: data.eatcoin_prize || 0,
                custom_message: String(data.custom_message || ""),
                status: data.status
            };

            // Set form values
            Object.keys(formData).forEach(key => {
                setValue(key, formData[key]);
            });

            // Set checkbox states based on existing data
            const enabledState = data.eatcoin_prize > 0;
            const enabledMessageState = data.custom_message && data.custom_message.trim() !== "";
            
            setEnabled(enabledState);
            setEnabledMessage(enabledMessageState);

            // Store initial values for comparison
            setInitialValues({
                formData,
                enabled: enabledState,
                enabledMessage: enabledMessageState
            });

            // Reset form dirty state after setting initial values
            setTimeout(() => {
                reset(formData);
            }, 100);

        }catch(e){
            console.log("error during fetching level- ", e)
        }finally{
            setLoadDrawer(false);
        }
    }

    useEffect(()=>{
        fetchLevel();
    }, [])
    

    // onsubmit form
    const onSubmit= async(data)=>{

        const payload= {
            ...data,
            level_id: Number(data.level_id),
            starting_point: Number(data.starting_point),
            ending_point: Number(data.ending_point),
            eatcoin_prize: Number(data.eatcoin_prize)
        }

        console.log("payload - ", payload)
        setLoading(true);

        try{
            const response= await axios.put(`${baseurl}/api/v1/level/${id}`,payload,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            console.log("submit levels. response- ", response)

            if(response.status === 200){
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            }else{
                setAlert({open:true, severity:"error", message:"Error : error during submit!!"})
            }
        }catch(e){
            console.log("error during submiting- ", e)
            const message= e.response.data.msg
            setAlert({open:true, severity:"error", message:message || "Error : error during submit!!"})
        }finally{
            setLoading(false);
        }
    }

    return(
        loadDrawer ? (
            <Box 
                sx={{
                    height: isMobileScreen ? "95vh" : "100vh",
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <CircularProgress size={60} />
            </Box>
        ) : (
        <Box 
          sx={{ 
            height: isMobileScreen? "95vh" :'100vh', 
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
                        <Typography variant="h5">Edit Level</Typography>
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
                        

                        <Grid2 container spacing={2}>
                            <Grid2 xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="level_id"
                                    rules={{ required: "Level ID is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Level Id"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            required
                                            type="number"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            error={!!errors.level_id}
                                            helperText={errors.level_id?.message}
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="starting_point"
                                    rules={{ required: "Starting point is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Starting Point"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            required
                                            type="number"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            error={!!errors.starting_point}
                                            helperText={errors.starting_point?.message}
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="ending_point"
                                    rules={{ required: "Ending point is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Ending Point"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            type="number"
                                            inputProps={{ min: 0 }}
                                            required
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            error={!!errors.ending_point}
                                            helperText={errors.ending_point?.message}
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="internal_note"
                                    rules={{ required: "Internal notes are required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Internal Notes"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            required
                                            multiline
                                            rows={2}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            error={!!errors.internal_note}
                                            helperText={errors.internal_note?.message}
                                        />
                                    )}
                                />
                            </Grid2>

                            
                            <Grid2 xs={12} width={"100%"}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={enabled}
                                            onChange={(e) => setEnabled(e.target.checked)}
                                            color="secondary"
                                        />
                                    }
                                    label="Eatcoin Prize"
                                />
                            </Grid2>

                            {/* Conditionally enabled TextField */}
                            <Grid2 xs={12} width={"100%"}>
                                <Controller
                                    name="eatcoin_prize"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Eatcoin Prize"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            disabled={!enabled}
                                            error={!!errors.eatcoin_prize}
                                            helperText={errors.eatcoin_prize?.message}
                                            type="number"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 xs={12} width={"100%"}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={enabledMessage}
                                            onChange={(e) => setEnabledMessage(e.target.checked)}
                                            color="secondary"
                                        />
                                    }
                                    label="Custom Message"
                                />
                            </Grid2>
                            
                            {/* custom message */}
                            <Grid2 xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="custom_message"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Custom Message"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            disabled={!enabledMessage}
                                            multiline
                                            rows={4}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    )}
                                />
                            </Grid2>
                            

                            <Grid2 xs={12} width={"100%"}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
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
                            </Grid2>
                        </Grid2>
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
                                onClick={handleCancel}
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

            {/* Discard Changes Confirmation Dialog */}
            <Dialog
                open={showDiscardDialog}
                onClose={handleDiscardCancel}
                aria-labelledby="discard-dialog-title"
                aria-describedby="discard-dialog-description"
            >
                <DialogTitle id="discard-dialog-title">
                    Discard Changes?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="discard-dialog-description">
                        You have unsaved changes. Are you sure you want to discard them and close the form?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDiscardCancel} color="primary">
                        No, Keep Editing
                    </Button>
                    <Button onClick={handleDiscardConfirm} color="error" variant="contained">
                        Yes, Discard Changes
                    </Button>
                </DialogActions>
            </Dialog>

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
        )
    );
}

export default EditLevel;