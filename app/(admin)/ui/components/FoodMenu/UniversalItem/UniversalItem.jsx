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
  Dialog,
  DialogTitle,
  Snackbar,
  Alert,
  Avatar,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Checkbox,
  InputAdornment,
  Paper,
  Drawer,
  useMediaQuery,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import Search from "@mui/icons-material/Search";
import axios from "axios";
import AddUniversalItem from "./AddUniversalItem";
import EditUniversalItem from "./EditiUniversalItem";
import useDebounce from "../../../hooks/useDebounce";
import RightDrawer from "../../RightDrawer/RightDrawer";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import { Checkmark24Regular, MoreVertical24Filled } from "@fluentui/react-icons";
import { useLocation } from "react-router-dom";
import mapAdminAccess from "../../../mapAdminAccess.json"
const iconBoxStyle = {
  width: 24,
  height: 24,
  border: '1px solid #ccc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
};

const StyledContainerLarge = styled(Box)(({ theme }) => ({
  // backgroundColor: theme.palette.background.paper,
  // borderRadius: theme.shape.borderRadius,
  // boxShadow: theme.shadows[1],
  // //minHeight: "70vh",
  // //width: "93vw",
  // display: "flex",
  // flexDirection: "column",
  // flexGrow: 1,
  // minHeight: "100vh",
  // width: "100%", 
  // minWidth: "0", 
  // overflow: "auto", 
  // padding: theme.spacing(2), 
  marginTop: theme.spacing(1.5),
  //marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  //boxShadow: theme.shadows[1],
  //minHeight: "100vh",
  //width: "93vw",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  height: `calc(98vh - 91px)`
}));

