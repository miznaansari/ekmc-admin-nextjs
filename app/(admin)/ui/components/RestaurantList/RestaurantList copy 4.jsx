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
  Select,
  Snackbar,
  Alert,
  Collapse,
  Paper,
  Stack,
  InputAdornment,
  TableSortLabel,
  Autocomplete,
  SwipeableDrawer,
  Tooltip,
  FormControl,
  InputLabel,
  Skeleton,
  Dialog,
} from "@mui/material";
import { useSearchParams } from "@/ui/utils/nextRouting";

import { useTheme } from "@mui/system";
import { useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EaterySearchHeader from "../v2/component/EaterySearchHeader";
import axios from "axios";
import { useNavigate } from "@/ui/utils/nextRouting";
import useDebounce from "../../hooks/useDebounce";
import ViewProfile from "../ViewProfile/ViewProfile";
import EditRestaurantMain from "./EditResturant/EditRestaurantMain";
import ExpandableTable from "./ExpandableTable/ExpandableTable";
import DeleteCafeDialog from "./DeleteCafeDialog";

/* ================= COLUMNS ================= */

const columns = [
  { key: "sn", label: "S. No" },
  { key: "cafe_name", label: "Eatery ID + Name" },
  { key: "city_name", label: "City Name" },
  { key: "total_item", label: "Items" },
  { key: "first_name", label: "Manager" },
  { key: "total_order", label: "Orders" },
  { key: "ekmc_score", label: "EKMC Score" },
  { key: "is_crawler", label: "Is Crawler" },
  { key: "tags", label: "Tags" },
  { key: "status", label: "Status" },
];

/* ================= COMPONENT ================= */

const RestaurantList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;

  /* ================= STATE ================= */

  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [draftFilters, setDraftFilters] = useState({
    city: null,
    status: null,
    isUnclaimed: null,
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  const [citySearch, setCitySearch] = useState("");
  const [cityList, setCityList] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });

  const [expandedRow, setExpandedRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);

  const [currentCafe, setCurrentCafe] = useState(null);
  const [viewCafeId, setViewCafeId] = useState(null);
  const [editCafe, setEditCafe] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const handleExpandRow = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

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
          state: c.state_name,
        })) || []
      );
    }, 400);

    return () => clearTimeout(t);
  }, [citySearch]);

  /* ================= FETCH CAFES ================= */

  const fetchCafes = async () => {
    try {
      // setLoading(true);

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
  }, [debouncedSearch, appliedFilters, pagination.page, pagination.limit]);

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
      const { data } = await axios.get(
        `${baseUrl}/api/user/admin/restaurant-all-info/${cafe.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const payload = { ...data.data[0], status: cafe.status ? 0 : 1 };

      await axios.post(
        `${baseUrl}/api/user/admin/restaurant-edit-general-information/${cafe.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchCafes();
      setSnackbar({ open: true, message: "Status updated!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
    }
  };

  /* ================= FILTER ICON ================= */

  const handleFilterClick = (e) => {
    if (isMobile) setOpenDrawer(true);
    else setFilterAnchorEl(e.currentTarget);
  };
  const [searchOpen, setSearchOpen] = useState(false);

  /* ================= CONDITIONAL ================= */


  const isFilterApplied =
    appliedFilters.city ||
    appliedFilters.status !== undefined && appliedFilters.status !== null ||
    appliedFilters.isUnclaimed !== undefined && appliedFilters.isUnclaimed !== null;
  const filterChips = [];

  if (appliedFilters.city) {
    filterChips.push({
      key: "city",
      label: `City: ${appliedFilters.city.label}`,
    });
  }

  if (appliedFilters.status !== null && appliedFilters.status !== undefined) {
    filterChips.push({
      key: "status",
      label: `Status: ${appliedFilters.status === 1 ? "Active" : "Inactive"}`,
    });
  }

  if (appliedFilters.isUnclaimed !== null && appliedFilters.isUnclaimed !== undefined) {
    filterChips.push({
      key: "isUnclaimed",
      label: `Claim: ${appliedFilters.isUnclaimed ? "Unclaimed" : "Claimed"}`,
    });
  }
  const handleClearSingleFilter = (key) => {
  // 1️⃣ Clear filter state
  setDraftFilters((prev) => ({
    ...prev,
    [key]: null,
  }));

  setAppliedFilters((prev) => ({
    ...prev,
    [key]: null,
  }));

  // 2️⃣ Update URL params correctly
  const params = new URLSearchParams(searchParams);
  params.delete(key);

  // IMPORTANT: if no params left → clear URL completely
  if ([...params.keys()].length === 0) {
    setSearchParams({});
  } else {
    setSearchParams(params);
  }

  // 3️⃣ Reset pagination
  setPagination((p) => ({ ...p, page: 1 }));
};


const isFirstRender = useRef(true);
useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }

  setPagination((p) => ({ ...p, page: 1 }));

  const params = new URLSearchParams(searchParams);
  params.set("pageNo", 1);
  setSearchParams(params);

}, [debouncedSearch]);

  /* ================= UI ================= */
  // useEffect(() => {
  //   setPagination((p) => ({ ...p, page: 1 }));
  // }, [debouncedSearch]);

  const [innerHeight, setInnerHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => setInnerHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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


  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (editCafe) {
      requestAnimationFrame(() => setDialogOpen(true));
    } else {
      setDialogOpen(false);
    }
  }, [editCafe]);
