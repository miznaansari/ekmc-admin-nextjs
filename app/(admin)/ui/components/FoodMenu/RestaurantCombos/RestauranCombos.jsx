import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Pagination,
  Chip,
  Button,
  Snackbar,
  Alert,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  InputAdornment,
  Paper,
  Drawer,
  useMediaQuery
} from "@mui/material";
import { styled, useTheme } from "@mui/system"; // Import useTheme
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import RefreshIcon from "@mui/icons-material/Refresh"; // Import the refresh icon
import axios from "axios";
import AddRestaurantCombo from "./AddRestraurantCombo"; // Add Combo component
import EditRestaurantCombo from "./EditRestaurantCombo"; // Edit Combo component
import { useLocation, useNavigate } from "react-router-dom";
 import mapAdminAccess from "../../../mapAdminAccess.json"
import useDebounce from "../../../hooks/useDebounce";
import RightDrawer from "../../RightDrawer/RightDrawer";
import { MoreVertical24Filled } from "@fluentui/react-icons";

const StyledContainerLarge = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  //minHeight: "70vh",
  //width: "93vw",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  minHeight: "100vh",
  width: "100%", 
  minWidth: "0", 
  overflow: "auto", 
  padding: theme.spacing(2), 
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  height: "calc(89vh - 136px)", // ⬅️ Set desired height
  overflowY: "auto",
  overflowX: "auto",
}));

const tableHeaderCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",    
  //fontWeight: "bold",
  borderBottom: "none",
  //borderBottom: "none",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",  };

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",    
  borderBottom: "none"
};

