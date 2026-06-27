import { CloudArrowUp32Regular, Delete24Regular } from "@fluentui/react-icons";
import { Alert, Box, Button, Card, CardContent, CardMedia, CircularProgress, Collapse, Grid, Paper, Snackbar, Switch, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Demo from "../../ImageCroper/Demo";

const ProgressiveCardMedia = ({ image }) => {
    const original = image.gallery_cf_original_image_url;
    const v1080 = image.gallery_cf_1080px_image_url;
    const v720 = image.gallery_cf_720px_image_url;
    const v480 = image.gallery_cf_480px_image_url;
    const v360 = image.gallery_cf_360px_image_url;
    const v240 = image.gallery_cf_240px_image_url;
    const placeholder = image.gallery_cf_placeholder_image_url;

    // "if all variant null then check only original otherwise not"
    const hasVariants = !!(v1080 || v720 || v480 || v360 || v240 || placeholder);

    if (!hasVariants) {
        return (
            <CardMedia
                component="img"
                height="171px"
                image={original || image.imageUrl}
                alt={image.cafe_image_name}
                sx={{
                    width: "100%",
                    objectFit: "cover",
                    borderRadius: "12px 12px 0px 0px",
                }}
            />
        );
    }

    const srcSetParts = [];
    if (v240) srcSetParts.push(`${v240} 240w`);
    if (v360) srcSetParts.push(`${v360} 360w`);
    if (v480) srcSetParts.push(`${v480} 480w`);
    if (v720) srcSetParts.push(`${v720} 720w`);
    if (v1080) srcSetParts.push(`${v1080} 1080w`);
    const srcSet = srcSetParts.join(", ");

    return (
        <CardMedia
            component="img"
            height="171px"
            image={v360 || v480 || original || image.imageUrl}
            srcSet={srcSet || undefined}
            sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
            alt={image.cafe_image_name}
            sx={{
                width: "100%",
                objectFit: "cover",
                borderRadius: "12px 12px 0px 0px",
            }}
        />
    );
};

const ImageGallery = ({ cafeId }) => {
    console.log("cafe id in image gallery- ", cafeId)
    const theme = useTheme();
    const [gallery, setGallery] = useState([]);
    const [googleImages, setGoogleImages] = useState([]);
    const [isFetchingGoogle, setIsFetchingGoogle] = useState(false);
    const [importingUrls, setImportingUrls] = useState([]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [openCropDialog, setOpenCropDialog] = useState(false);
    const [aspectRatio] = useState(4 / 3);
    const [pendingFile, setPendingFile] = useState(null); // Store the original file for upload after crop

    const [isUploading, setIsUploading] = useState(false);
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
    const fetchImageGallery = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${cafeId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log("response all info- ", response.data)
            console.log("response- ", response.data?.gallery)
            const images = response.data?.gallery.map((image) => ({
                imageUrl: image.gallery_cf_original_image_url,
                id: image.id,
                is_featured: image.is_featured,
                cafe_image_name: image.cafe_image_name,
                image_position: image.image_position,
                gallery_cf_original_image_url: image.gallery_cf_original_image_url,
                gallery_cf_1080px_image_url: image.gallery_cf_1080px_image_url,
                gallery_cf_720px_image_url: image.gallery_cf_720px_image_url,
                gallery_cf_480px_image_url: image.gallery_cf_480px_image_url,
                gallery_cf_360px_image_url: image.gallery_cf_360px_image_url,
                gallery_cf_240px_image_url: image.gallery_cf_240px_image_url,
                gallery_cf_placeholder_image_url: image.gallery_cf_placeholder_image_url,
                is_processing: image.is_processing
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

    // Fetch google images
    const fetchGoogleImages = async () => {
        try {
            setIsFetchingGoogle(true);
            const response = await axios.get(
                `${baseUrl}/api/admin/v1/google/fetch-image/${cafeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log("Fetch google images response- ", response.data);
            if (response.data?.status && response.data?.images) {
                setGoogleImages(response.data.images);
                showAlert("success", `${response.data.total_images || response.data.images.length} images fetched from Google!`);
            } else {
                showAlert("info", response.data?.msg || "No images found for this cafe on Google.");
            }
        } catch (error) {
            console.error("Error fetching Google images:", error);
            showAlert("error", error?.response?.data?.msg || "Failed to fetch images from Google.");
        } finally {
            setIsFetchingGoogle(false);
        }
    };

    // Import google image
    const handleImportGoogleImage = async (googleImageUrl, position) => {
        try {
            setImportingUrls((prev) => [...prev, googleImageUrl]);
            // 1. Fetch image URL as blob
            const response = await fetch(googleImageUrl);
            if (!response.ok) {
                throw new Error("Failed to download image from Google");
            }
            const blob = await response.blob();
            
            // 2. Create File from Blob
            const mimeType = blob.type || 'image/jpeg';
            const extension = mimeType.split('/')[1] || 'jpg';
            const filename = `google_image_${cafeId}_${position}_${Date.now()}.${extension}`;
            const file = new File([blob], filename, { type: mimeType });

            // 3. Upload File
            const formData = new FormData();
            formData.append("file", file);
            formData.append("uploadType", "cafe_gallery");

            const uploadRes = await axios.post(
                `${baseUrl}/api/admin/cf/v1/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            const uploadedUrl = uploadRes.data?.customUrl;
            if (!uploadedUrl) {
                throw new Error("Upload failed: No URL returned from server.");
            }

            // 4. Save to gallery
            const galleryPayload = {
                cafe_image_name: filename,
                image_position: gallery.length + 1,
                server_image_id: uploadedUrl,
                is_featured: "0",
            };

            await axios.post(
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
            showAlert("success", "Google image imported successfully!");
            // Remove from the list of google images since it is imported
            setGoogleImages((prev) => prev.filter((img) => img.image_url !== googleImageUrl));
        } catch (error) {
            console.error("Import error:", error);
            showAlert("error", error.message || "Failed to import Google image.");
        } finally {
            setImportingUrls((prev) => prev.filter((url) => url !== googleImageUrl));
        }
    };

    return (
        <>
            <Paper sx={{ width: "100%", p: 2 }}>
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

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h5" gutterBottom={false}>
                        Image Gallery
                    </Typography>
                    <Button
                        variant="outlined"
                        color="primary"
                        disabled={isFetchingGoogle}
                        onClick={fetchGoogleImages}
                        startIcon={isFetchingGoogle ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {isFetchingGoogle ? "Fetching..." : "Fetch Google Images"}
                    </Button>
                </Box>

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

                {/* Google Suggested Images */}
                {googleImages.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom color="primary.main" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Google Suggested Images
                        </Typography>
                        <Grid container spacing={2}>
                            {googleImages.map((image, index) => (
                                <Grid
                                    key={`google-${index}`}
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        md: 4
                                    }}>
                                    <Card sx={{ position: 'relative', overflow: 'visible' }}>
                                        {/* Google Tag top right corner */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                right: 10,
                                                bgcolor: '#4285F4',
                                                color: 'white',
                                                px: 1.5,
                                                py: 0.5,
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                zIndex: 10,
                                                boxShadow: 2,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            Google
                                        </Box>
                                        <CardMedia
                                            component="img"
                                            height="171px"
                                            image={image.image_url}
                                            alt={`Google Place Image ${index + 1}`}
                                            sx={{
                                                width: "100%",
                                                objectFit: "cover",
                                                borderRadius: "12px 12px 0px 0px",
                                            }}
                                        />
                                        <CardContent>
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Position: {image.image_position}
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled={importingUrls.includes(image.image_url)}
                                                    onClick={() => handleImportGoogleImage(image.image_url, image.image_position)}
                                                    startIcon={importingUrls.includes(image.image_url) ? <CircularProgress size={14} color="inherit" /> : null}
                                                    sx={{
                                                        bgcolor: 'success.main',
                                                        '&:hover': {
                                                            bgcolor: 'success.dark',
                                                        },
                                                        textTransform: 'none',
                                                        borderRadius: '8px'
                                                    }}
                                                >
                                                    {importingUrls.includes(image.image_url) ? "Importing..." : "Import"}
                                                </Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                <Grid container spacing={2}>
                    {gallery.map((image, index) => (
                        <Grid
                            key={image.id}
                            size={{
                                xs: 12,
                                sm: 6,
                                md: 4
                            }}>
                            <Card>
                                <ProgressiveCardMedia image={image} />
                                <CardContent>
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