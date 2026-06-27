import React, { useEffect, useState } from "react";
import {
    Drawer,
    Box,
    TextField,
    Typography,
    Button,
    MenuItem,
    CircularProgress,
    Paper,
    IconButton,
    Checkbox,
    Tabs,
    Tab,
    Avatar
} from "@mui/material";
import myEatsIcon from "../../../assets/myeats_icon.png";
import { Switch, FormControlLabel } from "@mui/material";

import instanceV1 from "../../../restaurant/authaxios";
import { Close } from "@mui/icons-material";

const AddEdiTriggerForm = ({ setAlert, open, onClose, data, action, setAction, alert }) => {
    const [title, setTitle] = useState("");
    const [template_id, setTemplateId] = useState("");
    const [condition_id, setConditionId] = useState("");
    const [status, setStatus] = useState(1);
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [start_time, setStartTime] = useState("");
    const [internal_notes, setNotes] = useState("");
    const [estimatedUsers, setEstimatedUsers] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewTab, setPreviewTab] = useState(0);

    // Condition list
    const [conditionList, setConditionList] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Template list
    const [templateList, setTemplateList] = useState([]);
    const [tempPage, setTempPage] = useState(1);
    const [hasMoreTemplate, setHasMoreTemplate] = useState(true);

    // Convert UTC string to IST and format for datetime-local input
    const formatStartTimeForInput = (value) => {
        if (!value) return "";
        // Parse as UTC
        const utcDate = new Date(value.replace(" ", "T"));
        if (isNaN(utcDate.getTime())) return "";
        // Convert to IST (UTC+5:30)
        const istOffsetMs = 5.5 * 60 * 60 * 1000;
        const istDate = new Date(utcDate.getTime() + istOffsetMs);
        // Format as yyyy-MM-ddTHH:mm for datetime-local input
        const pad = (n) => String(n).padStart(2, "0");
        return `${istDate.getFullYear()}-${pad(istDate.getMonth() + 1)}-${pad(istDate.getDate())}T${pad(istDate.getHours())}:${pad(istDate.getMinutes())}`;
    };

    const formatStartTimeForPayload = (value) => {
        if (!value) return "";

        const date = new Date(value.replace(" ", "T"));

        if (Number.isNaN(date.getTime())) {
            const normalizedValue = value.replace("T", " ");
            return normalizedValue.length === 16 ? `${normalizedValue}:00` : normalizedValue;
        }

        const pad = (number) => String(number).padStart(2, "0");
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
    };

    // ----------------------------
    // Prefill when editing
    // ----------------------------
    useEffect(() => {
        if (data) {
            setTitle(data.title || "");
            setTemplateId(data.template_id || "");
            setConditionId(data.condition_id || "");
            setStatus(data.status === 1 ? 1 : 0);
            setScheduleEnabled(Boolean(data.start_time));
            setStartTime(formatStartTimeForInput(data.start_time || ""));
            setNotes(data.internal_notes || "");
            setEstimatedUsers(data.estimatedUsers || null);
        } else {
            setTitle("");
            setTemplateId("");
            setConditionId("");
            setStatus(1);
            setScheduleEnabled(false);
            setStartTime("");
            setNotes("");
            setEstimatedUsers(null);
        }
    }, [data]);

    // ----------------------------
    // Fetch Condition List
    // ----------------------------
    const fetchConditionList = async (pageNumber = 1) => {
        try {
            const token = localStorage.getItem("authToken");
            const instance = instanceV1(token);

            const res = await instance.get(
                `/api/banner/condition/v1/banners?status=1&page=${pageNumber}&limit=10`
            );

            if (res.data?.data) {
                if (pageNumber === 1) {
                    setConditionList(res.data.data);
                } else {
                    setConditionList((prev) => [...prev, ...res.data.data]);
                }

                if (pageNumber >= res.data.pagination.totalPages) {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error("Error fetching conditions", error);
        }
    };

    useEffect(() => {
        fetchConditionList(1);
    }, []);

    const handleConditionScroll = (event) => {
        const list = event.target;
        if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10 && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchConditionList(nextPage);
        }
    };

    // ----------------------------
    // Fetch Template List
    // ----------------------------
    const fetchTemplateList = async (pageNumber = 1) => {
        try {
            const token = localStorage.getItem("authToken");
            const instance = instanceV1(token);

            const res = await instance.get(
                `/api/admin/notification/v1/templates?page=${pageNumber}&limit=10`
            );

            if (res.data?.data) {
                const items = res.data.data;

                if (pageNumber === 1) {
                    setTemplateList(items);
                } else {
                    setTemplateList((prev) => [...prev, ...items]);
                }

                if (items.length < 10 || pageNumber >= res.data.pagination.totalPages) {
                    setHasMoreTemplate(false);
                }
            }
        } catch (error) {
            console.error("Error fetching templates", error);
        }
    };

    useEffect(() => {
        fetchTemplateList(1);
    }, []);

    const handleTemplateScroll = (event) => {
        const list = event.target;
        if (list.scrollTop + list.clientHeight >= list.scrollHeight - 10 && hasMoreTemplate) {
            const nextPage = tempPage + 1;
            setTempPage(nextPage);
            fetchTemplateList(nextPage);
        }
    };

    // ----------------------------
    // Fetch estimated users
    // ----------------------------
    const fetchEstimatedUsers = async (condition) => {
        try {
            const instance = instanceV1();
            // const res = await instance.post(".endpoint....", { condition_id: condition });
            setEstimatedUsers(res.data.estimated_users ?? 0);
        } catch (error) {
            console.error("Error fetching estimated users", error);
        }
    };

    // ----------------------------
    // Submit Form (Create / Update)
    // ----------------------------
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("authToken");
            const instance = instanceV1(token);
            const userId = JSON.parse(localStorage.getItem("user"))?.id || 1;

            let payload = {
                title,
                template_id: template_id,
                condition_id,
                status,
                internal_notes,
                last_modified_by: userId,
                campaign_id: data?.id
            };

            if (scheduleEnabled) {
                payload.start_time = formatStartTimeForPayload(start_time);
            }

            if (!data) {
                await instance.post("/api/admin/notification/campaign/v1/campaign", payload);

                setAlert({
                    open: true,
                    message: "Campaign created successfully",
                    severity: "success",
                });

            } else {
                await instance.put(`/api/admin/notification/campaign/v1/campaign`, payload);

                setAlert({
                    open: true,
                    message: "Campaign updated successfully",
                    severity: "success",
                });

            }

            setAction((prev) => !prev);

            // ⭐ delay drawer close to let alert show
            setTimeout(() => {
                setTitle("");
                setTemplateId("");
                setConditionId("");
                setStatus(1);
                setScheduleEnabled(false);
                setStartTime("");
                setNotes("");
                setEstimatedUsers(null);
                onClose();
            }, 200);
        } catch (error) {
            console.error("Error saving form", error);

            setAlert({
                open: true,
                message: error.response.data.msg || "Failed to save trigger",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const selectedTemplate = templateList.find((t) => t.id === template_id);

    return (
        <Drawer
            disableEnforceFocus anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 400 }, p: 0, margin: 0, height: "100vh", bgcolor: "#F7F7F7"
                    , borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                },
            }}
        >
            <Box sx={{ p: 0 }}>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 1, p: 1, pb: 0, bgcolor: "#F7F7F7" }}>
                    <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: "relative" }}>
                        <Typography variant="h5" fontWeight="600">
                            {data ? "Edit Campaign" : "Add Campaign"}
                        </Typography>
                        <IconButton
                            onClick={onClose}
                            sx={{ p: 0.5 }}

                        >
                            <Close />
                        </IconButton>
                    </Paper>
                </Box>

                <Paper sx={{ p: 1, m: 1 }}>
                    <TextField
                        label="Title"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <TextField
                        select
                        label="Template ID"
                        size="small"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={template_id}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: { maxHeight: 300 },
                                    onScroll: handleTemplateScroll,
                                },
                            },
                        }}
                        onChange={(e) => setTemplateId(e.target.value)}
                    >
                        {templateList.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.title}
                            </MenuItem>
                        ))}

                        {hasMoreTemplate && (
                            <MenuItem disabled>
                                <CircularProgress size={22} />
                            </MenuItem>
                        )}
                    </TextField>

                    <TextField
                        select
                        label="Condition ID"
                        size="small"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={condition_id}
                        SelectProps={{
                            MenuProps: {
                                PaperProps: {
                                    sx: { maxHeight: 300 },
                                    onScroll: handleConditionScroll,
                                },
                            },
                        }}
                        onChange={(e) => {
                            setConditionId(e.target.value);
                            fetchEstimatedUsers(e.target.value);
                        }}
                    >
                        {conditionList.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.title}
                            </MenuItem>
                        ))}

                        {hasMore && (
                            <MenuItem disabled>
                                <CircularProgress size={22} />
                            </MenuItem>
                        )}
                    </TextField>

                    {/* <TextField
                        label="Start Time"
                        type="datetime-local"
                        size="small"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={start_time}
                        onChange={(e) => setStartTime(e.target.value)}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    /> */}


                    <FormControlLabel
                        sx={{ mb: 0.5, ml: 0, width: "100%" }}
                        control={
                            <Checkbox
                                checked={scheduleEnabled}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setScheduleEnabled(checked);
                                    if (!checked) {
                                        setStartTime("");
                                    }
                                }}
                            />
                        }
                        label="Campaign Start at"
                    />

                    {scheduleEnabled && (
                        <TextField
                            label="Campaign Start At"
                            type="datetime-local"
                            size="small"
                            fullWidth
                            sx={{ mb: 1 }}
                            value={start_time}
                            onChange={(e) => setStartTime(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    )}
                    <FormControlLabel
                        sx={{ minWidth: "100%", mb: 1, ml: 0, }}
                        control={
                            <Switch
                                checked={status === 1}
                                onChange={(e) => setStatus(e.target.checked ? 1 : 0)}
                            />
                        }
                        label={status === 1 ? "Active" : "Inactive"}
                    />

                    <TextField
                        label="Internal Notes"
                        size="small"
                        fullWidth
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                        value={internal_notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />

                    {/* Preview Section */}
                    {selectedTemplate && (
                        <Box sx={{ mt: 1, mb: 10 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}>
                                Notification Preview
                            </Typography>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                                <Tabs value={previewTab} onChange={(e, v) => setPreviewTab(v)} aria-label="preview tabs" size="small">
                                    <Tab label="iOS" sx={{ minWidth: "50%", textTransform: "none" }} />
                                    <Tab label="Android" sx={{ minWidth: "50%", textTransform: "none" }} />
                                </Tabs>
                            </Box>

                            <Box sx={{
                                bgcolor: "#e2e8f0",
                                p: 2,
                                borderRadius: 2,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "flex-start",
                                minHeight: 140,
                                position: "relative",
                                overflow: "hidden"                             }}>
                                {/* iOS Preview */}
                                {previewTab === 0 && (
                                    <Paper elevation={3} sx={{
                                        width: "100%",
                                        maxWidth: 320,
                                        borderRadius: "20px",
                                        p: 1.2,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.8,
                                        bgcolor: "rgba(255, 255, 255, 0.85)",
                                        backdropFilter: "blur(10px)",
                                    }}>
                                        <Avatar variant="rounded" src={myEatsIcon} sx={{ width: 28, height: 28, borderRadius: "6px" }} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.1, alignItems: "baseline" }}>
                                                <Typography sx={{ 
                                                    fontWeight: 700, 
                                                    fontSize: "0.72rem", 
                                                    lineHeight: 1.2, 
                                                    color: "#000",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    flex: 1,
                                                    minWidth: 0,
                                                    mr: 1
                                                }}>
                                                    {selectedTemplate.title 
                                                        ? (selectedTemplate.title.length > 40 ? selectedTemplate.title.slice(0, 40) + '...' : selectedTemplate.title) 
                                                        : ""}
                                                </Typography>
                                                <Typography sx={{ color: "rgba(0, 0, 0, 0.55)", fontSize: "0.65rem", flexShrink: 0 }}>
                                                    now
                                                </Typography>
                                            </Box>
                                            {selectedTemplate.subtitle && (
                                                <Typography sx={{ 
                                                    fontWeight: 700, 
                                                    fontSize: "0.72rem", 
                                                    lineHeight: 1.2, 
                                                    color: "#000",
                                                    mb: 0.1,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}>
                                                    {selectedTemplate.subtitle}
                                                </Typography>
                                            )}
                                            <Typography variant="body2" sx={{ fontSize: "0.775rem", color: "rgba(0, 0, 0, 0.8)", lineHeight: 1.3, wordBreak: "break-word" }}>
                                                {selectedTemplate.message}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                )}

                                {/* Android Preview */}
                                {previewTab === 1 && (
                                    <Paper elevation={1} sx={{
                                        width: "100%",
                                        maxWidth: 320,
                                        borderRadius: "16px",
                                        p: 1.5,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.5,
                                        bgcolor: "#fff"
                                    }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                            <Avatar sx={{ width: 16, height: 16, bgcolor: "#000", fontSize: "10px" }} src={myEatsIcon} />
                                            <Typography variant="caption" sx={{ color: "text.secondary", flex: 1, fontSize: "0.7rem" }}>
                                                MyEats • now
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.7rem" }}>
                                                ⌄
                                            </Typography>
                                        </Box>
                                        <Box>
                                            {selectedTemplate.title && (
                                                <Typography sx={{ 
                                                    fontWeight: 700, 
                                                    fontSize: "0.76rem", 
                                                    lineHeight: 1.2, 
                                                    mb: 0.25,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis"
                                                }}>
                                                    {selectedTemplate.title.length > 40 ? selectedTemplate.title.slice(0, 40) + '...' : selectedTemplate.title}
                                                </Typography>
                                            )}
                                            <Typography variant="body2" sx={{ fontSize: "0.775rem", color: "text.secondary", lineHeight: 1.3, wordBreak: "break-word" }}>
                                                {selectedTemplate.message}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                )}
                            </Box>
                        </Box>
                    )}
                    {/* 
                    <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={22} sx={{ color: "#fff" }} />
                        ) : (
                            "Save"
                        )}
                    </Button> */}
                </Paper>

            </Box>
            {/* <Paper sx={{ position: "absolute", bottom: 0, width: "100%", bgcolor: "white", display: 'flex', gap: 1, p: 1 }}>
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
                        size="small"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={22} sx={{ color: "#fff" }} />
                        ) : (
                            "Save"
                        )}
                    </Button>
                </Box>
            </Paper> */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    width: { xs: "100%", sm: 400 },
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
                            size="large"
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
                            size="large"

                            fullWidth
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={22} sx={{ color: "#fff" }} />
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </Box>
                </Paper>

            </Box>
        </Drawer>
    );
};

export default AddEdiTriggerForm;