const StyledContainerSmall = styled(Box)(({ theme }) => ({
  // backgroundColor: theme.palette.background.paper,
  // borderRadius: theme.shape.borderRadius,
  // boxShadow: theme.shadows[1],
  // //minHeight: "70vh",
  // //width: "93vw",
  // display: "flex",
  // flexDirection: "column",
  // flexGrow: 1,
  // minHeight: "100vh",
  // width: "100%", 
  // minWidth: "0", 
  // overflow: "auto", 
  // paddingTop:"15px"
  marginTop: theme.spacing(1.5),
  //marginBottom: theme.spacing(1),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  //boxShadow: theme.shadows[1],
  //minHeight: "100vh",
  //width: "93vw",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  height: `calc(98vh - 91px)`
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
  boxShadow: "none", };

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  borderBottom: "none",
};

const UniversalItem = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [openEditItem, setOpenEditItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openAddItem, setOpenAddItem] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerContent, setDrawerContent] = useState(null);
  const token = localStorage.getItem("authToken");
  const [alert, setAlert] = useState({
                open: false,
                severity: "info",
                message: ""
            });
  
  useEffect(() => {
    fetchItems();
  }, [page, limit, debouncedSearchQuery]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/universal-item`,
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
        setItems(response.data.data.data);
        setTotalPages(response.data.data.lastPage);
      } else {
        console.error("Failed to fetch items:", response.data.msg);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        // Step 1: Check for 400 status
        navigate("/login"); // Redirect to login page
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setDrawerOpen(true);
    setDrawerTitle("Edit Items");
    setDrawerContent(
      <EditUniversalItem
        //open={openEditItem}
        handleClose={() => setDrawerOpen(false)}
        selectedItem={item}
        itemId={item.id}
        onSuccess={()=>{
          setDrawerOpen(false);
          fetchItems()
          setAlert({open:true, severity:"success",message:"Updated Successfully!!"})
        }}
        onCancel={()=>{
          setDrawerOpen(false)
        }}
      />
    );
  };

  const handleRefresh = () => {
    fetchItems();
    setSnackbarMessage("Items refreshed successfully!");
    setSnackbarOpen(true);
  };

  const Container = isSmallScreen ? StyledContainerSmall : StyledContainerLarge;
  const handleDrawerClose = () => {
    setDrawerOpen(false); // Close the drawer
    setDrawerContent(null); // Clear drawer content
  };

//handle ststus update]
  const handleStatusClick=async(item)=>{
    console.log("item -", item);
    const updatedStatus= item.status === 1? 0:1;

    const payload={
      image_id:item.universal_item_auzre_original_image_url,
      item_name: item.item_name,
      status: updatedStatus
    }

    try{
      const response= await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/universal-item/${item.id}`,payload,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      console.log("response of update sttsus = ", response);
      if(response.status === 200){
        fetchItems();
        setAlert({open:true, severity:"success", message:"Status Updated!!"})
      }
    }catch(e){
      console.log("error during update ststtus = ", e);
      setAlert({open:true, severity:"error", message:"Status Updat Failed!!"})
    }
  }



  
  
  
    
        
          // import mapAdminAccess from "../../../mapAdminAccess.json"
        
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
        
          //  {(userRole === '1' || hasWriteAccess) && (<>
        
          //  </>)}
  

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
                Universal Items
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
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                   {(userRole === '1' || hasWriteAccess) && (<>
          
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setDrawerOpen(true);
                setDrawerTitle("Add New Item");
                setDrawerContent(
                  <AddUniversalItem 
                    handleClose={() => {
                      setDrawerOpen(false); 
                      fetchItems()
                    }} 
                    onCancel={()=>{
                      setDrawerOpen(false)
                    }}
                    />
                );
              }}
              sx={{
                width: "100px",       
                height: "30px",        
                borderRadius: "6px",  
                fontSize: "0.75rem",
              }}
            >
              ADD ITEMS
            </Button>

             </>)}

            {/* <Button
              variant="contained"
              color="primary"
              // onClick={() => setOpenAddCategory(true)}
              
              sx={{
                width: "105px",       
                height: "30px",        
                borderRadius: "6px",  
                fontSize: "0.75rem",
              }}
            >
              ADD MERGE
            </Button> */}
            </Box>
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
                  <TableCell sx={tableHeaderCellStyle}>SELECT</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>S. NO.</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>ITEM IMAGE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>ITEM NAME</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>CREATED AT</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>UPDATED AT</TableCell>
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
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <TableRow
                      key={item.id}
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
                      {/* <Checkbox
                      //checked={selectedQrs.includes(qr.id)}
                      onChange={() => handleCheckboxChange(qr)}
                      /> */}
                      <Checkbox
                          icon={<div style={iconBoxStyle} />} // unchecked state
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
                       />
                      </TableCell>

                      <TableCell sx={tableCellStyle}>
                        {index + 1 + (page - 1) * limit}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        <Avatar
                          
                          src={
                            item.universal_item_auzre_240px_image_url ||item.universal_item_auzre_original_image_url
                          }
                          alt={item.item_name}
                          sx={{ width: 40, height: 40 }}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyle}>{item.item_name.charAt(0).toUpperCase() + item.item_name.slice(1)}</TableCell>
                      
                      <TableCell sx={tableCellStyle}>
                        {new Date(item.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        {new Date(item.updated_at).toLocaleString()}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                         <Chip
                            onClick={()=>handleStatusClick(item)}
                            label={item.status === 1 ? "Active" : "Inactive"}
                            sx={{
                                  backgroundColor: item.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                                  color: item.status === 1 ? "#1b5e20" : "red", // dark green or orange
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
                          onClick={() => handleEditItem(item)}
                          sx={{
                            transition: "transform 0.2s ease-in-out",
                            color:"black",
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
                    <TableCell colSpan={7} align="center">
                      No items found.
                    </TableCell>
                  </TableRow>
                )}
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
                  value={limit}
                  onChange={(e)=>setLimit(e.target.value)}
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
        
          
        {/* Add Item Dialog */}

        {/* Edit Item Dialog */}
        <Dialog
          open={openEditItem}
          onClose={() => setOpenEditItem(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              position: "absolute",
              right: 0,
              margin: "auto",
              height: "100vh",
              width: {
                xs: "100vw", // 100% width on smallest screens
                sm: "50vw", // 50% width on small screens
                lg: "30vw", // 30% width on large screens
              },
            },
          }}
        >
          <DialogTitle>Edit Item</DialogTitle>
          {selectedItem && (
            <EditUniversalItem
              open={openEditItem}
              handleClose={() => setOpenEditItem(false)}
              selectedItem={selectedItem}
              itemId={selectedItem.id}
              refreshItems={fetchItems}
            />
          )}
        </Dialog>
        {/* <RightDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          title={drawerTitle}
        >
          {drawerContent}
        </RightDrawer> */}

        <Drawer
  disableEnforceFocus        anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          title={drawerTitle}
          PaperProps={{
            sx: { width:  isSmallScreen? "100%":400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}        
        >                  
          {drawerContent}
        </Drawer>

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
      </Paper>
    </Box>
  );
};

export default UniversalItem;
