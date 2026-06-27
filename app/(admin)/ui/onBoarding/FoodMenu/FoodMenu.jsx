// FoodMenu.jsx
import React, { useState } from "react";
import {
    Paper,
    Typography,
    Grid,
    TextField,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Select,
    MenuItem,
    Switch,
    IconButton,
    Stack,
    Button,
    Divider,
    Box,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import instanceV1 from "../../restaurant/authaxios";
import UniversalCat from "../FoodMenuBulk/UniversalCat";
import UniversalItem from "../FoodMenuBulk/UniversalItem";
import { Eggdsvg, Nonvegdsvg, Vegdsvg } from "../../restaurant/Sidebar";

const gstRates = ["0", "5", "12", "18"];

export default function FoodMenu({ datas, setCompletedFields, primaryInfo }) {
    console.log('primaryInfo', primaryInfo)
    const [foodType, setFoodType] = useState("Non-Veg");
    const [category, setCategory] = useState("");
    const [menu, setMenu] = useState("");
    const [universalCategory, setUniversalCategory] = useState("");
    const [universalItem, setUniversalItem] = useState("");
    const [item, setItem] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [gstRate, setGstRate] = useState("");
    const [spiceLevel, setSpiceLevel] = useState("normal");
    const [addons, setAddons] = useState([{ name: "", price: "", active: true }]);
    const [variants, setVariants] = useState([{ name: "", price: "", active: true }]);

    // Handlers for Addons/Variants
    const handleAddonChange = (index, field, value) => {
        const updated = [...addons];
        updated[index][field] = value;
        setAddons(updated);
    };

    const handleVariantChange = (index, field, value) => {
        const updated = [...variants];
        updated[index][field] = value;
        setVariants(updated);
    };

    const addAddon = () => setAddons([...addons, { name: "", price: "", active: true }]);
    const removeAddon = (index) => setAddons(addons.filter((_, i) => i !== index));
    const addVariant = () => setVariants([...variants, { name: "", price: "", active: true }]);
    const removeVariant = (index) => setVariants(variants.filter((_, i) => i !== index));

    // Save function
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const cafeListId = localStorage.getItem("cafeListId");
            const foodTypeMap = { "Non-Veg": 0, Veg: 1, Egg: 2 };

            // Filter out invalid addons and variants
            const validAddons = addons
                ? addons.filter(a => a && a.name && a.price !== null && a.price !== undefined)
                : [];
            const validVariants = variants
                ? variants.filter(v => v && v.name && v.price !== null && v.price !== undefined)
                : [];

            const payload = {
                uni_cat_name: universalCategory.label,
                cafe_menu_category_nick_name: category,
                uni_item_name: universalItem.label,
                cafe_menu_item_nick_name: item,
                food_type: foodTypeMap[foodType],
                base_price: basePrice,
                gst_rate: gstRate,
                status: 1,
                spice_level: spiceLevel,
                cafe_list_id: cafeListId,
                items: validAddons.map(a => ({
                    addon_name: a.name,
                    addon_price: a.price,
                    addon_status: a.active,
                })),
                itemss: validVariants.map(v => ({
                    variant_name: v.name,
                    variant_price: v.price,
                    variant_status: v.active,
                })),
            };

            console.log("Sending Payload:", payload);

            const res = await instanceV1(token).post("/api/admin/onboard/v1/cafe/menu", payload);
            console.log("API Response:", res.data);
            setCompletedFields((prev) => [...prev, 'single-food-menu']);

            alert("Menu saved successfully!");
        } catch (err) {
            console.error("Error saving menu:", err);
            alert("Failed to save menu");
        }
    };


    return (
        <Paper sx={{ width: "100%", p: 3 }}>
            <Typography variant="h5" mb={3}>Food Menu (Single)</Typography>
            <Grid container spacing={2}>
                {/* Universal Category */}
                <Grid size={6}>
                    <UniversalCat
                        label="Universal Category"
                        value={universalCategory}
                        onChange={(opt) => setUniversalCategory(opt)}
                    />
                </Grid>
                {/* Universal Item */}
                <Grid size={6}>
                    <UniversalItem
                        label="Universal Item"
                        value={universalItem}
                        onChange={(opt) => setUniversalItem(opt)}
                    />
                </Grid>
                {/* Category */}
                <Grid size={6}>

                    <TextField
                        fullWidth
                        size="small"
                        label="Category Name"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </Grid>



                {/* Item */}
                <Grid size={6}>

                    <TextField
                        fullWidth
                        size="small"
                        label="Item Name"
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                    />
                </Grid>

                {/* Food Type */}
                <Grid size={12}>
                    <FormLabel>Food Type</FormLabel>
                 <RadioGroup row value={foodType} onChange={(e) => setFoodType(e.target.value)}>
    <FormControlLabel
        value="Non-Veg"
        control={<Radio color="secondary" />}
        disabled={primaryInfo?.is_non_veg === 0} // disable if not available
        label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Nonvegdsvg width={20} height={20} />
                Non-Veg
            </Box>
        }
    />
    <FormControlLabel
        value="Veg"
        control={<Radio color="secondary" />}
        disabled={primaryInfo?.is_veg === 0} // disable if not available
        label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Vegdsvg width={20} height={20} />
                Veg
            </Box>
        }
    />
    <FormControlLabel
        value="Egg"
        control={<Radio color="secondary" />}
        disabled={primaryInfo?.is_egg === 0} // disable if not available
        label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Eggdsvg width={20} height={20} />
                Egg
            </Box>
        }
    />
