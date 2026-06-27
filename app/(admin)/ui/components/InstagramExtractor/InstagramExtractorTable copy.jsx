import React, { useEffect, useMemo, useState, useRef } from "react";
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
  Collapse,
} from "@mui/material";

import { MoreVertical24Filled } from "@fluentui/react-icons";
import instanceV1 from "../../restaurant/authaxios";
import GlobalSnackbar from "../../utils/GlobalSnackbar";

const InstagramExtractorTable = ({ searchTerm = "", setEditData, setOpenDrawer, action }) => {
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [data, setData] = useState([]);
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("full_name");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Collapse state
  const [openRowId, setOpenRowId] = useState(null);

  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -----------------------------------
  // FETCH API
  // -----------------------------------
  const fetchProfiles = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("authToken");
      const api = instanceV1(token);

      const res = await api.get(
        `/api/admin/crawler/v1/insta/data?page=${page}&limit=${rowsPerPage}`
      );

      const list = res.data?.response?.data || [];

      const formatted = list.map((row) => ({
        ...row,
        status_text: row.is_processed === 1 ? "Done" : "Queue",
        full_name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
      }));

      const currentDataStr = JSON.stringify(dataRef.current);
      const newDataStr = JSON.stringify(formatted);
      if (currentDataStr !== newDataStr) {
        setData(formatted);
      }
      setTotalPages(res.data?.response?.lastPage || 1);
      setError(null);
    } catch (err) {
      setError("Failed to load profiles");
      setAlert({
        open: true,
        severity: "error",
        message: "Failed to load profiles",
      });
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles(true);

    const interval = setInterval(() => {
      fetchProfiles(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [page, rowsPerPage, action]);

  // Sorting
  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const sortData = (array) => {
    return array.sort((a, b) => {
      const A = String(a[orderBy] || "").toLowerCase();
      const B = String(b[orderBy] || "").toLowerCase();
      return order === "asc" ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
    });
  };

  // Search
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(term))
    );
  }, [data, searchTerm]);

  const tableData = useMemo(() => sortData([...filteredData]), [
    filteredData,
    order,
    orderBy,
  ]);

  // MENU Actions
  const handleMenuOpen = (e, row) => {
    setSelectedRow(row);
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setSelectedRow(null);
    setAnchorEl(null);
  };

  // ROW CLICK → COLLAPSE
  const toggleRow = (id) => {
    setOpenRowId(openRowId === id ? null : id); // close if same row again
  };

  // const hasWriteAccess = useWriteAccess();
  const getStatusChip = (reel) => {
    if (reel.is_processed !== 1) {
      return { label: "Queue", color: "warning" };
    }

    if (reel.is_rejected === 0 && reel.is_approved === 0) {
      return { label: "Ready", color: "info" };
    }

    if (reel.is_rejected === 1 && reel.is_approved === 0) {
      return { label: "Rejected", color: "warning" };
    }

    if (reel.is_rejected === 0 && reel.is_approved === 1) {
      return { label: "Approved", color: "success" };
    }

    if (reel.is_rejected === 1 && reel.is_approved === 1) {
      return { label: "Error", color: "error" };
    }

    return { label: "Unknown", color: "default" };
  };

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", mt: 1, p: 1 }}>
      {loading && (
        <Box py={3} sx={{ textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      )}
      {!loading && error && (
        <Box py={3} sx={{ textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      {!loading && !error && (
        <>
          <TableContainer
            sx={{
              maxHeight: `${screenHeight - 250}px`,
              overflowY: "auto",
            }}
          >
            <Table stickyHeader size="small">
              <TableHead sx={{ backgroundColor: "#f7faf7" }}>
                <TableRow>
                  <TableCell>S.No.</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "full_name"}
                      direction={orderBy === "full_name" ? order : "asc"}
                      onClick={() => handleSort("full_name")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "username"}
                      direction={orderBy === "username" ? order : "asc"}
                      onClick={() => handleSort("username")}
                    >
                      Username
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Instagram Link</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ position: "sticky", right: 0, zIndex: 100 }}>
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.map((row, index) => (
                  <React.Fragment key={row.id}>
                    {/* MAIN ROW */}
                    <TableRow
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => toggleRow(row.id)}
                    >
                      <TableCell>
                        {(page - 1) * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{row.full_name || "Pending"}</TableCell>
                      <TableCell>@{row.username || "Pending"}</TableCell>

                      <TableCell>
                        <Typography
                          component="a"
                          href={row.instagram_profile_url?.trim()}
                          target="_blank"
                          sx={{
                            color: "blue",
                            textDecoration: "underline",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.instagram_profile_url}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={row.status_text}
                          color={row.is_processed === 1 ? "primary" : "warning"}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>

                      <TableCell
                        sx={{ position: "sticky", right: 0, zIndex: 10 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                          <MoreVertical24Filled />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* COLLAPSE ROW */}
                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, background: "#fafafa" }}>
                        <Collapse in={openRowId === row.id} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2 }}>
                            <Typography fontWeight={600} sx={{ mb: 1 }}>
                              Reels List:
                            </Typography>

                            {row.reels?.length > 0 ? (
                              [...row.reels]
                                .sort((a, b) => (b.is_processed === 1) - (a.is_processed === 1))
                                .map((reel, index) => {
                                  const { label, color } = getStatusChip(reel);

                                  return (
                                    <Box
                                      key={reel.id}
                                      sx={{
                                        borderBottom: "1px solid #e0e0e0",
                                        py: 1,
                                        px: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor: "pointer",
                                        "&:hover": { backgroundColor: "#f5f5f5" },
                                      }}
                                      onClick={() => {


                                        // if (reel.is_approved == 1) {
                                        //   setAlert({
                                        //     open: true,
                                        //     severity: "success",
                                        //     message: "This reel is already approved and cannot be edited.",
                                        //   });
                                        //   return
                                        // };
                                        // if (reel.is_rejected == 1) {
                                        //   setAlert({
                                        //     open: true,
                                        //     severity: "success",
                                        //     message: "This reel is already Rejected and cannot be edited.",
                                        //   });
                                        //   return
                                        // };
                                        setEditData(reel);
                                        setOpenDrawer(true);
                                      }}
                                    >
                                      {/* LEFT SIDE */}
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                                        <Typography sx={{ fontWeight: 600, width: 24 }}>
                                          {index + 1}.
                                        </Typography>

                                        <Typography
                                          component="a"
                                          href={reel.raw_video_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          sx={{
                                            color: "primary.main",
                                            textDecoration: "underline",
                                            fontSize: 13,
                                            maxWidth: 420,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          {reel.raw_video_url}
                                        </Typography>
                                      </Box>

                                      {/* RIGHT SIDE */}
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {/* Reject reason LEFT of chip */}
                                        {label === "Rejected" && reel.reject_reason && (
                                          <Box
                                            sx={{
                                              px: 1,
                                              py: 0.25,
                                              borderRadius: 1,
                                              backgroundColor: "error.lighter",
                                              border: "1px solid",
                                              borderColor: "error.light",
                                              maxWidth: 220,
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Typography
                                              variant="caption"
                                              sx={{
                                                color: "error.main",
                                                fontWeight: 500,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                              }}
                                              title={reel.reject_reason}
                                            >
                                              {reel.reject_reason}
                                            </Typography>
                                          </Box>
                                        )}

                                        <Chip label={label} color={color} size="small" />
                                      </Box>
                                    </Box>
                                  );
                                })
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Under process
                              </Typography>
                            )}

                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>

                  </React.Fragment>
                ))}

                {tableData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box py={3} sx={{ textAlign: "center" }}>
                        <Typography>No Data Found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* PAGINATION */}
          <Grid container sx={{ my: 1 }}>
            <Grid
              sx={{ ml: "auto" }}
              size={{
                xs: 12,
                sm: "auto"
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Rows per page:
                  </Typography>

                  <Select
                    size="small"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    sx={{ minWidth: 70, height: 32, fontSize: "0.875rem" }}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </Box>

                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, val) => setPage(val)}
                  shape="rounded"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>

          {/* ACTION MENU */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                navigator.clipboard.writeText(selectedRow.username);
                setAlert({
                  open: true,
                  message: "Username copied!",
                  severity: "success",
                });
                handleMenuClose();
              }}
            >
              Copy Username
            </MenuItem>

            <MenuItem
              onClick={() => {
                window.open(selectedRow.instagram_profile_url?.trim(), "_blank");
                handleMenuClose();
              }}
            >
              Open Profile
            </MenuItem>
          </Menu>

          <GlobalSnackbar alert={alert} setAlert={setAlert} />
        </>
      )}
    </Paper>
  );
};

export default InstagramExtractorTable;
