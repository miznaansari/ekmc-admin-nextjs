import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  CircularProgress,
  Button,
  Pagination,
  Modal,
  TextField,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';
import ViewDetailOrder from './ViewDetailOrder'; // Import the ViewDetailOrder component

const OrderHistory = ({ customer, onBack }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [pageNo, setPageNo] = useState(1); // Default to page 1
  const [totalPages, setTotalPages] = useState(1); // Track total pages for pagination
  const [errorMessage, setErrorMessage] = useState(''); // To display error message
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [servedBy, setServedBy] = useState('');
  const [cancelFeedback, setCancelFeedback] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false); // For viewing order details
  const token = localStorage.getItem('authToken');
  const userId = customer.user_customer_id; // Assuming this is passed via the customer prop
  const limit = 10; // Number of items per page

  useEffect(() => {
    fetchOrders();
  }, [pageNo]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMessage(''); // Reset the error message before fetching data

      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/orderhistory`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            userId,
            pageno: pageNo,
            limits: limit,
          },
        }
      );

      if (response.data && response.data.success) {
        setOrders(response.data.data.data); // Assuming 'data' contains the orders array
        setTotalPages(response.data.data.lastPage || 1); // Update total pages based on the API response
      } else {
        console.error('Failed to fetch orders:', response.data.msg);
        setErrorMessage('Failed to fetch order data. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setErrorMessage('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, orderId) => {
    setAnchorEl(event.currentTarget);
    setCurrentOrderId(orderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentOrderId(null);
  };

  const handlePageChange = (event, value) => {
    setPageNo(value);
  };

  const handleEditOrderStatus = (order) => {
    setSelectedOrder(order);
    setOrderStatus(order.order_status); // Pre-fill the status field
    setServedBy(order.served_by || ''); // Pre-fill served_by if available
    setCancelFeedback(order.cancel_feedback || ''); // Pre-fill cancel_feedback if available
    setEditModalOpen(true);
    handleMenuClose();
  };

  const handleDeleteOrder = (order) => {
    setSelectedOrder(order);
    setDeleteModalOpen(true);
    handleMenuClose();
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order); // Set the selected order
    setShowOrderDetails(true); // Show the details component
    handleMenuClose();
  };

  const handleSaveOrderStatus = async () => {
    try {
      // if (!orderStatus || !selectedOrder.cafe_order_item_id) {
      //   console.log("order status:",orderStatus)
      //   console.log("selected order id",selectedOrder.cafe_order_item_id)
      //   console.error("Order status or selected order ID is missing");
      //   return;
      // }

      // Prepare the request body with all fields
      const requestBody = {
        status: orderStatus,  // New status for the order
        served_by: servedBy || "", // Optional field
        cancel_feedback: cancelFeedback || "", // Optional field
      };

      // Perform the API call to update the order status
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/order-status/${selectedOrder.cafe_order_item_id}`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("response of edit order ststus-",response.data)
      // Handle success response
      if (response.data.success) {
        setEditModalOpen(false); // Close the edit modal after success
        setSnackbarMessage('Order status updated successfully!');
        setShowSnackbar(true);
        fetchOrders(); // Refresh the orders list after successful update
      } else {
        console.error('Failed to update order status:', response.data.msg);
      }
    } catch (error) {
      console.error('Error updating order status:', error.response ? error.response.data : error.message);
    }
  };

  const handleConfirmDeleteOrder = async () => {
    try {
      if (!selectedOrder.id) {
        console.error("Order ID is missing");
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/delete-order`,
        {
          cafe_order_list_id: selectedOrder.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDeleteModalOpen(false); // Close the delete modal after success
        setSnackbarMessage('Order deleted successfully!');
        setShowSnackbar(true);
        fetchOrders(); // Refresh the orders list after deletion
      }
    } catch (error) {
      console.error('Error deleting order:', error.response ? error.response.data : error.message);
    }
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  if (showOrderDetails && selectedOrder) {
    return <ViewDetailOrder cafe_order_list_id={selectedOrder.cafe_order_list_id} />; // Render the ViewDetailOrder component
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
         {customer.first_name} {customer.last_name}
      </Typography>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={onBack} variant="contained" color="primary">
          Back to Customer List
        </Button>
      </Box>
      {errorMessage && (
        <Box color="error.main" sx={{ mb: 2 }}>
          <Typography>{errorMessage}</Typography>
        </Box>
      )}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  {/* <TableCell>Order History UID</TableCell> */}
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Restaurant Name</TableCell>
                  <TableCell>Billing Amount</TableCell>
                  {/* <TableCell>Order At</TableCell> */}
                  {/* <TableCell>Payment Mode</TableCell> */}
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>{(pageNo - 1) * limit + index + 1}</TableCell>
                      {/* <TableCell>{order.uid}</TableCell> */}
                      <TableCell>{order.first_name} {order.last_name}</TableCell>
                      <TableCell>{order.cafe_name}</TableCell>
                      <TableCell>₹{order.total_amount}</TableCell>
                      {/* <TableCell>{new Date(order.start_date_time).toLocaleString()}</TableCell> */}
                      {/* <TableCell>{order.payment_mode}</TableCell> */}
                      <TableCell>
                        <Chip
                          label={order.order_status === 2 ? 'Completed' : 'Cancelled'}
                          color={order.order_status === 2 ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={(event) => handleMenuClick(event, order.id)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && currentOrderId === order.id}
                          onClose={handleMenuClose}
                        >
                          <MenuItem onClick={() => handleEditOrderStatus(order)}>
                            Edit Status
                          </MenuItem>
                          <MenuItem onClick={() => handleDeleteOrder(order)}>
                            Delete Order
                          </MenuItem>
                          <MenuItem onClick={() => handleViewOrderDetails(order)}>
                            View Order Details
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={pageNo}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
      {/* Edit Order Status Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box bgcolor="background.paper" style={{
      position: 'absolute',
      right: 0,
      margin: '10% 10% 10% auto', // Adjusts the left margin to position it on the right
      maxWidth: '400px', // Set max width as needed
    }} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Edit Order Status
          </Typography>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Order Status"
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Served By"
                value={servedBy}
                onChange={(e) => setServedBy(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Cancel Feedback"
                value={cancelFeedback}
                onChange={(e) => setCancelFeedback(e.target.value)}
              />
            </Grid>
            <Grid size={12}>
              <Button variant="contained" color="primary" onClick={handleSaveOrderStatus}>
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
      {/* Delete Order Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box bgcolor="background.paper" style={{
      position: 'absolute',
      right: 0,
      margin: '10% 10% 10% auto', // Adjusts the left margin to position it on the right
      maxWidth: '400px', // Set max width as needed
    }} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Confirm Deletion
          </Typography>
          <Typography>
            Are you sure you want to delete this order?
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" color="secondary" onClick={handleConfirmDeleteOrder}>
              Yes, Delete
            </Button>
            <Button variant="outlined" color="primary" onClick={() => setDeleteModalOpen(false)} sx={{ ml: 2 }}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderHistory;
