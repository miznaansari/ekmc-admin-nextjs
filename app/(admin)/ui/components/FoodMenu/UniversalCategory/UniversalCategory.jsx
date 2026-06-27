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
import mapAdminAccess from "../../../mapAdminAccess.json"
import AddCategory from "./AddCategory"; // Import the AddCategory component
import EditCategory from "./EditCategory"; // Import the EditCategory component
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import useDebounce from "../../../hooks/useDebounce";
import RightDrawer from "../../RightDrawer/RightDrawer";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import { Checkmark24Regular, CheckmarkCircleRegular, DismissCircleRegular, MoreVertical24Filled } from "@fluentui/react-icons";
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

const StyledContainerLarge = styled(Box)(({ theme }) => ({
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
  //backgroundColor: theme.palette.background.paper,
  //borderRadius: theme.shape.borderRadius,
  //boxShadow: theme.shadows[1],
  //minHeight: "70vh",
  //width: "93vw",
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
  boxShadow: "none", 
};

const TableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  borderBottom: "none",
};
const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  borderBottom: "none",
};

const UniversalCategory = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [categories, setCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false); // Controls drawer visibility
  const [drawerTitle, setDrawerTitle] = useState(""); // Sets drawer title dynamically
  const [drawerContent, setDrawerContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [openEditCategory, setOpenEditCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]); // Track selected categories
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false); // Control merge dialog visibility
  const [mergeData, setMergeData] = useState({
    new_name: "",
    cat_image_id: "",
  }); // Track new name and image ID
  const [previewImage, setPreviewImage] = useState(null); // Define previewImage state
  const [uploading, setUploading] = useState(false); // Track if the image is uploading
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");
  const baseUrl=import.meta.env.VITE_REACT_APP_BACKEND_URL
  useEffect(() => {
    fetchCategories();
  }, [page, limit, debouncedSearchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_URL
        }/api/v1/universal-categories`,
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
        setCategories(response.data.data.data);
        setTotalPages(response.data.data.lastPage);
      } else {
        console.error("Failed to fetch categories:", response.data.msg);
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value); // Update search query
    setPage(1); // Reset to the first page
  };

  const handleImageUpload = async (file) => {
    if (file) {
      setUploading(true); // Set uploading to true when the image starts uploading
      const imageId = await uploadImage(file);
      setUploading(false); // Set uploading to false after the upload is complete
      if (imageId) {
        setMergeData((prev) => ({ ...prev, cat_image_id: imageId }));
        setPreviewImage(URL.createObjectURL(file)); // Set the image preview
        setError(null);
      }
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    // setOpenEditCategory(true);
    setDrawerTitle("Edit category"); // Set title for editing profile
    setDrawerContent(
      <EditCategory
        open={drawerOpen}
        handleClose={() => {
          
          setDrawerContent(null)
          setDrawerOpen(false)
          setSnackbarMessage("Categories edited successfully!");
          setSnackbarOpen(true);
          fetchCategories();
        }}
        selectedCategory={category}
        onUplaod={handleUpdateStatus}
        onClose={()=>{
          setDrawerContent(null)
          setDrawerOpen(false)
        }}
      />
    );
    setDrawerOpen(true);
  };

  const handleRefresh = () => {
    fetchCategories();
  };
  const handleCheckboxChange = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };
  const handleMergeCategories = async () => {
    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_URL
        }/api/v1/universal-category/merge`,
        {
          new_name: mergeData.new_name,
          cat_image_id: mergeData.cat_image_id,
          universal_cats: selectedCategories,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.success) {
        setSnackbarMessage("Categories merged successfully!");
        setSnackbarOpen(true);
        setMergeDialogOpen(false); // Close the merge dialog
        setSelectedCategories([]); // Clear selected categories
        setMergeData({ new_name: "", cat_image_id: "" }); // Reset merge data
        fetchCategories(); // Refresh categories
      } else {
        setSnackbarMessage("Categories merged successfully!");
        setSnackbarOpen(true);
        setMergeDialogOpen(false); // Close the merge dialog
        setSelectedCategories([]); // Clear selected categories
        setMergeData({ new_name: "", cat_image_id: "" }); // Reset merge data
        fetchCategories(); // Refresh categories
      }
    } catch (error) {
      console.error("Error merging categories:", error);
      setSnackbarMessage("An error occurred while merging categories.");
      setSnackbarOpen(true);
    }
  };
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${baseUrl}/api/user/admin/uploadImage`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.id;
    } catch (err) {
      setError("Error uploading image. Please try again.");

      return null;
    }
  };

  const Container = isSmallScreen ? StyledContainerSmall : StyledContainerLarge;
  const handleUpdateStatus = (status, message) => {
    if (status === "success") {
      setDrawerOpen(false)
      fetchCategories();
    } else {
      console.error("Update Failed:", message);
      // Show error message to the user
    }
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false); // Close the drawer
    setDrawerContent(null); // Clear drawer content
  };

  //handle ststus update

  const handleStatusClick=async(category)=>{
    console.log("category- ", category);
    const updatedStatus= category.status===1 ?0:1;
    try{

      const payload={
        image_id: category.uc_azure_original_image_url,
        category_name: category.category_name,
        status: updatedStatus,
        is_top_category: category.is_top_category
      }
      const response= await axios.put(`${baseUrl}/api/v1/universal-category/${category.id}`,payload,{
        headers:{
          Authorization:`Bearer ${token}`
        }})

        console.log("response of updating ststus = ", response);
        if(response.status === 200){
          fetchCategories();
          setSnackbarMessage("Status Updated successfully!");
          setSnackbarOpen(true);
          
        }
    }catch(e){
      console.log("error during update status-", e);
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
                        Universal Categories
                      </Typography>
                      <TextField
                          label="Search"
                          variant="outlined"
                          size="small"
                          placeholder="Value"
                          onChange={handleSearchChange}
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
                setOpenAddCategory(true);
                setDrawerTitle("Add Category"); // Set the drawer title
                setDrawerContent(<AddCategory
                drawerClosed={()=>{
                  setDrawerOpen(false)
                }}
                   onClose={() => {
                  setDrawerContent(null)
                  setDrawerOpen(false)
                  setSnackbarMessage("Categories added successfully!");
                  setSnackbarOpen(true);
                  fetchCategories();
               
                }}
                  onCancel={()=>{
                    setDrawerContent(null)
                  setDrawerOpen(false)
                  }}
                />); // Set content for adding an employee
                setDrawerOpen(true);
              }}
              sx={{
                width: "130px",       
                height: "30px",        
                borderRadius: "6px",  
                fontSize: "0.75rem",
              }}
            >
              ADD CATEGORY
            </Button>
           </>)}
              
            {selectedCategories.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setMergeDialogOpen(true)} // Open the merge dialog
                sx={{
                  width: "90px",       
                height: "30px",        
                borderRadius: "6px",  
                fontSize: "0.75rem",
                }}
              >
                Merge
              </Button>
            )}
        </Box>
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
                  <TableCell sx={tableHeaderCellStyle}>SELECT</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>S. NO.</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>CATEGORY IMAGE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>CATEGORY NAME</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>TOP CATEGORY</TableCell>
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
                {categories.length > 0 ? (
                  categories.map((category, index) => (
                    <TableRow
                      key={category.id}
                      sx={{
                        "&:hover": {
                         // backgroundColor: "#f5f5f5",
                          cursor: "pointer",
                        },
                        height: "32px",
                        transition: "background-color 0.3s ease-in-out",
                      }}
                    >
                      <TableCell sx={tableCellStyle}>
                      <Checkbox
                        // Add this logic
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCheckboxChange(category.id)}
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
                          src={category.uc_azure_240px_image_url || category.uc_azure_original_image_url}
                          alt={category.category_name}
                          sx={{ width: 40, height: 40 }}
                        />
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        {category.category_name.charAt(0).toUpperCase() + category.category_name.slice(1)}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                      <Chip
                        icon={
                          category.is_top_category === 1 ? (
                          <CheckmarkCircleRegular fontSize={28} style={{ color: 'green' , width:'28px', height:'28px'}} />
                          ) : (
                          <DismissCircleRegular fontSize={30} style={{ color: 'red' ,width:'28px', height:'28px'}} />
                          )
                          }
                          label=""
                          size="small"
                          variant="outlined"
                          sx={{
                            border:"none"
                          }}
                        />                    
                      </TableCell>
                      <TableCell sx={TableCellStyle}>
                        {new Date(category.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell sx={TableCellStyle}>
                        {new Date(category.updated_at).toLocaleString()}
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        <Chip
                            onClick={()=>handleStatusClick(category)}
                            label={category.status === 1 ? "Active" : "Inactive"}
                            sx={{
                                 backgroundColor: category.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                                 color: category.status === 1 ? "#1b5e20" : "red", // dark green or orange
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
                          ...TableCellStyle,

                          position: "sticky",
                          right: 0,
                          backgroundColor: theme.palette.background.paper,
                          zIndex: 1,
                        }}
                      >
                        <IconButton
                          onClick={() => handleEditCategory(category)}
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
                    <TableCell colSpan={7} align="center">
                      No categories found.
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

        {/* <Dialog
          open={openAddCategory}
          onClose={() => setOpenAddCategory(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              position: "absolute",
              right: 0,
              margin: "auto",
              height: "80vh",
              width: {
                xs: "100vw", // 100% width on smallest screens
                sm: "50vw", // 50% width on small screens
                lg: "30vw", // 30% width on large screens
              },
            },
          }}
        >
          <DialogTitle>Add New Category</DialogTitle>
          <AddCategory
            handleClose={() => setOpenAddCategory(false)}
            editMode={false}
          />
        </Dialog> */}
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
            sx: { width:  isSmallScreen?"100%":470, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}        
        >                  
          {drawerContent}
        </Drawer>

        {/* Edit Category Dialog */}
        {/* <Dialog
          open={openEditCategory}
          onClose={() => setOpenEditCategory(false)}
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
          <DialogTitle>Edit Category</DialogTitle>
          {selectedCategory && (
            <EditCategory
              open={openEditCategory}
              handleClose={() => {
                setOpenEditCategory(false)
                fetchCategories()
              }}
              selectedCategory={selectedCategory}
  onUplaod={handleUpdateStatus}
            />
          )}
        </Dialog> */}
        <Dialog
          open={mergeDialogOpen}
          onClose={() => setMergeDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{ textAlign: "center", fontWeight: "bold", fontSize: "1.5rem" }}
          >
            Merge Categories
          </DialogTitle>
          <Box
            sx={{ padding: 3, display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Inputs Section */}
            <TextField
              label="New Category Name"
              value={mergeData.new_name}
              onChange={(e) =>
                setMergeData((prev) => ({ ...prev, new_name: e.target.value }))
              }
              fullWidth
              required
            />

            {/* Image Upload Section */}
            {/* <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <Avatar
          sx={{ width: 100, height: 100, mb: 2 }}
          src={previewImage || ''}
          alt="Category Preview"
        />
        <input
    accept="image/*"
    id="merge-upload-photo"
    type="file"
    style={{ display: "none" }}
    onChange={async (e) => handleImageUpload(e.target.files[0])}
    disabled={uploading}
  />

        <label htmlFor="merge-upload-photo">
          <Button
            variant="contained"
            component="span"
            startIcon={<PhotoCamera />}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </label>
        {mergeData.cat_image_id && (
          <Typography variant="body2" mt={1}>
            Image Uploaded!
          </Typography>
        )}
      </Box> */}

            {/* Selected Universal Categories */}
            <Box>
              <Typography
                variant="h6"
                sx={{ marginBottom: 1, fontWeight: "bold" }}
              >
                Selected Universal Categories
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  padding: 1,
                  border: "1px solid #ccc",
                  borderRadius: 2,
                  backgroundColor: "#f9f9f9",
                }}
              >
                {categories
                  .filter((cat) => selectedCategories.includes(cat.id))
                  .map((cat) => (
                    <Box
                      key={cat.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        padding: 1,
                        backgroundColor: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <Typography sx={{ fontSize: "0.9rem" }}>
                        {cat.category_name}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() =>
                          setSelectedCategories((prev) =>
                            prev.filter((id) => id !== cat.id)
                          )
                        }
                        sx={{
                          minWidth: "fit-content",
                          padding: "0px 5px",
                          fontSize: "0.8rem",
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                {selectedCategories.length === 0 && (
                  <Typography sx={{ color: "#888", fontStyle: "italic" }}>
                    No categories selected.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setMergeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleMergeCategories}
                disabled={!mergeData.new_name || selectedCategories.length < 2}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Dialog>

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

export default UniversalCategory;
