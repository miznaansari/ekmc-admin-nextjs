import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Typography,
  Box,
  Grid,
  Select,
  MenuItem,
  Pagination,
  IconButton,
  Chip,
  Menu,
} from "@mui/material";

import { MoreVertical24Filled } from "@fluentui/react-icons";
import instanceV1 from "../../restaurant/authaxios";
import GlobalSnackbar from "../../utils/GlobalSnackbar";

const TeamTable = ({ setEditData, setOpenDrawer, searchTerm = "", action, setAction, roleFilter, setRoleFilter, setStatusFilter, statusFilter, page, setPage }) => {
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const statusMapping = {
    1: "Active",
    0: "Inactive",
  };

const [roleMapping, setRoleMapping] = useState({});
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
      } catch (err) {
        console.error(err);
      }
    };

    fetchRoles();
  }, []);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("first_name");

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);



  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // 🔥 STATUS UPDATE TOGGLE
  const handleActive = async (row) => {
    try {
      const token = localStorage.getItem("authToken");
      const api = instanceV1(token);

      const updatedStatus = row.status === 1 ? 0 : 1;

      await api.put(`/api/admin/team/v1/member/${row.user_admin_id}`, {
        status: updatedStatus,
      });

      setAlert({
        open: true,
        message: `Status updated successfully`,
        severity: "success",
      });

      setAction((prev) => prev + 1);
    } catch (err) {
      setAlert({
        open: true,
        message: "Failed to update status",
        severity: "error",
      });
    }
  };

  // 🔥 FETCH TEAM WITH FILTERS
  const fetchTeam = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      const api = instanceV1(token);

      const params = new URLSearchParams({
        search: searchTerm,
        page,
        limit: rowsPerPage,
      });

      if (roleFilter) params.append("user_role_id", roleFilter);
      if (statusFilter !== "") params.append("status", statusFilter);

      const res = await api.get(`/api/admin/team/v1/members?${params}`);

      const resp = res.data?.response || {};

      const list = (resp.data || []).map((user) => ({
        ...user,
        full_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        status_text: statusMapping[user.status] || "Inactive",
        // role_name: roleMapping[user.user_role_id] || "Unknown",
      }));

      setData(list);
      setTotalPages(resp.lastPage || 1);
    } catch (err) {
      setAlert({
        open: true,
        message: err.response?.data?.msg || "Failed to load team list",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger on page, limit, search, filters, action
  useEffect(() => {
    fetchTeam();
  }, [page, rowsPerPage, searchTerm, roleFilter, statusFilter, action]);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const A = String(a[orderBy] || "").toLowerCase();
      const B = String(b[orderBy] || "").toLowerCase();
      return order === "asc" ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
    });
  }, [data, order, orderBy]);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", mt: 1, p: 1 }}>
      {/* 🔥 FILTER ROW */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* ROLE FILTER */}

      </Box>
      {loading ? (
        <Box py={3} sx={{ textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <>
          <TableContainer sx={{ maxHeight: "65vh" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>S.No.</TableCell>

                  {[
                    { id: "full_name", label: "Name" },
                    { id: "email", label: "Email" },
                    { id: "mobile_number", label: "Mobile" },
                    { id: "role_name", label: "Role" },
                    { id: "status_text", label: "Status" },
                  ].map((col) => (
                    <TableCell key={col.id}>
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}

                  <TableCell
                    align="center"
                    sx={{
                      position: "sticky",
                      right: 0,
                      zIndex: 2,
                    }}
                  >
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedData.length > 0 ? (
                  sortedData.map((row, index) => (
                    <TableRow key={row.user_admin_id} hover>
                      <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>

                      <TableCell>{row.full_name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.mobile_number}</TableCell>
                      <TableCell>{roleMapping[row.user_role_id] || "Unknown"}</TableCell>


                      <TableCell onClick={() => handleActive(row)} style={{ cursor: "pointer" }}>
                        <Chip
                          label={row.status_text}
                          color={row.status === 1 ? "primary" : "error"}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{
                          position: "sticky",
                          right: 0,
                          background: "#fff",
                          zIndex: 2,
                        }}
                      >
                        <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                          <MoreVertical24Filled />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No Results Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                setEditData(selectedRow);
                setOpenDrawer(true);
                handleMenuClose();
              }

              }

            >Edit</MenuItem>
            <MenuItem onClick={() => alert("Delete coming soon")}>Delete</MenuItem>
          </Menu>

          {/* PAGINATION */}
          <Grid container sx={{ mt: 2 }}>
            <Grid size={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Select
                  size="small"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                </Select>

                <Pagination
                  count={totalPages}
                  page={page}
                  variant="outlined"
                  shape="rounded"
                  onChange={(e, v) => setPage(v)}
                />
              </Box>
            </Grid>
          </Grid>
        </>
      )}
      <GlobalSnackbar alert={alert} setAlert={setAlert} />
    </Paper>
  );
};

export default TeamTable;
