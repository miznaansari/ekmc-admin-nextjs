import React, { useEffect, useState, useRef, useCallback } from "react";
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
  useMediaQuery,
} from "@mui/material";
import axios from "axios";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";

const ExpandableTable = ({ cafeId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("authToken");

  /* ================= WIDTH (MOBILE ONLY) ================= */
  const [innerWidth, setInnerWidth] = useState("100%");

  useEffect(() => {
    if (!isMobile) return;

    const updateWidth = () => {
      setInnerWidth(window.innerWidth - 76); // safe padding
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, [isMobile]);

  /* ================= FORM ================= */
  const { control, reset, getValues } = useForm({
    defaultValues: {
      is_veg: 0,
      is_non_veg: 0,
      allow_order: 0,
      allow_qr_edit: 0,
      allow_login: 0,
      allow_menu_edit: 0,
      allow_profile_edit: 0,
      is_test_cafe: 0,
      status: 0,
      is_published: 0,
      is_user_location_required: 0,
      is_daily_report: 0,
      is_limelight: 0,
      is_hot_today: 0,
      is_featured: 0,
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

      const rawData = res.data?.data;
      const data = Array.isArray(rawData) ? rawData[0] : rawData;
      if (!data) return;

      reset({
        cafe_name: data.cafe_name || "",
        cafe_email: data.cafe_email || "",
        cafe_mobile_number: data.cafe_mobile_number || "",
        cafe_slogan: data.cafe_slogan || "",
        description: data.cafe_about || "",
        is_featured: data.is_featured || false,
        is_most_visited: data.is_most_visited || false,
        is_new_opening: data.is_new_opening || false,
        is_veg: data.is_veg || false,
        is_non_veg: data.is_non_veg || false,
        status: data.status || false,
        is_published: data.is_published || false,
        show_res_menu: data.show_res_menu || false,
        allow_order: data.allow_order || false,
        allow_login: data.allow_login || false,
        allow_profile_edit: data.allow_profile_edit || false,
        allow_menu_edit: data.allow_menu_edit || false,
        is_user_location_required: data.is_user_location_required || false,
        is_limelight: data.is_limelight || false,
        is_hot_today: data.is_hot_today || false,
        is_daily_report: data.is_daily_report || false,
        city_id: data.city_id,
        logo_image_id: data.cafe_logo_azure_original_image_url,
        allow_qr_edit: data.allow_qr_edit,
        is_test_cafe: data.is_test_cafe || false,
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
    } finally {
      setLoading(false);
    }
  }, [cafeId, baseUrl, token, reset]);



   const toggleFeatured = async (img) => {
      const willBeFeatured = img.is_featured ? 0 : 1;
      const previousGallery = gallery;

      // Keep only one featured image at a time.
      const nextGallery = gallery.map((i) => {
        if (i.id === img.id) {
          return { ...i, is_featured: willBeFeatured };
        }
        if (willBeFeatured === 1) {
          return { ...i, is_featured: 0 };
        }
        return i;
      });

      setGallery(nextGallery);

      try {
        const changedImages = nextGallery.filter((nextImg) => {
          const prevImg = previousGallery.find((p) => p.id === nextImg.id);
          return prevImg && prevImg.is_featured !== nextImg.is_featured;
        });

        await Promise.all(
          changedImages.map((changedImg) =>
            axios.put(
              `${baseUrl}/api/user/admin/restaurant/featured-image/${changedImg.id}`,
              {
                cafe_image_name: changedImg.cafe_image_name,
                image_position: changedImg.image_position,
                is_featured: changedImg.is_featured,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          )
        );
      } catch {
        setGallery(previousGallery);
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

  useEffect(() => {
    if (cafeId) fetchCafeDetails();
    return () => updateTimer.current && clearTimeout(updateTimer.current);
  }, [cafeId, fetchCafeDetails]);

  if (loading) return <Paper sx={{ p: 2 }}>Loading…</Paper>;

  /* ================= UI ================= */
  return (
    <>
      <Paper
        sx={{
          p: 0,
          mx: 0,
          width: isMobile ? innerWidth : "100%",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {/* FOOD TYPE */}
        <Typography variant="subtitle2" color="#00000099">
          Food Type
        </Typography>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          mt={1}
          flexWrap="wrap"
        >
          {["is_veg", "is_non_veg"].map((name) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <Box sx={{ width: isMobile ? innerWidth : "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2">
                    {name === "is_veg" ? "Veg" : "Non-Veg"}
                  </Typography>
                  <Switch
                    size="small"
                    checked={!!field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked ? 1 : 0);
                      debouncedUpdate();
                    }}
                  />
                </Box>
              )}
            />
          ))}
        </Stack>

        {/* PERMISSIONS */}
        <Typography mt={2} variant="subtitle2" color="#00000099">
          Permissions
        </Typography>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          mt={1}
          flexWrap="wrap"
        >
          {[
            ["allow_order", "Can Order"],
            ["allow_qr_edit", "Edit Table"],
            ["allow_login", "Can Login"],
            ["allow_menu_edit", "Edit Menu"],
            ["allow_profile_edit", "Edit Profile"],
            ["is_test_cafe", "Test Cafe"],
          ].map(([name, label]) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <Box sx={{ width: isMobile ? innerWidth : "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2">{label}</Typography>
                  <Switch
                    size="small"
                    checked={!!field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked ? 1 : 0);
                      debouncedUpdate();
                    }}
                  />
                </Box>
              )}
            />
          ))}
        </Stack>

        {/* STATUS */}
        <Typography mt={2} variant="subtitle2" color="#00000099">
          Status
        </Typography>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          mt={1}
          flexWrap="wrap"
        >
          {[
            ["status", "Active"],
            ["is_published", "Published"],
            ["is_user_location_required", "User Location Required"],
            ["is_daily_report", "Daily Report"],
            ["is_limelight", "Limelight"],
            ["is_hot_today", "Hot Today"],
            ["is_featured", "Featured"],
          ].map(([name, label]) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <Box sx={{ width: isMobile ? innerWidth : "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography variant="body2">{label}</Typography>
                  <Switch
                    size="small"
                    checked={!!field.value}
                    onChange={(e) => {
                      field.onChange(e.target.checked ? 1 : 0);
                      debouncedUpdate();
                    }}
                  />
                </Box>
              )}
            />
          ))}
        </Stack>

        {/* IMAGES */}
        <Grid container spacing={1.5} mt={2}>
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
                <CardMedia component="img" height={100} image={img.imageUrl} />
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
