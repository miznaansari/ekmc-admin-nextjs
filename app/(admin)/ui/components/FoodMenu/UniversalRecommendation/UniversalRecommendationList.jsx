import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  MenuItem,
  IconButton,
  Pagination,
  Chip,
  Box,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox, 
  InputAdornment,
  Avatar,
  Drawer,
  useMediaQuery,
  CircularProgress,

} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";

import axios from "axios"; // Import Axios for API calls
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Search from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
// import AdduniversalRecommendation from "./AdduniversalRecommendation";
import AddUniversalRecommendation from "./AdduniversalRecommendation";
import EdituniversalRecommendation from "./EdituniversalRecommendation";
import ViewuniversalRecommendation from "./ViewuniversalRecommendation";
import useDebounce from "../../../hooks/useDebounce";
import RightDrawer from "../../RightDrawer/RightDrawer";
import mapAdminAccess from "../../../mapAdminAccess.json"
import { Checkmark24Regular, MoreVertical16Filled, MoreVertical24Filled } from "@fluentui/react-icons";
import ActionIcon from "../../../assets/icon/ActionIcon";
import { useLocation } from "react-router-dom";
const iconBoxStyle = {
  width: 24,
  height: 24,
  border: '1px solid #ccc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
};
const StyledContainer = styled(Box)(({ theme }) => ({
  //marginTop: theme.spacing(1),
  //marginBottom: theme.spacing(1),
  //padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  //minHeight: "70vh",
  //width: "93vw",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
 // minHeight: "800vh",
  width: "100%", 
  minWidth: "auto", 
  //overflow: "auto", 
  padding: theme.spacing(2), 
  //minHeight: "calc(100vh - 70px)", // 70px is your top padding (adjust if needed)
  overflow: "hidden", // 🔥 kill unexpected scroll

}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  // flexGrow: 1,
  // maxHeight: "calc(90vh - 150px)",
  // overflowX: "auto",
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
  boxShadow: "none",  
  

};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",    
  borderBottom: "none"
};

