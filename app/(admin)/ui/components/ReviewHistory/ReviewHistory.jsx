import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
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
  Pagination,
  Select,
  FormControl,
  InputLabel,
  Modal,
  TextField,
  Button,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import axios from 'axios';

const ReviewHistory = ({ customer, onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageNo: 1, limits: 50, total: 0 });
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchReviews();
  }, [pagination.pageNo, pagination.limits]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/api/admin/customer/order-review/get/all`,
        {
          params: {
            userId: customer.user_customer_id,
            pageNo: pagination.pageNo,
            limits: pagination.limits,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("all reviews:",response.data)
      if (response.data.success) {
        setReviews(response.data.data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.total || 0,
        }));
      } else {
        console.error('Failed to fetch reviews:', response.data.msg);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, pageNo: newPage }));
  };

  const handleLimitChange = (event) => {
    setPagination((prev) => ({ ...prev, limits: event.target.value }));
  };

  const handleMenuClick = (event, reviewId) => {
    setAnchorEl(event.currentTarget);
    setCurrentReviewId(reviewId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentReviewId(null);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    console.log("review id in edit review:",review)
    setOpenEditModal(true);
    handleMenuClose();
  };

  const handleViewReview = async (reviewId) => {
    try {
      console.log("review id",reviewId)
      const response = await axios.get(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/order-review/${reviewId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("view review response-",response.data)
      
        const ratingData = response.data.getRatingData?.[0];
        const reviewData = response.data.getReviewData?.[0];

      console.log("rating :",ratingData.item_rating)
      console.log("review",reviewData.review_detail)
        setSelectedReview({
          item_rating: ratingData?.item_rating,
          review_detail: reviewData.review_detail,
        });
      setOpenViewModal(true);
      console.log("selected review :",selectedReview)
      
    } catch (error) {
      console.log('Error fetching review:', error);
      //alert('Error fetching review details.');
    }
    handleMenuClose();
  };

  const handleSaveEditReview = async () => {
    try {
      console.log("selected in edit save uid:",selectedReview)
      console.log("selected uid= ",selectedReview.order_review_id)
      const response = await axios.put(
        `${process.env.VITE_REACT_APP_BACKEND_URL}/edit-review/${selectedReview.order_review_id}`,
        {
          experience_rating: selectedReview.experience_rating,
          review_detail: selectedReview.review_detail,
          is_featured: selectedReview.featured ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
       // alert('Review updated successfully');
        fetchReviews();
        setOpenEditModal(false);
      } else {
        alert(response.data.msg);
      }
    } catch (error) {
      console.log('Error editing review:', error);
    }
  };
  
  useEffect(() => {
    console.log("Updated selectedReview:", selectedReview);
  }, [selectedReview]);

  return (
    <Box sx={{ p: 3, width:'90vw' }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="h5" fontWeight="bold">
            List Reviews
          </Typography>
        </Grid>
        <Grid
          sx={{ textAlign: 'right' }}
          size={{
            xs: 12,
            sm: 6
          }}>
          <Button variant="contained" color="primary" onClick={onBack}>
            Close
          </Button>
        </Grid>
      </Grid>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Grid
          size={{
            xs: 12,
            sm: 6
          }}>
          <Typography variant="h6" fontWeight="bold">
            Customer: {customer.first_name} {customer.last_name}
          </Typography>
        </Grid>
      </Grid>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>S.No</TableCell>
              <TableCell>Review UID</TableCell>
              <TableCell>Restaurant Name</TableCell>
              <TableCell>Experience Rating</TableCell>
              <TableCell>Review Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <TableRow key={review.order_review_id}>
                  <TableCell>{index + 1 + (pagination.pageNo - 1) * pagination.limits}</TableCell>
                  <TableCell>{review.order_review_id}</TableCell>
                  <TableCell>{review.cafe_name}</TableCell>
                  <TableCell>{review.overall_rate}</TableCell>
                  <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={review.is_featured === 1 ? 'Featured' : 'Not featured'}
                      color={review.is_featured === 1 ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(event) => handleMenuClick(event, review.order_review_id)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && currentReviewId === review.order_review_id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => handleViewReview(review.order_review_id)}>View Review</MenuItem>
                      <MenuItem onClick={() => handleEditReview(review)}>Edit Review</MenuItem>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No reviews found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Grid>
          <Typography variant="body2">
            Showing {Math.min((pagination.pageNo - 1) * pagination.limits + 1, pagination.total)} to{' '}
            {Math.min(pagination.pageNo * pagination.limits, pagination.total)} of {pagination.total} entries
          </Typography>
        </Grid>
        <Grid>
          <Pagination
            count={Math.ceil(pagination.total / pagination.limits)}
            page={pagination.pageNo}
            onChange={handlePageChange}
            color="primary"
          />
        </Grid>
        <Grid>
          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Items per page</InputLabel>
            <Select value={pagination.limits} onChange={handleLimitChange} label="Items per page">
                  <MenuItem value={50}>50</MenuItem>
                                                                     <MenuItem value={100}>100</MenuItem>
                                                                     <MenuItem value={200}>200</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      {/* Modal for editing review */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box sx={{ p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 24, maxWidth: 500, mx: 'auto', mt: 4 }}>
          <Typography variant="h6">Edit Review</Typography>
          <TextField
            fullWidth
            label="Experience Rating"
            type="number"
            value={selectedReview?.overall_rate || ''}
            onChange={(e) => setSelectedReview({ ...selectedReview, overall_rate: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Review Detail"
            value={selectedReview?.review_detail || ''}
            onChange={(e) => setSelectedReview({ ...selectedReview, review_detail: e.target.value })}
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Is Featured</InputLabel>
            <Select
              value={selectedReview?.is_featured || 0}
              onChange={(e) => setSelectedReview({ ...selectedReview, featured: e.target.value })}
              label="Is Featured"
            >
              <MenuItem value={1}>Featured</MenuItem>
              <MenuItem value={0}>Not Featured</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleSaveEditReview}>
            Save
          </Button>
        </Box>
      </Modal>
      {/* Modal for viewing review */}
      <Modal open={openViewModal} onClose={() => setOpenViewModal(false)}>
        <Box sx={{ p: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 24, maxWidth: 500, mx: 'auto', mt: 4 }}>
          <Typography variant="h6">View Review</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Rating:</strong> {selectedReview?.item_rating}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            <strong>Review:</strong> {selectedReview?.review_detail}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default ReviewHistory;
