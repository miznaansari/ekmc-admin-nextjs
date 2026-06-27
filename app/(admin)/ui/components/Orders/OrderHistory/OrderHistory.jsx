import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Paper,
  Pagination,
  Select,
  FormControl,
  InputLabel,
  Chip,
  InputAdornment,
  Grid
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import OrderDetailsModal from './OrderDetailsModal'; // Import the modal component
import { styled } from '@mui/system';
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import mapAdminAccess from "../../../mapAdminAccess.json"
import { useLocation } from 'react-router-dom';
const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

// Styled container with responsive design
const StyledContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  // overflow:"hidden",
  width: "100%", // ✅ Make it take full width of parent
  minWidth: "0", // ✅ Prevent overflow issues
  overflow: "auto", // ✅ Scroll when needed
  padding: theme.spacing(2), // Optional: add spacing
  minHeight: "100vh",
}));

// Styled table container with sticky header and scrollable body
const StyledTableContainer = styled(Paper)(({ theme }) => ({
  flex: 1,
  maxHeight: "450px", // ⬅️ Set desired height
  overflowY: "auto",
  border:"none"
}));

// Table header and cell styles
const tableHeaderCellStyle = {
  fontSize: "0.75rem",
  padding: "8px 12px",
  color: "#000",
  //fontWeight: "bold",
  borderBottom: "none",
  //borderBottom: "none",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",  
};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "8px 12px",
  color: "#000",
  
  borderBottom: "none",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",  
  border:"none"
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [editData, setEditData] = useState({
    status: '',
    served_by: '',
    cancel_feedback: '',
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/orderhistory`, {
        params: { pageno: page, limits: rowsPerPage },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setOrders(response.data.data.data);
        setTotalPages(response.data.data.lastPage);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const handleViewClick = (order) => {
    setSelectedOrder(order);
    setOpenViewModal(true);
    handleMenuClose();
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setEditData({
      status: order.order_status || '',
      served_by: order.served_by || '',
      cancel_feedback: order.cancel_feedback || '',
    });
    setOpenEditModal(true);
    handleMenuClose();
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setOpenDeleteModal(true);
    handleMenuClose();
  };

  const handleMenuClick = (event, orderId) => {
    setAnchorEl(event.currentTarget);
    setCurrentOrderId(orderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentOrderId(null);
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/order-status/${selectedOrder.id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarSeverity('success');
      setSnackbarMessage('Order updated successfully!');
      setSnackbarOpen(true);
      setOpenEditModal(false);
      fetchOrders();
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to update order');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/delete-order`, {
        cafe_order_list_id: selectedOrder.id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarSeverity('success');
      setSnackbarMessage('Order deleted successfully!');
      setSnackbarOpen(true);
      setOpenDeleteModal(false);
      fetchOrders();
    } catch (error) {
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to delete order');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRefresh = () => {
    fetchOrders();
  };




  
    
      // import mapAdminAccess from "../../mapAdminAccess.json"
    
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
    
      // {(userRole === '1' || hasWriteAccess) && (<>
    
      // </>)}
  

  return (
    <StyledContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        
              <Grid
                paddingTop={1}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4
                }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              Order History
            </Typography>
            <TextField
            
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
           {(userRole === '1' || hasWriteAccess) && (<>
    
        
        <Button variant="contained" 
        onClick={handleViewClick}
          sx={{
            width: "100px",       
            height: "30px",        
            borderRadius: "6px",  
            fontSize: "0.75rem",
          }}
        >
          ADD TABLE
        </Button>
      </>)}

      </Box>
      <StyledTableContainer
        elevation={0}
        sx={{
          boxShadow: "none",
          border: "none",
          outline: "none",
          backgroundColor: "transparent", // or 'inherit'
          borderRadius: 0, // sometimes needed
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={tableHeaderCellStyle}>S. NO.</TableCell>
              <TableCell sx={tableHeaderCellStyle}>UID</TableCell>
              <TableCell sx={tableHeaderCellStyle}>CUSTOMER NAME</TableCell>
              <TableCell sx={tableHeaderCellStyle}>CAFE NAME</TableCell>
              <TableCell sx={tableHeaderCellStyle}>BILLING AMOUNT</TableCell>
              <TableCell sx={tableHeaderCellStyle}>STATUS</TableCell>
              <TableCell sx={tableHeaderCellStyle}>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order, index) => (
              <TableRow key={order.id}>
                <TableCell sx={tableCellStyle}>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell sx={tableCellStyle}>{order.uid}</TableCell>
                <TableCell sx={tableCellStyle}>{`${order.first_name} ${order.last_name}`}</TableCell>
                <TableCell sx={tableCellStyle}>{order.cafe_name}</TableCell>
                <TableCell sx={tableCellStyle}>{order.total_amount || 'N/A'}</TableCell>
                <TableCell sx={tableCellStyle}>
                  {/* <Chip
                    label={order.order_status === 2 ? 'Completed' : 'Pending'}
                    color={order.order_status === 2 ? 'success' : 'warning'}
                    size="small"
                  /> */}
                  <Chip
                    label={order.order_status === 2 ? "Completed" : "Pending"}
                    sx={{
                        backgroundColor: order.order_status === 2 ? "#e8f5e9" : "#fff8e1", // light green or light yellow
                        color: order.order_status === 2 ? "#1b5e20" : "#ff6f00", // dark green or orange
                        borderRadius: "999px",
                        px: 2,
                        py: 0.5,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        }}
                    />
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <IconButton sx={{color:"black"}} onClick={(event) => handleMenuClick(event, order.id)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl) && currentOrderId === order.id}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={() => handleViewClick(order)}>View Details</MenuItem>
                    <MenuItem onClick={() => handleEditClick(order)}>Edit Order</MenuItem>
                    <MenuItem onClick={() => handleDeleteClick(order)}>Delete Order</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
      {/* Pagination and Rows per Page Controls */}
      {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2">
          Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, orders.length)} of {orders.length} entries
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography>Select Rows</Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 80, ml: 2 }}>
            <Select value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            sx={{ ml: 2 }}
          />
        </Box>
      </Box> */}
      <Grid
        container
        spacing={2}
        alignItems="center"
        sx={{
          
          px: 2,
          py: 1,
          //borderTop: "1px solid #e0e0e0",
          
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
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(e.target.value)}
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
              //count={Math.ceil(Recommendations.length / limit)}
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
      {/* View Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          open={openViewModal}
          handleClose={() => setOpenViewModal(false)}
          orderData={selectedOrder}
        />
      )}
      {/* Edit Order Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Order</DialogTitle>
        <DialogContent>
          <TextField
            label="Status"
            fullWidth
            margin="normal"
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
          />
          <TextField
            label="Served By"
            fullWidth
            margin="normal"
            value={editData.served_by}
            onChange={(e) => setEditData({ ...editData, served_by: e.target.value })}
          />
          <TextField
            label="Cancel Feedback"
            fullWidth
            margin="normal"
            value={editData.cancel_feedback}
            onChange={(e) => setEditData({ ...editData, cancel_feedback: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this order?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button onClick={handleDeleteSubmit} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
};

export default OrderHistory;
