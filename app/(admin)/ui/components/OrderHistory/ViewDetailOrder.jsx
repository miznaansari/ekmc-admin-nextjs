import React, { useEffect, useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Grid,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

import OrderHistory from '../OrderHistory/OrderHistory'; // Ensure this path is correct

const ViewDetailOrder = ({ cafe_order_list_id }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrderHistory, setShowOrderHistory] = useState(false); // Controls rendering of OrderHistory
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchOrderDetails(cafe_order_list_id);
  }, [cafe_order_list_id]);

  // Fetch order details
  const fetchOrderDetails = async (id) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/api/v1/order-history/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.order_list && response.data.order_list.length > 0) {
        setOrderDetails(response.data.order_list[0]);
      } else {
        setError('No order details found.');
      }
    } catch (err) {
      setError(err.message || 'Error fetching order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box color="error.main" sx={{ textAlign: "center" }}>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  // Conditionally render the OrderHistory component when the button is clicked
  if (showOrderHistory) {
    return <OrderHistory />; // Renders the OrderHistory component
  }

  return (
    <Box sx={{ maxWidth: '1200px', margin: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Order Details for Order ID: {cafe_order_list_id}
        </Typography>

        {/* Grid Layout for Order Details */}
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="UID" value={orderDetails.uid} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="Table ID" value={orderDetails.cafe_table_id} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="Customer Name" value={`${orderDetails.first_name} ${orderDetails.last_name}`} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="Restaurant Name" value={orderDetails.cafe_name} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="Billing Amount" value={`₹${orderDetails.total_amount}`} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="Payment Mode" value={orderDetails.payment_mode === 1 ? 'Cash' : 'Online'} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="Discount" value={`₹${orderDetails.discount_amount}`} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="Order Started At" value={new Date(orderDetails.start_date_time).toLocaleString()} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="Order Completed At" value={new Date(orderDetails.updated_at).toLocaleString()} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 12
            }}>
            <TextField fullWidth label="Approved By" value={orderDetails.approved_by || 'N/A'} variant="outlined" InputProps={{ readOnly: true }} />
          </Grid>
        </Grid>
      </Paper>
      {/* Ordered Items Accordion */}
      <Typography variant="h5" fontWeight="bold" sx={{ mt: 3 }}>Ordered Items</Typography>
      {orderDetails.cafe_order_item.map((item, index) => (
        <Accordion key={item.cafe_order_item_id} sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ flexShrink: 0, fontWeight: 'bold' }}>{index + 1}. {item.order_item_name} - ₹{item.order_item_price}</Typography>
            <Typography sx={{ color: item.status === 5 ? 'green' : 'red', ml: 2 }}>
              {item.status === 5 ? 'Completed' : 'Cancelled'}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Paper sx={{ p: 2, mb: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Typography fontWeight="bold">UID</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Price</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Quantity</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Served By</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Start Date/Time</Typography></TableCell>
                      <TableCell><Typography fontWeight="bold">Served Date/Time</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{item.uid}</TableCell>
                      <TableCell>₹{item.order_item_price}</TableCell>
                      <TableCell>{item.is_custom ? 'Custom' : 'Standard'}</TableCell>
                      <TableCell>{item.served_by || 'N/A'}</TableCell>
                      <TableCell>{new Date(item.book_date_time).toLocaleString()}</TableCell>
                      <TableCell>{new Date(item.serve_date_time).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Additional Information */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">Cooking Instructions: {item.cooking_instruction || 'None'}</Typography>
                <Typography variant="subtitle2" fontWeight="bold">Variant Name: {item.order_item_variant_name || 'N/A'}</Typography>
                <Typography variant="subtitle2" fontWeight="bold">Addon Names: {item.addon_list.length > 0
                  ? item.addon_list.map(addon => `${addon.order_addon_name} (₹${addon.order_addon_price})`).join(', ')
                  : 'No Addons'}
                </Typography>
              </Box>
            </Paper>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default ViewDetailOrder;
