import React, { useEffect, useState, useCallback, useRef } from "react";
import { Delete24Regular } from "@fluentui/react-icons";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";

const ExpandableTable = ({ cafeId }) => {
  const theme = useTheme();
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("authToken");

  /* ================= FORM ================= */
  const { control, reset, getValues } = useForm({
    defaultValues: {
      cafe_name: "",
      cafe_email: "",
      cafe_mobile_number: "",
      cafe_slogan: "",
      description: "",
      is_featured: 0,
      is_most_visited: 0,
      is_new_opening: 0,
      is_veg: 0,
      is_non_veg: 0,
      status: 0,
      is_published: 0,
      show_res_menu: 0,
      allow_order: 0,
      allow_login: 0,
      allow_profile_edit: 0,
      allow_menu_edit: 0,
      allow_qr_edit: 0,
      is_user_location_required: 0,
      is_limelight: 0,
      is_hot_today: 0,
      is_daily_report: 0,
      is_test_cafe: 0,
      city_id: 1,
      logo_image_id: "",
    },
  });

  /* ================= STATE ================= */
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  /* ================= DEBOUNCE ================= */
  const updateTimer = useRef(null);

  const debouncedUpdate = () => {
    if (updateTimer.current) clearTimeout(updateTimer.current);

    updateTimer.current = setTimeout(async () => {
      try {
        await axios.post(
          `${baseUrl}/api/user/admin/restaurant-edit-general-information/${cafeId}`,
          getValues(),
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlert({
          open: true,
          severity: "success",
          message: "Restaurant updated",
        });
      } catch {
        setAlert({
          open: true,
          severity: "error",
          message: "Update failed",
        });
      }
    }, 600);
  };

  /* ================= FETCH ================= */
  const fetchCafeDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${baseUrl}/api/user/admin/restaurant-all-info/${cafeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const [data] = res.data.data || [];

      reset({
        ...data,
        description: data?.cafe_about || "",
        logo_image_id: data?.cafe_logo_azure_original_image_url || "",
      });

      setGallery(
        res.data?.gallery?.map((img) => ({
          id: img.id,
          imageUrl:
            img.gallery_cf_360px_image_url ||
            img.gallery_cf_original_image_url,
          is_featured: img.is_featured,
          cafe_image_name: img.cafe_image_name,
          image_position: img.image_position,
        })) || []
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [cafeId, baseUrl, token, reset]);

  useEffect(() => {
    if (cafeId) fetchCafeDetails();
    return () => updateTimer.current && clearTimeout(updateTimer.current);
  }, [cafeId, fetchCafeDetails]);

  /* ================= IMAGE ACTIONS ================= */
  const toggleFeatured = async (img) => {
    const updated = img.is_featured ? 0 : 1;

    setGallery((prev) =>
      prev.map((i) => (i.id === img.id ? { ...i, is_featured: updated } : i))
    );

    try {
      await axios.put(
        `${baseUrl}/api/user/admin/restaurant/featured-image/${img.id}`,
        {
          cafe_image_name: img.cafe_image_name,
          image_position: img.image_position,
          is_featured: updated,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      setAlert({
        open: true,
        severity: "error",
        message: "Feature update failed",
      });
    }
  };

  const removeImage = async (id) => {
    setGallery((prev) => prev.filter((i) => i.id !== id));
    try {
      await axios.delete(
        `${baseUrl}/api/user/admin/restaurant/featured-image/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      setAlert({
        open: true,
        severity: "error",
        message: "Delete failed",
      });
    }
  };

  /* ================= SWITCH GROUPS ================= */
  const switches = [
    { name: "is_veg", label: "Veg" },
    { name: "is_non_veg", label: "Non-Veg" },
    { name: "allow_order", label: "Can Order" },
    { name: "allow_login", label: "Can Login" },
    { name: "allow_menu_edit", label: "Edit Menu" },
    { name: "allow_profile_edit", label: "Edit Profile" },
    { name: "status", label: "Active" },
    { name: "is_featured", label: "Featured" },
    { name: "is_hot_today", label: "Hot Today" },
    { name: "is_test_cafe", label: "Test Cafe" },
  ];

  if (loading) return <Paper sx={{ p: 2 }}>Loading…</Paper>;

  /* ================= UI ================= */
  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" flexWrap="wrap" gap={3}>
            {switches.map(({ name, label }) => (
              <Controller
                key={name}
                name={name}
                control={control}
                render={({ field }) => (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Switch
                      size="small"
                      checked={!!field.value}
                      onChange={(e) => {
                        field.onChange(e.target.checked ? 1 : 0);
                        debouncedUpdate();
                      }}
                    />
                    <Typography variant="body2">{label}</Typography>
                  </Box>
                )}
              />
            ))}
          </Stack>

          <Grid container spacing={1.5}>
            {gallery.map((img) => (
              <Grid
                key={img.id}
                size={{
                  xs: 6,
                  sm: 4,
                  md: 3,
                  lg: 2
                }}>
                <Card>
                  <CardMedia
                    component="img"
                    height={100}
                    image={img.imageUrl}
                  />
                  <CardContent
                    sx={{
                      p: 1,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Switch
                      size="small"
                      checked={img.is_featured === 1}
                      onChange={() => toggleFeatured(img)}
                    />
                    <Box onClick={() => removeImage(img.id)}>
                      <Delete24Regular
                        primaryFill={theme.palette.error.main}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={alert.severity}>{alert.message}</Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(ExpandableTable);
