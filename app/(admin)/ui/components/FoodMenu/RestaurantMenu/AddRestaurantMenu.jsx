import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Switch, FormControlLabel, Typography, Snackbar, Alert,
  CircularProgress, Drawer, Grid, Autocomplete, IconButton, Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
  Avatar,
  MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller, set } from 'react-hook-form';
import axios from 'axios';
import RightDrawer from '../../RightDrawer/RightDrawer';
import { Close } from '@mui/icons-material';
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from '@fluentui/react-icons';
import Demo from '../../ImageCroper/Demo';

const AddRestaurantMenu = ({ open, onClose ,onSuccess}) => {
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      cafe_list_id: null,              
      menu_category_id: null, 
      menu_category_name:'',         
      uni_cat_name: null,   
      uni_item_name: '',             
      description: '',               
      food_type: '1',                
      base_price: '',                
      gst_rate: '5',                 
      measuring_unit: '',            
      spice_level: '0',              
      is_addon_compulsory: 0,    
      is_chef_special: 0,
      is_exclusive: 0,
      is_new: 0,
      is_recommended:  0,
      is_seasonal: 0,
      is_signature: 0,
      is_takeaway: 0,
      is_variation_compulsory: 0,
      items: [{ addon_name: '', addon_price: '' ,addon_status: 0 }],  // Changed to 0
      itemss: [{ variant_name: '', variant_price: '', variant_status: 0 }],  // Added variant_status
      status: 0,
      cafe_menu_item_nick_name:"",
      cafe_menu_category_nick_name:""
      
    }
  });
  const theme= useTheme()
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cafes, setCafes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [universalCategories, setUniversalCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const selectedCafe = watch("cafe_list_id") 
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [previewImage, setPreviewImage]=useState("");
  const [uploading, setUploading]=useState(false);
  const [searchMenuItem, setSearchMenuItem] = useState("");
  const [alert, setAlert] = useState({
              open: false,
              severity: "info",
              message: ""
          });
  
  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(4 / 3);
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };
  

  const token = localStorage.getItem('authToken');
  const baseurl= process.env.VITE_REACT_APP_BACKEND_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cafesRes, categoriesRes, universalCategoriesRes, menuItemsRes] = await Promise.all([
          // axios.get(`${process.env.VITE_REACT_APP_BACKEND_URL}/api/user/admin/cafe-list/get/all`, {
          //   headers: { Authorization: `Bearer ${token}` }
          // }),
          axios.get(`${process.env.VITE_REACT_APP_BACKEND_URL}/api/v1/search-cat`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          // axios.get(`${process.env.VITE_REACT_APP_BACKEND_URL}/api/v1/universal-categories?pageno=1&limits=1000`, {
          //   headers: { Authorization: `Bearer ${token}` }
          // }),
          // axios.get(`${process.env.VITE_REACT_APP_BACKEND_URL}/api/v1/search-item`, {
          //   headers: { Authorization: `Bearer ${token}` }
          // })  
        ]);

        //setCafes(cafesRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
       // setUniversalCategories(universalCategoriesRes.data.data.data || []);
        //setMenuItems(menuItemsRes.data.data || []);
      } catch (error) {
        console.log('Failed to fetch data:', error);
        setSnackbarMessage('Failed to fetch data');
        setSnackbarOpen(true);
      }
    };

    fetchData();
  }, [token]);

  const onSubmit = async (data) => {
    // Ensure all addons have addon_status field, default to 0 if missing
    const addons = data.items
      .filter(item => item.addon_name !== '' && item.addon_price !== '')
      .map(item => ({
        ...item,
        addon_status: item.addon_status !== undefined ? item.addon_status : 0
      })) || [];
    
    // Ensure all variants have variant_status field, default to 0 if missing
    const variants = data.itemss
      .filter(item => item.variant_name !== '' && item.variant_price !== '')
      .map(item => ({
        ...item,
        variant_status: item.variant_status !== undefined ? item.variant_status : 0
      })) || [];
    
    console.log("addons -", addons)
    console.log("variants -", variants)
    
    const payload = {
      ...data,
      cafe_list_id: data.cafe_list_id?.value,
      items: addons,   // Pass filtered addons with status
      itemss: variants, // Pass filtered variants with status
       // Convert status string to integer
      image_id:previewImage || "",
      uni_cat_name:data.uni_cat_name.label,
      is_exclusive:data.is_exclusive  ? 1 :0,
      //uni_item_name:data.menu_category_id,
      is_addon_compulsory:data.is_addon_compulsory,
      uni_item_name:data.menu_category_id.label

      
    };
    console.log("payload:",payload)
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/api/v1/cafe-menu-item`,
        payload,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      console.log("response on sublmit= ",response)
      //setSnackbarMessage(response.status === 201 ? 'Menu item added successfully' : 'Failed to add menu item');
      setSnackbarOpen(true);
      if(response.status === 201){

        onSuccess();
      }
      reset();
      setPreviewImage()
    } catch (error) {
      console.log("error during on submit",error)
      //setSnackbarMessage('Error: ' + (error.response?.data?.msg || 'Failed to add menu item'));
      const message = 'Error= ' + (error?.response?.data?.msg || 'Failed to add menu item');

      setAlert({open:true, severity:"error", message:message})
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      //onClose();
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const watchAddons = watch('items', [{ addon_name: '', addon_price: '', addon_status: 0 }]);
  const addAddon = () => {
    const addons = [...watchAddons];
    addons.push({ addon_name: '', addon_price: '' ,addon_status: 0 }); // Ensure default status is 0
    reset({ ...watch(), items: addons });
  };
  const removeAddon = (index) => {
    const addons = [...watchAddons];
    addons.splice(index, 1);
    reset({ ...watch(), items: addons });
  };

  const watchVariants = watch('itemss', [{ variant_name: '', variant_price: '', variant_status: 0 }]);
  const addVariant = () => {
    const variants = [...watchVariants];
    variants.push({ variant_name: '', variant_price: '', variant_status: 0 }); // Added default status
    reset({ ...watch(), itemss: variants });
  };
  const removeVariant = (index) => {
    const variants = [...watchVariants];
    variants.splice(index, 1);
    reset({ ...watch(), itemss: variants });
  };
  //fetch cafes

  const [searchCafeQuery, setSearchCafeQuery]=useState("");

  const fetchCafeList= async()=>{
    try{
      const response= await axios.get(`${baseurl}/api/user/admin/cafe-list/get/all`,{
        headers:{
          Authorization:`Bearer ${token}`
        },
        params:{
          s:searchCafeQuery
        }
      })
      console.log("cafes= ", response.data.data)
      const options= response.data.data?.map((cafe)=>({
        label:cafe.cafe_name,
        value:cafe.id
      }))
      setCafes(options);
      console.log("options= ",options)
    }catch(e){
      console.log("error during cafe fetching:",e)
    }
  }

  useEffect(()=>{
    console.log("inside useeffect of search cafe query")
    const delayDebounce= setTimeout(()=>{
      if(searchCafeQuery.trim().length>= 1){
        fetchCafeList();
      }
    },300)

    return ()=> clearTimeout(delayDebounce)
   
  },[searchCafeQuery])

  //menuc items

  const fetchMenuItems= async()=>{
    const cafeId= selectedCafe;
    console.log("cafe id:",cafeId)
    try{
      const response= await axios.get(`${baseurl}/api/v1/search-item/`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          },
          params:{
            s:searchMenuItem
          }
        },
      )
      console.log("response of menu items:",response)
      const menuItemsOptions= response.data.data;
      console.log("menu items options- ", menuItemsOptions)
      setMenuItems(menuItemsOptions)
    }catch(e){
      console.log("error during fetch munu by id",e)
    }
  }

  useEffect(()=>{
    const delayDebounce= setTimeout(()=>{
      if(searchMenuItem.trim().length >= 1){
        setMenuItems([])
        fetchMenuItems();
      }
    },300)
    return ()=> clearTimeout(delayDebounce)
    
  },[searchMenuItem])

  //fetch universal category
  const [searchCtagory, setSearchCatagory]=useState("");


  const fetchUniversalCatagory= async()=>{
    try{
      const response= await axios.get(`${baseurl}/api/v1/universal-categories`,
        {
          headers:{
            Authorization:`Bearer ${token}`
          },
          params:{
            s:searchCtagory
          }
        }
      )
      console.log("universal category= ",response.data.data.data)
      const categoryOptions= response.data?.data?.data?.map((category)=>({
        label:category.category_name,
        value:category.id
      }))
      console.log("category options= ",categoryOptions)
      setUniversalCategories(categoryOptions)
    }catch(e){
      console.log("error during fetching universal category= ", e)

    }
  }

  useEffect(()=>{
    const delayDebounce= setTimeout(()=>{
      if(searchCtagory.trim().length >=1){
        fetchUniversalCatagory();
      }
    },300)
    return ()=> clearTimeout(delayDebounce);
  },[searchCtagory])

  //uload image api= 
  const uploadImage= async(file)=>{
        const formData= new FormData();
        formData.append("file",file)
        formData.append("uploadType","cafe_menu_item")
        console.log("file is:",file)
    try{
      const response= await axios.post(`${baseurl}/api/admin/cf/v1/upload`,formData,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      console.log("response of image upload- ", response)
      const imageUrl=  response.data.customUrl
      setPreviewImage(imageUrl || "")
      
    }
    catch(e){
      console.log("error during upload image - ", e)
    }
 }

 const handleImageChange = async(e)=>{
  const file = e.target.files[0];
  try{
    setUploading(true)
    if(file){
    const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOpenCropDialog(true);
      e.target.value = '';
  }
  }catch(e){console.log("error during upload image")}finally{setUploading(false)}
  
 }
 const handleDelete= ()=>{
  setPreviewImage()
 }

  // Helper function to create enhanced options with "Add new" option
  const createEnhancedOptions = (options, searchValue, type) => {
    const enhancedOptions = [...options];
    
    // Add "Add new" option if search value exists and no exact match found
    if (searchValue && searchValue.trim() !== '') {
      const exactMatch = options.some(option => 
        option.label.toLowerCase() === searchValue.toLowerCase()
      );
      
      if (!exactMatch) {
        enhancedOptions.unshift({
          label: `Add new "${searchValue}"`,
          value: `new_${type}_${searchValue}`,
          isNew: true,
          originalText: searchValue
        });
      }
    }
    
    return enhancedOptions;
  };

  // Enhanced menu items with "Add new" option
  const enhancedMenuItems = createEnhancedOptions(
    menuItems.map(item => ({
      label: item.item_name,
      value: item.item_name,
      item_name: item.item_name
    })),
    searchMenuItem,
    'menu'
  );

  // Enhanced universal categories with "Add new" option
  const enhancedUniversalCategories = createEnhancedOptions(
    universalCategories,
    searchCtagory,
    'category'
  );

  return (
    <Drawer
disableEnforceFocus       anchor="right"
       PaperProps={{
          sx: { width:  isSmallScreen? "100%":550, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
        }}   open={open} onClose={onClose} 
    >
      <Box>
        <Box position="sticky" top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
            <Paper sx={{ padding: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Add Item</Typography>
                <IconButton 
                  onClick={onClose}
                >
                  <Close />
                </IconButton>
              </Stack>
            </Paper>
          </Box>

         <Box
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
          <Paper>
            <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, pt: 2 }}>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                    {previewImage ? (
                      <Avatar src={previewImage} sx={{ width: 'auto', height: "auto", margin: 'auto', borderRadius: '10px' }} />
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
            <Grid container spacing={2}>
              {/* Cafe List */}
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="cafe_list_id"
                  control={control}
                  render={({ field :{onChange, value}}) => (
                    <Autocomplete
                      options={cafes}
                      getOptionKey={(option)=>option.value}
                      getOptionLabel={(option)=>option.label}
                      isOptionEqualToValue={(option, value) =>
                         option.value === value.value
                        }
                      value={value}
                      onChange={(_, newValue) => (onChange(newValue), console.log("selected cafeid-",newValue) )}
                      onInputChange={(_, inputValue) => {
                        setCafes([]);
                        setMenuItems([])
                        setSearchCafeQuery(inputValue);
                      }}
                      
                      renderInput={(params)=>(
                        <TextField
                          {...params}
                          label="Tag cafe"
                          variant="outlined"
                          size="small"
                          margin="dense"
                        />
                      )
                        
                      }

                    />
                  )}
                />
              </Grid>

              {/* Menu Category - Enhanced with "Add new" option */}
              {/* <Grid item xs={12} sm={6}>
                <Controller
                  name="menu_category_id"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={enhancedMenuItems}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value}
                      value={enhancedMenuItems.find(item => item.value === field.value) || null}
                      onInputChange={(_, newInputValue) => {
                        setMenuItems([])
                        setSearchMenuItem(newInputValue)
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Universal Menu" 
                          size="small"
                          margin="dense"
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.value}>
                          <Box sx={{ 
                            color: option.isNew ? '#1976d2' : 'inherit',
                            fontWeight: option.isNew ? 'bold' : 'normal'
                          }}>
                            {option.label}
                          </Box>
                        </li>
                      )}
                      onChange={(_, value) => {
                        if (value?.isNew) {
                          // If "Add new" option is selected, use the original text
                          field.onChange(value.originalText);
                        } else {
                          field.onChange(value?.item_name || value?.value || '');
                        }
                      }}
                    />
                  )}
                />
              </Grid> */}

              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Controller
                  name="menu_category_id"
                  control={control}
                  rules={{ required: 'Please select a valid Universal Category' }} 
                  render={({ field:{onChange,value} }) => (
                    <Autocomplete
                      options={enhancedMenuItems}
                      getOptionKey={(option)=>option.value}
                      value={value|| null}
                      isOptionEqualToValue={(option, value) =>
                        option?.value === value?.value
                       }
                      getOptionLabel={(option) => option.label}
                      onChange={(_, newValue) => {
                        if (newValue?.isNew) {
                          // Create a new category object with the original text
                          const newCategory = {
                            label: newValue.originalText,
                            value: `new_${Date.now()}`, // temporary ID
                            isNew: true
                          };
                          onChange(newCategory);
                          console.log("selected new category -", newCategory.label);
                        } else {
                          onChange(newValue);
                          console.log("selected existing category -", newValue?.label);
                        }
                      }}
                      onInputChange={(_, newInputValue) => {
                        setMenuItems([])
                        setSearchMenuItem(newInputValue)
                      }}
                      renderInput={(params) => 
                        <TextField {...params} 
                        label="Universal Menu" 
                        variant="outlined"
                          size="small"
                          margin="dense"
                        />}
                      renderOption={(props, option) => (
                        <li {...props} key={option.value}>
                          <Box sx={{ 
                            color: option.isNew ? '#1976d2' : 'inherit',
                            fontWeight: option.isNew ? 'bold' : 'normal'
                          }}>
                            {option.label}
                          </Box>
                        </li>
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Universal Category - Enhanced with "Add new" option */}
              <Grid size={12}>
                <Controller
                  name="uni_cat_name"
                  control={control}
                  rules={{ required: 'Please select a valid Universal Category' }} 
                  render={({ field:{onChange,value} }) => (
                    <Autocomplete
                      options={enhancedUniversalCategories}
                      getOptionKey={(option)=>option.value}
                      value={value}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value?.value
                       }
                      getOptionLabel={(option) => option.label}
                      onChange={(_, newValue) => {
                        if (newValue?.isNew) {
                          // Create a new category object with the original text
                          const newCategory = {
                            label: newValue.originalText,
                            value: `new_${Date.now()}`, // temporary ID
                            isNew: true
                          };
                          onChange(newCategory);
                          console.log("selected new category -", newCategory.label);
                        } else {
                          onChange(newValue);
                          console.log("selected existing category -", newValue?.label);
                        }
                      }}
                      onInputChange={(_,newInputValue)=>{
                        setUniversalCategories([]);
                        setSearchCatagory(newInputValue)
                      }}
                      renderInput={(params) => 
                        <TextField {...params} 
                        label="Universal Category" 
                        variant="outlined"
                          size="small"
                          margin="dense"
                        />}
                      renderOption={(props, option) => (
                        <li {...props} key={option.value}>
                          <Box sx={{ 
                            color: option.isNew ? '#1976d2' : 'inherit',
                            fontWeight: option.isNew ? 'bold' : 'normal'
                          }}>
                            {option.label}
                          </Box>
                        </li>
                      )}
                    />
                  )}
                />
              </Grid>

              {/* Item Name */}
              <Grid size={12}>
                <Controller
                  name="cafe_menu_item_nick_name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Item Nickname" size="small"
                          margin="dense" fullWidth />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="cafe_menu_category_nick_name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Category Nicname" size="small"
                      margin="dense" fullWidth />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="zomato_price"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="zomato_price" size="small"
                          margin="dense" fullWidth />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="swiggy_price"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="swiggy_price" size="small"
                          margin="dense" fullWidth />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="gst_rate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="GST Rate"
                      select
                      size="small"
                      margin="dense"
                      fullWidth
                    >
                      {[0, 5, 12, 18, 28].map((rate) => (
                        <MenuItem key={rate} value={rate}>
                          {rate}%
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              {/* Description */}
              <Grid size={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Description" size="small"
                          margin="dense" multiline fullWidth rows={3} />
                  )}
                />
              </Grid>

              {/* Food Type */}
              <Grid size={6}>
                <Controller
                  name="food_type"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={[{ id: '1', label: 'Veg' }, { id: '0', label: 'Non-Veg' }, { id: '2', label: 'Egg' }]}
                      getOptionLabel={(option) => option.label}
                      renderInput={(params) => <TextField {...params} label="Food Type" size="small"
                          margin="dense"/>}
                      onChange={(_, value) => field.onChange(value?.id)}
                    />
                  )}
                />
              </Grid>

              {/* Base Price */}
              <Grid size={6}>
                <Controller
                  name="base_price"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Base Price" type="number" size="small"
                          margin="dense" fullWidth />
                  )}
                />
              </Grid>
              {/* spice level  */}
              <Grid size={12}>
                <FormControl>
                  <FormLabel>Spice Level</FormLabel>
                  <Controller
                    name="spice_level"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup row {...field}>
                        <FormControlLabel value="0" control={<Radio color="secondary"/>} label="None" />
                        <FormControlLabel value="1" control={<Radio color="secondary" />} label="Mild Spicy" />
                        <FormControlLabel value="2" control={<Radio color="secondary" />} label="Medium Spicy" />
                        <FormControlLabel value="3" control={<Radio color="secondary"/>} label="Very Spicy" />
                      </RadioGroup>
                    )}
                  />
                </FormControl>
              </Grid>

              {/* exclusive */}
              
              {/* Switch Items - 4 rows with 2 items each */}
              <Grid size={12}>
                <Typography variant="h6" mb={1}>Item Properties</Typography>
                <Grid container spacing={2}>
                  {/* Row 1 */}
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                        Exclusive
                      </Typography>
                      <Controller
                        name="is_exclusive"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                        Recommended
                      </Typography>
                      <Controller
                        name="is_recommended"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Row 2 */}
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                        Chef Special
                      </Typography>
                      <Controller
                        name="is_chef_special"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                        Is New
                      </Typography>
                      <Controller
                        name="is_new"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  {/* Row 3 */}
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                        Is Seasonal
                      </Typography>
                      <Controller
                        name="is_seasonal"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                       Is Signature
                      </Typography>
                      <Controller
                        name="is_signature"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>


                  {/* Row 4 */}
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                        Addon Compulsory
                      </Typography>
                      <Controller
                        name="is_addon_compulsory"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                        Variation Compulsory
                      </Typography>
                      <Controller
                        name="is_variation_compulsory"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                        Takeaway
                      </Typography>
                      <Controller
                        name="is_takeaway"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2">
                        Active
                      </Typography>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked?1:0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

                <Grid size={12}>
                  <Controller
                    name="measuring_unit"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Measuring Unit" size="small"
                        margin="dense" fullWidth />
                    )}
                  />
                </Grid>
                        
              {/* Add-ons */}
              <Grid size={12}>
                <Typography variant="h6">Add-ons</Typography>
                {watchAddons.map((addon, index) => (
                  <Grid container spacing={2} key={index}>
                    <Grid size={5}>
                      <Controller
                        name={`items[${index}].addon_name`}
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Addon Name" size="small"
                          margin="dense" fullWidth />
                        )}
                      />
                    </Grid>
                    <Grid size={5}>
                      <Controller
                        name={`items[${index}].addon_price`}
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Price" type="number" size="small"
                          margin="dense" fullWidth />
                        )}
                      />
                    </Grid>
                    <Grid size={2}>
                      <IconButton onClick={() => removeAddon(index)}>
                        <Button variant='outlined' color='error' size="small" fullWidth>
                          Remove
                        </Button>
                      </IconButton>
                    </Grid>
                    <Grid size={6}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2">
                        Active Status
                      </Typography>
                      <Controller
                        name={`items[${index}].addon_status`}
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  </Grid>
                  
                ))}
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addAddon}
                  color="secondary"
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Add New Addon
                </Button>
              </Grid>

              {/* Variants */}
              <Grid size={12}>
                <Typography variant="h6">Variants</Typography>
                {watchVariants.map((variant, index) => (
                  <Grid container spacing={2} key={index}>
                    <Grid size={5}>
                      <Controller
                        name={`itemss[${index}].variant_name`}
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Variant Name" size="small"
                          margin="dense" fullWidth />
                        )}
                      />
                    </Grid>
                    <Grid size={5}>
                      <Controller
                        name={`itemss[${index}].variant_price`}
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Price" type="number" size="small"
                          margin="dense" fullWidth />
                        )}
                      />
                    </Grid>
                    <Grid size={2}>
                      <IconButton onClick={() => removeAddon(index)}>
                        <Button variant='outlined' color='error' size="small" fullWidth>
                          Remove
                        </Button>
                      </IconButton>
                    </Grid>
                    <Box marginLeft={2} sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2">
                        Active Status
                      </Typography>
                      <Controller
                        name={`itemss[${index}].variant_status`}
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked  ? 1 : 0)}
                            color="secondary"
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                ))}
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addVariant}
                  color="secondary"
                  variant="contained"
                  sx={{ mt: 1 }}
                >
                  Add New Variant
                </Button>
              </Grid>
            </Grid>
            </Box>
            </Paper>
              {/* Save Button */}
              <Box position="sticky" bottom={0} sx={{ width: "100%", p: 2, zIndex: 999, bgcolor: "#F7F7F7", display: "flex", gap: 1 }}>
                <Paper sx={{ width: "100%", display: "flex", gap: 1, padding: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ flex: 1 }}
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" sx={{ flex: 1 }} variant="contained">
                      {loading ? <CircularProgress></CircularProgress> : "Save"}
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
    </Drawer>
  );
};

export default AddRestaurantMenu;
