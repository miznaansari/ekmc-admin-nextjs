import { 
    Box, 
    Grid, 
    TextField,
    Button,
    Typography,
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
    Switch,
    
 } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { Close, Videocam } from "@mui/icons-material";



const EditRoute= ({onCancel,onSuccess, route})=>{


            const {
                control,
                handleSubmit,
                watch,
                setValue
            } = useForm({
                defaultValues:{
                    status: 0,
                    title:"",
                    banner_route:""
                }
            });
            
            const baseurl= import.meta.env.VITE_REACT_APP_BACKEND_URL;
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
        
            useEffect(()=>{
                setValue('title',route.title)
                setValue('banner_route',route.banner_route)
                setValue('status',route.status)

            },[route])


        
            const onSubmit= async(data)=>{
        
                const payload= {
                    title:data.title,
                    banner_route:data.banner_route,
                    status:data.status
                }
        
                console.log("payload - ", payload)
                setLoading(true);
        
                try{
                    const response= await axios.put(`${baseurl}/api/banner/route/v1/banner/${route.id}`,payload,{
                        headers:{
                            Authorization:`Bearer ${token}`
                        }
                    })
        
                    console.log("submit route response- ", response)
        
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
            <Box 
              sx={{ 
                height: isMobileScreen? "95vh" :'100vh', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
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
                                        name="title"
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Title"
                                                variant="outlined"
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                
                                            />
                                        )}
                                    />
                                </Grid2>
    
                                <Grid2 xs={12} width={"100%"}>
                                    <Controller
                                        control={control}
                                        name="banner_route"
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Banner Route"
                                                variant="outlined"
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                
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
        )
    
}

export default EditRoute;