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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  TextField,
} from "@mui/material";

import { MoreVertical24Filled } from "@fluentui/react-icons";
import instanceV1 from "../../../restaurant/authaxios";
import AddEdiTriggerForm from "./AddEdiTriggerForm";
import ViewNotification from "./ViewNotification";
import GlobalSnackbar from "../../../utils/GlobalSnackbar";
import BarChartIcon from "@mui/icons-material/BarChart";
import CampaignAnalyticsDrawer from "./CampaignAnalyticsDrawer";
import { formatUTCToLocal, FormattedDate } from "../../../utils/timeUtils";

const NotificationTriggerTable = ({ searchTerm = "", action, setAction }) => {
  // Status mapping
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

  const statusMapping = {
    1: "Active",
    0: "Inactive",
  };
  const [editData, setEditData] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const [data, setData] = useState([]);
  const [viewData, setViewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openAnalytics, setOpenAnalytics] = useState(false);
  const [analyticsCampaignId, setAnalyticsCampaignId] = useState(null);

  // Schedule states
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    isScheduled: false,
    scheduleDateTime: "",
    selectedRow: null,
  });

  // Sorting
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("title");

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const formatDateTimeToUTC = (dateTimeValue) => {
    if (!dateTimeValue) return null;

    const date = new Date(dateTimeValue);

    if (Number.isNaN(date.getTime())) return null;

    const pad = (value) => String(value).padStart(2, "0");

    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
  };

  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // ---------------- GET API ----------------
  const fetchTriggers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const api = instanceV1(token);

      const res = await api.get(
        `/api/admin/notification/v1/triggers?page=${page}&limit=${rowsPerPage}`
      );

      const list = res.data?.data || [];
      console.log('listlistlistlistlist',list)

      const formatted = list.map((row) => ({
        ...row,
        status_text: statusMapping[row.status] || "Inactive",
        condition_full: `${row.condition_title}: ${row.estimated_users}1`,
      }));

      setData(formatted);
      setTotalPages(res.data?.last_page || 1);
      setError(null);
    } catch (err) {
      setError("Failed to load triggers");

      // ⚡ UPDATED: show alert on API failure
      setAlert({
        open: true,
        message: "Failed to load triggers",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const mergeUpdatedRows = (oldData, apiData, statusMapping) => {
    const oldMap = new Map(oldData.map(item => [item.id, item]));

    // Apply formatting to NEW data before comparing
    const formattedNewData = apiData.map(item => ({
      ...item,
      status_text: statusMapping[item.status] || "Inactive",
      condition_full: `${item.condition_title}: ${item.estimated_users}`,
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
      `/api/admin/notification/campaign/v1/campaigns?page=${page}&limit=${rowsPerPage}`
    );
    setTotalPages(res.data?.last_page || 1);


    const list = res.data?.data || [];
    const newdata = mergeUpdatedRows(data, list, statusMapping);

    setData(newdata);

  }


  useEffect(() => {
    // fetchTriggers();
    fetch()

  }, [page, rowsPerPage, action]);

  // ---------------- SORTING ----------------
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

  // ---------------- FILTER ----------------
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

  const sendTrigger = async (row, isScheduled = false, scheduleDateTime = null) => {
    console.log("Sending notification for row:", row);

    try {
      const token = localStorage.getItem("authToken");
      const api2 = instanceV1(token);

      // Build payload based on schedule
      const payload = {
        trigger_id: row.id
      };

      if (isScheduled && scheduleDateTime) {
        payload.schedule_time = scheduleDateTime;
      }

      const res = await api2.post(`/api/admin/notification/v1/push`, payload);

      console.log("res:", res);

      // SUCCESS
      if (res.status === 201) {
        setAlert({
          open: true,
          message: res.data?.msg || "Notification sent successfully",
          severity: "success",
        });
        
        // Reset schedule dialog
        setScheduleData({
          isScheduled: false,
          scheduleDateTime: "",
          selectedRow: null,
        });
        setOpenScheduleDialog(false);
      }

    } catch (error) {
      console.error("Error sending notification:", error);

      // ERROR HANDLING
      setAlert({
        open: true,
        message:
          error.response?.data?.msg ||
          error.message ||
          "Failed to send notification",
        severity: "error",
      });
    }
  };

  const handleOpenSendDialog = (row) => {
    setScheduleData({
      isScheduled: false,
      scheduleDateTime: "",
      selectedRow: row,
    });
    setOpenScheduleDialog(true);
  };

  const handleScheduleDialogSubmit = () => {
    if (!scheduleData.selectedRow) return;

    // Validate schedule time if scheduled
    if (scheduleData.isScheduled && !scheduleData.scheduleDateTime) {
      setAlert({
        open: true,
        message: "Please select a schedule date and time",
        severity: "error",
      });
      return;
    }

    const formattedDateTime = formatDateTimeToUTC(scheduleData.scheduleDateTime);

    sendTrigger(
      scheduleData.selectedRow,
      scheduleData.isScheduled,
      formattedDateTime
    );
  };
  const DeleteTrigger = async (row) => {
    try {
      const token = localStorage.getItem("authToken");
      const api2 = instanceV1(token);

      const res = await api2.delete(`/api/admin/notification/v1/trigger/${row.id}`);

      if (res.status === 200) {
        setAlert({
          open: true,
          message: res.data?.msg || "Trigger deleted successfully",
          severity: "success",
        });

        // Refresh table
        fetchTriggers();
      }

    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.msg || "Failed to delete trigger",
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
        `/api/admin/notification/v1/trigger/${selectedRow.id}`,
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
      {!loading && !error && (
        <>
          {/* TABLE */}
          <TableContainer sx={{ maxHeight: `${screenHeight - 250}px`, overflowY: "auto" }}>
            <Table dense stickyHeader size="small">

              {/* ---------- TABLE HEADER ---------- */}
              <TableHead
                sx={{
                  textTransform: "uppercase",
                  backgroundColor: "#f7faf7",
                }}
              >
                <TableRow>
                  <TableCell>S.No.</TableCell>

                  {[
                    { id: "title", label: "Campaign Title" },
                    { id: "template_title", label: "Template ID" },
                    { id: "start_time", label: "Campaign Start At" },
                    { id: "clicked_count", label: "Clicked Count" },
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

                  {/* Sticky Action Column */}
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

              {/* ---------- TABLE BODY ---------- */}
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={row.id} hover>

                    {/* S.No. */}
                    <TableCell>
                      {(page - 1) * rowsPerPage + index + 1}
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>{row.title}</Typography>
                    </TableCell>

                    <TableCell>{row.template_title || row.template_id || "-"}</TableCell>

                    <TableCell>
                      {row.start_time
                        ? <FormattedDate value={row.start_time} />
                        : "Immediate"}
                    </TableCell>

                    <TableCell>
                      {row.clicked_count ?? 0}
                    </TableCell>

                    <TableCell
                      onClick={() => handleActive(row)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Chip
                        label={row.status_text}
                        color={row.status === 1 ? "primary" : "error"}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>

                    {/* ACTION BUTTON - Sticky */}
                    <TableCell
                      sx={{
                        position: "sticky",
                        right: 0,
                        zIndex: 10,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          setAnalyticsCampaignId(row.id);
                          setOpenAnalytics(true);
                        }}
                        title="Campaign Analytics"
                      >
                        <BarChartIcon />
                      </IconButton>
                      <IconButton onClick={(e) => handleMenuOpen(e, row)}>
                        <MoreVertical24Filled />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {tableData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Box py={3} sx={{ textAlign: "center" }}>
                        <Typography>No Results Found</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>

          {/* ---------- PAGINATION BAR ---------- */}
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
                    <MenuItem value={50}>50</MenuItem>
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
        {/* <MenuItem
          onClick={() => {
            handleMenuClose();
            console.log("Send", selectedRow);
            handleOpenSendDialog(selectedRow)
          }}
        >
          Send
        </MenuItem> */}

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
      <AddEdiTriggerForm
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        data={editData}
        setAction={setAction}
        action={action}
        setAlert={setAlert}
      />
      <ViewNotification
        setAlert={setAlert}

        open={openView}
        onClose={() => setOpenView(false)}
        data={viewData}
      />
      <CampaignAnalyticsDrawer
        open={openAnalytics}
        onClose={() => setOpenAnalytics(false)}
        campaignId={analyticsCampaignId}
      />
      <GlobalSnackbar alert={alert} setAlert={setAlert} />
      {/* Schedule Notification Dialog */}
      <Dialog
        open={openScheduleDialog}
        onClose={() => setOpenScheduleDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Send Notification
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Schedule Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={scheduleData.isScheduled}
                  onChange={(e) =>
                    setScheduleData({
                      ...scheduleData,
                      isScheduled: e.target.checked,
                    })
                  }
                />
              }
              label="Schedule this notification"
            />

            {/* Date Time Picker - Show only if scheduled */}
            {scheduleData.isScheduled && (
              <TextField
                label="Schedule Date & Time"
                type="datetime-local"
                value={scheduleData.scheduleDateTime}
                onChange={(e) =>
                  setScheduleData({
                    ...scheduleData,
                    scheduleDateTime: e.target.value,
                  })
                }
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                inputProps={{
                  step: 1, // Allow seconds
                }}
              />
            )}

            {/* Info message */}
            <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
              {scheduleData.isScheduled
                ? "Select a date and time to schedule this notification for later delivery"
                : "The notification will be sent immediately"}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenScheduleDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleScheduleDialogSubmit}
            variant="contained"
            color="primary"
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default NotificationTriggerTable;
