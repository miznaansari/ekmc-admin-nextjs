import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Modal,
  Chip,
  Button,
  TextField,
  Grid,
  Snackbar,
  Alert as MuiAlert,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/system';
import RefreshIcon from '@mui/icons-material/Refresh';
import Pagination from '@mui/material/Pagination';
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import { MoreVertical24Filled } from '@fluentui/react-icons';
import { useLocation } from 'react-router-dom';
import mapAdminAccess from "../../../mapAdminAccess.json"

const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const SlideInBox = styled(Box)(({ theme }) => ({
  animation: `slideIn 0.5s ease-out`,
  '@keyframes slideIn': {
    '0%': {
      transform: 'translateY(-50%)',
      opacity: 0,
    },
    '100%': {
      transform: 'translateY(0)',
      opacity: 1,
    },
  },
}));

const StyledContainerLarge = styled(Box)(({ theme }) => ({
   // padding: theme.spacing(1),
   backgroundColor: theme.palette.background.paper,
   //borderRadius: theme.shape.borderRadius,
   boxShadow: theme.shadows[1],
   //minHeight: "70vh",
   //width: "93vw",
   display: "flex",
   flexDirection: "column",
   flexGrow: 1,
  //  overflow:"hidden",
   width: "100%", // ✅ Make it take full width of parent
   minWidth: "0", // ✅ Prevent overflow issues
   overflow: "auto", // ✅ Scroll when needed
   padding: theme.spacing(2), // Optional: add spacing
   minHeight: "100vh",
 
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  maxHeight: "450px", // ⬅️ Set desired height
  overflowY: "auto",
  border:"none"
}));

const PaginationContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const tableHeaderCellStyle = {
  fontSize: "0.75rem",
  padding: "8px 12px",
  color: "#000",
  //fontWeight: "bold",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",  
  borderBottom: "none"

};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "8px 12px",
  color: "#000",
  // transition: "all 0.2s ease",
  // "&:hover": {
  //   backgroundColor: "#f5f5f5",
  // },
  // whiteSpace: "nowrap",
  borderBottom: "none",
  //borderBottom: "none",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",  
  border:"none"
};

