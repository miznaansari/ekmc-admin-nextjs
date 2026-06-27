import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Pagination,
  Chip,
  Button,
  Snackbar,
  Alert,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  InputAdornment,
  Paper,
  Autocomplete,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { styled, useTheme } from "@mui/system"; // Import useTheme
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import RefreshIcon from "@mui/icons-material/Refresh"; // Import the refresh icon
import axios from "axios";
import AddRestaurantMenu from "./AddRestaurantMenu";
import EditRestaurantMenu from "./EditReataurantMenu"; // Ensure this uses the Drawer
import { Drawer } from "@mui/material";
import useDebounce from "../../../hooks/useDebounce";
import { MoreVertical24Filled } from "@fluentui/react-icons";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import mapAdminAccess from "../../../mapAdminAccess.json"
import { useLocation, useNavigate } from "react-router-dom";
const StyledContainerLarge = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  //minHeight: "70vh",
  //width: "93vw",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  minHeight: "100vh",
  width: "100%",
  minWidth: "0",
  overflow: "auto",
  padding: theme.spacing(2),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  height: "calc(89vh - 136px)", // ⬅️ Set desired height
  overflowY: "auto",
  overflowX: "auto",
}));

const tableHeaderCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  //fontWeight: "bold",
  borderBottom: "none",
  //borderBottom: "none",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",

};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  borderBottom: "none"
};

