import { CloudArrowUp32Regular, Delete24Regular } from "@fluentui/react-icons";
import { Alert, Box, Button, Card, CardContent, CardMedia, CircularProgress, Collapse, Grid, Paper, Snackbar, Stack, Switch, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import Demo from "../../ImageCroper/Demo";

const ImageGallery = ({ cafeId, transferTargetCafeId = null, onSave = null }) => {
    console.log("cafe id in image gallery- ", cafeId)
    const theme = useTheme();
    const [gallery, setGallery] = useState([]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [openCropDialog, setOpenCropDialog] = useState(false);
    const [aspectRatio] = useState(4 / 3);
    const [pendingFile, setPendingFile] = useState(null); // Store the original file for upload after crop

    const [isUploading, setIsUploading] = useState(false);
    const [transferringImageId, setTransferringImageId] = useState(null);
    const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
    const token = localStorage.getItem('authToken')

    const [alert, setAlert] = useState({
        open: false,
        severity: "success",
        message: "",
    });

    const showAlert = (severity, message) => {
        setAlert({
            open: true,
            severity,
            message,
        });
        setTimeout(() => {
            setAlert((prev) => ({ ...prev, open: false }));
        }, 3000);
    };

    // Modified onDrop to open crop dialog instead of direct upload
    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // Create preview URL for cropping
            const imageUrl = URL.createObjectURL(file);

            // Store the original file and open crop dialog
            setPendingFile(file);
            setSelectedImage(imageUrl);
            setOpenCropDialog(true);
        } else {
            showAlert("info", "No file selected.");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [] },
    });

    // Updated upload function to handle cropped images
    const uploadImage = async (croppedFile) => {
        console.log('uploadImage called with:', croppedFile);

        if (!croppedFile) {
            showAlert("error", "No cropped image to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", croppedFile);
        formData.append("uploadType", "cafe_gallery");

        try {
            setIsUploading(true);
            const response = await axios.post(
                `${baseUrl}/api/admin/cf/v1/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const uploadedUrl = response.data?.customUrl;
            console.log("Uploaded image URL:", uploadedUrl);

            if (!uploadedUrl) {
                showAlert("error", "Upload failed: No URL returned.");
                return;
            }

            // Add to gallery optimistically
            setGallery((prev) => [
                ...prev,
                {
                    imageUrl: uploadedUrl,
                    id: Math.random(), // use actual id from backend if available
                    is_featured: 0,
                    cafe_image_name: croppedFile.name,
                },
            ]);

            const galleryPayload = {
                cafe_image_name: croppedFile.name,
                image_position: gallery.length + 1,
                server_image_id: uploadedUrl,
                is_featured: "0",
            };

            const saveResponse = await axios.post(
                `${baseUrl}/api/user/admin/restaurant/featured-image/${cafeId}`,
                galleryPayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            await fetchImageGallery();
            onSave?.();
            showAlert("success", "Image cropped, uploaded & added to gallery!");

        } catch (error) {
            console.log("Upload error:", error);
            showAlert("error", "Failed to upload image.");
        } finally {
            setIsUploading(false);
            // Clean up
            setPendingFile(null);
            if (selectedImage) {
                URL.revokeObjectURL(selectedImage);
            }
            setSelectedImage(null);
        }
    };

    // Handle crop dialog close
    const handleCropClose = () => {
        setOpenCropDialog(false);
        // Clean up blob URL to prevent memory leaks
        if (selectedImage) {
            URL.revokeObjectURL(selectedImage);
        }
        setSelectedImage(null);
        setPendingFile(null);
    };

    //fetch image gallery
    const fetchImageGallery = async (cafeIdToFetch = cafeId) => {
        try {
            const response = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${cafeIdToFetch}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log("response all info- ", response.data)
            console.log("response- ", response.data?.gallery)
            const images = response.data?.gallery.map((image) => ({
                imageUrl: image.gallery_cf_1080px_image_url || image.gallery_cf_original_image_url,
                id: image.id,
                is_featured: image.is_featured,
                cafe_image_name: image.cafe_image_name,
                image_position: image.image_position
            }))
            console.log("images- ", images);
            setGallery(images)

        } catch (e) {
            console.log("error during fetch image gallery- ", e)
        }
    }

    useEffect(() => {
        fetchImageGallery();
    }, [cafeId]);

    useEffect(() => {
        const handleGalleryRefresh = (event) => {
            const affectedCafeIds = event.detail?.cafeIds || [];

            if (affectedCafeIds.includes(cafeId)) {
                fetchImageGallery();
            }
        };

        window.addEventListener("cafe-gallery-updated", handleGalleryRefresh);
        return () => window.removeEventListener("cafe-gallery-updated", handleGalleryRefresh);
    }, [cafeId]);

    const handleRemoveFile = async (imageId) => {
        try {
            // Optimistic UI update - remove image immediately
            setGallery((prev) => prev.filter((img) => img.id !== imageId));

            const response = await axios.delete(`${baseUrl}/api/user/admin/restaurant/featured-image/${imageId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            console.log("response in remove image - ", response)
            if (response.data?.success) {
                showAlert("success", "Image deleted successfully!");
            } else {
                // Revert the UI update if the API call fails
                fetchImageGallery();
                showAlert("error", "Failed to delete image.");
            }

        } catch (e) {
            console.log("error during delete image - ", e);
            // Revert the UI update if the API call fails
            fetchImageGallery();
            showAlert("error", "Failed to delete image.");
        }
    }

    const handleTransferImageUrl = async (image) => {
        if (!transferTargetCafeId) {
            showAlert("info", "No target cafe selected for transfer.");
            return;
        }

        const transferPayload = {
            cafe_image_name: image.cafe_image_name || `transferred-image-${Date.now()}`,
            image_position: image.image_position || gallery.length + 1,
            server_image_id: image.imageUrl,
            is_featured: String(image.is_featured === 1 ? 1 : 0),
        };

        try {
            setTransferringImageId(image.id);
            await axios.post(
                `${baseUrl}/api/user/admin/restaurant/featured-image/${transferTargetCafeId}`,
                transferPayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            window.dispatchEvent(
                new CustomEvent("cafe-gallery-updated", {
                    detail: { cafeIds: [cafeId, transferTargetCafeId] },
                })
            );
            showAlert("success", `Image URL transferred to cafe ${transferTargetCafeId}`);
        } catch (e) {
            console.log("error during transfer image url - ", e);
            showAlert("error", "Failed to transfer image URL.");
        } finally {
            setTransferringImageId(null);
        }
    };

    //featured image toggle
    const handleToggleFeatured = async (image) => {
        console.log("image in toggle featured = ", image);

        // Get the new featured state (toggled)
        const newFeaturedState = image.is_featured === 1 ? 0 : 1;

        // Optimistic UI update - update the state immediately
        setGallery(prevGallery =>
            prevGallery.map(img =>
                img.id === image.id
                    ? { ...img, is_featured: newFeaturedState }
                    : img
            )
        );

        const featuredImagePayload = {
            cafe_image_name: image.cafe_image_name,
            image_position: image.image_position,
            is_featured: newFeaturedState
        }

        try {
            const response = await axios.put(
                `${baseUrl}/api/user/admin/restaurant/featured-image/${image.id}`,
                featuredImagePayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            showAlert("success", "Image feature updated successfully!");
            console.log("response update featured image - ", response);
            fetchImageGallery()
        } catch (e) {
            console.log("error during update is featured image = ", e);
            // Revert the UI update if the API call fails
            fetchImageGallery();
            showAlert("error", "Failed to update Image feature!");
        }
    }

    return (
        <>
            <Paper sx={{ width: "100%", p: 0 }}>
                <Collapse in={alert.open}>
                    <Snackbar
                        open={alert.open}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        sx={{ mt: 2 }}
                    >
                        <Alert severity={alert.severity} sx={{ width: "100%" }}>
                            {alert.message}
                        </Alert>
                    </Snackbar>
                </Collapse>

                <Typography variant="h5" gutterBottom>
                    Image Gallery
                </Typography>

                <Box {...getRootProps()} bgcolor={'rgba(36, 36, 36, 0.10)'} borderRadius={2} sx={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, mb: 2, textAlign: 'center', height: '200px' }}>
                    <input {...getInputProps()} />
                    <Button variant="outlined" disabled={isUploading}>
                        {isUploading ? <CircularProgress size={24} /> : <CloudArrowUp32Regular />}
                    </Button>
                    <Typography variant="h6" color="primary.main">
                        {isDragActive
                            ? "Drop the images here..."
                            : "Drag & drop images here, or click to select"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Images will be cropped before upload
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {gallery.map((image, index) => (
                        <Grid
                            key={index}
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 6
                            }}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="171px"
                                    image={image.imageUrl}
                                    alt={image.cafe_image_name}
                                    sx={{
                                        width: "100%",
                                        objectFit: "cover",
                                        borderRadius: "12px 12px 0px 0px",
                                    }}
                                />
                                <CardContent>
                                    <Stack spacing={1}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                                <Switch
                                                    checked={image.is_featured === 1}
                                                    onChange={() => handleToggleFeatured(image)}
                                                />
                                                <Typography variant="body1">
                                                    {/* {image.cafe_image_name} */}
                                                </Typography>
                                            </Box>
                                            <Box
                                                component="span"
                                                onClick={() => handleRemoveFile(image.id)}
                                                sx={{ cursor: "pointer", ml: 1 }}
                                            >
                                                <Delete24Regular primaryFill={theme.palette.error.main} />
                                            </Box>
                                        </Box>

                                        {transferTargetCafeId && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                disabled={transferringImageId === image.id}
                                                onClick={() => handleTransferImageUrl(image)}
                                            >
                                                {transferringImageId === image.id
                                                    ? "Transferring..."
                                                    : `Transfer URL to ${transferTargetCafeId}`}
                                            </Button>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>
            {/* Crop Dialog */}
            <Demo
                selectedImage={selectedImage}
                open={openCropDialog}
                onClose={handleCropClose}
                uploadImage={uploadImage}
                aspect={aspectRatio}
                setSelectedImage={setSelectedImage}
                setOpenCropDialog={setOpenCropDialog}
            />
        </>
    );
}

export default ImageGallery