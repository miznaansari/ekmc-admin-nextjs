import React from "react";
import {
    Drawer,
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    Switch,
    FormControlLabel,
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
            <Box sx={{ p: 0 }}>

                {/* HEADER */}
                <Box
                    sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        p: 1,
                        pb: 0,
                        bgcolor: "#F7F7F7",
                    }}
                >
                    <Paper sx={{ p: 1 }}>
                        <Typography variant="h5" fontWeight="600">
                            View Trigger
                        </Typography>
                        <IconButton
                            onClick={onClose}
                            sx={{ position: "absolute", right: 8, top: 8 }}
                        >
                            <Close />
                        </IconButton>
                    </Paper>
                </Box>

                {/* BODY */}
                <Paper sx={{ p: 2, m: 1 }}>

                    {/* Title */}
                    <TextField
                        label="Title"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={data.title || ""}
                        InputProps={{ readOnly: true }}
                    />

                    {/* Template */}
                    <TextField
                        label="Template"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={data.template_title || data.template_id || ""}
                        InputProps={{ readOnly: true }}
                    />

                    {/* Condition */}
                    <TextField
                        label="Condition"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={data.condition_title || data.condition_id || ""}
                        InputProps={{ readOnly: true }}
                    />

                    {/* Estimated Users */}
                    <TextField
                        label="Estimated Users"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={data.estimatedUsers ?? "-"}
                        InputProps={{ readOnly: true }}
                    />

                    {/* Status - SWITCH (READ ONLY) */}
                    <FormControlLabel
                        label={data.status === 1 ? "Active" : "Inactive"}
                        sx={{ mb: 2 }}
                        control={
                            <Switch
                                checked={data.status === 1}
                                disabled   // 🔥 read-only mode
                                color="primary"
                            />
                        }
                    />

                    {/* Internal Notes */}
                    <TextField
                        label="Internal Notes"
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                        value={data.internal_notes || ""}
                        InputProps={{ readOnly: true }}
                    />

                </Paper>
            </Box>
        </Drawer>
    );
};

export default ViewNotification;
