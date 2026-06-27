import React from "react";
import {
    Drawer,
    Box,
    Paper,
    Typography,
    IconButton,
    Avatar,
    TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const ViewNotification = ({ open, onClose, data }) => {
    if (!data) return null;

    return (
        <Drawer
disableEnforceFocus            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 400 },
                    p: 0,
                    margin: 0,
                    height: "100vh",
                    bgcolor: "#F7F7F7",
                },
            }}
        >
            <Box>

                {/* ---------- HEADER ---------- */}
                <Box sx={{ position: "sticky", top: 0, zIndex: 1, p: 1, pb: 0, bgcolor: "#F7F7F7" }}>
                    <Paper sx={{ p: 1, position: "relative" }}>
                        <Typography variant="h5" fontWeight="600">
                            View Template
                        </Typography>

                        <IconButton
                            onClick={onClose}
                            sx={{ position: "absolute", right: 8, top: 8 }}
                        >
                            <Close />
                        </IconButton>
                    </Paper>
                </Box>

                {/* ---------- BODY ---------- */}
                <Paper sx={{ m: 1, p: 2 }}>

                    {/* IMAGE */}
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                        <Avatar
                            src={data.image_url}
                            sx={{
                                width: "100%",
                                height: 150,
                                borderRadius: 2,
                                border: "1px solid #ccc",
                            }}
                        />
                    </Box>

                    {/* ----- TEXT FIELDS (READ ONLY) ----- */}

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Title" value={data.title || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Message" value={data.message || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Subtitle" value={data.subtitle || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Image URL" value={data.image_url || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Launch URL" value={data.launch_url || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Priority" value={data.priority || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="TTL (seconds)" value={data.ttl || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Small Icon" value={data.small_icon || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Large Icon" value={data.large_icon || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Android Channel ID" value={data.android_channel_id || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Android Sound" value={data.android_sound || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="iOS Sound" value={data.ios_sound || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Web Image URL" value={data.web_image_url || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Web Icon" value={data.web_icon || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Web URL" value={data.web_url || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Collapse ID" value={data.collapse_id || ""} InputProps={{ readOnly: true }} />

                    <TextField
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        label="Send After"
                        value={data.send_after || ""}
                        InputProps={{ readOnly: true }}
                    />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Delayed Option" value={data.delayed_option || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Delivery Time of Day" value={data.delivery_time_of_day || ""} InputProps={{ readOnly: true }} />

                    <TextField fullWidth size="small" sx={{ mb: 2 }} label="Additional Data" value={data.additional_data || ""} InputProps={{ readOnly: true }} />

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        size="small"
                        sx={{ mb: 2 }}
                        label="Internal Notes"
                        value={data.internal_notes || ""}
                        InputProps={{ readOnly: true }}
                    />

                </Paper>
            </Box>
        </Drawer>
    );
};

export default ViewNotification;
