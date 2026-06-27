import React, { useState } from 'react';
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
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';
import { Close } from '@mui/icons-material';
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from '@fluentui/react-icons';
import Demo from '../../ImageCroper/Demo'; // Import your crop component

const AddUniversalItem = ({ handleClose, onCancel }) => {
  const [formData, setFormData] = useState({
    item_name: '',
    status: false,
    image_id: '',
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);  
  const [uploading, setUploading] = useState(false);
  const [aspectRatio] = useState(4 / 3);
  
  const token = localStorage.getItem('authToken');
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
  const uploadImage = async (file) => {
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('uploadType', "cafe_menu_item");

    try {
      const response = await axios.post(`${baseUrl}/api/admin/cf/v1/upload`, formDataUpload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const imageUrl = response.data.customUrl;
      setPreviewImage(imageUrl);
      setFormData((prevState) => ({
        ...prevState,
        image_id: imageUrl,
      }));
      
      setUploading(false);
      setError(null);
      return imageUrl;
    } catch (err) {
      setUploading(false);
      setError('Error uploading image. Please try again.');
      setOpenSnackbar(true);
      return null;
    }
  };

  // Handle initial image selection (before crop)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create URL for the selected image to show in crop dialog
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOpenCropDialog(true);
    }
  };

  // Handle crop dialog close
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  
  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        item_name: formData.item_name,
        status: formData.status ? 1 : 0,
        image_id: formData.image_id,
      };

      const response = await axios.post(`${baseUrl}/api/v1/universal-item`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setSuccess(true);
        setError(null);
        setOpenSnackbar(true);
       
        setTimeout(() => {
          handleClose();
        }, 1000);
      }
    } catch (err) {
      setSuccess(false);
      setError('Failed to create item.');
      setOpenSnackbar(true);
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    handleClose();
  };

  const handleDelete = () => {
    setPreviewImage(null);
    setSelectedImage(null);
    setFormData((prevState) => ({
      ...prevState,
      image_id: '',
    }));
  };

  return (
    <Box sx={{ height: isMobileScreen ? "94vh" : '100vh', display: 'flex', flexDirection: 'column' }}>
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
            <Typography variant="h5">Add Item</Typography>
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
          paddingBottom: '80px'
        }}>
          <Paper sx={{ p: 2 }}>
            {/* Image Upload Section */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {previewImage ? (
                <Avatar 
                  src={previewImage} 
                  sx={{ 
                    width: 'auto', 
                    height: "auto", 
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
              )}
              <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                <Button
                  sx={{ flex: 1 }}
                  component="label"
                  variant="outlined"
                  size="small"
                  color="primary"
                  startIcon={<CloudArrowUp16Regular />}
                  disabled={uploading}
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
                  label="Item Name"
                  name="item_name"
                  value={formData.item_name}
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
                    {formData.status ? 'Active' : 'Inactive'}
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
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            sx={{ flex: 1 }} 
            variant="contained" 
            disabled={uploading || !formData.item_name}
          >
            {uploading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
          </Button>
        </Box>
      </Box>
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
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {success ? (
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            Item created successfully!
          </Alert>
        ) : (
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {error || 'Failed to create item.'}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default AddUniversalItem;