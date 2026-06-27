import React, { useEffect, useMemo, useState } from "react";
import {
    Drawer,
    Box,
    Paper,
    Typography,
    IconButton,
    TextField,
    Switch,
    FormControlLabel,
    CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import instanceV1 from "../../../restaurant/authaxios";

const ViewNotification = ({ open, onClose, data }) => {
    const [triggerData, setTriggerData] = useState(data || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
console.log('data in view', data)   
    useEffect(() => {
        setTriggerData(data || null);
    }, [data]);

    useEffect(() => {
        if (!open || !data?.id) return;

        let isMounted = true;

        const fetchTriggerById = async () => {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("authToken");
                const api = instanceV1(token);
console.log('fetching trigger details for id', data.id)
                const res = await api.get(
                    `/api/admin/notification/campaign/v1/campaigns?page=1&limit=1&trigger_id=${data.id}`
                );

                const payload = res?.data?.data;
                const fetchedItem = Array.isArray(payload) ? payload[0] : payload;

                if (isMounted && fetchedItem) {
                    setTriggerData((prev) => ({ ...(prev || {}), ...fetchedItem }));
                }
            } catch (err) {
                if (isMounted) {
                    setError("Failed to load trigger details");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchTriggerById();

        return () => {
            isMounted = false;
        };
    }, [open, data?.id]);

    if (!data) return null;

    const viewData = useMemo(() => triggerData || data, [triggerData, data]);

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
                            View Campaign
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
                    {loading && (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                    )}

                    {/* Title */}
                    <TextField
                        label="Title"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={viewData?.title || ""}
                        InputProps={{ readOnly: true }}
                    />

                    {/* Template */}
                    <TextField
                        label="Template"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={viewData?.template_title || viewData?.template_id || ""}
                        InputProps={{ readOnly: true }}
                    />

                    {/* Condition */}
                    <TextField
                        label="Condition"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={viewData?.condition_title || viewData?.condition_id || ""}
                        InputProps={{ readOnly: true }}
                    />

                    {/* Estimated Users */}
                    <TextField
                        label="Estimated Users"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={viewData?.estimated_users ?? "-"}
                        InputProps={{ readOnly: true }}
                    />

                    {/* Status - SWITCH (READ ONLY) */}
                    <FormControlLabel
                        label={viewData?.status === 1 ? "Active" : "Inactive"}
                        sx={{ mb: 2 }}
                        control={
                            <Switch
                                checked={viewData?.status === 1}
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
                        value={viewData?.internal_notes || ""}
                        InputProps={{ readOnly: true }}
                    />

                </Paper>
            </Box>
        </Drawer>
    );
};

export default ViewNotification;
