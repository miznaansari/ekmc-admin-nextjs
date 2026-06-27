import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Avatar,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Switch,
  Snackbar,
  Paper,
  Stack,
  Grid2,
  Autocomplete,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import dayjs from "dayjs";
import Demo from "../ImageCroper/Demo";

const AddCustomers = ({ onSuccess, onClose }) => {
  const { control, handleSubmit, setValue, watch, formState: { errors }, } = useForm({
    defaultValues: {
      mobile_number: "",
      email: "",
      status: false,
      gender: "",
      date_of_birth: null,
      first_name: "",
      last_name: "",
      profile_pic_image_id: "",
      city: null,
    },
    resolver: async (data) => {
      const errors = {};
      if (!data.first_name) errors.first_name = { message: "First name is required" };
      if (!data.bio) errors.bio = { message: "Bio is required" };
      if (!data.last_name) errors.last_name = { message: "Last name is required" };
      if (!data.mobile_number) {
        errors.mobile_number = { message: "Mobile number is required" };
      } else if (!/^[6-9]\d{9}$/.test(data.mobile_number)) {
        errors.mobile_number = { message: "Invalid mobile number" };
      }
      if (!data.email) {
        errors.email = { message: "Email is required" };
      } else if (!/\S+@\S+\.\S+/.test(data.email)) {
        errors.email = { message: "Invalid email format" };
      }
      if (!data.gender) errors.gender = { message: "Gender is required" };
      if (!data.date_of_birth) errors.date_of_birth = { message: "Date of birth is required" };
      return { values: data, errors };
    },
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem("authToken");
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const [cityList, setCityList] = useState([]);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [switchButton, setSwitchbutton] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(4 / 4);
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "user_customer_profile");

    try {
      setUploadingImage(true)
      const response = await axios.post(
        `${baseUrl}/api/admin/cf/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const imageUrl = response.data.customUrl;
      setPreviewImage(imageUrl)
    } catch (err) {
      console.error("Error uploading image:", err);
      setSnackbarMessage("Error uploading image. Please try again.");
      setSuccess(false);
      setOpenSnackbar(true);
      return null;
    } finally {
      setUploadingImage(false)
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadingImage(true)
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOpenCropDialog(true);
      setUploadingImage(false)
    }
  };

  const onSubmit = async (data) => {
    const dob = data.date_of_birth;
    const formattedDOB = dob ? dayjs(dob).toISOString() : null;

    const payload = {
      mobile_number: data.mobile_number,
      email: data.email,
      status: switchButton ? 1 : 0,
      gender: data.gender,
      date_of_birth: formattedDOB,
      first_name: data.first_name,
      last_name: data.last_name,
      profile_pic_image_id: previewImage || "",
      city_id: data.city?.value || 0,
      bio: data.bio || "",
    };

    try {
      setLoading(true)
      const response = await axios.post(
        `${baseUrl}/api/admin/create-mobile-user`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        setSnackbarMessage("Mobile user added successfully!");
        setSuccess(true);
        setOpenSnackbar(true);
        if (onSuccess && typeof onSuccess === "function") {
          onSuccess();
        }
        if (onClose && typeof onClose === "function") {
          onClose();
        }
      } else {
        setSnackbarMessage(response.data?.msg || "Unexpected error occurred.");
        setSuccess(false);
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error("Error creating user:", err.response?.data?.msg || err.message);
      setSnackbarMessage(err.response?.data?.msg || "Failed to create user.");
      setSuccess(false);
      setOpenSnackbar(true);
    } finally {
      setLoading(false)
    }
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const fetchCity = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/city-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: citySearchQuery,
        },
      });
      const cityList = response.data?.data?.map((city) => ({
        value: city.city_id,
        label: city.city_name,
        state: city.state_name,
      }));
      setCityList(cityList || []);
    } catch (e) {
      console.error("Error during fetching cities:", e);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (citySearchQuery.trim().length >= 1) {
        fetchCity();
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [citySearchQuery]);

  return (
    <>
      {/* Header */}
      <Box position={"sticky"} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Add Mobile User</Typography>
            <IconButton
              onClick={() => {
                if (onClose && typeof onClose === "function") {
                  onClose();
                }
              }}
            >
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
              {previewImage ? (
                <Avatar
                  src={previewImage}
                  sx={{ width: "100%", height: 150, margin: "auto", borderRadius: "10px" }}
                />
              ) : (
                <Avatar sx={{ width: "100%", height: 150, margin: "auto", borderRadius: "10px" }}>
                  {uploadingImage ? <CircularProgress /> : <Image32Regular color="black" />}
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
                  <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Button>
                <Button
                  sx={{ flex: 1 }}
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Delete16Regular />}
                  onClick={() => setPreviewImage(null)}
                >
                  Delete
                </Button>
              </Stack>
            </Box>

            {/* Form Fields */}
            <Typography variant="h6" mb={2}>User details</Typography>
            <Grid2 container spacing={2}>
              <Grid2 xs={12} width={"100%"}>
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
                      required
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                    />
                  )}
                />
              </Grid2>

              <Grid2 xs={12} width={"100%"}>
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
                      required
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  )}
                />
              </Grid2>
                <Grid2 xs={12} width={"100%"}>
                <Controller
                  name="bio"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Bio"
                      size="small"
                      margin="dense"
                      required
                      error={!!errors.bio}
                      helperText={errors.bio?.message}
                    />
                  )}
                />
              </Grid2>

              <Grid2 xs={12} width={"100%"}>
                <Controller
                  name="mobile_number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mobile Number"
                      size="small"
                      margin="dense"
                      required
                      error={!!errors.mobile_number}
                      helperText={errors.mobile_number?.message}
                      inputProps={{ maxLength: 10, inputMode: "numeric" }} // max length 10
                    />

                  )}
                />
              </Grid2>

              <Grid2 xs={12} width={"100%"}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      size="small"
                      margin="dense"
                      required
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid2>

              <Grid2 xs={12} width={"100%"}>
                <Controller
                  name="gender"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <FormControl fullWidth margin="dense" size="small" required>
                      <InputLabel id="gender-label">Gender</InputLabel>
                      <Select
                        {...field}
                        labelId="gender-label"
                        label="Gender"
                        error={!!errors.gender}
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                      </Select>
                      {errors.gender && (
                        <Typography color="error" variant="caption">
                          {errors.gender.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid2>

              <Grid2 xs={12} width={"100%"}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="date_of_birth"
                    control={control}
                    defaultValue={null}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Date of Birth"
                        format="DD-MM-YYYY"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: "small",
                            margin: "dense",
                            required: true,
                            error: !!errors.date_of_birth,
                            helperText: errors.date_of_birth?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid2>

              <Grid2 xs={12} width={"100%"}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
  options={cityList}
  getOptionLabel={(option) =>
    option ? `${option.label}, ${option.state}` : ""
  }
  isOptionEqualToValue={(option, value) =>
    option?.value === value?.value
  }
  filterOptions={(options, { inputValue }) => {
    const v = inputValue.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(v) ||
        option.state.toLowerCase().includes(v)
    );
  }}
  value={value}
  onChange={(_, newValue) => onChange(newValue)}
  onInputChange={(_, newInputValue) => {
    setCityList([]);
    setCitySearchQuery(newInputValue);
  }}
  renderOption={(props, option) => (
    <li {...props} key={option.value}>
      <span className="font-medium">{option.label}</span>
      <span className="text-gray-500">, {option.state}</span>
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

              <Grid2 xs={12} width={"100%"} mb={4}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Switch
                    color="secondary"
                    size="small"
                    checked={switchButton}
                    onChange={(e) => setSwitchbutton(e.target.checked)}
                  />
                  <Typography sx={{ pr: 2 }}>Active</Typography>
                </Box>
              </Grid2>
            </Grid2>
          </Box>
        </Paper>

        {/* Fixed Bottom Buttons */}
        <Box sx={{ p: 1, bgcolor: "#F7F7F7" }}>
          <Paper sx={{ display: "flex", gap: 1, padding: 1 }}>
            <Button
              variant="outlined"
              color="error"
              sx={{ flex: 1 }}
              onClick={() => {
                if (onClose && typeof onClose === "function") {
                  onClose();
                }
              }}
            >
              Cancel
            </Button>
            <Button type="submit" sx={{ flex: 1 }} variant="contained">
              {loading ? <CircularProgress size={20} /> : "Save"}
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
        aspect={aspectRatio} // Square aspect ratio, adjust as needed
        setSelectedImage={setSelectedImage}
        setOpenCropDialog={setOpenCropDialog}
      />

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={success ? "success" : "error"} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddCustomers;