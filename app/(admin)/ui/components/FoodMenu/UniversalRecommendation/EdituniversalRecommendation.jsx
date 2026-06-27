import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
  IconButton,
  Avatar,
  Stack,
  Snackbar,
  useTheme,
  useMediaQuery,
  Paper,
  Switch,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import Delete from "@mui/icons-material/Delete";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import { CloudArrowUp16Regular, Delete16Regular, Image16Regular, Image32Regular } from "@fluentui/react-icons";
import Demo from "../../ImageCroper/Demo";
import CloseIcon from "@mui/icons-material/Close";
import DemoAi from "../../ImageCroper/DemoAi";

function EditUniversalRecommendation({ recommendation, onSuccess , handleClose}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [exploreCatId, setExploreCatId] = useState(recommendation?.id || "");
  const [exploreCatName, setExploreCatName] = useState(recommendation?.explore_food_name || "");
  const [status, setStatus] = useState(recommendation?.status);
  console.log("ststs- ",recommendation?.status)
  const [categories, setCategories] = useState([]);
  
  // Initialize catsId from existing categories and items
  const initializeCatsId = () => {
    const existingCategories = recommendation?.categories || [];
    const existingItems = recommendation?.items || [];
    const allExisting = [...existingCategories, ...existingItems];
    
    if (allExisting.length > 0) {
      return allExisting.map(item => ({ 
        cat_id: item.id,
        category_name: item.category_name 
      }));
    }
    return [{ cat_id: null, category_name: null }]; // Start with one empty selection
  };

  const [catsId, setCatsId] = useState(initializeCatsId);
  const [items, setItems] = useState(recommendation?.items || []);
  const [responseMessage, setResponseMessage] = useState("");
  const [responseType, setResponseType] = useState("");
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("authToken");
  const imgurl = recommendation.myeats_explore_cat_auzre_original_image_url;
  const [previewImage, setPreviewImage] = useState(imgurl || "");
  const [uploading, setUploading] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });
  
  // States for tracking changes and discard modal
  const [hasChanges, setHasChanges] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [originalValues, setOriginalValues] = useState({});
  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
    const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
    const [aspectRatio] = useState(4 / 3);
    const handleCropClose = () => {
      setOpenCropDialog(false);
      setSelectedImage(null);
    };
  
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  //new
  const [generateImageOpen,setGenerateImageOpen ]=useState(false);
  const handleGenerateImageOpen= ()=>{
    setGenerateImageOpen(!generateImageOpen);
  }
  const [generateImagePrompt, setGenerateImagePrompt]=useState("");
  const [generatingImage , setGeneratingImage]=useState(false);
  const [generatedImagePreview, setGeneratedImagePreview]=useState("");  
  const [imageFile, setImagefile]=useState("");
  const [finalImageUrl, setFinalImageUrl]=useState(null);
  const [previewOpen, setPreviewOpen]=useState(false);
  const [originalImageUrl, setOriginalImageUrl]=useState("");

  // Initialize original values when recommendation loads
  useEffect(() => {
    if (recommendation) {
      const initialCatsId = initializeCatsId();
      const initialValues = {
        exploreCatId: recommendation?.id || "",
        exploreCatName: recommendation?.explore_food_name || "",
        status: recommendation?.status,
        catsId: initialCatsId,
        previewImage: recommendation.myeats_explore_cat_auzre_original_image_url || ""
      };
      setOriginalImageUrl(recommendation.myeats_explore_cat_auzre_original_image_url)
      // Use setTimeout to ensure all state updates are complete
      setTimeout(() => {
        setOriginalValues(initialValues);
        setHasChanges(false);
        setIsSaved(false);
      }, 100);
    }
  }, [recommendation]);

  // Track changes in all form values
  useEffect(() => {
    if (Object.keys(originalValues).length > 0 && !isSaved) {
      const currentValues = {
        exploreCatId,
        exploreCatName,
        status,
        catsId,
        previewImage
      };
      
      // Compare each field
      const hasFormChanges = (
        currentValues.exploreCatId !== originalValues.exploreCatId ||
        currentValues.exploreCatName !== originalValues.exploreCatName ||
        currentValues.status !== originalValues.status ||
        currentValues.previewImage !== originalValues.previewImage ||
        JSON.stringify(currentValues.catsId) !== JSON.stringify(originalValues.catsId)
      );
      
      setHasChanges(hasFormChanges);
    }
  }, [exploreCatId, exploreCatName, status, catsId, previewImage, originalValues, isSaved]);

  const fetchCategories = async () => {
    if (!searchCategory.trim()) return;
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/search-cat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            s: searchCategory
          }
        }
      );
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Unable to fetch categories."
      });
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchCategory.trim().length >= 1) {
        fetchCategories();
      } else {
        setCategories([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchCategory]);

  // Handle category ID change for dynamic selections
  const handleCatIdChange = (index, value) => {
    const newCatsId = [...catsId];
    newCatsId[index] = { 
      cat_id: value ? value.id : null,
      category_name: value ? value.category_name : null 
    };
    setCatsId(newCatsId);
  };

  // Add new category selection
  const addNewCatId = () => {
    setCatsId([...catsId, { cat_id: null, category_name: null }]);
  };

  // Remove category selection
  const removeCatId = (index) => {
    if (catsId.length > 1) {
      const newCatsId = catsId.filter((_, i) => i !== index);
      setCatsId(newCatsId);
    }
  };

  const handleDeleteItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!finalImageUrl && imageFile){
      setAlert({open:true, severity:"error", message:"Error: Please upload image / you have't uploaded selected image!!"})
      return;
    }

    // Filter out null cat_id values
    const validCatsId = catsId.filter(cat => cat.cat_id !== null);

    const payload = {
      explore_cat_id: parseInt(exploreCatId),
      explore_cat_name: exploreCatName,
      status: parseInt(status),
      cats_id: validCatsId.map((catId)=>(
        {
          cat_id:catId.cat_id
        }
      )),
      myeats_explore_image_url: finalImageUrl || originalImageUrl
    };
    console.log("payload- ", payload)

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/admin/explore`,
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
      setResponseMessage(error.response.data.msg);
      setAlert({ 
        open: true, 
        severity: "error", 
        message: error.response.data.msg || "error" 
      });
    }
  };

  //upload image 
  const imageUpload = async () => {
    if(!imageFile){
      setAlert({open:true, severity:"error", message:"Error: Please select an image first!"});
      return;
    }
    const file=imageFile;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "explore_food_category");
    console.log("file is:", file);
    
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

      console.log(" uploading image response- ", response);
      if(response.status ===200){
        const imageUrl= response?.data?.customUrl;
        setFinalImageUrl(null)
        setFinalImageUrl(imageUrl);
        setAlert({open:true, severity:"success", message:"image uploaded!"});

      }

      // setPreviewImage(imageUrl)
    } catch (e) {
      console.log("error during upload image-", e);
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

  //ai image generate 
  const base64ToFile = (base64Data, fileName, mimeType) => {
    const byteString = atob(base64Data); // decode base64 string
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new File([ab], fileName, { type: mimeType });
};

    const generateImage =async()=>{
      try{
        setGeneratingImage(true)
        const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-preview-06-06:predict?key=${import.meta.env.VITE_GEMINI_KEY}`,
        {
          instances: [
            {
              prompt:generateImagePrompt
            },
          ],
          parameters: {
            outputMimeType: "image/jpeg",
            sampleCount: 1,
            personGeneration: "ALLOW_ADULT",
            aspectRatio: "1:1",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("resoonse image generate- ", response)
      const { bytesBase64Encoded, mimeType } = response.data.predictions[0];
      const file = base64ToFile(bytesBase64Encoded, "generated.png", mimeType);
      setImagefile(file);
      const generatedImageUrlForPreview= URL.createObjectURL(file);
      setPreviewImage(null)
      setPreviewImage(generatedImageUrlForPreview)
      setFinalImageUrl(null)
      setGeneratedImagePreview(file)
  
      }catch(e){
        console.log("error during generate image-", e);
      }finally{
        setGeneratingImage(false);
      }
    }

  return (
    <>
      <Box position={"sticky"} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
          <Paper sx={{ padding: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Edit Universal Recommendation</Typography>
              <IconButton onClick={handleCloseAttempt}>
                <Close />
              </IconButton>
            </Stack>
          </Paper>
        </Box>
      <Box
        sx={{ 
          height: isMobileScreen ? "calc(100vh - 120px)" : "calc(100vh - 80px)", 
          display: "flex", 
          flexDirection: "column", 
          p: 1 
        }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Paper sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, pt: 2, pb: 2 }}>
          
            {/* ai generate image section */}
            <Box marginBottom={1}>
              {generateImageOpen ? 
                <Box> 
                  <TextField
                    fullWidth
                    placeholder="Write your prompt to generate image..."
                    name="category_name"
                    variant="outlined"
                    size="small"
                    multiline
                    rows={3}
                    value={generateImagePrompt}
                    onChange={(e) => setGenerateImagePrompt(e.target.value)}
                  />
                  <Box 
                    sx={{ 
                      bottom: 0,
                      p: 2, 
                      borderTop: '1px solid #eee', 
                      display: 'flex', 
                      gap: 1,
                      zIndex: 999
                    }}
                  >
                    <Button 
                      variant="outlined" 
                      color="error" 
                      sx={{ flex: 1 }} 
                      onClick={() => {
                        setGenerateImageOpen(false)
                        setGenerateImagePrompt("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      sx={{ flex: 1 }} 
                      variant="contained" 
                      onClick={generateImage}
                      disabled={generatingImage}
                    >
                      {generatingImage? <CircularProgress size={20} />: "Generate Image"}
                    </Button>
                  </Box>
                </Box>:
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={()=> handleGenerateImageOpen()}
                    >Generate Image By AI</Button>
                  </Grid>
                </Grid>
              }
            </Box>
         
            {/* Image upload section */}
            <Box sx={{ textAlign: "center", mb: 2 }}>
              {/* {previewImage ? (
                <Avatar src={previewImage} sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }} />
              ) : (
                <Avatar sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }}>
                  {uploading ? <CircularProgress/> : <Image32Regular color="black" />}
                </Avatar>
              )} */}
              <label htmlFor="upload-image">
                {previewImage ? (
                  <Avatar
                    src={previewImage}
                    sx={{
                      width: 'auto',        
                      height: 'auto',
                      maxHeight: 150,
                      margin: 'auto',
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                  />
                  ) : (
                  <Avatar
                    sx={{
                      width: '100%',
                      height: 150,
                      margin: 'auto',
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    {uploading ? <CircularProgress /> : <Image32Regular />}
                  </Avatar>
                  )}
                  <input
                    id="upload-image"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
              </label>
              <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                <Button
                  sx={{ flex: 1 }}
                  component="label"
                  variant="outlined"
                  size="small"
                  color="primary"
                  startIcon={<CloudArrowUp16Regular />}
                  onClick={imageUpload}
                >
                  {uploading ? <CircularProgress /> : "Upload Image"}
                </Button>
                <Button
                  sx={{ flex: 1 }}
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<Image16Regular />}
                  onClick={() => setPreviewOpen(true)}
                  disabled={!previewImage}
                >
                  View
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

            {/* Form fields */}

            <TextField
              label="Explore Category Name"
              type="text"
              value={exploreCatName}
              onChange={(e) => setExploreCatName(e.target.value)}
              required
              fullWidth
              size={isMobile ? "medium" : "small"}
              sx={{ mb: 2 }}
              
            />

            <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
              <Typography>Active</Typography>
                <Switch
                  color="secondary"
                  checked={status === 1}
                  onChange={(e) => setStatus(e.target.checked ? 1 : 0)}
                />
            </Box>

            {/* Dynamic Category Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Categories
              </Typography>
              
              <Grid container spacing={1}>
                {catsId.map((cat, index) => (
                  <Grid container alignItems="center" spacing={1} key={index} sx={{ mb: 1 }}>
                    <Grid size={isMobile ? 8 : 9.5}>
                      <Autocomplete
                        options={categories}
                        onInputChange={(_, newInputValue) => {
                          setSearchCategory(newInputValue);
                        }}
                        onOpen={() => setCategories([])}
                        onClose={() => setCategories([])}
                        getOptionLabel={(option) => option.category_name || ""}
                        value={
                          cat.cat_id 
                            ? { id: cat.cat_id, category_name: cat.category_name }
                            : null
                        }
                        onChange={(e, value) => {
                          handleCatIdChange(index, value);
                          setCategories([]);
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id}>
                            {option.category_name}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={`Search Category ${index + 1}`}
                            size="small"
                            margin="dense"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {searchCategory.trim().length >= 1 && loading ? (
                                    <CircularProgress size={20} sx={{ mr: 2 }} />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        noOptionsText={
                          searchCategory.trim().length < 1 
                            ? "Type at least 1 character to search" 
                            : categories.length === 0 && searchCategory.length >= 1
                            ? "No categories found"
                            : "Loading..."
                        }
                      />
                    </Grid>
                    <Grid size={isMobile ? 4 : 2.5}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        fullWidth
                        onClick={() => removeCatId(index)}
                        disabled={catsId.length === 1}
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                ))}
                
                <Grid size={12}>
                  <Button
                    startIcon={<AddCircleOutline />}
                    onClick={addNewCatId}
                    color="secondary"
                    variant="contained"
                    sx={{ mt: 1 }}
                  >
                    Add New Category
                  </Button>
                </Grid>
              </Grid>
            </Box>

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
                  type="submit" 
                  sx={{ flex: 1 }} 
                  variant="contained"
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
      <DemoAi
        selectedImage={selectedImage}
        open={openCropDialog}
        onClose={handleCropClose}
        aspect={aspectRatio} // Square aspect ratio, adjust as needed
        setSelectedImage={setSelectedImage}
        setOpenCropDialog={setOpenCropDialog}
        onCropCompleteImage={(croppedFile) => {
          setImagefile(croppedFile); // save for later upload
          setPreviewImage(URL.createObjectURL(croppedFile));
          console.log("image file in add cats demo- ", croppedFile);
          console.log("image url in add cats demo-=", URL.createObjectURL(croppedFile))
        }}
      />
      <Snackbar
        open={alert.open}
        anchorOrigin={{ 
          vertical: isMobile ? "bottom" : "top", 
          horizontal: isMobile ? "center" : "right" 
        }}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        sx={{ 
          bottom: isMobile ? 80 : 'auto', // Above the sticky button on mobile
        }}
      >
        <Alert severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
      {/* view image */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <IconButton
          onClick={() => setPreviewOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            zIndex: 1,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '10px',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default EditUniversalRecommendation;