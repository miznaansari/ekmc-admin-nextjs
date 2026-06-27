import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Switch, FormControlLabel, Typography, Snackbar, Alert,
  CircularProgress, Drawer, Grid, Autocomplete, IconButton, RadioGroup, Radio, FormControl, FormLabel,
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
  Avatar,
  MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import RightDrawer from '../../RightDrawer/RightDrawer';
import { Close } from '@mui/icons-material';
import { CloudArrowUp16Regular, Delete16Regular, Image32Regular } from '@fluentui/react-icons';
import Demo from '../../ImageCroper/Demo';

const EditRestaurantMenu = ({ open, onClose, cafeItemId, onCancel }) => {
  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      cafe_list_id: '',
      menu_category_id: '',
      uni_cat_name: '',
      uni_item_name: '',
      description: '',
      food_type: '1',
      base_price: '',
      gst_rate: '5',
      measuring_unit: '',
      spice_level: '0',
      is_addon_compulsory: false,
      is_chef_special: false,
      is_exclusive: false,
      is_new: false,
      is_recommended: false,
      is_seasonal: false,
      is_signature: false,
      is_takeaway: false,
      is_variation_compulsory: false,
      items: [{ addon_name: '', addon_price: '',addon_status:1 }],
      itemss: [{ variant_name: '', cafe_menu_variant_price: '' ,variant_status:1}],
      zomato_price: '',
      swiggy_price: '',
      status: 1,
      cafe_menu_category_nick_name:"",
      cafe_menu_item_nick_name:""
    }
  });
  
  const theme = useTheme();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [cafes, setCafes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('authToken');
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [previewImage, setPreviewImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });

  // Universal Category states
  const [searchUniversalCategory, setSearchUniversalCategory] = useState("");
  const [universalCategories, setUniversalCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Universal Menu states
  const [searchUniversalMenu, setSearchUniversalMenu] = useState("");
  const [universalMenus, setUniversalMenus] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
  const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
  const [aspectRatio] = useState(4 / 3);
  
  const handleCropClose = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cafesRes, universalCategoriesRes, menuItemsRes] = await Promise.all([
          // Commented out API calls - uncomment as needed
        ]);
        // setCafes(cafesRes.data.data || []);
        // setUniversalCategories(universalCategoriesRes.data.data.data || []);
        // setMenuItems(menuItemsRes.data.data || []);
      } catch (error) {
        // Handle errors
      }
    };

    fetchData();

    if (cafeItemId) {
      fetchMenuItem(cafeItemId);
    }
  }, [cafeItemId, token]);

  const fetchMenuItem = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/v1/cafe-menu-item/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });



      const menuItem = response.data.allTables[0];
      
      // Pre-fill form fields with fetched data
      setValue('cafe_list_id', menuItem.cafe_list_id);
      setValue('menu_category_id', menuItem.universal_menu_category_id);
      setValue('uni_cat_name', menuItem.category_name);
      setValue('uni_item_name', menuItem.item_name);
      setValue('description', menuItem.description);
      setValue('food_type', menuItem.food_type.toString());
      setValue('base_price', menuItem.base_price);
      setValue('gst_rate', menuItem.gst_rate);
      setValue('measuring_unit', menuItem.measuring_unit);
      setValue('spice_level', menuItem.spice_level.toString());
      setValue('is_addon_compulsory', !!menuItem.is_addon_compulsory);
      setValue('is_chef_special', !!menuItem.is_chef_special);
      setValue('is_exclusive', !!menuItem.is_exclusive_offer);
      setValue('is_new', !!menuItem.is_new);
      setValue('is_recommended', !!menuItem.is_recommended);
      setValue('is_seasonal', !!menuItem.is_seasonal);
      setValue('is_signature', !!menuItem.is_signature);
      setValue('zomato_price', menuItem.zomato_price);
      setValue('swiggy_price', menuItem.swiggy_price);
      setValue('status', menuItem.status);
      //setValue('items', menuItem.addon_list || []);
      //setValue('itemss', menuItem.menu_variant || []);
      setPreviewImage(menuItem.cmi_cf_original_image_url || "");
      setValue('cafe_menu_item_nick_name',menuItem.cafe_menu_item_nick_name || menuItem.item_name)
      setValue('cafe_menu_category_nick_name',menuItem.cafe_menu_category_nick_name || menuItem.category_name)

      setValue('items', (menuItem.addon_list || []).map(addon => ({
        addon_name: addon.addon_name,
        addon_price: addon.addon_price,
        addon_status: Boolean(addon.status),
      })));

      setValue('itemss',(menuItem.menu_variant || []).map(variant=>({
        variant_name: variant.variant_name || '',
        cafe_menu_variant_price: variant.cafe_menu_variant_price,
        variant_status: Boolean(variant.status)
      })))

      console.log("variant list =", menuItem.menu_variant)
      // Set pre-rendered options for autocompletes
      if (menuItem.category_name) {
        setUniversalCategories(prev => {
          const exists = prev.some(cat => cat.label === menuItem.category_name);
          if (!exists) {
            return [...prev, { label: menuItem.category_name, value: menuItem.universal_menu_category_id }];
          }
          return prev;
        });
      }

      if (menuItem.item_name) {
        setUniversalMenus(prev => {
          const exists = prev.some(menu => menu.label === menuItem.item_name);
          if (!exists) {
            return [...prev, { label: menuItem.item_name, value: menuItem.id }];
          }
          return prev;
        });
      }

    } catch (error) {
      setSnackbarMessage('Error fetching menu item data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const addons = data.items.filter(item => item.addon_name !== '' && item.addon_price !== '') || [];
    const variants = data.itemss.filter(item => item.variant_name !== '' && item.variant_price !== '') || [];
    
    const payload = {
      image_id: previewImage || '',
      uni_item_name: data.uni_item_name || '',
      status: data.status ? 1 : 0,
      uni_cat_name: data.uni_cat_name || '',
      food_type: data.food_type || '',
      description: data.description || '',
      base_price: data.base_price || '',
      gst_rate: data.gst_rate || '',
      measuring_unit: data.measuring_unit || '',
      spice_level: data.spice_level || '',
      is_exclusive: data.is_exclusive ? 1 : 0,
      is_recommended: data.is_recommended ? 1 : 0,
      is_chef_special: data.is_chef_special ? 1 : 0,
      is_new: data.is_new ? 1 : 0,
      is_seasonal: data.is_seasonal ? 1 : 0,
      is_signature: data.is_signature ? 1 : 0,
      is_addon_compulsory: data.is_addon_compulsory ? 1 : 0,
      is_variation_compulsory: data.is_variation_compulsory ? 1 : 0,
      is_takeaway: data.is_takeaway ? 1 : 0,
      items: addons.map(addon => ({
        addon_name: addon.addon_name || '',
        addon_price: addon.addon_price || '',
        addon_status: addon.addon_status ? 1 : 0,
      })),
      itemss: variants.map(variant => ({
        variant_name: variant.variant_name || '',
        variant_price: variant.cafe_menu_variant_price || '',
        variant_status: variant.variant_status ? 1 : 0
      })),
      cafe_menu_category_nick_name: data.cafe_menu_category_nick_name,
      cafe_menu_item_nick_name: data.cafe_menu_item_nick_name,
      swiggy_price:data.swiggy_price,
      zomato_price:data.zomato_price
    };
  
    console.log("payload-", payload)
    setLoading(true);
    try {
      const response = await axios.put(
        `${baseUrl}/api/v1/cafe-menu-item/${cafeItemId}`,
        payload,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
  
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      const message = 'Error: ' + (error?.response?.data?.msg || 'Failed to update menu item');
      setAlert({ open: true, severity: "error", message: message });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const watchAddons = watch('items', [{ addon_name: '', addon_price: '' ,addon_status: true}]);
  const addAddon = () => {
    const addons = [...watchAddons];
    addons.push({ addon_name: '', addon_price: '' ,addon_status: true});
    reset({ ...watch(), items: addons });
  };
  const removeAddon = (index) => {
    const addons = [...watchAddons];
    addons.splice(index, 1);
    reset({ ...watch(), items: addons });
  };

  const watchVariants = watch('itemss', [{ variant_name: '', cafe_menu_variant_price: '' ,variant_status:true}]);
  const addVariant = () => {
    const variants = [...watchVariants];
    variants.push({ variant_name: '', cafe_menu_variant_price: '' ,variant_status:true});
    reset({ ...watch(), itemss: variants });
  };
  const removeVariant = (index) => {
    const variants = [...watchVariants];
    variants.splice(index, 1);
    reset({ ...watch(), itemss: variants });
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadType", "cafe_menu_item");
    
    try {
      const response = await axios.post(`${baseUrl}/api/admin/cf/v1/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const imageUrl= response.data.customUrl;
      setPreviewImage(imageUrl || "")
    } catch (e) {
      console.log("error during upload image = ", e);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    try {
      setUploading(true);
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setSelectedImage(imageUrl);
        setOpenCropDialog(true);
      }
    } catch (e) {
      console.log("error during upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    setPreviewImage('');
  };

  // Fetch universal category with debounce
  const fetchUniversalCategory = async (searchTerm = "") => {
    setCategoryLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/v1/universal-categories`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          s: searchTerm
        }
      });

      console.log("response of fetch universal category- ", response?.data?.data?.data);
      const formattedData = response?.data?.data?.data?.map((cat) => ({
        label: cat.category_name,
        value: cat.id
      })) || [];

      console.log("universal categories formatted data =", formattedData);
      setUniversalCategories(formattedData);
    } catch (e) {
      console.log("error during fetch universal category= ", e);
      setUniversalCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Fetch universal menu with debounce
  const fetchUniversalMenu = async (searchTerm = "") => {
    setMenuLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/v1/universal-item`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          s: searchTerm
        }
      });

      console.log("universal menu response- ", response);
      const formattedData = response?.data?.data?.data?.map((item) => ({
        label: item.item_name,
        value: item.id
      })) || [];

      setUniversalMenus(formattedData);
    } catch (e) {
      console.log("error during fetch universal item- ", e);
      setUniversalMenus([]);
    } finally {
      setMenuLoading(false);
    }
  };

  // Debounced effect for universal category search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchUniversalCategory.trim().length >= 1) {
        fetchUniversalCategory(searchUniversalCategory);
      } else if (searchUniversalCategory.trim().length === 0) {
        fetchUniversalCategory(); // Fetch all when search is empty
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchUniversalCategory]);

  // Debounced effect for universal menu search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchUniversalMenu.trim().length >= 1) {
        fetchUniversalMenu(searchUniversalMenu);
      } else if (searchUniversalMenu.trim().length === 0) {
        fetchUniversalMenu(); // Fetch all when search is empty
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchUniversalMenu]);

  // Initial load
  useEffect(() => {
    fetchUniversalCategory();
    fetchUniversalMenu();
  }, []);

  return (
    <Drawer 
      anchor="right"
      PaperProps={{
        sx: { 
          width: isSmallScreen ? "100%" : 550, 
          p: 0, 
          margin: "0px", 
          height:"100vh", 
          bgcolor: "#F7F7F7",
          display: 'flex',
          flexDirection: 'column'
        },
      }}   
      open={open} 
      onClose={onCancel}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <CircularProgress/>
        </Box>
      ) : (
        <>
          {/* Fixed Header */}
          <Box position="sticky" top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
            <Paper sx={{ padding: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Edit Menu Item</Typography>
                <IconButton onClick={onCancel}>
                  <Close />
                </IconButton>
              </Stack>
            </Paper>
          </Box>

          {/* Scrollable Content Area */}
          <Box 
            sx={{ 
              flex: 1,
              overflow: 'auto',
              p: 1,
              //paddingBottom: { xs: '80px', sm: '20px' } // Extra space for mobile buttons
            }}
          >
            <Paper sx={{ p: 2 }}>
              {/* Image Upload Section */}
              <Box sx={{ textAlign: "center", mb: 3 }}>
                {previewImage ? (
                  <Avatar 
                    src={previewImage} 
                    sx={{ 
                      width: 'auto', 
                      height: "auto", 
                      maxHeight: { xs: '200px', sm: '300px' },
                      margin: 'auto', 
                      borderRadius: '10px' 
                    }} 
                  />
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
                    disabled={uploading}
                  >
                    Upload Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      hidden 
                      onChange={handleImageChange}
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

              {/* Form Content */}
              <Grid container spacing={2}>
                {/* Universal Category */}
                <Grid size={6}>
                  <Controller
                    name="uni_cat_name"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => {
                      const selectedOption = universalCategories.find(cat => cat.label === value) || null;
                      
                      return (
                        <Autocomplete
                          {...field}
                          options={universalCategories}
                          getOptionLabel={(option) => typeof option === 'string' ? option : option.label || ''}
                          value={selectedOption}
                          onChange={(event, newValue) => {
                            onChange(newValue ? newValue.label : '');
                            setValue('menu_category_id', newValue ? newValue.value : '');
                          }}
                          onInputChange={(event, newInputValue, reason) => {
                            if (reason === 'input') {
                              setSearchUniversalCategory(newInputValue);
                            }
                          }}
                          loading={categoryLoading}
                          filterOptions={(x) => x} // Disable client-side filtering
                          clearOnBlur={false}
                          clearOnEscape={true}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Universal Category"
                              fullWidth
                              size="small"
                              margin="dense"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {categoryLoading ? (
                                      <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component="li" {...props}>
                              {option.label}
                            </Box>
                          )}
                          noOptionsText={
                            searchUniversalCategory.length === 0 
                              ? "Type to search categories..." 
                              : categoryLoading 
                                ? "Loading..." 
                                : "No categories found"
                          }
                        />
                      );
                    }}
                  />
                </Grid>

                {/* Universal Item */}
                <Grid size={6}>
                  <Controller
                    name="uni_item_name"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => {
                      const selectedOption = universalMenus.find(menu => menu.label === value) || null;
                      
                      return (
                        <Autocomplete
                          {...field}
                          options={universalMenus}
                          getOptionLabel={(option) => typeof option === 'string' ? option : option.label || ''}
                          value={selectedOption}
                          onChange={(event, newValue) => {
                            onChange(newValue ? newValue.label : '');
                          }}
                          onInputChange={(event, newInputValue, reason) => {
                            if (reason === 'input') {
                              setSearchUniversalMenu(newInputValue);
                            }
                          }}
                          loading={menuLoading}
                          filterOptions={(x) => x} // Disable client-side filtering
                          clearOnBlur={false}
                          clearOnEscape={true}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Universal Item"
                              fullWidth
                              size="small"
                              margin="dense"
                              InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                  <>
                                    {menuLoading ? (
                                      <CircularProgress color="inherit" size={20} />
                                    ) : null}
                                    {params.InputProps.endAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                          renderOption={(props, option) => (
                            <Box component="li" {...props}>
                              {option.label}
                            </Box>
                          )}
                          noOptionsText={
                            searchUniversalMenu.length === 0 
                              ? "Type to search items..." 
                              : menuLoading 
                                ? "Loading..." 
                                : "No items found"
                          }
                        />
                      );
                    }}
                  />
                </Grid>

                {/* Menu Item Name */}
                <Grid size={6}>
                  <Controller
                    name="cafe_menu_item_nick_name"
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Item Nick Name" 
                        fullWidth 
                        size="small"
                        margin="dense" 
                      />
                    )}
                  />
                </Grid>

                {/* Menu Category nick Name */}
                <Grid size={6}>
                  <Controller
                    name="cafe_menu_category_nick_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Category Nick Name"
                        fullWidth
                        size="small"
                        margin="dense"
                      />
                    )}
                  />
                </Grid>

                {/* Description */}
                <Grid size={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Description" 
                        multiline 
                        rows={3}
                        fullWidth 
                        size="small"
                        margin="dense"
                      />
                    )}
                  />
                </Grid>

                {/* Zomato & Swiggy Prices */}
                <Grid size={6}>
                  <Controller
                    name="zomato_price"
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Zomato Price" 
                        type="number"
                        fullWidth 
                        size="small"
                        margin="dense" 
                      />
                    )}
                  />
                </Grid>
                <Grid size={6}>
                  <Controller
                    name="swiggy_price"
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Swiggy Price" 
                        type="number"
                        fullWidth 
                        size="small"
                        margin="dense"
                      />
                    )}
                  />
                </Grid>

                {/* Food Type */}
                <Grid size={12}>
                  <FormControl sx={{ mt: 1 }}>
                    <FormLabel>Food Type</FormLabel>
                    <Controller
                      name="food_type"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup row {...field}>
                          <FormControlLabel value="1" control={<Radio color='secondary' />} label="Veg" />
                          <FormControlLabel value="0" control={<Radio color='secondary'/>} label="Non Veg" />
                          <FormControlLabel value="2" control={<Radio color='secondary'/>} label="Egg" />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Base Price & GST Rate */}
                <Grid size={6}>
                  <Controller
                    name="base_price"
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Base Price" 
                        type="number" 
                        fullWidth 
                        size="small"
                        margin="dense" 
                      />
                    )}
                  />
                </Grid>
                <Grid size={6}>
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
                {/* Measuring Unit */}
                <Grid size={12}>
                  <Controller
                    name="measuring_unit"
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Measuring Unit" 
                        fullWidth 
                        size="small"
                        margin="dense"
                      />
                    )}
                  />
                </Grid>

                {/* Spice Level */}
                <Grid size={12}>
                  <FormControl sx={{ mt: 1 }}>
                    <FormLabel>Spice Level</FormLabel>
                    <Controller
                      name="spice_level"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup row {...field}>
                          <FormControlLabel value="0" control={<Radio color='secondary' />} label="None" />
                          <FormControlLabel value="1" control={<Radio color='secondary'/>} label="Mild" />
                          <FormControlLabel value="2" control={<Radio color='secondary'/>} label="Medium" />
                          <FormControlLabel value="3" control={<Radio color='secondary'/>} label="Very Spicy" />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Status */}
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => <Switch {...field} checked={!!field.value} color='secondary'/>}
                      />
                    }
                    label="Active"
                  />
                </Grid>

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
                                        onChange={(e) => field.onChange(e.target.checked)}
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
                                        onChange={(e) => field.onChange(e.target.checked)}
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
                                        onChange={(e) => field.onChange(e.target.checked)}
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
                                        onChange={(e) => field.onChange(e.target.checked)}
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
                                        onChange={(e) => field.onChange(e.target.checked)}
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
                                        onChange={(e) => field.onChange(e.target.checked)}
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
                                        onChange={(e) => field.onChange(e.target.checked)}
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
                                        onChange={(e) => field.onChange(e.target.checked)}
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
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        color="secondary"
                                      />
                                    )}
                                  />
                                </Box>
                              </Grid>
                            </Grid>
                          </Grid>

                {/* Add-ons Section */}
                <Grid sx={{ mt: 2 }} size={12}>
                  <Typography variant="h6" gutterBottom>Add-ons</Typography>
                  {watchAddons.map((addon, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                      <Grid size={5}>
                        <Controller
                          name={`items[${index}].addon_name`}
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Addon Name" 
                              fullWidth 
                              size="small"
                              margin="dense"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={4}>
                        <Controller
                          name={`items[${index}].addon_price`}
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Price" 
                              type="number" 
                              fullWidth 
                              size="small"
                              margin="dense"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={3}>
                        <Button
                          variant='outlined' 
                          color='error' 
                          size="small" 
                          fullWidth
                          onClick={() => removeAddon(index)}
                          sx={{ mt: 1 }}
                        >
                          Remove
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body2">
                            Active
                          </Typography>
                          <Controller
                            name={`items[${index}].addon_status`}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
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
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Addon
                  </Button>
                </Grid>

                {/* Variants Section */}
                <Grid sx={{ mt: 2 }} size={12}>
                  <Typography variant="h6" gutterBottom>Variants</Typography>
                  {watchVariants.map((variant, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                      <Grid size={5}>
                        <Controller
                          name={`itemss[${index}].variant_name`}
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Variant Name" 
                              fullWidth 
                              size="small"
                              margin="dense"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={4}>
                        <Controller
                          name={`itemss[${index}].cafe_menu_variant_price`}
                          control={control}
                          render={({ field }) => (
                            <TextField 
                              {...field} 
                              label="Price" 
                              type="number" 
                              fullWidth 
                              size="small"
                              margin="dense"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={3}>
                        <Button 
                          variant='outlined' 
                          color='error' 
                          size="small" 
                          fullWidth
                          onClick={() => removeVariant(index)}
                          sx={{ mt: 1 }}
                        >
                          Remove
                        </Button>
                      </Grid>
                      <Grid size={6}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography variant="body2">
                            Active
                          </Typography>
                          <Controller
                            name={`itemss[${index}].variant_status`}
                            control={control}
                            render={({ field }) => (
                              <Switch
                                {...field}
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
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
                    onClick={addVariant}
                    color="secondary"
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Add Variant
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Box>
          

          {/* Fixed Action Buttons */}
          <Box 
            component="form" 
            onSubmit={handleSubmit(onSubmit)}
            sx={{ 
              //position: 'sticky',
              bottom: 0,
              p: 2, 
              borderTop: '1px solid #eee', 
              bgcolor: "#F7F7F7",
              display: 'flex', 
              gap: 1,
              zIndex: 1000
            }}
          >
            <Button 
              variant="outlined" 
              color="error" 
              sx={{ flex: 1 }} 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              sx={{ flex: 1 }} 
              variant="contained" 
              disabled={loading || uploading}
            >
              {loading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
            </Button>
          </Box>
        </>
      )}
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
      {/* Snackbar for Notifications */}
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
    </Drawer>
  );
};

export default EditRestaurantMenu;