</RadioGroup>

                </Grid>

                {/* Base Price & GST */}
                <Grid size={6}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Base Price (₹)"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        type="number"
                    />
                </Grid>
                <Grid size={6}>
                    <Select
                        fullWidth
                        value={gstRate}
                        onChange={(e) => setGstRate(e.target.value)}
                        displayEmpty
                        size="small"
                    >
                        <MenuItem value="" disabled>Select GST</MenuItem>
                        {gstRates.map((rate) => (
                            <MenuItem key={rate} value={rate}>{rate}%</MenuItem>
                        ))}
                    </Select>
                </Grid>

                {/* Spice Level */}
                <Grid size={12}>
                    <FormLabel>Spice Level</FormLabel>
                    <RadioGroup row value={spiceLevel} onChange={(e) => setSpiceLevel(e.target.value)}>
                        <FormControlLabel value="0" control={<Radio color="secondary" />} label="None" />
                        <FormControlLabel value="1" control={<Radio color="secondary" />} label="Mild Spicy" />
                        <FormControlLabel value="2" control={<Radio color="secondary" />} label="Medium Spicy" />
                        <FormControlLabel value="3" control={<Radio color="secondary" />} label="Very Spicy" />
                    </RadioGroup>
                </Grid>


                {/* Addons */}
                <Grid size={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1">Addon</Typography>
                    {addons.map((addon, index) => (
                        <Grid container spacing={2} key={index} alignItems="center" mt={1}>
                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Select Addon"
                                    value={addon.name}
                                    onChange={(e) => handleAddonChange(index, "name", e.target.value)}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Price"
                                    value={addon.price}
                                    onChange={(e) => handleAddonChange(index, "price", e.target.value)}
                                    type="number"
                                />
                            </Grid>
                            <Grid size={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={addon.active}
                                            onChange={(e) => handleAddonChange(index, "active", e.target.checked)}
                                        />
                                    }
                                    label="Active"
                                />
                            </Grid>
                            <Grid size={1}>
                                <IconButton onClick={() => removeAddon(index)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Button startIcon={<AddCircleOutlineIcon />} fullWidth sx={{ mt: 1, border: '1px dashed grey' }} onClick={addAddon} >
                        Add Addon
                    </Button>
                </Grid>

                {/* Variants */}
                <Grid size={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1">Variant</Typography>
                    {variants.map((variant, index) => (
                        <Grid container spacing={2} key={index} alignItems="center" mt={1}>
                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Variant Name"
                                    value={variant.name}
                                    onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                                />
                            </Grid>
                            <Grid size={6}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Price"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                    type="number"
                                />
                            </Grid>
                            <Grid size={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={variant.active}
                                            onChange={(e) => handleVariantChange(index, "active", e.target.checked)}
                                        />
                                    }
                                    label="Active"
                                />
                            </Grid>
                            <Grid size={1}>
                                <IconButton onClick={() => removeVariant(index)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Button startIcon={<AddCircleOutlineIcon />} fullWidth onClick={addVariant} sx={{ mt: 1, border: '1px dashed grey' }}>
                        Add Variant
                    </Button>
                </Grid>
            </Grid>
            {/* Save buttons */}
            <Stack direction="row" spacing={2} mt={4}>
                {/* <Button variant="outlined" color="secondary" onClick={() => console.log("Saved as Draft")}>
                    SAVE AS DRAFT
                </Button> */}
                <Button variant="contained" color="primary" onClick={handleSave}>
                    SAVE & PROCEED
                </Button>
            </Stack>
        </Paper>
    );
}
