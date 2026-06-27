import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Stack,
  IconButton,
  CircularProgress,
  Grid2,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Switch,
  Avatar,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio,

} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Close, Videocam } from "@mui/icons-material";
import { DatePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import dayjs from 'dayjs'; // Add this import
import Demo from "../../../restaurant/Demo";


const AddBanner = ({ onCancel, onSuccess }) => {
  const {
    control,
    handleSubmit,
    watch,
  } = useForm({
    defaultValues: {
      status: 0,
      type: "",
      banner_title: "",
      banner_url: "",
      banner_expiry: null, // Changed from "" to null

      banner_placement_id: "",
      banner_route_id: "",
      condition_id: ""
    }
  });

  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("authToken");
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));


  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });

  const type = watch("type"); // "image" | "video" | "lottie"

  const [previewVideo, setPreviewVideo] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [localVideoUrl, setLocalVideoUrl] = useState('');
  const [lottiePreview, setLottiepreview] = useState(null);

  //set banner placement vars
  const [bannerPlacements, setBannerPlacements] = useState([]);
  const [bannerPlacementId, setBannerPlacementId] = useState(null);
  const [bannerSearchPlacementQuery, setSearchBannerPlacementSearchQuery] = useState(null);

  //set banner conditions vars
  const [bannerConditions, setBannerConditions] = useState([]);
  const [bannerConditionId, setBannerConditionId] = useState(null);

  //set banner routes vars
  const [bannerRoutes, setBannerRoutes] = useState([]);
  const [bannerRouteId, setBannerRouteId] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openCropDialog, setOpenCropDialog] = useState(false);
  const [aspectRatio] = useState(4 / 3);

  const fileInputRef = useRef(null);


  //toggle buttons section
  const [uploadImageOpen, setUploadImageOpen] = useState(false);
  const handleUploadImageOpen = () => {
    setUploadImageOpen(!uploadImageOpen);
  }

  const [uploadVideoOpen, setUploadVideoOpen] = useState(false);
  const handleUploadVideoOpen = () => {
    setUploadVideoOpen(!uploadVideoOpen);
  }

  const [uploadLottieOpen, setUploadLottieOpen] = useState(false);
  const handleUploadLottieOpen = () => {
    setUploadLottieOpen(!uploadLottieOpen);
  }


  //image upload 
  const [previewImage, setPreviewImage] = useState(null);//to store image url
  const [uploading, setUploading] = useState(false); // Track upload state


  const handleCropComplete = (croppedBlob) => {
    if (croppedBlob) {
      const croppedFile = new File([croppedBlob], rawFile?.name || "cropped.png", {
        type: rawFile?.type || "image/png",
      });
      uploadImage(croppedFile);
    }
    setOpenCropDialog(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setRawFile(file);
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(URL.createObjectURL(file));
    setOpenCropDialog(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = async (e) => {
    // const file = e.target.files[0];
    // if (file) {
    //   setUploading(true);
    //   const imageUrl =await uploadImage(file);
    //   setPreviewImage(imageUrl)
    //   console.log("image url in handleimage change- ", imageUrl);
    // }

    fileInputRef.current?.click();

  };
  const handleDelete = () => {
    setPreviewImage();
    setSelectedImage(null)
    setRawFile(null);
    if (selectedImage) URL.revokeObjectURL(selectedImage);
  }

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file)
    console.log("file is:", file)
    setUploading(true)
    try {
      const response = await axios.post(`${baseurl}/api/banner/main/v1/upload`, formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      console.log("response of upload image -", response?.data?.customUrl);
      const url = response?.data?.customUrl
      setPreviewImage(url)
      return url;

    } catch (e) {
      console.log("error during upload image - ", e);
    }
    finally {
      setUploading(false);
    }
  }


  //video upload section

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setLocalVideoUrl(URL.createObjectURL(file)); // show preview
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return;

    const formData = new FormData();
    formData.append("file", videoFile);

    setUploading(true);
    try {
      const response = await axios.post(
        `${baseurl}/api/banner/main/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );


      console.log("response of video upload-", response);

      if (response.status === 200) {
        const url = response?.data?.customUrl;
        console.log("url in stat-", url);
        // if (url) setPreviewVideo(url); 
        setPreviewVideo(url);
        setVideoFile(null);
        console.log("inside stat------");
      }
    } catch (err) {
      console.error("error during upload video -", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = () => {
    setVideoFile("");
    setPreviewVideo("");
  }

  //upload lottie sec.

  const [lottieFile, setLottieFile] = useState(null);

  const handleLottieChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLottieFile(e.target.files[0]);
    }
  };

  const uploadLottie = async () => {
    if (!lottieFile) return;

    const formData = new FormData();
    formData.append("file", lottieFile);

    try {
      setUploading(true);
      const response = await axios.post(
        `${baseurl}/api/banner/main/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Uploaded Lottie:", response);

      if (response.status === 200) {
        setLottiepreview(response?.data?.customUrl)
        setAlert({ open: true, severity: "success", message: "lottie file uploaded !!" })
      }

    } catch (e) {
      console.error("Error during upload lottie", e);
      setAlert({ open: true, severity: "error", message: "upload failed / server error!!" })
    } finally {
      setUploading(false);
    }
  };



  const onSubmit = async (data) => {

    const payload = {
      banner_title: data.banner_title,
      // is_lottie:data.is_lottie,
      // is_video:data.is_video,
      // is_image:data.is_image,
      is_lottie: data.type === "lottie" ? 1 : 0,
      is_video: data.type === "video" ? 1 : 0,
      is_image: data.type === "image" ? 1 : 0,
      banner_url: previewImage || previewVideo || lottiePreview || "",
      banner_expiry: data.banner_expiry ? dayjs(data.banner_expiry).add(1, "hour").utc().format("YYYY-MM-DD HH:mm:ss") : "", // Format date for API
      status: data.status,

      banner_placement_id: bannerPlacementId || "",
      banner_route_id: bannerRouteId || "",
      condition_id: bannerConditionId || ""

    }

    console.log("payload - ", payload)

    setLoading(true); // Fixed: uncommented this line

    try {
      const response = await axios.post(`${baseurl}/api/banner/main/v1/banner`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log("submit response- ", response)

      if (response.status === 201) {
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } else {
        setAlert({ open: true, severity: "error", message: "Error : error during submit!!" })
      }
    } catch (e) {
      console.log("error during submiting- ", e)
      const message = e.response?.data?.msg // Fixed: added optional chaining
      setAlert({ open: true, severity: "error", message: message || "Error : error during submit!!" })
    } finally {
      setLoading(false);
    }
  }

  //banner placement fetch
  const fetchBannerPlacements = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/banner/placement/v1/banners`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })


      const data = response.data?.data?.map((res) => ({
        label: res.title,
        value: res.id
      }))
      setBannerPlacements(data);

    } catch (e) {
      console.log("error during fetch banner placements- ", e);
    }
  }

  //banner conditions fetch
  const fetchBannerConditions = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/banner/condition/v1/banners`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = response.data?.data?.map((res) => ({
        label: res.title,
        value: res.id
      }))
      setBannerConditions(data);


    } catch (e) {
      console.log("error during fetch banner conditions-", e);
    }
  }

  //fetch banner routes
  const fetchBnannerRoutes = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/banner/route/v1/banners`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = response.data?.data?.map((res) => ({
        label: res.title,
        value: res.id
      }))
      setBannerRoutes(data);

    } catch (e) {
      console.log("error during fetch banner routes- ", e);
    }
  }


  useEffect(() => {
    fetchBannerPlacements();
    fetchBannerConditions();
    fetchBnannerRoutes();
  }, [])



  return (
    <Box
      sx={{
        height: isMobileScreen ? "95vh" : '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          bgcolor: "#F7F7F7",
          p: 1,
          flexShrink: 0,
          zIndex: 999
        }}
      >
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Add Banner</Typography>
            <IconButton onClick={() => {
              if (typeof onCancel === 'function') {
                onCancel();
              }
            }}>
              <Close />
            </IconButton>
          </Stack>
        </Paper>
      </Box>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Paper sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          m: 1,
          overflow: 'hidden'
        }}>
          <Box sx={{
            flex: 1,
            overflowY: 'auto',
            px: 2,
            pt: 2,
            pb: 1
          }}>
            <Grid2 xs={12} width="100%">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="body1" mr={2}>
                  Type:
                </Typography>

                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      row
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)} // ensure update
                    >
                      <FormControlLabel value="lottie" control={<Radio color="secondary" />} label="Lottie" />
                      <FormControlLabel value="video" control={<Radio color="secondary" />} label="Video" />
                      <FormControlLabel value="image" control={<Radio color="secondary" />} label="Image" />
                    </RadioGroup>
                  )}
                />
              </Box>
            </Grid2>


            {type === "image" && (
              <Box marginBottom={1}>
                {previewImage ? (
                  <Avatar
                    src={loading ? undefined : previewImage}
                    imgProps={{
                      onLoad: () => setLoading(false),
                      onError: () => setLoading(false),
                    }}
                    sx={{ width: "auto", height: 150, margin: "auto", borderRadius: "10px" }}
                  >
                    {loading && <CircularProgress />}
                  </Avatar>
                ) : (
                  <Avatar
                    sx={{
                      width: "100%",
                      height: 150,
                      margin: "auto",
                      borderRadius: "10px",
                    }}
                  >
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
                    onClick={handleImageChange}
                  >
                    Upload Image

                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        uploadImage(file);  // ⬅️ auto upload here
                      }
                    }}
                  />

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
                {/* <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={uploading}
                /> */}
              </Box>
            )}

            {type === "video" && (
              <Box marginBottom={1}>
                {!localVideoUrl ? (
                  <label
                    htmlFor="upload-video"
                    style={{ width: "100%", display: "block", cursor: "pointer" }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: 200,
                        borderRadius: "10px",
                        backgroundColor: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <Videocam sx={{ fontSize: 48, color: "#888" }} />
                    </Box>
                  </label>
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      borderRadius: "10px",
                      backgroundColor: "#e0e0e0",
                      display: "flex",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <video src={localVideoUrl} width={300} controls />
                  </Box>
                )}
                <input
                  accept="video/*"
                  id="upload-video"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleVideoChange}
                />

                <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                  <Button
                    sx={{ flex: 1 }}
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<CloudArrowUp16Regular />}
                    onClick={uploadVideo}
                    disabled={!videoFile}
                  >
                    {uploading ? (
                      <CircularProgress size={20} sx={{ color: "inherit" }} />
                    ) : (
                      "Upload Video"
                    )}
                  </Button>
                  <Button
                    sx={{ flex: 1 }}
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Delete16Regular />}
                    onClick={handleDeleteVideo}
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>
            )}

            {type === "lottie" && (
              <Box marginBottom={1}>
                {/* Hidden file input */}
                <input
                  accept=".json"
                  id="upload-lottie"
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleLottieChange}
                  key={lottieFile ? lottieFile.name : "empty"} // 👈 ensures reset after delete
                />

                {/* Button + file name inline */}
                <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                  <label htmlFor="upload-lottie">
                    <Button variant="outlined" component="span" size="small">
                      Choose Lottie JSON
                    </Button>
                  </label>

                  {lottieFile && (
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "200px",
                      }}
                    >
                      {lottieFile.name}
                    </Typography>
                  )}
                </Stack>

                {/* Action buttons */}
                <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                  <Button
                    sx={{ flex: 1 }}
                    variant="outlined"
                    size="small"
                    color="primary"
                    startIcon={<CloudArrowUp16Regular />}
                    onClick={uploadLottie}
                    disabled={!lottieFile || uploading}
                  >
                    {uploading ? (
                      <CircularProgress size={20} sx={{ color: "inherit" }} />
                    ) : (
                      "Upload Lottie"
                    )}
                  </Button>

                  <Button
                    sx={{ flex: 1 }}
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Delete16Regular />}
                    onClick={() => setLottieFile(null)} // 👈 reset file so new one can be picked
                    disabled={!lottieFile}
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>
            )}

            <Grid2 container spacing={2}>
              <Grid2 xs={12} width={"100%"}>
                <Controller
                  control={control}
                  name="banner_title"
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      variant="outlined"
                      fullWidth
                      size="small"
                      margin="dense"

                    />
                  )}
                />
              </Grid2>

              <Grid2 xs={12} width={"100%"}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Controller
                    name="banner_expiry"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <DateTimePicker
                        label="Banner Expiry"
                        value={value ? dayjs(value) : null}
                        onChange={(newValue) => onChange(newValue)}
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
              </Grid2>

              {/* banner placement dropdown */}
              <Autocomplete
                options={bannerPlacements}
                getOptionKey={(option) => option.value}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                onChange={(event, selectedOption) => {
                  setBannerPlacementId(selectedOption?.value || null);
                }}
                // onInputChange={(_, inputValue) => {
                //     setBannerPlacements([]);
                //     setSearchBannerPlacementSearchQuery(inputValue);
                // }}
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Banner Placement"
                    variant="outlined"
                    size="small"
                    margin="dense"
                  />
                )}
              />

              {/* banner condtion dropdown */}
              <Autocomplete
                options={bannerConditions}
                getOptionKey={(option) => option.value}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                onChange={(event, selectedOption) => {
                  setBannerConditionId(selectedOption?.value || null);
                }}
                // onInputChange={(_, inputValue) => {
                //     setBannerPlacements([]);
                //     setSearchBannerPlacementSearchQuery(inputValue);
                // }}
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Banner Condition"
                    variant="outlined"
                    size="small"
                    margin="dense"
                  />
                )}
              />

              {/* banner routes dropdown */}
              <Autocomplete
                options={bannerRoutes}
                getOptionKey={(option) => option.value}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                onChange={(event, selectedOption) => {
                  setBannerRouteId(selectedOption?.value || null);
                }}
                // onInputChange={(_, inputValue) => {
                //     setBannerPlacements([]);
                //     setSearchBannerPlacementSearchQuery(inputValue);
                // }}
                sx={{ width: "100%" }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Banner Route"
                    variant="outlined"
                    size="small"
                    margin="dense"
                  />
                )}
              />




              <Grid2 xs={12} width={"100%"}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body1" mr={2}>
                    Status:
                  </Typography>

                  <Controller
                    name="status"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        checked={value === 1}
                        onChange={(e) => onChange(e.target.checked ? 1 : 0)}
                        color="secondary"
                      />
                    )}
                  />

                  <Typography variant="body2">
                    {watch("status") === 1 ? "Active" : "Inactive"}
                  </Typography>
                </Box>
              </Grid2>



            </Grid2>
          </Box>

          <Box sx={{
            p: 2,
            borderTop: '1px solid #e0e0e0',
            flexShrink: 0
          }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color='error'
                sx={{ flex: 1 }}
                onClick={() => {
                  if (typeof onCancel === 'function') {
                    onCancel();
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                sx={{ flex: 1 }}
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>



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
      <Demo
        uploadImage={uploadImage}
        aspect={aspectRatio}
        selectedImage={selectedImage}
        onClose={() => setOpenCropDialog(false)}
        open={openCropDialog}
        setOpenCropDialog={setOpenCropDialog}
        setSelectedImage={setSelectedImage}
        onCropComplete={handleCropComplete}
      />
    </Box>
  )


}

export default AddBanner;