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
import mapAdminAccess from "../../../mapAdminAccess.json"

import instanceV1 from "../../../restaurant/authaxios";
import { CloudArrowUp16Regular, Delete16Regular } from "@fluentui/react-icons";
import { Close } from "@mui/icons-material";

const roleMapping = {

    6: "Sales",
    7: "Data Moderator",
};

const AddEditTeamRoleForm = ({ open, onClose, data, setAlert, action, setAction }) => {
    const token = localStorage.getItem("authToken");
    const [permissionSearch, setPermissionSearch] = useState("");

    const initialValues = {
        role_name: "",
        role_description: "",

    };
    useEffect(() => {
        console.log('data', data)
    }, [data])


    const [values, setValues] = useState(initialValues);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data) {
            setValues({
                id: data.id || "",
                role_name: data.role_name || "",
                role_description: data.role_description || "",

            });
        } else {
            setValues(initialValues);
        }
    }, [data, open]);

    const uploadImage = async (file) => {
        const newInstance = instanceV1(token);
        try {
            setLoading(true);

            const res = await newInstance.post(
                "/api/user/admin/uploadImage",
                { file, uploadType: "user_admin_profile" },
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            setValues((prev) => ({
                ...prev,
                uap_azure_original_image_url: res.data.imageUrl,
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

        if (!values.role_name || !values.role_description) {
            setAlert({
                open: true,
                message: "Role name and Role Description required!",
                severity: "warning",
            });
            setLoading(false);
            return;
        }

        try {
            const instance = instanceV1(token);

            const payload = {
                role_name: values.role_name,
                role_description: values.role_description,

            };

            if (!data) {
                await instance.post("/api/admin/role/v1/role", payload);
                setAlert({ open: true, message: "Member added", severity: "success" });
            } else {
                console.log('data', data)
                await instance.put(`/api/admin/role/v1/role${data.user_admin_id}`, payload);
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
        const res = await instance.get(`/api/admin/role/v1/permissions/${data.id}?limit=1000`);
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

    }, [data, open])

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
                role_id: data.id,
                permissions: permissionsPayload,
            };
            console.log('payload', payload)

            await instance.post(
                "/api/admin/role/v1/permission",
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

    const buildPermissionGroups = (permissionData) => {
  const groups = {};

  permissionData.forEach((perm) => {
    const [name, type] = perm.permission_name.split("-");
    if (!type) return;

    // normalize group key (remove list_, history_, etc if needed)
    let groupKey = name
      .replace(/^list_/, "")
      .replace(/_history$/, "")
      .replace(/_sent_history$/, "")
      .replace(/_triggers$/, "")
      .replace(/_template$/, "");

    if (!groups[groupKey]) {
      groups[groupKey] = {
        key: groupKey,
        label: groupKey
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        read: [],
        write: [],
      };
    }

    if (type === "read") groups[groupKey].read.push(perm);
    if (type === "write") groups[groupKey].write.push(perm);
  });

  return Object.values(groups);
};
const permissionGroups = React.useMemo(
  () => buildPermissionGroups(permissionData),
  [permissionData]
);
const isGroupChecked = (perms) =>
  perms.length > 0 &&
  perms.every((p) => values[`permission_${p.permission_id}`]);
const toggleGroup = (perms, checked) => {
  const updated = { ...values };
  perms.forEach((p) => {
    updated[`permission_${p.permission_id}`] = checked;
  });
  setValues(updated);
};


    return (
        <Drawer
disableEnforceFocus            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: "100%", sm: data ? 800 : 400 }, p: 0, margin: 0, height: "100vh", bgcolor: "#F7F7F7" },
            }}
        >
            <Grid container>

                <Grid
                    items
                    sx={{
                        height: '100vh',
                        overflowY: 'auto',
                    }}
                    size={{
                        xs: 12,
                        md: data ? 6 : 12
                    }}>
                    <Box sx={{ position: "relative" }}>
                        {/* HEADER */}
                        <Box sx={{ position: "sticky", top: 0, p: 1, bgcolor: "#F7F7F7", zIndex: 9999 }}>
                            <Paper sx={{ p: 1, py: data ? 1.7 : 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h5">
                                    {data ? "Edit Role" : "Add New Role"}
                                </Typography>
                                {!data &&

                                    <IconButton onClick={onClose}>
                                        <Close />
                                    </IconButton>}
                            </Paper>
                        </Box>

                        {/* FORM */}
                        <form onSubmit={handleSubmit}>
                            <Paper sx={{ m: 1, p: 2 }}>
                                {/* IMAGE UPLOAD */}


                                {/* FIRST NAME */}
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="Role Name"
                                    value={values.role_name}
                                    onChange={(e) => setValues({ ...values, role_name: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />

                                {/* LAST NAME */}
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="Role Description"
                                    value={values.role_description}
                                    onChange={(e) => setValues({ ...values, role_description: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />


                            </Paper>

                            {/* FOOTER BUTTONS */}
                            <Box sx={{ position: "sticky", bottom: 0, p: 1, bgcolor: "#F7F7F7" }}>
                                <Paper sx={{ p: 1, display: "flex", gap: 1 }}>
                                    {/* <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Close
                                    </Button> */}

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
                {data && <Grid
                    items
                    sx={{
                        height: '100vh',
                        overflowY: 'auto',
                    }}
                    size={{
                        xs: 12,
                        md: 6
                    }}>
                    <Box sx={{ position: "relative" }}>
                        {/* HEADER */}
                        <Box sx={{ position: "sticky", top: 0, p: 1, bgcolor: "#F7F7F7", zIndex: 9999 }}>
                            <Paper sx={{ p: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h5">
                                    {data ? "Edit Permission" : "Edit Permission"}
                                </Typography>

                                <IconButton onClick={onClose}>
                                    <Close />
                                </IconButton>
                            </Paper>
                        </Box>

                        {/* FORM */}
                        <form onSubmit={handleSubmit}>
                            <Paper sx={{ m: 1, p: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search permission..."
                                    value={permissionSearch}
                                    onChange={(e) => setPermissionSearch(e.target.value)}
                                    sx={{ mb: 1 }}
                                />

                                {/* IMAGE UPLOAD */}
                                <Grid container spacing={1}>
                                    {permissionData
                                        .filter((permission) =>
                                            permission.permission_name
                                                .toLowerCase()
                                                .includes(permissionSearch.toLowerCase())
                                        )
                                        .sort((a, b) => {
                                            // status === 1 should come first
                                            if (a.status === 1 && b.status !== 1) return -1;
                                            if (a.status !== 1 && b.status === 1) return 1;
                                            return 0;
                                        })
                                        .map((permission) => (
                                            <Grid key={permission.id || permission.permission_id} size={6}>
                                                <FormControlLabel
                                                    sx={{
                                                        "& .MuiFormControlLabel-label": {
                                                            fontSize: "12px",
                                                        },
                                                    }}
                                                    control={
                                                        <Checkbox
                                                            checked={
                                                                values[
                                                                `permission_${permission.id || permission.permission_id}`
                                                                ] || false
                                                            }
                                                            onChange={(e) =>
                                                                setValues({
                                                                    ...values,
                                                                    [`permission_${permission.id || permission.permission_id}`]:
                                                                        e.target.checked,
                                                                })
                                                            }
                                                        />
                                                    }
                                                    label={permission.permission_name}
                                                />
                                            </Grid>
                                        ))}

                                </Grid>



                            </Paper>

                            {/* FOOTER BUTTONS */}
                            <Box sx={{ position: "sticky", bottom: 0, p: 1, bgcolor: "#F7F7F7" }}>
                                <Paper sx={{ p: 1, display: "flex", gap: 1 }}>
                                    {/* <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Close
                                    </Button> */}

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        // type="submit"
                                        onClick={handlePermissionSubmit}
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
                }

            </Grid>
        </Drawer>
    );
};

export default AddEditTeamRoleForm;
