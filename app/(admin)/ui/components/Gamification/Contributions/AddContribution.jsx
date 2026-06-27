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
    DialogContent} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Close, Videocam } from "@mui/icons-material";
import { CloudArrowUp16Regular, Delete16Regular, Image16Regular, Image32Regular } from "@fluentui/react-icons";
import Demo from "../../ImageCroper/Demo";
import DemoAi from "../../ImageCroper/DemoAi";
import CloseIcon from "@mui/icons-material/Close";

const AddContribution= ({onSuccess, onCancel})=>{
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
            title: "",
            system_title: "",
            eatcoins_offered: "",
            status: 0,
            description: "",
            notes: "",
            image_required: "" // Add this field to track image requirement
        }
    });
    
    const baseurl= process.env.VITE_REACT_APP_BACKEND_URL;
    const token= localStorage.getItem("authToken");
    const [previewVideo, setPreviewVideo]=useState(null);
    const [uploading, setUploading] = useState(false);
    const [searchCafequery, setSearchCafequery]=useState("");
    const [cafes, setCafes]=useState([]);
    const [loading, setLoading]=useState(false);
    const [taggedUsers, setTaggedusers]= useState([]);
    const [searchTagusers, setSearchTagUsers]=useState("");
    const [hashtags, setHashtags] = useState([]);
    const theme= useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [previewImage ,setPreviewImage]=useState('');

    const [selectedImage, setSelectedImage] = useState(null);
    const [openCropDialog, setOpenCropDialog] = useState(false);
    const [aspectRatio] = useState(1 / 1);
    
    // Image validation error state
    const [imageError, setImageError] = useState('');
    
    const handleCropClose = () => {
        setOpenCropDialog(false);
        setSelectedImage(null);
    };
    
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });

    //new
    const [generateImageOpen,setGenerateImageOpen ]=useState(false);
    const handleGenerateImageOpen= ()=>{
        setGenerateImageOpen(!generateImageOpen);
    }
    const [generateImagePrompt, setGenerateImagePrompt]=useState("");
    const [generatingImage , setGeneratingImage]=useState(false);
    const [generatedImagePreview, setGeneratedImagePreview]=useState("");  
    const [imageFile, setImagefile]=useState("");
    const [finalImageUrl, setFinalImageUrl]=useState(null);
    const [previewOpen, setPreviewOpen]=useState(false);
    

    // Clear image error when image is uploaded
    useEffect(() => {
        if (previewImage) {
            setImageError('');
            clearErrors('image_required');
        }
    }, [previewImage, clearErrors]);

    //Upload Image 
    const uploadImage= async()=>{
        if(!imageFile){
            setAlert({open:true, severity:"error", message:"Error: Please select an image !"})
            return
        }
        const file=imageFile
        const formData= new FormData();
        formData.append("file",file)
        formData.append("uploadType","milestone")
        console.log("file is:",file)
        
        try{
            setUploading(true)
            const response= await axios.post(`${baseurl}/api/admin/cf/v1/upload`,
                formData,
                {
                    headers:{
                        Authorization:`Bearer ${token}`,
                        "Content-Type":"multipart/form-data"
                    }
                }
            )
            const imageUrl = response.data?.customUrl;
            console.log("Uploaded image URL:", imageUrl);
            if(response.status === 200){
                const imageUrl = response.data?.customUrl;
                setFinalImageUrl(null);
                setFinalImageUrl(imageUrl);
                setAlert({open:true, severity:"success", message:"Image Uploaded"})
            }
            // Clear any previous image errors
            setImageError('');
            clearErrors('image_required');

        }catch(e){
            console.log("error during uploading image:",e);
            setAlert({open:true, severity:"error", message:"Error: Image upload failed / server error"})
        }finally{
            setUploading(false)
        }
    }

    // Handle image change and preview
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploading(true);
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setOpenCropDialog(true);
            setUploading(false);
        }
    };
    
    const handleDelete =()=>{
        setPreviewImage('');
        setImageError('Image is required');
        setError('image_required', { 
            type: 'manual', 
            message: 'Image is required' 
        });
    }

    // Validate image before form submission
    const validateImage = () => {
        if (!previewImage) {
            setImageError('Image is required');
            setError('image_required', { 
                type: 'manual', 
                message: 'Image is required' 
            });
            setAlert({
                open: true, 
                severity: "error", 
                message: "Please upload an image before saving"
            });
            return false;
        }
        return true;
    };

    // onsubmit form
    const onSubmit= async(data)=>{
        // Validate image first
        if (!validateImage()) {
            return;
        }

        if(!finalImageUrl && imageFile){
            setAlert({open:true, severity:"error", message:"Error: You have an unuploaded image ,  upload first!"})
            return;
        }

        const payload= {
            ...data,
            ma_contribution_original_banner_url: finalImageUrl || ""
        }

        console.log("payload - ", payload)
        setLoading(true);

        try{
            const response= await axios.post(`${baseurl}/api/contribution/v1/contribution`,payload,  {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            console.log("submit contr. response- ", response)
            if(response.status === 201){
                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            }else{
                setAlert({open:true, severity:"error", message:"Error : error during submit!!"})
            }
        }catch(e){
            console.log("error during submiting- ", e)
            setAlert({open:true, severity:"error", message:"Error : error during submit!!"})
        }finally{
            setLoading(false);
        }
    }

    //ai image generate 
    const base64ToFile = (base64Data, fileName, mimeType) => {
        const byteString = atob(base64Data); // decode base64 string
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new File([ab], fileName, { type: mimeType });
    };

    const generateImage =async()=>{
        try{
            setGeneratingImage(true)
            const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-preview-06-06:predict?key=${process.env.VITE_GEMINI_KEY}`,
            {
                instances: [
                {
                    prompt:generateImagePrompt
                },
                ],
                parameters: {
                outputMimeType: "image/jpeg",
                sampleCount: 1,
                personGeneration: "ALLOW_ADULT",
                aspectRatio: "1:1",
                },
            },
            {
                headers: {
                "Content-Type": "application/json",
                },
            }
            );
        
            console.log("resoonse image generate- ", response)
            const { bytesBase64Encoded, mimeType } = response.data.predictions[0];
            const file = base64ToFile(bytesBase64Encoded, "generated.png", mimeType);
            setImagefile(file);
            const generatedImageUrlForPreview= URL.createObjectURL(file);
            setPreviewImage(null)
            setPreviewImage(generatedImageUrlForPreview)
        
            setGeneratedImagePreview(file)
    
        }catch(e){
            console.log("error during generate image-", e);
            setAlert({open:true, severity:"error",message:"Error: Filed / server error / daily quota exceed!"})
        }finally{
            setGeneratingImage(false);
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
                        <Box sx={{ textAlign: "center", mb: 2 }}>
                            {/* ai generate image section */}
                            <Box marginBottom={1}>
                                {generateImageOpen ? 
                                <Box> 
                                    <TextField
                                        fullWidth
                                        placeholder="Write your prompt to generate image..."
                                        name="category_name"
                                        variant="outlined"
                                        size="small"
                                        multiline
                                        rows={3}
                                        value={generateImagePrompt}
                                        onChange={(e) => setGenerateImagePrompt(e.target.value)}
                                    />
                                    <Box 
                                    sx={{ 
                                        bottom: 0,
                                        p: 2, 
                                        borderTop: '1px solid #eee', 
                                        display: 'flex', 
                                        gap: 1,
                                        zIndex: 999
                                    }}
                                    >
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        sx={{ flex: 1 }} 
                                        onClick={() => {
                                        setGenerateImageOpen(false)
                                        setGenerateImagePrompt("")
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        sx={{ flex: 1 }} 
                                        variant="contained" 
                                        onClick={generateImage}
                                        disabled={generatingImage}
                                    >
                                        {generatingImage? <CircularProgress size={20} />: "Generate Image"}
                                    </Button>
                                    </Box>
                                </Box>:
                                <Grid container spacing={3}>
                                    <Grid size={12}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={()=> handleGenerateImageOpen()}
                                    >Generate Image By AI</Button>
                                    </Grid>
                                </Grid>
                                }
                            </Box>
                            {/* Image Upload Section with Error Handling */}
                            {/* <Box
                                sx={{
                                    borderRadius: "10px",
                                    backgroundColor: imageError ? "#ffebee" : "#e0e0e0",
                                    border: imageError ? "2px solid #f44336" : "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    mb: 1,
                                    overflow: "auto",
                                }}
                            >
                                {previewImage ? (
                                    <Avatar 
                                        src={previewImage} 
                                        sx={{ 
                                            width: '100%', 
                                            height: 150, 
                                            margin: 'auto', 
                                            borderRadius: '10px' 
                                        }} 
                                    />
                                ) : (
                                    <Avatar sx={{ 
                                        width: '100%', 
                                        height: 150, 
                                        margin: 'auto', 
                                        borderRadius: '10px',
                                        backgroundColor: imageError ? "#ffebee" : "#e0e0e0"
                                    }}>
                                        {uploading ? <CircularProgress/>:<Image32Regular color={imageError ? "#f44336" : "black"} />}
                                    </Avatar>
                                )}
                            </Box> */}

                            <label htmlFor="upload-image">
                                {previewImage ? (
                                    <Avatar
                                        src={previewImage}
                                        sx={{
                                            width: 'auto',        
                                            height: 'auto',
                                            maxHeight: 150,
                                            margin: 'auto',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                        }}
                                    />
                                    ) : (
                                    <Avatar
                                        sx={{
                                            width: '100%',
                                            height: 150,
                                            margin: 'auto',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                    {   uploading ? <CircularProgress /> : <Image32Regular />}
                                    </Avatar>
                                )}
                                <input
                                    id="upload-image"
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleImageChange}
                                    disabled={uploading}
                                />
                            </label>
                            
                            {/* Error message for image */}
                            {imageError && (
                                <Typography 
                                    variant="caption" 
                                    color="error" 
                                    sx={{ display: 'block', mb: 1 }}
                                >
                                    {imageError}
                                </Typography>
                            )}
                            
                            {/* Required indicator */}
                            <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ mb: 2 }}
                            >
                            </Typography>
                            
                            <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                                <Button
                                    sx={{ flex: 1 }}
                                    component="label"
                                    variant="outlined"
                                    size="small"
                                    color={imageError ? "error" : "primary"}
                                    startIcon={<CloudArrowUp16Regular />}
                                    onClick={uploadImage}    
                                >
                                    {uploading ? <CircularProgress /> : "Upload Image"}
                                </Button>
                                <Button
                                    sx={{ flex: 1 }}
                                    variant="outlined"
                                    color="secondary"
                                    size="small"
                                    startIcon={<Image16Regular />}
                                    onClick={() => setPreviewOpen(true)}
                                    disabled={!previewImage}
                                >
                                    View
                                </Button>
                                <Button
                                    sx={{ flex: 1 }}
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<Delete16Regular />}
                                    onClick={handleDelete}
                                    disabled={!previewImage}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </Box>

                        <Grid container spacing={2}>
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
                                            required
                                            error={!!errors.description}
                                            helperText={errors.description?.message}
                                        />
                                    )}
                                />
                            </Grid>

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
                                            error={!!errors.notes}
                                            helperText={errors.notes?.message}
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
            {/* Crop Dialog */}
            <DemoAi
                selectedImage={selectedImage}
                open={openCropDialog}
                onClose={handleCropClose}
                aspect={aspectRatio}
                setSelectedImage={setSelectedImage}
                setOpenCropDialog={setOpenCropDialog}
                onCropCompleteImage={(croppedFile) => {
                    setImagefile(croppedFile); // save for later upload
                    setPreviewImage(URL.createObjectURL(croppedFile));
                    console.log("image file in add cats demo- ", croppedFile);
                    console.log("image url in add cats demo-=", URL.createObjectURL(croppedFile))
                }}
            />
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
            {/* view image */}
            <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
                <IconButton
                    onClick={() => setPreviewOpen(false)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        zIndex: 1,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ textAlign: 'center', p: 2 }}>
                    {previewImage && (
                        <img
                            src={previewImage}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                borderRadius: '10px',
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default AddContribution;