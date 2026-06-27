import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { CloudArrowUp16Regular, Delete16Regular, Image16Regular, Image32Regular } from '@fluentui/react-icons';
import axios from 'axios';
import Demo from '../../ImageCroper/Demo';
import CloseIcon from "@mui/icons-material/Close";
import DemoAi from '../../ImageCroper/DemoAi';


const EditCategory = ({ handleClose, selectedCategory, onUpload, onClose }) => {
  const [categoryName, setCategoryName] = useState('');
  const [status, setStatus] = useState(false);
  const [imageId, setImageId] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isTopCategory, setIsTopCategory] = useState(false);
  
  // New state for discard modal and tracking changes
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [formSaved, setFormSaved] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(1 / 1);
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };
  
  const token = localStorage.getItem('authToken');
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
  const imageDeliveryUrl = process.env.VITE_REACT_APP_IMAGE_DELIVERY_URL;
  const theme= useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  //new 
  const [generateImageOpen,setGenerateImageOpen ]=useState(false);
  const handleGenerateImageOpen= ()=>{
    setGenerateImageOpen(!generateImageOpen);
  }
  const [generateImagePrompt, setGenerateImagePrompt]=useState("");
  const [generatingImage , setGeneratingImage]=useState(false);
  const [generatedImagePreview, setGeneratedImagePreview]=useState("");  
  const [imageFile, setImagefile]=useState(null);
  const [finalImageUrl, setFinalImageUrl]=useState(null);
  const [previewOpen, setPreviewOpen]=useState(false);
  const [alert, setAlert] = useState({
                              open: false,
                              severity: "info",
                              message: ""
                            });
  
  const [imageIsUploading ,setImageIsUploading]=useState(false);

  

  useEffect(() => {
    if (selectedCategory) {
      const categoryData = {
        categoryName: selectedCategory.category_name || '',
        status: selectedCategory.status === 1,
        imageId: selectedCategory.image_id || '',
        isTopCategory: selectedCategory.is_top_category === 1,
        previewImage: selectedCategory.uc_azure_original_image_url || '',
      };

      setCategoryName(categoryData.categoryName);
      setStatus(categoryData.status);
      setImageId(categoryData.uc_azure_original_image_url);
      setIsTopCategory(categoryData.isTopCategory);
      setPreviewImage(categoryData.previewImage);

      // Store initial form data for comparison
      setInitialFormData(categoryData);
    }
  }, [selectedCategory]);

  // Check for changes in form fields
  useEffect(() => {
    if (initialFormData && !formSaved) {
      const currentData = {
        categoryName,
        status,
        imageId,
        isTopCategory,
        previewImage,
      };

      const hasChanges = JSON.stringify(currentData) !== JSON.stringify(initialFormData);
      setHasUnsavedChanges(hasChanges);
    }
  }, [categoryName, status, imageId, isTopCategory, previewImage, initialFormData, formSaved]);

  // Handle image upload and return the image ID
  const uploadImage = async () => {
    if(!imageFile){
      setAlert({open:true,severity:"error",message:"Error: Please select an image to upload!"});
      return;
    }

    const file=imageFile;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', "explore_food_category");

    try {
      setImageIsUploading(true);
      const response = await axios.post(`${baseUrl}/api/admin/cf/v1/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const imageUrl= response.data.customUrl;
      // setPreviewImage(imageUrl);
      setFinalImageUrl(imageUrl);
      if(response.status === 200){
        setAlert({open:true, severity:"success",message:"Image uploaded"});
      }

    } catch (err) {
      setAlert({open:true, severity:"error",message:"Error: image upload faild!!"})
      return null;
    }finally{
      setImageIsUploading(false);
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

  // Handle save
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    console.log("image id in handle save -", imageId)

    if(!finalImageUrl && imageFile){
      setAlert({open:true,severity:"error",message:"error:you have unuploaded image !"})
      return
    }

    try {
      const payload = {
        category_name: categoryName,
        status: status ? 1 : 0,
        is_top_category: isTopCategory ? 1 : 0,
        image_id: finalImageUrl || imageId ,
      };
  
      const response = await axios.put(
        `${baseUrl}/api/v1/universal-category/${selectedCategory.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.status === 200) {
        setFormSaved(true); // Mark form as saved
        setHasUnsavedChanges(false); // Clear unsaved changes flag
        setSuccess(true);
        setError(null);
        setOpenSnackbar(true);
        handleClose();
      }
    } catch (err) {
      setSuccess(false);
      setError('Failed to update category.');
      setOpenSnackbar(true);
    }
  };

  // Handle delete image
  const handleDelete = () => {
    setPreviewImage(null);
    setImageId('');
  };

  // Handle close with discard check
  const handleCloseWithCheck = () => {
    if (hasUnsavedChanges && !formSaved) {
      setShowDiscardModal(true);
    } else {
      if (onClose && typeof onClose === "function") {
        onClose();
      }
    }
  };

  // Handle discard confirmation
  const handleDiscardConfirm = () => {
    setShowDiscardModal(false);
    setHasUnsavedChanges(false);
    if (onClose && typeof onClose === "function") {
      onClose();
    }
  };

  const handleDiscardCancel = () => {
    setShowDiscardModal(false);
  };

  //generate image by ai

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
  
      //setGeneratedImagePreview(file)
      // const imageUrl = await uploadImage(file);
      // if (imageUrl) {
      //   setPreviewImage(imageUrl);
      // }
  
      }catch(e){
        console.log("error during generate image-", e);
      }finally{
        setGeneratingImage(false);
      }
    }
  
  return (
    <Box sx={{ height:isMobileScreen ?"94vh": '100vh', display: 'flex', flexDirection: 'column' }}>
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
            <Typography variant="h5">Edit Category</Typography>
            <IconButton onClick={handleCloseWithCheck}>
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      </Box>
      {/* Scrollable Content */}
      <Box 
        component="form" 
        onSubmit={handleSaveCategory}
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
              {/* {previewImage ? (
                <Avatar 
                  src={previewImage} 
                  sx={{ 
                    width: 'auto', 
                    height: 'auto', 
                    maxHeight: 150,
                    margin: 'auto', 
                    borderRadius: '10px' 
                  }} 
                />
              ) : (
                <Avatar sx={{ 
                  width: '100%', 
                  height: 150, 
                  margin: 'auto', 
                  borderRadius: '10px' 
                }}>
                  {uploading ? <CircularProgress/> : <Image32Regular />}
                </Avatar>
              )} */}
              <label htmlFor="upload-image">
                {previewImage ? (
                  <Avatar
                    src={ previewImage}
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
                  {imageIsUploading ? <CircularProgress size={20}/> : "Upload Image"}
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
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  variant="outlined"
                  size='small'
                />
              </Grid>

              <Grid size={12}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body1" mr={2}>
                    Status:
                  </Typography>
                  <Switch
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    color="secondary"
                  />
                  <Typography variant="body2">
                    {status ? 'Active' : 'Inactive'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid size={12}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body1" mr={2}>
                    Top Category:
                  </Typography>
                  <Switch
                    checked={isTopCategory}
                    onChange={(e) => setIsTopCategory(e.target.checked)}
                    color="secondary"
                  />
                  <Typography variant="body2">
                    {isTopCategory ? 'Yes' : 'No'}
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
            onClick={handleCloseWithCheck}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            sx={{ flex: 1 }} 
            variant="contained" 
            disabled={uploading || !categoryName.trim()}
          >
            {uploading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
          </Button>
        </Box>
      </Box>
      {/* Discard Changes Modal */}
      <Dialog open={showDiscardModal} onClose={handleDiscardCancel}>
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to discard them?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiscardCancel} color="primary">
            No
          </Button>
          <Button onClick={handleDiscardConfirm} color="error" variant="contained">
            Yes
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
          <CloseIcon/>
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
export default EditCategory;