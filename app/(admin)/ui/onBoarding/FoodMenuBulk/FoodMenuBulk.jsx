import React, { useState, useCallback } from "react";
import { useTheme } from "@mui/material/styles";
import { useDropzone } from "react-dropzone";
import {
    Grid,
    Typography,
    Card,
    CardMedia,
    CardActions,
    Box,
    Snackbar,
    Button,
    Paper,
    Alert,
    Collapse,
    CircularProgress,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
} from "@mui/material";
import Demo from "../../restaurant/Demo";
import { CloudArrowUp32Regular, Delete24Regular } from "@fluentui/react-icons";
import { Sparkle16Filled, Sparkle24Filled } from "@fluentui/react-icons/fonts";

const FoodMenuBulk = () => {
    const theme = useTheme();
    const [gallery, setGallery] = useState([]); // removed STATIC_GALLERY
    const [selectedImage, setSelectedImage] = useState(null);
    const [openCropDialog, setOpenCropDialog] = useState(false);
    const [aspectRatio] = useState(4 / 3);
    const [isUploading, setIsUploading] = useState(false);
    const [alert, setAlert] = useState({ open: false, severity: "success", message: "" });

    const [formData, setFormData] = useState({
        universalCategory: "",
        foodType: "",
        menuName: "",
        categoryName: "",
        price: "",
    });

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

    const uploadImage = (file) => {
        if (!file) return;
        setIsUploading(true);

        // Simulate image upload and add to gallery
        setTimeout(() => {
            const newImage = {
                id: Date.now(),
                cafe_image_name: file.name,
                gallery_cf_360px_image_url: URL.createObjectURL(file),
            };
            setGallery(prev => [...prev, newImage]);
            showAlert("success", "Image uploaded successfully!");
            setIsUploading(false);
        }, 1000);
    };

    const handleRemoveFile = (imageId) => {
        setGallery(prev => prev.filter(img => img.id !== imageId));
        showAlert("warning", "Image deleted.");
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            <Typography variant="h5" gutterBottom>Food Menu Bulk</Typography>
            {/* Upload Box */}
            <Box {...getRootProps()} bgcolor="rgba(36, 36, 36, 0.10)" borderRadius={2} sx={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, mb: 2, textAlign: "center", height: "200px" }}>
                <input {...getInputProps()} />
                <Button variant="outlined" disabled={isUploading}>
                    {isUploading ? <CircularProgress size={24} /> : <CloudArrowUp32Regular />}
                </Button>
                <Typography variant="h6" color="primary.main">
                    {isDragActive ? "Drop the images here..." : "Drag & drop images here, or click to select"}
                </Typography>
            </Box>
            {/* Thumbnails */}
            {gallery.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {gallery.map((img) => (
                        <Grid
                            key={img.id}
                            size={{
                                xs: 6,
                                sm: 3
                            }}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="120"
                                    image={img.gallery_cf_360px_image_url}
                                    alt={img.cafe_image_name}
                                />
                                <CardActions>
                                    <Button
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveFile(img.id)}
                                        startIcon={<Delete24Regular />}
                                    >
                                        Delete
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
            <Button variant="contained" color="primary" startIcon={<Sparkle16Filled />} sx={{ flex: 1 }}>
                Generate with AI
            </Button>
            {/* Form Section */}
            <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                    <Grid
                        size={{
                            xs: 12,
                            sm: 6
                        }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="universalCategory-label">Universal Category</InputLabel>
                            <Select
                                labelId="universalCategory-label"
                                label="Universal Category"
                                value={formData.universalCategory}
                                name="universalCategory"
                                onChange={handleFormChange}
                            >
                                <MenuItem value="">Select Category</MenuItem>
                                <MenuItem value="category1">Category 1</MenuItem>
                                <MenuItem value="category2">Category 2</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 6
                        }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="foodType-label">Food Type</InputLabel>
                            <Select
                                labelId="foodType-label"
                                label="Food Type"
                                value={formData.foodType}
                                name="foodType"
                                onChange={handleFormChange}
                            >
                                <MenuItem value="">Select Type</MenuItem>
                                <MenuItem value="veg">Veg</MenuItem>
                                <MenuItem value="nonVeg">Non-Veg</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>


                    <Grid
                        size={{
                            xs: 12,
                            sm: 6
                        }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Menu Name"
                            variant="outlined"
                            name="menuName"
                            value={formData.menuName}
                            onChange={handleFormChange}
                        />
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 6
                        }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Category Name"
                            variant="outlined"
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleFormChange}
                        />
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            sm: 6
                        }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Price"
                            variant="outlined"
                            name="price"
                            value={formData.price}
                            onChange={handleFormChange}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", gap: 1 }}>
                    <Button variant="outlined" color="error" sx={{ flex: 1 }}>
                        REMOVE
                    </Button>
                    <Button variant="contained" sx={{ flex: 1 }}>
                        SAVE
                    </Button>

                </Box>
            </Box>
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

export default FoodMenuBulk;
