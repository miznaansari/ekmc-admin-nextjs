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
} from "@mui/material";
import { Switch, FormControlLabel } from "@mui/material";

import instanceV1 from "../../restaurant/authaxios";
import { Close } from "@mui/icons-material";

const AddEditTeamForm = ({ setAlert, open, onClose, data, action, setAction, alert }) => {
    const [title, setTitle] = useState("");
    useEffect
    const [template_id, setTemplateId] = useState("");
    const [condition_id, setConditionId] = useState("");
    const [status, setStatus] = useState(1);

    const [internal_notes, setNotes] = useState("");
    const [estimatedUsers, setEstimatedUsers] = useState(null);
    const [loading, setLoading] = useState(false);

    // Condition list
    const [conditionList, setConditionList] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Template list
    const [templateList, setTemplateList] = useState([]);
    const [tempPage, setTempPage] = useState(1);
    const [hasMoreTemplate, setHasMoreTemplate] = useState(true);

    // ----------------------------
    // Prefill when editing
    // ----------------------------
    useEffect(() => {
        if (data) {
            setTitle(data.title || "");
            setTemplateId(data.template_id || "");
            setConditionId(data.condition_id || "");
            setStatus(data.status === 1 ? 1 : 0);
            setNotes(data.internal_notes || "");
            setEstimatedUsers(data.estimatedUsers || null);
        } else {
            setTitle("");
            setTemplateId("");
            setConditionId("");
            setStatus(1);
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

            let payload = {
                title,
                template_id,
                condition_id,
                status,
                internal_notes,
            };

            if (!data) {
                await instance.post("/api/admin/notification/v1/trigger", payload);

                setAlert({
                    open: true,
                    message: "Trigger created successfully",
                    severity: "success",
                });

            } else {
                await instance.put(`/api/admin/notification/v1/trigger/${data.id}`, payload);

                setAlert({
                    open: true,
                    message: "Trigger updated successfully",
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
                setNotes("");
                setEstimatedUsers(null);
                onClose();
            }, 200);
        } catch (error) {
            console.error("Error saving form", error);

            setAlert({
                open: true,
                message: "Failed to save trigger",
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
            <Box sx={{ p: 0 }}>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 1, p: 1, pb: 0, bgcolor: "#F7F7F7" }}>
                    <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: "relative" }}>
                        <Typography variant="h5" fontWeight="600">
                            {data ? "Edit Trigger" : "Add Trigger"}
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
                        sx={{ mb: 1 }}
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

                    {condition_id && (
                        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                            Estimated Users: <b>{estimatedUsers ?? "-"}</b>
                        </Typography>
                    )}

                    <FormControlLabel
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
                </Paper>

            </Box>
        </Drawer>
    );
};

export default AddEditTeamForm;
