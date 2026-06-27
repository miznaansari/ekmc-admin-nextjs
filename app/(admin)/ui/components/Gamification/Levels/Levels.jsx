import { Alert, Box, 
    Button, 
    CircularProgress, 
    Drawer, 
    Grid, 
    InputAdornment, 
    MenuItem, 
    Modal, 
    Pagination, 
    Paper,
    Select,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useTheme,
    TableContainer,
    useMediaQuery,
    IconButton,
    Chip
 } from "@mui/material";
 import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import axios from "axios";
import { MoreVertical24Filled } from "@fluentui/react-icons";
import AddLevel from "./AddLevel";
import EditLevel from "./EditLevel";
import { useLocation } from "@/ui/utils/nextRouting";
import mapAdminAccess from "../../../mapAdminAccess.json"

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
    positions:"fixed",
    width:"auto"
    
  };
  
  const tableCellStyle = {
    fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  borderBottom: "none"
  };

export default function Levels(){
    const [loading ,setLoading]=useState(false);
    const theme=useTheme();
    const eatshots=[];
    const [alert, setAlert] = useState({
                  open: false,
                  severity: "info",
                  message: ""
              });
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const token= localStorage.getItem("authToken");
    const baseurl= process.env.VITE_REACT_APP_BACKEND_URL;
    const [levels, setLevels]=useState([]);
    const [drawerOpen, setDrawerOpen]=useState(false);
    const [drawerContent, setDrawerContent]= useState(null);
    const [page, setPage]=useState(1);
    const [limit, setLimit]=useState(50);
    const [totalpages, setTotalPages]=useState(1);
    


    //fetch levels 
    const fetchLevels= async()=>{
      try{
        setLoading(true)
        const response= await axios.get(`${baseurl}/api/v1/level`, {
          headers:{
            Authorization:`Bearer ${token}`
          },
          params:{
            pageno:page,
            limits:limit
          }
        })

        console.log("response levels= ", response.data?.data);
        setLevels(response.data?.data?.data)
        setTotalPages(response.data?.data?.data?.lastPage)
        console.log("last page", response.data?.data?.data)


      }catch(e){
        console.log("error during fetch levels- ", e);
      }finally{
        setLoading(false)
      }
    }

    useEffect(()=>{
      fetchLevels();
    },[page, limit])

    const handleOpenAddLevel= ()=>{
      setDrawerOpen(true)
      setDrawerContent(<AddLevel
        onCancel={()=>{
          setDrawerOpen(false)
          setDrawerContent(null)
        }}
        onSuccess={()=>{
          setDrawerOpen(false)
          setDrawerContent(null)
          fetchLevels();
          setAlert({open:true, severity:"success", message:"Level Added!!"})
        }}
      />)
    }
    const handleDrawerClose= ()=>{
        setDrawerOpen(false)
        setDrawerContent(null)
    }

    const handleOpenEditLevel= (level)=>{
      setDrawerOpen(true)
      setDrawerContent(<EditLevel
        id={level.level_id}
        onSuccess={()=>{
          setDrawerOpen(false)
          setDrawerContent(null)
          fetchLevels();
          setAlert({open:true, severity:"success", message:"Level Updated!!"})
        }}
        onCancel={()=>{
          setDrawerOpen(false)
          setDrawerContent(null)
        }}
      />)
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
                <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  Levels
                </Typography>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  placeholder="Value"
                  //onChange={(e)=>setSearchQuery(e.target.value)}
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
                      onClick={handleOpenAddLevel}
                      sx={{
                        width: "120px",       
                        height: "30px",        
                        borderRadius: "6px",  
                        fontSize: "0.75rem",
                      }}
                    >
                      ADD LEVEL
                    </Button>
                           </>)}
            </Grid>
          </Grid>
          {/* table for data fetched */}
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
                          <TableCell sx={tableHeaderCellStyle}>S.NO.</TableCell>
                          <TableCell sx={tableHeaderCellStyle}>LEVEL ID</TableCell>
                          <TableCell sx={tableHeaderCellStyle}>STARTING POINT</TableCell>
                          <TableCell sx={tableHeaderCellStyle}>ENDING POINT</TableCell>
                          <TableCell sx={tableHeaderCellStyle}>EATCOIN PRIZE</TableCell>
                          <TableCell sx={tableHeaderCellStyle}>TOTAL ACHIVERS</TableCell>
                          <TableCell sx={tableHeaderCellStyle}>STATUS</TableCell>
                              {(userRole === '1' || hasWriteAccess) && (<>
  
  
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
                          </TableCell> </>)}
                        </TableRow>
                      </TableHead>
          
                       <TableBody>
                        {levels.data?.length > 0 ? (
                          levels.data.map((level, index) => (
                            <TableRow
                              key={level.content_id}
                              sx={{
                                "&:hover": {
                                  //backgroundColor: "#f5f5f5",
                                  cursor: "pointer",
                                },
                                height: "32px",
                                transition: "background-color 0.3s ease-in-out",
                              }}
                            >
                              <TableCell sx={tableCellStyle}>
                              {index + 1 + ((page ?? 1) - 1) * (limit ?? 10)}
                              </TableCell>

                              <TableCell sx={tableCellStyle}>
                                {level.level_id}
                              </TableCell>

                              <TableCell sx={tableCellStyle}>
                                {level.starting_point}
                              </TableCell>

                              <TableCell sx={tableCellStyle}>
                                {level.ending_point}
                              </TableCell>

                              <TableCell sx={tableCellStyle}>
                                {level.eatcoin_prize}
                              </TableCell>
                              
                              <TableCell sx={tableCellStyle}>
                                {level.total_achievers}
                              </TableCell>
                              
                              <TableCell sx={tableCellStyle}>
                                <Chip
                                    label={level.status === 1 ? "Active" : "Inactive"}
                                    sx={{
                                        backgroundColor: level.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                                        color: level.status === 1 ? "#1b5e20" : "red", // dark green or orange
                                        borderRadius: "999px",
                                        px: 2,
                                        py: 0.5,
                                        fontWeight: 600,
                                        fontSize: "0.75rem",
                                    }}
                                />
                              </TableCell>
                              
   {(userRole === '1' || hasWriteAccess) && (<>
  
 
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
                                    sx={{color:"black"}}
                                    onClick={() => handleOpenEditLevel(level)}
                                  // sx={{
                                  //   transition: "transform 0.2s ease-in-out",
                                  //   "&:hover": {
                                  //     transform: "scale(1.2)",
                                  //   },
                                  // }}
                                >
                                  <MoreVertical24Filled />
                                </IconButton>
                              </TableCell>   </>)}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>  
                            <TableCell colSpan={10} align="center">
                              No Levels found.
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
                                onChange={(e) => setLimit(Number(e.target.value))}
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
                              count={totalpages}
                              page={page}
                              onChange={(event, value) => setPage(value)}
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
disableEnforceFocus              anchor="right"
              open={drawerOpen}
              onClose={handleDrawerClose}
              //title={drawerTitle}
              PaperProps={{
                sx: { width: isSmallScreen ? "100%" : 500, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
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
}