const LiveOrder = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [status, setStatus] = useState('');
  const [servedBy, setServedBy] = useState('');
  const [cancelFeedback, setCancelFeedback] = useState('');

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [limit , setLimit]=useState(10);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchLiveOrders();
  }, [page, rowsPerPage]);

  const fetchLiveOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/live-orders?limits=${rowsPerPage}&pageno=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setOrders(response.data.data.data);
        setTotalPages(response.data.data.lastPage);
      } else {
        console.error('Failed to fetch live orders:', response.data.msg);
      }
    } catch (error) {
      console.error('Error fetching live orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditModalOpen(false); // Close edit modal if open
  };

  const handleEditClick = () => {
    setStatus(selectedOrder.status || '');
    setServedBy(selectedOrder.served_by || '');
    setCancelFeedback(selectedOrder.cancel_feedback || '');
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/order-status/${selectedOrder.id}`,
        {
          status,
          served_by: servedBy,
          cancel_feedback: cancelFeedback,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status) {
        setSnackbarSeverity('success');
        setSnackbarMessage('Order updated successfully!');
        fetchLiveOrders(); // Refresh orders after editing
        handleCloseModal(); // Close all modals
      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage('Failed to update order.');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Error updating order.');
    }
    setSnackbarOpen(true);
  };

  const handleRefresh = () => {
    fetchLiveOrders();
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
    <StyledContainerLarge>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 ,border: 'none', boxShadow: 'none', outline: 'none' }}>
      <Grid
        paddingTop={1}
        size={{
          xs: 12,
          sm: 6,
          md: 4
        }}>
  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
    <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
      Live Orders
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
      
        <Button
        onClick={handleViewDetails}
          variant='contained'
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
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
        <StyledTableContainer component={Paper} elevation={0}
        sx={{
          boxShadow: "none",
          border: "none",
          outline: "none",
          backgroundColor: "transparent", // or 'inherit'
          borderRadius: 0, // sometimes needed
        }}>
          <Table stickyHeader sx={{border: 'none', boxShadow: 'none', outline: 'none' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderCellStyle}>S.NO.</TableCell>
                <TableCell sx={tableHeaderCellStyle}>UID</TableCell>
                <TableCell sx={tableHeaderCellStyle}>CUSTOMUR NAME</TableCell>
                <TableCell sx={tableHeaderCellStyle}>CAFE NAME</TableCell>
                <TableCell sx={tableHeaderCellStyle}>ITEM NAME</TableCell>
                <TableCell sx={tableHeaderCellStyle}>PRICE</TableCell>
                <TableCell sx={tableHeaderCellStyle}>ORDER DATE</TableCell>
                <TableCell sx={tableHeaderCellStyle}>STATUS</TableCell>
                <TableCell sx={tableHeaderCellStyle}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order,index) => (
                <TableRow key={order.id}>
                  <TableCell sx={tableCellStyle}>
                    {index + 1 + (page - 1) * limit}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>{order.uid}</TableCell>
                  <TableCell sx={tableCellStyle}>
                    {order.first_name} {order.last_name}
                  </TableCell>
                  <TableCell sx={tableCellStyle}>{order.cafe_name}</TableCell>
                  <TableCell sx={tableCellStyle}>{order.custom_item_name || order.order_item_name}</TableCell>
                  <TableCell sx={tableCellStyle}>₹{order.order_item_price}</TableCell>
                  <TableCell sx={tableCellStyle}>{new Date(order.book_date_time).toLocaleString()}</TableCell>
                  <TableCell sx={tableCellStyle}>
                  <Chip
                                  label={order.status === 2 ? "Delivered" : "Pending"}
                                  sx={{
                                    backgroundColor: order.status === 2 ? "#e8f5e9" : "#fff8e1", // light green or light yellow
                                    color: order.status === 2 ? "#1b5e20" : "#ff6f00", // dark green or orange
                                    borderRadius: "999px",
                                    px: 2,
                                    py: 0.5,
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                  }}
                                />
                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    {/* <Button variant="contained" color="primary" onClick={() => handleViewDetails(order)}>
                      View Details
                    </Button> */}
                    <Button onClick={() => handleViewDetails(order)}>
                      <MoreVertical24Filled></MoreVertical24Filled>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}
      {/* <PaginationContainer>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography>Select no.</Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}>
            <Select value={rowsPerPage} onChange={(e) => setRowsPerPage(e.target.value)}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </FormControl>
          <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" sx={{ marginLeft: 2 }} />
        </Box>
      </PaginationContainer> */}
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
      {/* View Order Details Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal} closeAfterTransition>
        <SlideInBox sx={{ p: 4, bgcolor: 'background.paper', boxShadow: 24, borderRadius: 2, mx: 'auto', overflowY: 'auto' }}>
          {selectedOrder && (
            <>
              <Typography variant="h5" gutterBottom component="div">
                View Order Info
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField label="Order UID" fullWidth value={selectedOrder.uid} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Customer Name"
                    fullWidth
                    value={`${selectedOrder.first_name} ${selectedOrder.last_name}`}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    label="Menu Item"
                    fullWidth
                    value={selectedOrder.custom_item_name || selectedOrder.order_item_name}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField label="Price" fullWidth value={`₹${selectedOrder.order_item_price}`} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid size={12}>
                  <TextField label="Restaurant Name" fullWidth value={selectedOrder.cafe_name} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Order Date/Time"
                    fullWidth
                    value={new Date(selectedOrder.book_date_time).toLocaleString()}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField label="Status" fullWidth value={selectedOrder.status === 2 ? 'Delivered' : 'Pending'} InputProps={{ readOnly: true }} />
                </Grid>
                <Grid size={12}>
                  <TextField label="Cooking Instructions" fullWidth value={selectedOrder.cooking_instruction || 'None'} InputProps={{ readOnly: true }} multiline />
                </Grid>
                <Grid size={12}>
                  <TextField
                    label="Served At"
                    fullWidth
                    value={selectedOrder.serve_date_time ? new Date(selectedOrder.serve_date_time).toLocaleString() : 'Not served yet'}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField label="Served By" fullWidth value={selectedOrder.served_by || 'Not yet served'} InputProps={{ readOnly: true }} />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Button sx={{ mr: 1 }} onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button color="primary" onClick={handleEditClick}>
                  Edit
                </Button>
              </Box>
            </>
          )}
        </SlideInBox>
      </Modal>
      {/* Edit Order Status Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} closeAfterTransition>
        <SlideInBox sx={{ p: 4, bgcolor: 'background.paper', boxShadow: 24, borderRadius: 2, mx: 'auto', overflowY: 'auto' }}>
          <Typography variant="h5" gutterBottom>
            Edit Order Status
          </Typography>
          <TextField
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Served By"
            value={servedBy}
            onChange={(e) => setServedBy(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Cancel Feedback"
            value={cancelFeedback}
            onChange={(e) => setCancelFeedback(e.target.value)}
            fullWidth
            multiline
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setEditModalOpen(false)} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleEditSubmit}>
              Save
            </Button>
          </Box>
        </SlideInBox>
      </Modal>
      {/* Snackbar for success or error messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
        <MuiAlert elevation={6} variant="filled" onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </StyledContainerLarge>
  );
};

export default LiveOrder;
