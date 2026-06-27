  import React, { useEffect, useState, useRef } from "react";
  import {
    Box,
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
    SwipeableDrawer,
  } from "@mui/material";
  import { useTheme } from "@mui/system";
  import { useMediaQuery } from "@mui/material";
  import SearchIcon from "@mui/icons-material/Search";
  import FilterAltIcon from "@mui/icons-material/FilterAlt";
  import MoreVertIcon from "@mui/icons-material/MoreVert";
  import axios from "axios";
  import { useNavigate } from "@/ui/utils/nextRouting";
  import useDebounce from "../../hooks/useDebounce";
  import ViewProfile from "../ViewProfile/ViewProfile";
  import EditRestaurantMain from "./EditResturant/EditRestaurantMain";
  import ExpandableTable from "./ExpandableTable/ExpandableTable";
  import DeleteCafeDialog from "./DeleteCafeDialog";

  const columns = [
    { key: "sn", label: "S. No" },
    { key: "cafe_name", label: "Restaurant ID + Name" },
    { key: "city_name", label: "City Name" },
    { key: "total_item", label: "Items" },
    { key: "first_name", label: "Manager" },
    { key: "total_order", label: "Orders" },
    { key: "tags", label: "Tags" },
    { key: "status", label: "Status" },
  ];

  const RestaurantList = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");
    const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;

    /* ================= STATE ================= */

    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(true);

    // search
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);

    // filters (AJIO style)
    const [draftFilters, setDraftFilters] = useState({
      city: null,
      status: null,
      isUnclaimed: null,
    });

    const [appliedFilters, setAppliedFilters] = useState({});

    // city search
    const [citySearch, setCitySearch] = useState("");
    const [cityList, setCityList] = useState([]);

    // pagination
    const [pagination, setPagination] = useState({
      page: 1,
      limit: 50,
      total: 0,
    });

    // sorting
    const [sortConfig, setSortConfig] = useState({
      key: null,
      direction: "asc",
    });

    // UI
    const [expandedRow, setExpandedRow] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [currentCafe, setCurrentCafe] = useState(null);
    const [viewCafeId, setViewCafeId] = useState(null);
    const [editCafe, setEditCafe] = useState(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success",
    });

    const tableRef = useRef(null);

    /* ================= FETCH CITY ================= */

    useEffect(() => {
      if (!citySearch) return;

      const t = setTimeout(async () => {
        const res = await axios.get(`${baseUrl}/api/v1/city-list`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: citySearch },
        });

        setCityList(
          res.data?.data?.map((c) => ({
            value: c.city_id,
            label: c.city_name,
          })) || []
        );
      }, 400);

      return () => clearTimeout(t);
    }, [citySearch]);

    /* ================= FETCH CAFES ================= */

    const fetchCafes = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          `${baseUrl}/api/user/admin/generalInfoCafe`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              page: pagination.page,
              limit: pagination.limit,
              s: debouncedSearch || undefined,
              city_id: appliedFilters.city?.value,
              status: appliedFilters.status,
              is_unclaimed: appliedFilters.isUnclaimed,
            },
          }
        );

        setCafes(res.data?.data?.data || []);
        setPagination((p) => ({
          ...p,
          total: res.data?.data?.total || 0,
        }));
      } catch (e) {
        if (e.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchCafes();
    }, [
      debouncedSearch,
      appliedFilters,
      pagination.page,
      pagination.limit,
    ]);

    /* ================= SORT ================= */

    const handleSort = (key) => {
      const direction =
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc";

      const sorted = [...cafes].sort((a, b) => {
        let A = a[key] ?? "";
        let B = b[key] ?? "";
        if (!isNaN(A) && !isNaN(B))
          return direction === "asc" ? A - B : B - A;
        return direction === "asc"
          ? String(A).localeCompare(String(B))
          : String(B).localeCompare(String(A));
      });

      setSortConfig({ key, direction });
      setCafes(sorted);
    };

    /* ================= STATUS TOGGLE ================= */

    const handleStatusToggle = async (cafe, event) => {
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

    /* ================= EXPAND ================= */

    const handleExpand = (id) => {
      const scroll = tableRef.current?.scrollTop;
      setExpandedRow((p) => (p === id ? null : id));
      setTimeout(() => {
        if (tableRef.current) tableRef.current.scrollTop = scroll;
      }, 0);
    };

    /* ================= CONDITIONAL ================= */

    if (viewCafeId)
      return (
        <ViewProfile
          cafe_list_id={viewCafeId}
          onClose={() => setViewCafeId(null)}
        />
      );

    if (editCafe)
      return (
        <EditRestaurantMain
          cafeId={editCafe.id}
          onClose={() => setEditCafe(null)}
        />
      );

    /* ================= UI ================= */

    return (
      <Paper sx={{ p: 2 }}>
        {/* SEARCH */}
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search restaurants..."
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={() => setOpenDrawer(true)}>
            <FilterAltIcon />
          </IconButton>
        </Box>

        {/* FILTER CHIPS */}
        {Object.keys(appliedFilters).length > 0 && (
          <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
            {appliedFilters.city && (
              <Chip
                label={`City: ${appliedFilters.city.label}`}
                onDelete={() =>
                  setAppliedFilters((p) => ({ ...p, city: null }))
                }
              />
            )}

            {appliedFilters.status !== null && (
              <Chip
                label={appliedFilters.status ? "Active" : "Inactive"}
                onDelete={() =>
                  setAppliedFilters((p) => ({ ...p, status: null }))
                }
              />
            )}

            {appliedFilters.isUnclaimed !== null && (
              <Chip
                label={appliedFilters.isUnclaimed ? "Unclaimed" : "Claimed"}
                onDelete={() =>
                  setAppliedFilters((p) => ({ ...p, isUnclaimed: null }))
                }
              />
            )}

            <Button
              size="small"
              color="error"
              onClick={() => setAppliedFilters({})}
            >
              Clear All
            </Button>
          </Stack>
        )}

        {/* TABLE */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", height: "60vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer ref={tableRef} sx={{ maxHeight: "70vh" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      <TableSortLabel
                        active={sortConfig.key === c.key}
                        direction={sortConfig.direction}
                        onClick={() => handleSort(c.key)}
                      >
                        {c.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {cafes.map((cafe, i) => (
                  <React.Fragment key={cafe.id}>
                    <TableRow hover onClick={() => handleExpand(cafe.id)}>
                      <TableCell>
                        {i + 1 + (pagination.page - 1) * pagination.limit}
                      </TableCell>
                      <TableCell>
                        {cafe.id} - {cafe.cafe_name}
                      </TableCell>
                      <TableCell>{cafe.city_name || "-"}</TableCell>
                      <TableCell>{cafe.total_item || "-"}</TableCell>
                      <TableCell>
                        {`${cafe.first_name || ""} ${cafe.last_name || ""}` ||
                          "-"}
                      </TableCell>
                      <TableCell>{cafe.total_order || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${[
                            cafe.is_most_visited && "Most Visited",
                            cafe.is_new_opening && "New Opening",
                            cafe.is_featured && "Featured",
                          ].filter(Boolean).length} Tags`}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={cafe.status ? "Active" : "Inactive"}
                          onClick={(e) => handleStatusToggle(cafe, e)}
                          sx={{ cursor: "pointer" }}
                        />
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setCurrentCafe(cafe);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                  <TableRow>
  <TableCell colSpan={10} sx={{ p: 0 }}>
    <Collapse
      in={expandedRow === cafe.id}
      timeout="auto"
      unmountOnExit
    >
      {expandedRow === cafe.id && (
        <ExpandableTable cafeId={cafe.id} />
      )}
    </Collapse>
  </TableCell>
</TableRow>

                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* PAGINATION */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
          <Select
            size="small"
            value={pagination.limit}
            onChange={(e) =>
              setPagination((p) => ({ ...p, limit: e.target.value, page: 1 }))
            }
          >
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={200}>200</MenuItem>
          </Select>

          <Pagination
            page={pagination.page}
            count={Math.ceil(pagination.total / pagination.limit)}
            onChange={(_, page) =>
              setPagination((p) => ({ ...p, page }))
            }
          />
        </Box>

        {/* MENU */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => setViewCafeId(currentCafe.id)}>View Profile</MenuItem>
          <MenuItem onClick={() => setEditCafe(currentCafe)}>Edit Profile</MenuItem>
          <MenuItem
            onClick={() => {
              setOpenDeleteDialog(true);
              setAnchorEl(null);
            }}
          >
            Delete Cafe
          </MenuItem>
        </Menu>

        {/* FILTER DRAWER */}
      <SwipeableDrawer
    anchor="bottom"
    open={openDrawer}
    onClose={() => setOpenDrawer(false)}
    onOpen={() => {}}

    /* 🔴 REQUIRED FIXES */
    disableSwipeToOpen
    keepMounted={false}
    ModalProps={{ keepMounted: false }}

    /* ✅ STYLE THE ACTUAL DRAWER */
    PaperProps={{
      sx: {
        width: '100%',
        maxWidth: '100%',
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 0,
        m:0
      },
    }}
  >
    <Box
  sx={{
    width: "100%",
    height: "10px",
    bgcolor: "divider",
    my: 1.5,
  }}
/>


          <Box sx={{ p: 2 }}>
            <Typography variant="h6" mb={1}>
              Filters
            </Typography>

            <Autocomplete
              options={cityList}
              value={draftFilters.city}
              onInputChange={(_, v) => setCitySearch(v)}
              onChange={(_, v) =>
                setDraftFilters((p) => ({ ...p, city: v }))
              }
              renderInput={(p) => <TextField {...p} label="City" />}
            />

           <Select
  fullWidth
  size="small"
  value={draftFilters.status ?? "all"}
  onChange={(e) =>
    setDraftFilters((p) => ({
      ...p,
      status: e.target.value === "all" ? null : Number(e.target.value),
    }))
  }
>
  <MenuItem value="all">All</MenuItem>
  <MenuItem value={1}>Active</MenuItem>
  <MenuItem value={0}>Inactive</MenuItem>
</Select>


         <Select
  fullWidth
  size="small"
  value={
    draftFilters.isUnclaimed === null
      ? "all"
      : draftFilters.isUnclaimed
      ? "unclaimed"
      : "claimed"
  }
  onChange={(e) =>
    setDraftFilters((p) => ({
      ...p,
      isUnclaimed:
        e.target.value === "all"
          ? null
          : e.target.value === "unclaimed",
    }))
  }
>
  <MenuItem value="all">All</MenuItem>
  <MenuItem value="claimed">Claimed</MenuItem>
  <MenuItem value="unclaimed">Unclaimed</MenuItem>
</Select>


            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="outlined"
                onClick={() => setDraftFilters({})}
              >
                Reset
              </Button>

              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setAppliedFilters(draftFilters);
                  setOpenDrawer(false);
                }}
              >
                Apply Filters
              </Button>
            </Stack>
          </Box>
        </SwipeableDrawer>

        <DeleteCafeDialog
          cafe={currentCafe}
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}

        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
    );
  };

  export default RestaurantList;
