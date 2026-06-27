
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
import AddMilestone from "./AddMilestone";
import EditMilestone from "./EditMilestone";
import { useLocation } from "react-router-dom";
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

export default function Milestones(){
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
    const baseurl= import.meta.env.VITE_REACT_APP_BACKEND_URL;
    const [milestones, setMilestones]=useState([]);
    const [searchQuery, setaSearchQuery]=useState("");
    const [page, setPage]=useState(1);
    const [limit, setLimit]=useState(50);
    const [totalpages, setTotalPages]=useState(1);
    const [drawerOpen, setDrawerOpen]=useState(false);
    const [drawerContent, setDrawerContent]= useState(null);

    //fetch milestones
    const fetchMilestones= async()=>{
        try{
          setLoading(true)
            const response= await axios.get(`${baseurl}/api/milestone/v1/milestone`,{
                headers:{
                    Authorization:`Bearer ${token}`
                },
                params:{
                    search:searchQuery,
                    page_no:page,
                    limit:limit
                }
            })

            console.log("response of fetch milestones- ", response);
            setMilestones(response.data?.data)
            setTotalPages(response.data?.data?.lastPage)

        }catch(e){
            console.log("error during fetching milestones- ", e);
        }finally{
          setLoading(false)
        }
    }

    useEffect(()=>{
        fetchMilestones();

    },[searchQuery, page, limit])

    const openHandleAddMilestone= ()=>{
        setDrawerOpen(true)
        setDrawerContent(<AddMilestone
          onCancel={()=>{
            setDrawerOpen(false)
            setDrawerContent(null)
          }}
          onSuccess={()=>{
            setDrawerOpen(false)
            setDrawerContent(null)
            fetchMilestones();
            setAlert({open:true, severity:"success", message:"Milestone Added !!"})
          }}
        />)
    }
    const handleDrawerClose= ()=>{
        setDrawerOpen(false)
        setDrawerContent(null)
    }

    const openHandleEditMilestone= (milestone)=>{
        setDrawerOpen(true)
        setDrawerContent(<EditMilestone
            id={milestone.id}
            onCancel={()=>{
              setDrawerOpen(false)
              setDrawerContent(null)
            }}
            onSuccess={()=>{
              setDrawerOpen(false)
              setDrawerContent(null)
              fetchMilestones();
              setAlert({open:true, severity:"success", message:"Milestone Updated !!"})
            }}

            onDelete={()=>{
              setDrawerOpen(false)
              setDrawerContent(null)
              fetchMilestones();
              setAlert({open:true, severity:"success", message:"Milestone Deleted !!"})
            }}
        />)
    }

    //update milestone ststus= 
    const handleStatusClick= async(milestone)=>{
      console.log("milestone-", milestone);
      const updatedStatus= milestone.status === 1 ? 0 : 1;
      const contributionArray=milestone.contributions?.map((contr)=>({
        contribution_id:contr.id,
        quantity:contr.quantity
      }))

      console.log("contribution array= ", contributionArray);
      try{

      const payload={
        title: milestone.title,
        eatcoins_offered: milestone.eatcoins_offered,
        description:milestone.description,
        status: updatedStatus,
        notes: milestone.notes,
        contribution_arr:contributionArray || []
      }
        const response= await axios.put(`${baseurl}/api/milestone/v1/milestone/${milestone.id}`,payload,{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })

        console.log("response of update ststus- ", response);
        if(response.status===200){
          fetchMilestones();
          setAlert({open:true, message:"Status Updated!!", serVirity:"success"})
        }
      }catch(e){
        console.log("error during update milestone-", e);
        setAlert({open:true, message:"Status Update failed!!", serVirity:"error"})
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
                <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  Milestone
                </Typography>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  placeholder="Value"
                  onChange={(e)=>setaSearchQuery(e.target.value)}
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
                      onClick={openHandleAddMilestone}
                      sx={{
                        width: "150px",       
                        height: "30px",        
                        borderRadius: "6px",  
                        fontSize: "0.75rem",
                      }}
                    >
                      ADD MILESTONE
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
                          <TableCell sx={tableHeaderCellStyle}>SYSTEM TITLE</TableCell>
                          <TableCell sx={tableHeaderCellStyle}>TOTAL ACHIEVERS</TableCell>
                          <TableCell sx={tableHeaderCellStyle}>EAT COINS</TableCell>
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
                        {milestones.data?.length > 0 ? (
                          milestones.data.map((milestone, index) => (
                            <TableRow
                              key={milestone.content_id}
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
                                {milestone.id}
                              </TableCell>

                              <TableCell sx={tableCellStyle}>
                                {milestone.title}
                              </TableCell>

                              <TableCell sx={tableCellStyle}>
                                {milestone.system_title}
                              </TableCell>

                              <TableCell sx={tableCellStyle}>
                                {milestone.total_milestone_completed}
                              </TableCell>

                              <TableCell sx={tableCellStyle}>
                                {milestone.eatcoins_offered}
                              </TableCell>

                              <TableCell sx={tableCellStyle}>
                                <Chip
                                    onClick={()=> handleStatusClick(milestone)}
                                    label={milestone.status === 1 ? "Active" : "Inactive"}
                                    sx={{
                                        backgroundColor: milestone.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                                        color: milestone.status === 1 ? "#1b5e20" : "red", // dark green or orange
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
                                    onClick={() => openHandleEditMilestone(milestone)}
                                  // sx={{
                                  //   transition: "transform 0.2s ease-in-out",
                                  //   "&:hover": {
                                  //     transform: "scale(1.2)",
                                  //   },
                                  // }}
                                >
                                  <MoreVertical24Filled />
                                </IconButton>
                              </TableCell> 
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>  
                            <TableCell colSpan={10} align="center">
                              No milestone found.
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
                sx: { width: isSmallScreen ? "100%" : 550, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
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