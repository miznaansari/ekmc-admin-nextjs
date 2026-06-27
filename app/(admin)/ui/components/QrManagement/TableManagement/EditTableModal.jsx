import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  FormControl,
  Switch,
  IconButton,
  Autocomplete,
  CircularProgress,
  Alert,
  Drawer,
  useMediaQuery,
  useTheme,
  Paper,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Close } from '@mui/icons-material';

const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const EditTableModal = ({ open, handleClose, tableData }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantId, setRestaurantId] = useState(null);
  const [qrList, setQrList] = useState([]);
  const [selectedQR, setSelectedQR] = useState([]);
  const [tableTitle, setTableTitle] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme= useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const resetState = () => {
    setRestaurantName('');
    setRestaurantId(null);
    setQrList([]);
    setSelectedQR([]);
    setTableTitle('');
    setIsActive(false);
    setIsDefault(false);
    setError('');
  };

  const handleCloseWithReset = () => {
    resetState();
    handleClose();
  };

  useEffect(() => {
    if (open && tableData?.cafe_tables_id) {
      fetchTableData(tableData.cafe_tables_id);
    }
  }, [open, tableData]);

  const fetchTableData = async (tableId) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/api/v1/cafe-tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status) {
        const tableDetails = response.data.tablesData[0];
        setRestaurantName(tableDetails?.cafe_name || '');
        setRestaurantId(tableDetails?.cafe_list_id || null);
        setTableTitle(tableDetails?.table_title || '');
        setIsActive(Boolean(tableDetails?.is_active));
        setIsDefault(Boolean(tableDetails?.is_default));
        setSelectedQR(tableDetails?.qr_data || []);
        if (tableDetails?.cafe_list_id) {
          fetchQRListByCafe(tableDetails.cafe_list_id);
        }
      } else {
        throw new Error(response.data.msg || 'Failed to fetch table data');
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchQRListByCafe = async (cafeId) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/api/v1/search-qr`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { cafe_list_id: cafeId },
      });

      if (response.data.success) {
        setQrList(response.data.data || []);
      } else {
        throw new Error(response.data.msg || 'Failed to fetch QR codes');
      }
    } catch (error) {
      console.error('Error fetching QR list:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!restaurantId || selectedQR.length === 0 || tableTitle.trim() === '') {
      setError('All fields are required. Please complete the form.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      console.log("selcted qrs- ", selectedQR)
      const selectedQRIds = selectedQR.map((qr) => ({ qr_codes_id: qr.qr_codes_id }));
      const putData = {
        cafe_tables_id: tableData.cafe_tables_id,
        table_title: tableTitle,
        is_active: isActive ? '1' : '0',
        is_default: isDefault ? 1 : 0,
        items: selectedQRIds,
      };

      const response = await axios.put(`${baseUrl}/api/v1/cafe-table`, putData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.data.status) {
        handleCloseWithReset();
      } else {
        throw new Error(response.data.msg || 'Failed to update table');
      }
    } catch (error) {
      console.error('Error saving table:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer 
      anchor='right'
      open={open} 
      // onClose={handleCloseWithReset}
      PaperProps={{
        sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
      }} 
    >
    <Box>
        <Box position={'sticky'} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
          <Paper sx={{ padding: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Edit Table</Typography>
              <IconButton onClick={handleClose}>
                <Close />
              </IconButton>
            </Stack>
          </Paper>
        </Box>

      <Box padding={1}>
      <Paper sx={{p:1}}>
        <IconButton
          aria-label="close"
          onClick={handleCloseWithReset}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" gutterBottom>
          Edit Table
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          fullWidth
          label="Restaurant Name"
          value={restaurantName}
          InputProps={{ readOnly: true }}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Table Title"
          value={tableTitle}
          onChange={(e) => setTableTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          {loading ? (
            <CircularProgress size={24} sx={{ mx: 'auto' }} />
          ) : (
            <Autocomplete
              multiple
              options={qrList}
              getOptionLabel={(option) => ` ${option.qr_uid}`} // Display both qr_codes_id and qr_uid
              value={selectedQR}
              onChange={(event, newValue) => setSelectedQR(newValue)}
              renderInput={(params) => <TextField {...params} label="QR Codes" />}
              isOptionEqualToValue={(option, value) => option.qr_codes_id === value.qr_codes_id} // Compare by qr_codes_id
            />
          )}
        </FormControl>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ mr: 2 }}>Active</Typography>
          <Switch color='secondary' checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ mr: 2 }}>Set as Default</Typography>
          <Switch color='secondary' checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
        </Box>

        {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="outlined" onClick={handleCloseWithReset} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save'}
          </Button>
        </Box> */}

        <Box position="sticky" bottom={0} sx={{ width: "100%", p: 2, zIndex: 999, bgcolor: "#F7F7F7", display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            color='error' 
            sx={{ flex: 1 }} 
            onClick={handleClose} 
          >
            Cancel
          </Button>
          <Button sx={{ flex: 1 }} variant="contained" onClick={handleSave} disabled={loading}>
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save'}
          </Button>
        </Box>
      </Paper>
      </Box>
    </Box>
    </Drawer>
  );
};

export default EditTableModal;
