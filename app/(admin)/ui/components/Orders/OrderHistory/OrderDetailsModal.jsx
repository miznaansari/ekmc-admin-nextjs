import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const OrderDetailsModal = ({ open, handleClose, orderData }) => {
  if (!orderData) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Orders History Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid size={6}>
            <Typography variant="subtitle2">UID</Typography>
            <Typography>{orderData.uid}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2">Table ID</Typography>
            <Typography>{orderData.cafe_table_id}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2">Customer Name</Typography>
            <Typography>{`${orderData.first_name} ${orderData.last_name}`}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2">Restaurant Name</Typography>
            <Typography>{orderData.cafe_name}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2">Billing Amount</Typography>
            <Typography>{orderData.total_amount || 'N/A'}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2">Payment Mode</Typography>
            <Typography>{orderData.payment_mode || 'N/A'}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2">Order Started</Typography>
            <Typography>{orderData.start_date_time}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2">Order Completed</Typography>
            <Typography>{orderData.end_date_time}</Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="subtitle2">Approved By</Typography>
            <Typography>{orderData.approved_by || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom mt={4}>
          Order Items
        </Typography>

        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Menu Item Name</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Served By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderData.cafe_order_item && orderData.cafe_order_item.length > 0 ? (
                orderData.cafe_order_item.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.order_item_name}</TableCell>
                    <TableCell>{item.order_item_price}</TableCell>
                    <TableCell>{item.status === 5 ? 'Completed' : 'Pending'}</TableCell>
                    <TableCell>{item.quantity || 1}</TableCell>
                    <TableCell>{item.served_by || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>No items available for this order.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailsModal;
