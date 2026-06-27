import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { Link, Add, Delete } from "@mui/icons-material";
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import UniversalCat from "./UniversalCat";
import UniversalItem from "./UniversalItem";
import RestaurantSearch from "./RestaurantSearch";

// 🔹 Helper hook for debouncing
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

export default function AddBulkItems() {
  const token = localStorage.getItem("authToken");
  const baseurl = process.env.VITE_REACT_APP_BACKEND_URL;

  // 🔹 State
  const [selectedRestaurant, setSelectedRestaurant] = useState(localStorage.getItem("cafeListId") ? { value: localStorage.getItem("cafeListId") } : null);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });
  const [imageUrls, setImageUrls] = useState([""]);
  const [showUrlSection, setShowUrlSection] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // 🔹 Food type normalization
  const foodTypeMapping = useMemo(
    () => ({
      veg: "Veg",
      vegetarian: "Veg",
      "non-veg": "Non-Veg",
      nonveg: "Non-Veg",
      "non-vegetarian": "Non-Veg",
      nonvegetarian: "Non-Veg",
      egg: "Egg",
    }),
    []
  );

  const normalizeFoodType = useCallback(
    (foodType) => foodTypeMapping[foodType?.toLowerCase()?.trim()] || "",
    [foodTypeMapping]
  );

  // 🔹 Update menu item helper
  const updateMenuItem = (index, patch) =>
    setMenuItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  // 🔹 Image upload and parsing
  const imageUpload = useCallback(
    async (file) => {
      const formData = new FormData();
      formData.append("image", file);
      try {
        setLoading(true);
        const res = await axios.post(
          process.env.VITE_IMAGE_TO_FORMATED_DATA_CONVERTER_URL,
          formData
        );
        const rawItems = res.data?.output?.data || [];
        const processed = rawItems.map((it, i) => ({
          id: `${Date.now()}-${i}-${Math.random()}`,
          db_id: it.id,
          menu_category_name: it.menu_category_name || "",
          menu_item_name: it.menu_item_name || "",
          menu_item_price: String(it.menu_item_price || "").replace(/[^\d.]/g, "").trim(),
          menu_type: normalizeFoodType(it.menu_type),
          category_nick_name: it.menu_category_name || "",
          menu_nick_name: it.menu_item_name || "",
          selectedUniversalCategory: null,
          selectedUniversalItem: null,
          variants:
            it.variant_name && it.variant_price
              ? [{ variant_name: it.variant_name, variant_price: it.variant_price, variant_status: 1 }]
              : [],
        }));
        setMenuItems((prev) => [...prev, ...processed]);
      } catch (err) {
        console.error("Error processing image:", err);
      } finally {
        setLoading(false);
      }
    },
    [normalizeFoodType]
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) imageUpload(file);
    e.target.value = "";
  };

  const handleAddUrlField = () => {
    setImageUrls((prev) => [...prev, ""]);
  };

  const handleRemoveUrlField = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index, value) => {
    if (value.includes(",") || value.includes("\n")) {
      const urls = value
        .split(/[,|\n]+/)
        .map((u) => u.trim())
        .filter(Boolean);
      setImageUrls((prev) => {
        const newUrls = [...prev];
        newUrls.splice(index, 1, ...urls);
        return newUrls;
      });
    } else {
      setImageUrls((prev) => {
        const newUrls = [...prev];
        newUrls[index] = value;
        return newUrls;
      });
    }
  };

  const handlePaste = (index, e) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.includes(",") || pastedText.includes("\n")) {
      e.preventDefault();
      const urls = pastedText
        .split(/[,|\n]+/)
        .map((u) => u.trim())
        .filter(Boolean);
      setImageUrls((prev) => {
        const newUrls = [...prev];
        newUrls.splice(index, 1, ...urls);
        return newUrls;
      });
    }
  };

  const handleProcessUrls = async () => {
    const cafeId = selectedRestaurant?.value || localStorage.getItem("cafeListId");
    if (!cafeId) {
      setAlert({ open: true, severity: "error", message: "Please select a restaurant!" });
      return;
    }

    const validUrls = imageUrls.map((u) => u.trim()).filter(Boolean);
    if (validUrls.length === 0) {
      setAlert({ open: true, severity: "error", message: "Please enter at least one image URL!" });
      return;
    }

    const payload = validUrls.map((url) => ({
      cafe_list_id: Number(cafeId),
      image_url: url,
    }));

    try {
      setLoading(true);
      const res = await axios.post(
        "https://auto.a2d.co.in/webhook/02b0ecab-29e8-4d78-859d-4f52ddec9f1c",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const rawItems = res.data?.output?.data || (Array.isArray(res.data) ? res.data : []);
      if (rawItems.length === 0) {
        setAlert({
          open: true,
          severity: "success",
          message: "Your request has been added to the queue.",
        });
        return;
      }

      const processed = rawItems.map((it, i) => ({
        id: `${Date.now()}-${i}-${Math.random()}`,
        db_id: it.id,
        menu_category_name: it.menu_category_name || "",
        menu_item_name: it.menu_item_name || "",
        menu_item_price: String(it.menu_item_price || "").replace(/[^\d.]/g, "").trim(),
        menu_type: normalizeFoodType(it.menu_type),
        category_nick_name: it.menu_category_name || "",
        menu_nick_name: it.menu_item_name || "",
        selectedUniversalCategory: null,
        selectedUniversalItem: null,
        variants:
          it.variant_name && it.variant_price
            ? [{ variant_name: it.variant_name, variant_price: it.variant_price, variant_status: 1 }]
            : [],
      }));

      setMenuItems((prev) => [...prev, ...processed]);
      setAlert({ open: true, severity: "success", message: "URLs processed and items added successfully!" });
      setImageUrls([""]);
    } catch (err) {
      console.error("Error processing URLs:", err);
      setAlert({
        open: true,
        severity: "error",
        message: err?.response?.data?.msg || "Error processing image URLs!",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuData = useCallback(async () => {
    const cafeId = selectedRestaurant?.value || localStorage.getItem("cafeListId");
    if (!cafeId) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("cafe_list_id", cafeId);

      const res = await axios.post(
        "https://auto.a2d.co.in/webhook/get-menu-data",
        formData
      );

      const responseData = Array.isArray(res.data) ? res.data[0] : res.data;

      if (responseData && (responseData.dataStatus === "pending" || responseData.data_status === "pending")) {
        setIsPending(true);
        setAlert({
          open: true,
          severity: "info",
          message: "We are still getting the data from the image.",
        });
        return;
      }

      setIsPending(false);
      const rawItems = responseData?.data || [];
      const processed = rawItems.map((it, i) => ({
        id: `${Date.now()}-${i}-${Math.random()}`,
        db_id: it.id,
        menu_category_name: it.menu_category_name || "",
        menu_item_name: it.menu_item_name || "",
        menu_item_price: String(it.menu_item_price || "").replace(/[^\d.]/g, "").trim(),
        menu_type: normalizeFoodType(it.menu_type),
        category_nick_name: it.menu_category_name || "",
        menu_nick_name: it.menu_item_name || "",
        selectedUniversalCategory: null,
        selectedUniversalItem: null,
        variants:
          it.variant_name && it.variant_price
            ? [{ variant_name: it.variant_name, variant_price: it.variant_price, variant_status: 1 }]
            : [],
      }));

      setMenuItems(processed);
    } catch (err) {
      console.error("Error fetching menu data:", err);
      setAlert({
        open: true,
        severity: "error",
        message: err?.response?.data?.msg || "Error fetching menu data!",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant, normalizeFoodType]);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // 🔹 Save individual menu item
  const handleSaveItem = async (index) => {
    if (!selectedRestaurant) {
      setAlert({ open: true, severity: "error", message: "Please select a restaurant!" });
      return;
    }
    const item = menuItems[index];
    const raws = item.selectedUniversalItem?.label || "";
    const selectedUniversalItem = raws.replace(/^Add new\s*/i, "").replace(/"/g, "");


    const raw = item.selectedUniversalCategory?.label || "";
    const selectedUniversalCategory = raw.replace(/^Add new\s*/i, "").replace(/"/g, "");

    const payload = {
      cafe_menu_item_nick_name: item.menu_nick_name,
      cafe_menu_category_nick_name: item.category_nick_name,
      uni_item_name: selectedUniversalItem || "",
      uni_cat_name: selectedUniversalCategory || "",
      food_type:
        item.menu_type === "Veg" ? 1 : item.menu_type === "Non-Veg" ? 0 : item.menu_type === "Egg" ? 2 : "",
      base_price: String(item.menu_item_price || "").replace(/[^\d.]/g, "").trim(),
      gst_rate: 5,
      cafe_list_id: selectedRestaurant.value,
      itemss: item.variants || [],
      status: 1,
    };

    try {
      setLoading(true);
      await axios.post(`${baseurl}/api/v1/cafe-menu-item`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ open: true, severity: "success", message: "Menu item saved successfully!" });

      // Call webhook/menu_update_status to set status: "added" if db_id is present
      const cafeId = selectedRestaurant?.value || localStorage.getItem("cafeListId");
      if (item.db_id && cafeId) {
        try {
          const updateData = new FormData();
          updateData.append("cafe_list_id", String(cafeId));
          updateData.append("status", "added");
          updateData.append("id", String(item.db_id));

          await axios.put("https://auto.a2d.co.in/webhook/menu_update_status", updateData);
        } catch (err) {
          console.error("Error updating menu status to added:", err);
        }
      }

      setMenuItems((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      setAlert({
        open: true,
        severity: "error",
        message: err?.response?.data?.msg || "Error saving menu item!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (index) => {
    const item = menuItems[index];
    const cafeId = selectedRestaurant?.value || localStorage.getItem("cafeListId");

    // Call webhook/menu_update_status if db_id is present
    if (item.db_id && cafeId) {
      try {
        setLoading(true);
        const updateData = new FormData();
        updateData.append("cafe_list_id", String(cafeId));
        updateData.append("status", "removed");
        updateData.append("id", String(item.db_id));

        await axios.put("https://auto.a2d.co.in/webhook/menu_update_status", updateData);
      } catch (err) {
        console.error("Error updating menu status to removed:", err);
      } finally {
        setLoading(false);
      }
    }

    // Always remove from local state
    setMenuItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ pt: 2.4, width: "100%" }}>
      <Paper sx={{ p: 2, width: "100%" }}>
        {/* Top Bar */}
        <Grid container spacing={1} alignItems="center" justifyContent="space-between">
          <Grid>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                Add Bulk Item
              </Typography>

            </Box>
          </Grid>

          <Grid
            textAlign={{ xs: "left", sm: "right" }}
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, ml: "auto" }}
            size={{
              xs: 12,
              sm: 8,
              md: 6
            }}>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchMenuData}
              disabled={loading}
              sx={{ height: 30 }}
            >
              FETCH MENU DATA
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowUrlSection((prev) => !prev)}
              sx={{ height: 30 }}
            >
              ADD IMAGE URL
            </Button>
          </Grid>
        </Grid>

        {/* URL Input Section */}
        {showUrlSection && (
          <Box sx={{ mt: 3, mb: 3, p: 2.5, border: "1px dashed #ccc", borderRadius: 2, bgcolor: "#fbfbfb" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
              <Link color="primary" /> Process Images from URL
            </Typography>

            <Grid container spacing={1.5}>
              {imageUrls.map((url, index) => (
                <Grid key={index} display="flex" alignItems="center" gap={1} size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`Image URL ${index + 1}`}
                    placeholder="Paste Image URL here... (or paste a comma-separated list of URLs)"
                    value={url}
                    onChange={(e) => handleUrlChange(index, e.target.value)}
                    onPaste={(e) => handlePaste(index, e)}
                  />
                  {imageUrls.length > 1 && (
                    <IconButton color="error" size="small" onClick={() => handleRemoveUrlField(index)}>
                      <Delete />
                    </IconButton>
                  )}
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={handleAddUrlField}
              >
                Add URL Field
              </Button>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={handleProcessUrls}
                disabled={loading}
              >
                {loading ? "Processing..." : "Save URLs"}
              </Button>
            </Box>
          </Box>
        )}

        {isPending && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              p: 3,
              mt: 2,
              mb: 2,
              border: "1px solid #ffe0b2",
              borderRadius: 2,
              bgcolor: "#fff3e0",
            }}
          >
            <CircularProgress size={20} color="warning" />
            <Typography variant="body2" sx={{ color: "#e65100", fontWeight: "bold" }}>
              We are still getting the data from the image. Please wait...
            </Typography>
          </Box>
        )}

        {/* Menu Items List */}
        {menuItems.map((item, idx) => (
          <Box key={item.id} sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <UniversalCat
                  label="Universal Category"
                  value={item.selectedUniversalCategory}
                  onChange={(opt) => updateMenuItem(idx, { selectedUniversalCategory: opt })}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <UniversalItem
                  label="Universal Item"
                  value={item.selectedUniversalItem}
                  onChange={(opt) => updateMenuItem(idx, { selectedUniversalItem: opt })}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <FormControl fullWidth size="small">
                  <InputLabel id={`food-type-label-${idx}`}>Food Type</InputLabel>
                  <Select
                    labelId={`food-type-label-${idx}`}
                    value={item.menu_type || ""}
                    label="Food Type"
                    onChange={(e) => updateMenuItem(idx, { menu_type: e.target.value })}
                  >
                    <MenuItem value="">Select Food Type</MenuItem>
                    <MenuItem value="Veg">Veg</MenuItem>
                    <MenuItem value="Non-Veg">Non-Veg</MenuItem>
                    <MenuItem value="Egg">Egg</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <TextField
                  fullWidth
                  label="Category Name"
                  size="small"
                  value={item.category_nick_name}
                  onChange={(e) => updateMenuItem(idx, { category_nick_name: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} alignItems="center" mt={1}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <TextField
                  fullWidth
                  label="Menu Name"
                  size="small"
                  value={item.menu_nick_name}
                  onChange={(e) => updateMenuItem(idx, { menu_nick_name: e.target.value })}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <TextField
                  fullWidth
                  label="Price"
                  size="small"
                  type="number"
                  value={item.menu_item_price}
                  onChange={(e) => updateMenuItem(idx, { menu_item_price: e.target.value })}
                />
              </Grid>
              <Grid
                ml="auto"
                display="flex"
                justifyContent="flex-end"
                gap={1}
                size={{
                  xs: 12,
                  md: 3
                }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveItem(idx)}
                >
                  REMOVE
                </Button>
                <Button variant="contained" size="small" onClick={() => handleSaveItem(idx)}>
                  SAVE
                </Button>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Paper>
      {/* Loader + Alerts */}
      <Backdrop open={loading} sx={{ color: "#fff", zIndex: (t) => t.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert((a) => ({ ...a, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </Box>
  );
}