const UniversalRecommendationList = () => {
  const theme = useTheme();

  // State for the API data
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [pagination, setPagination] = useState({ page: 1, limit: 50 });
  const [loading, setLoading] = useState(false);
   const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("add"); // Type: 'add', 'view', 'edit'
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const token = localStorage.getItem("authToken");
  const [drawerOpen, setDrawerOpen] = useState(false); // Controls drawer visibility
  const [drawerTitle, setDrawerTitle] = useState(""); // Sets drawer title dynamically
  const [drawerContent, setDrawerContent] = useState(null); // Stores drawer content to render
  const [SearchRecommendation, setSearchRecommendation]=useState("");
  const [totalPages, setTotalPages]=useState();
  const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));
  

  // API call to fetch recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/admin/explores`,
        {
          params: { pageno: pagination.page, limit: pagination.limit, search:SearchRecommendation },
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`, // Replace with actual token
          },
        }
      );
      setRecommendations(response.data.data.data || []);
      setTotalPages(response.data.data.lastPage);
      console.log("total pages:",response.data.data.total)
      console.log(response.data);
    } catch (err) {
      setError("Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    console.log("recommendations:",recommendations);
  }, [pagination.page, pagination.limit, debouncedSearchQuery, SearchRecommendation]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (event) => {
    setPagination((prev) => ({ ...prev, limit: event.target.value, page: 1 }));
  };

  const filteredRecommendations = recommendations.filter((rec) =>
    rec.explore_food_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openRecommendationDialog = (type, recommendation = null) => {
    // setDialogType(type);
    // setSelectedRecommendation(recommendation);
    // setOpenDialog(true);
    setDrawerOpen(true)
    setDrawerContent(<AddUniversalRecommendation onSuccess={()=>{
      setDrawerOpen(false),
      setDrawerContent(null)
      setSnackbarOpen(true);
      setSnackbarMessage("Recomendation added successfully!");
      fetchRecommendations()
    }}
    handleClose={()=>{
      setDrawerOpen(false),
      setDrawerContent(null)
    }}
    />)
    setDrawerTitle("Add Recommendation")
  };

  const closeRecommendationDialog = () => {
    setOpenDialog(false);
    setSelectedRecommendation(null);
  };
  const handleDrawerClose = () => {
    setDrawerOpen(false); // Close the drawer
    setDrawerContent(null); // Reset content
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  //handle ststus update= 
  const handleStatusClick =async(rec)=>{
    console.log("rec- ", rec)
    const catsIds= rec?.items?.map((cat=>({
      cat_id:cat.id
    })))
    const UpdatedStatus= rec.status === 1? 0:1;

    const payload= {
      explore_cat_id: rec.id,
      explore_cat_name: rec.explore_food_name,
      myeats_explore_image_url: rec.myeats_explore_cat_auzre_original_image_url,
      status: UpdatedStatus,
      cats_id:catsIds ||[]
    }
    console.log("payload = ", payload)

    try{
      const response= await axios.put(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/v1/admin/explore`, payload, {
        headers:{
          Authorization:`Bearer ${token}`
        }
      })

      console.log("ststus update response- ", response);
      if(response.status===200){
        fetchRecommendations();
        setSnackbarOpen(true);
        setSnackbarMessage("Status Updated!!")
      }
    }catch(e){
      console.log("error during update the ststus= ", e);
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
      <Paper >
        <Grid
          container
          spacing={1}
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
        Explore Food
      </Typography>
      <TextField
          label="Search"
          variant="outlined"
          size="small"
          placeholder="Value"
          onChange={(e)=> setSearchRecommendation(e.target.value)}
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
            sx={{ textAlign: { xs: "left", sm: "right" } }}
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            {/* <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              sx={{ fontSize: "0.75rem", padding: "4px 8px" }}
              onClick={fetchRecommendations}
            >
              Refresh
            </Button> */}
                {(userRole === '1' || hasWriteAccess) && (<>
    
            <Button
              variant="contained"
              color="primary"
              sx={{
                width: "170px",       
                height: "30px",        
                borderRadius: "6px",  
                fontSize: "0.75rem",
              }}
              onClick={() => openRecommendationDialog("add")}
            >
              ADD EXPLORE FOOD
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
            <CircularProgress/>
          </Box>
        ) : error ? (
          <Typography
            variant="body1"
            color="error"
            sx={{ textAlign: "center", marginTop: 3 }}
          >
            {error}
          </Typography>
        ) : (
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={tableHeaderCellStyle}>SELECT</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>S.NO.</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>FEATURED IMAGE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>TITLE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>CATAGORY NAME</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>STATUS</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>ACTION</TableCell>
                  {/* <TableCell sx={tableHeaderCellStyle}>updated_at</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>Action</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecommendations.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell sx={tableCellStyle}>
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

                    <TableCell sx={tableCellStyle}>{rec.id}</TableCell>
                    <TableCell sx={tableCellStyle}>
                      <Avatar
                        src={rec.myeats_explore_cat_auzre_240px_image_url || rec.myeats_explore_cat_auzre_original_image_url}
                      />
                    </TableCell>

                    <TableCell sx={tableCellStyle}>
                      {rec.items.map((item) => item.category_name).join(", ")}
                    </TableCell>
                    <TableCell sx={tableCellStyle}>
                        <Chip
                          label={rec.explore_food_name}
                          sx={{
                            bgcolor: 'rgba(255,165,0,0.1)', // light orange background
                            color: 'orange',
                            fontWeight: 500,
                            borderRadius: '16px',
                          }}
                        />
                    </TableCell>

                      <TableCell sx={tableCellStyle}>
                        <Chip
                          onClick={()=>handleStatusClick(rec)}
                          label={rec.status === 1 ? "Active" : "Inactive"}
                          sx={{
                          backgroundColor: rec.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                          color: rec.status === 1 ? "#1b5e20" : "red", // dark green or orange
                          borderRadius: "999px",
                          px: 2,
                          py: 0.5,
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          }}
                        />
                      </TableCell>

                    {/* <TableCell sx={tableCellStyle}>{rec.updated_at}</TableCell> */}

                    <TableCell sx={tableCellStyle}>
                      <IconButton sx={{color:"black"}}
                        onClick={() => {
                          setDrawerOpen(true)
                          setDrawerTitle("Edit Recomendation")
                          setDrawerContent(<EdituniversalRecommendation recommendation={rec} onSuccess={()=>{
                            setDrawerOpen(false),
                            setDrawerContent(null)
                            setSnackbarOpen(true);
                            setSnackbarMessage("Recomendation edit successfully!");
                            fetchRecommendations()
                          }}
                          handleClose={()=>{
                            setDrawerOpen(false)
                            setDrawerContent(null)
                          }}
                          />)
                        }}
                      >
                      <MoreVertical24Filled
                      >
                        Edit
                      </MoreVertical24Filled>
                      </IconButton>
                    </TableCell>
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
            value={pagination.limit}
            onChange={handleLimitChange}
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
          page={pagination.page}
          onChange={handlePageChange}
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

        <Drawer
  disableEnforceFocus        PaperProps={{
                  sx: { width: isMobileScreen ? "100%" : 470, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
                }}  
          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          title={drawerTitle}
        >
          {drawerContent}
        </Drawer>
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

export default UniversalRecommendationList;
