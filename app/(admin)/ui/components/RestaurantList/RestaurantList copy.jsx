import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Chip,
  Tooltip,
  Select,
  Snackbar,
  Alert,
  Collapse,
  Paper,
  Stack,
  InputAdornment,
  TableSortLabel,
  FormControlLabel,
  Switch,
  Autocomplete,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import { useNavigate } from "@/ui/utils/nextRouting";
import useDebounce from "../../hooks/useDebounce";
import { useCafe } from "../../context/cafeContext";
import AddRestaurant from "../AddRestaurant/AddRestaurant";
import ViewProfile from "../ViewProfile/ViewProfile";
import EditRestaurantMain from "./EditResturant/EditRestaurantMain";
import ExpandableTable from "./ExpandableTable/ExpandableTable";
import { Controller, useForm } from "react-hook-form";
import DeleteCafeDialog from "./DeleteCafeDialog";

const RestaurantList = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;

  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCafeId, setSelectedCafeId] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isUnclaimed, setIsUnclaimed] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCafeId, setCurrentCafeId] = useState(null);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const { setCafeIdContext } = useCafe();

  const StyledTableContainer = styled(TableContainer)({
    flex: 1,
    height: "calc(89vh - 136px)",
    overflowY: "auto",
    overflowX: "auto",
  });

  const tableCellStyle = {
    fontSize: "0.75rem",
    padding: "1.2vh 1.8vh",
    borderBottom: "none",
  };

  const Container = styled(Box)({
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    flexDirection: "column",
    flexGrow: 1,
  });

  // 🔥 UPDATED COLUMNS — merged UID + Name
  const restaurantAvailableColumns = [
    { key: "sn", label: "S. No", alwaysVisible: true },

    // 🔥 UPDATED: merged Restaurant ID + Name
    { key: "cafe_name", label: "Restaurant ID + Name", alwaysVisible: true },
    { key: "city_name", label: "City Name", alwaysVisible: true },

    { key: "total_item", label: "Items", alwaysVisible: false },
    { key: "first_name", label: "Manager", alwaysVisible: false },
    { key: "total_order", label: "Orders", alwaysVisible: false },
    { key: "tags", label: "Tags", alwaysVisible: true },
    { key: "status", label: "Status", alwaysVisible: true },
  ];

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const [cityId, setCityId] = useState("");
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [status, setStatus] = useState(1);
  const [cityList, setCityList] = useState([]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (citySearchQuery.trim().length >= 1) {
        fetchCity();
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [citySearchQuery]);

  const fetchCity = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/v1/city-list`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: citySearchQuery },
      });
      const cityList = response.data?.data?.map((city) => ({
        value: city.city_id,
        label: city.city_name,
      }));
      setCityList(cityList || []);
    } catch (e) {
      console.error("Error during fetching cities:", e);
    }
  };

  const fetchCafes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/user/admin/generalInfoCafe`, {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          s: debouncedSearchQuery,
          is_unclaimed: isUnclaimed,
          city_id: cityId || undefined,
          status,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data?.data || [];
      setCafes(data);
      setPagination((prev) => ({ ...prev, total: response.data?.data?.total || 0 }));
    } catch (error) {
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
  }, [debouncedSearchQuery, pagination.page, pagination.limit, isUnclaimed, status, cityId]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (pagination.page !== 1) setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) =>
    setPagination((prev) => ({ ...prev, page: newPage }));

  const handleLimitChange = (event) =>
    setPagination((prev) => ({ ...prev, limit: event.target.value, page: 1 }));

  const handleMenuClick = (event, cafeId, cafeData) => {
    setCurrentCafeId(cafeId);
    setFormData(cafeData);
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: buttonRect.bottom, left: buttonRect.right - 20 });
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentCafeId(null);
  };

  const handleViewProfile = (cafeId) => {
    setSelectedCafeId(cafeId);
    handleMenuClose();
  };

  const handleEditProfile = (cafe) => {
    setFormData(cafe);
    setShowEditProfile(true);
    handleMenuClose();
  };

  const tableContainerRef = useRef(null);

  const handleRowExpand = (cafe) => {
    if (!tableContainerRef.current) return;
    const scrollTop = tableContainerRef.current.scrollTop;
    setExpandedRow((prev) => (prev === cafe.id ? null : cafe.id));

    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = scrollTop;
      }
    }, 0);
  };

  const handleStatusClick = async (cafe, event) => {
    event.stopPropagation();
    try {
      const { data } = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${cafe.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cafeData = data?.data?.[0];
      const updatedStatus = cafe.status === 1 ? 0 : 1;

      const payload = {
        ...cafeData,
        status: updatedStatus,
      };

      await axios.post(
        `${baseUrl}/api/user/admin/restaurant-edit-general-information/${cafe.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCafes();
      setSnackbar({ open: true, message: "Status updated!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
    }
  };

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";

    const sorted = [...cafes].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];

      if (valA === null || valA === undefined) valA = "";
      if (valB === null || valB === undefined) valB = "";

      if (typeof valA === "object") valA = JSON.stringify(valA);
      if (typeof valB === "object") valB = JSON.stringify(valB);

      if (!isNaN(valA) && !isNaN(valB)) {
        return direction === "asc" ? valA - valB : valB - valA;
      }

      valA = String(valA);
      valB = String(valB);

      return direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });

    setSortConfig({ key, direction });
    setCafes(sorted);
  };
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  const { control, handleSubmit, formState: { errors } } = useForm();
 const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
 const [deletedCafe, setDeletedCafe] = useState({});
  return (
    <Box paddingTop={2}>
      <Paper>
        {selectedCafeId ? (
          <ViewProfile cafe_list_id={selectedCafeId} onClose={() => setSelectedCafeId(null)} />
        ) : showAddRestaurant ? (
          <AddRestaurant
            onClose={() => setShowAddRestaurant(false)}
            onSuccess={() => {
              setShowAddRestaurant(false);
              setSnackbar({ open: true, message: "Restaurant added!", severity: "success" });
            }}
          />
        ) : showEditProfile ? (
          setCafeIdContext(formData.id),
          <EditRestaurantMain
            cafeId={formData.id}
            onClose={() => setShowEditProfile(false)}
            onSuccess={() =>
              setSnackbar({ open: true, message: "Profile updated!", severity: "success" })
            }
          />
        ) : (
          <>
            {/* Top Filters */}
            <Grid container spacing={1} justifyContent="space-between" alignItems="center">
              <Grid
                size={{
                  xs: 12,
                  sm: 12,
                  md: 8
                }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, pl: 1, mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    Restaurants
                  </Typography>

                  <TextField
                    onChange={handleSearchChange}
                    label="Search"
                    variant="outlined"
                    size="small"
                    placeholder="Search..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 250 }}
                  />

                  <Controller
                    name="city"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        options={cityList}
                        getOptionLabel={(option) => option.label || ""}
                        isOptionEqualToValue={(option, value) => option.value === value?.value}
                        value={value || null}
                        onChange={(_, newValue) => {
                          onChange(newValue);
                          setCityId(newValue ? newValue.value : "");
                        }}
                        onInputChange={(_, newInputValue) => {
                          setCityList([]);
                          setCitySearchQuery(newInputValue);
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option.value}>
                            {option.label}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select City"
                            size="small"
                            margin="dense"
                            error={!!errors.city}
                            helperText={errors.city?.message}
                            sx={{ width: 150 }}
                          />
                        )}
                      />
                    )}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={status === 1}
                        onChange={(e) => setStatus(e.target.checked ? 1 : 0)}
                        color="primary"
                      />
                    }
                    label={"Status"}
                  />
                </Box>
              </Grid>

              <Grid
                textAlign={{ xs: "left", sm: "right" }}
                size={{
                  xs: 12,
                  sm: 12,
                  md: 4
                }}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setIsUnclaimed(!isUnclaimed)}
                    sx={{ borderRadius: "6px", fontSize: "0.75rem" }}
                  >
                    {isUnclaimed ? "Show Claimed" : "Show Unclaimed"}
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setShowAddRestaurant(true)}
                    sx={{ minWidth: "150px", height: "30px", borderRadius: "6px", fontSize: "0.75rem" }}
                  >
                    Add Restaurant
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
                <CircularProgress size={60} thickness={4} />
              </Box>
            ) : (
              <>
                <TableContainer ref={tableContainerRef} sx={{ maxHeight: `${screenHeight - 220}px`, overflowY: "auto" }}>
                  <Table stickyHeader sx={{ borderRadius: 1 }}>
                    <TableHead>
                      <TableRow>
                        {restaurantAvailableColumns.map((col) => (
                          <TableCell
                            key={col.key}
                            sortDirection={sortConfig.key === col.key ? sortConfig.direction : false}
                            sx={{fontSize:'10px'}}
                          >
                            <TableSortLabel
                              active={sortConfig.key === col.key}
                              direction={sortConfig.key === col.key ? sortConfig.direction : "asc"}
                              onClick={() => handleSort(col.key)}
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
                            fontSize:'10px'
                            
                          }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {cafes.map((cafe, index) => (
                        <React.Fragment key={cafe.id}>
                          <TableRow
                            sx={{ cursor: "pointer", transition: "background 0.3s ease-in-out" }}
                            onClick={() => handleRowExpand(cafe)}
                          >
                            <TableCell sx={tableCellStyle}>
                              {index + 1 + (pagination.page - 1) * pagination.limit}
                            </TableCell>

                            {/* 🔥 UPDATED: Merged ID + Name */}
                            <TableCell sx={tableCellStyle}>
                              {cafe.id} - {cafe.cafe_name}
                            </TableCell>

                            <TableCell sx={tableCellStyle}>{cafe.city_name || "-"}</TableCell>
                            <TableCell sx={tableCellStyle}>{cafe.total_item || "-"}</TableCell>
                            <TableCell sx={tableCellStyle}>
                              {`${cafe.first_name || ""} ${cafe.last_name || ""}`.trim() || "-"}
                            </TableCell>
                            <TableCell sx={tableCellStyle}>{cafe.total_order || "-"}</TableCell>

                            <TableCell sx={tableCellStyle}>
                              <Tooltip
                                title={[
                                  cafe.is_most_visited && "Most Visited",
                                  cafe.is_new_opening && "New Opening",
                                  cafe.is_featured && "Featured",
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                                arrow
                              >
                                <Chip
                                  label={`${[
                                    cafe.is_most_visited && "Most Visited",
                                    cafe.is_new_opening && "New Opening",
                                    cafe.is_featured && "Featured",
                                  ].filter(Boolean).length} Tags`}
                                  size="small"
                                  sx={{ backgroundColor: "#edf7f2", color: "#14532d" }}
                                />
                              </Tooltip>
                            </TableCell>

                            <TableCell sx={tableCellStyle} onClick={(e) => e.stopPropagation()}>
                              <Chip
                                onClick={(event) => handleStatusClick(cafe, event)}
                                label={cafe.status === 1 ? "Active" : "Inactive"}
                                size="small"
                                sx={{
                                  backgroundColor: cafe.status === 1 ? "#edf7f2" : "#fdecea",
                                  color: cafe.status === 1 ? "#14532d" : "#b71c1c",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  "&:hover": { opacity: 0.8 },
                                }}
                              />
                            </TableCell>

                            <TableCell
                              sx={{
                                ...tableCellStyle,
                                position: "sticky",
                                right: 0,
                                backgroundColor: theme.palette.background.paper,
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <IconButton
                                onClick={(event) => handleMenuClick(event, cafe.id, cafe)}
                                sx={{ color: "black", "&:hover": { transform: "scale(1.2)" } }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              <Menu
                                anchorReference="anchorPosition"
                                anchorPosition={menuPosition || undefined}
                                open={Boolean(anchorEl) && currentCafeId === cafe.id}
                                onClose={handleMenuClose}
                              >
                                <MenuItem onClick={() => handleViewProfile(cafe.id)}>View Profile</MenuItem>
                                <MenuItem onClick={() => handleEditProfile(cafe)}>Edit Profile</MenuItem>
                                <MenuItem onClick={() =>{ 
                                  setDeletedCafe(cafe);
                                  setOpenDeleteDialog(cafe.id)}}>Delete Cafe</MenuItem>
                              </Menu>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell colSpan={10} sx={{ p: 0 }}>
                              <Collapse in={expandedRow === cafe.id} timeout="auto" unmountOnExit>
                                <ExpandableTable cafeId={cafe.id} />
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Grid container alignItems="center" sx={{ px: 2, py: 1 }}>
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
                          value={pagination.limit}
                          onChange={handleLimitChange}
                          sx={{ minWidth: 70, height: 32 }}
                        >
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                          <MenuItem value={200}>200</MenuItem>
                        </Select>
                      </Box>

                      <Pagination
                        count={Math.ceil(pagination.total / pagination.limit)}
                        page={pagination.page}
                        onChange={handlePageChange}
                        shape="rounded"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </>
            )}
          </>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
      <DeleteCafeDialog
      cafe={deletedCafe}
      open={openDeleteDialog}
      setOpen={setOpenDeleteDialog}
    />
    </Box>
  );
};

export default RestaurantList;
