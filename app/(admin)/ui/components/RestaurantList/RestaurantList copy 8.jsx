import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Checkbox,
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
  Drawer,
  Fade,
} from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { useTheme } from "@mui/system";
import { useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MapIcon from "@mui/icons-material/Map";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import CloseIcon from "@mui/icons-material/Close";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EaterySearchHeader from "../v2/component/EaterySearchHeader";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce";
import ViewProfile from "../ViewProfile/ViewProfile";
import myEatsIcon from "../../assets/myeats_icon.png";
import EditRestaurantMain from "./EditResturant/EditRestaurantMain";
import ExpandableTable from "./ExpandableTable/ExpandableTable";
import DeleteCafeDialog from "./DeleteCafeDialog";
import CustomChip from "../../utils/CustomChip";
import MergeRestaurantMain from "./MergeResturant/EditRestaurantMain";
import AddEmployeesEatery from "../AddEmployees/AddEmployeesEatery";

/* ================= COLUMNS ================= */

const columns = [
  { key: "sn", label: "S. No" },
  { key: "cafe_name", label: "Eatery ID + Name" },
  { key: "city_name", label: "City Name" },
  { key: "total_item", label: "Items" },
  { key: "first_name", label: "Manager" },
  { key: "total_order", label: "Orders" },
  { key: "ekmc_score", label: "EKMC Score" },
  { key: "is_crawler", label: "Source" },
  { key: "is_unclaimed", label: "Is Unclaimed" },
  { key: "tags", label: "Tags" },
  { key: "status", label: "Status" },
];

/* ================= COMPONENT ================= */

const CafeActionMenu = ({
  cafe,
  onEditClick,
  onAddEmployeeClick,
  onDeleteClick,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getDropdownCoords = () => {
    if (!anchorEl) return { top: 0, left: 0 };
    const rect = anchorEl.getBoundingClientRect();
    
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(350, viewportHeight - 20);
    
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // Open in the direction that has more space if it doesn't fit below
    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    let topCoord = showAbove
      ? rect.top - dropdownHeight - 8
      : rect.bottom + 8;

    // Clamp topCoord to keep the menu fully within the viewport vertical bounds
    const maxTop = viewportHeight - dropdownHeight - 10;
    const minTop = 10;
    topCoord = Math.max(minTop, Math.min(maxTop, topCoord));

    const leftCoord = Math.max(10, rect.right - 320);

    return { top: topCoord, left: leftCoord };
  };

  const coords = getDropdownCoords();

  return (
    <>
      <IconButton onClick={handleOpen}>
        <MoreVertIcon />
      </IconButton>

      {Boolean(anchorEl) && (
        <>
          {/* Backdrop layer to close on click outside */}
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 1300,
              backgroundColor: "transparent",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          />
          {/* Custom Dropdown Content */}
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: 320,
              maxWidth: "calc(100vw - 20px)",
              maxHeight: "calc(100vh - 20px)",
              bgcolor: "#fff",
              borderRadius: "16px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
              zIndex: 1301,
              border: "1px solid #f0f0f0",
              overflowY: "auto",
            }}
          >
            {/* Header Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 2,
                py: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#666" }}>
                Quick Actions
              </Typography>
              <IconButton size="small" onClick={handleClose}>
                <CloseIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>
            <Box sx={{ borderBottom: "1px solid #f0f0f0", mb: 1 }} />

            {/* Grid Area */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1.5,
                px: 1.5,
                pb: 1.5,
                justifyItems: "center",
              }}
            >
              {/* Edit Profile */}
              <MenuItem
                onClick={() => {
                  handleClose();
                  onEditClick(cafe);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: "12px",
                  width: 90,
                  height: 95,
                  p: 1,
                  whiteSpace: "normal",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(237, 108, 2, 0.08)",
                    color: "#ed6c02",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <EditIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.75rem",
                    lineHeight: 1.1,
                    color: "#444",
                    wordBreak: "break-word",
                  }}
                >
                  Edit Profile
                </Typography>
              </MenuItem>

              {/* Add Employee */}
              <MenuItem
                onClick={() => {
                  handleClose();
                  onAddEmployeeClick(cafe);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: "12px",
                  width: 90,
                  height: 95,
                  p: 1,
                  whiteSpace: "normal",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(156, 39, 176, 0.08)",
                    color: "#9c27b0",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <PersonAddIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.75rem",
                    lineHeight: 1.1,
                    color: "#444",
                    wordBreak: "break-word",
                  }}
                >
                  Add Employee
                </Typography>
              </MenuItem>

              {/* Delete Cafe */}
              <MenuItem
                onClick={() => {
                  handleClose();
                  onDeleteClick(cafe);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: "12px",
                  width: 90,
                  height: 95,
                  p: 1,
                  whiteSpace: "normal",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(211, 47, 47, 0.08)",
                    color: "#d32f2f",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.75rem",
                    lineHeight: 1.1,
                    color: "#d32f2f",
                    wordBreak: "break-word",
                  }}
                >
                  Delete Cafe
                </Typography>
              </MenuItem>

              {/* Open OnBoard Eatery */}
              <MenuItem
                onClick={() => {
                  handleClose();
                  localStorage.setItem("cafeListId", cafe.id);
                  navigate(`/onboarding?cafeId=${cafe.id}`);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: "12px",
                  width: 90,
                  height: 95,
                  p: 1,
                  whiteSpace: "normal",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(46, 125, 50, 0.08)",
                    color: "#2e7d32",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <RestaurantIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.75rem",
                    lineHeight: 1.1,
                    color: "#444",
                    wordBreak: "break-word",
                  }}
                >
                  Open OnBoard
                </Typography>
              </MenuItem>

              {/* Map View */}
              <MenuItem
                onClick={() => {
                  handleClose();
                  localStorage.setItem("mapViewData", cafe.id);
                  localStorage.setItem("mapView", "true");
                  window.dispatchEvent(new Event("mapViewChange"));
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: "12px",
                  width: 90,
                  height: 95,
                  p: 1,
                  whiteSpace: "normal",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0, 150, 136, 0.08)",
                    color: "#009688",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <MapIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.75rem",
                    lineHeight: 1.1,
                    color: "#444",
                    wordBreak: "break-word",
                  }}
                >
                  Map View
                </Typography>
              </MenuItem>

              {/* Open WebMenu */}
              <MenuItem
                onClick={() => {
                  handleClose();
                  localStorage.setItem("cafeListId", cafe.id);
                  navigate(`/onboarding?cafeId=${cafe.id}`);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: "12px",
                  width: 90,
                  height: 95,
                  p: 1,
                  whiteSpace: "normal",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(63, 81, 181, 0.08)",
                    color: "#3f51b5",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  }}
                >
                  <MenuBookIcon sx={{ fontSize: 24 }} />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.75rem",
                    lineHeight: 1.1,
                    color: "#444",
                    wordBreak: "break-word",
                  }}
                >
                  Open WebMenu
                </Typography>
              </MenuItem>

              {/* Open MyEatsApp */}
              <MenuItem
                onClick={() => {
                  handleClose();
                  localStorage.setItem("cafeListId", cafe.id);
                  navigate(`/onboarding?cafeId=${cafe.id}`);
                }}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: "12px",
                  width: 90,
                  height: 95,
                  p: 1,
                  whiteSpace: "normal",
                  gap: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={myEatsIcon}
                    alt="MyEatsApp"
                    sx={{
                      width: 40,
                      height: 40,
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "600",
                    fontSize: "0.75rem",
                    lineHeight: 1.1,
                    color: "#444",
                    wordBreak: "break-word",
                  }}
                >
                  Open MyEatsApp
                </Typography>
              </MenuItem>
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

