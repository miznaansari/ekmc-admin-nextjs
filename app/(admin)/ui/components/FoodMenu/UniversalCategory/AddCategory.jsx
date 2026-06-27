import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Avatar,
  Switch,
  Snackbar,
  Alert,
  Paper,
  Stack,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
  DialogContent,
  Dialog,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { CloudArrowUp16Regular, Delete16Regular, Image16Regular, Image32Regular } from "@fluentui/react-icons";
import axios from "axios";
import Demo from "../../ImageCroper/Demo";
import CloseIcon from "@mui/icons-material/Close";
import DemoAi from "../../ImageCroper/DemoAi";


const AddCategory = ({ onClose, drawerClosed ,onCancel}) => {
  const [formData, setFormData] = useState({
    category_name: "",
    status: false,
    category_image_id: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem("authToken");
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
  const theme= useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(1 / 1);
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  const [generateImageOpen,setGenerateImageOpen ]=useState(false);
  const handleGenerateImageOpen= ()=>{
    setGenerateImageOpen(!generateImageOpen);
  }
  const [generateImagePrompt, setGenerateImagePrompt]=useState("");
  const [generatingImage , setGeneratingImage]=useState(false);
  const [generatedImagePreview, setGeneratedImagePreview]=useState("");

  const [imageFile, setImagefile]=useState("");
  const [finalImageUrl, setFinalImageUrl]=useState("");
  const [previewOpen, setPreviewOpen]=useState(false);
  const [alert, setAlert] = useState({
                    open: false,
                    severity: "info",
                    message: ""
                });



  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Toggle switch for status
  const handleToggleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      status: e.target.checked,
    }));
  };

  // Handle image upload and return the image ID
  const uploadImage = async () => {
    if(!imageFile){
      setAlert({open:true, severity:"error", message:"Error : Please select an image!"});
      return;
    }
    const file=imageFile;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "explore_food_category");

    try {
      const response = await axios.post(
        `${baseUrl}/api/admin/cf/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("res image - ", response)
      if(response.status === 200){
        const imageUrl=  response.data.customUrl;
        setFinalImageUrl(imageUrl);
        setAlert({open:true,severity:"success",message:"Image Uploaded!!"})

      }
    } catch (err) {
      setAlert({open:true, severity:"error", message:"Error uploading image."})
      return null;
    }
  };

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

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    // if(!finalImageUrl){
    //   setAlert({open:true, severity:"error: Please upload the image !"})
    //   return;
    // }
    try {
      const payload = {
        category_name: formData.category_name,
        status: formData.status ? 1 : 0,
        image_id:finalImageUrl ,
      };

      const response = await axios.post(
        `${baseUrl}/api/v1/universal-category`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
      setOpenSnackbar(true);
      onClose();
    } catch (err) {
      setSuccess(false);
      setError("Failed to create category.");
      setOpenSnackbar(true);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    drawerClosed();
  };
  
  const handleDelete = () => {
    setPreviewImage(null);
    setFormData((prevState) => ({
      ...prevState,
      category_image_id: "",
    }));
  };

  //generate image

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
    setPreviewImage(generatedImageUrlForPreview)

    setGeneratedImagePreview(file)

    }catch(e){
      console.log("error during generate image-", e);
    }finally{
      setGeneratingImage(false);
    }
  }
  
  
  return (
    <Box sx={{ height: isMobileScreen ? "94vh":'100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Header */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 999, 
        bgcolor: "#F7F7F7", 
        p: 1,
        borderBottom: '1px solid #eee'
      }}>
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Add Category</Typography>
            <IconButton onClick={onCancel}>
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      </Box>
      {/* Scrollable Content */}
      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{ 
          flex: 1,
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 1,
          // Add padding bottom to ensure content doesn't get hidden behind buttons
          paddingBottom: '80px' // Adjust based on your button height
        }}>
          <Paper sx={{ p: 2 }}>
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
            {/* Image Upload Section */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <label htmlFor="upload-image">
                {previewImage ? (
                  <Avatar
                    src={previewImage}
                    sx={{
                      width: 'auto',

                      height: 'auto',
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
                    {uploading ? <CircularProgress /> : <Image32Regular />}
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
                  disabled={!previewImage}
                >
                  Delete
                </Button>
              </Stack>
            </Box>

            {/* Form Fields Section */}
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Category Name"
                  name="category_name"
                  value={formData.category_name}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid size={12}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body1" mr={2}>
                    Status:
                  </Typography>
                  <Switch
                    checked={formData.status}
                    onChange={handleToggleChange}
                    color="secondary"
                  />
                  <Typography variant="body2">
                    {formData.status ? "Active" : "Inactive"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        
        {/* Fixed Action Buttons */}
        <Box 
          sx={{ 
            position: 'sticky',
            bottom: 0,
            p: 2, 
            borderTop: '1px solid #eee', 
            bgcolor: "#F7F7F7",
            display: 'flex', 
            gap: 1,
            zIndex: 999
          }}
        >
          <Button 
            variant="outlined" 
            color="error" 
            sx={{ flex: 1 }} 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            sx={{ flex: 1 }} 
            variant="contained" 
            disabled={uploading || !formData.category_name }
          >
            {uploading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
          </Button>
        </Box>
      </Box>
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
};

export default AddCategory;