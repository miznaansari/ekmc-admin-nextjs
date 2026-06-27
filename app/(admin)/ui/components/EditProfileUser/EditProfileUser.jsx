import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Avatar,
  Paper,
  Stack,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Grid2,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import axios from "axios";
import { Close } from "@mui/icons-material";
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import { Controller, useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Autocomplete from "@mui/material/Autocomplete";
import dayjs from "dayjs";
import { SpinnerIos16Regular } from "@fluentui/react-icons/fonts";
import Demo from "../ImageCroper/Demo";

const EditProfileUser = ({ customer, onCancel, onSuccess, onClose , id}) => {
  console.log("customer id in edit profile= ", id)
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: "",
    email: "",
    gender: "",
    date_of_birth: null,
    status: false,
    city: null,
    profile_pic_image_id: "",
    is_suspended:null,
    suspension_reason:"",
    is_test_user: false
  });

  const [cityList, setCityList] = useState([]);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [selectedCity, setSelectedCity] = useState(null);
  const [uploadingImage, setUploadingImage]= useState(false);
  const [loading, setLoading]=useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [alert, setAlert] = useState({
                open: false,
                severity: "info",
                message: ""
            });

  // New state for discard modal and tracking changes
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);
  const [initialImageUrl, setInitialImageUrl] = useState("");
  const [formSaved, setFormSaved] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
    const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
    const [aspectRatio] = useState(4 / 4);
    const handleCropClose = () => {
      setOpenCropDialog(false);
      setSelectedImage(null);
    };


  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      mobile_number: "",
      email: "",
      gender: "",
      date_of_birth: null,
      status: false,
      city: null,
      profile_pic_image_id: "",
      is_creator:0,
      is_suspended:0,
      suspension_reason:"",
      is_test_user: false
    },
    
  });

  // Watch all form fields to detect changes
  const watchedFields = watch();

  //fetch customer by id-
  const fetchCustomerById =async()=>{
    try{
      const response= await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/admin/list-mobile-userById/${id}`,{
        headers:{
          Authorization:`Bearer ${localStorage.getItem("authToken")}`
        }
      })
      console.log("response customer by id- ", response?.data?.data[0]);

      const CustomerData= response?.data?.data[0] 

      const cityObject = CustomerData.city_id && CustomerData.city_name 
        ? { label: CustomerData.city_name, value: CustomerData.city_id } 
        : null;
      console.log("city object= ", cityObject)

      const sanitizedCustomer = {
        first_name: CustomerData.first_name || "",
        last_name: CustomerData.last_name || "",
        mobile_number: CustomerData.mobile_number || "",
        email: CustomerData.email || "",
        gender: CustomerData.gender || "",
        date_of_birth: CustomerData.date_of_birth && dayjs(CustomerData.date_of_birth).isValid()
          ? dayjs(CustomerData.date_of_birth)
          : null,
        status: CustomerData.status === 1,
        city: cityObject,
        profile_pic_image_id: CustomerData.up_cf_original_image_url || "",
        is_creator:CustomerData.is_creator,
        is_suspended:CustomerData.is_suspended,
        suspension_reason:CustomerData.suspension_reason,
        is_test_user: CustomerData.is_test_user === 1 || CustomerData.is_test_user === true
      };
      
      setSelectedCity(cityObject)
      setUserData(sanitizedCustomer);
      reset(sanitizedCustomer);
      setPreviewImageUrl(CustomerData.up_cf_original_image_url || "");
      
      // Store initial form data for comparison
      setInitialFormData(sanitizedCustomer);
      setInitialImageUrl(CustomerData.up_cf_original_image_url || "");

    }catch(e){
      console.log("error during fetch customer by id- ", e);

    }
  }

  useEffect(()=>{
    fetchCustomerById();
  },[id,reset])

  // Check for changes in form fields or image
  useEffect(() => {
    if (initialFormData && !formSaved) {
      const hasFormChanges = JSON.stringify(watchedFields) !== JSON.stringify(initialFormData);
      const hasImageChanges = previewImageUrl !== initialImageUrl;
      setHasUnsavedChanges(hasFormChanges || hasImageChanges);
    }
  }, [watchedFields, previewImageUrl, initialFormData, initialImageUrl, formSaved]);

 useEffect(() => {
  if (previewImageUrl) {
    setImageLoading(true);
  }
}, [previewImageUrl]);

    const fetchCities = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/city-list`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            params:{
              search:citySearchQuery
            }
          }
        );
        
        const cities= response.data?.data?.map((city)=>({
          label:city.city_name,
          value:city.city_id
        }))
        console.log("city response- ", cities)
        setCityList(cities)
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

  useEffect(()=>{
    const delayDebounce= setTimeout(()=>{
      if(citySearchQuery.trim().length >= 1){
        fetchCities();
      }
    },300)

    return ()=> clearTimeout(delayDebounce);
  },[citySearchQuery])

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOpenCropDialog(true);
      setUploadingImage(false)
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "user_customer_profile");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/admin/cf/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const imageUrl= response.data?.customUrl;
      setPreviewImageUrl(imageUrl)
    } catch (error) {
      console.error("Error uploading image:", error);
      setSnackbarMessage("An error occurred while uploading the image.");
      setSnackbarSeverity("error");
      setShowSnackbar(true);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data) => {

    try {
      setLoading(true)
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/admin/edit-mobile-user/${customer.user_customer_id}`,
        {
          city_id: data.city?.value || "",
          status: data.status ? 1 : 0,
          gender: data.gender,
          date_of_birth: data.date_of_birth ? dayjs(data.date_of_birth).format("YYYY-MM-DD") : "",
          first_name: data.first_name,
          last_name: data.last_name,
          profile_pic_image_id: previewImageUrl,
          is_creator:data.is_creator ? 1:0,
          is_test_user: data.is_test_user ? 1 : 0,
          is_suspended:data.is_suspended? 1:0,
          suspension_reason:data.suspension_reason
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("response of edit submit-", response)

      if (response.data.success) {
        setFormSaved(true); // Mark form as saved
        setHasUnsavedChanges(false); // Clear unsaved changes flag
        onSuccess(response.data?.msg);
        onClose();
      } 
    } catch (error) {
      console.error("Error updating user:", error);
      const message= error.response?.data?.msg || error.response?.data?.message ;
      setAlert({open:true, severity:"error", message:message})
    } finally {
      setShowSnackbar(true);
      setLoading(false)
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  // Handle close with discard check
  const handleClose = () => {
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

  return (
    <>
      {/* Header */}
      <Box position="sticky" top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Edit Mobile User</Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      </Box>

      {/* Main Form Container */}
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
        {/* Scrollable Content */}
        <Paper sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, pt: 2, pb: 2 }}>
            {/* Image Upload Section */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {previewImageUrl ? (
                <Box sx={{ position: "relative", width: "100%", height: 150 }}>
                  {/* Spinner overlay */}
                  {imageLoading && (
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(255,255,255,0.6)",
                        borderRadius: "10px",
                        zIndex: 1,
                      }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  )}

                  {/* Avatar with image inside */}
                  <Avatar
                    sx={{
                      width: "100%",
                      height: 150,
                      margin: "auto",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={previewImageUrl}
                      alt="Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onLoad={() => setImageLoading(false)}
                      onError={() => setImageLoading(false)} // just in case
                    />
                  </Avatar>
                </Box>
              ) : (
                <Avatar sx={{ width: "100%", height: 150, margin: "auto", borderRadius: "10px" }}>
                  {uploadingImage ? <CircularProgress></CircularProgress> :<Image32Regular color="black" />}
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
                  <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                </Button>
                <Button
                  sx={{ flex: 1 }}
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Delete16Regular />}
                  onClick={() => setPreviewImageUrl("")}
                >
                  Delete
                </Button>
              </Stack>
            </Box>

            {/* Form Fields */}
            <Typography variant="h6" mb={2}>User details</Typography>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      size="small"
                      margin="dense"
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      size="small"
                      margin="dense"
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="mobile_number"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value.length >= 10 || 'Mobile number must be at least 10 digits',
                  }}
                  disabled={true}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mobile Number"
                      size="small"
                      margin="dense"
                      
                    />
                  )}
                />
              </Grid2>


              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="email"
                  control={control}
                  disabled={true}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      size="small"
                      margin="dense"
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth margin="dense" size="small" >
                      <InputLabel id="gender-label">Gender</InputLabel>
                      <Select
                        {...field}
                        labelId="gender-label"
                        label="Gender"
                        // error={!!errors.gender}
                        value={field.value || ""}
                      >
                        <MenuItem value="">Select Gender</MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                      </Select>
                      {/* {errors.gender && (
                        <Typography color="error" variant="caption">
                          {errors.gender.message}
                        </Typography>
                      )} */}
                    </FormControl>
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="date_of_birth"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={(newValue) => {
                          field.onChange(newValue);
                          setUserData((prev) => ({ ...prev, date_of_birth: newValue }));
                        }}
                        label="Date of Birth"
                        format="DD-MM-YYYY"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            margin: "dense",
                            error: !!errors.date_of_birth,
                            helperText: errors.date_of_birth?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={cityList || []}
                      getOptionLabel={(option) => option?.label || ""}
                      isOptionEqualToValue={(option, value) => option.value === value?.value}
                      value={field.value}
                      onChange={(_, newValue) => {
                        field.onChange(newValue);
                        setSelectedCity(newValue);
                      }}
                      onInputChange={(_, newInputValue) => {
                        setCitySearchQuery(newInputValue);
                      }}
                        renderOption={(props, option) => (
                          <li {...props} key={option.value}>
                            {option.label}
                          </li>
                        )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select City"
                          size="small"
                          margin="dense"
                          sx={{ mb: 3 }}
                          error={!!errors.city}
                          helperText={errors.city?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }} >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ pr: 2 }}>Suspend</Typography>
                  <Controller
                    name="is_suspended"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        color="secondary"
                        size="small"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </Box>
              </Grid2>

              <Grid2 size={{ xs: 12 }}>
                <Controller
                  name="suspension_reason"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Suspension Reason"
                      size="small"
                      margin="dense"
                      multiline
                      minRows={3}
                    />
                  )}
                />
              </Grid2>

              <Grid2 size={{ xs: 12 }} >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ pr: 2 }}>Active</Typography>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        color="secondary"
                        size="small"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12 }} >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ pr: 2 }}>Creator</Typography>
                  <Controller
                    name="is_creator"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        color="secondary"
                        size="small"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12 }} >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography sx={{ pr: 2 }}>Test User</Typography>
                  <Controller
                    name="is_test_user"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        color="secondary"
                        size="small"
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                </Box>
              </Grid2>
            </Grid2>

            {uploading && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        </Paper>

        {/* Fixed Bottom Buttons */}
        <Box sx={{ p: 1, bgcolor: "#F7F7F7" }}>
          <Paper sx={{ display: "flex", gap: 1, padding: 1 }}>
            <Button variant="outlined" color="error" sx={{ flex: 1 }} onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" sx={{ flex: 1 }} variant="contained">
              {loading ? <SpinnerIos16Regular/> : "Save"}
            </Button>
          </Paper>
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
    </>
  );
};

export default EditProfileUser;