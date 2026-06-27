import { display, Grid } from "@mui/system";
import React, { useContext, useEffect, useState } from "react";
import { styled, useTheme } from "@mui/system";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  TableContainer,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
  InputAdornment,
  CssBaseline,
  Paper,
  Drawer,
  useMediaQuery,
  Pagination,
  TableSortLabel,
  IconButton
} from "@mui/material";

import mapAdminAccess from "../../mapAdminAccess.json";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import AddRecommendation from "./AddRecomendation";
import EditRecommendation from "./EditRecomendation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import { getTimeDifference } from "../../utils/timeUtils";
import { MoreVertical24Filled } from "@fluentui/react-icons";
import { DrawerContext } from "../../context/DrawerContext";
import { useLocation } from "@/ui/utils/nextRouting";

dayjs.extend(utc);
dayjs.extend(duration);


const tableHeaderCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  color: "#000",
  backgroundColor: "white",
  borderBottom: "none", p: 0
};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  color: "#000",
  backgroundColor: "white",
};

const statusMap = {
  1: { label: "In Review", color: "warning" },
  2: { label: "Active", color: "success" },
  3: { label: "Expired", color: "error" },
};

const Recomendation = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [Recommendations, setRecommendations] = useState([]);
  const [limit, setLimit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const token = localStorage.getItem("authToken");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);
  const [drawerTitle, setDrawerTitle] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const { drawerOpenL } = useContext(DrawerContext);

  // SORTING
  const [sortBy, setSortBy] = useState("impressions");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(column);
    setPage(1);
  };

  useEffect(() => {
    FetchRecomendations();
  }, [limit, page, searchQuery, status, sortBy, sortOrder]);

  const FetchRecomendations = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/api/myeats/v1/recommendations`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchQuery,
            limits: limit,
            page_no: page,
            status: status,
            sort_by: sortBy,
            sort_order: sortOrder,
          },
        }
      );

      setRecommendations(res.data.records);
      setTotalPages(res.data.total_pages);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const openRecommendationDialog = () => {
    setDrawerOpen(true);
    setDrawerTitle("Add Recommendation");
    setDrawerContent(
      <AddRecommendation
        onSuccess={() => {
          setDrawerOpen(false);
          setSnackbarOpen(true);
          setSnackbarMessage("Recommendation added successfully!");
          FetchRecomendations();
        }}
        onCancel={() => setDrawerOpen(false)}
      />
    );
  };

  const openEditRecommendationDialog = (rec) => {
    setDrawerOpen(true);
    setDrawerTitle("Edit Recommendation");
    setDrawerContent(
      <EditRecommendation
        id={rec.id}
        onSuccess={() => {
          setDrawerOpen(false);
          setSnackbarOpen(true);
          setSnackbarMessage("Recommendation updated!");
          FetchRecomendations();
        }}
        onCancel={() => setDrawerOpen(false)}
      />
    );
  };

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const location = useLocation();
  const locationName = location.pathname;
  const pathName = mapAdminAccess.filter((a) => a.path === locationName);
  const basePermission = pathName?.[0]?.permission || "";
  const userRole = localStorage.getItem("userRole") || "";
  const writePermission = basePermission.replace(/-read$/, "-write");
  const accessMember =
    JSON.parse(localStorage.getItem("user_permission")) || [];
  const checkAccess = accessMember.filter(
    (a) => a?.permission_name === writePermission
  );
  const hasWriteAccess = checkAccess[0]?.status === 1;

  return (
    <Box paddingTop={2}>
      <CssBaseline />
      <Paper>
        {/* Header */}
        <Grid container spacing={1} justifyContent="space-between">
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Box sx={{ display: "flex", alignItems: "center", p: 2, gap: 2 }}>
              <Typography variant="h6">Recommendation</Typography>
              <TextField
                size="small"
                label="Search"
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="small" sx={{ width: '100px' }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="1">In Review</MenuItem>
                  <MenuItem value="2">Approved</MenuItem>
                  <MenuItem value="3">Expired</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>

          <Grid>
            {(userRole === "1" || hasWriteAccess) && (
              <Button variant="contained" onClick={openRecommendationDialog}>
                ADD RECOMMENDATION
              </Button>
            )}
          </Grid>
        </Grid>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: "70vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }} >S.NO.</TableCell>
                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }}>TITLE</TableCell>
                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }}>AUTHOR</TableCell>
                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }}>TAGGED</TableCell>
                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }}>DATED</TableCell>

                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }}>
                    <TableSortLabel
                      active={sortBy === "impressions"}
                      direction={sortOrder}
                      onClick={() => handleSort("impressions")}
                    >
                      IMPRESSIONS
                    </TableSortLabel>
                  </TableCell>

                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }}>
                    <TableSortLabel
                      active={sortBy === "views"}
                      direction={sortOrder}
                      onClick={() => handleSort("views")}
                    >
                      VIEWS
                    </TableSortLabel>
                  </TableCell>

                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }}>
                    <TableSortLabel
                      active={sortBy === "shares"}
                      direction={sortOrder}
                      onClick={() => handleSort("shares")}
                    >
                      SHARES
                    </TableSortLabel>
                  </TableCell>

                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }}>STATUS</TableCell>
                  <TableCell  sx={{
    "&.MuiTableCell-head": { p: 1 },
  }}>ACTION</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {Recommendations.map((r, index) => (
                  <TableRow key={r.id}>
                    <TableCell >
                      {index + 1 + (page - 1) * limit}
                    </TableCell>
                    <TableCell >{r.title}</TableCell>
                    <TableCell >
                      {r.first_name?.replace(/^\w/, c => c.toUpperCase())}{' '}
                      {r.last_name?.replace(/^\w/, c => c.toUpperCase())}

                      <Typography variant="caption" display="block" sx={{ color: 'gray' }}>
                        {r.mobile_number}
                      </Typography>
                    </TableCell>
                    <TableCell >
                      {r.cafes?.length}
                    </TableCell>
                    <TableCell >
                      {dayjs.utc(r.created_at).format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell >
                      {r.impression_count}
                    </TableCell>
                    <TableCell >{r.views}</TableCell>
                    <TableCell >{r.shares}</TableCell>
                    <TableCell >
                     <Chip
  label={statusMap[r.status]?.label}
  color={statusMap[r.status]?.color || "default"}
/>

                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => openEditRecommendationDialog(r)}
                        size="small"
                        sx={{ cursor: "pointer" }}
                      >
                        <MoreVertical24Filled />
                      </IconButton>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, v) => setPage(v)}
          />
        </Box>

        <Drawer
disableEnforceFocus          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}
        >
          {drawerContent}
        </Drawer>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert severity="success">{snackbarMessage}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Recomendation;
