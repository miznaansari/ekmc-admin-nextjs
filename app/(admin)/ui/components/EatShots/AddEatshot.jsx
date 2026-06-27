/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import {
    Box,
    TextField,
    Button,
    Typography,
    Autocomplete,
    Chip,
    Paper,
    Stack,
    IconButton,
    CircularProgress,
    Grid2,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme,
    Slider,
    Switch,
    FormControlLabel
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Close, Videocam } from "@mui/icons-material";
import { Delete16Regular } from "@fluentui/react-icons";
import * as tus from "tus-js-client";

const AddEatshot = ({ onSuccess, onCancel }) => {
    const {
        control,
        handleSubmit,
    } = useForm({
        defaultValues: {
            video: "",
            cafes: [],
            tag_user: [],
            author: null,
            hasTags: [],
            ststus: null,
            captions: "",
            is_test: false
        }
    });
    const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
    const token = localStorage.getItem("authToken");
    const [previewVideo, setPreviewVideo] = useState(null);
    const [uploading, setUploading] = useState(false); // Track upload state
    const [searchCafequery, setSearchCafequery] = useState("");
    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [taggedUsers, setTaggedusers] = useState([]);
    const [searchTagusers, setSearchTagUsers] = useState("");
    const [hashtags, setHashtags] = useState([]);
    const theme = useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [alert, setAlert] = useState({
        open: false,
        severity: "info",
        message: ""
    });
    const [finalVideoUrl, setFinalVideourl] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [loaderU, setLoaderU] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    // Thumbnail specific states
    const [extractedThumbnail, setExtractedThumbnail] = useState(null); // { file, preview }
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [isThumbnailCustom, setIsThumbnailCustom] = useState(false);
    const [loadingThumbnail, setLoadingThumbnail] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [thumbnailTime, setThumbnailTime] = useState(1.0);

    // Helper to extract thumbnail from video file at specified time
    const extractThumbnail = (file, time = 1.0) => {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.src = URL.createObjectURL(file);
            video.muted = true;
            video.playsInline = true;

            const timeoutId = setTimeout(() => {
                resolve(null);
            }, 6000);

            video.onloadedmetadata = () => {
                const seekTime = Math.min(time, video.duration || 0);
                video.currentTime = seekTime;
            };

            video.onseeked = () => {
                clearTimeout(timeoutId);
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth || 640;
                    canvas.height = video.videoHeight || 360;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const extFile = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
                            resolve({
                                file: extFile,
                                preview: URL.createObjectURL(blob),
                                duration: video.duration || 0
                            });
                        } else {
                            resolve(null);
                        }
                    }, "image/jpeg", 0.85);
                } catch (err) {
                    console.error("Canvas thumbnail generation error:", err);
                    resolve(null);
                }
            };

            video.onerror = () => {
                clearTimeout(timeoutId);
                resolve(null);
            };
        });
    };

    useEffect(() => {
        console.log('videoFile', videoFile?.name);
        if (videoFile) {
            const getThumbnail = async () => {
                setLoadingThumbnail(true);
                const res = await extractThumbnail(videoFile, 1.0);
                if (res) {
                    setExtractedThumbnail(res);
                    setThumbnailFile(res.file);
                    setThumbnailPreview(res.preview);
                    setVideoDuration(res.duration || 0);
                    setThumbnailTime(Math.min(1.0, res.duration || 0));
                    setIsThumbnailCustom(false);
                } else {
                    setExtractedThumbnail(null);
                    setThumbnailFile(null);
                    setThumbnailPreview(null);
                    setVideoDuration(0);
                    setThumbnailTime(1.0);
                    setIsThumbnailCustom(false);
                }
                setLoadingThumbnail(false);
            };
            getThumbnail();
        } else {
            setExtractedThumbnail(null);
            setThumbnailFile(null);
            setThumbnailPreview(null);
            setVideoDuration(0);
            setThumbnailTime(1.0);
            setIsThumbnailCustom(false);
        }
    }, [videoFile]);

    const handleSliderChange = (event, newValue) => {
        setThumbnailTime(newValue);
    };

    const handleSliderChangeCommitted = async (event, newValue) => {
        if (!videoFile) return;
        setLoadingThumbnail(true);
        const res = await extractThumbnail(videoFile, newValue);
        if (res) {
            setExtractedThumbnail(res);
            setThumbnailFile(res.file);
            setThumbnailPreview(res.preview);
            setIsThumbnailCustom(false);
        }
        setLoadingThumbnail(false);
    };

    const handleCustomThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setAlert({
                    open: true,
                    severity: "error",
                    message: "Please select a valid image file for thumbnail",
                });
                e.target.value = "";
                return;
            }
            const previewUrl = URL.createObjectURL(file);
            setThumbnailFile(file);
            setThumbnailPreview(previewUrl);
            setIsThumbnailCustom(true);
        }
        e.target.value = "";
    };

    //Upload video
    const uploadVideo = async () => {
        if (!videoFile) {
            setAlert({
                open: true,
                severity: "error",
                message: "Please select a video first",
            });
            return;
        }

        const size = videoFile.size;
        const limit = 200 * 1024 * 1024; // 200MB limit
        if (size > limit) {
            setAlert({
                open: true,
                severity: "error",
                message: "Video file size exceeds the 200MB limit.",
            });
            return;
        }

        try {
            setUploading(true);

            // Construct Upload-Metadata base64 encoded string
            const metadataParts = [];
            if (videoFile.name) {
                metadataParts.push(`filename ${btoa(unescape(encodeURIComponent(videoFile.name)))}`);
            }
            if (videoFile.type) {
                metadataParts.push(`filetype ${btoa(unescape(encodeURIComponent(videoFile.type)))}`);
            }
            const uploadMetadata = metadataParts.join(",");

            const token = localStorage.getItem("authToken");
            console.log('token', token)
            /*
            STEP 1 — GET PRESIGNED URL
            */
            const presignedRes = await axios.post(
                `${baseurl}/api/admin/cf/v1/presigned-url`, {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Upload-Length": size.toString(),
                        ...(uploadMetadata ? { "Upload-Metadata": uploadMetadata } : {}),
                    },
                }
            );

            const data = presignedRes.data.data;

            const signedUrl = data.signed_url;
            const publicUrl = data.public_url;
            const tusUrl = data.cfs_presigned_url;
            const contentType = data.content_type;

            /*
            STEP 2 — UPLOAD TO R2 (ORIGINAL VIDEO)
            */
            await axios.put(signedUrl, videoFile, {
                headers: {
                    "Content-Type": contentType,
                },
            });

            console.log("✅ Uploaded to R2");

            /*
            STEP 3 — UPLOAD TO CLOUDFLARE STREAM
            */
            let streamMediaId = "";

            const upload = new tus.Upload(videoFile, {
                uploadUrl: tusUrl,
                metadata: {
                    filename: videoFile.name,
                    filetype: videoFile.type,
                },

                onAfterResponse: (req, res) => {
                    const id = res.getHeader("stream-media-id");
                    if (id) streamMediaId = id;
                    return Promise.resolve();
                },

                onProgress: (uploaded, total) => {
                    const percent = ((uploaded / total) * 100).toFixed(2);
                    setAlert({
                        open: true,
                        severity: "info",
                        message: `Uploading ${percent}%`,
                    });
                },

                onSuccess: () => {
                    setAlert({
                        open: true,
                        severity: "success",
                        message: "Cloudflare upload complete",
                    });
                },

                onError: (err) => {
                    console.log(err);
                },
            });

            await new Promise((resolve, reject) => {
                upload.start();
                upload.options.onSuccess = resolve;
                upload.options.onError = reject;
            });

            /*
            STEP 4 — STREAM URL
            */
            const cfStreamUrl = `https://videodelivery.net/${streamMediaId}/manifest/video.m3u8`;

            return {
                originalVideoUrl: publicUrl,
                cfStreamUrl,
            };
        } catch (e) {
            console.log(e);
            setAlert({
                open: true,
                severity: "error",
                message: "Video upload failed",
            });
        } finally {
            setUploading(false);
        }
    };

    // Upload thumbnail image to /api/admin/cf/v1/upload
    const uploadThumbnail = async () => {
        if (!thumbnailFile) return "";

        try {
            const formData = new FormData();
            formData.append("file", thumbnailFile);
            formData.append("uploadType", "thumbnail-eatshots");

            const uploadRes = await axios.post(
                `${baseurl}/api/admin/cf/v1/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (!uploadRes.data?.status) {
                throw new Error(uploadRes.data?.message || "Thumbnail upload failed");
            }

            return uploadRes.data.customUrl || "";
        } catch (e) {
            console.error("Thumbnail upload failed:", e);
            throw e;
        }
    };


    //Tag Eateries / fetch Cafes
    const fetchCafesDropDown = async () => {
        try {
            const response = await axios.get(`${baseurl}/api/user/admin/cafe-list/get/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        s: searchCafequery
                    }
                }
            )
            console.log("cafes-", response.data);
            const options = response.data?.data?.map((cafe) => (
                {
                    label: cafe.cafe_name,
                    value: cafe.id
                }
            )) || [];
            setCafes(options);
        } catch (e) {
            console.log("error during fetching cafes= ", e);
        }
    }
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchCafequery.trim() !== "") {
                setLoading(true);
                fetchCafesDropDown();
                setLoading(false);
            } else {
                setCafes([]);
            }
        }, 300)
        return () => clearTimeout(delayDebounce);
    }, [searchCafequery]);

    //TAG USER DROPDOWN
    const fetchTaguser = async () => {
        try {
            const response = await axios.get(`${baseurl}/admin/customer/get/all`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        s: searchTagusers
                    }
                }
            )
            console.log("response for tagged users:", response);
            const tagusersOptions = response.data?.data?.map((user) => ({
                label: user.full_name,
                value: user.user_customer_id,
                mobile: user.mobile_number,
            }))
            console.log("response for tagged users:", tagusersOptions);
            setTaggedusers(tagusersOptions);
        } catch (e) {
            console.log("error during author tagged user fetching:", e);
        }
    }
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTagusers.trim().length >= 1) {
                setLoading(true);
                fetchTaguser();
                setLoading(false);
            } else {
                setTaggedusers([]);
                setSearchTagUsers("");
            }
        }, 300)

        return () => clearTimeout(delayDebounce);
    }, [searchTagusers])

    //ONSUBMIT
    const onSubmit = async (data) => {
        try {
            setLoading(true);

            /*
            UPLOAD VIDEO FIRST
            */
            const uploadRes = await uploadVideo();

            if (!uploadRes) return;

            /*
            UPLOAD THUMBNAIL SECOND
            */
            let uploadedThumbnailUrl = "";
            if (thumbnailFile) {
                try {
                    uploadedThumbnailUrl = await uploadThumbnail();
                } catch (err) {
                    console.error("Thumbnail upload failed:", err);
                    setAlert({
                        open: true,
                        severity: "warning",
                        message: "Thumbnail upload failed. Submitting eatshot without thumbnail.",
                    });
                }
            }

            const payload = {
                user_customer_id: data?.author?.value,

                original_video_url: uploadRes.originalVideoUrl,
                cf_stream_url: uploadRes.cfStreamUrl,
                captions: data.captions,
                thumbnail_url: uploadedThumbnailUrl || "",
                scheduled_time: null,
                is_test: data.is_test ? 1 : 0,

                tags:
                    data?.hasTags?.map((t) => ({
                        tag: t.replace(/^#/, ""),
                    })) || [],

                cafes:
                    data?.cafes?.map((c) => ({
                        cafe: c.value,
                    })) || [],

                peoples:
                    data?.tag_user?.map((u) => ({
                        user_customer_id: u.value,
                    })) || [],
            };

            /*
            FINAL API
            */
            await axios.post(
                `${baseurl}/api/admin/v2/eatshot`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAlert({
                open: true,
                severity: "success",
                message: "Eatshot created successfully",
            });

            onSuccess();
        } catch (e) {
            console.log(e);
            setAlert({
                open: true,
                severity: "error",
                message: "Failed to create eatshot",
            });
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const preventDefault = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };
        window.addEventListener("dragover", preventDefault);
        window.addEventListener("drop", preventDefault);
        return () => {
            window.removeEventListener("dragover", preventDefault);
            window.removeEventListener("drop", preventDefault);
        };
    }, []);

    const handleVideoFileSelect = (file) => {
        if (file) {
            const limit = 200 * 1024 * 1024;
            if (file.size > limit) {
                setAlert({
                    open: true,
                    severity: "error",
                    message: "Video file size exceeds the 200MB limit. Please choose a smaller video.",
                });
                return;
            }
            const url = URL.createObjectURL(file);
            setPreviewVideo(url);
            setVideoFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleVideoFileSelect(file);
        }
    };

    const handleDelete = () => {
        setPreviewVideo(null);
        setVideoFile(null);
        setExtractedThumbnail(null);
        setThumbnailFile(null);
        setThumbnailPreview(null);
        setIsThumbnailCustom(false);
    };

    return (
        <Box
            sx={{
                height: isMobileScreen ? "95vh" : '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // Prevent body overflow
            }}
        >
            {/* Header - Fixed */}
            <Box
                sx={{
                    bgcolor: "#F7F7F7",
                    p: 1,
                    flexShrink: 0, // Don't allow header to shrink
                    zIndex: 999
                }}
            >
                <Paper sx={{ padding: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h5">Add Eatshot</Typography>
                        <IconButton onClick={onCancel}>
                            <Close />
                        </IconButton>
                    </Stack>
                </Paper>
            </Box>
            {/* Main Content - Scrollable */}
            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden' // Prevent overflow here too
                }}
            >
                <Paper sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    m: 1,
                    overflow: 'hidden'
                }}>
                    {/* Scrollable content area */}
                    <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        px: 2,
                        pt: 2,
                        pb: 1 // Add some bottom padding
                    }}>
                        <Grid2 container spacing={2} sx={{ mb: 3 }}>
                            {/* Video Section */}
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Paper
                                    variant="outlined"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    sx={{
                                        p: 2,
                                        width: "100%",
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '12px',
                                        borderStyle: 'dashed',
                                        borderColor: videoFile ? 'primary.main' : 'divider',
                                        bgcolor: 'background.default',
                                        minHeight: 500,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {!previewVideo ? (
                                        <label htmlFor="upload-video" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <Videocam sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
                                            <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                                Choose or Drag Video
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                MP4, WebM, etc. (Max 200MB)
                                            </Typography>
                                        </label>
                                    ) : (
                                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <video
                                                src={previewVideo}
                                                style={{ width: '100%', maxHeight: 400, borderRadius: '8px', objectFit: 'contain', backgroundColor: '#000' }}
                                                controls
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, wordBreak: 'break-all', textAlign: 'center', px: 1 }}>
                                                {videoFile?.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                                            </Typography>
                                        </Box>
                                    )}
                                    <input
                                        accept="video/*"
                                        id="upload-video"
                                        type="file"
                                        style={{ display: "none" }}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            handleVideoFileSelect(file);
                                            e.target.value = "";
                                        }}
                                    />

                                    {previewVideo && (
                                        <IconButton
                                            onClick={handleDelete}
                                            color="error"
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                bgcolor: 'rgba(255,255,255,0.8)',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                            }}
                                            size="small"
                                        >
                                            <Delete16Regular />
                                        </IconButton>
                                    )}
                                </Paper>
                            </Grid2>

                            {/* Thumbnail Section */}
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '12px',
                                        borderStyle: 'dashed',
                                        borderColor: thumbnailPreview ? 'secondary.main' : 'divider',
                                        bgcolor: 'background.default',
                                        minHeight: 500,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {loadingThumbnail ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <CircularProgress size={40} sx={{ mb: 2 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                Extracting thumbnail...
                                            </Typography>
                                        </Box>
                                    ) : thumbnailPreview ? (
                                        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                            <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                                                <img
                                                    src={thumbnailPreview}
                                                    alt="Thumbnail Preview"
                                                    style={{ width: '100%', maxHeight: 400, borderRadius: '8px', objectFit: 'contain', backgroundColor: '#000' }}
                                                />
                                                <Chip
                                                    label={isThumbnailCustom ? "Custom Upload" : `Extracted (${thumbnailTime.toFixed(1)}s)`}
                                                    color={isThumbnailCustom ? "secondary" : "primary"}
                                                    size="small"
                                                    sx={{ position: 'absolute', top: 8, left: 8, fontWeight: 'bold' }}
                                                />
                                            </Box>

                                            {!isThumbnailCustom && videoDuration > 0 && (
                                                <Box sx={{ width: '100%', mt: 2, px: 1 }}>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: '500' }}>
                                                        Adjust Frame: {thumbnailTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
                                                    </Typography>
                                                    <Slider
                                                        value={thumbnailTime}
                                                        min={0}
                                                        max={videoDuration}
                                                        step={0.1}
                                                        onChange={handleSliderChange}
                                                        onChangeCommitted={handleSliderChangeCommitted}
                                                        valueLabelDisplay="auto"
                                                        valueLabelFormat={(val) => `${val.toFixed(1)}s`}
                                                        size="small"
                                                        color="secondary"
                                                    />
                                                </Box>
                                            )}

                                            <Stack direction="row" spacing={1} sx={{ mt: 2, width: '100%' }}>
                                                <Button
                                                    component="label"
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    startIcon={<PhotoCamera />}
                                                >
                                                    Change Image
                                                    <input
                                                        accept="image/*"
                                                        type="file"
                                                        style={{ display: "none" }}
                                                        onChange={handleCustomThumbnailChange}
                                                    />
                                                </Button>
                                                {isThumbnailCustom && extractedThumbnail && (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        fullWidth
                                                        onClick={() => {
                                                            setThumbnailFile(extractedThumbnail.file);
                                                            setThumbnailPreview(extractedThumbnail.preview);
                                                            setIsThumbnailCustom(false);
                                                        }}
                                                    >
                                                        Use Video Frame
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                            <PhotoCamera sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                                            <Typography variant="subtitle2">
                                                Thumbnail Preview
                                            </Typography>
                                            <Typography variant="caption">
                                                Upload video to auto-extract, or choose custom image
                                            </Typography>

                                            {videoFile && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Button
                                                        component="label"
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<PhotoCamera />}
                                                    >
                                                        Upload Image
                                                        <input
                                                            accept="image/*"
                                                            type="file"
                                                            style={{ display: "none" }}
                                                            onChange={handleCustomThumbnailChange}
                                                        />
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Paper>
                            </Grid2>
                        </Grid2>

                        <Grid2 container spacing={2}>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="cafes"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Autocomplete
                                            multiple
                                            options={cafes}
                                            getOptionKey={(option) => option.value}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            value={value}
                                            onChange={(_, newValue) => onChange(newValue)}
                                            onInputChange={(_, inputValue) => (
                                                setCafes([]),
                                                setSearchCafequery(inputValue)
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Tag cafes"
                                                    variant="outlined"
                                                    size="small"
                                                    margin="dense"
                                                    sx={{ mb: 3 }}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="tag_user"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Autocomplete
                                            multiple
                                            options={taggedUsers}
                                            getOptionKey={(option) => option.value}
                                            getOptionLabel={(option) => option.label}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            value={value}
                                            onChange={(_, newValue) => onChange(newValue)}
                                            filterOptions={(options, { inputValue }) =>
                                                options.filter(
                                                    (option) =>
                                                        option.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
                                                        option.mobile?.toString().includes(inputValue)
                                                )
                                            }
                                            onInputChange={(_, inputValue) => (
                                                setTaggedusers([]),
                                                setSearchTagUsers(inputValue)
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Tag user"
                                                    variant="outlined"
                                                    size="small"
                                                    margin="dense"
                                                    sx={{ mb: 3 }}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="author"
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Autocomplete
                                            options={taggedUsers}
                                            getOptionLabel={(option) => option.label}
                                            getOptionKey={(option) => option.value}
                                            isOptionEqualToValue={(option, value) => option.value === value.value}
                                            value={value}
                                            onChange={(_, newValue) => onChange(newValue)}
                                            filterOptions={(options, { inputValue }) =>
                                                options.filter(
                                                    (option) =>
                                                        option.label?.toLowerCase().includes(inputValue.toLowerCase()) ||
                                                        option.mobile?.toString().includes(inputValue)
                                                )
                                            }
                                            onInputChange={(_, inputValue) => (
                                                setTaggedusers([]),
                                                setSearchTagUsers(inputValue))}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Author"
                                                    variant="outlined"
                                                    size="small"
                                                    margin="dense"
                                                    sx={{ mb: 3 }}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Controller
                                    control={control}
                                    name="captions"
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Caption"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            sx={{ mb: 3 }}
                                        />
                                    )}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 12 }}>
                                <Controller
                                    name="hasTags"
                                    control={control}
                                    defaultValue={[]}
                                    render={({ field: { onChange, value } }) => (
                                        <>
                                            <TextField
                                                label="Hashtags"
                                                placeholder="Type a tag and press enter or space"
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                                sx={{ mb: 3 }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        const newTag = e.target.value.trim();
                                                        if (newTag) {
                                                            const formatted = newTag.startsWith("#") ? newTag : `#${newTag}`;
                                                            if (!value.includes(formatted)) {
                                                                onChange([...value, formatted]);
                                                            }
                                                        }
                                                        e.target.value = "";
                                                        e.preventDefault();
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    e.preventDefault();
                                                    const paste = e.clipboardData.getData("text");
                                                    const tags = paste
                                                        .split(/[\s,]+/) // split by space or comma
                                                        .map(tag => tag.trim())
                                                        .filter(tag => tag) // remove empty strings
                                                        .map(tag => (tag.startsWith("#") ? tag : `#${tag}`))
                                                        .filter(tag => !value.includes(tag)); // remove duplicates
                                                    if (tags.length > 0) {
                                                        onChange([...value, ...tags]);
                                                    }
                                                    e.target.value = "";
                                                }}
                                            />

                                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                                                {value.map((tag) => (
                                                    <Chip
                                                        key={tag}
                                                        label={tag}
                                                        onDelete={() => {
                                                            const filtered = value.filter((t) => t !== tag);
                                                            onChange(filtered);
                                                        }}
                                                        color="primary"
                                                    />
                                                ))}
                                            </Box>
                                        </>
                                    )}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 12 }}>
                                <Controller
                                    name="is_test"
                                    control={control}
                                    defaultValue={false}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label="Is Test"
                                        />
                                    )}
                                />
                            </Grid2>
                        </Grid2>
                    </Box>

                    {/* Footer Buttons - Fixed at bottom */}
                    <Box sx={{
                        p: 2,
                        borderTop: '1px solid #e0e0e0',
                        flexShrink: 0 // Don't allow footer to shrink
                    }}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="outlined"
                                color='error'
                                sx={{ flex: 1 }}
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                sx={{ flex: 1 }}
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} thickness={4} /> : 'Save'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Box>
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

export default AddEatshot;