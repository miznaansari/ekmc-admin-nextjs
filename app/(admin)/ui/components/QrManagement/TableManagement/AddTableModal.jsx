import React, { useState, useEffect, useCallback } from 'react';
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
import debounce from 'lodash.debounce';
import { Close } from '@mui/icons-material';

const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;

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

const AddTableModal = ({ open, handleClose }) => {
  const [cafeList, setCafeList] = useState([]);
  const [qrList, setQrList] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [tableTitle, setTableTitle] = useState('');
  const [selectedQR, setSelectedQR] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [isDefault, setIsDefault] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchCafeQuery, setSearchCafequery]=useState("");
  const theme= useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch cafe list
  // useEffect(() => {
  //   if(searchCafeQuery.trim().length >=2){
  //     const delayDebounce= setTimeout(()=>{
  //     fetchCafeList();
  //   },100)
    
  //   return ()=> clearTimeout(delayDebounce);
  //   }else{
  //     setCafeList([]);
  //   }
    
  // }, [searchCafeQuery]);

  // const fetchCafeList = async () => {
  //   try {
  //     setLoading(true)
  //     const token = localStorage.getItem('authToken');
  //     const response = await axios.get(`${baseUrl}/api/user/admin/cafe-list/get/all`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //       params:{
  //         s:searchCafeQuery
  //       }
  //     });
  //     if (response.data && response.data.success) {
  //       setCafeList(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching cafe list:', error);
  //     setError('Failed to fetch cafe list');
  //   }finally{
  //     setLoading(false);
  //   }
  // };

  const fetchQRListByCafe = async (cafeId) => {
    try {
      console.log("cafe id inside fetchqr list ", cafeId)
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/api/v1/search-qr`, {
        params: { cafe_list_id: cafeId },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.success) {
        setQrList(response.data.data);
        console.log(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      setQrList([]);
    }
  };

  const handleSave = async () => {
    if (!selectedCafe || selectedQR.length === 0 || tableTitle.trim() === '') {
      setError('Please ensure all fields are filled correctly and at least one QR code is selected.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      const postData = {
        cafe_list_id: selectedCafe.id, // Cafe selected by user
        is_active: isActive ? '1' : '0', // Active status
        table_title: tableTitle, // Table title
        is_default: isDefault ? '1' : '0', // Default status
        items: selectedQR.map((qr) => ({ qr_codes_id: qr.qr_codes_id })), // List of selected QR codes
      };
      console.log(postData)

      const response = await axios.post(`${baseUrl}/api/v1/cafe-tables`, postData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (response.data.status) {
        setSelectedCafe(null);
        setSelectedQR([]);
        setTableTitle('');
        setIsActive(false);
        setIsDefault(true);
        setCafeList([]);
        setQrList([]);
        setSearchCafequery('');
        handleClose();
      } else {
        throw new Error(response.data.msg || 'Failed to add table');
      }
    } catch (error) {
      console.error('Error adding table:', error);
      setError(error.message || 'Failed to add table');
    } finally {
      setLoading(false);
      setSelectedCafe(null);
        setSelectedQR([]);
        setTableTitle('');
        setIsActive(false);
        setIsDefault(true);
        setCafeList([]);
        setQrList([]);
        setSearchCafequery('');
        handleClose();
    }
  };

  //fetch cafe using debounce 
  const debouncedFetchCafeList = useCallback(
    debounce(async (query) => {
      if (query.trim().length < 2) return;
  
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${baseUrl}/api/user/admin/cafe-list/get/all`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { s: query },
        });
        if (response.data?.success) {
          setCafeList(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching cafe list:', error);
        setError('Failed to fetch cafe list');
      } finally {
        setLoading(false);
      }
    }, 300), // delay in ms
    []
  );
  

  useEffect(() => {
    if (!open) {
      // Clear all fields when modal closes
      setSelectedCafe(null);
      setSelectedQR([]);
      setTableTitle('');
      setIsActive(false);
      setIsDefault(true);
      setCafeList([]);
      setQrList([]);
      setSearchCafequery('');
      setError('');
    }
  }, [open]);
  
  return (
    <Drawer 
      anchor="right"
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
      }} 
    >
      <Box>
        <Box position={'sticky'} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
          <Paper sx={{ padding: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">Add Table</Typography>
              <IconButton onClick={handleClose}>
                <Close />
              </IconButton>
            </Stack>
          </Paper>
        </Box>
      
      <Box padding={1}>
        <Paper>
        <IconButton
          aria-label="close"
          onClick={handleClose}
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
          Add Table
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <Autocomplete
            options={cafeList}
            getOptionLabel={(option) => option.cafe_name}
            value={selectedCafe}
            
            onChange={(event, newValue) => {
              setSelectedCafe(newValue);
              console.log("selected cafe- ", newValue)
              if (newValue) {
                fetchQRListByCafe(newValue.id);
              } else {
                setQrList([]);
              }
            }}
            onInputChange={(_,inputValue)=>{
              setCafeList([]);
                setSearchCafequery(inputValue)
                debouncedFetchCafeList(inputValue); // Call debounced fetch
                

            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.cafe_name}
              </li>
            )}
            //renderInput={(params) => <TextField {...params} label="Restaurant Name" variant="outlined" />}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Restaurant Name"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {searchCafeQuery.trim().length >= 2 && loading ? (
                        <CircularProgress size={20} sx={{ mr: 2 }} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            
          />
        </FormControl>

        <TextField
          fullWidth
          label="Table Title"
          variant="outlined"
          value={tableTitle}
          onChange={(e) => setTableTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          {/* {loading ? (
            <CircularProgress size={24} sx={{ mx: 'auto' }} />
          ) : ( */}
            <Autocomplete
              multiple
              options={qrList}
              getOptionLabel={(option) => ` ${option.qr_uid}`} // Display both qr_codes_id and qr_uid
              value={selectedQR}
              onChange={(event, newValue) => {
                setCafeList([])
                setSelectedQR(newValue)
              }}
              renderInput={(params) => <TextField {...params} label="QR Codes" />}
              isOptionEqualToValue={(option, value) => option.qr_codes_id === value.qr_codes_id} // Compare by qr_codes_id
            />
          
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
          <Button variant="outlined" onClick={handleClose} disabled={loading}>
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

export default AddTableModal;
