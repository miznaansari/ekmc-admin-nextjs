import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Paper,
  Stack,
  CircularProgress,
  Grid2,
  IconButton,
  Typography,
  Snackbar,
  Switch,
  FormControlLabel
} from "@mui/material";
import axios from "axios";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useForm, Controller } from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";
import CustomDropdown from "../custom dropdown/CustomDropdown";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Close, ClosedCaptionDisabledSharp } from "@mui/icons-material";
import dayjs from "dayjs";
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import Demo from "../ImageCroper/Demo";


function AddRecommendation({ onSuccess, onCancel }) {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      upload: "",
      author: null,
      cafe: [],
      date: null,
      status: "",
      note: "",
      is_test: false,
    },
  });
  const [formData, setFormData] = useState({
    category_name: "",
    status: false,
    category_image_id: "",
  });

  const token = localStorage.getItem("authToken");
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const [cafes, setCafes] = useState([]);
  const [message, setMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [author, setAuthor] = useState([]);
  const selectedCafeId = watch("cafe_list_id");
  const selectedAuthorId = watch("author")
  const [previewImage, setPreviewImage] = useState(null);//to store image url
  const [uploading, setUploading] = useState(false); // Track upload state
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchAauthor, setSearchAuthors] = useState("");
  const [searchCafequery, setSearchCafequery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(4 / 3);
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  //Upload Image 
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file)
    formData.append("uploadType", "recommendation")
    console.log("file is:", file)
    setUploading(true)
    try {
      const response = await axios.post(`${baseUrl}/api/admin/cf/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )
      const imageUrl = response.data?.customUrl;
      console.log("Uploaded image URL:", imageUrl);
      setUrl(imageUrl);
      setPreviewImage(imageUrl)

    } catch (e) {
      console.log("error during uploading image:", e);
      return null;
    } finally {
      setUploading(false)
    }
  }
  console.log("url:", url);
  //fetch Authors dropdown
  const fetchAuthors = async () => {
    try {
      const response = await axios.get(`${baseUrl}/admin/customer/get/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          s: searchAauthor
        }
      });

      const formatted = response.data?.data?.map((item) => ({
        value: item.user_customer_id,
        label: item.full_name || `${item.first_name} ${item.last_name}`,
        mobile: item.mobile_number,

      })) || [];

      setAuthor(formatted);
      console.log("authors:", formatted);
    } catch (e) {
      console.error("Error fetching authors:", e);
    }
  };
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchAauthor.trim().length >= 1) {
        fetchAuthors();
      }
    }, 300)
    return () => clearTimeout(delayDebounce);
  }, [searchAauthor])

  const fetchCafes = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/user/admin/cafe-list/get/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          s: searchCafequery
        }
      });
      const formatted = response.data.data.map((item) => ({
        value: item.id,
        label: item.cafe_name,
      }));
      setCafes(formatted);
      console.log("cafes:", formatted);

    } catch (err) {
      console.error("Error fetching cafes:", err);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchCafequery.trim().length >= 1) {
        fetchCafes();
      }
    }, 300)

    return () => clearTimeout(delayDebounce);

  }, [baseUrl, token, searchCafequery]);

  const onSubmit = async (data) => {
    const today = dayjs(); // today (current date and time)
    const expiryDate = dayjs(data.date); // your selected expiry date
    const validityDays = expiryDate.diff(today, 'day'); // difference in days
    console.log("Validity in days:", validityDays);

    console.log("data before submit -", data)
    const payload = {
      user_customer_id: data?.author.value,
      rc_cf_original_thumbnail_url: previewImage,
      title: data?.title,
      validity: validityDays,
      // cafes: data.cafe ? [{ tag_cafe_id: data.cafe.value }] : [],
      cafes: data.cafe?.map((item) => ({ tag_cafe_id: item.value })) || [],
      is_test: data?.is_test ? 1 : 0,
    };
    console.log("payload in addRecommendation :", payload);
    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}/api/myeats/v1/recommendation`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("response in add recommendation= ", response)
      if (response?.data?.success || response?.status < 300) {
        setMessage("Successfully submitted");
        setAlertSeverity("success");
        onSuccess();
        setCafes([]);
        //setTitle("");
        setAuthor([]);
        onSuccess();
      }
    } catch (e) {
      console.log("Error during Add Recommendation", e);
      setMessage("Failed to submit / server error");
      setAlertSeverity("error");
    } finally {
      setLoading(false);
      //setMessage("Successfully submitted...");
    }
  };

  const handleDropdownChangeCafe = (selectedOption) => {
    setValue("cafe_list_id", selectedOption.value); // Store selected cafe ID
    // fetchMenuItems(selectedOption.value)
  };

  const handleDropdownAuthor = (selectedOption) => {
    const matched = author.find((item) => item.value === selectedOption?.value);
    console.log("author name: ", matched?.label);
    setValue("author", matched || null);
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
  const handleDelete = () => {
    setPreviewImage();
  }
  return (
    <Box>
      <Box position={'sticky'} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Add Recommendation</Typography>
            <IconButton onClick={onCancel}>
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      </Box>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 1 }} component="form" onSubmit={handleSubmit(onSubmit)}>

        <Paper>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, pt: 2 }}>
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {previewImage ? (
                <Avatar src={previewImage} sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }} />
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
                >
                  Delete
                </Button>
              </Stack>
            </Box>
            <Grid2 container spacing={2}>
              <Grid2 xs={12} width={"100%"}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Title"
                      //variant="outlined" 
                      size="small"
                      margin="dense"
                      sx={{ mb: 3 }}
                      required
                    />
                  )}
                />
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2}>
              <Grid2 xs={12} width={"100%"}>
                <FormControl fullWidth >
                  <Controller
                    name="author"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        options={author}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        filterOptions={(options, { inputValue }) =>
                          options.filter(
                            (option) =>
                              option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                              option.mobile?.toString().includes(inputValue)
                          )
                        }
                        value={value}
                        onChange={(_, newValue) => onChange(newValue)}
                        onInputChange={(_, inputValue) => (
                          setAuthor([]),
                          setSearchAuthors(inputValue))}
                        renderOption={(props, option) => (
                          <li {...props} key={option.value}>
                            {option.label}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Author"
                            variant="outlined"
                            size="small"
                            margin="dense"
                            sx={{ mb: 3 }}
                          />
                        )}
                      />
                    )}
                  />
                </FormControl>
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 xs={12} width={"100%"}>
                <FormControl fullWidth >
                  <Controller
                    name="cafe"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        multiple
                        options={cafes}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        value={value}
                        onChange={(_, newValue) => {
                          onChange(newValue); // newValue will be an array of selected cafes
                        }}
                        onInputChange={(_, newInputvalue) => (
                          setCafes([]),
                          setSearchCafequery(newInputvalue)
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.value}>
                            {option.label}
                          </li>
                        )}
                        renderInput={(params) => <TextField {...params} label="Select Cafes" size="small"
                          margin="dense"
                          sx={{ mb: 3 }}
                        />}
                      />
                    )}
                  />
                </FormControl>
              </Grid2>
            </Grid2>

            <Box >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <DatePicker
                      label="Expiry Date"
                      value={value ?? null}
                      onChange={onChange}
                      slotProps={{
                        textField: {
                          size: 'small',
                          margin: 'dense',
                          fullWidth: true,
                          sx: { mb: 3 },
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
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

            <Controller
              name="note"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label="Note" variant="outlined" sx={{ mb: 3 }} required size="small"
                  margin="dense" />
              )}
            />
            <Box sx={{ mb: 3 }}>
              <Controller
                name="is_test"
                control={control}
                defaultValue={false}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Is Test"
                  />
                )}
              />
            </Box>
            {message && (
              <Snackbar
                open={message}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Alert severity={alertSeverity}>{message}</Alert>
              </Snackbar>
            )}
          </Box>
        </Paper>
        <Box position="sticky" bottom={0} sx={{ width: "100%", p: 2, zIndex: 999, bgcolor: "#F7F7F7", display: 'flex', gap: 1 }}>
          <Paper sx={{ width: '100%', display: "flex", gap: 1, padding: 1 }} >
            <Button
              variant="outlined"
              color='error'
              sx={{ flex: 1 }}
              onClick={onCancel}
            //onClick={handleDrawerToggle(false)}
            >
              Cancel
            </Button>
            <Button type="submit" sx={{ flex: 1 }} variant="contained"

            //disabled={!isFormComplete()}
            >
              {loading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
            </Button>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default AddRecommendation;
