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
  Chip,
  Menu,
  IconButton,
} from "@mui/material";
import instanceV1 from "../../../restaurant/authaxios";
import { MoreVertical24Filled } from "@fluentui/react-icons";
import AddEditTemplateForm from "./AddEditTemplateForm";
import ViewNotification from "./ViewNotification";
import GlobalSnackbar from "../../../utils/GlobalSnackbar";
import { set } from "date-fns";
import { use } from "react";


const NotificationTemplateTable = ({ searchTerm = "", action, setAction }) => {
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Status mapping
  const statusMapping = {
    1: "Active",
    0: "Inactive",
  };

  const [data, setData] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editData, setEditData] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openView, setOpenView] = useState(false);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("title");

  const [page, setPage] = useState(1); // backend pagination
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [totalPages, setTotalPages] = useState(1);

  // ---------------- FETCH API ----------------
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const api = instanceV1(token);
      const res = await api.get(
        `/api/admin/notification/v1/templates?page=${page}&limit=${rowsPerPage}`
      );

      const list = res.data?.data || [];

      const formatted = list.map((item) => ({
        ...item,
        status_text: statusMapping[item.status] || "Inactive",
        created_at_formatted: new Date(item.created_at).toLocaleString(),
      }));

      setData(formatted);
      setTotalPages(res.data?.last_page || 1);
      setError(null);

    } catch (err) {
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetchTemplates();
  }, [page, rowsPerPage]);

  const mergeUpdatedRows = (oldData, apiData, statusMapping) => {
    const oldMap = new Map(oldData.map(item => [item.id, item]));

    // Apply formatting to NEW data before comparing
    const formattedNewData = apiData.map(item => ({
      ...item,
      status_text: statusMapping[item.status] || "Inactive",
      created_at_formatted: new Date(item.created_at).toLocaleString(),
    }));

    return formattedNewData.map(newRow => {
      const oldRow = oldMap.get(newRow.id);

      if (!oldRow) {
        // 🟢 completely new row
        return newRow;
      }

      // 🟡 deep compare AFTER formatting
      const isDifferent = JSON.stringify(oldRow) !== JSON.stringify(newRow);

      return isDifferent ? newRow : oldRow;
    });
  };

  useEffect(() => {
    console.log('data', data)
  }, [data])

  const fetch = async () => {
    setLoading(false)
    const token = localStorage.getItem("authToken");
    const api = instanceV1(token);
    const res = await api.get(
      `/api/admin/notification/v1/templates?page=${page}&limit=${rowsPerPage}`
    );

    const list = res.data?.data || [];
    const newdata = mergeUpdatedRows(data, list, statusMapping);

    setData(newdata);

  }

  useEffect(() => {
    fetch()
    console.log('object=============================', action)

  }, [action, page, rowsPerPage])


  // ---------------- SORT ----------------
  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const sortData = (array) =>
    array.sort((a, b) => {
      const A = String(a[orderBy] || "").toLowerCase();
      const B = String(b[orderBy] || "").toLowerCase();
      return order === "asc" ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
    });

  // ---------------- SEARCH ----------------
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(term)
      )
    );
  }, [data, searchTerm]);

  const tableData = useMemo(() => sortData([...filteredData]), [
    filteredData,
    order,
    orderBy,
  ]);

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

  const DeleteTrigger = async (row) => {
    try {
      const token = localStorage.getItem("authToken");
      const api2 = instanceV1(token);

      const res = await api2.delete(`/api/admin/notification/v1/template/${row.id}`);

      if (res.status === 200) {
        setAlert({
          open: true,
          message: "Template deleted successfully",
          severity: "success",
        });

        fetchTemplates(); // Refresh list
      } else {
        setAlert({
          open: true,
          message: "Failed to delete template",
          severity: "error",
        });
      }
    } catch (err) {
      setAlert({
        open: true,
        message: "Error deleting template",
        severity: "error",
      });
    }
  };

  const handleActive = async (selectedRow) => {
    try {
      console.log("Activate", selectedRow);

      const token = localStorage.getItem("authToken");
      const api3 = instanceV1(token);

      const res = await api3.put(
        `/api/admin/notification/v1/template/${selectedRow.id}`,
        {
          status: selectedRow.status === 1 ? 0 : 1,
        }
      );
      setAction(!action);
      // Success Alert
      setAlert({
        open: true,
        type: "success",
        message: "Status updated successfully!",
      });

    } catch (error) {
      console.error("Error updating status:", error);

      // Error Alert
      setAlert({
        open: true,
        type: "error",
        message: error?.response?.data?.message || "Something went wrong!",
      });
    }
  };


  return (
    <Paper sx={{ width: "100%", overflow: "hidden", mt: 1, p: 1 }}>
      {/* Loading */}
      {loading && (
        <Box py={3} sx={{ textAlign: "center" }}>
          <Typography>Loading...</Typography>
        </Box>
      )}
      {/* Error */}
      {!loading && error && (
        <Box py={3} sx={{ textAlign: "center" }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      {/* Table */}
      {!loading && !error && (
        <>
          <TableContainer sx={{ maxHeight: `${screenHeight - 250}px`, overflowY: "auto" }}>
            <Table stickyHeader dense size="small">

              <TableHead
                sx={{
                  textTransform: "uppercase",
                  backgroundColor: "#f7faf7",
                }}
              >
                <TableRow>
                  <TableCell>S.No.</TableCell>
                  {[
                    { id: "title", label: "Title" },
                    { id: "message", label: "Message" },
                    { id: "subtitle", label: "Subtitle" },
                    { id: "ttl", label: "TTL" },
                    { id: "created_at_formatted", label: "Created At" },

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
                    sx={{
                      position: "sticky",
                      right: 0,
                      zIndex: 100,
                    }}
                  >
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow hover key={row.id}>

                    {/* S.No. */}
                    <TableCell>
                      {(page - 1) * rowsPerPage + index + 1}
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>{row.title}</Typography>
                    </TableCell>

                    <TableCell>{row.message}</TableCell>
                    <TableCell>{row.subtitle}</TableCell>
                    <TableCell>{row.ttl}</TableCell>
                    <TableCell>{row.created_at_formatted}</TableCell>

                    <TableCell onClick={() => handleActive(row)} style={{ cursor: 'pointer' }}>
                      <Chip

                        label={row.status_text}
                        color={row.status === 1 ? "primary" : "error"}
                        size="small"
                        sx={{ fontWeight: 600, textTransform: "capitalize" }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        position: "sticky",
                        right: 0,
                        zIndex: 10,
                      }}
                    >
                      <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                        <MoreVertical24Filled />
                      </IconButton>
                    </TableCell>

                  </TableRow>
                ))}

                {tableData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box py={3} sx={{ textAlign: "center" }}>
                        <Typography>No Results Found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>

          {/* PAGINATION */}
          {/* Pagination Footer */}
          <Grid container sx={{ my: 1 }}>
            <Grid
              sx={{ ml: "auto" }}
              size={{
                xs: 12,
                sm: "auto"
              }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Rows per page */}
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
                    sx={{
                      minWidth: 70,
                      height: 32,
                      fontSize: "0.875rem",
                    }}
                  >
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={200}>200</MenuItem>
                  </Select>
                </Box>

                {/* Pagination */}
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
        </>
      )}
      {/* ---------- ACTION MENU ---------- */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >


        <MenuItem
          onClick={() => {
            handleMenuClose();
            console.log("View", selectedRow);
            setViewData(selectedRow);
            setOpenView(true);
          }}
        >
          View
        </MenuItem>

        <MenuItem
          onClick={() => {
            setEditData(selectedRow); setOpenDrawer(true);
            handleMenuClose();

          }}
        >
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleMenuClose();
            console.log("Delete", selectedRow);
            DeleteTrigger(selectedRow);
          }}
          sx={{ color: "red", fontWeight: 600 }}
        >
          Delete
        </MenuItem>
      </Menu>
      <AddEditTemplateForm
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        data={editData}
        setAlert={setAlert}
        setAction={setAction}
        action={action}
      />
      <ViewNotification
        open={openView}
        onClose={() => setOpenView(false)}
        data={viewData}
      />
      <GlobalSnackbar alert={alert} setAlert={setAlert} />
    </Paper>
  );
};

export default NotificationTemplateTable;
