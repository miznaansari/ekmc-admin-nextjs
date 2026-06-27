import React, { useState, useCallback, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { useDropzone } from "react-dropzone";
import {
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  Switch,
  Snackbar,
  Button,
  Paper,
  Alert,
  Collapse,
  CircularProgress,
} from "@mui/material";
import Demo from "../restaurant/Demo";
import { CloudArrowUp32Regular, Delete24Regular } from "@fluentui/react-icons";
import instanceV1 from "../restaurant/authaxios"; // ✅ import axios instance
import { useNavigate } from "react-router-dom";

const STATIC_GALLERY = [];

const ImageGallery = ({ datas, action, setAction }) => {

  useEffect(() => {
    console.log('datas', datas)
  }, [datas])
  const theme = useTheme();
  const [gallery, setGallery] = useState([...STATIC_GALLERY]);
  // const [gallery, setGallery] = useState([...STATIC_GALLERY]);
  useEffect(() => {
    if (datas && typeof datas === "object") {
      const dataArray = Array.isArray(datas) ? datas : Object.values(datas);

      if (dataArray.length > 0) {
        const formatted = dataArray.map(img => ({
          id: img.id,
          cafe_image_name: img.cafe_image_name,
          cafe_list_id: img.cafe_list_id,
          image_position: img.image_position,
          is_featured: img.is_featured,
          gallery_cf_360px_image_url: img.gallery_cf_360px_image_url || img.gallery_cf_original_image_url,
          gallery_cf_original_image_url: img.gallery_cf_original_image_url,
          gallery_auzre_placeholder_image_url: img.gallery_auzre_placeholder_image_url,
        }));
        setGallery(formatted);
      }
    }
  }, [datas]);


  const [selectedImage, setSelectedImage] = useState(null);
  const [openCropDialog, setOpenCropDialog] = useState(false);
  const [aspectRatio] = useState(4 / 3);
  const [isUploading, setIsUploading] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });

  const token = localStorage.getItem("authToken");
  const cafeListId = localStorage.getItem("cafeListId");
  const api = instanceV1(token);

  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
    setTimeout(() => setAlert(prev => ({ ...prev, open: false })), 3000);
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const previewUrl = URL.createObjectURL(acceptedFiles[0]);
      setSelectedImage(previewUrl);
      setOpenCropDialog(true);
    } else {
      showAlert("info", "No file selected.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const navigate = useNavigate();
  // ✅ Upload image API integration
  const uploadImage = async (file) => {
    if (!file) return;
    setIsUploading(true);

    try {
      // 1. Upload file to storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadType", "cafe_gallery");

      const uploadRes = await api.post("/api/admin/cf/v1/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadRes.data?.status) {
        throw new Error(uploadRes.data?.message || "Upload failed");
      }

      const imageUrl = uploadRes.data.customUrl;

      // 2. Save to cafe gallery
      const saveRes = await api.post("/api/admin/onboard/v1/cafe/gallery", {
        cafe_list_id: cafeListId,
        image_url: imageUrl,
        is_featured: false,
      });

      if (!saveRes.data?.status) {
        throw new Error(saveRes.data?.message || "Gallery save failed");
      }

      // 3. Update UI
      const newImage = {
        id: Date.now(),
        cafe_image_name: file.name,
        cafe_list_id: cafeListId,
        image_position: gallery.length + 1,
        is_featured: 0,
        gallery_cf_360px_image_url: imageUrl,
        gallery_cf_original_image_url: imageUrl,
        gallery_auzre_placeholder_image_url: imageUrl,
      };

      setGallery(prev => [...prev, newImage]);
      showAlert("success", "Image uploaded successfully!");
      setAction(() => !action)
    } catch (err) {
      console.error(err);
      showAlert("error", err.message || "Image upload failed!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    navigate('/onboarding/single-food-menu')

  }


  const handleRemoveFile = (imageId) => {
    setGallery(prev => prev.filter(img => img.id !== imageId));
    showAlert("warning", "Image deleted.");
    // Optionally, call API to delete image here
  };

  const handleToggleFeatured = (imageId) => {
    setGallery(prev =>
      prev.map(img => ({ ...img, is_featured: img.id === imageId ? 1 : 0 }))
    );
    showAlert("info", "Featured image updated.");
    // Optionally, call API to update featured image here
  };

  return (
    <Paper sx={{ width: "100%", p: 2 }}>
      <Collapse in={alert.open}>
        <Snackbar open={alert.open} anchorOrigin={{ vertical: "top", horizontal: "center" }} sx={{ mt: 2 }}>
          <Alert severity={alert.severity} sx={{ width: "100%" }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Collapse>
      <Typography variant="h5" gutterBottom>Image Gallery</Typography>
      <Box {...getRootProps()} bgcolor="rgba(36, 36, 36, 0.10)" borderRadius={2} sx={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, mb: 2, textAlign: "center", height: "200px" }}>
        <input {...getInputProps()} />
        <Button variant="outlined" disabled={isUploading}>
          {isUploading ? <CircularProgress size={24} /> : <CloudArrowUp32Regular />}
        </Button>
        <Typography variant="h6" color="primary.main">
          {isDragActive ? "Drop the images here..." : "Drag & drop images here, or click to select"}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {gallery.map((image) => (
          <Grid
            key={image.id}
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <Card>
              <CardMedia
                component="img"
                height="171px"
                image={image.gallery_cf_360px_image_url}
                alt={image.cafe_image_name}
                sx={{ width: "100%", objectFit: "cover", borderRadius: "12px 12px 0 0" }}
              />
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Switch
                      checked={image.is_featured === 1}
                      onChange={() => handleToggleFeatured(image.id)}
                    />
                    <Typography variant="body1">{image.cafe_image_name}</Typography>
                  </Box>
                  <Box component="span" onClick={() => handleRemoveFile(image.id)} sx={{ cursor: "pointer", ml: 1 }}>
                    <Delete24Regular primaryFill={theme.palette.error.main} />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Button variant="contained" onClick={() => handleNext()}>Next</Button>
          </Grid>
        ))}
      </Grid>
      <Demo
        uploadImage={uploadImage}
        aspect={aspectRatio}
        selectedImage={selectedImage}
        onClose={() => setOpenCropDialog(false)}
        open={openCropDialog}
        setOpenCropDialog={setOpenCropDialog}
        setSelectedImage={setSelectedImage}
      />
    </Paper>
  );
};

export default ImageGallery;
