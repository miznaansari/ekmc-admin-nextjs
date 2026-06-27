"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Paper,
  Typography,
  Button,
  MenuItem,
  Select,
} from "@mui/material";
import ReleasedLogTable from "./ReleasedLogTable.jsx";
import AddEditReleasedLogForm from "./AddEditReleasedLogForm.jsx";
import GlobalSnackbar from "../../utils/GlobalSnackbar.jsx";
import { useLocation } from "react-router-dom";
import mapAdminAccess from "../../mapAdminAccess.json";

const ReleasedLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openDrawer, setOpenDrawer] = useState(false);
  const [action, setAction] = useState(false);
  const [editData, setEditData] = useState(null);

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ FILTER STATES
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 🔐 PERMISSION LOGIC
  const location = useLocation();
  const locationName = location.pathname;

  const pathName = mapAdminAccess.filter(
    (access) => access.path === locationName
  );

  const basePermission = pathName?.[0]?.permission || "";
  const userRole = localStorage.getItem("userRole") || "";

  const writePermission = basePermission.replace(/-read$/, "-write");

  const accessMember =
    JSON.parse(localStorage.getItem("user_permission")) || [];

  const checkAccess = accessMember.filter(
    (access) => access?.permission_name === writePermission
  );

  const hasWriteAccess = checkAccess[0]?.status === 1;

  return (
    <Paper sx={{ p: 2, mt: 1 }}>
      {/* HEADER */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5">Release Logs</Typography>

          {/* 🔍 SEARCH */}
          <TextField
            label="Search Version"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* 📱 PLATFORM FILTER */}
          <Select
            size="small"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All Platforms</MenuItem>
            <MenuItem value={0}>iOS</MenuItem>
            <MenuItem value={1}>Android</MenuItem>
            <MenuItem value={2}>Web</MenuItem>
          </Select>

          {/* ✅ STATUS FILTER */}
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value={1}>Active</MenuItem>
            <MenuItem value={0}>Inactive</MenuItem>
          </Select>
        </Box>

        {(userRole === "1" || hasWriteAccess) && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setEditData(null);
              setOpenDrawer(true);
            }}
          >
            Add Release
          </Button>
        )}
      </Box>

      {/* TABLE */}
      <ReleasedLogTable
        searchTerm={searchTerm}
        platformFilter={platformFilter}
        statusFilter={statusFilter}
        setEditData={setEditData}
        setOpenDrawer={setOpenDrawer}
        action={action}
        setAction={setAction}
      />

      {/* FORM */}
      <AddEditReleasedLogForm
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

export default ReleasedLog;