useEffect(() => {
  const cityParam = searchParams.get("city");
  const statusParam = searchParams.get("status");
  const isUnclaimedParam = searchParams.get("isUnclaimed");
  const pageParam = searchParams.get("pageNo");

  const filters = {
    city: null,
    status: null,
    isUnclaimed: null,
  };

  if (cityParam) {
    filters.city = {
      value: Number(cityParam),
      label: "",
      state: "",
    };
  }

  if (statusParam !== null) {
    filters.status = Number(statusParam);
  }

  if (isUnclaimedParam !== null) {
    filters.isUnclaimed = Number(isUnclaimedParam) === 1;
  }

  setDraftFilters(filters);
  setAppliedFilters(filters);

  // ✅ set page from URL
  if (pageParam) {
    setPagination((p) => ({
      ...p,
      page: Number(pageParam),
    }));
  }
}, []);

  return (
    <>
      <Paper sx={{ p: 2, mt: 1, pb: isMobile ? 1 : 0 }}>

        <EaterySearchHeader
          title="List Eatery"
          isMobile={isMobile}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          searchValue={search}
          onSearchChange={setSearch}
          onSearchClear={() => setSearch("")}
          onFilterClick={handleFilterClick}
          filterChips={filterChips}                 // 👈 dynamic
          onClearFilter={handleClearSingleFilter}   // 👈 dynamic
        />


        {/* TABLE */}

        <TableContainer
          ref={tableRef}
          sx={{
            maxHeight: innerHeight - (isMobile ? 230 : 230),
            position: "relative", // REQUIRED
          }}

        >
          <Table stickyHeader size="small">
            {/* TABLE HEAD ALWAYS VISIBLE */}
            <TableHead>
              <TableRow>
                {columns.map((c) => (
                  <TableCell
                    key={c.key}
                    sx={{
                      fontSize: "10px",
                      py: 0.5,
                      px: 0.5,                 // 🔹 reduce horizontal padding
                      whiteSpace: "nowrap",    // 🔹 single line
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <TableSortLabel
                      active={sortConfig.key === c.key}
                      direction={sortConfig.direction}
                      onClick={() => handleSort(c.key)}
                      sx={{
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 120,          // 🔹 control width
                        '& .MuiTableSortLabel-icon': {
                          fontSize: "12px",
                          ml: 0.25,             // 🔹 reduce icon gap
                        },
                      }}
                    >
                      {c.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell
                  align="left"
                  sx={{
                    fontSize: "12px",
                    py: 0.5,
                    px: 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            {/* TABLE BODY HANDLES LOADING */}
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow
                    key={`skeleton-${i}`}
                    sx={{
                      '& td': {
                        py: 1,          // ⬅️ increase height slightly (default ≈ 0.75)
                      },
                    }}
                  >

                    <TableCell><Skeleton width={20} /></TableCell>
                    <TableCell><Skeleton width="80%" /></TableCell>
                    <TableCell><Skeleton width="60%" /></TableCell>
                    <TableCell><Skeleton width={30} /></TableCell>
                    <TableCell><Skeleton width="70%" /></TableCell>
                    <TableCell><Skeleton width={30} /></TableCell>
                    <TableCell>
                      <Skeleton variant="rounded" width={60} height={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton variant="rounded" width={50} height={24} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton variant="circular" width={24} height={24} />
                    </TableCell>
                  </TableRow>
                ))
                : cafes.map((cafe, i) => (
                  <React.Fragment key={cafe.id}>
                    <TableRow
                      hover
                      sx={{ cursor: "pointer" }}
                    >


                      <TableCell onClick={() => handleExpandRow(cafe.id)} >
                        {i + 1 + (pagination.page - 1) * pagination.limit}
                      </TableCell>
                      <TableCell onClick={() => handleExpandRow(cafe.id)}>{cafe.id} - {cafe.cafe_name}</TableCell>
                      <TableCell onClick={() => handleExpandRow(cafe.id)}>{cafe.city_name || "-"}</TableCell>
                      <TableCell onClick={() => handleExpandRow(cafe.id)}>{cafe.total_item || "-"}</TableCell>
                      <TableCell onClick={() => handleExpandRow(cafe.id)}>{`${cafe.first_name || ""} ${cafe.last_name || ""}`}</TableCell>
                      <TableCell onClick={() => handleExpandRow(cafe.id)}>{cafe.total_order || "-"}</TableCell>
                      <TableCell onClick={() => handleExpandRow(cafe.id)}>{cafe.ekmc_score || "-"}</TableCell>

                      <TableCell onClick={() => handleExpandRow(cafe.id)}>
                        {cafe.is_crawler === 1 ? (
                          <Chip
                            label="Crawler"
                            color="info"
                            size="small"
                            variant="filled"
                          />
                        ) : (
                          <Chip
                            label="Real"
                            color="success"
                            size="small"
                            variant="filled"
                          />
                        )}
                      </TableCell>

                      <TableCell >
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
                      <TableCell  >
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
                      <TableCell align="right">
                        <IconButton onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setCurrentCafe(cafe);
                        }}>

                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={9} sx={{ p: 0 }}>
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


        {/* PAGINATION */}
        <Box
          sx={{
            position: { xs: "fixed", sm: "relative" },
            bottom: { xs: 0, sm: "auto" },
            left: 0,
            width: "100%",
            bgcolor: "#fff",
            borderTop: { xs: "1px solid #e0e0e0", sm: "none" },
            zIndex: 1200,
            px: 1,
            py: 1,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
            {/* ❌ Hide menu on mobile */}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              Rows per page:{" "}
              <Select
                size="small"
                value={pagination.limit}
                 onChange={(_, page) => {
    setPagination((p) => ({ ...p, page }));

    // ✅ update URL params
    const params = new URLSearchParams(searchParams);
    params.set("pageNo", page);
    setSearchParams(params);
  }}
                sx={{ width: 70 }}
              >
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={200}>200</MenuItem>
              </Select>
            </Box>

            <Pagination
              page={pagination.page}
              count={Math.ceil(pagination.total / pagination.limit)}
         onChange={(_, page) => {
    setPagination((p) => ({ ...p, page }));

    const params = new URLSearchParams(searchParams);
    params.set("pageNo", page);
    setSearchParams(params);
  }}

              size={isMobile ? "medium" : "medium"} // ⬅️ avoid small on mobile
              siblingCount={isMobile ? 0 : 1}
              boundaryCount={isMobile ? 1 : 2}
              showFirstButton={!isMobile}
              showLastButton={!isMobile}

              sx={{
                '& .MuiPaginationItem-root': {
                  minWidth: { xs: 44, sm: 32 },   // ✅ touch target
                  height: { xs: 44, sm: 32 },
                  fontSize: { xs: '1rem', sm: '0.875rem' },
                },
              }}
            />

          </Box>
        </Box>

        {/* FILTER MENU (MD+) */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={() => setFilterAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          PaperProps={{
            sx: {
              width: 320,
              p: 2,
              borderRadius: 2,
            },
          }}
        >
          <Typography variant="subtitle1" mb={1}>
            Filters
          </Typography>

          {/* CITY */}
          <Autocomplete
            options={cityList}
            value={draftFilters.city}
            inputValue={citySearch}
            onInputChange={(_, v) => setCitySearch(v)}
            onChange={(_, v) =>
              setDraftFilters((p) => ({ ...p, city: v }))
            }
            getOptionLabel={(option) =>
              option ? `${option.label}, ${option.state}` : ""
            }
            isOptionEqualToValue={(option, value) =>
              option?.value === value?.value
            }
            renderOption={(props, option) => (
              <li {...props}>
                <span className="text-sm font-medium">
                  {option.label}
                  <span className="text-gray-500">, {option.state}</span>
                </span>
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="City" size="small" />
            )}
          />


          {/* STATUS  */}
          <FormControl fullWidth size="small" sx={{ my: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={draftFilters.status ?? "all"}
              onChange={(e) =>
                setDraftFilters((p) => ({
                  ...p,
                  status:
                    e.target.value === "all"
                      ? null
                      : Number(e.target.value),
                }))
              }
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={0}>Inactive</MenuItem>
            </Select>
          </FormControl>

          {/* CLAIMED / UNCLAIMED */}
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Claim Status</InputLabel>
            <Select
              label="Claim Status"
              value={
                draftFilters.isUnclaimed == null
                  ? "all"
                  : draftFilters.isUnclaimed
                    ? "Unclaimed"
                    : "Claimed"
              }
              onChange={(e) =>
                setDraftFilters((p) => ({
                  ...p,
                  isUnclaimed:
                    e.target.value === "all"
                      ? null
                      : e.target.value === "Unclaimed",
                }))
              }
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Claimed">Claimed</MenuItem>
              <MenuItem value="Unclaimed">Unclaimed</MenuItem>
            </Select>

          </FormControl>

          {/* ACTIONS */}
          <Stack direction="row" spacing={1} mt={2}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={() => setDraftFilters({})}
            >
              Reset
            </Button>

          <Button
  fullWidth
  variant="contained"
  onClick={() => {
    const params = {};

    if (draftFilters.city) {
      params.city = draftFilters.city.value ?? draftFilters.city;
    }

    if (draftFilters.status) {
      params.status = draftFilters.status;
    }

    if (draftFilters.isUnclaimed !== null) {
      params.isUnclaimed = draftFilters.isUnclaimed ? 1 : 0;
    }

    setSearchParams(params);
    setAppliedFilters(draftFilters);
    setFilterAnchorEl(null);
  }}
>
  Apply
</Button>

          </Stack>
        </Menu>


        {/* FILTER DRAWER (MOBILE) */}
        {isMobile && (
          <SwipeableDrawer
            anchor="bottom"
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
            onOpen={() => { }}
            disableSwipeToOpen
            ModalProps={{
              keepMounted: true, // IMPORTANT for keyboard stability
            }}
            PaperProps={{
              sx: {
                width: '100%',
                maxWidth: '100%',
                height: 'auto',
                maxHeight: "90vh",
                borderTopLeftRadius: 12,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 0,
                m: 0
              },
            }}
          >

            <Box
              sx={{
                width: 60,
                height: 4,
                bgcolor: "grey.400",
                borderRadius: 2,
                mx: "auto",
                mb: 1,
              }}
            />


            <Box sx={{ p: 1 }}>
              <Typography variant="h6" mb={1}>
                Filters
              </Typography>

              <Autocomplete
                options={cityList}
                value={draftFilters.city}
                inputValue={citySearch}
                onInputChange={(_, v) => setCitySearch(v)}
                onChange={(_, v) =>
                  setDraftFilters((p) => ({ ...p, city: v }))
                }
                getOptionLabel={(option) =>
                  option ? `${option.label}, ${option.state}` : ""
                }
                isOptionEqualToValue={(option, value) =>
                  option?.value === value?.value
                }
                renderOption={(props, option) => (
                  <li {...props}>
                    <span className="text-sm font-medium">
                      {option.label}
                      <span className="text-gray-500">, {option.state}</span>
                    </span>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField {...params} label="City" size="small" />
                )}
              />



              <FormControl fullWidth sx={{ my: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  size="large"
                  label="Status"
                  value={draftFilters.status ?? "all"}
                  onChange={(e) =>
                    setDraftFilters((p) => ({
                      ...p,
                      status:
                        e.target.value === "all"
                          ? null
                          : Number(e.target.value),
                    }))
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value={1}>Active</MenuItem>
                  <MenuItem value={0}>Inactive</MenuItem>
                </Select>
              </FormControl>

              {/* CLAIMED / UNCLAIMED */}
              <FormControl fullWidth size="large" sx={{ mt: 1 }}>
                <InputLabel>Claim Status</InputLabel>
                <Select

                  label="Claim Status"
                  value={
                    draftFilters.isUnclaimed == null
                      ? "all"
                      : draftFilters.isUnclaimed
                        ? "Unclaimed"
                        : "Claimed"
                  }
                  onChange={(e) =>
                    setDraftFilters((p) => ({
                      ...p,
                      isUnclaimed:
                        e.target.value === "all"
                          ? null
                          : e.target.value === "Unclaimed",
                    }))
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Claimed">Claimed</MenuItem>
                  <MenuItem value="Unclaimed">Unclaimed</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1} mt={2}>
                <Button
                  size="large"
                  variant="outlined"
                  onClick={() => setDraftFilters({})}
                >
                  Reset
                </Button>

              <Button
  fullWidth
  variant="contained"
  onClick={() => {
    const params = {};

    if (draftFilters.city) {
      params.city = draftFilters.city.value ?? draftFilters.city;
    }

    if (draftFilters.status) {
      params.status = draftFilters.status;
    }

    if (draftFilters.isUnclaimed !== null) {
      params.isUnclaimed = draftFilters.isUnclaimed ? 1 : 0;
    }

    setSearchParams(params);
    setAppliedFilters(draftFilters);
    setFilterAnchorEl(null);
  }}
>
                    Apply Filters

</Button>
              </Stack>
            </Box>
          </SwipeableDrawer>
        )}

        {/* ACTION MENU */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem
            onClick={() => {
              navigate(`/list-restaurants/${currentCafe.id}`);
            }}
          >View Profile</MenuItem>
          <MenuItem
            onClick={() => {
              navigate(`/list-restaurants/edit-restaurant/${currentCafe.id}`);
              setAnchorEl(null); // 👈 close menu
            }}
          >
            Edit Profile
          </MenuItem>

          <MenuItem onClick={() => setOpenDeleteDialog(true)}>Delete Cafe</MenuItem>
        </Menu>

        <DeleteCafeDialog cafe={currentCafe} open={openDeleteDialog} setOpen={setOpenDeleteDialog} />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}

        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
    </>
  );
};

export default RestaurantList;
