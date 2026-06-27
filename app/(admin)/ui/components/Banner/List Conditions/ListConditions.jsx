import {
    TableContainer,
    Alert, Box, Button, Chip, CircularProgress, Drawer, Grid, IconButton, InputAdornment, MenuItem, Pagination, Paper, Select, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, 
    useMediaQuery} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import { MoreVertical24Filled } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { styled, useTheme } from '@mui/material/styles';
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import EditRoute from "../List Routes/EditRoute";
import AddCondition from "./AddCondition";
import EditConditions from "./EditCondition";
import { useLocation } from "@/ui/utils/nextRouting";
import mapAdminAccess from "../../../mapAdminAccess.json"
import { formatUTCToLocal, FormattedDate } from "../../../utils/timeUtils";

dayjs.extend(utc);
dayjs.extend(duration);



const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    flex: 1,
  height: "calc(89vh - 136px)", 
  overflowY: "auto",
  overflowX: "auto",
  }));
  
  const tableHeaderCellStyle = {
    fontSize: "0.75rem",
    padding: "1.2vh 1.8vh",
    borderBottom: "none",
    backgroundColor: "white", 
    boxShadow: "none",  
    positions:"fixed",
    width:"auto"
    
  };
  
  const tableCellStyle = {
    fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  borderBottom: "none"
  };


const ListConditions= ()=>{
    const [loading ,setLoading]=useState(false);
            const theme=useTheme();
            const [alert, setAlert] = useState({
                          open: false,
                          severity: "info",
                          message: ""
                      });
            const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
            const token= localStorage.getItem("authToken");
            const baseurl= process.env.VITE_REACT_APP_BACKEND_URL;
            const [drawerOpen, setDrawerOpen]=useState(false);
            const [drawerContent, setDrawerContent]= useState(null);
            const [page, setPage]=useState(1);
            const [limit, setLimit]=useState(50);
            const [totalpages, setTotalPages]=useState(1);
    
            const handleDrawerClose= ()=>{
            setDrawerOpen(false)
            setDrawerContent(null)
        }
        const [conditions, setConditions]=useState([]);

    
    
        const fetchListConditions= async ()=>{
          setLoading(true)
            try{
    
                const response= await axios.get(`${baseurl}/api/banner/condition/v1/banners`,{
                    headers:{
                        Authorization:`Bearer ${token}`
                    },
                    params:{
                        page:page,
                        limit:limit,
                    }
                })
    
                setConditions(response.data?.data)
                setTotalPages(response.data?.pagination?.totalPages);
    
    
            }
            catch(e){
                console.log("error during list route fetch - ", e);
            }
            finally{
                setLoading(false)
            }
        }
    
        useEffect(()=>{
    
            fetchListConditions();
        },[page, limit])
    
        //handle add drawer open
            const handleOpenAddRoute= ()=>{
              setDrawerOpen(true)
              setDrawerContent(<AddCondition
                onCancel={()=>{
                  setDrawerOpen(false)
                  setDrawerContent(null)
                }}
                onSuccess={()=>{
                  setDrawerOpen(false)
                  setDrawerContent(null)
                  fetchListConditions();
                  setAlert({open:true, severity:"success", message:"Condition Added!!"})
                }}
              />)
            }
        
            //handle edit route drawer
            const handleOpenEditConditions= (condition)=>{
                setDrawerOpen(true)
                setDrawerContent(<EditConditions
                condition={condition}
                onSuccess={()=>{
                    setDrawerOpen(false)
                    setDrawerContent(null)
                    fetchListConditions();
                    setAlert({open:true, severity:"success", message:"Route Updated!!"})
                }}
                onCancel={()=>{
                    setDrawerOpen(false)
                    setDrawerContent(null)
                }}
                />)
            }

        //handle ststus update
        const handleStatusClick=async(condition)=>{
          console.log("cond-= --", condition)
          const updatedStatus= condition.status ===1? 0:1;

          const payload= {
              title: condition.title,
              banner_condition: condition.banner_condition,
              value: condition.value,
              status: updatedStatus
          }
          console.log("payload in up dstat- ",payload);
          try{
            const response= await axios.put(`${baseurl}/api/banner/condition/v1/banner/${condition.id}`,payload,{
              headers:{
                Authorization:`Bearer ${token}`
              }
            })
            if(response.status === 200){
              fetchListConditions();
              setAlert({severity:"success", message:"Status updated!!", open:"true"})
            }


          }catch(e){
            console.log("error during update status -= ", e);
            setAlert({severity:"error", message:"Status update Failed !!", open:"true"})
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
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                      Conditions
                    </Typography>
                    {/* <TextField
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
                    /> */}
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
                          onClick={handleOpenAddRoute}
                          sx={{
                            width: "180px",       
                            height: "30px",        
                            borderRadius: "6px",  
                            fontSize: "0.75rem",
                          }}
                        >
                          ADD CONDITIONS
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
                              <TableCell sx={tableHeaderCellStyle}>ID</TableCell>
                              <TableCell sx={tableHeaderCellStyle}>TITLE</TableCell>
                              <TableCell sx={tableHeaderCellStyle}>CONDITION</TableCell>
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
                            {conditions?.length > 0 ? (
                              conditions.map((condition, index) => (
                                <TableRow
                                  key={condition.id}
                                  sx={{
                                    "&:hover": {
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
                                    {condition.id}
                                  </TableCell>
    
                                  <TableCell sx={tableCellStyle}>
                                    {condition.title}
                                  </TableCell>
    
                                  <TableCell sx={tableCellStyle}>
                                    {condition.banner_condition} : {condition.value}
                                  </TableCell>
    
                                  <TableCell sx={tableCellStyle}>
                                    <FormattedDate value={condition.created_at} />
                                  </TableCell>
                                  
                                  <TableCell sx={tableCellStyle}>
                                    <FormattedDate value={condition.updated_at} />
                                  </TableCell>
                                  
                                  <TableCell sx={tableCellStyle}>
                                    <Chip
                                        onClick={()=>handleStatusClick(condition)}
                                        label={condition.status === 1 ? "Active" : "Inactive"}
                                        sx={{
                                            backgroundColor: condition.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                                            color: condition.status === 1 ? "#1b5e20" : "red", // dark green or orange
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
                                        sx={{color:"black"}}
                                        onClick={() => handleOpenEditConditions(condition)}
                                    >
                                      <MoreVertical24Filled />
                                    </IconButton>
                                  </TableCell> 
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
disableEnforceFocus                  anchor="right"
                  open={drawerOpen}
                  onClose={handleDrawerClose}
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

export default ListConditions;