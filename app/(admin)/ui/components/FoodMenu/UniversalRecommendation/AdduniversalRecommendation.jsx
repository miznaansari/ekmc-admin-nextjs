import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  Autocomplete,
  Avatar,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Close } from "@mui/icons-material";
import axios from "axios";
import { CloudArrowUp16Regular, Delete16Regular, Image16Regular, Image32Regular } from "@fluentui/react-icons";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import Demo from "../../ImageCroper/Demo";
import DemoAi from "../../ImageCroper/DemoAi";
import CloseIcon from "@mui/icons-material/Close";


function AddUniversalRecommendation({ open, handleClose, onSuccess }) {
  const [exploreCatName, setExploreCatName] = useState("");
  const [catsId, setCatsId] = useState([{ cat_id: "" }]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); // Track all selected categories
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });

  const token = localStorage.getItem("authToken");
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
  const theme = useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(4 / 3);
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

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

  const fetchCategories = async (searchTerm) => {
    try {
      const response = await axios.get(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/api/v1/search-cat`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            s: searchTerm
          }
        }
      );
      
      console.log("response category= ", response);
      
      const categoryArray = response.data?.data;
      
      if (categoryArray && Array.isArray(categoryArray)) {
        // Merge with existing selected categories to prevent them from disappearing
        const existingSelected = selectedCategories;
        const newCategories = categoryArray.filter(cat => 
          !existingSelected.some(selected => selected.id === cat.id)
        );
        
        const mergedCategories = [...existingSelected, ...newCategories];
        setCategories(mergedCategories);
        
        console.log("merged categories= ", mergedCategories);
      } else {
        // If no new results, keep existing selected categories visible
        setCategories(selectedCategories);
      }
      
    } catch (error) {
      console.error("Error fetching categories:", error);
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to fetch categories."
      });
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchCategory.trim().length >= 1) { // Changed to 1 character
        fetchCategories(searchCategory);
      } else if (searchCategory.trim().length === 0) {
        // Show only selected categories when search is empty
        setCategories(selectedCategories);
      }
    }, 300); // Increased debounce time to 300ms

    return () => clearTimeout(delayDebounce);
  }, [searchCategory, selectedCategories]);

  // Initialize categories with selected ones on component mount
  useEffect(() => {
    setCategories(selectedCategories);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!finalImageUrl){
      setAlert({open:true, severity:"error",message:"Error : Please upload Image !"})
      return;
    }
    
    const payload = {
      explore_cat_name: exploreCatName,
      cats_id: catsId,
      myeats_explore_image_url: previewImage || ""
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/api/v1/admin/explore`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      onSuccess();
    } catch (error) {
      const errorMsg = error.response
        ? `Error: ${error.response.data.msg}`
        : "Error: Unable to process the request.";
      setAlert({
        open: true,
        severity: "error",
        message: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCatIdChange = (index, value) => {
    const updatedCatsId = [...catsId];
    updatedCatsId[index].cat_id = value?.id || "";
    setCatsId(updatedCatsId);

    // Add to selected categories if not already present
    if (value && !selectedCategories.some(cat => cat.id === value.id)) {
      setSelectedCategories(prev => [...prev, value]);
    }
  };

  const addNewCatId = () => {
    setCatsId([...catsId, { cat_id: "" }]);
  };

  const removeCatId = (index) => {
    const updatedCatsId = catsId.filter((_, i) => i !== index);
    setCatsId(updatedCatsId);
    
    // Remove from selected categories if no longer used
    const removedCatId = catsId[index].cat_id;
    const stillUsed = updatedCatsId.some(cat => cat.cat_id === removedCatId);
    
    if (!stillUsed && removedCatId) {
      setSelectedCategories(prev => prev.filter(cat => cat.id !== removedCatId));
    }
  };

  // Image upload section
  const imageUpload = async() => {
    if(!imageFile){
      setAlert({open:true,severity:"error",message:"Error: Please select an image !"})
      return
    }
    const file=imageFile;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "explore_food_category");
    console.log("file is:", file);
    
    try {
      setUploading(true)
      const response = await axios.post(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/api/admin/cf/v1/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("uploading image response- ", response);
      const imageUrl= response?.data?.customUrl;
      setFinalImageUrl(imageUrl);
      // setPreviewImage(imageUrl)
    } catch(e) {
      console.log("error during upload image-", e);
    }finally{
      setUploading(false)
    }
  };

  const handleImageChange = async(e) => {
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
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-ultra-generate-preview-06-06:predict?key=${process.env.VITE_GEMINI_KEY}`,
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
            <Typography variant="h5">Add Universal Recommendation</Typography>
            <IconButton onClick={handleClose}>
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
            {/* Image section */}
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

            {/* Explore Category Name */}
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Explore Category Name"
                variant="outlined"
                size="small"
                margin="dense"
                value={exploreCatName}
                onChange={(e) => setExploreCatName(e.target.value)}
                required
              />
            </Box>

            {/* Categories Section */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Categories
              </Typography>
              
            <Grid size={12}>
              {catsId.map((cat, index) => (
                <Grid container alignItems="center" spacing={1} key={index}>
                  <Grid size={9.5}>
                      <Autocomplete
                        options={categories}
                        onInputChange={(_, newInputValue) => {
                          setSearchCategory(newInputValue);
                        }}
                        onOpen={() => setCategories([])}
                        onClose={() => setCategories([])}
                        getOptionLabel={(option) => option.category_name || ""}
                        value={categories.find((c) => c.id === cat.cat_id) || null}
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
                  />
                </Grid>

                <Grid size={2.5}>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    fullWidth
                    onClick={() => removeCatId(index)}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
              ))}
              <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addNewCatId}
                  color="secondary"
                  variant="contained"
                  sx={{ mt: 1 }}
              >
                  Add New Category
              </Button>

            </Grid>
            </Box>
          </Box>
        </Paper>

        {/* Submit and Cancel Buttons */}
        <Box sx={{ p: 1, bgcolor: "#F7F7F7" }}>
          <Paper sx={{ display: "flex", gap: 1, padding: 1 }}>
            <Button 
              onClick={handleClose} 
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

        {/* Snackbar for success/failure messages */}
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
      </Box>
    </>
  );
}

export default AddUniversalRecommendation;