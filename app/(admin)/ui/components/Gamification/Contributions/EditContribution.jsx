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
import { CloudArrowUp16Regular, Delete16Regular, Image16Regular, Image32Regular } from "@fluentui/react-icons";
import Demo from "../../ImageCroper/Demo";
import DemoAi from "../../ImageCroper/DemoAi";
import CloseIcon from "@mui/icons-material/Close";


const EditContribution= ({onSuccess, onCancel, id, onDelete})=>{
    console.log("id in edit contr - ", id)
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },}= useForm({
            defaultValues:{
                title: "",
                system_title: "",
                eatcoins_offered: "",
                status: 0,
                description: "",
                notes: ""
            }
        });
    const baseurl= process.env.VITE_REACT_APP_BACKEND_URL;
    const token= localStorage.getItem("authToken");
    const [previewVideo, setPreviewVideo]=useState(null);
    const [uploading, setUploading] = useState(false); // Track upload state
    const [searchCafequery, setSearchCafequery]=useState("");
    const [cafes, setCafes]=useState([]);
    const [loading, setLoading]=useState(false);
    const [taggedUsers, setTaggedusers]= useState([]);
    const [searchTagusers, setSearchTagUsers]=useState("");
    const [hashtags, setHashtags] = useState([]);
    const theme= useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [previewImage ,setPreviewImage]=useState('');

    const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
    const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
    const [aspectRatio] = useState(1 / 1);

    // State for tracking form changes and discard dialog
    const [initialFormData, setInitialFormData] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [initialPreviewImage, setInitialPreviewImage] = useState('');

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
    const [originalImageUrl, setOriginalImageUrl]=useState(null);

    // Watch form values for changes
    const watchedValues = watch();

    // Check for changes whenever form values change
    useEffect(() => {
        if (Object.keys(initialFormData).length > 0) {
            const hasFormChanges = Object.keys(initialFormData).some(key => {
                return initialFormData[key] !== watchedValues[key];
            });
            
            const hasImageChanges = initialPreviewImage !== previewImage;
            
            setHasUnsavedChanges(hasFormChanges || hasImageChanges);
        }
    }, [watchedValues, previewImage, initialFormData, initialPreviewImage]);

  //fetch contribution
  const fetchContribution = async () => {
  try {
    const response = await axios.get(`${baseurl}/api/contribution/v1/contribution`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        contribution_id: id
      }
    });
    
    console.log("response in edit contr- ", response.data?.data?.data[0]);
    const data = response.data?.data?.data[0];

    console.log("title- ", data.title);
    console.log("system title- ", data.system_title);        
    console.log("image url-- ", data.ma_contribution_original_banner_url);

    const formData = {
        description: data.description || '',
        eatcoins_offered: data.eatcoins_offered || '',
        notes: data.notes || '',
        status: data.status || 0,
        system_title: data.system_title || '',
        title: data.title || ''
    };

    // Set form values
    Object.keys(formData).forEach(key => {
        setValue(key, formData[key]);
    });

    // Store initial form data and image for comparison
    setInitialFormData(formData);
    setPreviewImage(data.ma_contribution_original_banner_url || '');
    setOriginalImageUrl(data.ma_contribution_original_banner_url)
    setInitialPreviewImage(data.ma_contribution_original_banner_url || '');

  } catch (e) {
    console.log("error during fetch contribution- ", e);
  }
};

  useEffect(()=>{
    fetchContribution();
  }, [id])


  //Upload Image 
  const uploadImage= async()=>{
    if(!imageFile){
        setAlert({open:true, severity:"error", message:"Error: Please select an image!"})
        return;
    }
    const file= imageFile;
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
      //setUrl(imageUrl);
    //   setPreviewImage(imageUrl)
      if(response.status === 200){
        setFinalImageUrl(null)
        const imageUrl = response.data?.imageUrl;
        setFinalImageUrl(imageUrl);
        setAlert({open:true, severity:"success", message:"Image Uploaded!"})
      }
    }catch(e){
      console.log("error during uploading image:",e);
      setAlert({open:true, severity:"error", message:"Error: Image Upload failed!"})
      
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
    setFinalImageUrl(null)
    setOriginalImageUrl(null)
  }

  // Handle cancel/close with confirmation
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      if (typeof onCancel === 'function') {
        onCancel();
      }
    }
  };

  // Handle discard confirmation
  const handleDiscardChanges = () => {
    setShowDiscardDialog(false);
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const handleKeepEditing = () => {
    setShowDiscardDialog(false);
  };

  // onsubmit form
  const onSubmit= async(data)=>{
    if(!finalImageUrl && imageFile){
        setAlert({open:true, severity:"error", message:"Error: you have an unuploaded image ,  upload first!"})
        return;
    }
    const payload= {
        ...data,
        ma_contribution_original_banner_url:finalImageUrl || originalImageUrl || ""
    }

    console.log("payload - ", payload)

        try{
            const response= await axios.put(`${baseurl}/api/contribution/v1/contribution/${id}`,payload,  {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })

            console.log("submit contr. response- ", response)
            if(response.status === 200){
                // Reset the unsaved changes flag after successful save
                setHasUnsavedChanges(false);
                if (typeof onDelete === 'function') {
                onDelete();
            }
            }else{
                setAlert({open:true, severity:"error", message:"Error: error during updatigng contribution!!"})
            }
        }catch(e){
            console.log("error during submiting- ", e)
            setAlert({open:true, severity:"error", message:"Error: error during updatigng contribution!!"})
        }
    }


      //delete contribution
      const handleDeleteContribution= async()=>{
        try{
            const response= await axios.delete(`${baseurl}/api/contribution/v1/contribution/${id}`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            console.log("contribution delete response- ", response);
            if(response.status===200){
                if (typeof onSuccess === 'function') {
                onSuccess();
            }
            }else{
                setAlert({open:true, severity:"error", message:"Error: failed deleting contribution!!"})
            }
        }catch(e){
            console.log("error during delete contribution- ", e);
            setAlert({open:true, severity:"error", message:"Error: failed deleting contribution!!"})
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
            overflow: 'hidden' // Prevent body overflow
          }}
        >
            {/* Header - Fixed */}
            <Box 
              sx={{ 
                bgcolor: "#F7F7F7", 
                p: 1,
                flexShrink: 0, // Don't allow header to shrink
                zIndex: 999
              }}
            >
                <Paper sx={{ padding: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5">Edit Contribution</Typography>
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
                overflow: 'hidden' // Prevent overflow here too
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
                      pb: 1 // Add some bottom padding
                    }}>
                        <Box textAlign="center" mb={2}>
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
                            {/* image upload */}
                            {/* <Box
                                sx={{
                                //width: "100%",
                                //height: previewVideo ? "auto" : 200,
                                borderRadius: "10px",
                                backgroundColor: "#e0e0e0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 2,
                                overflow: "auto",
                                }}
                            >
                                {previewImage ? (
                                    <Avatar src={previewImage} sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }} />
                                    ) : (
                                    <Avatar sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }}>
                                    {uploading ? <CircularProgress/>:<Image32Regular color="black" />}
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
                            <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                                <Button
                                    sx={{ flex: 1 }}
                                    component="label"
                                    variant="outlined"
                                    size="small"
                                    color="primary"
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
                                <Controller
                                    control={control}
                                    name="system_title"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="System Title"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="eatcoins_offered"
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
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Description"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid xs={12} width={"100%"}>
                                <Controller
                                    control={control}
                                    name="notes"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Internal Note"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid xs={12} width={"100%"}>
                                <Box display="flex" alignItems="center">
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
                      flexShrink: 0 // Don't allow footer to shrink
                    }}>
                        <Stack direction="row" spacing={1}>
                            <Button 
                                variant="outlined" 
                                color='error' 
                                sx={{ flex: 1 }} 
                                onClick={handleDeleteContribution}
                            >
                                Delete
                            </Button>
                            <Button 
                                type="submit" 
                                sx={{ flex: 1 }} 
                                variant="contained"
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
                onClose={handleKeepEditing}
                aria-labelledby="discard-dialog-title"
                aria-describedby="discard-dialog-description"
            >
                <DialogTitle id="discard-dialog-title">
                    Discard Changes?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="discard-dialog-description">
                        You have unsaved changes that will be lost if you continue. Are you sure you want to discard your changes?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleKeepEditing} color="primary">
                        Keep Editing
                    </Button>
                    <Button onClick={handleDiscardChanges} color="error" variant="contained">
                        Discard Changes
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Crop Dialog */}
            <DemoAi
                selectedImage={selectedImage}
                open={openCropDialog}
                onClose={handleCropClose}
                aspect={aspectRatio} // Square aspect ratio, adjust as needed
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

export default EditContribution;