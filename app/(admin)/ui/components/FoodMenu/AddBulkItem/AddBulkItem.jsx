import { CloudArrowUp16Regular } from "@fluentui/react-icons";
import { Autocomplete, Backdrop, Box, Button, CircularProgress, Grid, Paper, TextField, Typography, MenuItem, Select, FormControl, InputLabel, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";

export default function AddBulkItem(){
    const [restaurants , setRestaurants]=useState([]);
    const [restaurantId, setRestaurantId]=useState();
    const [loading , setLoading]=useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const token = localStorage.getItem('authToken');
    const baseurl= import.meta.env.VITE_REACT_APP_BACKEND_URL;
    const [searchQuery, setSearchQuery]=useState("");
    const [searchUnibersalCategory, setSearchUniversalCategory]=useState("");
    const [universalCategories, setUniversalCategories]=useState([]);

    const [searchUniversalItem,setSearchUniversalItem]=useState('');
    const [universalItems, setUniversalItems]=useState([]);

    const [alert, setAlert] = useState({
                    open: false,
                    severity: "info",
                    message: ""
                });

    // Memoized food type mapping to prevent recreation on every render
    const foodTypeMapping = useMemo(() => ({
        'veg': 'Veg',
        'non-veg': 'Non-Veg',
        'egg': 'Egg',
        'vegetarian': 'Veg',
        'non-vegetarian': 'Non-Veg',
        'nonveg': 'Non-Veg',
        'nonvegetarian': 'Non-Veg'
    }), []);

    // Function to normalize food type
    const normalizeFoodType = useCallback((foodType) => {
        if (!foodType) return '';
        const normalized = foodType.toLowerCase().trim();
        return foodTypeMapping[normalized] || '';
    }, [foodTypeMapping]);

    // Function to validate category against API
    const validateUniversalCategory = useCallback(async (categoryName) => {
        if (!categoryName || categoryName.trim() === '') return null;
        
        try {
            const response = await axios.get(`${baseurl}/api/v1/universal-categories`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    s: categoryName
                }
            });

            const categories = response.data?.data?.data || [];
            const matchedCategory = categories.find(cat => 
                cat.category_name.toLowerCase() === categoryName.toLowerCase()
            );

            if (matchedCategory) {
                return {
                    label: matchedCategory.category_name,
                    value: matchedCategory.id
                };
            }
            return null;
        } catch (error) {
            console.log("Error validating universal category:", error);
            return null;
        }
    }, [baseurl, token]);

    // Function to validate item against API32
    const validateUniversalItem = useCallback(async (itemName) => {
        if (!itemName || itemName.trim() === '') return null;
        
        try {
            const response = await axios.get(`${baseurl}/api/v1/universal-item`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    s: itemName
                }
            });

            const items = response.data?.data?.data || [];
            const matchedItem = items.find(item => 
                item.item_name.toLowerCase() === itemName.toLowerCase()
            );

            if (matchedItem) {
                return {
                    label: matchedItem.item_name,
                    value: matchedItem.id
                };
            }
            return null;
        } catch (error) {
            console.log("Error validating universal item:", error);
            return null;
        }
    }, [baseurl, token]);
    
    //Upload image 
    const imageUpload = useCallback(async (file) => {
        const formData = new FormData()
        formData.append("image", file)

        try {
            setLoading(true)
            const response = await axios.post(`${import.meta.env.VITE_IMAGE_TO_FORMATED_DATA_CONVERTER_URL}`, formData)
            
            console.log("response of upload image- ", response);
            
            if (response.data?.output?.data) {
                // Process each item and validate against API
                const processedMenuItems = await Promise.all(
                    response.data.output.data.map(async (item, index) => {
                        // Validate category and item against API
                        const validatedCategory = await validateUniversalCategory(item.menu_category_name);
                        const validatedItem = await validateUniversalItem(item.menu_item_name);

                        return {
                            id: index,
                            menu_category_name: item.menu_category_name || '', // Keep original data
                            menu_item_name: item.menu_item_name || '', // Keep original data
                            menu_item_price: item.menu_item_price || '',
                            menu_type: normalizeFoodType(item.menu_type),
                            variant_name: item.variant_name || '',
                            variant_price: item.variant_price || '',
                            // These are separate editable fields
                            category_nick_name: item.menu_category_name || '', // Pre-fill but independent
                            menu_nick_name: item.menu_item_name || '', // Pre-fill but independent
                            selectedUniversalCategory: validatedCategory,
                            selectedUniversalItem: validatedItem,
                            variants: (item.variant_name && item.variant_price && item.variant_name.trim() !== '' && item.variant_price.trim() !== '') ? [{
                                variant_name: item.variant_name,
                                variant_price: item.variant_price,
                                variant_status: 1
                            }] : []
                        };
                    })
                );
                
                setMenuItems(processedMenuItems);
            }
        } catch (e) {
            console.log("error while upload image-", e);
        } finally {
            setLoading(false);
        }
    }, [validateUniversalCategory, validateUniversalItem, normalizeFoodType]);

    const handleImageChange = useCallback(async (e) => {
        const file = e.target.files[0];

        console.log("image=", file);
        if(file){
            await imageUpload(file);
            e.target.value = '';
        }else{
            console.log("no image embedded!!");
        }
    }, [imageUpload]);

    // Handle menu item changes
    const handleMenuItemChange = useCallback((index, field, value) => {
        setMenuItems(prevItems => {
            const updatedMenuItems = [...prevItems];
            updatedMenuItems[index] = { ...updatedMenuItems[index], [field]: value };
            return updatedMenuItems;
        });
    }, []);

    // Handle autocomplete changes for universal category - completely separate from category_nick_name
    const handleUniversalCategoryChange = useCallback((index, selectedOption) => {
        setMenuItems(prevItems => {
            const updatedMenuItems = [...prevItems];
            updatedMenuItems[index] = {
                ...updatedMenuItems[index],
                selectedUniversalCategory: selectedOption
                // DO NOT update category_nick_name here - keep them independent
            };
            return updatedMenuItems;
        });
    }, []);

    // Handle autocomplete changes for universal item - completely separate from menu_nick_name
    const handleUniversalItemChange = useCallback((index, selectedOption) => {
        setMenuItems(prevItems => {
            const updatedMenuItems = [...prevItems];
            updatedMenuItems[index] = {
                ...updatedMenuItems[index],
                selectedUniversalItem: selectedOption
                // DO NOT update menu_nick_name here - keep them independent
            };
            return updatedMenuItems;
        });
    }, []);

    const handleRemoveItem = useCallback((index) => {
        setMenuItems(prevItems => prevItems.filter((_, i) => i !== index));
    }, []);

    // Save individual menu item
    const handleSaveItem = useCallback(async (index) => {
        if (!restaurantId) {
            setAlert({open:true, severity:"error",message:"Please select restaurant!"})
            return;
        }
        
        const item = menuItems[index];
        console.log("single item - ", item);
        
        const payload= {
            cafe_menu_item_nick_name: item.menu_nick_name,
            cafe_menu_category_nick_name: item.category_nick_name,
            image_id: "",
            uni_item_name: item.selectedUniversalItem ? item.selectedUniversalItem.label : '',
            status: 1,
            uni_cat_name: item.selectedUniversalCategory ? item.selectedUniversalCategory.label : '',
            food_type:  item.menu_type === "Veg" ? 1 :
                        item.menu_type === "Non-Veg" ? 0 :
                        item.menu_type === "Egg" ? 2 :
                        "",
            description: "",
            base_price: item.menu_item_price,
            gst_rate: 5,
            measuring_unit: "",
            spice_level: 0,
            is_exclusive: 0,
            is_recommended: 0,
            is_chef_special: 0,
            is_new: 0,
            is_seasonal: 0,
            is_signature: 0,
            is_addon_compulsory: 0,
            is_variation_compulsory: 0,
            is_takeaway: 1,
            zomato_price: "",
            swiggy_price: "",
            cafe_list_id: restaurantId,
            items: [], 
            itemss: item.variants || [] 
        };

        try {
            setLoading(true);
            const response = await axios.post(`${baseurl}/api/v1/cafe-menu-item`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Menu item saved:', response.data);
            setAlert({open:true, severity:"success", message:"Menu item saved successfully!"})
            setMenuItems(prevItems => prevItems.filter((_, i) => i !== index));
            
        } catch (error) {
            console.error('Error saving menu item:', error);
            const message = error?.response?.data?.msg
            setAlert({open:true, severity:"error", message:message || "Error Saving Menu item!"})
        } finally {
            setLoading(false);
        }
    }, [restaurantId, menuItems, baseurl, token]);

    //fetch restaurants
    const fetchRestaurants = useCallback(async () => {
        try{
            const response= await axios.get(`${baseurl}/api/user/admin/cafe-list/get/all`,{
                headers:{
                    Authorization:`Bearer ${token}`
                },
                params:{
                    s:searchQuery
                }
            })

            console.log("response of restaurants= ",response.data?.data );
            const data= response.data?.data?.map((res)=>({
                label:res.cafe_name,
                value:res.id
            }))
            console.log("data- ", data)
            setRestaurants(data)
        }catch(e){
            console.log("Error during fetching restaurants= ", e);
        }
    }, [baseurl, token, searchQuery]);
    
    useEffect(()=>{
        const delayDebounce=setTimeout(()=>{
            if(searchQuery.trim().length>=1){
                setRestaurants([]);
                fetchRestaurants();
            }
        },300)

        return ()=>clearTimeout(delayDebounce)
    },[fetchRestaurants, searchQuery])

    //fetch universal category
    const fetchUniversalCategory = useCallback(async () => {
        try{
            const response= await axios.get(`${baseurl}/api/v1/universal-categories`,{
                headers:{
                    Authorization:`Bearer ${token}`
                },
                params:{
                    s: searchUnibersalCategory
                }
            })

            const data= response.data?.data?.data?.map((cat)=>({
                label:cat.category_name,
                value:cat.id
            }))
            setUniversalCategories(data || [])
        }catch(e){
            console.log("error during fetching universal category",e);
            setUniversalCategories([]);
        }
    }, [baseurl, token, searchUnibersalCategory]);

    useEffect(()=>{
        const delayDebounce= setTimeout(()=>{
            if(searchUnibersalCategory.trim().length>=1){
                fetchUniversalCategory();
            }
        },300)

        return ()=>clearTimeout(delayDebounce)

    },[fetchUniversalCategory, searchUnibersalCategory])

    
    //fetch universal items
    const fetchUniversalItems = useCallback(async () => {
        try{
            const response= await axios.get(`${baseurl}/api/v1/universal-item`,{
                headers:{
                    Authorization:`Bearer ${token}`
                },
                params:{
                    s: searchUniversalItem
                }
            })

            const data= response.data?.data?.data?.map((item)=>({
                label:item.item_name,
                value:item.id
            }))
            setUniversalItems(data || [])

        }catch(e){
            console.log("error during fetch universal items- ", e);
            setUniversalItems([]);
        }
    }, [baseurl, token, searchUniversalItem]);

    useEffect(()=>{
        const delayDebounce=setTimeout(()=>{
            if(searchUniversalItem.trim().length>=1){
                fetchUniversalItems();
            }
        },300)
        return ()=> clearTimeout(delayDebounce)
    },[fetchUniversalItems, searchUniversalItem])

    // Enhanced function to get universal category options with "Add new" option
    const getUniversalCategoryOptions = useCallback((inputValue) => {
        if (!inputValue || inputValue.trim() === '') {
            return universalCategories;
        }

        const filteredOptions = universalCategories.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );

        // Check if the input exactly matches any existing option
        const exactMatch = filteredOptions.find(option =>
            option.label.toLowerCase() === inputValue.toLowerCase()
        );

        // If no exact match and input is not empty, add "Add new" option
        if (!exactMatch && inputValue.trim() !== '') {
            return [
                ...filteredOptions,
                {
                    label: `Add new "${inputValue}"`,
                    value: `add-new-${inputValue}`,
                    isAddNew: true,
                    newValue: inputValue
                }
            ];
        }

        return filteredOptions;
    }, [universalCategories]);

    // Enhanced function to get universal item options with "Add new" option
    const getUniversalItemOptions = useCallback((inputValue) => {
        if (!inputValue || inputValue.trim() === '') {
            return universalItems;
        }

        const filteredOptions = universalItems.filter(option =>
            option.label.toLowerCase().includes(inputValue.toLowerCase())
        );

        // Check if the input exactly matches any existing option
        const exactMatch = filteredOptions.find(option =>
            option.label.toLowerCase() === inputValue.toLowerCase()
        );

        // If no exact match and input is not empty, add "Add new" option
        if (!exactMatch && inputValue.trim() !== '') {
            return [
                ...filteredOptions,
                {
                    label: `Add new "${inputValue}"`,
                    value: `add-new-${inputValue}`,
                    isAddNew: true,
                    newValue: inputValue
                }
            ];
        }

        return filteredOptions;
    }, [universalItems]);

    // Enhanced category change handler
    const handleEnhancedUniversalCategoryChange = useCallback((index, selectedOption, inputValue) => {
        let finalOption = selectedOption;

        // If user selected "Add new" option, create a new option with the input value
        if (selectedOption && selectedOption.isAddNew) {
            finalOption = {
                label: selectedOption.newValue,
                value: `new-${Date.now()}`, // Generate a unique temporary ID
                isNew: true
            };
        }

        setMenuItems(prevItems => {
            const updatedMenuItems = [...prevItems];
            updatedMenuItems[index] = {
                ...updatedMenuItems[index],
                selectedUniversalCategory: finalOption
            };
            return updatedMenuItems;
        });
    }, []);

    // Enhanced item change handler
    const handleEnhancedUniversalItemChange = useCallback((index, selectedOption, inputValue) => {
        let finalOption = selectedOption;

        // If user selected "Add new" option, create a new option with the input value
        if (selectedOption && selectedOption.isAddNew) {
            finalOption = {
                label: selectedOption.newValue,
                value: `new-${Date.now()}`, // Generate a unique temporary ID
                isNew: true
            };
        }

        setMenuItems(prevItems => {
            const updatedMenuItems = [...prevItems];
            updatedMenuItems[index] = {
                ...updatedMenuItems[index],
                selectedUniversalItem: finalOption
            };
            return updatedMenuItems;
        });
    }, []);
    
    return (
        <Box paddingTop={2.4}>
            <Paper sx={{ padding: 2 }}>
                <Grid
                    container
                    spacing={1}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Grid
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 4
                        }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: "bold", fontSize: "1.1rem", whiteSpace: "nowrap" }}
                            >
                                Add Bulk Item
                            </Typography>

                            <Autocomplete
                                options={restaurants}
                                getOptionKey={(option)=>option.value}
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                onChange={(event, selectedOption) => {
                                    console.log("restaurant=", selectedOption);
                                    setRestaurantId(selectedOption?.value || null);
                                }}
                                onInputChange={(_, inputValue)=>{
                                    setRestaurants([]);
                                    setSearchQuery(inputValue);
                                }}
                                sx={{ width: 300 }} 
                                renderInput={(params)=>(
                                    <TextField
                                        {...params}
                                        label="Search Restaurant"
                                        variant="outlined"
                                        size="small"
                                        margin="dense"
                                    />
                                )}
                            />
                        </Box>
                    </Grid>
                    <Grid
                        sx={{
                            textAlign: { xs: "left", sm: "right" },
                        }}
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 4
                        }}>
                        <Button
                            sx={{
                                width: "100px",       
                                height: "30px",        
                                borderRadius: "6px",  
                                fontSize: "0.75rem",
                            }}
                            component="label"
                            variant="contained"
                            size="small"
                            color="primary"
                        >
                            ADD IMAGE
                            <input 
                                type="file" 
                                accept="image/*" 
                                hidden 
                                onChange={handleImageChange}
                            />
                        </Button>
                    </Grid>
                </Grid>
                
                {/* Dynamic Menu Items Display */}
                {menuItems.length > 0 && (
                    <Box sx={{ marginTop: 3 }}>
                        {menuItems.map((item, index) => (
                            <Box 
                                key={`menu-item-${item.id}-${index}`}
                                sx={{ 
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: 2,
                                    marginBottom: 2
                                }}
                            >
                                {/* First Row: Universal Category to Category Name */}
                                <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
                                    {/* Universal Category Autocomplete with Add New Feature */}
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3
                                        }}>
                                        <Autocomplete
                                            options={getUniversalCategoryOptions(searchUnibersalCategory)}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            value={item.selectedUniversalCategory}
                                            onChange={(event, selectedOption) => {
                                                handleEnhancedUniversalCategoryChange(index, selectedOption, searchUnibersalCategory);
                                            }}
                                            onInputChange={(_, inputValue) => {
                                                setUniversalCategories([]);
                                                setSearchUniversalCategory(inputValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Universal Category"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <Box
                                                    component="li"
                                                    {...props}
                                                    sx={{
                                                        ...(option.isAddNew && {
                                                            backgroundColor: '#e3f2fd',
                                                            fontStyle: 'italic',
                                                            color: '#1976d2'
                                                        })
                                                    }}
                                                >
                                                    {option.label}
                                                </Box>
                                            )}
                                            clearOnEscape
                                            clearIcon={<span>×</span>}
                                            freeSolo={false}
                                        />
                                    </Grid>

                                    {/* Universal Menu Autocomplete with Add New Feature */}
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3
                                        }}>
                                        <Autocomplete
                                            options={getUniversalItemOptions(searchUniversalItem)}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            value={item.selectedUniversalItem}
                                            onChange={(event, selectedOption) => {
                                                handleEnhancedUniversalItemChange(index, selectedOption, searchUniversalItem);
                                            }}
                                            onInputChange={(_, inputValue) => {
                                               setUniversalItems([]);
                                               setSearchUniversalItem(inputValue)
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Universal Menu"
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            )}
                                            renderOption={(props, option) => (
                                                <Box
                                                    component="li"
                                                    {...props}
                                                    sx={{
                                                        ...(option.isAddNew && {
                                                            backgroundColor: '#e3f2fd',
                                                            fontStyle: 'italic',
                                                            color: '#1976d2'
                                                        })
                                                    }}
                                                >
                                                    {option.label}
                                                </Box>
                                            )}
                                            clearOnEscape
                                            clearIcon={<span>×</span>}
                                            freeSolo={false}
                                        />
                                    </Grid>

                                    {/* Food Type */}
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3
                                        }}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Food Type</InputLabel>
                                            <Select
                                                value={item.menu_type || ''}
                                                label="Food Type"
                                                onChange={(e) => handleMenuItemChange(index, 'menu_type', e.target.value)}
                                            >
                                                <MenuItem value="">Select Food Type</MenuItem>
                                                <MenuItem value="Veg">Veg</MenuItem>
                                                <MenuItem value="Non-Veg">Non-Veg</MenuItem>
                                                <MenuItem value="Egg">Egg</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Category Name (Nick Name) - Independent and Editable */}
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3
                                        }}>
                                        <TextField
                                            fullWidth
                                            label="Category Name"
                                            value={item.category_nick_name || ''}
                                            onChange={(e) => handleMenuItemChange(index, 'category_nick_name', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                </Grid>

                                {/* Second Row: Menu Name + Price on left, Action Buttons on right */}
                                <Grid container spacing={2} alignItems="center">
                                    {/* Menu Name - Independent and Editable */}
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3
                                        }}>
                                        <TextField
                                            fullWidth
                                            label="Menu Name"
                                            value={item.menu_nick_name || ''}
                                            onChange={(e) => handleMenuItemChange(index, 'menu_nick_name', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>
                                    
                                    {/* Price */}
                                    <Grid
                                        size={{
                                            xs: 12,
                                            sm: 6,
                                            md: 3
                                        }}>
                                        <TextField
                                            fullWidth
                                            label="Price"
                                            type="number"
                                            value={item.menu_item_price}
                                            onChange={(e) => handleMenuItemChange(index, 'menu_item_price', e.target.value)}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Grid>

                                    <Grid
                                        sx={{ display: { xs: 'none', md: 'block' } }}
                                        size={{
                                            xs: 0,
                                            md: 3
                                        }}>
                                    </Grid>

                                    {/* Action Buttons */}
                                    <Grid
                                        sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}
                                        size={{
                                            xs: 12,
                                            md: 3
                                        }}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={() => handleRemoveItem(index)}
                                            sx={{ minWidth: '80px' ,borderRadius: "6px",  
                                                fontSize: "0.75rem",}}
                                        >
                                            REMOVE
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleSaveItem(index)}
                                            sx={{      
                                                borderRadius: "6px",  
                                                fontSize: "0.75rem",
                                            }}
                                        >
                                            SAVE
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}
                    </Box>
                )}
            </Paper>
            <Backdrop
                open={loading}
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
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
    );
}