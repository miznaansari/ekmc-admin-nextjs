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
import { getTimeDifference, formatUTCToLocal, FormattedDate } from "../../utils/timeUtils";
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
  2: { label: "Active", color: "primary" },
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

  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <Paper sx={{ width: "100%", overflow: "hidden", mt: 1, p: 1, pb: 0 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            minHeight: 48,
          }}
        >
          {/* LEFT */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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

            <FormControl size="small" sx={{ width: "120px" }}>
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

          {/* RIGHT */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {(userRole === "1" || hasWriteAccess) && (
              <Button variant="contained" onClick={openRecommendationDialog}>
                Add Recommendation
              </Button>
            )}
          </Box>
        </Box>

        {/* Table */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: `${screenHeight - 250}px`, overflowY: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead
                sx={{
                  textTransform: "uppercase",
                  backgroundColor: "#f7faf7",
                  color: "#768DA9",
                }}
              >
                <TableRow>
                  <TableCell>S.NO.</TableCell>
                  <TableCell>TITLE</TableCell>
                  <TableCell>AUTHOR</TableCell>
                  <TableCell>TAGGED</TableCell>
                  <TableCell>DATED</TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "impressions"}
                      direction={sortOrder}
                      onClick={() => handleSort("impressions")}
                    >
                      IMPRESSIONS
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "views"}
                      direction={sortOrder}
                      onClick={() => handleSort("views")}
                    >
                      VIEWS
                    </TableSortLabel>
                  </TableCell>

                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "shares"}
                      direction={sortOrder}
                      onClick={() => handleSort("shares")}
                    >
                      SHARES
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>VALID TILL</TableCell>

                  <TableCell>STATUS</TableCell>
                  <TableCell>IS TEST</TableCell>
                  <TableCell>ACTION</TableCell>
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
                      <FormattedDate value={r.created_at} />
                    </TableCell>
                    <TableCell >
                      {r.impression_count}
                    </TableCell>
                    <TableCell >{r.views}</TableCell>
                    <TableCell >{r.shares}</TableCell>
                    <TableCell >
                      <FormattedDate value={r.created_at} addDays={r.validity_in_days} />
                    </TableCell>
                    <TableCell >
                      <Chip
                        size="small"
                        label={statusMap[r.status]?.label}
                        color={statusMap[r.status]?.color || "default"}
                      />

                    </TableCell>
                    <TableCell>
                      {r.is_test === 1 || r.is_test === "1" ? (
                        <Chip
                          size="small"
                          label="Test"
                          color="error"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          size="small"
                          label="Prod"
                          color="success"
                          variant="outlined"
                        />
                      )}
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
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
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

        <Drawer
          disableEnforceFocus anchor="right"
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
