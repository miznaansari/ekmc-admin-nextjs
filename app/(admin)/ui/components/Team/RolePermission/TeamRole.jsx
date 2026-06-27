import React, { useEffect, useState } from "react";
import { Box, TextField, Paper, Typography, Button, MenuItem, Select } from "@mui/material";
import TeamRoleTable from "./TeamRoleTable.jsx";
import AddEditTeamRoleForm from "./AddEditTeamRoleForm.jsx";
import GlobalSnackbar from "../../../utils/GlobalSnackbar.jsx";
import { useLocation } from "react-router-dom";
import mapAdminAccess from "../../../mapAdminAccess.json"
import instanceV1 from "../../../restaurant/authaxios.jsx";
const TeamRole = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [action, setAction] = useState(false);
  const [editData, setEditData] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
    // 🔥 NEW FILTER STATES
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [roleMapping, setRoleMapping] = useState({});
    const [page, setPage] = useState(1);

useEffect(() => {
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const instance = instanceV1(token);
      const res = await instance.get("/api/admin/role/v1/roles");

      if (res?.data?.status) {
        const map = {};
        res.data.get_data.forEach((role) => {
          map[Number(role.id)] = role.role_name;
        });
        setRoleMapping(map);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  fetchRoles();
}, []);



  // import mapAdminAccess from "../../mapAdminAccess.json"
    
      const location = useLocation();
      const locationName = location.pathname;
      const pathName = mapAdminAccess.filter(
        (access) => access.path === locationName
      );
      const basePermission = pathName?.[0]?.permission || "";
      const userRole = localStorage.getItem("userRole") || "";
      const writePermission = basePermission.replace(/-read$/, "-write");
      console.log('writePermission', writePermission)
      const accessMember = JSON.parse(localStorage.getItem("user_permission")) || [];
      const checkAccess = accessMember.filter(
        (access) => access?.permission_name === writePermission
      );
      console.log('checkAccess',checkAccess)
      const hasWriteAccess = checkAccess[0]?.status === 1;
      console.log('object', hasWriteAccess)
    
      // {(userRole === '1' || hasWriteAccess) && (<>
    
      // </>)}




  return (
    <Paper sx={{ p: 2, mt: 1 }}>
      {/* Search Box */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          minHeight: 48,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
            Team Roles
          </Typography>
          <TextField
            label="Search Member"
            variant="outlined"
            size="small"
            sx={{ width: "200px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            size="small"
            sx={{ width: "200px" }}
            value={roleFilter}
            displayEmpty
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Roles</MenuItem>
            {Object.entries(roleMapping).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                {label}
              </MenuItem>
            ))}
          </Select>

          {/* 🔥 STATUS FILTER */}
          <Select
            size="small"
            sx={{ width: "200px" }}
            value={statusFilter}
            displayEmpty
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="1">Active</MenuItem>
            <MenuItem value="0">Inactive</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          {(userRole === "1" || hasWriteAccess) && (
            <Button
              variant="contained"
              onClick={() => {
                setEditData(null);
                setOpenDrawer(true);
              }}
            >
              Add New Role
            </Button>
          )}
        </Box>
      </Box>

      {/* Table Component */}
      <TeamRoleTable setEditData={setEditData} setOpenDrawer={setOpenDrawer} searchTerm={searchTerm} action={action} setAction={setAction}  roleFilter={roleFilter} setRoleFilter={setRoleFilter} setStatusFilter={setStatusFilter} statusFilter={statusFilter} page={page} setPage={setPage} />
      <AddEditTeamRoleForm
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        data={editData}
        setAlert={setAlert}
        action={action}
        setAction={setAction}
      />
      <GlobalSnackbar alert={alert} setAlert={setAlert} />

    </Paper>

  );
};

export default TeamRole;
