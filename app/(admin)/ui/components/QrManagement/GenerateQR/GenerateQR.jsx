import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Button,
  Pagination,
  Alert,
  Modal,
  IconButton,
  Checkbox,
  Autocomplete,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  // MuiAlert,
  InputAdornment,
  Chip,
  Drawer,
  useMediaQuery,
  Stack,
} from '@mui/material';
import BulkQRDownload from "./BulkQRDownload";
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import { Grid, styled, useTheme } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import { Checkmark24Regular } from '@fluentui/react-icons';
import { ArrowDownload24Filled } from '@fluentui/react-icons';
// import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Check, Close } from '@mui/icons-material';
import QRcodelatest from './QRcodelatest';
import QRcodelatestView from './QRcodelatestView';
import { useLocation, useNavigate } from '@/ui/utils/nextRouting';

import mapAdminAccess from "../../../mapAdminAccess.json"
import FrameBulkQRDownload from './FrameBulkQRDownload';
import QRVerification from './QRVerification';
const iconBoxStyle = {
  width: 24,
  height: 24,
  border: '1px solid #ccc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
};

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

const StyledContainerLarge = styled(Box)(({ theme }) => ({
  // marginTop: theme.spacing(1),
  // marginBottom: theme.spacing(1),
  // padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  //minHeight: "70vh",
  //width: "93vw",
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
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  maxHeight: "calc(89vh - 136px)", // ⬅️ Set desired height
  overflowY: "auto",
  overflowX: "auto",
}));

const tableHeaderCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  color: "#000",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",
  borderBottom: "none",

};

// Enhanced header style for sortable columns
const sortableHeaderCellStyle = {
  ...tableHeaderCellStyle,
  cursor: 'pointer',
  userSelect: 'none',
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  color: "#000",
  cursor: 'pointer',
  // transition: "all 0.2s ease",
  // "&:hover": {
  //   backgroundColor: "#f5f5f5",
  // },
  // whiteSpace: "nowrap",
  borderBottom: "none",
  //borderBottom: "none",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",

};

