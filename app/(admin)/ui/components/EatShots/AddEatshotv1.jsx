import {Box,
    Grid,
    TextField,
    Button,
    Typography,
    Autocomplete,
    Chip,
    MenuItem,
    Paper,
    Stack,
    IconButton,
    CircularProgress,
    Snackbar,
    Alert,
    useMediaQuery,
    useTheme} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { Close, Videocam } from "@mui/icons-material";
import { CloudArrowUp16Regular, Delete16Regular } from "@fluentui/react-icons";
import * as tus from "tus-js-client";
import VideoPlayer from "./VideoPlayer";

const AddEatshot = ({ onSuccess, onCancel }) => {
    const {
        control,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }, } = useForm({
            defaultValues: {
                video: "",
                cafes: [],
                tag_user: [],
                author: null,
                hasTags: [],
                ststus: null,
                captions: ""
            }
        });
    const baseurl = process.env.VITE_REACT_APP_BACKEND_URL;
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

    useEffect(() => {
        console.log('videoFile', videoFile?.name)
    }, [videoFile])
    //Upload video
    const uploadVideo = async () => {

        if (!videoFile) {
            console.log("please select a video to upload !!")
            setLoading(false);

            setAlert({ open: true, severity: "error", message: "Error: Please Select a video to Upload!!" })
            return;
        }
        const file = videoFile;

        const formData = new FormData();
        formData.append("file", file)
        console.log("file- ", file);
        console.log("file size-= ", file.size);
        const size = file.size;

        const base64Filename = btoa(`filename ${file.name}`);
        let url
        try {
            setUploading(true)
            const response = await axios.post(`${baseurl}/api/v1/social/video-upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                }
            })
            console.log("response from video upload :", response);
            url = response.data?.thumbnailUrl;
            const thumbnailUrls = response.data?.thumbnailUrl;
            console.log('url1', url)
            setThumbnailUrl(url);
            //return url;

            const responseCfsUpload = await axios.post(`${baseurl}/api/v1/cfs/url`, {}, {
                headers: {
                    authorization: `Bearer ${token}`,
                    "Upload-Length": size.toString(),
                    "Upload-Metadata": base64Filename
                }
            })

            console.log("cfs response- ", responseCfsUpload);
            const uploadUrl = responseCfsUpload.data?.data?.uploadUrl
            console.log("upload url= ", uploadUrl)

            //tus upload

            let streamMediaId = "";
            const upload = new tus.Upload(file, {
                uploadUrl, // this is the signed URL you just got from backend
                metadata: {
                    filename: file.name,
                    filetype: file.type
                },
                onAfterResponse: (req, res) => {
                    return new Promise((resolve) => {
                        const id = res.getHeader("stream-media-id");
                        if (id) {
                            streamMediaId = id;
                            console.log("📹 Cloudflare Stream Media ID:", streamMediaId);
                        }
                        resolve();
                    });
                },
                onError: (error) => {
                    console.error("❌ Upload failed:", error);
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    const percent = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
                    console.log(`⏫ Uploading: ${percent}%`);
                    setAlert({
                        open: true,
                        severity: "info",       // use "info" while uploading
                        message: `⏫ Uploading: ${percent}%`
                    });

                    // Then, when upload completes:
                    if (percent === 100) {
                        setAlert({
                            open: true,
                            severity: "success",
                            message: "✅ Video Uploaded to Cloudflare!!"
                        });
                    }

                },
                onSuccess: () => {
                    console.log("✅ Upload complete!");
                    console.log("🎬 Final stream-media-id:", streamMediaId);
                    setAlert({ open: true, severity: "success", message: "Video Uploaded to cloudflare!!" })
                }
            });

            upload.start();

            //patch request 
            const videoBuffer = await file.arrayBuffer();
            const patchResponse = await axios.patch(uploadUrl, videoBuffer, {
                headers: {
                    "Tus-Resumable": "1.0.0",
                    "Upload-Offset": 0,
                    "Content-Type": "application/offset+octet-stream",
                    "Content-Length": videoBuffer.length,
                }
            });

            console.log("patch response- ", patchResponse)

            //Extract video ID / final
            const videoId = uploadUrl.split('/').pop().split('?')[0];
            console.log("video id-", videoId)
            const m3u8Url = `https://customer-tz4rxebvkwsslm50.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
            console.log("m3u8 url-", m3u8Url);

            setFinalVideourl(m3u8Url);
            console.log('url', url)
            return { m3u8Url, url };

        } catch (e) {
            setLoading(false);

            console.log("error during video upload:", e);
            setAlert({ open: true, severity: "error", message: "Erroe: video Upload failed !!" })

        } finally {
            setUploading(false);
        }
    }

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
        setLoading(true);
        // if (!finalVideoUrl) {
        //     console.log("no video ulr ")
        //     setAlert({ open: true, severity: "error", message: "Error: Please upload Video First!!" })
        //     return;

        // }
        const res = await uploadVideo()
        console.table(res.m3u8Url);
        console.table(res.url);

        const payload = {
            user_customer_id: data?.author?.value,
            cf_stream_url: res.m3u8Url,

            captions: data.captions,
            thumbnail_url: res.url || "https://example.com/1080.mp4",
            tags: data?.hasTags.map((tagcontaint) => ({ tag: tagcontaint.replace(/^#/, '') })) || [],
            cafes: data?.cafes.map((cafeId) => ({ cafe: cafeId.value })) || [],
            peoples: data?.tag_user.map((user) => ({ user_customer_id: user.value })) || [],
            menu_items: [{ "cafe_menu_item_id": 303 }],
        }

        try {
            const response = await axios.post(`${baseurl}/api/v1/social/content`, payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            console.log("response after eatshot post request:", response.data);
            console.log("status in add eatshot :", response.data?.status);
            if (response.status === 200) {
                onSuccess();
                setLoading(false);

            }
        } catch (e) {
            setLoading(false);

            console.log("error during add eatshot", e);
            const message = e.response?.data?.msg
            setAlert({ open: true, severity: "error", message: message })
        }
    }

    const handleDelete = () => {
        setPreviewVideo();
    }

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
                        <Box textAlign="center" mb={2}>
                            {!previewVideo ? (
                                <label htmlFor="upload-video" style={{ width: '100%', display: 'block', cursor: 'pointer' }}>
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: 200,
                                            borderRadius: "10px",
                                            backgroundColor: "#e0e0e0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mb: 2,
                                            overflow: "auto",
                                        }}
                                    >
                                        <Videocam sx={{ fontSize: 48, color: "#888" }} />
                                    </Box>
                                </label>
                            ) : (
                                <Box
                                    sx={{
                                        width: "100%",
                                        borderRadius: "10px",
                                        backgroundColor: "#e0e0e0",
                                        display: "flex",
                                        justifyContent: "center",
                                        mb: 2,
                                        overflow: "auto",
                                    }}
                                >
                                    <video
                                        src={previewVideo}
                                        width={300}
                                        controls
                                        style={{ marginBottom: 16 }}
                                    />
                                </Box>
                            )}
                            <input
                                accept="video/*"
                                id="upload-video"
                                type="file"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const url = URL.createObjectURL(file);
                                        setPreviewVideo(url);
                                        setVideoFile(file);
                                    }
                                }}
                            />
                            <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                                <Button
                                    sx={{ flex: 1 }}
                                    component="label"
                                    variant="outlined"
                                    size="small"
                                    color="primary"
                                    startIcon={<CloudArrowUp16Regular />}
                                // onClick={() => uploadVideo()}
                                >
                                    {uploading ? <CircularProgress size={20} sx={{ color: "inherit" }} /> : "Upload video"}
                                </Button>
                                <Button
                                    sx={{ flex: 1 }}
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<Delete16Regular />}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid xs={12} width={"100%"}>
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
                            </Grid>

                            <Grid xs={12} width={"100%"}>
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
                            </Grid>

                            <Grid xs={12} width={"100%"}>
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
                            </Grid>

                            <Grid xs={12} width={"100%"}>
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
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid xs={12} width={"100%"}>
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
                            </Grid>
                        </Grid>
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