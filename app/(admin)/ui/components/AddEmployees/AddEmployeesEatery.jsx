import React, { useState, useEffect } from "react";
import {Box,
  Grid,
  TextField,
  Button,
  Typography,
  Switch,
  Avatar,
  InputAdornment,
  CircularProgress,
  FormControl,
  Snackbar,
  Paper,
  Stack,
  IconButton,
  InputLabel,
  Alert,
  useMediaQuery,
  useTheme,} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import { Close, PhotoCamera, Token } from "@mui/icons-material";
import { CloudArrowUp16Regular, Delete16Regular, DocumentArrowUp16Regular, Image32Regular } from "@fluentui/react-icons";
import Demo from "../ImageCroper/Demo";

const AddEmployeesEatery = ({ onSuccess, onClose, selectEatry }) => {
  // console.log('selectEatry', selectEatry)
  const [selectedCafe, setSelectedCafe] = useState(
    selectEatry?.id ? { label: selectEatry.cafe_name || selectEatry.name, value: selectEatry.id } : null
  );
  const [restaurants, setRestaurants] = useState(
    selectEatry?.id ? [{ label: selectEatry.cafe_name || selectEatry.name, value: selectEatry.id }] : []
  );
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { handleSubmit, control, reset, setValue, formState: { errors }, } = useForm({
    defaultValues: {
      user_role_id: "",
      first_name: "",
      last_name: "",
      cafe_list_id: selectEatry?.id || null,
      mobile_number: "",
      email: "",
      status: true,
      photo_proof_id_url: "",
      address_proof_id_url: "",
      profile_pic_image_id: "",
      uap_azure_original_image_url: ""
    },
    resolver: async (data) => {
      console.log('data', data)
      const errors = {};
      if (!data.first_name) errors.first_name = { message: "First name is required" };
      if (!data.last_name) errors.last_name = { message: "Last name is required" };
      if (!data.mobile_number) {
        errors.mobile_number = { message: "Mobile number is required" };
      } else if (!/^[6-9]\d{9}$/.test(data.mobile_number)) {
        errors.mobile_number = { message: "Invalid mobile number" };
      }

      return { values: data, errors };
    },
  });
  const [seacrhCafeQuery, setSearchCafequery] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedImage, setSelectedImage] = useState(null);
  const [openCropDialog, setOpenCropDialog] = useState(false);
  const [aspectRatio] = useState(4 / 4);
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(
        `${process.env.VITE_REACT_APP_BACKEND_URL
        }/api/user/admin/cafe-list/get/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          params: {
            s: seacrhCafeQuery
          }
        }
      );
      console.log("cafes", response.data.data)
      const cafeOptions = response.data.data.map((cafe) => ({
        label: cafe.cafe_name,
        value: cafe.id
      }))
      console.log("cafe options:", cafeOptions)
      setRestaurants(cafeOptions);

    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setLoading(false);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (seacrhCafeQuery.trim().length >= 1) {
        fetchRestaurants();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [seacrhCafeQuery]);


  const onSubmit = async (data) => {
    if (
      !data.user_role_id ||
      !data.first_name ||
      !data.last_name ||
      !data.cafe_list_id ||
      !data.mobile_number
    ) {
      setSnackbarMessage("Please fill out all required fields");
      setOpenSnackbar(true);
      return;
    }
    console.log("data before on submit-", data)

    const finalPayload = {
      ...data,
      photo_proof_id_url: '',
      profile_pic_image_id: previewImage,
      uap_azure_original_image_url: '',
      status: data.status ? 1 : 0,
    };

    console.log("ACTUAL API PAYLOAD (Check this one!):", finalPayload);

    try {
      const response = await axios.post(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/api/admin/restaurant/v1/employee`,
        finalPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("employee create response- ", response.data)
      setSnackbarMessage("Employee created successfully!");
      onSuccess();
      setOpenSnackbar(true);
      reset();
    } catch (error) {

      console.log("error creating employee- ", error)
      const message = error.response?.data?.msg;
      setAlert({ open: true, severity: "error", message: message })
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', "user_customer_profile");

    try {
      setUploading(true)
      const response = await axios.post(`${process.env.VITE_REACT_APP_BACKEND_URL}/api/admin/cf/v1/upload`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data"
        },
      });
      console.log("image  upload response", response.data)
      console.log("image url-", response.data.customUrl)
      const imageUl = response.data.customUrl;
      setPreviewImage(imageUl)
    } catch (err) {
      console.error(err)
      return null;
    } finally {
      setUploading(false)
    }
  };
  const [previewImage, setPreviewImage] = useState('')
  const [uploading, setUploading] = useState(false)

  const fileInputRef = React.useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOpenCropDialog(true);
      setUploading(false);
    }
    // Clear the input value using ref so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = () => {
    setPreviewImage();
  }

  const uploadPdfFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    console.log("file in upload pdf file section", file)
    try {
      const response = axios.post(`${process.env.VITE_REACT_APP_BACKEND_URL}/api/user/admin/uploadFile`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "multipart/form-data"
        }
      })

      console.log("response of file upload- ", response)

    } catch (e) {
      console.log("error during upload pdf file= ", e)
      setAlert({ open: true, severity: "error", message: "error uploading file!!" })
    }
  }
  const [previewPhotoProofId, setPreviewPhotoProofId] = useState();

  const handlePhotoProofFile = (e) => {
    const file = e.target.files[0];
    console.log("photo proof file= ", file)
    if (file) {
      const url = uploadPdfFile(file);
    } else {
      setAlert({ open: true, severity: "error", message: "error uploading file!!" })
    }

  }

  const handleAddressproofFile = (e) => {
    const file = e.target.files[0];
    console.log("photo proof file= ", file)
    if (file) {
      const url = uploadPdfFile(file);
    }

  }

  return (
    <Box sx={{
      height: isSmallScreen ? "95vh" : '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden' // Prevent outer scroll
    }}>
      {/* Fixed Header */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 999,
        bgcolor: "#F7F7F7",
        flexShrink: 0 // Don't shrink this section
      }}>
        <Paper sx={{ padding: 1, margin: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Add Employee</Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      </Box>
      {/* Scrollable Content */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden' // Let the inner content handle scrolling
        }}
      >
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          px: 1,
          pb: 1 // Add bottom padding for better spacing
        }}>
          <Paper sx={{ p: 2 }}>
            {/* Image Upload Section */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {previewImage ? (
                <Avatar src={previewImage} sx={{ width: '100%', height: 250, margin: 'auto', borderRadius: '10px' }} />
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
                    ref={fileInputRef}
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

            {/* Form Fields */}
            <Grid container spacing={1}>
              {/* First Name */}
              <Grid size={12}>
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
              <Grid size={12}>
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
              <Grid size={12}>
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
                          setSearchCafequery(inputValue);
                        }}
                        onChange={(_, newValue) => {
                          setSelectedCafe(newValue || null);
                          onChange(newValue?.value || null);
                        }}
                        loading={loading}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Restaurant Name"
                            variant="outlined"
                            size="small"
                            margin="dense"
                            required
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
              <Grid size={12}>
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
                        required
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
              <Grid size={12}>
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
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>

              {/* Phone */}
              <Grid size={12}>
                <Controller
                  name="mobile_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Phone"
                      variant="outlined"
                      fullWidth
                      size="small"
                      margin="dense"
                      required
                      error={!!errors.mobile_number}
                      helperText={errors.mobile_number?.message}
                      {...field}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Photo ID Proof */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 2 }}>
              <FormControl variant="outlined" sx={{ flex: 1 }} size="small">
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
                  onChange={handlePhotoProofFile}
                />
              </Button>
            </Box>

            {/* Address Proof */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
              <FormControl variant="outlined" sx={{ flex: 1 }} size="small">
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
                  onChange={handleAddressproofFile}
                />
              </Button>
            </Box>

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
          </Paper>
        </Box>

        {/* Fixed Bottom Buttons */}
        <Box sx={{
          p: 1,
          bgcolor: "#F7F7F7",
          borderTop: '1px solid #e0e0e0',
        }}>
          <Paper sx={{ display: "flex", gap: 1, padding: 1 }}>
            <Button
              variant="outlined"
              color='error'
              sx={{ flex: 1 }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" sx={{ flex: 1 }} variant="contained">
              {loading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
            </Button>
          </Paper>
        </Box>
      </Box>
      {/* Crop Dialog */}
      <Demo
        selectedImage={selectedImage}
        open={openCropDialog}
        onClose={handleCropClose}
        uploadImage={uploadImage}
        aspect={aspectRatio}
        setSelectedImage={setSelectedImage}
        setOpenCropDialog={setOpenCropDialog}
      />
      {/* Snackbar */}
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

export default AddEmployeesEatery;