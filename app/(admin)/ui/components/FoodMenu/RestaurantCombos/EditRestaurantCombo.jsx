import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  DialogContent,
  FormControl,
  InputLabel,
  Typography,
  IconButton,
  Avatar,
  Stack,
  Autocomplete,
  Paper,
  useTheme,
  useMediaQuery,
  Switch,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import axios from "axios";
import CustomDropdown from "../../custom dropdown/CustomDropdown";
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import debounce from 'lodash.debounce';
import { Close } from "@mui/icons-material";
import Demo from "../../ImageCroper/Demo";

const EditRestaurantCombo = ({ open, handleClose, cafeComboId, combo, onSuccess }) => {
  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      price: "",
      status: "",
      combo_name: "",
      image_id: "",
      items: [],
      cafe_name:"",
    },
  });

  const selectedMenuItems = watch("items");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchItemQuery, setSearchItemQuery] = useState("");
  const [cafeListId, setCafeListId] = useState(null);
  
  // States for tracking changes and discard modal
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [originalValues, setOriginalValues] = useState({});
  
  const theme= useTheme();
  const isMobileScreen= useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem("authToken");

  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(4 / 3);
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };
  

  // Watch all form values to detect changes
  const watchedValues = watch();

  // Fixed useEffect - removed previewImage from dependencies
  useEffect(() => {
    if (combo) {
      console.log("combo- ", combo);
      const initialValues = {
        price: combo.price || "",
        status: combo.status,
        combo_name: combo.name || "",
        image_id: combo.cmc_azure_original_image_url || "",
        cafe_name: combo.cafe_name || "",
        items: combo.cafe_menu_combo_item?.map((item) => ({
          value: item.cafe_menu_item_id,
          label: item.item_name,
        })) || [],
        previewImage: combo.cmc_azure_original_image_url || ""
      };

      // Set form values
      setValue("price", initialValues.price);
      setValue("status", initialValues.status);
      setValue("combo_name", initialValues.combo_name);
      setValue("image_id", initialValues.image_id);
      setValue("items", initialValues.items);
      setValue("cafe_name", initialValues.cafe_name);
      
      // Set preview image
      setPreviewImage(initialValues.previewImage);
      
      // Use setTimeout to ensure form values are set before storing original values
      setTimeout(() => {
        setOriginalValues(initialValues);
        setHasChanges(false);
        setIsSaved(false);
      }, 100);
    }
  }, [combo, setValue]);

  // Track changes in form values and image
  useEffect(() => {
    if (Object.keys(originalValues).length > 0 && !isSaved) {
      const currentValues = {
        price: watchedValues.price || "",
        status: watchedValues.status,
        combo_name: watchedValues.combo_name || "",
        image_id: watchedValues.image_id || "",
        cafe_name: watchedValues.cafe_name || "",
        items: watchedValues.items || [],
        previewImage: previewImage
      };
      
      // Deep comparison for items array
      const itemsChanged = JSON.stringify(currentValues.items) !== JSON.stringify(originalValues.items);
      const otherFieldsChanged = (
        currentValues.price !== originalValues.price ||
        currentValues.status !== originalValues.status ||
        currentValues.combo_name !== originalValues.combo_name ||
        currentValues.image_id !== originalValues.image_id ||
        currentValues.cafe_name !== originalValues.cafe_name ||
        currentValues.previewImage !== originalValues.previewImage
      );
      
      setHasChanges(itemsChanged || otherFieldsChanged);
    }
  }, [watchedValues, previewImage, originalValues, isSaved]);

  // Get cafe_list_id from combo data
  useEffect(() => {
    if (combo && combo.cafe_list_id) {
      setCafeListId(combo.cafe_list_id);
    }
  }, [combo]);

  // Debounced search for menu items
  const fetchDebounceMenuItems = useCallback(
    debounce(async (query) => {
      if (query.length < 1) {
        setMenuItems([]);
        return;
      }
      
      if (!cafeListId) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/search-menu-item`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              cafe_list_id: cafeListId,
              s: query
            }
          }
        );

        const formattedData = response.data.data.map(item => ({
          value: item.cafe_menu_item_id,
          label: item.item_name
        }));
        setMenuItems(formattedData);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    }, 300),
    [cafeListId, token]
  );

  // Handle search with debounce
  useEffect(() => {
    if (searchItemQuery.trim().length >= 1 && cafeListId) {
      fetchDebounceMenuItems(searchItemQuery);
    } else {
      setMenuItems([]);
    }
  }, [searchItemQuery, cafeListId, fetchDebounceMenuItems]);

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    
    const payload = {
      price: data.price,
      status: data.status,
      combo_name: data.combo_name,
      image_id: previewImage || "",
      items: data.items.map(item => ({
        cafe_menu_id: item.value
      }))
    };
    
    console.log("payload:", payload);
    
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/cafe-combo/${cafeComboId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Mark as saved successfully
      setIsSaved(true);
      setHasChanges(false);
      onSuccess(); 
      
    } catch (error) {
      setSnackbarMessage(
        "Error: " + (error.response?.data?.msg || "Failed to update combo")
      );
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle close with discard confirmation
  const handleCloseAttempt = () => {
    if (hasChanges && !isSaved) {
      setShowDiscardModal(true);
    } else {
      handleClose();
    }
  };

  // Handle discard confirmation
  const handleDiscardConfirm = () => {
    setShowDiscardModal(false);
    setHasChanges(false);
    setIsSaved(false);
    handleClose();
  };

  const handleDiscardCancel = () => {
    setShowDiscardModal(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Image upload functions
  const imageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "cafe_menu_combo");
    
    try {
      setUploading(true)
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/admin/cf/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const imageUrl= response?.data?.customUrl;
      setPreviewImage(imageUrl || "")
    } catch (e) {
      console.log("error during upload image:", e);
    }finally{
      setUploading(false)
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOpenCropDialog(true);
    } 
  };

  const handleDelete = () => {
    setPreviewImage("");
  };

  return (
    <>
    <Box position={"sticky"} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
      <Paper sx={{ padding: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Edit Combo</Typography>
            <IconButton
              onClick={handleCloseAttempt}
            >
              <Close />
            </IconButton>
        </Stack>
      </Paper>
    </Box>
    <Box>
    <Box
      sx={{ 
        height: isMobileScreen ? "calc(100vh - 120px)" : "calc(100vh - 80px)", 
        display: "flex", 
        flexDirection: "column", 
         p: 1 
      }}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Paper sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      
        {/* Image section */}
        <Box sx={{ textAlign: "center", mb: 2 }}>
          {previewImage ? (
            <Avatar src={previewImage} sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }} />
          ) : (
            <Avatar sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }}>
              {uploading ? <CircularProgress/> : <Image32Regular color="black" />}
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
              disabled={!previewImage}
            >
              Delete
            </Button>
          </Stack>
        </Box>

        {/* Cafe name */}
        <Controller
          name="cafe_name"
          control={control}
          render={({field})=>(
            <TextField
              {...field}
              label="Cafe Name"
              fullWidth
              size="small"
              margin="dense"
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* Combo Name */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Controller
            name="combo_name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Combo Name" 
              size="small"
              margin="dense"
              fullWidth />
              
            )}
          />
        </FormControl>

        {/* Price */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Combo Price" 
              size="small"
              margin="dense"
              fullWidth />
            )}
          />
        </FormControl>

        {/* Menu Items with Search and Remove functionality */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Controller
            name="items"
            control={control}
            render={({ field: { onChange, value } }) => (
              <Autocomplete
                multiple
                options={menuItems || []}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                value={value || []}
                onChange={(_, newValue) => {
                  onChange(newValue);
                }}
                onInputChange={(_, newInputValue) => {
                  setMenuItems([]); // Clear previous results
                  setSearchItemQuery(newInputValue);
                }}
                onOpen={() => {
                  setMenuItems([]); // Clear when opening
                }}
                onClose={() => {
                  setMenuItems([]); // Clear when closing
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.value}>
                    {option.label}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    sx={{ mb: 2 }}
                    label="Select Menu Items" 
                    variant="outlined"
                    placeholder="Type to search menu items..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {searchItemQuery.trim().length >= 1 && loading ? (
                            <CircularProgress size={20} sx={{ mr: 2 }} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
          />
        </FormControl>

        <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography>Active</Typography>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Switch
                    {...field}
                    color="secondary"
                    checked={field.value === 1}
                    onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                  />
                )}
              />
        </Box>
      </Paper>

      <Box sx={{ p: 1, bgcolor: "#F7F7F7" }}>
          <Paper sx={{ display: "flex", gap: 1, padding: 1 }}>
            <Button 
              onClick={handleCloseAttempt} 
              variant="outlined"
              color="error"
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit" sx={{ flex: 1 }} variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : null}
            >
              Save
            </Button>
          </Paper>
      </Box>
      </Box>

      {/* Discard Changes Confirmation Modal */}
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
      <Demo
        selectedImage={selectedImage}
        open={openCropDialog}
        onClose={handleCropClose}
        uploadImage={imageUpload}
        aspect={aspectRatio} // Square aspect ratio, adjust as needed
        setSelectedImage={setSelectedImage}
        setOpenCropDialog={setOpenCropDialog}
      />

      {/* Snackbar for success/failure messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
    </>
  );
};

export default EditRestaurantCombo;