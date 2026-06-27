import React, { useEffect, useState } from "react";
import {
    Drawer,
    Box,
    TextField,
    Typography,
    Button,
    CircularProgress,
    Paper,
    IconButton,
    Grid,
    useTheme,
    useMediaQuery,
    Stack,
    Grid2,
    Autocomplete,
    Snackbar,
    Alert,
    Chip,
} from "@mui/material";
import instanceV1 from "../../restaurant/authaxios";
import GlobalSnackbar from "../../utils/GlobalSnackbar";
import { Close, Videocam, CloudUpload, Delete } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import * as tus from "tus-js-client";
import axios from "axios";

const AddEditInstagramExtractorForm = ({
    setAlert,
    open,
    onClose,
    data,
    action,
    setAction,
}) => {
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectStatus, setRejectStatus] = useState(false)
    const newData = data || {};
    // console.log('newData', newData)

    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState("");
    const [parsedData, setParsedData] = useState(null); // { profile, total, reels }
    const [fileError, setFileError] = useState("");

    const [caption, setCaption] = useState("");
    const [tag, setTag] = useState("");
    const [video_url, setVideoUrl] = useState("");
    const [created_at, setCreatedAt] = useState("");

    const [loading, setLoading] = useState(false);

    /* RESET WHEN CLOSING */
    useEffect(() => {
        if (!data) {
            setDragOver(false);
            setFileName("");
            setParsedData(null);
            setFileError("");
            setCaption("");
            setTag("");
            setVideoUrl("");
            setCreatedAt("");
            const inputEl = document.getElementById("json-file-input");
            if (inputEl) inputEl.value = "";
        }
        setRejectReason('');
        setRejectStatus(false);
    }, [data, open]);

    /* PREFILL FOR EDIT MODE */
    const extractCaptionAndHashtags = (text = "") => {
        // match hashtags
        const hashtags = text.match(/#[\w]+/g) || [];

        // remove hashtags from caption
        const cleanCaption = text
            .replace(/#[\w]+/g, "")
            .replace(/\n\s*\n/g, "\n\n") // clean extra empty lines
            .trim();

        return {
            caption: cleanCaption,
            hasTags: hashtags.map(tag => tag.replace("#", "")),
        };
    };

    useEffect(() => {
        if (data) {
            if (data.is_processed === 1) {
                setCaption(data.caption || "");
                setTag(data.tag || "");
                setVideoUrl(data.video_url || "");
                setCreatedAt(data.created_at || "");
            } else {
                setCaption("");
                setTag("");
                setVideoUrl("");
                setCreatedAt("");

                setAlert({
                    open: true,
                    message: "This reel is in Queue",
                    severity: "info",
                });
            }
        }
        if (data?.caption) {
            const { caption, hasTags } = extractCaptionAndHashtags(data.caption);

            setValue("captions", caption);
            setValue("hasTags", hasTags);
        }
    }, [data]);

    /* DRAG & DROP / FILE SELECTION HANDLERS */
    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
            e.target.value = "";
        }
    };

    const processFile = (file) => {
        if (!file) return;

        setFileName(file.name);
        setFileError("");
        setParsedData(null);

        // Check if file is JSON
        if (file.type !== "application/json" && !file.name.endsWith(".json")) {
            setFileError("Only JSON files (.json) are allowed.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);

                // Validate fields
                if (!json.profile || typeof json.profile !== "string") {
                    throw new Error("Missing or invalid 'profile' field (must be string).");
                }
                if (typeof json.total === "undefined" || typeof json.total !== "number") {
                    throw new Error("Missing or invalid 'total' field (must be number).");
                }
                if (!Array.isArray(json.reels)) {
                    throw new Error("Missing or invalid 'reels' field (must be an array of strings).");
                }

                // Check all reels are valid strings
                const allStrings = json.reels.every(r => typeof r === "string");
                if (!allStrings) {
                    throw new Error("All items in 'reels' array must be valid strings.");
                }

                setParsedData(json);
            } catch (err) {
                setFileError(err.message || "Failed to parse JSON file.");
            }
        };
        reader.onerror = () => {
            setFileError("Error reading file.");
        };
        reader.readAsText(file);
    };

    const clearFileSelection = () => {
        setParsedData(null);
        setFileName("");
        setFileError("");
        const inputEl = document.getElementById("json-file-input");
        if (inputEl) inputEl.value = "";
    };

    /* SUBMIT BULK JSON */
    const handleSubmitBulkJSON = async () => {
        if (!parsedData) return;

        setLoading(true);

        try {
            const token = localStorage.getItem("authToken");
            const api = instanceV1(token);

            await api.post(`/api/admin/crawler/v2/insta/data`, parsedData);

            setAlert({
                open: true,
                message: "Bulk reels added successfully",
                severity: "success",
            });

            setFileName("");
            setParsedData(null);
            setFileError("");
            setAction(!action);
            setTimeout(() => onClose(), 300);

        } catch (error) {
            console.error("Error submitting bulk reels", error);
            setAlert({
                open: true,
                message: error?.response?.data?.msg || "Failed to submit bulk reels",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    /* UPDATE REEL – EDIT MODE */
    const handleSubmitEdit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const api = instanceV1(token);

            const payload = {
                caption,
                tag,
                video_url,
            };

            await api.put(`/api/admin/instagram/reel/${data.id}`, payload);

            setAlert({
                open: true,
                message: "Reel updated successfully",
                severity: "success",
            });

            setAction((prev) => !prev);
            setTimeout(() => onClose(), 200);

        } catch (error) {
            console.error("Error updating reel", error);
            setAlert({
                open: true,
                message: error?.response?.data?.msg || "Failed to update reel",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };



    //=========================================================================

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
    const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
    const token = localStorage.getItem("authToken");
    const [previewVideo, setPreviewVideo] = useState(null);
    const [uploading, setUploading] = useState(false); // Track upload state
    const [searchCafequery, setSearchCafequery] = useState("");
    const [cafes, setCafes] = useState([]);
    const [taggedUsers, setTaggedusers] = useState([]);
    const [searchTagusers, setSearchTagUsers] = useState("");
    const theme = useTheme();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [finalVideoUrl, setFinalVideourl] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [loaderU, setLoaderU] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState("");

    useEffect(() => {
        console.log('videoFile', videoFile?.name)
    }, [videoFile])
    //Upload video
    // const uploadVideo = async () => {

    //     if (!videoFile) {
    //         console.log("please select a video to upload !!")
    //         setLoading(false);

    //         setAlert({ open: true, severity: "error", message: "Error: Please Select a video to Upload!!" })
    //         return;
    //     }
    //     const file = videoFile;

    //     const formData = new FormData();
    //     formData.append("file", file)
    //     console.log("file- ", file);
    //     console.log("file size-= ", file.size);
    //     const size = file.size;

    //     const base64Filename = btoa(`filename ${file.name}`);
    //     let url
    //     try {
    //         setUploading(true)
    //         const token = localStorage.getItem("authToken");
    //         const api = instanceV1(token);
    //         const response = await api.post(`${baseurl}/api/v1/social/video-upload`, formData, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //                 "Content-Type": "multipart/form-data",
    //             }
    //         })
    //         console.log("response from video upload :", response);
    //         url = response.data?.thumbnailUrl;
    //         console.log('url1', url)
    //         setThumbnailUrl(url);
    //         //return url;

    //         const responseCfsUpload = await api.post(`${baseurl}/api/v1/cfs/url`, {}, {
    //             headers: {
    //                 authorization: `Bearer ${token}`,
    //                 "Upload-Length": size.toString(),
    //                 "Upload-Metadata": base64Filename
    //             }
    //         })

    //         console.log("cfs response- ", responseCfsUpload);
    //         const uploadUrl = responseCfsUpload.data?.data?.uploadUrl
    //         console.log("upload url= ", uploadUrl)

    //         //tus upload

    //         let streamMediaId = "";
    //         const upload = new tus.Upload(file, {
    //             uploadUrl, // this is the signed URL you just got from backend
    //             metadata: {
    //                 filename: file.name,
    //                 filetype: file.type
    //             },
    //             onAfterResponse: (req, res) => {
    //                 return new Promise((resolve) => {
    //                     const id = res.getHeader("stream-media-id");
    //                     if (id) {
    //                         streamMediaId = id;
    //                         console.log("📹 Cloudflare Stream Media ID:", streamMediaId);
    //                     }
    //                     resolve();
    //                 });
    //             },
    //             onError: (error) => {
    //                 console.error("❌ Upload failed:", error);
    //             },
    //             onProgress: (bytesUploaded, bytesTotal) => {
    //                 const percent = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
    //                 console.log(`⏫ Uploading: ${percent}%`);
    //                 setAlert({
    //                     open: true,
    //                     severity: "info",       // use "info" while uploading
    //                     message: `⏫ Uploading: ${percent}%`
    //                 });

    //                 // Then, when upload completes:
    //                 if (percent === 100) {
    //                     setAlert({
    //                         open: true,
    //                         severity: "success",
    //                         message: "✅ Video Uploaded to Cloudflare!!"
    //                     });
    //                 }

    //             },
    //             onSuccess: () => {
    //                 console.log("✅ Upload complete!");
    //                 console.log("🎬 Final stream-media-id:", streamMediaId);
    //                 setAlert({ open: true, severity: "success", message: "Video Uploaded to cloudflare!!" })
    //             }
    //         });

    //         upload.start();

    //         //patch request 
    //         const videoBuffer = await file.arrayBuffer();
    //         const tokens = localStorage.getItem("authToken");
    //         const instance = instanceV1(tokens);
    //         const patchResponse = await instance.patch(uploadUrl, videoBuffer, {
    //             headers: {
    //                 "Tus-Resumable": "1.0.0",
    //                 "Upload-Offset": 0,
    //                 "Content-Type": "application/offset+octet-stream",
    //                 "Content-Length": videoBuffer.length,
    //             }
    //         });

    //         console.log("patch response- ", patchResponse)

    //         //Extract video ID / final
    //         const videoId = uploadUrl.split('/').pop().split('?')[0];
    //         console.log("video id-", videoId)
    //         const m3u8Url = `https://customer-tz4rxebvkwsslm50.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
    //         console.log("m3u8 url-", m3u8Url);

    //         setFinalVideourl(m3u8Url);
    //         console.log('url', url)
    //         return { m3u8Url, url };

    //     } catch (e) {
    //         setLoading(false);

    //         console.log("error during video upload:", e);
    //         setAlert({ open: true, severity: "error", message: "Erroe: video Upload failed !!" })

    //     } finally {
    //         setUploading(false);
    //     }
    // }

    //Tag Eateries / fetch Cafes
    const fetchCafesDropDown = async () => {
        try {
            const tokens = localStorage.getItem("authToken");
            const instance = instanceV1(tokens);
            const response = await instance.get(`${baseurl}/api/user/admin/cafe-list/get/all`,
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
            const tokens = localStorage.getItem("authToken");
            const instance = instanceV1(tokens);
            const response = await instance.get(`${baseurl}/admin/customer/get/all`,
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
        const uploadRes = await uploadVideo();
        if (!uploadRes) {
            setLoading(false);
            return;
        }

        let uploadedThumbnailUrl = "";
        if (newData.reel_thumbnail) {
            try {
                const thumbFile = await urlToFile(newData.reel_thumbnail, "thumbnail.jpg");
                uploadedThumbnailUrl = await uploadThumbnail(thumbFile);
            } catch (err) {
                console.warn("Thumbnail download/upload failed, falling back to original thumbnail:", err);
            }
        }

        const payload = {
            instagram_reels_id: newData.id,
            user_customer_id: data?.author?.value,
            cf_stream_url: uploadRes.cfStreamUrl,
            original_video_url: uploadRes.originalVideoUrl,

            captions: data.captions,
            thumbnail_url: uploadedThumbnailUrl || newData.reel_thumbnail || "https://example.com/1080.mp4",
            tags: data?.hasTags?.map((tagcontaint) => ({ tag: tagcontaint.replace(/^#/, '') })) || [],
            cafes: data?.cafes?.map((cafeId) => ({ cafe: cafeId.value })) || [],
            peoples: data?.tag_user?.map((user) => ({ user_customer_id: user.value })) || [],
            menu_items: [{ "cafe_menu_item_id": 303 }],
        };

        try {
            setLoading(true);

            const token = localStorage.getItem("authToken");
            const instance = instanceV1(token);

            const response = await instance.post(
                `${baseurl}/api/admin/crawler/v1/insta/reel`,
                payload
            );

            console.log("response after eatshot post request:", response.data);

            if (response.status === 200) {
                setAction(!action);
                const message =
                    response.data?.msg || "Eatshot added successfully";

                setAlert({
                    open: true,
                    severity: "success",
                    message,
                });
                setTimeout(() => onClose(), 300);
            }
        } catch (e) {
            console.log("error during add eatshot", e);

            const message =
                e?.response?.data?.msg ||
                e?.message ||
                "Error: Failed to add Eatshot!";

            setAlert({
                open: true,
                severity: "error",
                message,
            });
        } finally {
            setLoading(false);
        }

    }

    const handleDelete = () => {
        setPreviewVideo();
    };

    const urlToFile = async (url, filename = "video.mp4") => {
        try {
            // Append a timestamp to bypass browser CORS cache
            const cacheBusterUrl = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;
            const res = await fetch(cacheBusterUrl);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const blob = await res.blob();
            return new File([blob], filename, { type: blob.type });
        } catch (error) {
            console.error("fetch failed in urlToFile:", error);
            throw new Error(`Failed to download video from URL: ${error.message}. This is likely a CORS block, network issue, or the video does not exist on the server.`);
        }
    };

    const [uploadedURL, setUploadedURL] = useState(null);

    useEffect(() => {
        console.log('uploadedURL', uploadedURL);
    }, [uploadedURL]);

    const uploadThumbnail = async (file) => {
        if (!file) return "";

        try {
            const token = localStorage.getItem("authToken");
            const formData = new FormData();
            formData.append("file", file);
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

    const uploadVideo = async () => {
        try {
            setUploading(true);

            const sourceVideoUrl = video_url || newData.video_url;
            if (!sourceVideoUrl) {
                setAlert({
                    open: true,
                    severity: "error",
                    message: "No video URL found to download",
                });
                return null;
            }

            const file = await urlToFile(sourceVideoUrl, "video.mp4");
            const size = file.size;
            const limit = 200 * 1024 * 1024; // 200MB limit
            if (size > limit) {
                setAlert({
                    open: true,
                    severity: "error",
                    message: "Video file size exceeds the 200MB limit.",
                });
                return null;
            }

            const metadataParts = [];
            metadataParts.push(`filename ${btoa(unescape(encodeURIComponent("video.mp4")))}`);
            if (file.type) {
                metadataParts.push(`filetype ${btoa(unescape(encodeURIComponent(file.type)))}`);
            }
            const uploadMetadata = metadataParts.join(",");

            const token = localStorage.getItem("authToken");

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

            const uploadData = presignedRes.data.data;
            const signedUrl = uploadData.signed_url;
            const publicUrl = uploadData.public_url;
            const tusUrl = uploadData.cfs_presigned_url;
            const contentType = uploadData.content_type;

            await axios.put(signedUrl, file, {
                headers: {
                    "Content-Type": contentType,
                },
            });

            console.log("✅ Uploaded to R2");

            let streamMediaId = "";

            const upload = new tus.Upload(file, {
                uploadUrl: tusUrl,
                metadata: {
                    filename: "video.mp4",
                    filetype: file.type,
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
                        message: `Uploading video ${percent}%`,
                    });
                },

                onSuccess: () => {
                    setAlert({
                        open: true,
                        severity: "success",
                        message: "Cloudflare video upload complete",
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

            const cfStreamUrl = `https://videodelivery.net/${streamMediaId}/manifest/video.m3u8`;

            return {
                originalVideoUrl: publicUrl,
                cfStreamUrl,
            };
        } catch (err) {
            console.error(err);
            setAlert({
                open: true,
                severity: "error",
                message: err.message || "Video upload failed",
            });
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleReasonSubmit = () => {
        const token = localStorage.getItem("authToken");
        const api = instanceV1(token);
        api.put(`/api/admin/crawler/v1/insta/status/${data.id}`, {
            is_rejected: 1,
            reject_reason: rejectReason
        })
            .then((response) => {
                setAlert({
                    open: true,
                    message: "Reel rejected successfully",
                    severity: "success",
                });
                setRejectStatus(false);
                setAction(!action);
                setTimeout(() => onClose(), 300);
            }
            )
            .catch((error) => {
                console.error("Error rejecting reel", error);
                setAlert({
                    open: true,
                    message: error?.response?.data?.msg || "Failed to reject reel",
                    severity: "error",
                });
            }
            )

    }
    const rejectOptions = [
        "Reel not related to restaurant",
        "Reel not related to our requirement",
        "Low video quality",
        "Copyright issue",
        "Other reason",
    ];
    return (
        <Drawer
            disableEnforceFocus anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: data ? 800 : 500 },
                    p: 0,
                    margin: 0,
                    height: "100vh",
                    overflow: "auto",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                },
            }}
        >
            {!data ? (
                <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", bgcolor: "#F7F7F7" }}>
                    <Box
                        sx={{
                            position: 'sticky',
                            top: 0,
                            bgcolor: "#F7F7F7",
                            zIndex: 9999,
                            p: 1
                        }}
                    >
                        <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h5" fontWeight="600" >
                                Upload Bulk Reels
                            </Typography>

                            <IconButton
                                onClick={onClose}
                                sx={{ p: 0.5 }}
                            >
                                <Close />
                            </IconButton>
                        </Paper>
                    </Box>

                    <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
                        <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2, minHeight: 'calc(100% - 16px)' }}>
                            <Box
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById("json-file-input").click()}
                                sx={{
                                    border: "2px dashed",
                                    borderColor: dragOver ? "primary.main" : "divider",
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    bgcolor: dragOver ? "action.hover" : "background.paper",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        bgcolor: "action.hover",
                                    },
                                }}
                            >
                                <input
                                    type="file"
                                    id="json-file-input"
                                    accept=".json"
                                    style={{ display: "none" }}
                                    onChange={handleFileSelect}
                                />
                                <CloudUpload sx={{ fontSize: 48, color: dragOver ? "primary.main" : "text.secondary", mb: 1 }} />
                                <Typography variant="body1" fontWeight="500">
                                    Drag & Drop your JSON file here
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    or click to browse from your computer (JSON only)
                                </Typography>
                            </Box>

                            {fileError && (
                                <Alert severity="error" onClose={() => setFileError("")}>
                                    <Typography variant="body2" fontWeight="600">Error reading file: {fileName}</Typography>
                                    <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>{fileError}</Typography>
                                </Alert>
                            )}

                            {parsedData && (
                                <Box sx={{ mt: 1 }}>
                                    <Paper sx={{ p: 2, border: "1px solid", borderColor: "success.light", bgcolor: "#f8fdf8" }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="600" color="success.main">
                                                File Loaded: {fileName}
                                            </Typography>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={clearFileSelection}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Stack>

                                        <Grid container spacing={2} sx={{ mb: 2 }}>
                                            <Grid size={6}>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>Profile Name</Typography>
                                                <Typography variant="body1" fontWeight="600" color="primary.main">
                                                    @{parsedData.profile}
                                                </Typography>
                                            </Grid>
                                            <Grid size={6}>
                                                <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>Total Reels</Typography>
                                                <Typography variant="body1" fontWeight="600">
                                                    {parsedData.total} ({parsedData.reels.length} URLs)
                                                </Typography>
                                            </Grid>
                                        </Grid>

                                        <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 1 }}>
                                            Reels URLs List:
                                        </Typography>
                                        <Box
                                            sx={{
                                                maxHeight: 200,
                                                overflowY: "auto",
                                                bgcolor: "background.paper",
                                                borderRadius: 1,
                                                border: "1px solid",
                                                borderColor: "divider",
                                                p: 1
                                            }}
                                        >
                                            {parsedData.reels.map((url, idx) => (
                                                <Typography
                                                    key={idx}
                                                    variant="caption"
                                                    component="div"
                                                    sx={{
                                                        py: 0.5,
                                                        borderBottom: idx === parsedData.reels.length - 1 ? "none" : "1px solid",
                                                        borderColor: "divider",
                                                        wordBreak: "break-all",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        display: "block"
                                                    }}
                                                    title={url}
                                                >
                                                    {idx + 1}. {url}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Paper>
                                </Box>
                            )}
                        </Paper>
                    </Box>

                    {parsedData && (
                        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                            <Stack direction="row" spacing={2}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    fullWidth
                                    onClick={clearFileSelection}
                                    disabled={loading}
                                >
                                    Clear
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    onClick={handleSubmitBulkJSON}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Save"}
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Box>
            ) : (
                <Box sx={{ p: 1 }}>
                    <Box
                        sx={{
                            position: 'sticky',
                            top: 0,
                            bgcolor: "#F7F7F7",
                            zIndex: 9999
                        }}
                    >
                        <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h5" fontWeight="600" >
                                {data?.is_processed === 1 ? "Edit Reel" : "Reel in Queue"}
                            </Typography>

                            <IconButton
                                onClick={onClose}
                                sx={{ p: 0.5 }}
                            >
                                <Close />
                            </IconButton>
                        </Paper>
                    </Box>

                    <Paper sx={{ p: 0, display: "flex", flexDirection: "column", gap: 0 }}>
                        {data.is_processed === 0 && (
                            <Typography variant="body1" color="primary">
                                This reel is currently in Queue.
                            </Typography>
                        )}
                    </Paper>
                </Box>
            )}
            {/* <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    p: 1,
                    bgcolor: "#F7F7F7",
                    zIndex: 9999
                }}
            >

                <Paper sx={{ p: 0.5, position: "relative", display: 'flex', gap: 1 }}>
                    <Box flexGrow={1}>
                        <Button
                            variant="outlined"
                            color="error"
                            halfWidth
                            size="small"
                            fullWidth
                            onClick={onClose}
                            disabled={loading}
                        >
                            Close
                        </Button>
                    </Box>
                    <Box flexGrow={1}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="small"
                            type="submit"
                            disabled={loading}
                            onClick={handleSubmitProfiles}
                        >
                            {loading ? (
                                <CircularProgress size={22} sx={{ color: "#fff" }} />
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </Box>
                </Paper>

            </Box> */}
            <GlobalSnackbar alert={alert} setAlert={setAlert} />
            {/* \\=================================================== */}
            {data && (
                <Grid container spacing={0}

                    sx={{
                        bgcolor: "#F7F7F7",

                    }}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2, m: 1,
                                position: "relative",
                                overflow: "hidden",
                                borderRadius: 1,
                                height: '85vh',
                            }}
                        >
                            {/* Loader */}
                            {!videoLoaded && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "rgba(0,0,0,0.05)",
                                        zIndex: 2,
                                    }}
                                >
                                    <CircularProgress />
                                </Box>
                            )}

                            {/* Video */}
                            <video
                                src={video_url}
                                controls
                                width="100%"
                                height="100%"
                                style={{
                                    objectFit: "cover",
                                    opacity: videoLoaded ? 1 : 0,
                                    transition: "opacity 0.3s ease",
                                }}
                                onLoadedData={() => setVideoLoaded(true)}
                            />
                        </Paper>
                    </Grid>

                    <Grid
                        gap={2}
                        size={{
                            xs: 12,
                            md: 6
                        }}>

                        <Box
                            sx={{
                                height: isMobileScreen ? "80vh" : '91vh',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Header - Fixed */}
                            <Box
                                sx={{
                                    // p: 1,
                                    // flexShrink: 0, // Don't allow header to shrink
                                    zIndex: 999
                                }}
                            >
                                {/* <Paper sx={{ padding: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h5">Add Eatshot</Typography>
                                    <IconButton >
                                        <Close />
                                    </IconButton>
                                </Stack>
                            </Paper> */}
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
                                {!rejectStatus ? (
                                    <>
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

                                                <Grid2 container spacing={0}>
                                                    <Grid2 xs={12} width={"100%"}>
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
                                                                            sx={{ mb: 1 }}
                                                                        />
                                                                    )}
                                                                />
                                                            )}
                                                        />
                                                    </Grid2>

                                                    <Grid2 xs={12} width={"100%"}>
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
                                                                            sx={{ mb: 1 }}
                                                                        />
                                                                    )}
                                                                />
                                                            )}
                                                        />
                                                    </Grid2>

                                                    <Grid2 xs={12} width={"100%"}>
                                                        {/* <Controller
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
                                                                        sx={{ mb: 1 }}
                                                                    />
                                                                )}
                                                            />
                                                        )}
                                                    /> */}
                                                    </Grid2>

                                                    <Grid2 xs={12} width={"100%"}>
                                                        <Controller
                                                            control={control}
                                                            name="captions"
                                                            render={({ field }) => (
                                                                <TextField
                                                                    {...field}
                                                                    label="Caption"
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    multiline
                                                                    rows={6}
                                                                    size="small"
                                                                    margin="dense"
                                                                />
                                                            )}
                                                        />
                                                    </Grid2>

                                                    <Grid2 xs={12} width={"100%"}>
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
                                                </Grid2>
                                            </Box>

                                            {/* Footer Buttons - Fixed at bottom */}
                                            <Box sx={{
                                                p: 2,
                                                borderTop: '1px solid #e0e0e0',
                                                flexShrink: 0 // Don't allow footer to shrink
                                            }}>
                                                {data?.is_approved === 1 ? (
                                                    <Typography variant="h6" color="green" textAlign={'center'}>
                                                        This reel is approved.
                                                    </Typography>
                                                ) : (<>


                                                    {data?.is_rejected === 1 ? (
                                                        <>
                                                            <Typography variant="h6" color="green" textAlign={'center'}>
                                                                This reel is rejected.
                                                            </Typography>
                                                        </>) :
                                                        (<>
                                                            <Stack direction="row" spacing={1}>
                                                                <Button
                                                                    variant="outlined"
                                                                    color='error'
                                                                    sx={{ flex: 1 }}
                                                                    // onClick={onCancel}
                                                                    onClick={() => {
                                                                        setRejectStatus(true)
                                                                    }}
                                                                >
                                                                    Reject
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
                                                        </>)}

                                                </>)}

                                            </Box>
                                        </Paper>
                                    </>) : (<>
                                        <Paper sx={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            m: 1, p: 1,
                                            overflow: 'hidden'
                                        }}>
                                            {/* Scrollable content area */}
                                            <Box sx={{
                                                flex: 1,

                                            }}>

                                                <Grid container spacing={0} m={1} >
                                                    {/* Textarea */}
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={6}
                                                        size="small"
                                                        label="Reject Reason"
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                    />

                                                    {/* Chips */}
                                                    <Grid2 xs={12} mt={2}>
                                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                            {rejectOptions.map((reason) => (
                                                                <Chip
                                                                    key={reason}
                                                                    label={reason}
                                                                    clickable
                                                                    onClick={() => {
                                                                        setRejectReason((prev) =>
                                                                            prev
                                                                                ? `${prev}\n• ${reason}`
                                                                                : `• ${reason}`
                                                                        );
                                                                    }}
                                                                />
                                                            ))}
                                                        </Stack>
                                                    </Grid2>
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
                                                        // onClick={onCancel}
                                                        onClick={handleReasonSubmit}
                                                    >
                                                        Reject
                                                    </Button>

                                                </Stack>
                                            </Box>
                                        </Paper>
                                    </>)}
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
                    </Grid>
                </Grid>
            )}
        </Drawer>
    );
};

export default AddEditInstagramExtractorForm;
