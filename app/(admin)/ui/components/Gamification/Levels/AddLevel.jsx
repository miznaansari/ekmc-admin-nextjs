
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
    FormControlLabel,
    Checkbox} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Close, Videocam } from "@mui/icons-material";
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import Demo from "../../ImageCroper/Demo";

const AddLevel= ({onSuccess, onCancel})=>{

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        setError,
        clearErrors
    } = useForm({
        defaultValues:{
            level_id: null,
            starting_point: null,
            ending_point: null,
            status: 0,
            eatcoin_prize: 0,
            internal_note: "",
            custom_message: ""
        }
    });
    
    const baseurl= process.env.VITE_REACT_APP_BACKEND_URL;
    const token= localStorage.getItem("authToken");
    const [loading, setLoading]=useState(false);
    const theme= useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [enabled, setEnabled] = useState(false);
    const [enabledMessage, setEnabledMessage] = useState(false);

   
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });


    

    // onsubmit form
    const onSubmit= async(data)=>{

        const payload= {
            ...data,
            level_id:Number(data.level_id)
        }

        console.log("payload - ", payload)
        setLoading(true);

        try{
            const response= await axios.post(`${baseurl}/api/v1/level`,payload,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            console.log("submit levels. response- ", response)

            if(response.status === 201){
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

    return (
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
                        <Typography variant="h5">Add Contribution</Typography>
                        <IconButton onClick={()=>{
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
                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="level_id"
                                    rules={{ required: "Title is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Level Id"
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

                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="starting_point"
                                    rules={{ required: "System title is required" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Starting Point"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            required
                                            error={!!errors.starting_point}
                                            helperText={errors.system_title?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="ending_point"
                                    
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
                                            
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="internal_note"
                                    rules={{ required: "Description is required" }}
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
                                            error={!!errors.description}
                                            helperText={errors.description?.message}
                                        />
                                    )}
                                />
                            </Grid>

                            
                            <Grid size={12}>
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
                            </Grid>

                            {/* Conditionally enabled TextField */}
                            <Grid width={"100%"} size={12}>
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
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={12}>
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
                            </Grid>
                            
                            {/* custom message */}
                            <Grid xs={12} width={"100%"}>
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
                            </Grid>
                            

                            <Grid xs={12} width={"100%"}>
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
                                onClick={()=>{
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

export default AddLevel;