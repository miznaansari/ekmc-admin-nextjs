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
    List,
    ListItemButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
} from "@mui/material";
import mapAdminAccess from "../../../mapAdminAccess.json"

import instanceV1 from "../../../restaurant/authaxios";
import { Cart24Regular, CloudArrowUp16Regular, ContentViewGallery24Regular, DataUsage24Regular, Delete16Regular, Food24Regular, People24Regular, Person24Regular, QrCode24Regular, StarEmphasis24Regular } from "@fluentui/react-icons";
import { Close, ExpandLess, ExpandMore } from "@mui/icons-material";

const roleMapping = {

    6: "Sales",
    7: "Data Moderator",
};

const AddEditTeamRoleForm = ({ open, onClose, data, setAlert, action, setAction }) => {
    const token = localStorage.getItem("authToken");
    const [permissionSearch, setPermissionSearch] = useState("");
    const [expanded, setExpanded] = React.useState({});

    const initialValues = {
        role_name: "",
        role_description: "",
        status: "",

    };
    useEffect(() => {
        console.log('data', data)
    }, [data])


    const [values, setValues] = useState(initialValues);
    const [valuesNew, setValuesNew] = useState(initialValues);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (data) {
            console.log('data', data)
            setValuesNew({
                id: data.id || "",
                role_name: data.role_name || "",
                role_description: data.role_description || "",
                status: data.status || "",

            });
        } else {
            setValuesNew(initialValues);
        }
    }, [data, open]);

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

        if (!valuesNew.role_name || !valuesNew.role_description) {
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
                role_name: valuesNew.role_name,
                role_description: valuesNew.role_description,
                status: valuesNew.status,

            };

            if (!data) {
                await instance.post("/api/admin/role/v1/role", payload);
                setAlert({ open: true, message: "Member added", severity: "success" });
            } else {
                console.log('data', data)
                await instance.put(`/api/admin/role/v1/role/${data.id}`, payload);
                setAlert({ open: true, message: "Member updated", severity: "success" });
            }

            setAction(!action);
            setValues(initialValues);
            setValuesNew(initialValues);
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

    // const handlePermissionMember = async () => {
    //     const instance = instanceV1(token);

    //     // 1️⃣ fetch all permissions
    //     const allPermissionRes = await instance.get(`/api/admin/permission/v1/permission?limit=1000`);
    //     const allPermissions = allPermissionRes.data.data; // id, permission_name, status

    //     // 2️⃣ fetch member permissions
    //     const res = await instance.get(`/api/admin/role/v1/permissions/${data.id}?limit=1000`);
    //     const memberPermissions = res.data.data; // permission_id, status

    //     // 3️⃣ merge permissions
    //     const mergedPermissions = allPermissions.map((p) => {
    //         // find if user has this permission
    //         const userPerm = memberPermissions.find((mp) => mp.permission_id === p.id);
    //         return {
    //             permission_id: p.id,
    //             permission_name: p.permission_name,
    //             status: userPerm ? userPerm.status : 0, // use user status or default 0
    //         };
    //     });

    //     // 4️⃣ set permission data to render
    //     setpermissionData(mergedPermissions);

    //     // 5️⃣ initialize checkbox values
    //     const initialValues = {};
    //     mergedPermissions.forEach((p) => {
    //         initialValues[`permission_${p.permission_id}`] = p.status === 1;
    //     });
    //     setValues(initialValues);
    // };

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
    const menuItems = [
        {
            label: "Insights",
            path: "/dashboard/insights",
            icon: <DataUsage24Regular />,
            permissions: ["insights-read", "insights-write"],
        },

        {
            label: "Eatry Management",
            icon: <Food24Regular />,
            permissions: [
                "onboard_new_eatery-read",
                "onboard_new_eatery-write",
                "list_eatery-read",
                "list_eatery-write",
                "list_employees-read",
                "list_employees-write",
            ],
            children: [
                {
                    label: "Onboard New Eatery",
                    path: "/onboarding",
                    permissions: [
                        "onboard_new_eatery-read",
                        "onboard_new_eatery-write",
                    ],
                },
                {
                    label: "List Eatery",
                    path: "/restaurants",
                    permissions: ["list_eatery-read", "list_eatery-write"],
                },
                {
                    label: "List Employees",
                    path: "/users/employees",
                    permissions: ["list_employees-read", "list_employees-write"],
                },
            ],
        },

        {
            label: "List Customers",
            path: "/users/customers",
            icon: <Person24Regular />,
            permissions: ["list_customers-read", "list_customers-write"],
        },

        {
            label: "Recommendation",
            path: "/recommendations",
            icon: <StarEmphasis24Regular />,
            permissions: ["recommendation-read", "recommendation-write"],
        },

        {
            label: "Eatshot",
            path: "/eatshot",
            icon: <QrCode24Regular />,
            permissions: ["eatshot-read", "eatshot-write"],
        },

        {
            label: "Data Moderator",
            icon: <ContentViewGallery24Regular />,
            permissions: [
                "cafe_gallery-read",
                "cafe_gallery-write",
                "instagram-read",
                "instagram-write",
            ],
            children: [
                {
                    label: "Cafe Gallery",
                    path: "/restaurants/gallery",
                    permissions: ["cafe_gallery-read", "cafe_gallery-write"],
                },
                {
                    label: "Instagram",
                    path: "/integrations/instagram",
                    permissions: ["instagram-read", "instagram-write"],
                },
            ],
        },

        // {
        //     label: "Team Member",
        //     icon: <People24Regular />,
        //     permissions: [
        //         "team-read",
        //         "team-write",
        //         "team_role-read",
        //         "team_role-write",
        //     ],
        //     children: [
        //         {
        //             label: "Team",
        //             path: "/team",
        //             permissions: ["team-read", "team-write"],
        //         },
        //         {
        //             label: "Team Role",
        //             path: "/team/roles",
        //             permissions: ["team_role-read", "team_role-write"],
        //         },
        //     ],
        // },

        {
            label: "Marketing",
            icon: <ContentViewGallery24Regular />,
            permissions: [
                "list_routes-read", "list_routes-write",
                "list_conditions-read", "list_conditions-write",
                "list_banner_placement-read", "list_banner_placement-write",
                "list_banners-read", "list_banners-write",
                "list_notification_triggers-read", "list_notification_triggers-write",
                "list_notification_template-read", "list_notification_template-write",
                "notification_history-read", "notification_history-write",
                "notification_sent_history-read", "notification_sent_history-write",
            ],
            children: [
                {
                    label: "List Routes",
                    path: "/system/routes",
                    permissions: ["list_routes-read", "list_routes-write"],
                },
                {
                    label: "List Conditions",
                    path: "/system/conditions",
                    permissions: ["list_conditions-read", "list_conditions-write"],
                },
                {
                    label: "List Banner Placement",
                    path: "/banners/placements",
                    permissions: [
                        "list_banner_placement-read",
                        "list_banner_placement-write",
                    ],
                },
                {
                    label: "List Banners",
                    path: "/banners",
                    permissions: ["list_banners-read", "list_banners-write"],
                },
                {
                    label: "List Notification Campaigns",
                    path: "/notifications/campaign",
                    permissions: [
                        "notification-read",
                        "notification-write",
                    ],
                },
                {
                    label: "List Notification Template",
                    path: "/notifications/templates",
                    permissions: [
                        "list_notification_template-read",
                        "list_notification_template-write",
                    ],
                },
                {
                    label: "Notification History",
                    path: "/notifications/history",
                    permissions: [
                        "notification-read",
                        "notification-write",
                    ],
                },
              
            ],
        },

        {
            label: "Gamification",
            icon: <ContentViewGallery24Regular />,
            permissions: [
                "contributions-read", "contributions-write",
                "milestones-read", "milestones-write",
                "levels-read", "levels-write",
            ],
            children: [
                {
                    label: "Contributions",
                    path: "/gamification/contributions",
                    permissions: ["contributions-read", "contributions-write"],
                },
                {
                    label: "Milestones",
                    path: "/gamification/milestones",
                    permissions: ["milestones-read", "milestones-write"],
                },
                {
                    label: "Levels",
                    path: "/gamification/levels",
                    permissions: ["levels-read", "levels-write"],
                },
            ],
        },

        {
            label: "Food Menu",
            icon: <ContentViewGallery24Regular />,
            permissions: [
                "universal_category-read", "universal_category-write",
                "universal_item-read", "universal_item-write",
                "restaurant_menu-read", "restaurant_menu-write",
                "restaurant_combos-read", "restaurant_combos-write",
                "explore_food-read", "explore_food-write",
            ],
            children: [
                {
                    label: "Universal Category",
                    path: "/catalog/categories",
                    permissions: ["universal_category-read", "universal_category-write"],
                },
                {
                    label: "Universal Item",
                    path: "/catalog/items",
                    permissions: ["universal_item-read", "universal_item-write"],
                },
                {
                    label: "Restaurant Menu",
                    path: "/restaurants/menu",
                    permissions: ["restaurant_menu-read", "restaurant_menu-write"],
                },
                {
                    label: "Restaurant Combos",
                    path: "/restaurants/combos",
                    permissions: ["restaurant_combos-read", "restaurant_combos-write"],
                },
                {
                    label: "Explore Food",
                    path: "/catalog/explore",
                    permissions: ["explore_food-read", "explore_food-write"],
                },
            ],
        },

        {
            label: "QR Management",
            icon: <QrCode24Regular />,
            permissions: [
                "qr_management-read", "qr_management-write",
                "table_management-read", "table_management-write",
            ],
            children: [
                {
                    label: "QR Management",
                    path: "/qr/management",
                    permissions: ["qr_management-read", "qr_management-write"],
                },
                {
                    label: "Table Management",
                    path: "/restaurants/tables",
                    permissions: ["table_management-read", "table_management-write"],
                },
            ],
        },

        {
            label: "Live Orders",
            icon: <Cart24Regular />,
            permissions: [
                "live_orders-read", "live_orders-write",
                "order_history-read", "order_history-write",
            ],
            children: [
                {
                    label: "Live Orders",
                    path: "/orders/live",
                    permissions: ["live_orders-read", "live_orders-write"],
                },
                {
                    label: "Order History",
                    path: "/orders/history",
                    permissions: ["order_history-read", "order_history-write"],
                },
            ],
        },
    ];
    const [menuConfig, setMenuConfig] = useState([])

    const handlePermissionMember = async () => {
        const instance = instanceV1(token);

        // 1️⃣ Fetch ALL permissions
        const allPermissionRes = await instance.get(
            `/api/admin/permission/v1/permission?limit=1000`
        );
        const allPermissions = allPermissionRes.data.data;
        // { id, permission_name, status }

        // 2️⃣ Fetch MEMBER permissions
        const res = await instance.get(
            `/api/admin/role/v1/permissions/${data.id}?limit=1000`
        );
        const memberPermissions = res.data.data;
        // { permission_id, status }

        // 3️⃣ Create quick lookup map for member permissions
        const memberPermissionMap = {};
        memberPermissions.forEach((mp) => {
            memberPermissionMap[mp.permission_id] = mp.status;
        });

        // 4️⃣ Merge permissions (API truth)
        const mergedPermissions = allPermissions.map((p) => ({
            permission_id: p.id,
            permission_name: p.permission_name,
            status: memberPermissionMap[p.id] ?? 0,
        }));

        // 5️⃣ Build permissionName → permissionId map
        const permissionNameToIdMap = {};
        mergedPermissions.forEach((p) => {
            permissionNameToIdMap[p.permission_name] = p.permission_id;
        });

        // 6️⃣ Attach permission IDs to menuItems (parent + children)
        const attachPermissionIds = (menus) =>
            menus.map((menu) => {
                let permissionIds = [];

                if (menu.permissions?.length) {
                    permissionIds = menu.permissions
                        .map((permName) => permissionNameToIdMap[permName])
                        .filter(Boolean);
                }

                const children = menu.children
                    ? attachPermissionIds(menu.children)
                    : undefined;

                // parent inherits child permissions
                if (children?.length) {
                    children.forEach((child) => {
                        permissionIds.push(...(child.permissionIds || []));
                    });
                }

                return {
                    ...menu,
                    permissionIds: [...new Set(permissionIds)],
                    children,
                };
            });

        const menuWithPermissionIds = attachPermissionIds(menuItems);

        // 7️⃣ Set permission data (flat list for rendering)
        setpermissionData(mergedPermissions);

        // 8️⃣ Initialize checkbox values
        const initialValues = {};
        mergedPermissions.forEach((p) => {
            initialValues[`permission_${p.permission_id}`] = p.status === 1;
        });

        setValues(initialValues);

        // 9️⃣ (Optional) store menu for UI filtering
        setMenuConfig(menuWithPermissionIds);
    };
    useEffect(() => {
        console.log('values', values)
    }, [values])

    const getPermissionKey = (id) => `permission_${id}`;

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
                                    value={valuesNew.role_name}
                                    onChange={(e) => setValuesNew({ ...valuesNew, role_name: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                />

                                {/* LAST NAME */}
                                <TextField
                                    fullWidth
                                    size="small"
                                    sx={{ mb: 2 }}
                                    label="Role Description"
                                    value={valuesNew.role_description}
                                    onChange={(e) =>
                                        setValuesNew({ ...valuesNew, role_description: e.target.value })
                                    }
                                    multiline
                                    rows={6}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <FormControlLabel
                                    label={valuesNew.status == 1 ? "Active" : "Inactive"}
                                    control={
                                        <Switch
                                            checked={valuesNew.status == 1}
                                            onChange={(e) =>
                                                setValuesNew({
                                                    ...valuesNew,
                                                    status: e.target.checked ? 1 : 0,
                                                })
                                            }
                                            color="primary"
                                        />
                                    }
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
                                {/* <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search permission..."
                                    value={permissionSearch}
                                    onChange={(e) => setPermissionSearch(e.target.value)}
                                    sx={{ mb: 1 }}
                                /> */}

                                {/* IMAGE UPLOAD */}
                                <List dense>
                                    {menuConfig.map((menu) => {
                                        const parentReadIds =
                                            menu.permissionIds?.filter((id) =>
                                                permissionData.find(
                                                    (p) => p.permission_id === id && p.permission_name.endsWith("-read")
                                                )
                                            ) || [];

                                        const parentWriteIds =
                                            menu.permissionIds?.filter((id) =>
                                                permissionData.find(
                                                    (p) => p.permission_id === id && p.permission_name.endsWith("-write")
                                                )
                                            ) || [];

                                        const isParentReadChecked = parentReadIds.every(
                                            (id) => values[getPermissionKey(id)]
                                        );

                                        const isParentWriteChecked = parentWriteIds.every(
                                            (id) => values[getPermissionKey(id)]
                                        );

                                        return (
                                            <React.Fragment key={menu.label}>
                                                {/* ===== PARENT ===== */}
                                                <ListItem disablePadding>
                                                    <ListItemButton

                                                        sx={{ px: 0 }}
                                                    >
                                                        <Box
                                                            sx={{ display: 'flex', width: '100%' }}
                                                            onClick={() =>
                                                                setExpanded((p) => ({
                                                                    ...p,
                                                                    [menu.label]: !p[menu.label],
                                                                }))
                                                            }
                                                        >
                                                            {menu.icon && (
                                                                <ListItemIcon sx={{ minWidth: 34 }}>
                                                                    {menu.icon}
                                                                </ListItemIcon>
                                                            )}
                                                            <ListItemText
                                                                primary={menu.label}
                                                                primaryTypographyProps={{ fontSize: "13px", fontWeight: 600 }}
                                                            />
                                                        </Box>

                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            {/* WRITE */}
                                                            <FormControlLabel
                                                                label="W"
                                                                labelPlacement="start"
                                                                sx={{ m: 0 }}
                                                                control={
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={isParentWriteChecked}
                                                                        onChange={(e) => {
                                                                            const updated = { ...values };
                                                                            parentWriteIds.forEach((id) => {
                                                                                updated[getPermissionKey(id)] = e.target.checked;
                                                                            });
                                                                            setValues(updated);
                                                                        }}
                                                                    />
                                                                }
                                                            />

                                                            {/* READ */}
                                                            <FormControlLabel
                                                                label="R"
                                                                labelPlacement="start"
                                                                sx={{ m: 0 }}
                                                                control={
                                                                    <Checkbox
                                                                        size="small"
                                                                        checked={isParentReadChecked}
                                                                        onChange={(e) => {
                                                                            const updated = { ...values };
                                                                            parentReadIds.forEach((id) => {
                                                                                updated[getPermissionKey(id)] = e.target.checked;
                                                                            });
                                                                            setValues(updated);
                                                                        }}
                                                                    />
                                                                }
                                                            />

                                                            {menu.children &&
                                                                (expanded[menu.label] ? <ExpandLess
                                                                    onClick={() =>
                                                                        setExpanded((p) => ({
                                                                            ...p,
                                                                            [menu.label]: !p[menu.label],
                                                                        }))
                                                                    }
                                                                /> : <ExpandMore
                                                                    onClick={() =>
                                                                        setExpanded((p) => ({
                                                                            ...p,
                                                                            [menu.label]: !p[menu.label],
                                                                        }))
                                                                    }
                                                                />)}
                                                        </Stack>
                                                    </ListItemButton>
                                                </ListItem>

                                                {/* ===== CHILDREN ===== */}
                                                {menu.children && (
                                                    <Collapse in={expanded[menu.label]} timeout="auto" unmountOnExit>
                                                        {menu.children.map((child) => {
                                                            const readIds =
                                                                child.permissionIds?.filter((id) =>
                                                                    permissionData.find(
                                                                        (p) =>
                                                                            p.permission_id === id &&
                                                                            p.permission_name.endsWith("-read")
                                                                    )
                                                                ) || [];

                                                            const writeIds =
                                                                child.permissionIds?.filter((id) =>
                                                                    permissionData.find(
                                                                        (p) =>
                                                                            p.permission_id === id &&
                                                                            p.permission_name.endsWith("-write")
                                                                    )
                                                                ) || [];

                                                            return (
                                                                <ListItemButton key={child.label} sx={{ pl: 5, py: 0.5 }}>

                                                                    <ListItemText
                                                                        primary={child.label}
                                                                        primaryTypographyProps={{ fontSize: "12px" }}
                                                                    />

                                                                    <Stack direction="row" spacing={1}>
                                                                        {/* WRITE */}
                                                                        <FormControlLabel
                                                                            label="W"
                                                                            labelPlacement="start"
                                                                            sx={{ m: 0 }}
                                                                            control={
                                                                                <Checkbox
                                                                                    size="small"
                                                                                    checked={writeIds.every(
                                                                                        (id) => values[getPermissionKey(id)]
                                                                                    )}
                                                                                    onChange={(e) => {
                                                                                        const updated = { ...values };
                                                                                        writeIds.forEach((id) => {
                                                                                            updated[getPermissionKey(id)] =
                                                                                                e.target.checked;
                                                                                        });
                                                                                        setValues(updated);
                                                                                    }}
                                                                                />
                                                                            }
                                                                        />

                                                                        {/* READ */}
                                                                        <FormControlLabel
                                                                            label="R"
                                                                            labelPlacement="start"
                                                                            sx={{ m: 0 }}
                                                                            control={
                                                                                <Checkbox
                                                                                    size="small"
                                                                                    checked={readIds.every(
                                                                                        (id) => values[getPermissionKey(id)]
                                                                                    )}
                                                                                    onChange={(e) => {
                                                                                        const updated = { ...values };
                                                                                        readIds.forEach((id) => {
                                                                                            updated[getPermissionKey(id)] =
                                                                                                e.target.checked;
                                                                                        });
                                                                                        setValues(updated);
                                                                                    }}
                                                                                />
                                                                            }
                                                                        />
                                                                    </Stack>
                                                                </ListItemButton>
                                                            );
                                                        })}
                                                    </Collapse>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>




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
