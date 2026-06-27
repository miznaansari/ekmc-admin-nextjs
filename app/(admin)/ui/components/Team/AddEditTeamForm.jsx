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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Checkbox,
    Grid,
} from "@mui/material";

import instanceV1 from "../../restaurant/authaxios";
import { CloudArrowUp16Regular, Delete16Regular } from "@fluentui/react-icons";
import { Close } from "@mui/icons-material";



const AddEditTeamForm = ({ open, onClose, data, setAlert, action, setAction }) => {
    const token = localStorage.getItem("authToken");
    const [permissionSearch, setPermissionSearch] = useState("");
    const [roleMapping, setRoleMapping] = useState({});

    useEffect(() => {
        fetchRoles();
    }, []);
  const fetchRoles = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const instance = instanceV1(token);
    const res = await instance.get("/api/admin/role/v1/roles");

    if (res?.data?.status) {
      const mapping = {};

      res.data.get_data.forEach((role) => {
        mapping[Number(role.id)] = role.role_name;
      });

      setRoleMapping(mapping);
    }
  } catch (err) {
    console.error("Error fetching role mapping:", err);
  }
};

    const initialValues = {
        user_role_id: "",
        mobile_number: "",
        email: "",
        status: "1",
        first_name: "",
        last_name: "",
        uap_azure_original_image_url: "",
        password: '',
    };


    const [values, setValues] = useState(initialValues);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data) {
            setValues({
                user_role_id: data.user_role_id || "",
                mobile_number: data.mobile_number || "",
                email: data.email || "",
                status: data.status ?? "1",
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                uap_azure_original_image_url: data.uap_azure_original_image_url || "",
                password: ''
            });
        } else {
            setValues(initialValues);
        }
    }, [data]);

    const uploadImage = async (file) => {
        const newInstance = instanceV1(token);
        try {
            setLoading(true);

            const res = await newInstance.post(
                "/api/admin/cf/v1/upload",
                { file, uploadType: "user_admin_profile" },
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setValues((prev) => ({
                ...prev,
                uap_azure_original_image_url: res.data.customUrl,
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

    const handleChooseImage = (e) => {
        const file = e.target.files[0];
        if (file) uploadImage(file);
    };

    const handleDelete = () => {
        setValues((prev) => ({
            ...prev,
            uap_azure_original_image_url: "",
        }));

        setAlert({
            open: true,
            message: "Image removed",
            severity: "info",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!values.first_name || !values.mobile_number) {
            setAlert({
                open: true,
                message: "First name and mobile number required!",
                severity: "warning",
            });
            setLoading(false);
            return;
        }

        try {
            const instance = instanceV1(token);

            const payload = {
                user_role_id: values.user_role_id,
                mobile_number: values.mobile_number,
                email: values.email,
                status: values.status,
                first_name: values.first_name,
                last_name: values.last_name,
                password: values.password,
                uap_azure_original_image_url: values.uap_azure_original_image_url,
            };

            if (!data) {
                await instance.post("/api/admin/team/v1/member", payload);
                setAlert({ open: true, message: "Member added", severity: "success" });
            } else {
                console.log('data', data)
                await instance.put(`/api/admin/team/v1/member/${data.user_admin_id}`, payload);
                setAlert({ open: true, message: "Member updated", severity: "success" });
            }

            setAction(!action);
            setValues(initialValues);
            onClose();
        } catch (err) {
            console.error("Save error", err);
            setAlert({
                open: true,
                message: err.response.data.msg || "Error saving member",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };



    //======================================================================Permssion
    const [permissionData, setpermissionData] = useState([])
    useEffect(() => {
        console.log('permissionData', permissionData)
    }, [permissionData])
    const handlePermission = async () => {
        const instance = instanceV1(token);
        const res = await instance.get(`/api/admin/permission/v1/permission?limit=1000`);
        console.log('res', res)
        setpermissionData(res.data.data);
    }

    const handlePermissionMember = async () => {
        const instance = instanceV1(token);

        // 1️⃣ fetch all permissions
        const allPermissionRes = await instance.get(`/api/admin/permission/v1/permission?limit=1000`);
        const allPermissions = allPermissionRes.data.data; // id, permission_name, status

        // 2️⃣ fetch member permissions
        const res = await instance.get(`api/admin/team/v1/member/permissions/${data.user_admin_id}?limit=1000`);
        const memberPermissions = res.data.data; // permission_id, status

        // 3️⃣ merge permissions
        const mergedPermissions = allPermissions.map((p) => {
            // find if user has this permission
            const userPerm = memberPermissions.find((mp) => mp.permission_id === p.id);
            return {
                permission_id: p.id,
                permission_name: p.permission_name,
                status: userPerm ? userPerm.status : 0, // use user status or default 0
            };
        });

        // 4️⃣ set permission data to render
        setpermissionData(mergedPermissions);

        // 5️⃣ initialize checkbox values
        const initialValues = {};
        mergedPermissions.forEach((p) => {
            initialValues[`permission_${p.permission_id}`] = p.status === 1;
        });
        setValues(initialValues);
    };

    useEffect(() => {
        handlePermission()
        handlePermissionMember()

    }, [data])

    const handlePermissionSubmit = async () => {
        try {
            setLoading(true);
            const instance = instanceV1(token);
            console.log('permissionData', permissionData)
            // build permissions array from values state
            const permissionsPayload = permissionData.map((permission) => {
                const key = `permission_${permission.id || permission.permission_id}`;

                return {
                    permission_id: permission.permission_id,
                    permission_name: permission.permission_name,
                    status: values[key] ? 1 : 0, // or true/false as backend expects
                };
            });


            const payload = {
                user_admin_id: data.user_admin_id,
                permissions: permissionsPayload,
            };
            console.log('payload', payload)

            await instance.post(
                "/api/admin/team/v1/member/permission",
                payload
            );

            setAlert({
                open: true,
                message: "Permissions updated successfully",
                severity: "success",
            });

        } catch (err) {
            console.error("Permission save error", err);
            setAlert({
                open: true,
                message: err.response?.data?.msg || "Failed to update permissions",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handlePermissionMember()

    }, [])

    return (
        <Drawer
disableEnforceFocus            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: "100%", sm: 400 }, p: 0, margin: 0, height: "100vh", bgcolor: "#F7F7F7" },
            }}
        >
            <Grid container>

                <Grid items sx={{
                    height: '100vh',
                    overflowY: 'auto',
                }} size={12}>
                    <Box sx={{ position: "relative" }}>
                        {/* HEADER */}
                        <Box sx={{ position: "sticky", top: 0, p: 1, bgcolor: "#F7F7F7", zIndex: 9999 }}>
                            <Paper sx={{ p: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h5">
                                    {data ? "Edit Member" : "Add Member"}
                                </Typography>

                                <IconButton onClick={onClose}>
                                    <Close />
                                </IconButton>
                            </Paper>
                        </Box>

                        {/* FORM */}
                        <form onSubmit={handleSubmit}>
                            <Paper sx={{ m: 1, p: 2 }}>
                                {/* IMAGE UPLOAD */}
                                <Box sx={{ textAlign: "center", mb: 2 }}>
                                    <Avatar
                                        src={values.uap_azure_original_image_url}
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
                                            fullWidth
                                        >
                                            Upload Image
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/png,image/jpg,image/jpeg"
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
                                            startIcon={<Delete16Regular />}
                                            onClick={handleDelete}
                                            fullWidth
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                </Box>

                                {/* FIRST NAME */}
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="First Name"
                                    value={values.first_name}
                                    onChange={(e) => setValues({ ...values, first_name: e.target.value })}
                                />

                                {/* LAST NAME */}
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="Last Name"
                                    value={values.last_name}
                                    onChange={(e) => setValues({ ...values, last_name: e.target.value })}
                                />

                                {/* MOBILE */}
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="Mobile Number"
                                    value={values.mobile_number}
                                    onChange={(e) => setValues({ ...values, mobile_number: e.target.value })}
                                />

                                {/* EMAIL */}
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="Email"
                                    value={values.email}
                                    onChange={(e) => setValues({ ...values, email: e.target.value })}
                                />

                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="Password"
                                    value={values.password}
                                    onChange={(e) => setValues({ ...values, password: e.target.value })}
                                />

                                {/* USER ROLE DROPDOWN */}
                                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                                    <InputLabel>User Role</InputLabel>
                                    <Select
                                        label="User Role"
                                        value={values.user_role_id}
                                        onChange={(e) =>
                                            setValues({ ...values, user_role_id: e.target.value })
                                        }
                                    >
                                        {Object.entries(roleMapping).map(([id, label]) => (
                                            <MenuItem key={id} value={id}>
                                                {label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* STATUS SWITCH */}
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={values.status === 1}
                                            onChange={(e) =>
                                                setValues({
                                                    ...values,
                                                    status: e.target.checked ? 1 : 0,
                                                })
                                            }
                                        />
                                    }
                                    label={values.status === 1 ? "Active" : "Inactive"}
                                />
                            </Paper>

                            {/* FOOTER BUTTONS */}
                            <Box sx={{ position: "sticky", bottom: 0, p: 1, bgcolor: "#F7F7F7", zIndex: 9999 }}>
                                <Paper sx={{ p: 1, display: "flex", gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Close
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <CircularProgress size={22} sx={{ color: "#fff" }} />
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                </Paper>
                            </Box>
                        </form>
                    </Box>
                </Grid>

            </Grid>
        </Drawer>
    );
};

export default AddEditTeamForm;
