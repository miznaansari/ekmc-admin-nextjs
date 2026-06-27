import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Typography,
  Snackbar,
  Alert,
  Autocomplete,
  Avatar,
  Paper,
  Stack,
  IconButton,
  Grid2,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { Close, PhotoCamera } from '@mui/icons-material';
import { CloudArrowUp16Regular, Delete16Regular, DocumentArrowUp16Regular, Image32Regular } from '@fluentui/react-icons';
import Demo from '../ImageCroper/Demo';

const EditEmployeeProfile = ({ employeeId, onUpdate, onClose , onSuccess}) => {
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      mobile_number: '',
      email: '',
      user_role_id: '',
      cafe_list_id: null,
      cafe_name: '',
      status: false,
      photo_proof_id_url: ""
    }
  });

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [searchCafeQuery, setSearchCafeQuery] = useState("");
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });

  // New state for tracking changes and confirmation modal
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [initialImage, setInitialImage] = useState("");
  const [initialSelectedCafe, setInitialSelectedCafe] = useState(null);

  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const token = localStorage.getItem('authToken');
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
      const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
      const [aspectRatio] = useState(4 / 4);
      const handleCropClose = () => {
        setOpenCropDialog(false);
        setSelectedImage(null);
      };

  // Watch all form fields for changes
  const watchedFields = watch();

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/user/admin/cafe-list/get/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          s: searchCafeQuery
        }
      });
      const formattedData = response.data.data.map(item => ({
        value: item.id,
        label: item.cafe_name
      }));
      console.log("restaurants:", formattedData);
      setRestaurants(formattedData);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchCafeQuery.trim().length >= 1) {
        fetchRestaurants();
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchCafeQuery]);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  // Effect to detect changes in form data
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      const hasFormChanges = JSON.stringify(watchedFields) !== JSON.stringify(initialData);
      const hasImageChanges = previewImage !== initialImage;
      const hasCafeChanges = JSON.stringify(selectedCafe) !== JSON.stringify(initialSelectedCafe);
      
      setHasChanges(hasFormChanges || hasImageChanges || hasCafeChanges);
    }
  }, [watchedFields, previewImage, selectedCafe, initialData, initialImage, initialSelectedCafe]);

  const fetchEmployeeData = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/user/admin/get-employee/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("response of employee-", response.data)
      if (response.status === 200 && response.data.success) {
        const employee = response.data.data;
        const formData = {
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          mobile_number: employee.mobile_number || '',
          email: employee.email || '',
          user_role_id: employee.user_role_id || '',
          cafe_list_id: employee.cafe_list_id || '',
          cafe_name: employee.cafe_name || '',
          status: employee.status === 1,
          photo_proof_id_url: ""
        };

        // Set form values
        Object.keys(formData).forEach(key => {
          setValue(key, formData[key]);
        });

        // Store initial data for comparison
        setInitialData(formData);
        setInitialImage(employee.uap_azure_original_image_url || "");
        setPreviewImage(employee.uap_azure_original_image_url || "");

        if (employee.cafe_list_id && employee.cafe_name) {
          const cafeData = {
            value: employee.cafe_list_id,
            label: employee.cafe_name
          };
          setSelectedCafe(cafeData);
          setInitialSelectedCafe(cafeData);
        }
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = () => {
    setValue("status", !watch("status"));
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowDiscardModal(true);
    } else {
      onClose();
    }
  };

  const handleDiscardConfirm = () => {
    setShowDiscardModal(false);
    setHasChanges(false);
    onClose();
  };

  const handleDiscardCancel = () => {
    setShowDiscardModal(false);
  };

  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      const submissionData = {
        ...data,
        photo_proof_id_url: "",
        profile_pic_image_id: previewImage,
        status: data.status ? 1 : 0,
        cafe_list_id: selectedCafe?.value || data.cafe_list_id,
        address_proof_id_url: ""
      };
      console.log("submission data- ", submissionData)
      const response = await axios.put(
        `${baseUrl}/api/user/admin/update-employee/${employeeId}`,
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        // setNotification({
        //   open: true,
        //   message: 'Employee updated successfully',
        //   severity: 'success',
        // });
        setAlert({ open: true, severity: "success", message: "Employee Updated" })
        setHasChanges(false); // Reset changes flag after successful update
        onSuccess()

        if (onUpdate) onUpdate("success", "Employee updated successfully!");
      } else {
        setAlert({
          open: true,
          message: 'Failed to update employee',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setAlert({
        open: true,
        message: error.response?.data?.msg || 'Error updating employee',
        severity: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const uploadImage = async (file) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("uploadType", "user_customer_profile")
    console.log("form data before upload image -", formData)

    try {
      setUploading(true)
      const response = await axios.post(`${baseUrl}/api/admin/cf/v1/upload`,
        formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
      )
      console.log("response after upload image -", response.data.customUrl);
      const imageUrl= response.data.customUrl
      setPreviewImage(imageUrl);
    } catch (e) {
      console.log("error during image upload - ", e)
    }finally{
      setUploading(false)
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    console.log("file image-", file)
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOpenCropDialog(true);
    }
  }

  const handleDelete = () => {
    setPreviewImage("")
  }

  return (
    <Box sx={{ height: isMobileScreen ? '95vh' : '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        bgcolor: "#F7F7F7",
        p: 1,
        flexShrink: 0
      }}>
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Edit Employee</Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      </Box>
      {/* Main Content Area - Scrollable */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          p: 1
        }}
      >
        <Paper sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {/* Scrollable Content */}
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            pt: 2,
            pb: 1
          }}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {previewImage ? (
                <Avatar src={previewImage} sx={{ width: 'auto', height: "auto", margin: 'auto', borderRadius: '10px' }} />
              ) : (
                <Avatar sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }}>
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

            <Typography variant='h6' marginBottom={2}>Employee Details</Typography>

            <Grid container spacing={1}>
              {/* First Name */}
              <Grid
                size={{
                  xs: 12,
                  sm: 12
                }}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="First Name"
                      variant="outlined"
                      fullWidth
                      size="small"
                      margin="dense"
                      required
                      {...field}
                    />
                  )}
                />
              </Grid>

              {/* Last Name */}
              <Grid
                size={{
                  xs: 12,
                  sm: 12
                }}>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Last Name"
                      variant="outlined"
                      fullWidth
                      required
                      size="small"
                      margin="dense"
                      {...field}
                    />
                  )}
                />
              </Grid>

              {/* Restaurant Name */}
              <Grid
                size={{
                  xs: 12,
                  sm: 12
                }}>
                <FormControl fullWidth variant="outlined" required>
                  <Controller
                    name="cafe_list_id"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        options={restaurants}
                        value={selectedCafe}
                        getOptionKey={(option) => option.value}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) =>
                          option.value === value.value
                        }
                        onInputChange={(_, inputValue) => {
                          setRestaurants([]);
                          setSearchCafeQuery(inputValue)
                        }}
                        onChange={(_, newValue) => (onChange(newValue?.value), setSelectedCafe(newValue), console.log("selected cafeid-", newValue?.value))}
                        loading={loading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Restaurant Name"
                            variant="outlined"
                            size="small"
                            margin="dense"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loading ? (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
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
              </Grid>

              {/* Employee Role */}
              <Grid
                size={{
                  xs: 12,
                  sm: 12
                }}>
                <FormControl fullWidth variant="outlined" required>
                  <Controller
                    name="user_role_id"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        select
                        label="Employee Role"
                        variant="outlined"
                        fullWidth
                        size="small"
                        margin="dense"
                        SelectProps={{
                          native: true,
                        }}
                        {...field}
                      >
                        <option value=""></option>
                        <option value="2">Manager</option>
                        <option value="3">Kitchen</option>
                        <option value="4">Captain</option>
                      </TextField>
                    )}
                  />
                </FormControl>
              </Grid>

              {/* Email */}
              <Grid
                size={{
                  xs: 12,
                  sm: 12
                }}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Email"
                      variant="outlined"
                      fullWidth
                      size="small"
                      margin="dense"
                      required
                      {...field}
                    />
                  )}
                />
              </Grid>

              {/* Phone */}
              <Grid
                size={{
                  xs: 12,
                  sm: 12
                }}>
                <Controller
  name="mobile_number"
  control={control}
  rules={{
    required: 'Phone number is required',
    validate: (value) =>
      String(value).length === 10 || 'Phone number must be exactly 10 digits',
  }}
  render={({ field, fieldState: { error } }) => (
    <TextField
      {...field}
      value={field.value || ''} // avoid undefined
      onChange={(e) => {
        const input = e.target.value.replace(/\D/g, ''); // keep only digits
        field.onChange(input);
      }}
      label="Phone"
      variant="outlined"
      fullWidth
      size="small"
      margin="dense"
      required
      error={!!error}
      helperText={error?.message}
    />
  )}