const RestaurantMenu = () => {
  const theme = useTheme(); // Use useTheme hook to get the theme object

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [openAddMenu, setOpenAddMenu] = useState(false);
  const [openEditMenu, setOpenEditMenu] = useState(false); // Drawer state for editing
  const [selectedMenuItem, setSelectedMenuItem] = useState(null); // Holds the menu item selected for editing
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });

  // Three-dot menu (popover) state
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverItem, setPopoverItem] = useState(null);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetItem, setDeleteTargetItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleThreeDotOpen = (event, menuItem) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setPopoverItem(menuItem);
  };

  const handleThreeDotClose = () => {
    setAnchorEl(null);
    setPopoverItem(null);
  };

  const handleDeleteClick = () => {
    setDeleteTargetItem(popoverItem);
    setDeleteDialogOpen(true);
    handleThreeDotClose();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetItem) return;
    try {
      setDeleteLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/cafe-menu-item/${deleteTargetItem.cafe_menu_item_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeleteDialogOpen(false);
      setDeleteTargetItem(null);
      fetchMenuItems();
      setAlert({ open: true, severity: "success", message: "Menu item deleted successfully!" });
    } catch (e) {
      console.error("Error deleting menu item:", e);
      setAlert({ open: true, severity: "error", message: "Failed to delete menu item!" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetItem(null);
  };
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");
  const [searchRestaurantQuery, setSearRestaurantchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState();

  // Fetch menu items whenever page, limit, or searchQuery changes
  useEffect(() => {
    fetchMenuItems();
  }, [page, limit, debouncedSearchQuery, restaurantId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/cafe-menu-items`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            s: searchQuery,
            pageno: page,
            limits: limit,
            cafe_list_id: restaurantId
          },
        }
      );
      if (response.data && response.data.success) {
        setMenuItems(response.data.data.data);
        setTotalPages(response.data.data.lastPage);
      } else {
        console.error("Failed to fetch menu items:", response.data.msg);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Step 1: Check for 400 status
        navigate("/login"); // Redirect to login page
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEditMenu = (menuItem) => {
    setSelectedMenuItem(menuItem); // Store selected menu item for editing
    setOpenEditMenu(true); // Open drawer
  };

  const handleRefresh = () => {
    fetchMenuItems();
    setSnackbarMessage("Menu items refreshed successfully!");
    setSnackbarOpen(true);
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/user/admin/cafe-list/get/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          s: searchRestaurantQuery
        }
      })
      console.log("response of restaurants= ", response.data?.data);
      const data = response.data?.data?.map((res) => ({
        label: res.cafe_name,
        city_name: res.city_name,
        value: res.id
      }))
      console.log("data- ", data)
      setRestaurants(data)
    } catch (e) {
      console.log("Error during fetching restaurants= ", e);
    }
  }

  useEffect(() => {
    const delayDebounc = setTimeout(() => {
      if (searchRestaurantQuery.trim().length >= 1) {
        fetchRestaurants();
      }
    }, 300)

    return () => clearTimeout(delayDebounc);
  }, [searchRestaurantQuery])

  //handle status update

  const handleStatusClick = async (menuItem) => {
    console.log("menu= ", menuItem)

    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/cafe-menu-item/${menuItem.cafe_menu_item_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("response fetch item=", response.data?.allTables[0])
      const data = response.data?.allTables[0]

      console.log("variants=", data?.menu_variant?.map(variant => ({
        variant_name: variant.variant_name,
        variant_price: variant.cafe_menu_variant_price,
        variant_status: variant.status
      })))

      const addons = data?.addon_list.map((addon => ({
        addon_name: addon.addon_name,
        addon_price: addon.addon_price,
        addon_status: addon.status,
      })))

      const variants = data?.menu_variant?.map(variant => ({
        variant_name: variant.variant_name,
        variant_price: variant.cafe_menu_variant_price,
        variant_status: variant.status
      }))

      const updatedStatus = menuItem.status === 1 ? 0 : 1;;


      const payload = {
        cafe_menu_item_nick_name: data.cafe_menu_item_nick_name,
        cafe_menu_category_nick_name: data.cafe_menu_category_nick_name,
        image_id: data.cmi_azure_original_image_url,
        uni_item_name: data.item_name,
        status: updatedStatus,
        uni_cat_name: data.category_name,
        food_type: data.food_type,
        description: data.description,
        base_price: data.base_price,
        gst_rate: data.gst_rate,
        measuring_unit: data.measuring_unit,
        spice_level: data.spice_level,
        is_exclusive: data.is_exclusive_offer,
        is_recommended: data.is_recommended,
        is_chef_special: data.is_chef_special,
        is_new: data.is_new,
        is_seasonal: data.is_seasonal,
        is_signature: data.is_signature,
        is_addon_compulsory: data.is_addon_compulsory,
        is_variation_compulsory: data.is_variation_compulsory,
        swiggy_price: data.swiggy_price,
        zomato_price: data.zomato_price,
        is_takeaway: data.is_takeaway,
        items: addons || [],
        itemss: variants || []
      };

      console.log("payload- ", payload);

      const updateStatusResponse = await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/cafe-menu-item/${menuItem.cafe_menu_item_id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log("updated ststus response= ", updateStatusResponse)
      if (updateStatusResponse.status === 201) {
        fetchMenuItems();
        setAlert({ open: true, message: "Status Updated!!", severity: "success" })
      }

    } catch (e) {
      console.log("error during update ststus= ", e);
      setAlert({ open: true, message: "Status Update failed!!", severity: "error" })
    }
  }










  // import mapAdminAccess from "../../../mapAdminAccess.json"

  const location = useLocation();
  const locationName = location.pathname;
  const pathName = mapAdminAccess.filter(
    (access) => access.path === locationName
  );
  const basePermission = pathName?.[0]?.permission || "";
  const userRole = localStorage.getItem("userRole") || "";
  const writePermission = basePermission.replace(/-read$/, "-write");
  console.log('writePermission', writePermission)
  const accessMember = JSON.parse(localStorage.getItem("user_permission")) || [];
  const checkAccess = accessMember.filter(
    (access) => access?.permission_name === writePermission
  );
  console.log('checkAccess', checkAccess)
  const hasWriteAccess = checkAccess[0]?.status === 1;
  console.log('object', hasWriteAccess)

  //  {(userRole === '1' || hasWriteAccess) && (<>

  //  </>)}






  return (
    <Box paddingTop={1}>
      <Paper>
        <Box flexWrap="wrap" padding={2} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          {/* Left Side: Title + Search + Autocomplete */}
          <Box flexWrap="wrap" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: "1.1rem",
                whiteSpace: "nowrap",
              }}
            >
              Restaurant Menu
            </Typography>

            <TextField
              label="Search"
              variant="outlined"
              size="small"
              placeholder="Value"
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 200 }}
            />

            <Autocomplete
              options={restaurants}
              getOptionKey={(option) => option.value}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              onChange={(event, selectedOption) => {
                setRestaurantId(selectedOption?.value || null);
              }}
              onInputChange={(_, inputValue) => {
                setRestaurants([]);
                setSearRestaurantchQuery(inputValue);
              }}
              sx={{ width: 240 }}
              renderOption={(props, option) => (
                <li {...props}>
                  <div>
                    <div>{option.label}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      {option.city_name}
                    </div>
                  </div>
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter By Restaurant"
                  variant="outlined"
                  size="small"
                  margin="dense"
                />
              )}
            />
          </Box>

          {/* Right Side: Buttons */}

          {(userRole === '1' || hasWriteAccess) && (<>

            <Box flexWrap="wrap" sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("Add_bulk_item")}
                sx={{
                  width: "140px",
                  height: "30px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                }}
              >
                ADD BULK ITEM
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenAddMenu(true)}
                sx={{
                  width: "100px",
                  height: "30px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                }}
              >
                ADD ITEM
              </Button>
            </Box>
          </>)}

        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyle}>S. NO.</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>ITEM NAME</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>CAFE NAME</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>PRICE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>FOOD CATEGORY</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>FOOD TYPE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>CREATED AT</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>UPDATED AT</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>STATUS</TableCell>
                  <TableCell
                    sx={{
                      ...tableHeaderCellStyle,
                      position: "sticky",
                      right: 0,
                      backgroundColor: theme.palette.background.paper, // Keep background color
                      zIndex: 100, // Ensure it stays on top of other cells when scrolling
                    }}
                  >
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {menuItems.length > 0 ? (
                  menuItems.map((menuItem, index) => (
                    <TableRow
                      key={menuItem.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                          cursor: "pointer",
                        },
                        height: "32px",
                        transition: "background-color 0.3s ease-in-out",
                      }}
                    >
                      <TableCell sx={tableCellStyle}>
                        {index + 1 + (page - 1) * limit}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        {menuItem.item_name}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        {menuItem.cafe_name}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        <Tooltip
                          title={
                            <>
                              <div>GST Rate: {menuItem.gst_rate || "N/A"}%</div>
                              <div>Swiggy Price: ₹{menuItem.swiggy_price || "N/A"}</div>
                              <div>Zomato Price: ₹{menuItem.zomato_price || "N/A"}</div>
                            </>
                          }
                          arrow
                          placement="top"
                        >
                          <span>₹{menuItem.base_price}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        {menuItem.universal_category_name}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        {menuItem.food_type === 0
                          ? 'Non-Veg'
                          : menuItem.food_type === 1
                            ? 'Veg'
                            : menuItem.food_type === 2
                              ? 'Egg'
                              : 'Unknown'}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        {new Date(menuItem.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        {new Date(menuItem.updated_at).toLocaleString()}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        <Chip
                          onClick={() => handleStatusClick(menuItem)}
                          label={menuItem.status === 1 ? "Active" : "Inactive"}
                          sx={{
                            backgroundColor: menuItem.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                            color: menuItem.status === 1 ? "#1b5e20" : "red", // dark green or orange
                            borderRadius: "999px",
                            px: 2,
                            py: 0.5,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          ...tableCellStyle,
                          position: "sticky",
                          right: 0,
                          backgroundColor: theme.palette.background.paper,
                          zIndex: 1,
                        }}
                      >
                        <IconButton
                          onClick={(e) => handleThreeDotOpen(e, menuItem)}
                          sx={{
                            color: "black",
                            transition: "transform 0.2s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.2)",
                            },
                          }}
                        >
                          <MoreVertical24Filled />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No menu items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}

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
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  //sx={{ minWidth: 70 }}
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
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
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

        {/* Three-dot Popover Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleThreeDotClose}
          PaperProps={{
            elevation: 3,
            sx: { borderRadius: "8px", minWidth: 140 },
          }}
        >
          <MenuItem
            onClick={() => {
              handleEditMenu(popoverItem);
              handleThreeDotClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Edit" />
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
            <ListItemIcon>
              <DeleteOutlineIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Delete" />
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          PaperProps={{ sx: { borderRadius: "12px", minWidth: 340 } }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Delete Menu Item</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete{" "}
              <strong>{deleteTargetItem?.item_name}</strong>? This action
              cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleDeleteCancel} variant="outlined" disabled={deleteLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Menu Drawer */}
        <AddRestaurantMenu
          open={openAddMenu}
          onClose={() => {
            setOpenAddMenu(false);
          }} // Closes the Add Menu drawer
          onSuccess={() => {
            setOpenAddMenu(false);
            fetchMenuItems();
            setSnackbarMessage("Menu added successfully!");
            setAlert({ open: true, severity: "success", message: "Menu added successfully !!" })
          }}
          anchor="left" // Opens drawer on the left side
          PaperProps={{
            sx: {
              width: "400px", // Adjust width as needed for a dialog-like appearance
            },
          }}
        />

        {/* Edit Menu Drawer */}
        {selectedMenuItem && (
          <EditRestaurantMenu
            open={openEditMenu}
            onClose={() => {
              setOpenEditMenu(false);
              setAlert({ open: true, severity: "success", message: "Updated successfully!!" })

              fetchMenuItems();
            }} // Close drawer
            onCancel={() => {
              setOpenEditMenu(false);
            }}
            cafeItemId={selectedMenuItem.cafe_menu_item_id} // Pass cafeItemId to fetch the item data
            anchor="left" // Opens drawer on the left side
            PaperProps={{
              sx: {
                width: "400px", // Same width for consistency
              },
            }}
          />
        )}

        <Snackbar
          open={alert.open}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          autoHideDuration={3000}
          onClose={() => setAlert({ ...alert, open: false })}
        >
          <Alert severity={alert.severity} sx={{ width: "100%" }}>
            {alert.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default RestaurantMenu;