const RestaurantCombos = () => {
  const theme = useTheme(); // Use useTheme hook to get the theme object
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [openAddCombo, setOpenAddCombo] = useState(false); // Dialog state for adding combo
  const [openEditCombo, setOpenEditCombo] = useState(false); // Dialog state for editing combo
  const [selectedCombo, setSelectedCombo] = useState(null); // Holds the combo selected for editing
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false); // Controls drawer visibility
  const [drawerTitle, setDrawerTitle] = useState(""); // Sets drawer title dynamically
  const [drawerContent, setDrawerContent] = useState(null); // Stores drawer content to render
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem("authToken");

  // Fetch combos whenever page, limit, or searchQuery changes
  useEffect(() => {
    fetchCombos();
  }, [page, limit, debouncedSearchQuery]);

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/cafe-combos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            s: searchQuery,
            pageno: page,
            limits: limit,
          },
        }
      );
      if (response.data && response.data.success) {
        setCombos(response.data.data.data);
        setTotalPages(response.data.data.lastPage);
      }
    } catch (error) {
      console.log("error during fetching combo:", error)
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 401)
      ) {
        // Step 1: Check for 400 status
        // navigate("/login"); // Redirect to login page
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEditCombo = (combo) => {
    setSelectedCombo(combo); // Store selected combo for editing
    setOpenEditCombo(true); // Open dialog for editing
    setDrawerOpen(true)
    setDrawerTitle("Add edit combo")
    console.log("combo:",combo.cafe_menu_combo_id)
    setDrawerContent(<EditRestaurantCombo
      cafeComboId={combo.cafe_menu_combo_id}
      open={drawerOpen}
      handleClose={() => setDrawerOpen(false)}
      onSuccess={()=>{
        setDrawerOpen(false)
        setDrawerContent(null)
        fetchCombos()
        setSnackbarMessage("Combo edited successfully!");
        setSnackbarOpen(true);

      }}
      combo={combo} // Pass selected combo data
    />)
  };

  const handleRefresh = () => {
    fetchCombos();
    setSnackbarMessage("Combos refreshed successfully!");
    setSnackbarOpen(true);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false); // Close the drawer
    setDrawerContent(null); // Reset content
  };

  //handle ststus click

  const handleStatusClick= async(combo)=>{
    console.log("combo= ", combo);
    const itemss= combo?.cafe_menu_combo_item?.map((combo=>({
      cafe_menu_id:combo.cafe_menu_item_id
    })))

    const updatedStatus= combo.status=== 1 ? 0: 1;

    const payloas= {
      price:combo.price,
      status: updatedStatus,
      combo_name: combo.name,
      image_id: combo.cmc_azure_original_image_url,
      items: itemss ||[]
    }

    try{
      const response= await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/cafe-combo/${combo.cafe_menu_combo_id}`, payloas, {
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      console.log("response of update ststus = =", response);
      if(response.status === 200){
        fetchCombos();
        setSnackbarOpen(true)
        setSnackbarMessage("Status Updated !!")
      }

    }catch(e){
      console.log("error during update ststus - ",e);
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
  console.log('checkAccess',checkAccess)
  const hasWriteAccess = checkAccess[0]?.status === 1;
  console.log('object', hasWriteAccess)

  // {(userRole === '1' || hasWriteAccess) && (<>

  // </>)}

  return (
    <Box paddingTop={3}>
      <Paper>
        <Grid
          container
          spacing={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* <Grid item xs={12} sm={6} md={4}>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: "bold", fontSize: "1.1rem" }}
            >
              Restaurant Combos
            </Typography>
            <TextField
              size="small"
              placeholder="Search Combos"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
              sx={{
                width: "100%",
                maxWidth: "250px",
                marginTop: theme.spacing(1),
              }}
            />
          </Grid>
   */}
   <Grid
     size={{
       xs: 12,
       sm: 6,
       md: 4
     }}>
     <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
       <Typography
         variant="h6"
         sx={{ fontWeight: "bold", fontSize: "1.1rem", whiteSpace: "nowrap" }}
       >
         Resturant Combos
       </Typography>
       <TextField
           label="Search"
           variant="outlined"
           size="small"
           placeholder="Value"
           onChange={(e)=> setSearchQuery(e.target.value)}
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
   
          <Grid
            sx={{
              textAlign: { xs: "left", sm: "right" },
            }}
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
              {(userRole === '1' || hasWriteAccess) && (<>

            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setOpenAddCombo(true)
                setDrawerOpen(true);
                setDrawerTitle("Add New Combo");
                setDrawerContent(
                  <AddRestaurantCombo
                    open={openAddCombo}
                    handleClose={() => setDrawerOpen(false)}
                    onSuccess={()=>{
                      setDrawerOpen(false)
                      setDrawerContent(null)
                      fetchCombos()
                      setSnackbarMessage("Combo added successfully!");
                      setSnackbarOpen(true);

                    }}
                  />
                );
              }}
              sx={{
                width: "110px",       
                height: "30px",        
                borderRadius: "6px",  
                fontSize: "0.75rem",
              }}
            >
              ADD COMBO
            </Button>
    </>)}


            {/* <Button
              variant="contained"
              color="primary"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              sx={{
                fontSize: "0.75rem",
                padding: "4px 8px",
              }}
            /> */}
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
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyle}>S. NO.</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>COMBO NAME</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>RESTURANT NAME</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>PRICE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>STATUS</TableCell>
                  <TableCell
                    sx={{
                      ...tableHeaderCellStyle,
                      position: "sticky",
                      right: 0,
                      backgroundColor: theme.palette.background.paper, // Keep background color
                      zIndex: 100, // Ensure it stays on top of other cells when scrolling
                    }}
                  >
                    ACTION
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {combos.length > 0 ? (
                  combos.map((combo, index) => (
                    <TableRow
                      key={combo.id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                          cursor: "pointer",
                        },
                        height: "32px",
                        transition: "background-color 0.3s ease-in-out",
                      }}
                    >
                      <TableCell sx={tableCellStyle}>
                        {index + 1 + (page - 1) * limit}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>{combo.name}</TableCell>
                      <TableCell sx={tableCellStyle}>{combo.cafe_name}</TableCell>
                      <TableCell sx={tableCellStyle}>₹{combo.price}</TableCell>
                      <TableCell sx={tableCellStyle}>
                        <Chip
                            onClick={()=>handleStatusClick(combo)}
                            label={combo.status === 1 ? "Active" : "Inactive"}
                            sx={{
                              backgroundColor: combo.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                              color: combo.status === 1 ? "#1b5e20" : "red", // dark green or orange
                              borderRadius: "999px",
                              px: 2,
                              py: 0.5,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                            }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          ...tableCellStyle,
                          position: "sticky",
                          right: 0,
                          backgroundColor: theme.palette.background.paper,
                          zIndex: 1,
                        }}
                      >
                        <IconButton
                          onClick={() => handleEditCombo(combo)}
                          sx={{
                            color:"black",
                            transition: "transform 0.2s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.2)",
                            },
                          }}
                          
                        >
                          <MoreVertical24Filled />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No combos found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}

        {/* <Grid
          container
          spacing={1}
          justifyContent={{ xs: "center", sm: "space-between" }} // Center on xs, space-between on sm and up
          alignItems="center"
          sx={{ mt: 1, textAlign: { xs: "center", sm: "left" } }}
        >
          <Grid item>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, combos.length)} of {combos.length} entries
            </Typography>
          </Grid>

          <Grid item>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontWeight: "bold",
                },
              }}
            />
          </Grid>

          <Grid item>
            <FormControl variant="outlined" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ fontWeight: "bold" }}>Select no.</InputLabel>
              <Select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                label="Select no."
                sx={{ fontWeight: "bold" }}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid> */}
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
                  value={limit}
                  onChange={(e)=>setLimit(Number(e.target.value))}
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
        
        {/* Add Combo Dialog */}
        {/* <Dialog
          open={openAddCombo}
          onClose={() => setOpenAddCombo(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add New Combo</DialogTitle>
          <DialogContent>
            <AddRestaurantCombo
              open={openAddCombo}
              handleClose={() => setOpenAddCombo(false)}
            />
          </DialogContent>
        </Dialog> */}

        {/* Edit Combo Dialog */}
        {/* <Dialog
          open={openEditCombo}
          onClose={() => setOpenEditCombo(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Combo</DialogTitle>
          <DialogContent>
            {selectedCombo && (
              <EditRestaurantCombo
                open={openEditCombo}
                handleClose={() => setOpenEditCombo(false)}
                combo={selectedCombo} // Pass selected combo data
              />
            )}
          </DialogContent>
        </Dialog> */}
        <Drawer
  disableEnforceFocus        PaperProps={{
                  sx: { width: isMobileScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
                }}  
          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          title={drawerTitle}
        >
          {drawerContent}
        </Drawer>
        {/* <Drawer
  disableEnforceFocus        anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          title={drawerTitle}
          PaperProps={{
              sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}        
        >                  
            {drawerContent}
                    </Drawer> */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default RestaurantCombos;
