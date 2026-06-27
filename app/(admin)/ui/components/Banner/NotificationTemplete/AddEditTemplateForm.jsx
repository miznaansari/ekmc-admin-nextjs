import React, { useEffect, useRef, useState } from "react";
import {
    Drawer,
    Box,
    TextField,
    Typography,
    Button,
    CircularProgress,
    Paper,
    Stack,
    Avatar,
    IconButton,
    ClickAwayListener,
    MenuItem,
    Chip,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Autocomplete,
} from "@mui/material";

import instanceV1 from "../../../restaurant/authaxios";
import { CloudArrowUp16Regular, Delete16Regular, ImageGlobe20Filled } from "@fluentui/react-icons";
import { Close } from "@mui/icons-material";
import myEatsIcon from "../../../assets/myeats_icon.png";

const AddEditTemplateForm = ({ open, onClose, data, setAlert, action, setAction }) => {
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState("");
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const instance = instanceV1(token);
                const res = await instance.get("/api/banner/route/v1/banners");

                setRoutes(res.data.data || []);
            } catch (err) {
                console.error("Route fetch error", err);
            }
        };

        fetchRoutes();
    }, []);
    const formatDateTimeLocal = (date) => {
        const pad = (n) => String(n).padStart(2, "0");

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const getFutureDateTime = (days) => {
        const now = new Date();
        now.setDate(now.getDate() + days);
        return formatDateTimeLocal(now); // ✅ use local format
    };
    const token = localStorage.getItem("authToken");
    const getTTLForDays = (days) => {
        const now = new Date();
        const future = new Date();
        future.setDate(now.getDate() + days);

        return Math.floor((future - now) / 1000);
    };
    // --------------------------
    // FORM STATES
    // --------------------------
    const initialValues = {
        title: "",
        subtitle: "",
        message: "",
        image_url: "",
        launch_url: "",
        priority: "1",
        ttl: getTTLForDays(3), // 👈 default 3 days
        expireAt: getFutureDateTime(3), // ✅ ADD THIS
        additional_data: "0",        // object → null
        status: true,
        internal_notes: "",
        small_icon: "",
        large_icon: "",
        android_channel_id: "",
        ios_sound: "",
        android_sound: "",
        ios_attachments: null,        // object → null
        web_image_url: "",
        web_icon: "",
        web_url: "",
        collapse_id: "",
        send_after: "",
        delayed_option: "",
        delivery_time_of_day: "",
        included_segments: null,      // array → null
        excluded_segments: null,      // array → null
        buttons: null,                // array → null
        profile_pic_image_id: "",
    };

    const [values, setValues] = useState({
        title: "",
        subtitle: "",
        message: "",
        image_url: "",
        launch_url: "",
        priority: '1',
        ttl: getTTLForDays(3),   // default 3 days
        expireAt: getFutureDateTime(3), // ✅ ADD THIS

        additional_data: "0",        // object → null
        status: true,
        internal_notes: "",
        small_icon: "",
        large_icon: "",
        android_channel_id: "",
        ios_sound: "",
        android_sound: "",
        ios_attachments: null,        // object → null
        web_image_url: "",
        web_icon: "",
        web_url: "",
        collapse_id: "",
        send_after: "",
        delayed_option: "",
        delivery_time_of_day: "",
        included_segments: null,      // array → null
        excluded_segments: null,      // array → null
        buttons: null,                // array → null
        profile_pic_image_id: "",
    });

    const [loading, setLoading] = useState(false);
    const [previewOS, setPreviewOS] = useState("ios"); // "ios" | "android"


    // --------------------------
    // Prefill When Editing
    // --------------------------
    useEffect(() => {
        if (data) {
            setValues({
                title: data.title || "",
                subtitle: data.subtitle || "",
                message: data.message || "",
                image_url: data.image_url || "",
                launch_url: data.launch_url || "",
                priority: data.priority || "2",
                ttl: data.ttl || 0,

                additional_data: data.additional_data ?? null,   // object → null
                status: data.status ?? true,
                internal_notes: data.internal_notes || "",
                small_icon: data.small_icon || "",
                large_icon: data.large_icon || "",
                android_channel_id: data.android_channel_id || "",
                ios_sound: data.ios_sound || "",
                android_sound: data.android_sound || "",
                ios_attachments: data.ios_attachments ?? null,   // object → null
                web_image_url: data.web_image_url || "",
                web_icon: data.web_icon || "",
                web_url: data.web_url || "",
                collapse_id: data.collapse_id || "",
                send_after: data.send_after || "",
                delayed_option: data.delayed_option || "",
                delivery_time_of_day: data.delivery_time_of_day || "",

                included_segments: data.included_segments ?? null,  // array → null
                excluded_segments: data.excluded_segments ?? null,  // array → null
                buttons: data.buttons ?? null,                      // array → null

                profile_pic_image_id: data.profile_pic_image_id || "",
            });
        } else {
            setValues({
                title: "",
                subtitle: "",
                message: "",
                image_url: "",
                launch_url: "",
                priority: "2",
                ttl: getTTLForDays(3), // 👈 default 3 days,
                expireAt: getFutureDateTime(3), // ✅ ADD THIS

                additional_data: null,
                status: true,
                internal_notes: "",
                small_icon: "",
                large_icon: "",
                android_channel_id: "",
                ios_sound: "",
                android_sound: "",
                ios_attachments: null,
                web_image_url: "",
                web_icon: "",
                web_url: "",
                collapse_id: "",
                send_after: "",
                delayed_option: "",
                delivery_time_of_day: "",
                included_segments: null,
                excluded_segments: null,
                buttons: null,
                profile_pic_image_id: "",
            });
        }
    }, [data]);


    // --------------------------
    // Upload Image API (Direct Upload)
    // --------------------------
    const uploadImage = async (file) => {
        const newInstance = instanceV1(token);
        try {
            setLoading(true);

            const res = await newInstance.post(
                "/api/admin/cf/v1/upload",
                { file, uploadType: "myeats-banner" },
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setValues((prev) => ({
                ...prev,
                profile_pic_image_id: res.data.customUrl,
                image_url: res.data.customUrl,
            }));

            setAlert({
                open: true,
                message: "Image uploaded successfully",
                severity: "success",
            });
        } catch (err) {
            console.error("Upload error", err);

            setAlert({
                open: true,
                message: "Failed to upload image",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    // Direct file choose
    const handleChooseImage = (e) => {
        const file = e.target.files[0];
        if (file) uploadImage(file);
    };

    // Remove image
    const handleDelete = () => {
        setValues((prev) => ({
            ...prev,
            profile_pic_image_id: "",
            image_url: "",
        }));

        setAlert({
            open: true,
            message: "Image removed",
            severity: "info",
        });
    };

    // --------------------------
    // Submit Handler
    // --------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!values.priority) {
            setAlert({
                open: true,
                message: "Please select a priority!",
                severity: "warning",
            });
            setLoading(false);
            return;
        }

        try {
            const instance = instanceV1(token);

            const payload = {
                title: values.title,
                subtitle: values.subtitle,
                message: values.message,
                image_url: values.image_url,
                launch_url: selectedRoute ? "" : values.launch_url,
                additional_data: selectedRoute
                    ? { id: selectedRoute }
                    : null,

                priority: Number(values.priority),
                ttl: getTTLForDays(3), // 👈 default 3 days

                status: Boolean(values.status),
                internal_notes: values.internal_notes,

                // small_icon: values.small_icon,
                // large_icon: values.large_icon,
                small_icon: 'ic_launcher.png',
                large_icon: 'ic_launcher.png',
                android_channel_id: values.android_channel_id,
                ios_sound: values.ios_sound,
                android_sound: values.android_sound,

                ios_attachments: values.ios_attachments ?? null,
                web_image_url: values.web_image_url,
                web_icon: values.web_icon,
                web_url: values.web_url,
                collapse_id: values.collapse_id,

                // send_after: values.send_after,   
                delayed_option: values.delayed_option,
                delivery_time_of_day: values.delivery_time_of_day,

                included_segments: values.included_segments ?? null,
                excluded_segments: values.excluded_segments ?? null,
                buttons: values.buttons ?? null,

                profile_pic_image_id: values.profile_pic_image_id,
            };

            if (!data) {
                await instance.post("/api/admin/notification/v1/template", payload);

                setAction(!action);
                setAlert({
                    open: true,
                    message: "Template created successfully",
                    severity: "success",
                });
            } else {
                await instance.put(
                    `/api/admin/notification/v1/template/${data.id}`,
                    payload
                );

                setAction(!action);
                setAlert({
                    open: true,
                    message: "Template updated successfully",
                    severity: "success",
                });
            }
            // ✅ Reset form
            setValues(initialValues);

            onClose();
        } catch (err) {
            console.error("Save error", err);

            setAlert({
                open: true,
                message: error.response.data.msg || "Error saving template",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const inputRef = useRef(null);

    const placeholders = ["${first_name}", "${last_name}"];

    const handleChipInsert = (ph) => {
        const input = inputRef.current;

        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;

        const newText =
            values.message.substring(0, start) +
            ph +
            values.message.substring(end);

        setValues({ ...values, message: newText });

        // Move cursor after inserted placeholder
        setTimeout(() => {
            input.setSelectionRange(start + ph.length, start + ph.length);
            input.focus();
        }, 0);
    };


    const now = new Date();

    const minDateTime = formatDateTimeLocal(now);

    const maxDate = new Date();
    maxDate.setDate(now.getDate() + 28);

    const maxDateTime = formatDateTimeLocal(maxDate);

    return (
        <Drawer
            disableEnforceFocus
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: "100%", md: "650px" },
                    p: 0,
                    margin: 0,
                    height: "100vh",
                    bgcolor: "#F7F7F7",
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                {/* HEADER */}
                <Box
                    sx={{
                        p: 1,
                        bgcolor: "#F7F7F7",
                        // borderBottom: "1px solid #e0e0e0",
                        zIndex: 99
                    }}
                >
                    <Paper sx={{ p: 1, position: "relative", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h5" fontWeight="600">
                            {data ? "Edit Template" : "Add Template"}
                        </Typography>

                        <IconButton
                            onClick={onClose}
                            sx={{ p: 0.5 }}
                        >
                            <Close />
                        </IconButton>
                    </Paper>
                </Box>

                {/* MAIN CONTENT AREA */}
                <Box sx={{ display: 'flex', flex: 1, overflow: { xs: 'auto', md: 'hidden' }, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* LEFT PANEL: FORM (scrollable) */}
                    <Box sx={{
                        flex: { xs: 'none', md: 1.2 },
                        height: { xs: 'auto', md: '100%' },
                        overflowY: { xs: 'visible', md: 'auto' },
                        borderRight: { md: "1px solid #e0e0e0" },
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                            <Paper sx={{ m: 1, p: 2, flexGrow: 1, bgcolor: '#ffffff' }}>
                                {/* IMAGE UPLOAD */}
                                <Box sx={{ textAlign: "center", mb: 2 }}>
                                    <Avatar
                                        src={values.image_url}
                                        sx={{
                                            width: "100%",
                                            height: 150,
                                            borderRadius: 2,
                                            border: "1px solid #ccc",
                                        }}
                                    />

                                    <Stack direction="row" spacing={1} mt={2}>
                                        <Button
                                            component="label"
                                            variant="outlined"
                                            size="small"
                                            startIcon={<CloudArrowUp16Regular />}
                                            sx={{ flex: 1 }}
                                        >
                                            Upload Image
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/png, image/jpg, image/jpeg"
                                                onChange={(e) => {
                                                    handleChooseImage(e);
                                                    e.target.value = "";
                                                }}
                                            />
                                        </Button>

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            sx={{ flex: 1 }}
                                            startIcon={<Delete16Regular />}
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                </Box>

                                {/* INPUT FIELDS */}
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 0.5 }}
                                    label="Title"
                                    multiline
                                    rows={2}
                                    value={values.title}
                                    onChange={(e) => setValues({ ...values, title: e.target.value })}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Recommended max: 40 chars
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: values.title.length > 40 ? 'error.main' : values.title.length > 35 ? 'warning.main' : 'text.secondary',
                                            fontWeight: values.title.length > 35 ? 'bold' : 'normal'
                                        }}
                                    >
                                        {values.title.length} / 40
                                    </Typography>
                                </Box>

                                <TextField
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={2}
                                    sx={{ mb: 0.5 }}
                                    label="Subtitle (Only in IOS)"
                                    value={values.subtitle}
                                    onChange={(e) => setValues({ ...values, subtitle: e.target.value })}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 0.5 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Recommended max: 40 chars
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: values.subtitle.length > 40 ? 'error.main' : values.subtitle.length > 30 ? 'warning.main' : 'text.secondary',
                                            fontWeight: values.subtitle.length > 30 ? 'bold' : 'normal'
                                        }}
                                    >
                                        {values.subtitle.length} / 40
                                    </Typography>
                                </Box>

                                {/* MESSAGE + CHIPS */}
                                <Box sx={{ position: "relative", mb: 0.5 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        required
                                        multiline
                                        rows={2}
                                        label="Message"
                                        value={values.message}
                                        onChange={(e) => setValues({ ...values, message: e.target.value })}
                                        inputRef={inputRef}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Recommended max: 160 chars
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: values.message.length > 160 ? 'error.main' : values.message.length > 140 ? 'warning.main' : 'text.secondary',
                                            fontWeight: values.message.length > 140 ? 'bold' : 'normal'
                                        }}
                                    >
                                        {values.message.length} / 160
                                    </Typography>
                                </Box>

                                <Box sx={{ mt: 0.5, mb: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {placeholders.map((ph) => (
                                        <Chip
                                            key={ph}
                                            label={ph}
                                            variant="outlined"
                                            size="small"
                                            color="success"
                                            onClick={() => handleChipInsert(ph)}
                                        />
                                    ))}
                                </Box>

                                <Autocomplete
                                    freeSolo
                                    options={routes}
                                    getOptionLabel={(option) =>
                                        typeof option === "string" ? option : option.title
                                    }
                                    value={
                                        routes.find((r) => r.id === selectedRoute) ||
                                        values.launch_url ||
                                        null
                                    }
                                    onChange={(e, newValue) => {
                                        if (typeof newValue === "string") {
                                            setSelectedRoute("");
                                            setValues({ ...values, launch_url: newValue });
                                        } else if (newValue && newValue.id) {
                                            setSelectedRoute(newValue.id);
                                            setValues({ ...values, launch_url: "" });
                                        } else {
                                            setSelectedRoute("");
                                            setValues({ ...values, launch_url: "" });
                                        }
                                    }}
                                    onInputChange={(e, newInputValue) => {
                                        setSelectedRoute("");
                                        setValues({ ...values, launch_url: newInputValue });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Launch URL / Select Route"
                                            size="small"
                                            sx={{ mb: 2 }}
                                        />
                                    )}
                                />

                                {/* PRIORITY */}
                                <FormControl component="fieldset" sx={{ mb: 2 }} required>
                                    <FormLabel component="legend">Priority</FormLabel>
                                    <RadioGroup
                                        row
                                        value={values.priority}
                                        onChange={(e) => setValues({ ...values, priority: e.target.value })}
                                    >
                                        <FormControlLabel value="1" control={<Radio size="small" />} label="High" />
                                        <FormControlLabel value="2" control={<Radio size="small" />} label="Medium" />
                                        <FormControlLabel value="3" control={<Radio size="small" />} label="Low" />
                                    </RadioGroup>
                                </FormControl>

                                {/* ANDROID CHANNEL */}
                                <TextField
                                    select
                                    fullWidth
                                    required
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="Android Channel ID"
                                    value={values.android_channel_id}
                                    onChange={(e) =>
                                        setValues({ ...values, android_channel_id: e.target.value })
                                    }
                                >
                                    <MenuItem value="">Select Channel</MenuItem>
                                    <MenuItem value="45cf598b-f99a-4778-bec5-8376498ac792">
                                        App Updates & System
                                    </MenuItem>
                                    <MenuItem value="c3e8ceb6-83a2-478b-9bdf-206d16566b46">
                                        Account & Safety
                                    </MenuItem>
                                    <MenuItem value="e9610c14-89f6-45f3-91b2-6909b382b184">
                                        Promotions & Campaigns
                                    </MenuItem>
                                    <MenuItem value="96d0c630-ad62-412c-9251-dd217fb66db5">
                                        Social & Followers
                                    </MenuItem>
                                </TextField>

                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="Web URL"
                                    value={values.web_url}
                                    onChange={(e) => setValues({ ...values, web_url: e.target.value })}
                                />

                                <TextField
                                    fullWidth
                                    size="small"
                                    multiline
                                    rows={3}
                                    sx={{ mb: 2 }}
                                    label="Internal Notes"
                                    value={values.internal_notes}
                                    onChange={(e) => setValues({ ...values, internal_notes: e.target.value })}
                                />
                            </Paper>

                            {/* Sticky footer */}
                            <Box
                                sx={{
                                    position: 'sticky',
                                    bottom: 0,
                                    p: 1.5,
                                    bgcolor: "#F7F7F7",
                                    borderTop: "1px solid #e0e0e0",
                                    zIndex: 99,
                                    mt: 'auto'
                                }}
                            >
                                <Paper sx={{ p: 0.5, display: 'flex', gap: 1, boxShadow: 'none', bgcolor: 'transparent' }}>
                                    <Box flexGrow={1}>
                                        <Button
                                            variant="outlined"
                                            color="error"
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
                        </form>
                    </Box>

                    {/* RIGHT PANEL: LIVE PREVIEW */}
                    <Box sx={{
                        flex: { xs: 'none', md: 0.8 },
                        height: { xs: 'auto', md: '100%' },
                        overflowY: { xs: 'visible', md: 'auto' },
                        p: 3,
                        bgcolor: "#f0f0f0",
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }}>
                        {/* Control Box */}
                        <Box sx={{ width: '100%', maxWidth: 390, mb: 3, }}>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 1.5, color: '#333', textAlign: 'center', letterSpacing: 0.5 }}>
                                LIVE NOTIFICATION PREVIEW
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant={previewOS === 'ios' ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => setPreviewOS('ios')}
                                    sx={{
                                        flex: 1,
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        fontWeight: '600'
                                    }}
                                >
                                    iOS (iPhone)
                                </Button>
                                <Button
                                    variant={previewOS === 'android' ? 'contained' : 'outlined'}
                                    size="small"
                                    onClick={() => setPreviewOS('android')}
                                    sx={{
                                        flex: 1,
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        fontWeight: '600'
                                    }}
                                >
                                    Android
                                </Button>
                            </Stack>
                        </Box>

                        {/* PHONE MOCKUP */}
                        <Box sx={{
                            width: 390,
                            height: 200,
                            borderRadius: '30px 30px 0 0',
                            borderWidth: '12px 12px 0 12px',
                            borderStyle: 'solid',
                            borderColor: '#1c1c1e',
                            boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundImage: 'linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            userSelect: 'none'
                        }}>
                            {/* Camera Notch / Island */}
                            <Box sx={{
                                width: previewOS === 'ios' ? 90 : 16,
                                height: previewOS === 'ios' ? 22 : 16,
                                bgcolor: previewOS === 'ios' ? '#000000' : '#ffffff',
                                borderRadius: previewOS === 'ios' ? '11px' : '50%',
                                border: previewOS === 'android' ? '2px solid rgba(0,0,0,0.1)' : 'none',
                                position: 'absolute',
                                top: previewOS === 'ios' ? 6 : 8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 10,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                {previewOS === 'ios' && (
                                    <>
                                        <Box sx={{ width: 28, height: 3, bgcolor: '#1a1a1a', borderRadius: 1.5, mr: 0.8 }} />
                                        <Box sx={{ width: 5, height: 5, bgcolor: '#101010', borderRadius: '50%' }} />
                                    </>
                                )}
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                px: 3,
                                pt: 1.2,
                                pb: 0.5,
                                fontSize: '0.7rem',
                                color: '#000000',
                                fontWeight: '600',
                                zIndex: 9
                            }}>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    {previewOS === 'ios' ? '10:28' : '10:10'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.8, alignItems: 'center' }}>
                                    {/* Cellular Signal Bars */}
                                    <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 9.5, gap: '1.5px' }}>
                                        <Box sx={{ width: 2.2, height: 3.5, bgcolor: '#000000', borderRadius: '0.5px' }} />
                                        <Box sx={{ width: 2.2, height: 5.5, bgcolor: '#000000', borderRadius: '0.5px' }} />
                                        <Box sx={{ width: 2.2, height: 7.5, bgcolor: '#000000', borderRadius: '0.5px' }} />
                                        <Box sx={{ width: 2.2, height: 9.5, bgcolor: '#000000', borderRadius: '0.5px' }} />
                                    </Box>

                                    {/* Wifi Icon */}
                                    <svg width="12" height="9" viewBox="0 0 13 9" style={{ display: 'block' }}>
                                        <path d="M6.5 9A1.5 1.5 0 1 1 6.5 6A1.5 1.5 0 0 1 6.5 9zM1.9 4.4a6.5 6.5 0 0 1 9.2 0l-1.1 1.1a4.9 4.9 0 0 0-7 0L1.9 4.4zm2.1 2.1a3.5 3.5 0 0 1 5 0L7.9 7.6a2 2 0 0 0-2.8 0L4 6.5zm-4-4a9.2 9.2 0 0 1 13 0l-1.1 1.1a7.7 7.7 0 0 0-10.8 0L0 2.5z" fill="#000000" />
                                    </svg>

                                    {/* Battery Icon */}
                                    <Box sx={{
                                        width: 19,
                                        height: 9.5,
                                        border: '1.2px solid #000000',
                                        borderRadius: '3px',
                                        p: '1px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        position: 'relative'
                                    }}>
                                        <Box sx={{ width: '80%', height: '100%', bgcolor: '#000000', borderRadius: '1px' }} />
                                        <Box sx={{
                                            position: 'absolute',
                                            right: -2.2,
                                            width: 1.2,
                                            height: 3.5,
                                            bgcolor: '#000000',
                                            borderRadius: '0 1px 1px 0'
                                        }} />
                                    </Box>
                                </Box>
                            </Box>

                            {/* Spacer under status bar */}
                            <Box sx={{ height: 10, zIndex: 8 }} />

                            {/* Notification Banner Container */}
                            <Box sx={{ px: 1.5, flex: 1, zIndex: 8, overflowY: 'auto' }}>
                                {previewOS === 'ios' ? (
                                    /* iOS style card */
                                    (<Box sx={{
                                        borderRadius: '20px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                                        border: '1px solid rgba(0, 0, 0, 0.05)',
                                        p: 1.2,
                                        width: '100%',
                                        display: 'flex',
                                        gap: 0.8,
                                        alignItems: 'center',
                                        color: '#000000',
                                        transition: 'all 0.3s ease-in-out',
                                    }}>
                                        {/* Logo Column */}
                                        <Box
                                            component="img"
                                            src={myEatsIcon}
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: '6px',
                                                objectFit: 'cover',
                                                flexShrink: 0
                                            }}
                                        />
                                        {/* Content Column */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            {/* Title and Time */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.1 }}>
                                                <Typography sx={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700',
                                                    color: '#000000',
                                                    mr: 1,
                                                    lineHeight: 1.2,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    flex: 1,
                                                    minWidth: 0
                                                }}>
                                                    {values.title
                                                        ? (values.title.length > 40 ? values.title.slice(0, 40) + '...' : values.title)
                                                        : "Notification Title"}
                                                </Typography>
                                                <Typography sx={{
                                                    fontSize: '0.65rem',
                                                    color: 'rgba(0, 0, 0, 0.55)',
                                                    flexShrink: 0
                                                }}>
                                                    now
                                                </Typography>
                                            </Box>

                                            {/* Subtitle (if present) */}
                                            {values.subtitle && (
                                                <Typography sx={{
                                                    fontSize: '0.76rem',
                                                    fontWeight: '700',
                                                    color: '#000000',
                                                    mb: 0.1,
                                                    lineHeight: 1.2,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden'
                                                }}>
                                                    {values.subtitle}
                                                </Typography>
                                            )}

                                            {/* Message */}
                                            <Typography sx={{
                                                fontSize: '0.775rem',
                                                fontWeight: '400',
                                                color: 'rgba(0, 0, 0, 0.8)',
                                                wordBreak: 'break-word',
                                                whiteSpace: 'pre-wrap',
                                                lineHeight: 1.3
                                            }}>
                                                {values.message || "Notification Message Body"}
                                            </Typography>
                                        </Box>
                                        {/* Thumbnail (always shown if image exists) */}
                                        {values.image_url && (
                                            <Box
                                                component="img"
                                                src={values.image_url}
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    flexShrink: 0
                                                }}
                                            />
                                        )}
                                    </Box>)
                                ) : (
                                    /* Android style card */
                                    (<Box sx={{
                                        borderRadius: '20px',
                                        backgroundColor: '#ffffff',
                                        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.12)',
                                        p: 1.8,
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        color: '#1f1f1f',
                                        transition: 'all 0.3s ease-in-out',
                                    }}>
                                        {/* Header */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                                <Avatar
                                                    src={myEatsIcon}
                                                    sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: 'transparent' }}
                                                />
                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: '500', opacity: 0.8 }}>
                                                    MyEats
                                                </Typography>
                                                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'currentColor', opacity: 0.5 }} />
                                                <Typography sx={{ fontSize: '0.65rem', opacity: 0.6 }}>
                                                    now
                                                </Typography>
                                            </Box>
                                            <Typography sx={{ fontSize: '0.7rem', opacity: 0.6 }}>
                                                ▼
                                            </Typography>
                                        </Box>
                                        {/* Content */}
                                        <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'flex-start' }}>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                {values.title && (
                                                    <Typography sx={{
                                                        fontSize: '0.76rem',
                                                        fontWeight: '700',
                                                        mb: 0.2,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis'
                                                    }}>
                                                        {values.title.length > 40 ? values.title.slice(0, 40) + '...' : values.title}
                                                    </Typography>
                                                )}
                                                {values.message && (
                                                    <Typography sx={{ fontSize: '0.775rem', color: '#5f6368', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                                        {values.message}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Thumbnail (always shown if image exists) */}
                                            {values.image_url && (
                                                <Box
                                                    component="img"
                                                    src={values.image_url}
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '4px',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>)
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
};

export default AddEditTemplateForm;
