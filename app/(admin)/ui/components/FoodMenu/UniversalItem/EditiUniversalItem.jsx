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
  IconButton,
  Stack,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import { Close } from '@mui/icons-material';
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from '@fluentui/react-icons';
import Demo from '../../ImageCroper/Demo';

const EditUniversalItem = ({ itemId, selectedItem, onCancel, onSuccess }) => {
  const [itemName, setItemName] = useState('');
  const [status, setStatus] = useState(false);
  const [imageId, setImageId] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageName, setImageName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Track initial values and changes
  const [initialValues, setInitialValues] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [itemSaved, setItemSaved] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(4 / 3);
  
  const token = localStorage.getItem('authToken');
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL 
  const imageDeliveryUrl = process.env.VITE_REACT_APP_IMAGE_DELIVERY_URL;
  const theme= useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Populate form fields with initial data
  useEffect(() => {
    if (selectedItem) {
      const initialItemName = selectedItem.item_name;
      const initialStatus = selectedItem.status === 1;
      const initialImageId = selectedItem.image_id;
      const initialPreviewImage = selectedItem.universal_item_auzre_original_image_url ? selectedItem.universal_item_auzre_original_image_url : null;
      
      setItemName(initialItemName);
      setStatus(initialStatus);
      setImageId(initialImageId);
      setPreviewImage(initialPreviewImage);
      setImageName(initialImageId ? `image_${initialImageId}.jpg` : 'No image uploaded');
      
      // Store initial values for comparison
      setInitialValues({
        itemName: initialItemName,
        status: initialStatus,
        imageId: initialImageId,
        previewImage: initialPreviewImage,
      });
    }
  }, [selectedItem, imageDeliveryUrl]);

  // Check for unsaved changes
  useEffect(() => {
    if (Object.keys(initialValues).length > 0 && !itemSaved) {
      const hasChanges = 
        itemName !== initialValues.itemName ||
        status !== initialValues.status ||
        imageId !== initialValues.imageId ||
        previewImage !== initialValues.previewImage;
      
      setHasUnsavedChanges(hasChanges);
    }
  }, [itemName, status, imageId, previewImage, initialValues, itemSaved]);

  // Handle image upload and return the image ID
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append("uploadType","explore_food_category")
    console.log("form data:", formData)

    try {
      const response = await axios.post(`${baseUrl}/api/admin/cf/v1/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("image  upload response =",response)
      const imageUrl= response.data.customUrl;
      setPreviewImage(imageUrl);
    } catch (err) {
      setError('Error uploading image. Please try again.');
      setOpenSnackbar(true);
      return null;
    }
  };

  // Handle image change and preview
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("file:", file)
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOpenCropDialog(true);

    }
  };

  // Handle save
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemId) {
      setError('Item ID is missing.');
      return;
    }

    const payload = {
      item_name: itemName,
      status: status ? 1 : 0,
      image_id: previewImage || "",
    };
    console.log("payload of save item- ", payload)

    try {
      const response = await axios.put(`${baseUrl}/api/v1/universal-item/${itemId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("response= ", response)
      if (response.status === 200 ) {
        setItemSaved(true);
        setHasUnsavedChanges(false);
        onSuccess();
      } else {
        setError(response.data.msg || 'Failed to update item.');
        setOpenSnackbar(true);
      }
    } catch (err) {
      setError('Error updating item. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleDelete = () => {
    setPreviewImage(null);
    setImageId('');
  }

  // Handle cancel/close with discard confirmation
  const handleCancel = () => {
    if (hasUnsavedChanges && !itemSaved) {
      setShowDiscardModal(true);
    } else {
      onCancel();
    }
  };

  // Confirm discard changes
  const handleDiscardConfirm = () => {
    setShowDiscardModal(false);
    onCancel();
  };

  // Cancel discard (stay on form)
  const handleDiscardCancel = () => {
    setShowDiscardModal(false);
  };

  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  return (
    <Box sx={{height:isMobileScreen ? "94vh":"100vh"}}>
      <Box position="sticky" top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Edit Item</Typography>
            <IconButton onClick={handleCancel}>
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      </Box>
      <Box 
        sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', p: 1 }} component="form" 
            onSubmit={handleSaveItem}
      >
        <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ flexGrow: 1, overflowY: 'auto', px: 2, pt: 2 }}>
            {/* Image Upload Section */}
              <Box sx={{ textAlign: "center", mb: 2 }}>
                            {previewImage ? (
                              <Avatar src={previewImage} sx={{ width: 'auto', height: "auto",maxHeight: 150, margin: 'auto', borderRadius: '10px' }} />
                              ) : (
                              <Avatar sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }}>
                                {uploading ? <CircularProgress/> : <Image32Regular />}
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
                                  disabled={uploading} // Disable while uploading
                                />
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
              <Grid
                size={{
                  xs: 12,
                  md: 12
                }}>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Item Name"
                      name="item_name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                      variant="outlined"
                      size='small'
                    />
                  </Grid>

                  <Grid size={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
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
                </Grid>
              </Grid>

            {/* Action Buttons */}
            <Box 
              sx={{ 
                p: 2, 
                borderTop: '1px solid #eee', 
                bgcolor: "#F7F7F7",
                display: 'flex', 
                gap: 1 
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
                disabled={uploading }
              >
                {uploading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
              </Button>
            </Box>
          </Paper>
        </Paper>
      </Box>
      {/* Discard Changes Confirmation Modal */}
      <Dialog
        open={showDiscardModal}
        onClose={handleDiscardCancel}
        aria-labelledby="discard-dialog-title"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="discard-dialog-title">
          Discard Changes?
        </DialogTitle>
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
            Yes, Discard
          </Button>
        </DialogActions>
      </Dialog>
      {/* Crop Dialog */}
      <Demo
        selectedImage={selectedImage}
        open={openCropDialog}
        onClose={handleCropClose}
        uploadImage={uploadImage}
        aspect={aspectRatio} // Square aspect ratio, adjust as needed
        setSelectedImage={setSelectedImage}
        setOpenCropDialog={setOpenCropDialog}
      />
      {/* Snackbar for Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {success ? (
          <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
            Item updated successfully!
          </Alert>
        ) : (
          <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
            {error || 'Failed to update item.'}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default EditUniversalItem;