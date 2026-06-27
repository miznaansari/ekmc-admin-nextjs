import React, { useEffect, useState, useRef } from "react";
import {
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
  Box,
  Tooltip,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Collapse,
  Card,
  CardContent,
  Divider, // Add Snackbar for notifications
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  FormGroup,
  Checkbox,
  InputAdornment,
  Paper,
  Stack, 
} from "@mui/material";
import { positions, styled, textAlign, useTheme } from "@mui/system";
import { useMediaQuery } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";

import RefreshIcon from "@mui/icons-material/Refresh";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import axios from "axios";
import AddRestaurant from "../AddRestaurant/AddRestaurant";
import ViewProfile from "../ViewProfile/ViewProfile";
import EditProfile from "../EditProfile/Editprofile";
import { useNavigate } from "@/ui/utils/nextRouting";
import useDebounce from "../../hooks/useDebounce";
import { Controller } from "react-hook-form";
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import EditRestaurant from "./EditResturant/EditResturant";
import EditRestaurantMain from "./EditResturant/EditRestaurantMain";
import { useCafe } from "../../context/cafeContext";
import ExpandableTable from "./ExpandableTable/ExpandableTable";

const RestaurantColumnVisibilitySelector = ({
  availableColumns,
  visibleColumns,
  onColumnToggle,
}) => {
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);

  const handleOpenColumnSelector = () => {
    setIsColumnSelectorOpen(true);
  };

  const handleCloseColumnSelector = () => {
    setIsColumnSelectorOpen(false);
  };

  const handleColumnVisibilityToggle = (columnKey) => {
    onColumnToggle(columnKey);
  };

  return (
    <>
      <Tooltip title="Select Columns">
        <IconButton onClick={handleOpenColumnSelector}>
          <ViewColumnIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={isColumnSelectorOpen} onClose={handleCloseColumnSelector}>
        <DialogTitle>Select Visible Columns</DialogTitle>
        <DialogContent>
          <FormGroup>
            {availableColumns.map((column) => (
              <FormControlLabel
                key={column.key}
                control={
                  <Checkbox
                    checked={visibleColumns.includes(column.key)}
                    onChange={() => handleColumnVisibilityToggle(column.key)}
                    disabled={column.alwaysVisible}
                  />
                }
                label={column.label}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseColumnSelector} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
const RestaurantList = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
 
  // Track if we're currently typing to prevent focus loss
  const isTyping = useRef(false);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCafeId, setSelectedCafeId] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  // Increase debounce time to 1000ms (1 second)
  const debouncedSearchQuery = useDebounce(searchQuery, 100);

  const [isUnclaimed, setIsUnclaimed] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCafeId, setCurrentCafeId] = useState(null);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const token = localStorage.getItem("authToken");
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
  const [menuPosition, setMenuPosition] = useState(null);
  const {setCafeIdContext}=useCafe();
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleMenuClick = (event, cafeId, cafeData) => {
    setCurrentCafeId(cafeId);
    setFormData(cafeData);

    // Get the bounding rectangle of the button
    const buttonRect = event.currentTarget.getBoundingClientRect();

    // Set the position for the menu
    setMenuPosition({
      top: buttonRect.bottom,
      left: buttonRect.right - 20,
    });

    setAnchorEl(event.currentTarget);
  };

  // Only use debouncedSearchQuery for fetching
  useEffect(() => {
    if (!isTyping.current) {
      fetchCafes();
    }
  }, [debouncedSearchQuery, pagination.page, pagination.limit, isUnclaimed]);

  const fetchCafes = async () => {
    // Only set loading to true if we're not actively typing
    if (!isTyping.current) {
      setLoading(true);
    }

    try {
      const response = await axios.get(
        `${baseUrl}/api/user/admin/generalInfoCafe`,
        {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            s: debouncedSearchQuery || "",
            is_unclaimed: isUnclaimed,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.data)
      ) {
        setCafes(response.data.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.total || 0,
        }));
      } else {
        setCafes([]);
        setError("Unexpected response format");
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 401)
      ) {
        // Step 1: Check for 400 status
        navigate("/login"); // Redirect to login page
      }
    } finally {
      setLoading(false);
      // Ensure the input is focused again after the fetch completes
      // if (searchInputRef.current && searchQuery) {
      //   setTimeout(() => {
      //     searchInputRef.current.focus();

      //     // Place cursor at the end
      //     const length = searchQuery.length;
      //     searchInputRef.current.setSelectionRange(length, length);
      //   }, 0);
      // }
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleEditProfile = (cafe) => {
    setFormData(cafe);
    setShowEditProfile(true);

    handleMenuClose();
  };

  const handleViewProfile = (cafeId) => {
    setSelectedCafeId(cafeId);
    handleMenuClose();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentCafeId(null);
  };

  // Improved search change handler
  const handleSearchChange = (e) => {
    isTyping.current = true; // Mark that we're typing
    setSearchQuery(e.target.value);

    // Only reset page if needed
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }

    // After a short delay, mark that we're no longer typing
    setTimeout(() => {
      isTyping.current = false;
    }, 100);
  };

  // Focus handler to improve typing experience
  const handleInputFocus = () => {
    isTyping.current = true;
  };

  // Blur handler for when input loses focus naturally
  const handleInputBlur = () => {
    setTimeout(() => {
      isTyping.current = false;
    }, 200);
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event) => {
    setPagination((prev) => ({ ...prev, limit: event.target.value, page: 1 }));
  };

  const openAddRestaurant = () => {
    setShowAddRestaurant(true);
    //showSnackbar("Adding a new restaurant...");
  };

  const closeAddRestaurant = () => {
    setShowAddRestaurant(false);
    //showSnackbar("Adding a new restaurant...");
  };

  const closeEditProfile = () => {
    setShowEditProfile(false);
  };

  const closeViewProfile = () => {
    setSelectedCafeId(null);
  };

  const handleRefresh = () => {
    fetchCafes();
  };

  const tableHeaderCellStyle = {
    fontSize: "0.75rem",
    padding: "1.2vh 1.8vh",
    //fontWeight: "bold",
    borderBottom: "none",
    //borderBottom: "none",
    backgroundColor: "white", // <--- This removes the default background
    boxShadow: "none",
    fontWeight:"none",
  };

  // StyledContainer for larger screens
  const StyledContainerLarge = styled(Box)({
    marginTop: theme.spacing(1.5),
  //marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  //boxShadow: theme.shadows[1],
  //minHeight: "100vh",
  //width: "93vw",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  //height: `calc(98vh - 91px)`
  height:"auto"
  });

  // StyledContainer for small screens
  const StyledContainerSmall = styled(Box)({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
    //minHeight: "70vh",
    //width: "90vw",
    //maxWidth: "90vw",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  });

  const StyledTableContainer = styled(TableContainer)({
    flex: 1,
  height: "calc(89vh - 136px)", // ⬅️ Set desired height
  overflowY: "auto",
  overflowX: "auto",
  });

  const tableCellStyle = {
    fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  borderBottom: "none"
  };

  const Container = isSmallScreen ? StyledContainerSmall : StyledContainerLarge;

  // new implementation

  const [expandedRow, setExpandedRow] = useState(null);
  // const [cafeData, setCafeData] = useState({});
  const [gallery, setGallery] = useState([]);
  const [cafeId, setCafeId] = useState();
  const [activeImageId, setActiveImageId] = useState(null);
  const [requiredUpdateData, setrequiredUpdateData] = useState({
    cafe_name: "",
    cafe_email: "",
    cafe_mobile_number: "",
    cafe_slogan: "",
    description: "",
    is_featured: "",
    is_most_visited: "",
    is_new_opening: "",
    logo_image_id: "",
    show_res_menu: "",
    allow_profile_edit: "",
  });
  const [foodType, setFoodType] = useState({
    is_veg: false,
    is_non_veg: false,
  });
  const [menuType, setMenuType] = useState({
    allow_menu_edit: false,
    allow_login: false,
    allow_qr_edit: false,
    allow_order: false,
  });
  const [status, setStatus] = useState({
    is_daily_report: false,
    is_featured: false,
    is_hot_today: false,
    is_limelight: false,
    is_published: false,
    status: false,
    is_user_location_required: false,
  });
  const convertToBoolean = (value) => Boolean(value && value !== "null");
  const handleRowExpand = async (cafe) => {
    if (expandedRow === cafe.id) {
      setExpandedRow(null);
    } else {
      setCafeId(cafe.id);
      setExpandedRow(cafe.id);
      try {
        const response = await axios.get(
          `${baseUrl}/api/user/admin/restaurant-all-info/${cafe.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
            },
          }
        );
        // setCafeData(response.data.data[0]);
        const cafeData = response.data.data[0];
        const featuredImage = response.data.gallery.find(
          (image) => image.is_featured === 1
        );
        if (featuredImage) {
          setActiveImageId(featuredImage.id);
        }
        setGallery(response.data.gallery);
        setrequiredUpdateData({
          cafe_name: cafeData.cafe_name,
          cafe_email: cafeData.cafe_email,
          cafe_mobile_number: cafeData.cafe_mobile_number,
          cafe_slogan: cafeData.cafe_slogan,
          description: cafeData.cafe_about,
          is_featured:
            cafeData.is_featured == null ? false : cafeData.is_featured,
          is_most_visited:
            cafeData.is_most_visited == null ? false : cafeData.is_most_visited,
          is_new_opening:
            cafeData.is_new_opening == null ? false : cafeData.is_new_opening,
          logo_image_id: cafeData.logo_image_id,
          show_res_menu: false,
          allow_profile_edit: cafeData.allow_profile_edit,
        });
        setFoodType({
          is_veg: convertToBoolean(cafeData.is_veg),
          is_non_veg: convertToBoolean(cafeData.is_non_veg),
        });

        setMenuType({
          allow_menu_edit: convertToBoolean(cafeData.allow_menu_edit),
          allow_login: convertToBoolean(cafeData.allow_login),
          allow_qr_edit: convertToBoolean(cafeData.allow_qr_edit),
          allow_order: convertToBoolean(cafeData.allow_order),
        });

        setStatus({
          is_daily_report: convertToBoolean(cafeData.is_daily_report),
          is_featured: convertToBoolean(cafeData.is_featured),
          is_hot_today: convertToBoolean(cafeData.is_hot_today),
          is_limelight: convertToBoolean(cafeData.is_limelight),
          is_published: convertToBoolean(cafeData.is_published),
          status: convertToBoolean(cafeData.status),
          is_user_location_required: convertToBoolean(
            cafeData.is_user_location_required
          ),
        });
      } catch (error) {
        console.error(error);
      }
    }
  };
  const updateCafeData = async (data) => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/user/admin/restaurant-edit-general-information/${cafeId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response);
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };
  const handleFoodTypeChange = (type) => (event) => {
    setFoodType((prev) => {
      const newValue = event.target.checked;
      const updatedState = { ...prev, [type]: newValue };
      const payload = {
        ...updatedState,
        ...menuType,
        ...status,
        ...requiredUpdateData,
      };
      updateCafeData(payload);
      return updatedState;
    });
  };
  const handleMenuTypeChange = (type) => (event) => {
    setMenuType((prev) => {
      const newValue = event.target.checked;
      const updatedState = { ...prev, [type]: newValue };
      const payload = {
        ...updatedState,
        ...foodType,
        ...status,
        ...requiredUpdateData,
      };
      updateCafeData(payload);
      return updatedState;
    });
  };
  const handleStatusTypeChange = (type) => (event) => {
    setStatus((prev) => {
      const newValue = event.target.checked;
      const updatedState = { ...prev, [type]: newValue };
      const payload = {
        ...updatedState,
        ...foodType,
        ...menuType,
        ...requiredUpdateData,
      };
      updateCafeData(payload);
      return updatedState;
    });
  };
  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${baseUrl}/api/user/admin/restaurant/featured-image/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGallery((prevGallery) => prevGallery.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Error deleting featured image:", error);
    }
  };
  const handleSwitchChange = async (image) => {
    try {
      const data = {
        cafe_image_name: image.cafe_image_name,
        image_position: 1,
        is_featured: true,
      };
      const response = await axios.put(
        `${baseUrl}/api/user/admin/restaurant/featured-image/${cafeId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response) {
        setActiveImageId((prevId) => (prevId === image.id ? null : image.id));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const [visibleRestaurantColumns, setVisibleRestaurantColumns] = useState([
    "sn",
    "restaurantName",
    "numberOfItems",
    "managerName",
    "score",
    "totalOrders",
  ]);

  // Available columns configuration
  const restaurantAvailableColumns = [
    { key: "sn", label: "S. N0", alwaysVisible: true },
    { key: "restaurantUID", label: "RESTURANT ID", alwaysVisible: true },
    { key: "restaurantName", label: "RESTAURANT NAME", alwaysVisible: true },
    { key: "numberOfItems", label: "NO OF ITEMS", alwaysVisible: false },
    { key: "managerName", label: "MANAGER NAME", alwaysVisible: false },
    //{ key: "score", label: "Score", alwaysVisible: false },
    
    { key: "totalOrders", label: "ORDERS", alwaysVisible: false },
    { key: "tags", label: "TAGS", alwaysVisible: true },
    { key: "status", label: "STATUS", alwaysVisible: true },
  ];

  // Handler for toggling column visibility
  const handleRestaurantColumnToggle = (columnKey) => {
    setVisibleRestaurantColumns((prevColumns) =>
      prevColumns.includes(columnKey)
        ? prevColumns.filter((col) => col !== columnKey)
        : [...prevColumns, columnKey]
    );
  };

  // const handleExpandableMessage= (message)=>{
  //   console.log("message of expandable table in list restauran - ", message)
  //   setSnackbar({open:true , severity:"success", message:message})
  // }

  //handle ststus 

  const handleStatusClick= async(cafe, event)=>{
    event.stopPropagation(); 

    try{
      const fetchGeneralInforResponse= await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${cafe.id}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })


      const data=fetchGeneralInforResponse?.data?.data[0];

      const updatedStatus= cafe.status===1? 0:1;

      const payload= {
        cafe_name: data.cafe_name,
        cafe_email: data.cafe_email,
        cafe_mobile_number: data.cafe_mobile_number,
        city_id: data.city_id,
        cafe_slogan: data.cafe_slogan,
        description: data.cafe_about,
        is_featured: data.is_featured,
        is_most_visited: data.is_most_visited,
        is_new_opening: data.is_new_opening,
        is_veg: data.is_veg,
        is_non_veg: data.is_non_veg,
        status: updatedStatus,
        logo_image_id: data.cafe_logo_azure_original_image_url,
        is_published: data.is_published,
        show_res_menu: 1,
        allow_order: data.allow_order,
        allow_login: data.allow_login,
        allow_qr_edit: data.allow_qr_edit,
        allow_profile_edit: data.allow_profile_edit,
        allow_menu_edit: data.allow_menu_edit,
        is_limelight: data.is_limelight,
        is_hot_today: data.is_hot_today,
        is_daily_report: data.is_daily_report,
        is_user_location_required: data.is_user_location_required
      }

      const response= await axios.post(`${baseUrl}/api/user/admin/restaurant-edit-general-information/${cafe.id}`,payload, {
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      if(response.status === 200){
        fetchCafes();
        setSnackbar({open:true, severity:"success", message:"Status updated !!"})
      }
    }catch(e){
      console.log("error in handle ststus click -", e);
      setSnackbar({open:true, severity:"error", message:"Status update Failed !!"})
    }
  }
  return (
    <Box paddingTop={3}>
      <Paper >
        {selectedCafeId ? (
          <ViewProfile cafe_list_id={selectedCafeId} onClose={closeViewProfile} />
        ) : showAddRestaurant ? (
          <AddRestaurant
            onClose={closeAddRestaurant}
            onSuccess={()=>{
              closeAddRestaurant();
              setSnackbar({
              open: true,
              message: "Restaurant Added successfully!!",
              severity: "success",
            });

            }}
          />
        ) : showEditProfile ? (
          setCafeIdContext(formData.id),
          <EditRestaurantMain cafeId={formData.id} 
          onClose={closeEditProfile}
           onSuccess={()=>{
            console.log("profile updated successfully!!")
            setSnackbar({
              open: true,
              message: "Profile updated successfully!!",
              severity: "success",
            });
        
          }} />
        ) : (
          <>
            <Grid
              container
              spacing={1}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4
                }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                    Resturants
                  </Typography>
                  <TextField
                    
                    
                    onChange={handleSearchChange}
                    
                    label="Search"
                    variant="outlined"
                    size="small"
                    placeholder="Value"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 250 }}
                  />
                </Box>
              </Grid>
              <Grid
                sx={{
                  textAlign: { xs: "left", sm: "right" },
                }}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4
                }}>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                  flexWrap="wrap"
                >
                  <Button 
                    size="small" 
                    variant="outlined"
                    sx={{
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                    }}
                    onClick={()=> setIsUnclaimed(!isUnclaimed)}
                  >
                    {isUnclaimed ? "SHOW CLAIMED" : "SHOW UNCLAIMED"}
                  </Button>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={openAddRestaurant}
                    sx={{
                      minWidth: "150px",
                      height: "30px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                    }}
                  >
                    ADD RESTAURANT
                  </Button>
                </Stack>
              </Grid>

            </Grid>

            {loading && !isTyping.current ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "60vh",
                }}
              >
                <CircularProgress
                  size={60}
                  thickness={4}
                  sx={{ color: theme.palette.primary.main }}
                />
              </Box>
            ) : error ? (
              <Typography color="error" align="center">
                Error: {error}
              </Typography>
            ) : (
              <>
                <StyledTableContainer>
                  {/* <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
                  >
                    <RestaurantColumnVisibilitySelector
                      availableColumns={restaurantAvailableColumns}
                      visibleColumns={visibleRestaurantColumns}
                      onColumnToggle={handleRestaurantColumnToggle}
                    />
                  </Box> */}
                  <Table stickyHeader>
                    <TableHead >
                      <TableRow>
                        {/* Expandable Row Icon - Always Visible */}
                        {/* <TableCell
                          sx={{ ...tableHeaderCellStyle, width: "40px" }}
                        ></TableCell> */}

                        {/* Dynamically render columns based on visibility */}
                        {restaurantAvailableColumns
                          .filter(
                            (col) =>
                              col.alwaysVisible ||
                              visibleRestaurantColumns.includes(col.key)
                          )
                          .map((column) => (
                            <TableCell key={column.key} sx={tableHeaderCellStyle}>
                              {column.label}
                            </TableCell>
                          ))}

                        {/* Action Column - Always Visible */}
                        <TableCell
                          sx={{
                            ...tableHeaderCellStyle,
                            position: "sticky",
                            right: 0,
                            backgroundColor: theme.palette.background.paper,
                            zIndex: 100,
                          }}
                          
                        >
                          ACTION
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {cafes.map((cafe, index) => {
                        return (
                          <React.Fragment key={cafe.id}>
                            <TableRow
                              sx={{
                                "&:hover": {
                                  //backgroundColor: "#f5f5f5",
                                  cursor: "pointer",
                                },
                                height: "32px",
                                transition: "background-color 0.3s ease-in-out",
                              }}
                              onClick={() => handleRowExpand(cafe)}
                            >
                              {/* Expandable Row Icon */}
                              {/* <TableCell padding="checkbox" sx={tableCellStyle}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleRowExpand(cafe)}
                                  sx={{
                                    transition: "transform 0.2s",
                                    transform:
                                      expandedRow === cafe.id
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                  }}
                                >
                                  {expandedRow === cafe.id ? (
                                    <KeyboardArrowUpIcon fontSize="small" />
                                  ) : (
                                    <KeyboardArrowDownIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </TableCell> */}

                              {/* Dynamically render cell data based on visible columns */}
                              {restaurantAvailableColumns
                                .filter(
                                  (col) =>
                                    col.alwaysVisible ||
                                    visibleRestaurantColumns.includes(col.key)
                                )
                                .map((column) => {
                                  switch (column.key) {
                                    case "sn":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {index +
                                            1 +
                                            (pagination.page - 1) *
                                              pagination.limit}
                                        </TableCell>
                                      );
                                    case "restaurantUID":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {cafe.id}
                                        </TableCell>
                                      );
                                    case "restaurantName":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {cafe.cafe_name}
                                        </TableCell>
                                      );
                                    case "numberOfItems":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {cafe.total_item || "-"}
                                        </TableCell>
                                      );
                                    case "managerName":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {`${cafe.first_name || ""} ${
                                            cafe.last_name || ""
                                          }`.trim() || "-"}
                                        </TableCell>
                                      );
                                    case "score":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {cafe.ekmc_score || "-"}
                                        </TableCell>
                                      );
                                    case "status":
                                      return (
                                        <TableCell 
                                          key={column.key} 
                                          sx={tableCellStyle}
                                          onClick={(e) => e.stopPropagation()} // Prevent row click when clicking on this cell
                                        >
                                          <Chip
                                            onClick={(event) => handleStatusClick(cafe, event)} // Pass the event
                                            label={cafe.status === 1 ? "Active" : "Inactive"}
                                            size="small"
                                            sx={{
                                              backgroundColor: cafe.status === 1 ? "#edf7f2" : "#fdecea",  
                                              color: cafe.status === 1 ? "#14532d" : "#b71c1c",             
                                              fontSize: "13px",
                                              cursor: "pointer", // Add cursor pointer to indicate it's clickable
                                              "&:hover": {
                                                opacity: 0.8, // Add hover effect
                                              }
                                            }}
                                          />
                                        </TableCell>
                                      );
                                    case "totalOrders":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {cafe.total_order || "-"}
                                        </TableCell>
                                      );
                                    case "tags":
                                      return (
                                        <TableCell key={column.key} sx={tableCellStyle}>
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
                                              label={`${
                                                [
                                                  cafe.is_most_visited && "Most Visited",
                                                  cafe.is_new_opening && "New Opening",
                                                  cafe.is_featured && "Featured",
                                                ].filter(Boolean).length
                                              } Tags`}
                                              size="small"
                                              sx={{
                                                backgroundColor: "#edf7f2", 
                                                color: "#14532d",           
                                              //   fontWeight: 500,
                                              //   borderRadius: "9999px",    
                                              //   px: 2,
                                              //   py: 0.5,
                                              //   fontSize: "13px",
                                              //   transition: "transform 0.3s ease-in-out",
                                              //   "&:hover": {
                                              //   transform: "scale(1.05)", 
                                              // },
                                              }}
                                            />
                                          </Tooltip>
                                      </TableCell>
                                      );
                                    default:
                                      return null;
                                  }
                                })}

                              {/* Action Column */}
                              <TableCell
                                sx={{
                                  ...tableCellStyle,
                                  position: "sticky",
                                  right: 0,
                                  backgroundColor: theme.palette.background.paper,
                                  zIndex: 1,
                                }}

                                onClick={(e) => e.stopPropagation()}
                              >
                                <IconButton
                                  onClick={(event) =>
                                    handleMenuClick(event, cafe.id, cafe)
                                  }
                                  sx={{
                                    color:"black",
                                    transition: "transform 0.2s ease-in-out",
                                    "&:hover": {
                                      transform: "scale(1.2)",
                                    },
                                  }}
                                >
                                  <MoreVertIcon />
                                </IconButton>
                                <Menu
                                  anchorReference="anchorPosition"
                                  anchorPosition={
                                    menuPosition
                                      ? {
                                          top: menuPosition.top,
                                          left: menuPosition.left,
                                        }
                                      : undefined
                                  }
                                  open={
                                    Boolean(anchorEl) && currentCafeId === cafe.id
                                  }
                                  onClose={handleMenuClose}
                                  anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "right",
                                  }}
                                  transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                  }}
                                >
                                  <MenuItem
                                    onClick={() => handleViewProfile(cafe.id)}
                                  >
                                    View Profile
                                  </MenuItem>
                                  <MenuItem
                                    onClick={() => handleEditProfile(cafe)}
                                  >
                                    Edit Profile
                                  </MenuItem>
                                </Menu>
                              </TableCell>
                            </TableRow>

                            {/* Expandable Row Content */}
                            <TableRow>
                              <TableCell
                                style={{
                                paddingBottom: 0,
                                paddingTop: 0,
                                borderBottom: expandedRow === cafe.id ? "1px solid #e0e0e0" : "none",
                              }}
                              colSpan={10}
                              >
                                <Collapse in={expandedRow === cafe.id} timeout="auto" unmountOnExit>
                                  {/* Replace all the existing content inside Collapse with just this: */}
                                  <ExpandableTable 
                                    cafeId={cafeId}
                                     //onSuccess={handleExpandableMessage}
                                  />
                                </Collapse>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </StyledTableContainer>

                                                  <Grid
                                                    container
                                                    spacing={2}
                                                    alignItems="center"
                                                    sx={{
                                                      
                                                      px: 2,
                                                      py: 1,
                                                    }}
                                                  >
                                                    {/* Right-aligned section */}
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
                                                            value={pagination.limit}
                                                            onChange={handleLimitChange}
                                                            sx={{
                                                              minWidth: 70,
                                                              height: 32,
                                                              fontSize: "0.875rem", // Same as body2 (14px)
                                                              borderRadius: 1.5,
                                                              "& fieldset": {
                                                                border: "none", // Removes the default outline
                                                              },
                                                            }}
                                                        
                                                          >
                                                         <MenuItem value={50}>50</MenuItem>
                                                                                        <MenuItem value={100}>100</MenuItem>
                                                                                        <MenuItem value={200}>200</MenuItem>
                                                          </Select>
                                                        </Box>
                                                  
                                                        {/* Pagination */}
                                                        <Pagination
                                                          //count={totalPages}
                                                          count={Math.ceil(pagination.total / pagination.limit)}
                                                          page={pagination.page}
                                                          onChange={handlePageChange}
                                                          shape="rounded"
                                                          variant="outlined"
                                                          size="medium"
                                                          sx={{
                                                            "& .MuiPaginationItem-root": {
                                                              borderRadius: "6px", // ⬅️ Reduce roundness here
                                                            },
                                                          }}
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
                <Alert
                  onClose={handleSnackbarClose}
                  severity={snackbar.severity}
                  sx={{ width: "100%" }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>
      </Paper>
    </Box>
  );
};

export default RestaurantList;
