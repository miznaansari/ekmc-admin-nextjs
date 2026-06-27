import React, { useState, useEffect } from "react";
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
  Paper,
  Menu,
  MenuItem,
  IconButton,
  Pagination,
  Chip,
  Box,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormGroup,
  Checkbox,
  Tooltip,
  FormControlLabel,
  InputAdornment,
  Stack,
} from "@mui/material";
import { fontWeight, styled, useTheme } from "@mui/system";
import { useMediaQuery } from "@mui/material";
import { useLocation } from "react-router";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { MoreVertical24Filled } from "@fluentui/react-icons";
import Search from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import mapAdminAccess from "../../mapAdminAccess.json"
import AddCustomers from "../AddCustomers/AddCustomers";
import OrderHistory from "../OrderHistory/OrderHistory";
import EditProfileUser from "../EditProfileUser/EditProfileUser";
import ReviewHistory from "../ReviewHistory/ReviewHistory";
import { Drawer } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import

const CustomersColumnVisibilitySelector = ({
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
      {/* <Tooltip title="Select Columns">
        <IconButton onClick={handleOpenColumnSelector}>
          <ViewColumnIcon />
        </IconButton>
      </Tooltip> */}

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

const StyledContainerLarge = styled(Box)(({ theme }) => ({
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
  height: `calc(98vh - 91px)`
}));

const StyledContainerSmall = styled(Box)(({ theme }) => ({
  // marginTop: theme.spacing(1),
  // marginBottom: theme.spacing(1),
  // padding: theme.spacing(1),
  // backgroundColor: theme.palette.background.paper,
  // borderRadius: theme.shape.borderRadius,
  // boxShadow: theme.shadows[1],
  // minHeight: "70vh",
  // width: "90vw",
  // maxWidth: "90vw",
  // display: "flex",
  // flexDirection: "column",
  // flexGrow: 1,
  //marginTop: theme.spacing(1.5),
  //marginBottom: theme.spacing(1),
  //padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  //borderRadius: theme.shape.borderRadius,
  //boxShadow: theme.shadows[1],
  //minHeight: "100vh",
  //width: "93vw",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  padding: theme.spacing(3), // Optional: add spacing

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
  fontWeight: 600,
  backgroundColor: "#f7faf7",
  textTransform: "uppercase",
};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
};

const CustomersListPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    lastPage: 1,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentCustomerId, setCurrentCustomerId] = useState(null);
  const [openAddUser, setOpenAddUser] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showReviewHistory, setShowReviewHistory] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false); // Controls drawer visibility
  const [drawerTitle, setDrawerTitle] = useState(""); // Sets the title of the drawer
  const [drawerContent, setDrawerContent] = useState(null); // Holds the content to be rendered in the drawer
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });
  const [isSuspended, setIsSuspended] = useState(false);


  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, pagination.limit, debouncedSearchQuery, isSuspended]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${baseUrl}/api/admin/list-mobile-user`,
        {
          params: {
            s: searchQuery || "",
            pageNo: pagination.page,
            limits: pagination.limit,
            suspended: isSuspended ? 1 : 0
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("response mobile user- ", response)
      if (response && response.data && response.data.data) {
        setCustomers(response.data.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.total || 0,
          lastPage: response.data.data.lastPage || 1,
        }));
      } else {
        setError("Unexpected response format from the server.");
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 401)
      ) {
        // Step 1: Check for 400 status
        // navigate("/login"); // Redirect to login page
      }
    } finally {
      setLoading(false);
    }
  };
  const handleAddCustomerClick = () => {
    setDrawerTitle("Add Customer"); // Set title for the drawer
    setDrawerContent(<AddCustomers
      onSuccess={() => {
        setAlert({
          open: true,
          message: "User created successfully!",
          severity: "success",
        });
        setOpenAddUser(false); // Close the AddCustomers view
        fetchCustomers(); // Refresh the customer list
        setDrawerContent(null);
        setDrawerOpen(false);
        handleDrawerClose();
      }}
      onClose={() => {
        console.log("onClose triggered, closing drawer");
        setDrawerOpen(false);
        setDrawerContent(null);
      }}


    />); // Set AddCustomers component as drawer content
    setDrawerOpen(true); // Open the drawer
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event) => {
    setPagination((prev) => ({ ...prev, limit: event.target.value, page: 1 }));
  };

  const handleMenuClick = (event, customerId) => {
    setAnchorEl(event.currentTarget);
    setCurrentCustomerId(customerId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentCustomerId(null);
  };

  const handleRefresh = () => {
    fetchCustomers();
  };

  const handleOrderHistoryClick = (customer) => {
    setDrawerTitle("Order History"); // Set title for the drawer
    setDrawerContent(<OrderHistory customer={customer} />);
    setDrawerOpen(true); // Open the drawer
  };

  const handleEditProfileClick = (customer) => {
    console.log("edit profile clicked")
    console.log("costumer =", customer)
    setDrawerTitle("Edit Profile");
    setDrawerContent(
      <EditProfileUser
        customer={customer}
        id={customer.user_customer_id}
        onSuccess={(message) => {
          console.log("message ", message)
          handleSaveSuccess(message)
          setAlert({
            open: true,
            message: message,
            severity: "success",
          });
        }}
        onClose={() => {
          console.log("onClose triggered, closing drawer");
          setDrawerOpen(false);
          setDrawerContent(null);
        }}
      />
    );
    setDrawerOpen(true);
  };

  const handleReviewHistoryClick = (customer) => {
    setDrawerTitle("Review History"); // Set title for the drawer
    setDrawerContent(<ReviewHistory customer={customer} />); // Pass customer data to ReviewHistory
    setDrawerOpen(true); // Open the drawer
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false); // Close the drawer
    setDrawerContent(null); // Reset content
  };

  const handleSaveSuccess = (message) => {
    // setSuccessMessage(message);
    // setOpenSnackbar(true);
    setShowEditProfile(false);
    setOpenAddUser(false);
    fetchCustomers();
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const Container = isSmallScreen ? StyledContainerSmall : StyledContainerLarge;

  const [visibleCustomersColumns, setVisibleCustomersColumns] = useState([
    "sNo",
    "userCustomerId",
    "fullName",
    "city",
    "email",
    "phone",
    "orders",
    "reviews",
    "lastActive",
    "status",
  ]);

  // Available columns configuration
  const customersAvailableColumns = [
    { key: "sNo", label: "S. NO.", alwaysVisible: true },
    // { key: "userCustomerId", label: "ID", alwaysVisible: true },
    { key: "fullName", label: "FULL NAME", alwaysVisible: false },
    { key: "city", label: "CITY", alwaysVisible: false },
    //{ key: "email", label: "EMAIL", alwaysVisible: false },
    { key: "dateOfBirth", label: "DOB", alwaysVisible: false },
    // { key: "phone", label: "PHONE", alwaysVisible: false },
    { key: "orders", label: "ORDERS", alwaysVisible: false },
    { key: "reviews", label: "REVIEWS", alwaysVisible: false },
    { key: "lastActive", label: "LAST VISITED", alwaysVisible: false },
    { key: "status", label: "STATUS", alwaysVisible: false },
  ];

  // Handler for toggling column visibility
  const handleCustomersColumnToggle = (columnKey) => {
    setVisibleCustomersColumns((prevColumns) =>
      prevColumns.includes(columnKey)
        ? prevColumns.filter((col) => col !== columnKey)
        : [...prevColumns, columnKey]
    );
  };

  const handleStatusClick = async (customer) => {
    console.log("customer= ", customer)
    const updatedStatus = customer.status === 1 ? 0 : 1;
    const payload = {
      mobile_number: customer.mobile_number,
      email: customer.email,
      status: updatedStatus,
      gender: customer.gender,
      date_of_birth: customer.date_of_birth,
      first_name: customer.first_name,
      last_name: customer.last_name,
      profile_pic_image_id: customer.up_cf_original_image_url,
      city_id: customer.city_id
    }
    try {
      const response = await axios.put(`${baseUrl}/api/admin/edit-mobile-user/${customer.user_customer_id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log("status update response= ", response);
      if (response.status === 200) {
        fetchCustomers();
        setAlert({ open: true, message: "Status Updated!", severity: "success" });
      }
    } catch (e) {
      console.log("error during updating status-", e);
      setAlert({ open: true, message: "Status Update Failed!", severity: "error" });
    }
  }

  //account suspend sec.

  const handleAccountSuspend = async (customer) => {
    console.log("customer in handle suspend = ", customer)
    const suspendUpdate = customer.is_suspended === 0 ? 1 : 0;
    const payload = {
      status: customer.status,
      gender: customer.gender,
      date_of_birth: customer.date_of_birth,
      first_name: customer.first_name,
      last_name: customer.last_name,
      profile_pic_image_id: customer.up_cf_original_image_url,
      city_id: customer.city_id,
      is_suspended: suspendUpdate

    }
    try {
      const response = await axios.put(`${baseUrl}/api/admin/edit-mobile-user/${customer.user_customer_id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 200) {
        fetchCustomers();
        setAlert({ open: true, message: "Account Suspended !!", severity: "success" });
      }


    } catch (e) {
      console.log("error during suspend account  -", e);
      setAlert({ open: true, message: "ERROR UPDATING !!", severity: "error" });
    }

  }


  const location = useLocation();
  const locationName = location.pathname;
  const pathName = mapAdminAccess.filter(
    (access) => access.path === locationName
  );
  const basePermission = pathName?.[0]?.permission || "";
  const userRole = localStorage.getItem("userRole") || "";
  const writePermission = basePermission.replace(/-read$/, "-write");
  const accessMember = JSON.parse(localStorage.getItem("user_permission")) || [];
  const checkAccess = accessMember.filter(
    (access) => access?.permission_name === writePermission
  );
  const hasWriteAccess = checkAccess[0]?.status === 1;

  // {(userRole === '1' || hasWriteAccess) && (<>

  // </>)}


  return (
    <Box paddingTop={2.5}>
      <Paper >
        <Drawer
disableEnforceFocus          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          PaperProps={{
            sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}
        >
          {/* <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          {drawerTitle}{" "}
          <Button onClick={handleDrawerClose}>
            <CloseIcon />
          </Button>
        </Typography> */}

          {drawerContent}
        </Drawer>

        {
          // showOrderHistory ? 
          // (
          //   <OrderHistory
          //     customer={selectedCustomer}
          //     onBack={() => setShowOrderHistory(false)}
          //   />
          // ) :
          showEditProfile ? (
            <EditProfileUser
              customer={selectedCustomer}
              onCancel={() => setShowEditProfile(false)}
              onSuccess={(message) => handleSaveSuccess(message)}
              onClose={() => {
                console.log("onClose triggered, closing drawer");
                setDrawerOpen(false);
                setDrawerContent(null);
                handleDrawerClose();
                setShowEditProfile(false)
              }}
            />
          ) : showReviewHistory ? (
            <ReviewHistory
              customer={selectedCustomer}
              onBack={() => setShowReviewHistory(false)}
            />
          ) : openAddUser ? (
            <AddCustomers
              // onClose={() => 
              //   setOpenAddUser(false)
              // } 
              onSuccess={() => {
                setAlert({
                  open: true,
                  message: "User created successfully!",
                  severity: "success",
                });
                setOpenAddUser(false); // Close the AddCustomers view
                fetchCustomers(); // Refresh the customer list
                setDrawerContent(null);
                setDrawerOpen(false);
                handleDrawerClose();

              }}
              onClose={() => {
                console.log("onClose triggered, closing drawer");
                setDrawerOpen(false);
                setDrawerContent(null);
              }}



            />
          ) : (
            <>
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
                <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  Customers
                </Typography>
                <TextField
                  value={searchQuery}
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

              {/* RIGHT */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setIsSuspended(!isSuspended)}
                >
                  {isSuspended ? "Show Active Accounts" : "Show Suspended Accounts"}
                </Button>

                {(userRole === '1' || hasWriteAccess) && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddCustomerClick}
                  >
                    Add Mobile User
                  </Button>
                )}
              </Box>
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
              ) : error ? (
                <Typography color="error" align="center">
                  Error: {error}
                </Typography>
              ) : (
                <Box >
                  <StyledTableContainer>
                    {/* Column Visibility Selector */}
                    {/* <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
                >
                  <CustomersColumnVisibilitySelector
                    availableColumns={customersAvailableColumns}
                    visibleColumns={visibleCustomersColumns}
                    onColumnToggle={handleCustomersColumnToggle}
                  />
                </Box> */}

                    <Table dense stickyHeader size="small">
                      <TableHead >
                        <TableRow>
                          {/* Dynamically render columns based on visibility */}
                          {customersAvailableColumns
                            .filter(
                              (col) =>
                                col.alwaysVisible ||
                                visibleCustomersColumns.includes(col.key)
                            )
                            .map((column) => (
                              <TableCell
                                key={column.key}
                                sx={
                                  column.key === "action"
                                    ? {
                                      ...tableHeaderCellStyle,
                                      position: "sticky",
                                      right: 0,
                                      backgroundColor: "#f7faf7",
                                      zIndex: 1000,
                                    }
                                    : tableHeaderCellStyle
                                }
                              >
                                {column.label}
                              </TableCell>
                            ))}
                          {/* Action Column - Always Visible */}
                          {(userRole === '1' || hasWriteAccess) && (<>

                            <TableCell
                              sx={{
                                ...tableHeaderCellStyle,
                                position: "sticky",
                                right: 0,
                                backgroundColor: "#f7faf7",
                                zIndex: 1000,
                              }}
                            >
                              ACTION
                            </TableCell>

                          </>)}

                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {customers.length > 0 ? (
                          customers.map((customer, index) => (
                            <TableRow
                              key={customer.user_customer_id}
                              sx={{
                                "&:hover": {
                                  //backgroundColor: "#f5f5f5",
                                  cursor: "pointer",
                                },
                                height: "32px",
                                transition: "background-color 0.3s ease-in-out",
                              }}
                            >
                              {/* Dynamically render cell data based on visible columns */}
                              {customersAvailableColumns
                                .filter(
                                  (col) =>
                                    col.alwaysVisible ||
                                    visibleCustomersColumns.includes(col.key)
                                )
                                .map((column) => {
                                  switch (column.key) {
                                    case "sNo":
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
                                    case "userCustomerId":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {customer.user_customer_id}
                                        </TableCell>
                                      );
                                    case "fullName":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                                              {customer.user_customer_id} - {customer.first_name ? `${customer.first_name.charAt(0).toUpperCase() + customer.first_name.slice(1)} ${customer.last_name}` : " "}
                                            </Typography>
                                            {(customer.is_test_user === 1 || customer.is_test_user === true) && (
                                              <Chip
                                                label="Test User"
                                                sx={{
                                                  height: 18,
                                                  fontSize: "0.65rem",
                                                  fontWeight: 700,
                                                  borderRadius: "4px",
                                                  backgroundColor: "#0284c7",
                                                  color: "#ffffff",
                                                  px: 0.5,
                                                }}
                                              />
                                            )}
                                          </Box>
                                          <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.7rem", mt: 0.2 }}>
                                            {customer.mobile_number}
                                          </Typography>
                                        </TableCell>
                                      );
                                    case "city":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {customer.city_name || "N/A"}
                                        </TableCell>
                                      );
                                    // case "email":
                                    //   return (
                                    //     <TableCell
                                    //       key={column.key}
                                    //       sx={tableCellStyle}
                                    //     >
                                    //       {customer.email || "N/A"}
                                    //     </TableCell>
                                    //   );
                                    case "dateOfBirth":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {customer.date_of_birth || "N/A"}
                                        </TableCell>
                                      );
                                    case "phone":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {customer.mobile_number}
                                        </TableCell>
                                      );
                                    case "orders":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {customer.order_count}
                                        </TableCell>
                                      );
                                    case "reviews":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {customer.review_count || 0}
                                        </TableCell>
                                      );
                                    case "lastActive":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          {new Date(
                                            customer.last_active
                                          ).toLocaleDateString()}
                                        </TableCell>
                                      );
                                    case "status":
                                      return (
                                        <TableCell
                                          key={column.key}
                                          sx={tableCellStyle}
                                        >
                                          <Chip
                                            onClick={() => handleStatusClick(customer)}
                                            label={customer.status === 1 ? "Active" : "Inactive"}
                                            color={customer.status === 1 ? "primary" : "error"}
                                            size="small"
                                            sx={{
                                              fontWeight: 600,
                                              textTransform: "capitalize",
                                            }}
                                          />
                                        </TableCell>
                                      );
                                    default:
                                      return null;
                                  }
                                })}

                              {/* Action Column */}
                              {(userRole === '1' || hasWriteAccess) && (<>
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
                                    onClick={(event) =>
                                      handleMenuClick(
                                        event,
                                        customer.user_customer_id
                                      )
                                    }
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
                                  <Menu
                                    anchorEl={anchorEl}
                                    open={
                                      Boolean(anchorEl) &&
                                      currentCustomerId === customer.user_customer_id
                                    }
                                    onClose={handleMenuClose}
                                  >
                                    <MenuItem
                                      onClick={() => {
                                        handleAccountSuspend(customer);
                                        handleMenuClose();


                                      }
                                      }
                                    >
                                      {customer.is_suspended === 0 ? "Suspend Account" : "Unsuspend Account"}
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() => {
                                        handleOrderHistoryClick(customer)
                                        handleMenuClose();
                                      }
                                      }
                                    >
                                      Order History
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() => {
                                        handleEditProfileClick(customer)
                                        handleMenuClose();

                                      }}
                                    >
                                      Edit Profile
                                    </MenuItem>
                                    <MenuItem
                                      onClick={() => {
                                        handleReviewHistoryClick(customer);
                                        handleMenuClose();


                                      }
                                      }
                                    >
                                      Review History
                                    </MenuItem>
                                  </Menu>
                                </TableCell>
                              </>)}

                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={12} align="center">
                              No customers found.
                            </TableCell>
                          </TableRow>
                        )}
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

                </Box>
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
            </>
          )}
      </Paper>
    </Box>
  );
};

export default CustomersListPage;
