import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Avatar,
  Paper,
  Stack,
  IconButton,
  Typography,
  Grid2,
  CircularProgress,
  Snackbar
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Close } from "@mui/icons-material";
import { Image32Regular, SpinnerIos16Regular, SpinnerIosRegular } from "@fluentui/react-icons";
import { SpinnerIos20Filled } from "@fluentui/react-icons/fonts";
dayjs.extend(utc);

const EditRecommendation = ({ id, onSuccess, onCancel }) => {
  const [validateDays, setValidateDays] = useState(null);

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
    },
  });
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("authToken");
  const [cafes, setCafes] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [message, setMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false); // Track upload state
  const [url, setUrl] = useState(null);
  const [searchAauthor, setSearchAuthor] = useState("");
  const [searchCafequery, setSearchCafequery] = useState("");
  const [loading, setLoading] = useState(false)
  console.log("recommendation id in EditRecommendation.jsx- ", id);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/myeats/v1/recommendation/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("data in editr:", res.data);
        const data = res.data?.data?.[0];
        console.log("title:", data.title);
        console.log("upload:", data?.cafe_logo_azure_original_image_url);
        console.log("status:", data?.status);
        console.log("note:", data?.note);

        setValue("title", data?.title);
        setValue("upload", data?.up_cf_original_image_url || null);
        setValue("author", {
          value: data.user_customer_id,
          label: data.first_name,
        });
        setValue(
          "cafe",
          data.cafes?.map((cafe) => ({
            value: cafe.tag_cafe_id,
            label: cafe.cafe_name,
          })) || []
        );
        const expiaryDate = dayjs.utc(data.created_at).add(data.validity_in_days, "day");
        console.log("expiary date:", expiaryDate);
        setValue("date", expiaryDate);
        setValue("status", data?.status);
        setValue("note", data?.note);
        const imgUrl = data?.rc_azure_original_thumbnail_url;
        setPreviewImage(imgUrl);
      } catch (err) {
        console.error("Error fetching recommendation:", err);
      }
    };


    // const fetchAuthors = async () => {
    //   const res = await axios.get(`${baseUrl}/admin/customer/get/all`, {
    //     headers: { Authorization: `Bearer ${token}` },
    //   });
    //   const formatted = res.data.data.map((item) => ({
    //     value: item.user_customer_id,
    //     label: item.full_name,
    //   }));
    //   console.log("formated data in editRecommendation :", formatted);
    //   setAuthors(formatted);
    // };

    fetchRecommendation();
  }, [id]);

  //Fetch Cafes
  const fetchCafes = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/user/admin/cafe-list/get/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          s: searchCafequery
        }
      });
      const formatted = res.data.data.map((item) => ({
        value: item.id,
        label: item.cafe_name,
      }));
      setCafes(formatted);
    } catch (e) {
      console.log("error during fetch edit cafes in edit cafes-", e)
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchCafequery.trim().length >= 2) {
        fetchCafes();
      }

    }, 300)
    return () => clearTimeout(delayDebounce);

  }, [searchCafequery])

  //Fetch Authors
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

      setAuthors(formatted);
      console.log("authors:", formatted);
    } catch (e) {
      console.error("Error fetching authors:", e);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchAauthor.trim() != "") {
        fetchAuthors();
      }
    }, 300)

    return () => clearTimeout(delayDebounce);
  }, [searchAauthor])

  const onSubmit = async (data) => {
    const payload = {
      // title: data.title,
      // up_cf_original_image_url: data.upload,
      // user_customer_id: data.author?.value,
      // note: data?.note,
      validity_in_days: validateDays,
      status: data?.status,
      // cafes: data.cafe?.map((item) => ({ tag_cafe_id: item.value })) || []
    };

    console.log("payload in edit recommendation:", payload);
    try {
      setLoading(true)
      const res = await axios.put(`${baseUrl}/api/myeats/v1/recommendation/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("response in edit recommendagtion:", res);
      setMessage("Updated successfully");
      setAlertSeverity("success");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      console.log("error in edit recommendation:", err);
      setMessage("Update failed");
      setAlertSeverity("error");
      console.error(err);
    } finally {
      setLoading(false)
    }
  };

  //Upload image 
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file)
    formData.append("uploadType", "recommendation")
    console.log("file is:", file)
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
      return imageUrl;

    } catch (e) {
      console.log("error during uploading image:", e);
      return null;
    }
  }
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    console.log("image file:", file);
    if (file) {
      setUploading(true);
      const uploadedUrl = await uploadImage(file); // get uploaded image URL from backend
      setUploading(false);

      if (uploadedUrl) {
        setPreviewImage(uploadedUrl); // this should be the real URL now
      } else {
        console.error("Image upload failed, no URL returned.");
      }
    }
  };
  console.log(previewImage)
  return (
    <>
      <Box position={'sticky'} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Edit Recommendation</Typography>
            <IconButton
              onClick={onCancel}
            >
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      </Box>
      <Box component="form" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 1 }} onSubmit={handleSubmit(onSubmit)} >
        <Paper>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            {previewImage ? (
              <Avatar src={previewImage} sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }} />
            ) : (
              <Avatar sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }}>
                <Image32Regular color="black" />
              </Avatar>
            )}
          </Box>
          <Grid2 container spacing={2}>
            <Grid2 xs={12} width={"100%"}>
              <Controller
                name="title"
                control={control}
                render={({ field }) =>
                  <TextField
                    InputProps={{ readOnly: true }}
                    sx={{
                      mb: 3,
                      pointerEvents: "none", // prevent focus/clicks
                    }}
                    {...field}
                    label="Title"
                    fullWidth
                    size="small"
                    margin="dense"
                  />}
              />
            </Grid2>
          </Grid2>



          <Grid2 container spacing={2}>
            <Grid2 xs={12} width={"100%"}>
              <Controller
                name="author"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete

                    options={authors}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    value={value}
                    onChange={(_, newValue) => onChange(newValue)}
                    onInputChange={(_, inputValue) => setSearchAuthor(inputValue)}
                    filterOptions={(options, { inputValue }) =>
                      options.filter(
                        (option) =>
                          option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
                          option.mobile?.toString().includes(inputValue)
                      )
                    }
                    disableClearable
                    sx={{
                      pointerEvents: "none", // Disable mouse interaction
                    }}

                    renderInput={(params) => (
                      <TextField
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: true, // Prevent typing
                        }}
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
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 xs={12} width={"100%"}>
              <Controller
                name="cafe"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    disableClearable
                    sx={{
                      pointerEvents: "none", // Disable mouse interaction
                    }}
                    multiple
                    options={cafes}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    value={value}
                    onChange={(_, newValue) => {
                      onChange(newValue); // newValue will be an array of selected cafes
                    }}
                    onInputChange={(_, newInputValue) => (
                      setCafes([]),
                      setSearchCafequery(newInputValue)
                    )}
                    renderInput={(params) =>
                      <TextField
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: true, // Prevent typing
                        }}
                        label="Select Cafes"
                        size="small"
                        margin="dense"
                        sx={{ mb: 3 }} />}
                  />
                )}
              />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 xs={12} width="100%">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Expiry Date"
                      onChange={(newValue) => {
                        field.onChange(newValue);

                        const today = dayjs();                         // current day
                        const selected = dayjs(newValue);             // selected date
                        const diff = selected.diff(today, "day");     // difference in days

                        if (diff < 0) {
                          // ❌ Selected date is before today
                          setValidateDays(null);
                          alert("Please select a future date.");
                          return;
                        }

                        // ✅ Valid date → save days difference
                        setValidateDays(diff);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        },
                      }}
                      sx={{ mb: 1 }}
                    />
                  )}
                />
                {validateDays !== null && (
                  <Box sx={{ mb: 2 }}>
                    Valid for: {validateDays} {validateDays === 1 ? "day" : "days"}
                  </Box>
                )}

              </LocalizationProvider>
            </Grid2>


          </Grid2>


          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select  {...field} label="Status">
                  <MenuItem value={1}>In Review</MenuItem>
                  <MenuItem value={2}>Published</MenuItem>
                  <MenuItem value={3}>Expired</MenuItem>
                </Select>
              )}
            />
          </FormControl>

          {/* <Controller
    name="note"
    control={control}
    render={({ field }) => (
      <TextField disabled={true} {...field} label="Note" fullWidth sx={{ mb: 2 }} />
    )}
  /> */}

          {loading ? (
            <Box py={2} Optional padding sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
              <CircularProgress
              //style={{ fontSize: "2rem" }} // Make spinner larger
              />
            </Box>
          ) : (
            <Button type="submit" variant="contained" color="primary" fullWidth >
              Save
            </Button>
          )}



          {message && (
            <Snackbar
              open={message}
              autoHideDuration={3000}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Alert severity={alertSeverity} sx={{ mt: 2 }}>
                {message}
              </Alert>
            </Snackbar>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default EditRecommendation;
