import {Box, 
    Grid, 
    TextField,
    Button,
    Typography,
    MenuItem,
    Paper,
    Stack,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme,
    Switch,
    Avatar,
    Autocomplete,
    RadioGroup,
    FormControlLabel,
    Radio} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { Close, Videocam } from "@mui/icons-material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import dayjs, { utc } from 'dayjs'; // Add this import

const EditBanner= ({onCancel,onSuccess, bannerId})=>{
    console.log("banner id in edit banner- ", bannerId)
    const {
        control,
        handleSubmit,
        watch,
        setValue, // Add setValue to update form values
        } = useForm({
            defaultValues:{
                status: 0,
                type: "",
                banner_title:"",
                banner_url:"",
                banner_expiry: null, // Changed from "" to null

                banner_placement_id:"",
                banner_route_id:"",
                condition_id:""
            }
        });
            
    const baseurl= process.env.VITE_REACT_APP_BACKEND_URL;
    const token= localStorage.getItem("authToken");
    const [loading, setLoading]=useState(false);
    const theme= useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

    
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });

    const type = watch("type"); // "image" | "video" | "lottie"

    const [previewVideo, setPreviewVideo]=useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [localVideoUrl, setLocalVideoUrl]=useState(null);
    const [lottiePreview, setLottiepreview]=useState(null);

    //set banner placement vars
    const [bannerPlacements, setBannerPlacements]=useState([]);
    const [bannerPlacementId, setBannerPlacementId]=useState(null);
    const [bannerSearchPlacementQuery, setSearchBannerPlacementSearchQuery]=useState(null);

    //set banner conditions vars
    const [bannerConditions, setBannerConditions]=useState([]);
    const [bannerConditionId, setBannerConditionId]=useState(null);

    //set banner routes vars
    const [bannerRoutes, setBannerRoutes]=useState([]);
    const [bannerRouteId, setBannerRouteId]=useState(null);

    //fetch banner by id
    const fetchBannerByid= async()=>{
        try{
            const response= await axios.get(`${baseurl}/api/banner/main/v1/banners`,{
                headers:{
                    Authorization:`Bearer ${token}`
                },
                params:{
                    banner_id:bannerId
                }
            })

            console.log("banner by id res= ", response?.data?.data[0]);
            
            const bannerData = response?.data?.data[0];
            
            if (bannerData) {
                // Set form values
                setValue("banner_title", bannerData.banner_title || "");
                setValue("status", bannerData.status || 0);
                setValue("banner_expiry", bannerData.banner_expiry ? dayjs(bannerData.banner_expiry): null);
                // Set type based on banner data
                if (bannerData.is_lottie === 1) {
                    setValue("type", "lottie");
                    setLottiepreview(bannerData.banner_url);
                } else if (bannerData.is_video === 1) {
                    setValue("type", "video");
                    setPreviewVideo(bannerData.banner_url);
                    setLocalVideoUrl(bannerData.banner_url)
                } else if (bannerData.is_image === 1) {
                    setValue("type", "image");
                    setPreviewImage(bannerData.banner_url);
                }
                
                // Set dropdown values
                setBannerPlacementId(bannerData.banner_placement_id || null);
                setBannerConditionId(bannerData.condition_id || null);
                setBannerRouteId(bannerData.banner_route_id || null);
            }

        }catch(e){
            console.log("error during fetch banner by id- ",e);
        }
    }

    useEffect(()=>{
        fetchBannerByid();
    },[bannerId])

    //image upload 
    const [previewImage, setPreviewImage] = useState(null);//to store image url
    const [uploading, setUploading] = useState(false); // Track upload state

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            const imageUrl = await uploadImage(file);
            setPreviewImage(imageUrl)
            console.log("image url in handleimage change- ", imageUrl);
        }
    };
    
    const handleDelete =()=>{
        setPreviewImage();
    }

    const uploadImage= async(file)=>{
        const formData= new FormData();
        formData.append("file",file)
        console.log("file is:",file)
        setUploading(true)
        try{
            const response= await axios.post(`${baseurl}/api/banner/main/v1/upload`,formData,
            {
              headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"multipart/form-data"
              }
            }
            )

            console.log("response of upload image -", response?.data?.customUrl);
            const url=response?.data?.customUrl

            return url;
        
        }catch(e){
            console.log("error during upload image - ", e);
        }
        finally{
            setUploading(false);
        }
    }

    //video upload section
    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setLocalVideoUrl(URL.createObjectURL(file)); // show preview
        }
    };

    const uploadVideo = async () => {
        if (!videoFile) return;

        const formData = new FormData();
        formData.append("file", videoFile);

        setUploading(true);
        try {
            const response = await axios.post(
                `${baseurl}/api/banner/main/v1/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("response of video upload-", response);

            if(response.status === 200){
                const url = response?.data?.customUrl;
                console.log("url in stat-", url);
                setPreviewVideo(url);
                setVideoFile(null);
                console.log("inside stat------");
            }
        } catch (err) {
            console.error("error during upload video -", err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteVideo= ()=>{
        setLocalVideoUrl(null);
        setPreviewVideo(null);
    }

    //upload lottie sec.
    const [lottieFile, setLottieFile] = useState(null);

    const handleLottieChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setLottieFile(e.target.files[0]);
        }
    };

    const uploadLottie = async () => {
        if (!lottieFile) return;

        const formData = new FormData();
        formData.append("file", lottieFile);

        try {
            setUploading(true);
            const response = await axios.post(
                `${baseurl}/api/banner/main/v1/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log("Uploaded Lottie:", response);

            if(response.status === 200){
                setLottiepreview(response?.data?.customUrl)
                setAlert({open:true,severity:"success", message:"lottie file uploaded !!"})
            }
            
        } catch (e) {
            console.error("Error during upload lottie", e);
            setAlert({open:true,severity:"error", message:"upload failed / server error!!"})
        } finally {
            setUploading(false);
        }
    };
                
    const onSubmit= async(data)=>{

        console.log("expairy utc payload - ", dayjs(data.banner_expiry).utc().format("YYYY-MM-DD HH:mm:ss"))

        const payload= {
            banner_title:data.banner_title,
            is_lottie: data.type === "lottie" ? 1 : 0,
            is_video: data.type === "video" ? 1 : 0,
            is_image: data.type === "image" ? 1 : 0,
            banner_url:previewImage || previewVideo || lottiePreview || "",
            banner_expiry: data.banner_expiry
  ? dayjs(data.banner_expiry).format("YYYY-MM-DD HH:mm:ss")
  : ""

, // Format date for API
            status:data.status,

            banner_placement_id:bannerPlacementId || "",
            banner_route_id:bannerRouteId || "",
            condition_id:bannerConditionId || ""
            
        }

        console.log("payload - ", payload)

        setLoading(true); // Fixed: uncommented this line

        try{
            const response= await axios.put(`${baseurl}/api/banner/main/v1/banner/${bannerId}`,payload,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            console.log("submit response- ", response)

            if(response.status === 200){
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            }else{
                setAlert({open:true, severity:"error", message:"Error : error during submit!!"})
            }
        }catch(e){
            console.log("error during submiting- ", e)
            const message= e.response?.data?.msg // Fixed: added optional chaining
            setAlert({open:true, severity:"error", message:message || "Error : error during submit!!"})
        }finally{
            setLoading(false);
        }
    }

    //banner placement fetch
    const fetchBannerPlacements= async()=>{
        try{
            const response= await axios.get(`${baseurl}/api/banner/placement/v1/banners`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            const data= response.data?.data?.map((res)=>({
                label:res.title,
                value:res.id
              }))
              setBannerPlacements(data);

        }catch(e){
            console.log("error during fetch banner placements- ", e);
        }
    }

    //banner conditions fetch
    const fetchBannerConditions=async()=>{
        try{
            const response= await axios.get(`${baseurl}/api/banner/condition/v1/banners`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            const data= response.data?.data?.map((res)=>({
                label:res.title,
                value:res.id
              }))
            setBannerConditions(data);
            

        }catch(e){
            console.log("error during fetch banner conditions-" , e);
        }
    }

    //fetch banner routes
    const fetchBnannerRoutes= async()=>{
        try{
            const response= await axios.get(`${baseurl}/api/banner/route/v1/banners`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            const data= response.data?.data?.map((res)=>({
                label:res.title,
                value:res.id
              }))
              setBannerRoutes(data);

        }catch(e){
            console.log("error during fetch banner routes- ", e);
        }
    }

    useEffect(()=>{
        fetchBannerPlacements();
        fetchBannerConditions();
        fetchBnannerRoutes();
    },[])

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
                        <Typography variant="h5">Edit Banner</Typography>
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
                        <Grid xs={12} width="100%">
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography variant="body1" mr={2}>
                                Type:
                                </Typography>

                                <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup
                                    row
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value)} // ensure update
                                    >
                                    <FormControlLabel value="lottie" control={<Radio color="secondary" />} label="Lottie" />
                                    <FormControlLabel value="video" control={<Radio color="secondary" />} label="Video" />
                                    <FormControlLabel value="image" control={<Radio color="secondary" />} label="Image" />
                                    </RadioGroup>
                                )}
                                />
                            </Box>
                        </Grid>

{type === "image" && (
  <Box marginBottom={1}>
    {previewImage ? (
      <Avatar
        src={previewImage}
        sx={{ width: "auto", height: "auto", margin: "auto", borderRadius: "10px" }}
      />
    ) : (
      <Avatar
        sx={{
          width: "100%",
          height: 150,
          margin: "auto",
          borderRadius: "10px",
        }}
      >
        {uploading ? <CircularProgress /> : <Image32Regular color="black" />}
      </Avatar>
    )}
    <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
      <Button
        sx={{ flex: 1 }}
        component="label"
        variant="outlined"
        size="small"
        color="primary"
        startIcon={<CloudArrowUp16Regular />}
      >
        Upload Image
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageChange}
          disabled={uploading}
        />
      </Button>
      <Button
        sx={{ flex: 1 }}
        variant="outlined"
        color="error"
        size="small"
        startIcon={<Delete16Regular />}
        onClick={handleDelete}
      >
        Delete
      </Button>
    </Stack>
  </Box>
)}