/>

              </Grid>
            </Grid>

            {/* Photo id proof */}
            <Grid2 xs={12} width={"100%"} display="flex" gap={1} alignItems="center">
              <FormControl variant="outlined" sx={{ flex: 1 }} size="small" margin="dense">
                <InputLabel>Photo Proof ID (PDF only)</InputLabel>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Photo Proof ID (PDF only)"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <DocumentArrowUp16Regular />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              <Button component="label" variant="contained" color='secondary' size="small">
                Upload
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => {
                    //handlePhotoProofFile(e);
                  }}
                />
              </Button>
            </Grid2>

            {/* Address proof file */}
            <Grid2 xs={12} display="flex" width={'100%'} gap={1} alignItems="center">
              <FormControl variant="outlined" sx={{ flex: 1 }} size="small" margin="dense">
                <InputLabel>Address Proof ID (PDF only)</InputLabel>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Address Proof ID (PDF only)"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <DocumentArrowUp16Regular />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
              <Button component="label" variant="contained" size="small" color='secondary'>
                Upload
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => {
                    // handleAddressproofFile(e)
                  }}
                />
              </Button>
            </Grid2>

            {/* Status */}
            <Box sx={{ display: "flex", alignItems: "center", mt: 3, mb: 2 }}>
              <Typography>Active</Typography>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    color='secondary'
                    size='small'
                    inputProps={{ "aria-label": "controlled" }}
                  />
                )}
              />
            </Box>
          </Box>

          {/* Fixed Bottom Buttons */}
          <Box sx={{
            flexShrink: 0,
            p: 2,
            borderTop: '1px solid #e0e0e0'
          }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color='error'
                sx={{ flex: 1 }}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                sx={{ flex: 1 }}
                variant="contained"
                disabled={updating}
              >
                {updating ? <CircularProgress size={24} thickness={4} /> : 'Save'}
              </Button>
            </Stack>
          </Box>
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
};

export default EditEmployeeProfile;