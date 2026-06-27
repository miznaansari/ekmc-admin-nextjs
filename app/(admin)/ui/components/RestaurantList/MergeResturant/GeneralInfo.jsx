import {
    Alert,
    Avatar,
    Button,
    Collapse,
    IconButton,
    InputAdornment,
    Paper,
    Snackbar,
    Stack,
    Typography,
    Box,
    Grid,
    TextField,
    Checkbox,
    CircularProgress,
    Tooltip
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Nonvegdsvg } from "../../../assets/icon/NonvegSvg";
import { Vegdsvg } from "../../../assets/icon/VwgSvg";
import { CafeContext, useCafe } from "../../../context/cafeContext";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CloudArrowUp24Regular } from "@fluentui/react-icons";
import Demo from "../../ImageCroper/Demo";
const GeneralInfo = ({ cafeId, transferTargetCafeId = null, onSave = null }) => {
    const { control, handleSubmit, reset, setValue, getValues, formState: { isDirty } } = useForm({
        defaultValues: {
            cafe_name: "",
            cafe_email: "",
            cafe_mobile_number: "",
            cafe_slogan: "",
            description: "",
            is_featured: false,
            is_most_visited: false,
            is_new_opening: false,
            is_veg: false,
            is_non_veg: false,
            status: false,
            logo_image_id: "",
            is_published: false,
            show_res_menu: false,
            allow_order: false,
            allow_login: false,
            allow_qr_edit: false,
            allow_profile_edit: false,
            allow_menu_edit: false,
            is_user_location_required: false,
            is_limelight: false,
            is_hot_today: false,
            is_daily_report: false,
            city_id: null,
            is_test_cafe: false,

        }
    })
    const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
    const { cafeIdContext } = useCafe();
    const activeCafeId = cafeId || cafeIdContext;
    // console.log("cafe id context in general info-", cafeIdContext)
    const [alert, setAlert] = useState({ open: false, severity: 'info', message: '' });
    const [imagePreview, setImagePreview] = useState(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const authToken = localStorage.getItem("authToken")
    const [isFormModified, setIsFormModified] = useState(false);
    const originalFormData = useRef(null);
    const [originalImagePreview, setOriginalImagePreview] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // For crop dialog
    const [openCropDialog, setOpenCropDialog] = useState(false); // Crop dialog state
    const [aspectRatio] = useState(4 / 4);
    const handleCropClose = () => {
        setOpenCropDialog(false);
        setSelectedImage(null);
    };


    // console.log("authtoken in general info= ", authToken)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    //check something in form has changed or not
    useEffect(() => {
        const imageChanged = imagePreview !== originalImagePreview;
        setIsFormModified(isDirty || imageChanged);
    }, [isDirty, imagePreview, originalImagePreview]);

    //fetch cafe generalinfo by id-
    const fetchGeneralInfo = async () => {
        try {
            const response = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${activeCafeId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "*/*",
                },
            }

            )
            const [data] = response.data.data;

            // console.log("response in general info- ", data);

            // Use reset to populate the form
            const formData = {
                cafe_name: data.cafe_name || "",
                cafe_email: data.cafe_email || "",
                cafe_mobile_number: data.cafe_mobile_number || "",
                cafe_slogan: data.cafe_slogan || "",
                description: data.cafe_about || "",
                is_featured: data.is_featured || false,
                is_most_visited: data.is_most_visited || false,
                is_new_opening: data.is_new_opening || false,
                is_veg: data.is_veg || false,
                is_non_veg: data.is_non_veg || false,
                status: data.status || false,
                logo_image_id: data.logo_image_id || "",
                is_published: data.is_published || false,
                show_res_menu: data.show_res_menu || false,
                allow_order: data.allow_order || false,
                allow_login: data.allow_login || false,
                allow_qr_edit: data.allow_qr_edit || false,
                allow_profile_edit: data.allow_profile_edit || false,
                allow_menu_edit: data.allow_menu_edit || false,
                is_user_location_required: data.is_user_location_required || false,
                is_limelight: data.is_limelight || false,
                is_hot_today: data.is_hot_today || false,
                is_daily_report: data.is_daily_report || false,
                city_id: data.city_id,
                is_test_cafe: data.is_test_cafe || false,

            }
            reset(formData)
            originalFormData.current = { ...formData }
            setIsFormModified(false)
            console.log("limelight- ", data.is_limelight)
            console.log("image url outside if =", data?.cafe_logo_cf_original_image_url)
            if (data.cafe_logo_cf_original_image_url
            ) {
                console.log("image url =", data.cafe_logo_cf_original_image_url)
                setImagePreview(data.cafe_logo_cf_original_image_url
                ); // if you want to preview image
            }

        } catch (e) {
            console.log("error during fetch cafe details- ", e)
        }
    }
    useEffect(() => {
        if (activeCafeId) {
            fetchGeneralInfo();
        }
    }, [activeCafeId])

    useEffect(() => {
        const handleGeneralInfoRefresh = (event) => {
            const affectedCafeIds = event.detail?.cafeIds || [];

            if (affectedCafeIds.includes(activeCafeId)) {
                fetchGeneralInfo();
            }
        };

        window.addEventListener("cafe-general-updated", handleGeneralInfoRefresh);
        return () => window.removeEventListener("cafe-general-updated", handleGeneralInfoRefresh);
    }, [activeCafeId]);

    //EDIT GENERAL INFO
    const hadleEditGeneralinfo = async (formData) => {
        const updatedData = {
            ...formData,
            logo_image_id: imagePreview || "",
            //is_limelight:formData.is_limelight ? true: false
            //is_limelight:1
            city_id: formData.city_id || 1
        }
        try {
            const response = await axios.post(`${baseUrl}/api/user/admin/restaurant-edit-general-information/${cafeId}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                }
            })

            if (response.status === 200) {
                setAlert({ open: true, severity: "success", message: "Restaurant updated Successfully!" })
                originalFormData.current = { ...formData }
                setOriginalImagePreview(imagePreview);
                setIsFormModified(false);
                onSave?.();
                fetchGeneralInfo()

            }
            console.log("response after on submit general edit info=", response);
            if (response.data?.response?.status === 400) {
                console.log("error message-", response.data?.response?.msg)
            }
        } catch (e) {
            console.log("error during submit edit general info -", e)
            console.log("error mesage - ", e.response.data.message)
            setAlert({ open: true, severity: "error", message: `Error: ${e.response.data.msg}` })
        }
    }

    //LOGO UPLOAD
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("file", file)
        formData.append("uploadType", "cafe_logo")
        console.log("file is:", file)
        setImageUploading(true)
        try {
            const response = await axios.post(`${baseUrl}/api/admin/cf/v1/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "multipart/form-data"
                }
            })
            if (response.status === 200) {
                setAlert({ open: true, severity: "success", message: "Uploaded successsfully" })
            }
            console.log("response in upload image- ", response);
            const imageUrl = response.data?.customUrl
            setImagePreview(imageUrl)
        } catch (e) {
            console.log("error during image upload- ", e)
        } finally {
            setImageUploading(false)
        }
    }
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setOpenCropDialog(true);
        }
    }
    const handleRemoveImage = () => {
        setImagePreview()
    }

    const handleCopyLogoToTarget = async () => {
        if (!transferTargetCafeId) {
            setAlert({ open: true, severity: "info", message: "No target cafe selected" });
            return;
        }

        if (!imagePreview) {
            setAlert({ open: true, severity: "warning", message: "No logo available to copy" });
            return;
        }

        try {
            const targetInfoResponse = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${transferTargetCafeId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "*/*",
                },
            });

            const targetData = targetInfoResponse?.data?.data?.[0] || {};

            const updatedData = {
                cafe_name: targetData.cafe_name || "",
                cafe_email: targetData.cafe_email || "",
                cafe_mobile_number: targetData.cafe_mobile_number || "",
                cafe_slogan: targetData.cafe_slogan || "",
                description: targetData.cafe_about || "",
                is_featured: targetData.is_featured || false,
                is_most_visited: targetData.is_most_visited || false,
                is_new_opening: targetData.is_new_opening || false,
                is_veg: targetData.is_veg || false,
                is_non_veg: targetData.is_non_veg || false,
                status: targetData.status || false,
                logo_image_id: imagePreview,
                is_published: targetData.is_published || false,
                show_res_menu: targetData.show_res_menu || false,
                allow_order: targetData.allow_order || false,
                allow_login: targetData.allow_login || false,
                allow_qr_edit: targetData.allow_qr_edit || false,
                allow_profile_edit: targetData.allow_profile_edit || false,
                allow_menu_edit: targetData.allow_menu_edit || false,
                is_user_location_required: targetData.is_user_location_required || false,
                is_limelight: targetData.is_limelight || false,
                is_hot_today: targetData.is_hot_today || false,
                is_daily_report: targetData.is_daily_report || false,
                city_id: targetData.city_id || 1,
                is_test_cafe: targetData.is_test_cafe || false,
            };

            await axios.post(`${baseUrl}/api/user/admin/restaurant-edit-general-information/${transferTargetCafeId}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                }
            });

            window.dispatchEvent(
                new CustomEvent("cafe-general-updated", {
                    detail: { cafeIds: [activeCafeId, transferTargetCafeId] },
                })
            );

            setAlert({ open: true, severity: "success", message: `Logo copied to cafe ${transferTargetCafeId}` });
        } catch (e) {
            console.log("error during logo copy - ", e)
            setAlert({ open: true, severity: "error", message: "Failed to copy logo" });
        }
    };

    const handleCopyFieldToTarget = async (fieldKey, fieldLabel) => {
        if (!transferTargetCafeId) {
            setAlert({ open: true, severity: "info", message: "No target cafe selected" });
            return;
        }

        try {
            const currentValues = getValues();

            const targetInfoResponse = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${transferTargetCafeId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    Accept: "*/*",
                },
            });

            const targetData = targetInfoResponse?.data?.data?.[0] || {};

            const updatedData = {
                cafe_name: targetData.cafe_name || "",
                cafe_email: targetData.cafe_email || "",
                cafe_mobile_number: targetData.cafe_mobile_number || "",
                cafe_slogan: targetData.cafe_slogan || "",
                description: targetData.cafe_about || "",
                is_featured: targetData.is_featured || false,
                is_most_visited: targetData.is_most_visited || false,
                is_new_opening: targetData.is_new_opening || false,
                is_veg: targetData.is_veg || false,
                is_non_veg: targetData.is_non_veg || false,
                status: targetData.status || false,
                logo_image_id: targetData.logo_image_id || "",
                is_published: targetData.is_published || false,
                show_res_menu: targetData.show_res_menu || false,
                allow_order: targetData.allow_order || false,
                allow_login: targetData.allow_login || false,
                allow_qr_edit: targetData.allow_qr_edit || false,
                allow_profile_edit: targetData.allow_profile_edit || false,
                allow_menu_edit: targetData.allow_menu_edit || false,
                is_user_location_required: targetData.is_user_location_required || false,
                is_limelight: targetData.is_limelight || false,
                is_hot_today: targetData.is_hot_today || false,
                is_daily_report: targetData.is_daily_report || false,
                city_id: targetData.city_id || 1,
                is_test_cafe: targetData.is_test_cafe || false,
            };

            updatedData[fieldKey] = currentValues[fieldKey] || "";

            await axios.post(`${baseUrl}/api/user/admin/restaurant-edit-general-information/${transferTargetCafeId}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                }
            });

            window.dispatchEvent(
                new CustomEvent("cafe-general-updated", {
                    detail: { cafeIds: [activeCafeId, transferTargetCafeId] },
                })
            );

            setAlert({ open: true, severity: "success", message: `${fieldLabel} copied to cafe ${transferTargetCafeId}` });
        } catch (e) {
            console.log("error during field copy - ", e)
            setAlert({ open: true, severity: "error", message: `Failed to copy ${fieldLabel}` });
        }
    };
    return (
        <>
            <Paper sx={{ p: 0 }}>
                <Typography variant="h5">General Info</Typography>
                <Collapse in={alert.open}>
                    <Snackbar
                        open={alert.open}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        sx={{ mt: 2 }}
                        autoHideDuration={200}
                    >
                        <Alert severity={alert.severity} sx={{ width: "100%" }} onClose={() => setAlert({ ...alert, open: false })}>
                            {alert.message}
                        </Alert>
                    </Snackbar>
                </Collapse>

                <Stack direction="row" spacing={2} alignItems="center" mt={2}>
                    <Avatar
                        variant="rounded"
                        sx={{ width: 80, height: 80, position: 'relative' }}
                        src={imageUploading ? undefined : imagePreview || ""}
                    >
                        {!imagePreview && !imageUploading && "SA"}
                        {imageUploading && (
                            <CircularProgress
                                size={24}
                                sx={{
                                    color: "white",
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    marginTop: "-12px",
                                    marginLeft: "-12px",
                                }}
                            />
                        )}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" mb={1}>Logo Upload</Typography>
                        <Stack direction="row" spacing={1} mb={1}>
                            <Button
                                size="small"
                                color='primary'
                                variant="contained"
                                component="label"
                                startIcon={<CloudArrowUp24Regular />}
                            >
                                Upload
                                <input
                                    type="file"
                                    hidden
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleFileChange}
                                    disabled={!isOnline}
                                />
                            </Button>
                            <Button variant="outlined" size="small" color="error" disabled={!imagePreview}
                                onClick={handleRemoveImage}
                            >
                                Remove
                            </Button>
                            {transferTargetCafeId && (
                                <Tooltip title={`Copy logo to ${transferTargetCafeId}`} arrow>
                                    <span>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={handleCopyLogoToTarget}
                                            disabled={!imagePreview}
                                        >
                                            <ContentCopyIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">Allowed file types: png, jpg, jpeg.</Typography>
                        <input type="file" accept="image/png,image/jpg,image/jpeg" style={{ display: "none" }}
                            // ref={fileInputRef} 
                            // onChange={handleFileChange} 
                            disabled={!isOnline}
                        />
                    </Box>
                </Stack>

                <Grid container spacing={2} mt={1}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12
                        }}>
                        <Controller
                            name="cafe_name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    label="Restaurant Name"
                                    variant="outlined"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!isOnline}
                                    InputProps={{
                                        endAdornment: transferTargetCafeId ? (
                                            <InputAdornment position="end">
                                                <Tooltip title={`Copy to ${transferTargetCafeId}`} arrow>
                                                    <IconButton edge="end" size="small" onClick={() => handleCopyFieldToTarget("cafe_name", "Cafe Name")}>
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ) : undefined,
                                        sx: {
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: '4px',
                                            },
                                        }
                                    }}

                                />
                            )}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12
                        }}>
                        <Controller
                            name="cafe_slogan"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    label="Slogan"
                                    variant="outlined"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!isOnline}
                                    InputProps={{
                                        endAdornment: transferTargetCafeId ? (
                                            <InputAdornment position="end">
                                                <Tooltip title={`Copy to ${transferTargetCafeId}`} arrow>
                                                    <IconButton edge="end" size="small" onClick={() => handleCopyFieldToTarget("cafe_slogan", "Slogan")}>
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ) : undefined,
                                        sx: {
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: '4px',
                                            },
                                        }
                                    }}

                                />
                            )}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12
                        }}>
                        <Controller
                            name="cafe_email"
                            control={control}
                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    label="Email"
                                    variant="outlined"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!isOnline}

                                    InputProps={{
                                        endAdornment: transferTargetCafeId ? (
                                            <InputAdornment position="end">
                                                <Tooltip title={`Copy to ${transferTargetCafeId}`} arrow>
                                                    <IconButton edge="end" size="small" onClick={() => handleCopyFieldToTarget("cafe_email", "Email")}>
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ) : undefined,
                                        sx: {
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: '4px',
                                            },
                                        }
                                    }}

                                />
                            )}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 12
                        }}>
                        {/* <Controller
                    name="cafe_mobile_number"
                    control={control}
                    render={({ field }) => (
                    <TextField
                        {...field}
                        size="small"
                        label="Phone Number"
                        variant="outlined"
                        fullWidth
                        type="number"
                        InputLabelProps={{ shrink: true }}
                        disabled={!isOnline}
                        InputProps={{
                            sx: {
                                '& .MuiOutlinedInput-notchedOutline': {
                                 borderRadius: '4px',
                                },
                              }
                        }}

                    />
                    )}
                /> */}
                        <Controller
                            name="cafe_mobile_number"
                            control={control}

                            render={({ field, fieldState: { error } }) => (
                                <TextField
                                    {...field}
                                    type="text"
                                    label="Phone Number"
                                    size="small"
                                    variant="outlined"
                                    fullWidth
                                    error={!!error}
                                    helperText={error?.message}
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!isOnline}
                                    inputProps={{
                                        inputMode: 'numeric',
                                        //maxLength: 10,
                                    }}
                                    onChange={(e) => {
                                        const digitsOnly = e.target.value.replace(/\D/g, ""); // 🧹 remove non-digits
                                        field.onChange(digitsOnly);
                                    }}
                                    InputProps={{
                                        endAdornment: transferTargetCafeId ? (
                                            <InputAdornment position="end">
                                                <Tooltip title={`Copy to ${transferTargetCafeId}`} arrow>
                                                    <IconButton edge="end" size="small" onClick={() => handleCopyFieldToTarget("cafe_mobile_number", "Phone Number")}>
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ) : undefined,
                                        sx: {
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: '4px',
                                            },
                                        },
                                    }}
                                />
                            )}
                        />


                    </Grid>
                    <Grid size={12}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    size="small"
                                    multiline
                                    rows={4}
                                    label="Restaurant Description"
                                    variant="outlined"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    disabled={!isOnline}
                                    InputProps={{
                                        endAdornment: transferTargetCafeId ? (
                                            <InputAdornment position="end">
                                                <Tooltip title={`Copy to ${transferTargetCafeId}`} arrow>
                                                    <IconButton edge="end" size="small" onClick={() => handleCopyFieldToTarget("description", "Description")}>
                                                        <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ) : undefined,
                                        sx: {
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderRadius: '4px',
                                            },
                                        }
                                    }}

                                />
                            )}
                        />
                    </Grid>

                </Grid>
                {/* Feature Tags */}
                <Typography variant="body1" mt={2}>Feature Tags</Typography>
                <Grid container spacing={1} alignItems="center">
                    <Grid display="flex" alignItems="center" gap={1}>
                        <Controller
                            name="is_featured"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    {...field}
                                    checked={Boolean(field.value)}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    disabled={!isOnline}
                                    sx={{
                                        color: 'secondary.main',
                                        '&.Mui-checked': {
                                            color: 'secondary.main',
                                        },
                                    }}
                                />
                            )}
                        />
                        <Typography>Featured</Typography>
                    </Grid>

                    <Grid display="flex" alignItems="center" gap={1}>
                        <Controller
                            name="is_most_visited"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    {...field}
                                    checked={Boolean(field.value)}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    disabled={!isOnline}
                                    sx={{
                                        color: 'secondary.main',
                                        '&.Mui-checked': {
                                            color: 'secondary.main',
                                        },
                                    }}
                                />
                            )}
                        />
                        <Typography>Most-Visited</Typography>
                    </Grid>

                    <Grid display="flex" alignItems="center" gap={1}>
                        <Controller
                            name="is_new_opening"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    {...field}
                                    checked={Boolean(field.value)}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    disabled={!isOnline}
                                    sx={{
                                        color: 'secondary.main',
                                        '&.Mui-checked': {
                                            color: 'secondary.main',
                                        },
                                    }}
                                />
                            )}
                        />
                        <Typography>New Opening</Typography>
                    </Grid>
                </Grid>


                {/* Food types */}
                <Typography variant="body1" mt={2}>Food Type</Typography>
                <Grid container alignItems="center">
                    <Grid container spacing={1} alignItems="center" gap={1}>
                        <Grid display="flex" alignItems="center" gap={1}>
                            {/* <Checkbox 
                            //checked={data.is_non_veg === 1} 
                            sx={{
                            color: 'secondary.main',
                            '&.Mui-checked': {
                                color: 'secondary.main',
                            },
                        }} 
                        //onChange={handleCheckboxChange("is_non_veg")} 
                        disabled={!isOnline} 
                    /> */}
                            <Controller
                                name="is_non_veg"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Nonvegdsvg />
                            <Typography>Non-Veg</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="is_veg"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Vegdsvg />
                            <Typography>Veg</Typography>
                        </Grid>
                    </Grid>
                </Grid>
                {/* Menu Options */}
                <Typography variant="body1" mt={2}>Menu Options</Typography>
                <Grid container alignItems="center">
                    <Grid container spacing={1} alignItems="center" gap={1}>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="allow_order"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Order</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="allow_qr_edit"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Qr Edit</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="allow_login"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Login</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="allow_menu_edit"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Menu Edit</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="allow_profile_edit"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Edit Profile</Typography>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Status */}
                <Typography variant="body1" mt={2}>Status</Typography>

                <Grid container alignItems="center">
                    <Grid container spacing={1} alignItems="center" gap={1}>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="is_user_location_required"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>User Location Required</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Status</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="is_published"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Published</Typography>
                        </Grid>



                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="is_test_cafe"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Test Cafe</Typography>
                        </Grid>



                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="is_limelight"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Limelight</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="is_hot_today"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Hot Today</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="is_featured"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Featured</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Controller
                                name="is_daily_report"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={Boolean(field.value)}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        disabled={!isOnline}
                                        sx={{
                                            color: 'secondary.main',
                                            '&.Mui-checked': {
                                                color: 'secondary.main',
                                            },
                                        }}
                                    />
                                )}
                            />
                            <Typography>Daily Report</Typography>
                        </Grid>
                    </Grid>
                </Grid>

                <Box sx={{ display: "flex", mt: 2 }}>
                    <Button variant="contained"
                        onClick={handleSubmit(hadleEditGeneralinfo)}

                        disabled={!isFormModified || !isOnline}
                    >
                        Save
                    </Button>
                </Box>
            </Paper>
            {/* Crop Dialog */}
            <Demo
                selectedImage={selectedImage}
                open={openCropDialog}
                onClose={handleCropClose}
                uploadImage={uploadImage}
                aspect={aspectRatio} // Square aspect ratio, adjust as needed
                setSelectedImage={setSelectedImage}
                setOpenCropDialog={setOpenCropDialog}
            />
        </>
    );
}
export default GeneralInfo;