{type === "video" && (
  <Box marginBottom={1}>
    {!localVideoUrl ? (
      <label
        htmlFor="upload-video"
        style={{ width: "100%", display: "block", cursor: "pointer" }}
      >
        <Box
          sx={{
            width: "100%",
            height: 200,
            borderRadius: "10px",
            backgroundColor: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Videocam sx={{ fontSize: 48, color: "#888" }} />
        </Box>
      </label>
    ) : (
      <Box
        sx={{
          width: "100%",
          borderRadius: "10px",
          backgroundColor: "#e0e0e0",
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <video src={localVideoUrl || previewVideo} width={300} controls />
      </Box>
    )}
    <input
      accept="video/*"
      id="upload-video"
      type="file"
      style={{ display: "none" }}
      onChange={handleVideoChange}
    />

    <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
      <Button
        sx={{ flex: 1 }}
        variant="outlined"
        size="small"
        color="primary"
        startIcon={<CloudArrowUp16Regular />}
        onClick={uploadVideo}
        disabled={!videoFile}
      >
        {uploading ? (
          <CircularProgress size={20} sx={{ color: "inherit" }} />
        ) : (
          "Upload Video"
        )}
      </Button>
      <Button
        sx={{ flex: 1 }}
        variant="outlined"
        color="error"
        size="small"
        startIcon={<Delete16Regular />}
        onClick={handleDeleteVideo}
      >
        Delete
      </Button>
    </Stack>
  </Box>
)}

{type === "lottie" && (
  <Box marginBottom={1}>
    {/* Hidden file input */}
    <input
      accept=".json"
      id="upload-lottie"
      type="file"
      style={{ display: "none" }}
      onChange={handleLottieChange}
      key={lottieFile ? lottieFile.name : "empty"} // 👈 ensures reset after delete
    />

    {/* Button + file name inline */}
    <Stack direction="row" alignItems="center" spacing={2} mb={2}>
      <label htmlFor="upload-lottie">
        <Button variant="outlined" component="span" size="small">
          Choose Lottie JSON
        </Button>
      </label>

      {lottieFile && (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "200px",
          }}
        >
          {lottieFile.name}
        </Typography>
      )}
    </Stack>

    {/* Action buttons */}
    <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
      <Button
        sx={{ flex: 1 }}
        variant="outlined"
        size="small"
        color="primary"
        startIcon={<CloudArrowUp16Regular />}
        onClick={uploadLottie}
        disabled={!lottieFile || uploading}
      >
        {uploading ? (
          <CircularProgress size={20} sx={{ color: "inherit" }} />
        ) : (
          "Upload Lottie"
        )}
      </Button>

      <Button
        sx={{ flex: 1 }}
        variant="outlined"
        color="error"
        size="small"
        startIcon={<Delete16Regular />}
        onClick={() => setLottieFile(null)} // 👈 reset file so new one can be picked
        disabled={!lottieFile}
      >
        Delete
      </Button>
    </Stack>
  </Box>
)}

                        <Grid container spacing={2}>
                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="banner_title"
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
                            </Grid>

                            <Grid xs={12} width={"100%"}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <Controller
                                name="banner_expiry"
                                control={control}
                                render={({ field: { value, onChange } }) => (
                                    <DateTimePicker
                                        label="Banner Expiry"
                                        value={value ? dayjs(value) : null}
                                        onChange={(newValue) => onChange(newValue)}
                                        slotProps={{
                                            textField: {
                                            size: 'small',
                                            margin: 'dense',
                                            fullWidth: true,
                                            sx: { mb: 3 },
                                            },
                                        }}
                                        />

                                )}
                                />
                                </LocalizationProvider>
                            </Grid>

                {/* banner placement dropdown */}
                <Autocomplete
                    options={bannerPlacements}
                    getOptionKey={(option) => option.value}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    value={bannerPlacements.find(option => option.value === bannerPlacementId) || null}
                    onChange={(event, selectedOption) => {
                        setBannerPlacementId(selectedOption?.value || null);
                    }}
                    sx={{ width: "100%" }}
                    renderInput={(params) => (
                        <TextField
                        {...params}
                        label="Select Banner Placement"
                        variant="outlined"
                        size="small"
                        margin="dense"
                        />
                    )}
                />

                {/* banner condtion dropdown */}
                <Autocomplete
                    options={bannerConditions}
                    getOptionKey={(option) => option.value}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    value={bannerConditions.find(option => option.value === bannerConditionId) || null}
                    onChange={(event, selectedOption) => {
                        setBannerConditionId(selectedOption?.value || null);
                    }}
                    sx={{ width: "100%" }}
                    renderInput={(params) => (
                        <TextField
                        {...params}
                        label="Select Banner Condition"
                        variant="outlined"
                        size="small"
                        margin="dense"
                        />
                    )}
                />

                {/* banner routes dropdown */}
                <Autocomplete
                    options={bannerRoutes}
                    getOptionKey={(option) => option.value}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    value={bannerRoutes.find(option => option.value === bannerRouteId) || null}
                    onChange={(event, selectedOption) => {
                        setBannerRouteId(selectedOption?.value || null);
                    }}
                    sx={{ width: "100%" }}
                    renderInput={(params) => (
                        <TextField
                        {...params}
                        label="Select Banner Route"
                        variant="outlined"
                        size="small"
                        margin="dense"
                        />
                    )}
                />

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

export default EditBanner;