import React, { useEffect, useState } from "react";
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
  Paper,
  Menu,
  MenuItem,
  IconButton,
  Pagination,
  Chip,
  Button,
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
  Drawer,
  Autocomplete,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import { useMediaQuery } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import AddEmployees from "../AddEmployees/AddEmployees";
import ViewEmployeeProfile from "../ViewEmployeeProfile/ViewEmployeeProfile";
import EditEmployeeProfile from "../EditEmployeeprofile/EditEmployeeprofile.jsx";
import RightDrawer from "../RightDrawer/RightDrawer.jsx"; // Import the RightDrawer component
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce.jsx";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ResetPassword from "./ResetPassword.jsx";
const EmployeesColumnVisibilitySelector = ({
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

const StyledContainer = styled(Box)(({ theme }) => ({
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

const PaginationContainer = styled(Grid)(({ theme }) => ({
  position: "sticky", // Make pagination sticky
  bottom: 0, // Stick to the bottom of the viewport
  backgroundColor: theme.palette.background.default,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  justifyContent: "space-between",
  alignItems: "center",
  zIndex: 1000, // Ensure pagination stays on top
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  height: "calc(89vh - 136px)", // ⬅️ Set desired height
  overflowY: "auto",
  overflowX: "auto",
}));

const tableHeaderCellStyle = {
  fontSize: "0.75rem",
  padding: "1.7vh 1.8vh",
  //fontWeight: "bold",
  borderBottom: "none",
  //borderBottom: "none",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",
  fontWeight: "none"
};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "8px 12px",
  borderBottom: "none"
};

const EmployeesList = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false); // Controls drawer visibility
  const [drawerTitle, setDrawerTitle] = useState(""); // Sets drawer title dynamically
  const [drawerContent, setDrawerContent] = useState(null); // Stores drawer content to render
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showViewProfile, setShowViewProfile] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const token = localStorage.getItem("authToken");
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchRestaurantQuery, setSearRestaurantchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState();


  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/api/user/admin/get-all-employee`,
        {
          params: {
            pageno: pagination.page,
            limits: pagination.limit,
            s: searchQuery,
            cafe_list_id: restaurantId
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("response in fetch all employee", response.data);
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.data)
      ) {
        setEmployees(response.data.data.data);
        console.log("all employees:", response.data.data.data)
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.total || 0,
        }));
      } else {
        setEmployees([]);
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
      console.log("error in fetch all employee- ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, pagination.limit, debouncedSearchQuery, restaurantId]);

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

  const handleMenuClick = (event, employeeId) => {
    setAnchorEl(event.currentTarget);
    setCurrentEmployeeId(employeeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentEmployeeId(null);
  };

  const handleAddEmployeeClick = () => {
    setDrawerTitle("Add Employee"); // Set the drawer title
    setDrawerContent(<AddEmployees
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
  const tableCellStyle = {
    fontSize: "0.75rem",
    padding: "1.4vh 1.8vh",
    borderBottom: "none"
  };
  const handleCancelAddEmployee = () => {
    setShowAddEmployee(false);
  };
  const handleSucsesslAddEmployee = () => {
    setShowAddEmployee(false);
    setDrawerOpen(false);
    setSnackbar({ open: true, message: "Employee added Successfully", severity: "success" });
  };

  const handleRefresh = () => {
    fetchEmployees();
    setSnackbar({ open: true, message: "Data refreshed!", severity: "info" });
  };

  const handleViewProfileClick = (employeeId) => {
    console.log("view profile id", employeeId)
    setDrawerTitle("View Profile"); // Set title for viewing profile
    setDrawerContent(<ViewEmployeeProfile employeeId={employeeId} onClose={() => {
      setShowViewProfile(false)
      setShowAddEmployee(false);
      setDrawerOpen(false);
    }} />); // Set content to view profile
    setDrawerOpen(true); // Open the drawer
  };

  const handleCloseViewProfile = () => {
    setShowViewProfile(false);
  };
  const handleUpdateStatus = (status, message) => {
    if (status === "success") {
      fetchEmployees();
    } else {
      console.error("Update Failed:", message);
      // Show error message to the user
    }
  };

  const handleEditProfileClick = (employeeId) => {
    console.log("employee id", employeeId)
    setDrawerTitle("Edit Profile"); // Set title for editing profile
    setDrawerContent(
      <EditEmployeeProfile
        employeeId={employeeId}
        onUpdate={handleUpdateStatus}
        onClose={() => {
          setShowAddEmployee(false);
          setDrawerOpen(false);
        }}
        onSuccess={() => {

          setSnackbar({ open: true, severity: "success", message: "Updated!!" })
          setShowAddEmployee(false);
          setDrawerOpen(false);
        }}
      />
    ); // Set content to edit profile
    setDrawerOpen(true); // Open the drawer
  };

  //reset password

  const handleresetPasswordClick = (employeeId) => {
    console.log("employee id of reset pass- ", employeeId)
    setDrawerOpen(true)
    setDrawerContent(
      <ResetPassword
        employeeId={employeeId}
        onClose={() => {
          setShowAddEmployee(false);
          setDrawerOpen(false);
        }}
      />
    )
  }
  const handleDrawerClose = () => {
    setDrawerOpen(false); // Close the drawer
    setDrawerContent(null); // Clear drawer content
  };
  const roleMap = {
    2: "Manager",
    3: "Kitchen",
    4: "Captain",
  };

  const handleCloseEditProfile = () => {
    setShowEditProfile(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const Container = isSmallScreen ? StyledContainer : StyledContainer;

  // New section
  const [visibleEmployeesColumns, setVisibleEmployeesColumns] = useState([
    "sNo",
    "id",
    "fullName",
    "city",
    "phone",
    "email",
    "cafeNameWithId",
    "status",
    "role",
  ]);

  // Available columns configuration
  const employeesAvailableColumns = [
    { key: "sNo", label: "S. NO.", alwaysVisible: true },
    { key: "id", label: "ID", alwaysVisible: true },
    { key: "fullName", label: "FULL NAME", alwaysVisible: false },
    { key: "city", label: "CITY", alwaysVisible: false },
    { key: "phone", label: "PHONE", alwaysVisible: false },
    //{ key: "email", label: "EMAIL", alwaysVisible: false },
    { key: "cafeNameWithId", label: "CAFE WITH ID", alwaysVisible: false },
    { key: "role", label: "ROLE", alwaysVisible: false },

    { key: "status", label: "STATUS", alwaysVisible: false },
    { key: "lastLogin", label: "LAST LOGIN", alwaysVisible: false },
    { key: "memberSince", label: "MEMBER SINCE", alwaysVisible: false },
    { key: "ordersServed", label: "ORDERS SERVED", alwaysVisible: false },
    { key: "uid", label: "EMPLOYEE UID", alwaysVisible: false },
  ];

  // Handler for toggling column visibility
  const handleEmployeesColumnToggle = (columnKey) => {
    setVisibleEmployeesColumns((prevColumns) =>
      prevColumns.includes(columnKey)
        ? prevColumns.filter((col) => col !== columnKey)
        : [...prevColumns, columnKey]
    );
  };

  //fetch restaurants
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

  //ststus buttton clickable

  const handleStatusClick = async (employee) => {
    console.log("employee", employee)
    const updatedStatus = employee.status === 1 ? 0 : 1;

    try {
      const res = await axios.put(`${baseUrl}/api/user/admin/update-employee/${employee.user_admin_id}`, {
        user_role_id: employee.user_role_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        cafe_list_id: employee.cafe_list_id,
        mobile_number: employee.mobile_number,
        email: employee.email,
        photo_proof_id_url: employee.photo_proof_id_url,
        address_proof_id_url: employee.address_proof_id_url,
        profile_pic_image_id: employee.uap_azure_original_image_url,
        status: updatedStatus,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Status updated:", res);
      if (res.status === 200) {
        fetchEmployees();
        setSnackbar({ open: true, message: "Status Updated!", severity: "success" });

      }
      // Optional: refresh list or update UI locally
    } catch (err) {
      console.error("Failed to update status:", err);
      setSnackbar({ open: true, message: "Status Update failed!", severity: "error" });
    }

  }
  return (
    <Box sx={{ pt: 2 }}>
      <Paper>
        <Drawer
          disableEnforceFocus anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          title={drawerTitle}
          PaperProps={{
            sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}
        >
          {drawerContent}
        </Drawer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
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

        {showAddEmployee ? (
          <AddEmployees
            onCancel={handleCancelAddEmployee}
            onSuccess={handleSucsesslAddEmployee}
          />
        ) : showViewProfile ? (
          <ViewEmployeeProfile
            employeeId={selectedEmployeeId}
            onClose={handleCloseViewProfile}
            handleClose={() => {
              setShowAddEmployee(false);
              setDrawerOpen(false);
            }}
          />
        ) : showEditProfile ? (
          <EditEmployeeProfile
            employeeId={selectedEmployeeId}
            onClose={handleCloseEditProfile}
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
                  Employees
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

                <Autocomplete
                  options={restaurants}
                  getOptionKey={(option) => option.value}
                  getOptionLabel={(option) => option && option.label ? option.label : ''}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  onChange={(event, selectedOption) => {
                    setRestaurantId(selectedOption?.value || null);
                  }}
                  onInputChange={(_, inputValue) => {
                    setSearRestaurantchQuery(inputValue);
                  }}
                  sx={{ width: 240 }}
                  renderOption={(props, option) => (
                    <li {...props} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 8 }}>
                      <span style={{ fontSize: '1rem', color: '#222' }}>{option.label}</span>
                      {option.city_name && (
                        <span style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>{option.city_name}</span>
                      )}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filter Basdy Restaurant"
                      variant="outlined"
                      size="small"
                    />
                  )}
                />
              </Box>

              {/* RIGHT */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddEmployeeClick}
                >
                  Add Employees
                </Button>
              </Box>
            </Box>

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "72vh",
                }}
              >
                <CircularProgress size={60} thickness={4} />
              </Box>
            ) : error ? (
              <Typography color="error" align="center">
                Error: {error}
              </Typography>
            ) : (
              <>
                <StyledTableContainer >
                  {/* <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
                >
                  <EmployeesColumnVisibilitySelector
                    availableColumns={employeesAvailableColumns}
                    visibleColumns={visibleEmployeesColumns}
                    onColumnToggle={handleEmployeesColumnToggle}
                  />
                </Box> */}
                  <Table stickyHeader>
                    <TableHead >
                      <TableRow>
                        {employeesAvailableColumns
                          .filter(
                            (col) =>
                              col.alwaysVisible ||
                              visibleEmployeesColumns.includes(col.key)
                          )
                          .map((column) => (
                            <TableCell
                              key={column.key}

                              sx={tableHeaderCellStyle}
                            >
                              {column.label}
                            </TableCell>
                          ))}
                        <TableCell

                          sx={{
                            ...tableHeaderCellStyle,
                            position: "sticky",
                            right: 0,
                            top: 0,
                            backgroundColor: theme.palette.background.paper,
                            zIndex: 2,
                          }}
                        >
                          ACTION
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {employees.map((employee, index) => (
                        <TableRow
                          key={employee.id}
                        // sx={{
                        //   "&:hover": {
                        //     backgroundColor: "#f5f5f5",
                        //     cursor: "pointer",
                        //   },
                        //   height: "32px",
                        //   transition: "background-color 0.3s ease-in-out",
                        // }}
                        >
                          {/* Dynamically render cell data based on visible columns */}
                          {employeesAvailableColumns
                            .filter(
                              (col) =>
                                col.alwaysVisible ||
                                visibleEmployeesColumns.includes(col.key)
                            )
                            .map((column) => {
                              switch (column.key) {
                                case "sNo":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {index +
                                        1 +
                                        (pagination.page - 1) * pagination.limit}
                                    </TableCell>
                                  );
                                case "id":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {employee.user_admin_id}
                                    </TableCell>
                                  );
                                case "fullName":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {`${employee.first_name.charAt(0).toUpperCase() + employee.first_name.slice(1)} ${employee.last_name}`}
                                    </TableCell>
                                  );
                                case "city":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {employee.city_name}
                                    </TableCell>
                                  );
                                case "phone":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      +{employee.country_code}
                                      {employee.mobile_number}
                                    </TableCell>
                                  );
                                case "email":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {employee.email}
                                    </TableCell>
                                  );
                                case "cafeNameWithId":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {employee.cafe_name.charAt(0).toUpperCase() + employee.cafe_name.slice(1)}({employee.cafe_list_id}
                                      )
                                    </TableCell>
                                  );
                                case "role":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {roleMap[employee.user_role_id] ||
                                        "Unknown"}
                                    </TableCell>
                                  );
                                case "status":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      <Chip
                                        onClick={() => handleStatusClick(employee)}
                                        label={employee.status === 1 ? "Active" : "Inactive"}
                                        sx={{
                                          backgroundColor: employee.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                                          color: employee.status === 1 ? "#1b5e20" : "red", // dark green or orange
                                          // borderRadius: "999px",
                                          px: 2,
                                          py: 0.5,
                                          fontWeight: 600,
                                          fontSize: "0.75rem",
                                        }}
                                      />
                                    </TableCell>
                                  );

                                case "lastLogin":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {employee.last_loggedin_time || "-"}
                                    </TableCell>
                                  );
                                case "memberSince":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {new Date(
                                        employee.member_since
                                      ).toLocaleDateString()}
                                    </TableCell>
                                  );
                                case "ordersServed":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {employee.order_serve_count}
                                    </TableCell>
                                  );
                                case "uid":
                                  return (
                                    <TableCell sx={tableCellStyle} key={column.key}>
                                      {employee.uid}
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
                            }
                            }
                          >
                            <IconButton
                              onClick={(event) =>
                                handleMenuClick(event, employee.user_admin_id)
                              }
                              sx={{ color: "black" }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                            <Menu
                              anchorEl={anchorEl}
                              open={
                                Boolean(anchorEl) &&
                                currentEmployeeId === employee.user_admin_id
                              }
                              onClose={handleMenuClose}
                            >
                              <MenuItem
                                onClick={() => {
                                  handleViewProfileClick(employee.user_admin_id)
                                  handleMenuClose()
                                }
                                }
                              >
                                View Profile
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  handleEditProfileClick(employee.user_admin_id)
                                  handleMenuClose()
                                }
                                }
                              >
                                Edit Profile
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  handleresetPasswordClick(employee.user_admin_id)
                                  handleMenuClose()
                                }
                                }
                              >
                                Password Reset
                              </MenuItem>
                            </Menu>
                          </TableCell>
                        </TableRow>
                      ))}
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
      </Paper>
    </Box>
  );
};

export default EmployeesList;
