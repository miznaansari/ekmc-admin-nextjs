import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Typography,
  Button,
  IconButton,
  Pagination,
  TextField,
  MenuItem,
  Menu,
  Modal,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Select,
  FormControl,
  InputAdornment,
  Grid,
  Chip,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Drawer,
  Stack,
  Snackbar,
  Alert,
  Autocomplete
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditTableModal from './EditTableModal';
import AddTableModal from './AddTableModal';
import { styled } from '@mui/system';
import SearchIcon from "@mui/icons-material/Search";
import { Close } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import mapAdminAccess from "../../../mapAdminAccess.json"
const modalStyle = {
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
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  width: "100%",
  minWidth: "0",
  overflow: "auto",
  padding: theme.spacing(2),
  minHeight: "100vh",
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  maxHeight: "calc(89vh - 136px)",
  overflowY: "auto",
  overflowX: "auto",
}));

const tableHeaderCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  color: "#000",
  boxShadow: "none",
  borderBottom: "none",
  backgroundColor: "white",
};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  color: "#000",
  borderBottom: "none",
  backgroundColor: "white",
  boxShadow: "none",
};

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalEntries, setTotalEntries] = useState(0);
  const [search, setSearch] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [qrDetails, setQrDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem('authToken');
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });


  //fetch restaurant section
  const [searchRestaurantQuery, setSearRestaurantchQuery] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState();
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
    fetchTables();
  }, [page, search, rowsPerPage, restaurantId]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${baseUrl}/api/v1/cafe-tables`, {
        params: {
          pageno: page,
          limits: rowsPerPage,
          s: search,
          cafe_list_id: restaurantId

        },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.success) {
        setTables(response.data.data.data);
        setTotalPages(response.data.data.lastPage);
        setTotalEntries(response.data.data.total);
      } else {
        navigate('/login');
      }
    } catch (e) {
      console.log("error during fetch cafe tables: ", e)
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMenu = (event, table) => {
    setAnchorEl(event.currentTarget);
    setSelectedTable(table);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTable(null);
  };

  const handleOpenEditModal = (table) => {
    // Close the menu first, then open the modal
    handleCloseMenu();
    setSelectedTable(table);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedTable(null); // Clear selected table
    fetchTables();
  };

  const handleOpenAddModal = () => {
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    fetchTables();
  };

  const handleOpenViewModal = (table) => {
    // Close the menu first, then open the modal
    handleCloseMenu();
    setQrDetails(table.qr_with_frame || []);
    setOpenViewModal(true);
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setQrDetails([]);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  //handle status click 

  const handleStatusClick = async (table) => {


    console.log("table item =", table)
    console.log("table", table?.qr_with_frame?.map((qr => ({
      qr_codes_id: qr.cafe_tables_id
    }))))

    const itemss = table?.qr_with_frame?.map((qr => ({
      qr_codes_id: qr.cafe_tables_id
    })))

    console.log("items-", table)
    const updatedStatus = table.is_active === 1 ? 0 : 1;

    const payload = {
      cafe_tables_id: table.cafe_tables_id,
      table_title: table.table_title,
      is_active: updatedStatus,
      is_default: table.is_default,
      items: itemss || []
    }

    try {
      const qrCodesResonse = await axios.get(`${baseUrl}/api/v1/cafe-tables/${table.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log("response od qr code ids- ", qrCodesResonse?.data?.tablesData[0]?.qr_data?.map((qrids => ({
        qr_codes_id: qrids.qr_codes_id
      }))));

      const qrCODESIds = qrCodesResonse?.data?.tablesData[0]?.qr_data?.map((qrids => ({
        qr_codes_id: qrids.qr_codes_id
      })))

      const payload = {
        cafe_tables_id: table.cafe_tables_id,
        table_title: table.table_title,
        is_active: updatedStatus,
        is_default: table.is_default,
        items: qrCODESIds || []
      }
      const response = await axios.put(`${baseUrl}/api/v1/cafe-table`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log("response ststus update =", response);


      if (response.status === 200) {
        fetchTables();
        setAlert({ open: true, severity: "success", message: "successfully updated" });
      }
    } catch (e) {
      console.log("error during update ststus -= ", e);
      setAlert({ open: true, severity: "error", message: "Update Failed!" });
    }

  }







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
    <Box paddingTop={2}>
      <Paper>
        <Grid container spacing={1} alignItems="center" justifyContent="space-between">
          <Grid
            size={{
              xs: 12,
              md: 8
            }}>
            <Box flexWrap="wrap" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                Table Management
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
                sx={{ width: 250 }}
              />

              <Autocomplete
                options={restaurants}
                getOptionKey={(option) => option.value}
                getOptionLabel={(option) => option.label}
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
                  />
                )}
              />
            </Box>
          </Grid>

          <Grid
            sx={{ textAlign: { xs: "left", md: "right" } }}
            size={{
              xs: 12,
              md: 4
            }}>

            {(userRole === '1' || hasWriteAccess) && (<>


              <Button variant="contained" onClick={handleOpenAddModal} sx={{
                width: "100px",
                height: "30px",
                borderRadius: "6px",
                fontSize: "0.75rem",
              }}>
                Add Table
              </Button>
            </>)}
          </Grid>
        </Grid>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <StyledTableContainer component={Paper} elevation={0}
            sx={{
              boxShadow: "none",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              borderRadius: 0,
            }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyle}>S. NO.</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>TABLE TITLE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>TABLE UID</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>LINKED QR</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>RESTURANT NAME</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>SCANS</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>OCCUPIED</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>MERGED</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>STATUS</TableCell>
                  {(userRole === '1' || hasWriteAccess) && (<>


                    <TableCell sx={{
                      ...tableHeaderCellStyle,
                      position: 'sticky',
                      right: 0,
                      zIndex: 100,
                    }}>Action</TableCell> </>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {tables.map((table, index) => (
                  <TableRow
                    key={table.id}
                    sx={{
                      backgroundColor: table.table_title === 'Default' ? '#d4f8d4' : index % 2 === 0 ? '#f9f9f9' : 'inherit',
                    }}
                  >
                    <TableCell sx={tableCellStyle}>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell sx={tableCellStyle}>{table.table_title.charAt(0)?.toUpperCase() + table.table_title.slice(1)}</TableCell>
                    <TableCell sx={tableCellStyle}>{table.table_uid}</TableCell>
                    <TableCell sx={tableCellStyle}>
                      {Array.isArray(table.qr_with_frame) && table.qr_with_frame.length > 0 ? (
                        <Box flexWrap="wrap" sx={{ display: "flex", gap: 1 }}>
                          {table.qr_with_frame.map((qr) => (
                            <Chip
                              key={qr.qr_uid}
                              label={qr.qr_uid}
                              sx={{
                                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                                color: '#FF8C00',
                                height: '26px',
                                width: "90px"
                              }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Chip
                          label="No Qr Linked"
                          sx={{
                            backgroundColor: 'rgba(255, 100, 82, 0.1)',
                            color: "red",
                            height: '26px',
                            width: "110px"
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={tableCellStyle}>{table.cafe_name.charAt(0)?.toUpperCase() + table.cafe_name.slice(1)}</TableCell>
                    <TableCell sx={tableCellStyle}>{table.total_scan}</TableCell>
                    <TableCell sx={tableCellStyle}>{table.is_occupied}</TableCell>
                    <TableCell sx={tableCellStyle}>{table.is_merged}</TableCell>
                    <TableCell sx={tableCellStyle}>
                      <Chip
                        onClick={() => handleStatusClick(table)}
                        label={table.is_active ? "Active" : "Inactive"}
                        sx={{
                          backgroundColor: table.is_active ? "#e8f5e9" : "#ffebee",
                          color: table.is_active ? "#1b5e20" : "#c62828",
                          borderRadius: "999px",
                          px: 2,
                          py: 0.5,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      />
                    </TableCell>

                    {(userRole === '1' || hasWriteAccess) && (<>


                      <TableCell sx={{
                        ...tableCellStyle,
                        position: 'sticky',
                        right: 0,
                        backgroundColor: "white",
                        zIndex: 1,
                      }}>
                        <IconButton sx={{ color: "black" }} onClick={(event) => handleOpenMenu(event, table)}>
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl) && selectedTable?.id === table.id}
                          onClose={handleCloseMenu}
                        >
                          <MenuItem onClick={() => handleOpenEditModal(table)}>Edit</MenuItem>
                          <MenuItem onClick={() => handleOpenViewModal(table)}>View</MenuItem>
                        </Menu>
                      </TableCell>  </>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}

        <Grid
          container
          spacing={2}
          alignItems="center"
          sx={{
            px: 2,
            py: 1,
          }}
        >
          <Grid
            sx={{ ml: "auto" }}
            size={{
              xs: 12,
              sm: "auto"
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
                    fontSize: "0.875rem",
                    borderRadius: 1.5,
                    "& fieldset": {
                      border: "none",
                    },
                  }}
                >
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                  <MenuItem value={200}>200</MenuItem>
                </Select>
              </Box>

              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                shape="rounded"
                variant="outlined"
                size="medium"
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: "6px",
                  },
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Edit Table Modal */}
        {selectedTable && openEditModal && (
          <EditTableModal
            open={openEditModal}
            handleClose={handleCloseEditModal}
            tableData={selectedTable}
          />
        )}

        {/* Add Table Modal */}
        <AddTableModal open={openAddModal} handleClose={handleCloseAddModal} />

        {/* View QR Modal */}
        <Drawer
disableEnforceFocus          anchor='right'
          PaperProps={{
            sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}
          open={openViewModal}
          onClose={handleCloseViewModal}
        >
          <Box>
            <Box position={'sticky'} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
              <Paper sx={{ padding: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">QR Details</Typography>
                  <IconButton onClick={handleCloseViewModal}>
                    <Close />
                  </IconButton>
                </Stack>
              </Paper>
            </Box>
            <Box padding={1}>
              <Paper sx={{ p: 1 }}>
                {/* <Typography variant="h6" gutterBottom>
              QR Details
            </Typography> */}
                <List>
                  {qrDetails.map((qr, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar alt={`QR ${qr.qr_uid}`} src={qr.qr_with_frame} />
                      </ListItemAvatar>
                      <ListItemText primary={`QR UID: ${qr.qr_uid}`} secondary={`Total Scans: ${qr.total_scans}`} />
                    </ListItem>
                  ))}
                </List>
                <Button variant="contained" onClick={handleCloseViewModal}>
                  Close
                </Button>
              </Paper>
            </Box>
          </Box>
        </Drawer>
      </Paper>
      <Snackbar
        open={alert.open}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={3000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TableManagement;