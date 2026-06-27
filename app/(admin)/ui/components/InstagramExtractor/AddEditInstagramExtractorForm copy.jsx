import React, { useEffect, useState } from "react";
import {
    Drawer,
    Box,
    TextField,
    Typography,
    Button,
    CircularProgress,
    Paper,
    Link,
} from "@mui/material";
import instanceV1 from "../../restaurant/authaxios";
import GlobalSnackbar from "../../utils/GlobalSnackbar";

const AddEditInstagramExtractorForm = ({ setAlert, open, onClose, data, action, setAction }) => {
    const [instagram_profile_url, setInstagramprofileurl] = useState("")
    const [caption, setCaption] = useState("");
    const [tag, setTag] = useState("");
    const [video_url, setVideoUrl] = useState("");
    const [created_at, setCreatedAt] = useState("");
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!data) {
            setInstagramprofileurl("");
            setCaption("");
            setTag("");
            setVideoUrl("");
            setCreatedAt("");
        }
    }, [data]);

    // Prefill when editing
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
    }, [data]);

    const handleSubmit = async () => {
        if (!data) {
            if (instagram_profile_url) {
             const payload = {
  instagram_profile_url: instagram_profile_url,
  phone_number: null,
  first_name: null,
  last_name: null,
  username: null,
  bio: null,
};


                const token = localStorage.getItem("authToken");
                const api = instanceV1(token);
                await api.post(`/api/admin/crawler/v1/insta/data`, payload);
                setAction(!action);
                return;
            }

        }

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

    return (
        <Drawer
disableEnforceFocus            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: "100%", sm: 400 }, p: 0, margin: 0, height: "100vh", bgcolor: "#F7F7F7" },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="h5" fontWeight="600" sx={{ mb: 2 }}>
                    {!data
                        ? "Add Instagram Profile"
                        : data?.is_processed === 1
                            ? "Edit Reel"
                            : "Reel in Queue"}
                </Typography>

                <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>

                    {/* ---------------- ADD MODE ---------------- */}
                    {!data && (
                        <>
                            <TextField
                                label="Instagram Profile URL"
                                size="small"
                                fullWidth
                                value={instagram_profile_url}
                                onChange={(e) => setInstagramprofileurl(e.target.value)}
                            />

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Add"}
                            </Button>
                        </>
                    )}

                    {/* ---------------- EDIT MODE ---------------- */}
                    {data && data.is_processed === 1 && (
                        <>
                            {video_url && (
                                <Box sx={{ mt: 1 }}>
                                    <video
                                        src={video_url}
                                        controls
                                        width="100%"
                                        height="200px"
                                        style={{ borderRadius: 4 }}
                                    />
                                </Box>
                            )}

                            <TextField
                                label="Video URL"
                                size="small"
                                fullWidth
                                value={video_url}
                                onChange={(e) => setVideoUrl(e.target.value)}
                            />

                            <TextField
                                label="Caption"
                                size="small"
                                fullWidth
                                multiline
                                rows={3}
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />

                            <TextField
                                label="Tag"
                                size="small"
                                fullWidth
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                            />

                            <TextField
                                label="Created At"
                                size="small"
                                fullWidth
                                value={created_at}
                                disabled
                            />

                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Save"}
                            </Button>
                        </>
                    )}

                    {/* ---------------- EDIT MODE — NOT PROCESSED ---------------- */}
                    {data && data.is_processed === 0 && (
                        <Typography variant="body1" color="primary">
                            This reel is currently in Queue.
                        </Typography>
                    )}
                </Paper>

            </Box>

            <GlobalSnackbar alert={alert} setAlert={setAlert} />
        </Drawer>
    );
};

export default AddEditInstagramExtractorForm;