const GenerateQR = () => {

  const navigate  = useNavigate();
  const [qrCodes, setQrCodes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const [rowsPerPage, setRowsPerPage] = useState(100); // Rows per page
  const [totalEntries, setTotalEntries] = useState(0); // Total entries from the API
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false); // For download modal
  const [selectedQR, setSelectedQR] = useState(null); // Selected QR for download
  const [selectedQrs, setSelectedQrs] = useState([]); // State for selected QR codes
  const [openGenerateQRModal, setOpenGenerateQRModal] = useState(false); // For Generate QR modal
  const [amount, setAmount] = useState(''); // To input amount for QR generation
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [cafeList, setCafeList] = useState([]); // Cafe list for the dropdown
  const [selectedCafe, setSelectedCafe] = useState([]); // Selected cafe for the assignment
  const [assignModalOpen, setAssignModalOpen] = useState(false); // State to control Assign Modal
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;
  const [loadingCreateQr, setLodingCreateQr] = useState(false);
  const theme = useTheme();
  const [searchCafeQuery, setSearchCafeQuery] = useState("");
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const token = localStorage.getItem('authToken');

  const [isActive, setIsActive] = useState(true);

  //fetch restaurant section
  const [searchRestaurantQuery, setSearRestaurantchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState();

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null, // null, 'asc', 'desc'
  });

  //fetch restaurants
  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`${process.env.VITE_REACT_APP_BACKEND_URL}/api/user/admin/cafe-list/get/all`, {
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



  useEffect(() => {
    fetchQRCodes();
  }, [page, rowsPerPage, search, restaurantId, isActive]);

  const fetchQRCodes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/api/v1/qr-codes`, {
        params: {
          pageno: page, limits: rowsPerPage, s: search, cafe_list_id: restaurantId,
          // is_active:isActive? 1:0
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.success) {
        setQrCodes(response.data.data.data);
        setTotalPages(response.data.data.lastPage);
        setTotalEntries(response.data.data.total); // Get total entries from API response
        setError('');
      }
    } catch (error) {
      navigate('/login');
      setError('Failed to fetch QR codes. Make sure you are authorized.');
    }
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null; // Reset to no sorting
        setSortConfig({ key: null, direction: null });
        return;
      }
    }

    setSortConfig({ key, direction });
  };

  // Sort the QR codes based on current sort config
  const sortedQrCodes = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return qrCodes; // Return original order if no sorting
    }

    return [...qrCodes].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'uid':
          aValue = a.qr_uid;
          bValue = b.qr_uid;
          break;
        case 'totalScans':
          aValue = parseInt(a.total_scans) || 0;
          bValue = parseInt(b.total_scans) || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'status':
          aValue = a.is_active;
          bValue = b.is_active;
          break;
        default:
          return 0;
      }

      if (sortConfig.direction === 'asc') {
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      } else {
        if (aValue > bValue) return -1;
        if (aValue < bValue) return 1;
        return 0;
      }
    });
  }, [qrCodes, sortConfig]);

  // Function to render sort icon
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return null; // No icon when not sorting by this column
    }

    if (sortConfig.direction === 'asc') {
      return <ArrowDropUpIcon sx={{ fontSize: '1rem', ml: 0.5 }} />;
    } else if (sortConfig.direction === 'desc') {
      return <ArrowDropDownIcon sx={{ fontSize: '1rem', ml: 0.5 }} />;
    }

    return null;
  };

  const fetchCafeList = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/api/user/admin/cafe-list/get/all`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          s: searchCafeQuery
        }
      });

      console.log("response of cafe list = ", response)

      if (response.data && response.data.success) {
        setCafeList(response.data.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Step 1: Check for 400 status
        navigate('/login'); // Redirect to login page
      }
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchCafeQuery) {
        fetchCafeList();
      }
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchCafeQuery])

  const handleGenerateQRClick = () => {
    setOpenGenerateQRModal(true); // Open modal to generate QR
  };
  const handleGenerateQRSubmit = async () => {
    try {
      setLodingCreateQr(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${baseUrl}/api/v1/qr-codes`,
        { amount },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 201) {
        setSnackbarSeverity('success');
        setSnackbarMessage('QR Code generated successfully!');
        //await fetchQRCodes(); // Use await to ensure this compl etes
        setSnackbarOpen(true);

      } else {
        setSnackbarSeverity('error');
        setSnackbarMessage('Failed to generate QR Code.');
        setSnackbarOpen(true)
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      setSnackbarSeverity('error');
      setSnackbarMessage('Error generating QR Code.');
      setSnackbarOpen(true)
    } finally {
      setLodingCreateQr(false);
      setOpenGenerateQRModal(false); // Close the modal after generation
      setAmount(''); // Reset the amount
      // // Set snackbar open as the LAST action to ensure all other state is set
      // setSnackbarOpen(true);
    }
  };
  const handleAssignClick = () => {
    // Fetch cafe list before opening the modal
    setAssignModalOpen(true);
  };

  const handleAssignConfirm = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `${baseUrl}/api/v1/qr-assign`,
        {
          cafe_list_id: selectedCafe?.id,
          is_active: true, // Assuming you want to mark them as active
          items: selectedQrs.map((id) => ({ qr_codes_id: id.id })),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("response=", response.data)

      if (response.data && response.data.status) {
        setAssignModalOpen(false);
        setSelectedQrs([]); // Clear the selected QRs
        fetchQRCodes(); // Refresh QR codes after assignment
        setSnackbarSeverity('success');
        setSnackbarMessage('Assigned qr code successfully!!');
        setSnackbarOpen(true)

      }
    } catch (error) {
      console.error('Error assigning QR codes:', error);
      setError('Failed to assign QR codes.');
      setSnackbarSeverity('error');
      setSnackbarMessage('Error: Failed to assign QR !!');
      setSnackbarOpen(true)
    }
  };

  const handleDownloadClick = (qr) => {
    setSelectedQR(qr);
    setOpenModal(true); // Open the download modal
  };

  const handleCheckboxChange = (qr) => {
    const isSelected = selectedQrs.some((item) => item.id === qr.id);
    if (isSelected) {
      setSelectedQrs(selectedQrs.filter((item) => item.id !== qr.id));
    } else {
      setSelectedQrs([...selectedQrs, qr]);
    }

  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedQR(null); // Clear the selected QR
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSelectPage = (event, newPage) => {
    setPage(newPage)
  }

  const testSnackbar = () => {
    setSnackbarMessage('Test message');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      if (value > 1000) {
        setSnackbarOpen(true)
        setSnackbarMessage("please enter less than 1000")
      } else {
        setAmount(value);
      }
    }
  };

  //handle  ststus clickk

  const handleStatusClick = async (qr) => {
    console.log("qr= ", qr)
  }


  const bulkRef = useRef();
  const handleDownloadAll = () => {
    bulkRef.current.downloadAll();
  };

  const bulkRefsvg = useRef();
  const handleDownloadAllSVG = () => {
    bulkRefsvg.current.downloadAll();
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


  const isAllSelected =
    sortedQrCodes.length > 0 &&
    sortedQrCodes.every((qr) =>
      selectedQrs.some((item) => item.id === qr.id)
    );

  const isIndeterminate =
    selectedQrs.length > 0 && !isAllSelected;

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      setSelectedQrs(sortedQrCodes);
    } else {
      setSelectedQrs([]);
    }
  };

   const [isQrFrame, setIsQrFrame] = useState(false);

  const handleChangeQR = (event) => {
    setIsQrFrame(event.target.checked);
  };

  return (
    <Box paddingTop={2}>
      <Paper>
        <Grid
          container
          spacing={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ overflow: "hidden" }}
        >
          <Grid
            paddingTop={1}
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                Generates Qr Code
              </Typography>
              <TextField
                onChange={(e) => setSearch(e.target.value)}
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
                sx={{ width: 230 }}
              />

              <Autocomplete
                options={restaurants}
                getOptionKey={(option) => option.value}
                getOptionLabel={(option) => option && option.label ? option.label : ''}
                                renderOption={(props, option) => (
                                  <li {...props} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 8 }}>
                                    <span style={{ fontSize: '1rem', color: '#222' }}>{option.label}</span>
                                    {option.city_name && (
                                      <span style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>{option.city_name}</span>
                                    )}
                                  </li>
                                )}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                onChange={(event, selectedOption) => {
                  setRestaurantId(selectedOption?.value || null);
                }}
                onInputChange={(_, inputValue) => {
                  setRestaurants([]);
                  setSearRestaurantchQuery(inputValue);
                }}
                sx={{ width: 240 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter By Restaurant"
                    variant="outlined"
                    size="small"
                    margin="dense"
                    InputProps={{
                      ...params.InputProps,
                    }}
                    InputLabelProps={{
                      ...params.InputLabelProps,
                    }}
                    helperText={
                      (() => {
                        const selected = restaurants.find(r => r.value === params.inputProps.value || r.label === params.inputProps.value);
                       
                        return null;
                      })()
                    }
                  />
                )}
              />
            </Box>
          </Grid>
          <Grid
            display="flex"
            gap={1}
            sx={{
              textAlign: { xs: "left", sm: "right" },

            }}
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={()=>{
                navigate('/verifyQR')}
              }
              >Qr Verfication</Button>
            <Button
              variant="outlined"
              color="primary"
          
              onClick={() => setIsActive(!isActive)}
            >
              {isActive ? "Active QR's" : "InActive QR's"}
            </Button>
            {selectedQrs.length >= 1 ? (
              <Grid container spacing={2} mt={1}>
                {(userRole === "1" || hasWriteAccess) && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setAssignModalOpen(true)}
                  >
                    ASSIGN QR
                  </Button>
                )}<div>
            <Box onClick={() => setIsQrFrame((prev) => !prev)} sx={{ cursor: "pointer",
          userSelect: "none", display: "flex", alignItems: "center", gap: 1 }}>
        <Checkbox
          checked={isQrFrame}
          onChange={handleChangeQR}
          sx={{
            padding: 0,
            width: 28,
            height: 28,
          }}
        />

        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Add QR Frame
        </Typography>
      </Box>
                </div>

                <div>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleDownloadAll}
                  >
                    Download All PNG
                  </Button>
                  {isQrFrame && (
                    <FrameBulkQRDownload
                      ref={bulkRef}
                      datas={selectedQrs}
                      format="png"
                    />
                  )}
                   {!isQrFrame && (
                  <BulkQRDownload
                    ref={bulkRef}
                    datas={selectedQrs}
                    format="png"
                  />
                  )}

                </div>

                <div>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleDownloadAllSVG}
                  >
                    Download All SVG
                  </Button>
                  {isQrFrame ? (
                    <FrameBulkQRDownload
                      ref={bulkRefsvg}
                      datas={selectedQrs}
                      format="svg"
                    />
                  ) : (
                    <BulkQRDownload
                      ref={bulkRefsvg}
                      datas={selectedQrs}
                      format="svg"
                    />
                  )}
                </div>
              </Grid>
            ) : (
              (userRole === "1" || hasWriteAccess) && (
                <Button
                  variant="contained"
                  onClick={handleGenerateQRClick}
               
                >
                  CREATE QR
                </Button>
              )
            )}

          </Grid>
        </Grid>

        {selectedQrs.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="h6" color="textSecondary" sx={{ m: 1 }}>
              Selected Qr&apos;s: {selectedQrs.length}
            </Typography>
            {selectedQrs.map((item) => (
              <Chip
                label={item.qr_uid}
                key={item.id}
                onClick={() => {
                  if (window.confirm(`Remove QR ${item.qr_uid}?`)) {
                    setSelectedQrs((prev) => prev.filter((q) => q.id !== item.id));
                  }
                }}
                sx={{ mr: 1, mb: 1, cursor: "pointer" }}
              />
            ))}
          </Box>
        )}


        <StyledTableContainer component={Paper} elevation={0}
          sx={{
            boxShadow: "none",
            border: "none",
            outline: "none",
            backgroundColor: "transparent", // or 'inherit'
            borderRadius: 0, // sometimes needed
          }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={tableHeaderCellStyle}>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={handleSelectAllChange}
                    sx={{
                      padding: 0,
                      width: 28,
                      height: 28,
                    }}
                  />
                </TableCell>

                <TableCell sx={tableHeaderCellStyle}>S. NO.</TableCell>

                {/* Sortable UID column */}
                <TableCell
                  sx={sortableHeaderCellStyle}
                  onClick={() => handleSort('uid')}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    UID
                    {renderSortIcon('uid')}
                  </Box>
                </TableCell>

                <TableCell sx={tableHeaderCellStyle}>ASSIGNED</TableCell>

                {/* Sortable TOTAL SCAN column */}
                <TableCell
                  sx={sortableHeaderCellStyle}
                  onClick={() => handleSort('totalScans')}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    TOTAL SCAN
                    {renderSortIcon('totalScans')}
                  </Box>
                </TableCell>

                {/* Sortable CREATED AT column */}
                <TableCell
                  sx={sortableHeaderCellStyle}
                  onClick={() => handleSort('createdAt')}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    CREATED AT
                    {renderSortIcon('createdAt')}
                  </Box>
                </TableCell>

                {/* Sortable STATUS column */}
                <TableCell
                  sx={sortableHeaderCellStyle}
                  onClick={() => handleSort('status')}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    STATUS
                    {renderSortIcon('status')}
                  </Box>
                </TableCell>
                <TableCell sx={tableHeaderCellStyle}>DOWNLOAD</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {sortedQrCodes.map((qr, index) => (
                <TableRow key={qr.id}>
                  {/* {!qr.cafe_name && (
                    <Checkbox
                      checked={selectedQrs.includes(qr.id)}
                      onChange={() => handleCheckboxChange(qr)}
                    />
                  )} */}
                  <TableCell sx={tableCellStyle}>
                    {/* {!qr.cafe_name ? (
                      <Checkbox
                        icon={<div style={iconBoxStyle} />}
                        checkedIcon={
                          <div style={iconBoxStyle}>
                            <Checkmark24Regular />
                          </div>
                        }
                        sx={{
                          padding: 0,
                          width: 28,
                          height: 28,
                        }}
                        checked={selectedQrs.some((item) => item.id === qr.id)}
                        onChange={() => handleCheckboxChange(qr)}
                      />
                    ) : null} */}



                    <Checkbox
                      icon={<div style={iconBoxStyle} />}
                      checkedIcon={
                        <div style={iconBoxStyle}>
                          <Checkmark24Regular />
                        </div>
                      }
                      sx={{
                        padding: 0,
                        width: 28,
                        height: 28,
                      }}
                      checked={selectedQrs.some((item) => item.id === qr.id)}
                      onChange={() => handleCheckboxChange(qr)}
                    />
                  </TableCell>
                  <TableCell onClick={() => handleDownloadClick(qr)} sx={tableCellStyle}>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell onClick={() => handleDownloadClick(qr)} sx={tableCellStyle}>{qr.qr_uid}</TableCell>
                  <TableCell onClick={() => handleDownloadClick(qr)} sx={tableCellStyle}>{qr.cafe_name ? qr.cafe_name : <CancelIcon color="error" />}</TableCell>
                  {/* <TableCell sx={tableCellStyle}><a href={qr.qr_shortlink} target="_blank" rel="noopener noreferrer">{qr.qr_shortlink}</a></TableCell> */}
                  <TableCell onClick={() => handleDownloadClick(qr)} sx={tableCellStyle}>{qr.total_scans}</TableCell>
                  <TableCell onClick={() => handleDownloadClick(qr)} sx={tableCellStyle}>{new Date(qr.created_at).toLocaleDateString()}</TableCell>

                  <TableCell sx={tableCellStyle}>
                    {/* {qr.is_active ? 'Active' : 'Inactive'} */}

                    {qr.qr_shortlink === null ? (
                      <Chip
                        label="Unavailable"
                        color="error"
                      />
                    ) : (
                      <Chip
                        onClick={() => handleStatusClick(qr)}
                        label={qr.is_active === 1 ? "Active" : "Inactive"}
                        sx={{
                          backgroundColor: qr.is_active === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)",
                          color: qr.is_active === 1 ? "#1b5e20" : "red",
                          borderRadius: "999px",
                          px: 2,
                          py: 0.5,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      />
                    )}

                  </TableCell>
                  <TableCell sx={tableCellStyle}>
                    {/* <Button color='black' onClick={() => handleDownloadClick(qr)}>
                      <ArrowDownload24Filled />
                    </Button>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDownloadSvg(qr)}
                      size="small"
                    >
                      <ArrowDownload24Filled />

                    </IconButton> */}
                    {qr.qr_shortlink === null ? (
                      <Chip
                        label="Unavailable"
                        color="error"
                      />
                    ) : (
                      <QRcodelatest data={qr} />
                    )}


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
                  {/* <MenuItem value={10}>50</MenuItem> */}
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                  <MenuItem value={250}>250</MenuItem>
                </Select>
              </Box>

              {/* Pagination */}
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleSelectPage}
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

        {/* Generate QR Modal */}
        <Drawer
          disableEnforceFocus anchor="right"
          open={openGenerateQRModal}
          onClose={() => setOpenGenerateQRModal(false)}
          PaperProps={{
            sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}
        >
          <Box>
            <Box position={'sticky'} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
              <Paper sx={{ padding: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">Generate QR</Typography>
                  <IconButton onClick={() => setOpenGenerateQRModal(false)}>
                    <Close />
                  </IconButton>
                </Stack>
              </Paper>
            </Box>
            <Box padding={1}>
              <Paper>
                <TextField
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                  value={amount}
                  onChange={handleChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    inputProps: { inputMode: 'numeric' }, // mobile keyboards show numbers
                  }}
                />
                <Box position="sticky" bottom={0} sx={{ width: "100%", p: 2, zIndex: 999, bgcolor: "#F7F7F7", display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color='error'
                    sx={{ flex: 1 }}
                    onClick={() => setOpenGenerateQRModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button sx={{ flex: 1 }} variant="contained" onClick={handleGenerateQRSubmit}>
                    Create QR
                  </Button>
                </Box>
              </Paper>
            </Box>

          </Box>
        </Drawer>

        {/* Assign to Modal */}
        <Drawer
          disableEnforceFocus anchor="right"
          open={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          PaperProps={{
            sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}
        >
          <Box >
            <Box position={'sticky'} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
              <Paper sx={{ padding: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">Assign To</Typography>
                  <IconButton onClick={() => setAssignModalOpen(false)}>
                    <Close />
                  </IconButton>
                </Stack>
              </Paper>
            </Box>
            <Box padding={1}>
              <Paper>
                <Autocomplete
                  options={cafeList}
                  getOptionLabel={(option) => option.cafe_name}
                  onChange={(event, newValue) => setSelectedCafe(newValue)}
                  onInputChange={(_, newInputValue) => {
                    setCafeList([])
                    setSearchCafeQuery(newInputValue)
                  }}
                  renderInput={(params) => <TextField {...params} label="Restaurant Name" variant="outlined" />}
                />

                <Box position="sticky" bottom={0} sx={{ width: "100%", p: 2, zIndex: 999, bgcolor: "#F7F7F7", display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color='error'
                    sx={{ flex: 1 }}
                    onClick={() => setAssignModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button sx={{ flex: 1 }} variant="contained" onClick={handleAssignConfirm}>
                    Assign
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Drawer>

        {/* Downloa
      {/* Assign to Modal */}
        <Drawer
          disableEnforceFocus anchor="right"
          open={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          PaperProps={{
            sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}
        >
          <Box >
            <Box position={'sticky'} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
              <Paper sx={{ padding: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">Assign To</Typography>
                  <IconButton onClick={() => setAssignModalOpen(false)}>
                    <Close />
                  </IconButton>
                </Stack>
              </Paper>
            </Box>
            <Box padding={1}>
              <Paper>
                <Autocomplete
                  options={cafeList}
                  getOptionLabel={(option) => option.cafe_name}
                  onChange={(event, newValue) => setSelectedCafe(newValue)}
                  onInputChange={(_, newInputValue) => {
                    setCafeList([])
                    setSearchCafeQuery(newInputValue)
                  }}
                  renderInput={(params) => <TextField {...params} label="Restaurant Name" variant="outlined" />}
                />

                <Box position="sticky" bottom={0} sx={{ width: "100%", p: 2, zIndex: 999, bgcolor: "#F7F7F7", display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color='error'
                    sx={{ flex: 1 }}
                    onClick={() => setAssignModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button sx={{ flex: 1 }} variant="contained" onClick={handleAssignConfirm}>
                    Assign
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Drawer>

        {/* Downloa
      {/* Download Modal */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedQR && (
              <Box sx={{ textAlign: 'center' }}>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  QR Sticker
                </Typography>
                <QRcodelatestView data={selectedQR}></QRcodelatestView>
                {/* <Typography variant="subtitle1" sx={{ mt: 1 }}>
                <strong>Table UID:</strong> {selectedQR.qr_uid}
              </Typography> */}
                {/* <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                <strong>Firebase Shortlink:</strong> <a href={selectedQR.firebase_shortlink_web} target="_blank" rel="noopener noreferrer">{selectedQR.firebase_shortlink_web}</a>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                <strong>QR Shortlink:</strong> <a href={selectedQR.qr_shortlink} target="_blank" rel="noopener noreferrer">{selectedQR.qr_shortlink}</a>
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                <strong>Long URL:</strong> <a href={selectedQR.qr_long_url} target="_blank" rel="noopener noreferrer">{selectedQR.qr_long_url}</a>
              </Typography> */}
              </Box>
            )}
          </Box>
        </Modal>

        {/* Snackbar for success or failure messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{ zIndex: 2000 }}
        >
          <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </MuiAlert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default GenerateQR;