const RestaurantList = () => {
  const MERGE_SELECTION_STORAGE_KEY = "restaurant-list-merge-selection";
  const [searchParams, setSearchParams] = useSearchParams();
  const [isReady, setIsReady] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

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
  const [appliedFilters, setAppliedFilters] = useState({ status: 1 });

  const [citySearch, setCitySearch] = useState("");
  const [cityList, setCityList] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
  });
  const [gotoPageInput, setGotoPageInput] = useState("1");

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
  const [selectedCafeIds, setSelectedCafeIds] = useState([]);
  const [selectedCafeDetails, setSelectedCafeDetails] = useState({});
  const [mergePair, setMergePair] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectEatry, setSelectEatry] = useState({});
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false); // Controls drawer visibility

  const [drawerContent, setDrawerContent] = useState(null); // Stores drawer content to render
  const [drawerTitle, setDrawerTitle] = useState(""); // Sets drawer title dynamically

  const handleCancelAddEmployee = () => {
    setShowAddEmployee(false);
  };
  const handleSucsesslAddEmployee = () => {
    setShowAddEmployee(false);
    setDrawerOpen(false);
    setSnackbar({ open: true, message: "Employee added Successfully", severity: "success" });
  };


  const handleExpandRow = (id) => {
    setExpandedRow((prev) => {
      const isExpanding = prev !== id;
      if (isExpanding) {
        setTimeout(() => {
          const element = document.getElementById(`cafe-row-${id}`);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 150);
      }
      return isExpanding ? id : null;
    });
  };

  const handleSessionExpired = (error) => {

    const message = error?.response?.data?.msg;
    const status = error?.response?.status;
    console.log(message, status)

    if (status === 401 && (message === "Invalid or expired session" || message === "Invalid token")) {
      localStorage.removeItem("authToken");
      navigate("/");
      return true;
    }

    return false;
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
      try {
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
      } catch (error) {
        handleSessionExpired(error);
      }
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
      if (!handleSessionExpired(e)) {
        setSnackbar({ open: true, message: "Failed to load cafes", severity: "error" });
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!isReady) return;
    setLoading(true); // Show loading skeletons
    setCafes([]);    // Optionally clear old data immediately
    fetchCafes();
  }, [isReady, debouncedSearch, appliedFilters, pagination.page, pagination.limit]);

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
    } catch (error) {
      if (!handleSessionExpired(error)) {
        setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
      }
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
  // useEffect(() => {
  //   const pageNo = Number(searchParams.get("pageNo")) || 1;
  //   const limit = Number(searchParams.get("limit")) || 50;

  //   setPagination((p) => ({
  //     ...p,
  //     page: pageNo,
  //     limit: limit,
  //   }));
  // }, []);

  const updatePaginationParams = (page, limit = pagination.limit) => {
    const params = new URLSearchParams(searchParams);

    params.set("pageNo", page);
    params.set("limit", limit);

    setSearchParams(params);
  };

  const handleGoToPage = () => {
    const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / pagination.limit));
    const targetPage = Number(gotoPageInput);

    if (!Number.isFinite(targetPage) || targetPage < 1) {
      setSnackbar({ open: true, message: "Enter a valid page number", severity: "warning" });
      return;
    }

    const safePage = Math.min(totalPages, Math.floor(targetPage));
    setPagination((p) => ({ ...p, page: safePage }));
    updatePaginationParams(safePage);
  };


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

  useEffect(() => {
    const raw = localStorage.getItem(MERGE_SELECTION_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const valid = parsed.filter((item) => item && item.id);
      setSelectedCafeIds(valid.map((item) => item.id).slice(0, 2));

      const details = {};
      valid.forEach((item) => {
        details[item.id] = item;
      });
      setSelectedCafeDetails(details);
    } catch {
      // Ignore corrupted local storage value.
    }
  }, []);

  useEffect(() => {
    const payload = selectedCafeIds
      .map((id) => selectedCafeDetails[id])
      .filter(Boolean)
      .slice(0, 2);

    localStorage.setItem(MERGE_SELECTION_STORAGE_KEY, JSON.stringify(payload));
  }, [selectedCafeIds, selectedCafeDetails]);

  useEffect(() => {
    const pageNo = Number(searchParams.get("pageNo")) || 1;
    if (pageNo === 1) return;

    setPagination((p) => ({ ...p, page: 1 }));
    updatePaginationParams(1);
  }, [debouncedSearch]);

  const handleToggleCafeSelection = (event, cafeId) => {
    event.stopPropagation();

    const selectedCafe = cafes.find((c) => c.id === cafeId);

    setSelectedCafeIds((prev) => {
      if (prev.includes(cafeId)) {
        setSelectedCafeDetails((detailPrev) => {
          const next = { ...detailPrev };
          delete next[cafeId];
          return next;
        });
        return prev.filter((id) => id !== cafeId);
      }
      if (prev.length >= 2) {
        setSnackbar({
          open: true,
          message: "You can select only 2 cafes for merge",
          severity: "warning",
        });
        return prev;
      }

      if (selectedCafe) {
        setSelectedCafeDetails((detailPrev) => ({
          ...detailPrev,
          [cafeId]: selectedCafe,
        }));
      }

      return [...prev, cafeId];
    });
  };

  const handleOpenMergeDrawer = () => {
    if (selectedCafeIds.length !== 2) return;

    const selectedCafes = selectedCafeIds
      .map((id) => selectedCafeDetails[id])
      .filter(Boolean);

    if (selectedCafes.length !== 2) {
      setSnackbar({
        open: true,
        message: "Please reselect cafes for merge",
        severity: "warning",
      });
      return;
    }

    setAnchorEl(null);
    setEditCafe(null);
    setMergePair({ cafe1: selectedCafes[0], cafe2: selectedCafes[1] });
  };

  const handleClearMergeSelection = () => {
    setSelectedCafeIds([]);
    setSelectedCafeDetails({});
    localStorage.removeItem(MERGE_SELECTION_STORAGE_KEY);
    setSnackbar({ open: true, message: "Merge selection cleared", severity: "info" });
  };

  const handleCopyCafeName = async (event, cafe) => {
    event.stopPropagation();

    const cafeName = (cafe?.cafe_name || "").trim();
    if (!cafeName) {
      setSnackbar({ open: true, message: "Cafe name is empty", severity: "warning" });
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(cafeName);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = cafeName;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setSnackbar({ open: true, message: "Cafe name copied", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to copy cafe name", severity: "error" });
    }
  };

  const handleOpenCafeOnGoogleMaps = (event, cafe) => {
    event.stopPropagation();

    const query = encodeURIComponent(`${cafe?.cafe_name || ""} ${cafe?.city_name || ""}`.trim());
    if (!query) return;

    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank", "noopener,noreferrer");
  };

  const handleStatusClick = async (cafe, event) => {
    event.stopPropagation();
    setLoadingId(cafe.id);
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
      await fetchCafes();
      setLoadingId(null);

      setSnackbar({ open: true, message: "Status updated!", severity: "success" });
    } catch (error) {
      setLoadingId(null);
      if (!handleSessionExpired(error)) {
        setSnackbar({ open: true, message: "Failed to update status", severity: "error" });
      }
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
    const pageNo = Number(searchParams.get("pageNo")) || 1;
    const limit = Number(searchParams.get("limit")) || 50;

    const cityParam = searchParams.get("city");
    const statusParam = searchParams.get("status");
    const isUnclaimedParam = searchParams.get("isUnclaimed");

    const filters = {
      city: cityParam
        ? { value: Number(cityParam), label: "", state: "" }
        : null,
      status: statusParam !== null ? Number(statusParam) : 1,
      isUnclaimed:
        isUnclaimedParam !== null ? Number(isUnclaimedParam) === 1 : null,
    };

    setPagination({ page: pageNo, limit, total: 0 });
    setDraftFilters(filters);
    setAppliedFilters(filters);

    setIsReady(true); // ✅ important
  }, []);

  useEffect(() => {
    setGotoPageInput(String(pagination.page || 1));
  }, [pagination.page]);


  const [locationMenuAnchorEl, setLocationMenuAnchorEl] = useState(null);
  const [locationMenuCafe, setLocationMenuCafe] = useState(null);

  const handleOpenLocationMenu = (event, cafe) => {
    event.stopPropagation();
    setLocationMenuAnchorEl(event.currentTarget);
    setLocationMenuCafe(cafe);
  };

  const handleCloseLocationMenu = () => {
    setLocationMenuAnchorEl(null);
    setLocationMenuCafe(null);
  };

  const handleOpenGoogleMaps = () => {
    if (!locationMenuCafe) return;
    const query = encodeURIComponent(`${locationMenuCafe.cafe_name} ${locationMenuCafe.city_name || ''}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank');
    handleCloseLocationMenu();
  };

  const handleOpenSwiggy = () => {
    if (!locationMenuCafe) return;

    const query = `${locationMenuCafe.cafe_name} ${locationMenuCafe.city_name || ''}`
      .trim()
      .replace(/\s+/g, "+");

    const url = `https://www.swiggy.com/search?query=${query}`;

    window.open(url, "_blank");
    handleCloseLocationMenu();
  };

  const handleAddEmployeeClick = (eatry) => {
    console.log("handle add employee click");
    setDrawerTitle("Add Employee"); // Set the drawer title
    setDrawerContent(<AddEmployeesEatery
      selectEatry={eatry}
      onSuccess={
        handleSucsesslAddEmployee
      }
      onClose={() => {
        setShowAddEmployee(false);
        setDrawerOpen(false);
      }}
    />);
    setDrawerOpen(true); // Open the drawer
  };

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
          selectedCafeIds={selectedCafeIds}
          handleClearMergeSelection={handleClearMergeSelection}
          handleOpenMergeDrawer={handleOpenMergeDrawer}
        />

        {/* <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Select exactly 2 cafes to enable merge ({selectedCafeIds.length}/2 selected)
          </Typography>
   <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 1 }}
        >
          <Button
            variant="contained"
            disabled={selectedCafeIds.length !== 2}
            onClick={handleOpenMergeDrawer}
          >
            Merge Selected Cafes
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            disabled={selectedCafeIds.length === 0}
            onClick={handleClearMergeSelection}
          >
            Clear Selection
          </Button>
        </Stack>
        </Stack> */}


        {/* TABLE */}

        <TableContainer
          ref={tableRef}
          sx={{
            maxHeight: innerHeight - (isMobile ? 255 : 215),
            position: "relative", // REQUIRED
          }}

        >
          <Table stickyHeader size="small">
            {/* TABLE HEAD ALWAYS VISIBLE */}
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: "10px",
                    py: 0.5,
                    px: 0.5,
                    whiteSpace: "nowrap",
                    width: 46,
                  }}
                >
                  Merge
                </TableCell>
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
                ? Array.from({ length: 18 }).map((_, i) => (
                  <TableRow
                    key={`skeleton-${i}`}
                    sx={{
                      '& td': {
                        py: 1,          // ⬅️ increase height slightly (default ≈ 0.75)
                      },
                    }}
                  >

                    <TableCell>
                      <Skeleton variant="rounded" width={18} height={18} />
                    </TableCell>
                    <TableCell><Skeleton width={20} /></TableCell>
                    <TableCell><Skeleton width="80%" /></TableCell>
                    <TableCell><Skeleton width="60%" /></TableCell>
                    <TableCell><Skeleton width={30} /></TableCell>
                    <TableCell><Skeleton width="70%" /></TableCell>
                    <TableCell><Skeleton width={30} /></TableCell>
                    <TableCell><Skeleton width={30} /></TableCell>
                    <TableCell><Skeleton width={30} /></TableCell>
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
                      id={`cafe-row-${cafe.id}`}
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleExpandRow(cafe.id)}
                    >

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          size="small"
                          checked={selectedCafeIds.includes(cafe.id)}
                          onChange={(event) => handleToggleCafeSelection(event, cafe.id)}
                        />
                      </TableCell>


                      <TableCell>
                        {i + 1 + (pagination.page - 1) * pagination.limit}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 0.5,
                            width: "100%",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: "70%", // prevents overflow
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontSize:
                                cafe.cafe_name.length > 25
                                  ? "0.75rem"
                                  : cafe.cafe_name.length > 15
                                    ? "0.8rem"
                                    : "0.875rem",
                            }}
                          >
                            {cafe.id} - {cafe.cafe_name}
                          </Typography>

                          <Box onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="Map View" arrow>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  localStorage.setItem("mapViewData", cafe.id);
                                  localStorage.setItem("mapView", "true");
                                  window.dispatchEvent(new Event("mapViewChange"));
                                  setAnchorEl(null); // 👈 close menu
                                }}
                                sx={{ p: 0.25 }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy cafe name" arrow>
                              <IconButton
                                size="small"
                                onClick={(event) => handleCopyCafeName(event, cafe)}
                                sx={{ p: 0.25 }}
                              >
                                <ContentCopyIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>

                            <IconButton
                              size="small"
                              onClick={(event) => handleOpenLocationMenu(event, cafe)}
                              sx={{ p: 0.25 }}
                            >
                              <OpenInNewIcon fontSize="inherit" />
                            </IconButton>

                            {/* Location menu for Google Maps and Swiggy */}
                            <Menu
                              anchorEl={locationMenuAnchorEl}
                              open={Boolean(locationMenuAnchorEl)}
                              onClose={handleCloseLocationMenu}
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                              PaperProps={{
                                elevation: 0,
                                sx: {
                                  boxShadow: "none",
                                  border: "1px solid #e0e0e0", // optional subtle border
                                },
                              }}
                            >
                              <MenuItem onClick={handleOpenGoogleMaps}>Open in Google Maps</MenuItem>
                              <MenuItem onClick={handleOpenSwiggy}>Open in Swiggy</MenuItem>
                            </Menu>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{cafe.city_name || "-"}</TableCell>
                      <TableCell>{cafe.total_item || "-"}</TableCell>
                      <TableCell>{`${cafe.first_name || ""} ${cafe.last_name || ""}`}</TableCell>
                      <TableCell>{cafe.total_order || "-"}</TableCell>
                      <TableCell>{cafe.ekmc_score || "-"}</TableCell>

                      <TableCell>
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
                      <TableCell>
                        <Chip
                          label={cafe.is_unclaimed === 1 ? "Unclaimed" : "Claimed"}
                          size="small"
                          variant="filled"
                          sx={{
                            backgroundColor: cafe.is_unclaimed === 1 ? "#FFE5E5" : "#E6F4EA",
                            color: cafe.is_unclaimed === 1 ? "#D32F2F" : "#2E7D32",
                            fontWeight: 500,
                          }}
                        />
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
                      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                        <CustomChip
                          onClick={(event) => handleStatusClick(cafe, event)}
                          label={cafe.status === 1 ? "Active" : "Inactive"}
                          color={cafe.status === 1 ? "primary" : "error"}
                          loading={loadingId === cafe.id}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="View Profile" arrow>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/list-restaurants/${cafe.id}`);
                            }}
                            size="small"
                            sx={{
                              color: "#1976d2",
                              backgroundColor: "rgba(25, 118, 210, 0.08)",
                              mr: 0.5,
                              p: "6px",
                              "&:hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.16)",
                              }
                            }}
                          >
                            <StorefrontIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </Tooltip>
                        <CafeActionMenu
                          cafe={cafe}
                          onEditClick={(c) => setEditCafe(c)}
                          onAddEmployeeClick={(c) => {
                            const eatryObj = {
                              id: c.id,
                              cafe_name: c.cafe_name,
                              city_name: c.city_name,
                            };
                            setSelectEatry(eatryObj);
                            handleAddEmployeeClick(eatryObj);
                          }}
                          onDeleteClick={(c) => {
                            setCurrentCafe(c);
                            setOpenDeleteDialog(true);
                          }}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={columns.length + 2} sx={{ p: 0 }}>
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
          }}
        >
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
            <Stack direction="row" display={{ xs: 'none', md: 'flex' }} spacing={0.75} justifyContent={'center'} alignItems="center">
              <TextField
                size="small"
                label="Go to"
                value={gotoPageInput}
                onChange={(e) => setGotoPageInput(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleGoToPage();
                  }
                }}
                sx={{ width: { xs: 70, sm: 70 } }}
                inputProps={{ inputMode: "numeric" }}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={handleGoToPage}

              >
                Go
              </Button>
            </Stack>
            {/* ❌ Hide menu on mobile */}
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              Rows per page:{" "}
              <Select
                size="small"
                value={pagination.limit}
                onChange={(e) =>
                  setPagination((p) => ({ ...p, limit: e.target.value, page: 1 }))
                }
                sx={{ width: 80 }}
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
                updatePaginationParams(page);
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
                const params = {
                  pageNo: 1, // 👈 always reset page when applying filters
                };

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
                // ✅ THIS was missing
                setPagination((p) => ({ ...p, page: 1 }));
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
                    const params = {
                      pageNo: 1, // 👈 always reset page when applying filters
                    };

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
                    // ✅ THIS was missing
                    setPagination((p) => ({ ...p, page: 1 }));
                    setFilterAnchorEl(null);
                  }}
                >
                  Apply Filters

                </Button>
              </Stack>
            </Box>
          </SwipeableDrawer>
        )}


        <DeleteCafeDialog
          cafe={currentCafe}
          open={openDeleteDialog}
          setOpen={setOpenDeleteDialog}
          onDeleted={() => {
            setSnackbar({ open: true, message: "Cafe deleted successfully", severity: "success" });
            fetchCafes();
            setAnchorEl(null); // 👈 close menu
          }}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}

        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>


        <Drawer
          disableEnforceFocus anchor="right"
          open={Boolean(editCafe || mergePair)}
          onClose={() => {
            setEditCafe(null);
            setMergePair(null);
          }}
          PaperProps={{
            sx: { width: { xs: "100%", sm: "100%", md: 1000, lg: '80%' }, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}
        >
          {editCafe && <EditRestaurantMain cafeId={editCafe.id} onClose={() => setEditCafe(null)} />}
          {mergePair && (
            <MergeRestaurantMain
              mergeCafe1={mergePair.cafe1}
              mergeCafe2={mergePair.cafe2}
              onClose={() => setMergePair(null)}
            />
          )}
        </Drawer>

        <Drawer
          disableEnforceFocus anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: { width: { xs: "100%", sm: "100%", md: 400, lg: 400 }, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}
        >
          {drawerContent}
        </Drawer>
      </Paper >
    </>
  );
};

export default RestaurantList;
