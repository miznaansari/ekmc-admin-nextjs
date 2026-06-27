import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
  Switch,
  Autocomplete,
  Avatar,
  Stack,
  Paper,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import CustomDropdown from "../../custom dropdown/CustomDropdown";
import debounce from 'lodash.debounce';
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from "@fluentui/react-icons";
import { Close } from "@mui/icons-material";
import Demo from "../../ImageCroper/Demo";

const AddRestaurantCombo = ({ open, handleClose,onSuccess }) => {
  const { control, handleSubmit, reset, setValue, watch  } = useForm({
    defaultValues: {
      cafe_list_id: "", // For selecting the café
      status: "active",
      price: "",
      combo_name: "",
      image_id:"",
      items: [], // To hold selected menu item ids
    },
  });

  const [cafes, setCafes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const selectedCafeId = watch("cafe_list_id");
  const selectedMenuItems = watch("extra"); 
  const token = localStorage.getItem("authToken");
  const [searchCafeQuery, setSearchCafequery]=useState("");
  const [previewImage, setPreviewImage]=useState("")
  const [uploading , setUploading]=useState(false);
  const [selectedItems , setSelectedItems]=useState([]);
  const [selectedCafeIdforFetchItems, setselectedCafeIdforFetchItems]=useState();
  const [searchItemQuery, setSearchItemQuery]=useState("");
  const [alert, setAlert] = useState({
                open: false,
                severity: "info",
                message: ""
            });
  const theme= useTheme();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(4 / 3);
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  // Fetch café list - Updated to work with 1 character
  const fetchDebounceCafes=useCallback(
    debounce (async (query) => {
      if (query.length < 1) { // Changed from 2 to 1
        setCafes([]); // Clear cafes for empty queries
        return;
      }
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_URL
          }/api/user/admin/cafe-list/get/all`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params:{
              s:query
            }
          }
        );
        const formattedData = response.data.data.map(item => ({
          value: item.id,
          label: item.cafe_name
        }));
        setCafes(formattedData);
      } catch (error) {
        console.error("Error fetching cafes:", error);
      }
    },300)
  )

  

  const fetchMenuItems = async () => {
    console.log("id in fetch menu items- ",selectedCafeIdforFetchItems)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/search-menu-item`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },params:{
            cafe_list_id:selectedCafeIdforFetchItems,
            s:searchItemQuery
          }
        }
      )

     console.log("item menu response- ", response)
      const formattedData = response.data.data.map(item => ({
        value: item.cafe_menu_item_id,
        label: item.item_name
      }));
      console.log("item menu - ", formattedData)
      setMenuItems(formattedData);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  // Updated useEffect for menu items to work with 1 character
  useEffect(()=>{
    const delayDebounce= setTimeout(()=>{
      if(searchItemQuery.trim().length >= 1){ // Changed from 2 to 1
        fetchMenuItems()
      }
    },300)
    return ()=> clearTimeout(delayDebounce)
  },[searchItemQuery, selectedCafeIdforFetchItems])



  // Modify items before submitting to match the required structure
  const onSubmit = async (data) => {
    setLoading(true);
    // Transform items array into the required structure: [{ cafe_menu_id: 1059 }, ...]
    // const transformedItems = data.items.map((id) => ({ cafe_menu_id: id }));
    const { extra,menu_item_id, ...filteredData } = data;
    console.log(menu_item_id ,"LKJJ")
    console.log(filteredData ,"mmm")
    const submissionData = {
      ...filteredData,
      // items: transformedItems, // Set transformed items to match API structure
    };

    const payload= {
      cafe_list_id:data.cafe_list_id,
      status:data.status === "active" ? 1 : 0,
      price:data.price,
      combo_name:data.combo_name,
      image_id:previewImage || "",
      items:data.items.map((item)=>({
        cafe_menu_id:item.value
      }))
    }

    console.log("payload- ", payload)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/cafe-combo`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // if (response.status === 201) {
      //   setSnackbarMessage("Combo added successfully");
      //   reset();
      // } else {
      //   setSnackbarMessage("Failed to add combo");
      // }
      // setSnackbarOpen(true);
      console.log("response on submit- ", response)
      if (response.status === 201) {
         onSuccess()
      }
     
    } catch (error) {
      // setSnackbarMessage(
      //   "Error: " + (error.response?.data?.msg || "Failed to add combo")
      // );
      setAlert({open:true, severity:"error", message:error.response?.data?.msg  || "Error: failed adding combo !!"})
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const handleDropdownChangeCafe = (selectedOption) => {
    setValue("cafe_list_id", selectedOption.value); // Store selected cafe ID
    fetchMenuItems(selectedOption.value)
  };
    const handleDropdownChangeMenuItems = (selectedOptions) => {
      setValue("extra", selectedOptions.value);
    const selectedIds = selectedOptions.map((option) => ({
      cafe_menu_id: option.value,
    }));
    setValue("items", selectedIds); // Store selected menu items in form state
  }
  //image upload = 
  
  const imageUpload =async(file)=>{
    const formData= new FormData();
    formData.append("file",file)
    formData.append("uploadType","cafe_menu_combo")
    console.log("file is:",file)
    try{
      setUploading(true)
      const response= await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/admin/cf/v1/upload`,formData,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      console.log(" uploading image response- ", response)
      const imageUrl= response?.data?.customUrl
      setPreviewImage(imageUrl || "")
    }catch(e){
      console.log("error during upload image-", e)
    }finally{
      setUploading(false)
    }
  }

  const handleImageChange = async(e)=>{
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOpenCropDialog(true);
      
    } 
  }

  const handleDelete= ()=>{
    setPreviewImage()
  }
  return (
    <>
      <Box position={"sticky"} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Add New Combo</Typography>
            <IconButton
              onClick={handleClose}
            >
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
      onSubmit={handleSubmit(onSubmit)}
    >
    <Paper sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, pt: 2, pb: 2 }}>
        

          <Box sx={{ textAlign: "center", mb: 2 }}>
                {previewImage ? (
                  <Avatar src={previewImage} sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }} />
                ) : (
                  <Avatar sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }}>
                    {uploading ? <CircularProgress/>:<Image32Regular color="black" />}
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
                    disabled={!previewImage}
                  >
                    Delete
                  </Button>
                </Stack>
          </Box>

          {/* Café List Dropdown */}
          <FormControl fullWidth sx={{ mb: 2 }}>
  <Autocomplete
    options={cafes}
    getOptionLabel={(option) =>
      typeof option === "string" ? option : option.label || ""
    }
    value={cafes.find((cafe) => cafe.value === selectedCafeId) || null}
    onChange={(event, newValue) => {
      if (newValue) {
        setCafes([]) // Clear cafes after selection
        setValue("cafe_list_id", newValue.value);
        setselectedCafeIdforFetchItems(newValue.value)
      } else {
        setValue("cafe_list_id", "");
      }
    }}
    onInputChange={(_, inputValue) => {
      setSearchCafequery(inputValue);
      fetchDebounceCafes(inputValue);
    }}
    onOpen={() => {
      // Clear cafes when dropdown opens
      setCafes([]);
    }}
    onClose={() => {
      // Clear cafes when dropdown closes
      setCafes([]);
    }}
    renderOption={(props, option) => (
      <li {...props} key={option.value}>
        {option.label}
      </li>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Restaurant Name"
        size="small"
        margin="dense"          
        onFocus={() => {
          // Clear cafes when input is focused
          setCafes([]);
        }}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {searchCafeQuery.trim().length >= 1 && loading ? (
                <CircularProgress size={20} sx={{ mr: 2 }} />
              ) : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    )}
  />
</FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            {/* Combo Name */}
            <Controller
              name="combo_name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Combo Name" 
                size="small"
                margin="dense" 
                required fullWidth />
              )}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Price"
                size="small"
                margin="dense" 
                required fullWidth />
              )}
            />
          </FormControl>

          {/* Cafe menu items */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Controller
              name="items"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  multiple
                  options={menuItems || []}
                  getOptionLabel={(option) => option.label}
                  getOptionKey={(option)=>{
                    option.value
                  }}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  value={value || []}
                  onChange={(_, newValue) => onChange(newValue)}
                  onInputChange={(_,newInputValue)=>{
                    setMenuItems([]);
                    setSearchItemQuery(newInputValue)
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.value}>
                        {option.label}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Select Menu Items" 
                      size="small"
                      margin="dense"  
                    />
                  )}
                />
              )}
            />
          </FormControl>

          {/* Active Status */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography>Active</Typography>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Switch
                  {...field}
                  color="secondary"
                  checked={field.value === "active"}
                  onChange={(e) =>
                    field.onChange(e.target.checked ? "active" : "inactive")
                  }
                />
              )}
            />
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
              type="submit" sx={{ flex: 1 }} variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : null}
            >
              Save
            </Button>
          </Paper>
          </Box>

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

export default AddRestaurantCombo;