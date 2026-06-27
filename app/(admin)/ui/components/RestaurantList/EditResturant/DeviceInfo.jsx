import { DesktopMac32Regular } from "@fluentui/react-icons";
import { Alert, Box, Button, Grid, Pagination, Paper, Snackbar, Tab, Tabs, Typography, useMediaQuery, useTheme } from "@mui/material";
import { ClearIcon } from "@mui/x-date-pickers";
import axios from "axios";
import { useEffect, useState } from "react";

const DeviceInfo= ({cafeId})=>{
    console.log("cafe id in device info- ", cafeId)
    //const [currentSessions , setcurrentSessions]=useState([]);
    const [sessions, setSessions] = useState([])
   const [currentPage, setCurrentPage] = useState(1)
   const [successModalOpen, setSuccessModalOpen] = useState(false)
    const theme=useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("md"))
    const handlePageChange = (event, value) => {
      setCurrentPage(value)
   }
   const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL; 
    const token= localStorage.getItem("authToken");
    const [activeRoleId, setActiveRoleId] = useState(2); // default to Manager

   const sessionsPerPage = 6
   const indexOfLastSession = currentPage * sessionsPerPage
   const indexOfFirstSession = indexOfLastSession - sessionsPerPage

   const filteredSessions = sessions.filter(
      (session) => session.user_role_id === activeRoleId
    );
    
   const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession)
   const [alert, setAlert] = useState({
      open: false,
      severity: "info",
      message: ""
  });

  const showAlert = (severity, message) => {
      setAlert({ open: true, severity, message });
      setTimeout(() => {
          setAlert({ ...alert, open: false });
      }, 3000);
  };


   

const roles = [
  { id: 2, label: "Manager" },
  { id: 3, label: "Captain" },
  { id: 4, label: "Kitchen" }
];


    //fetch devices- 
    const fetchDevices= async()=>{
        try{
         const response= await axios(`${baseUrl}/api/cafe-settings/v1/sessions/${cafeId}`,{
            headers:{
               Authorization:`Bearer ${token}`
            }
         })

         console.log("response of fetch devices - ", response.data?.list)
         const data= response.data;
         if(data.status){
            setSessions(data.list)
         }
        }catch(e){
            console.log("error during fetching ",e)
        }
    }
    
    useEffect(()=>{
      fetchDevices();
    },[cafeId])

    //give permission / write access- 

    const handleWriteAccess= async(sessionId)=>{
      console.log("hanlde grant write access clicked",sessionId)
      try{
         const response= await axios.put(`${baseUrl}/api/cafe-settings/v1/permission/${sessionId}`,{},{
            headers:{
               Authorization:`Bearer ${token}`
            }
         })
         console.log("response after permission - ", response)
         fetchDevices();
         if(response.status === 200){
            setAlert({open:true, severity:"success",message:"permission granted!"})
         }
      }catch(e){
         console.log("error during giving permission- ",e)
         setAlert({open:true, severity:"error",message:"permission granted failed!"})
      }
    }


    //session logout
    const handleSessionLogout = async(sessionId)=>{
      try{
         const response= await axios.put(`${baseUrl}/api/ccafe-settings/v1/logout-session/${sessionId}`,{},{
            headers:{
               Authorization:`Bearer ${token}`
            }
         })
         console.log("response in logout session- ", response);
         fetchDevices();
         if(response.status===200){
            setAlert({open:true, severity:"success",message:"session loggedout successfully!!"})
         }
      }catch(e){
         console.log("error during logout- ", e)
         setAlert({open:true, severity:"error",message:"session logout failed"})
      }
    }
    return (
       <div>
          <Paper sx={{p:1}}>
             <Typography variant="h5">Devices</Typography>
             <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                {roles.map((role) => (
                   <Button
                      key={role.id}
                      variant={activeRoleId === role.id ? "contained" : "outlined"}
                      onClick={() => {
                         setActiveRoleId(role.id);
                         setCurrentPage(1); // reset pagination on role switch
                      }}
                   >
                      {role.label}
                   </Button>
                ))}
             </Box>

             <Grid container marginTop={1} spacing={1} pl={1}>
                {currentSessions.map((session) => (

                   <Grid elevation={1} container key={session.id} sx={{ marginBottom: "10px" }} >
                      <Grid
                         display="flex"
                         size={{
                            xs: 12,
                            md: 7
                         }}>
                         <Box sx={{ p: 1, display: isSmall ? "none" : "block" }}>
                            <DesktopMac32Regular />
                         </Box>
                         <Box sx={{ width: "100%" }}>



                            <Box sx={{ display: "flex", mt: 1, justifyContent: "space-between", width: "100%", alignItems: "center" }}>

                               <Box sx={{ display: "flex", flexDirection: "column" }}>
                                  <Typography variant="subtitle2">
                                     {session.device_name || "Device Name Not Available"}
                                  </Typography>
                                  <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>

                                     <Typography variant="body1" pl={1}>
                                        {new Date(session.updated_at).toLocaleString()} •
                                     </Typography>
                                     <Typography
                                        variant="body1"
                                        pl={1}
                                        sx={{
                                           display: {
                                              xs: "none",
                                              sm: "none",
                                              md: "none",
                                              lg: "inline",
                                           },
                                        }}
                                     >
                                        {session.ip_address}
                                     </Typography>
                                  </Box></Box>
                               {!isSmall ? (
                                  <>


                                  </>
                               ) : <>
                                  {/* Responsive Logout Button */}
                                  <Button
                                     variant={"outlined"}
                                     onClick={() => handleSessionLogout(session.id)}
                                     color={isSmall ? "error" : "primary"}
                                     size="small"

                                  >
                                     {/* Show "Logout" only on large screens */}

                                     Logout                                 </Button>

                               </>}
                            </Box>

                         </Box>
                      </Grid>

                      <Grid
                         display="flex"
                         justifyContent="flex-end"
                         alignItems="center"
                         size={{
                            xs: 12,
                            md: 5
                         }}>
                         <Box sx={{ display: "flex", gap: 2 }}>
                            {session.permission === "Write" ? (<>
                               {!isSmall ? (
                                  <Button
                                     variant={"outlined"}
                                     disabled
                                  >
                                     Write Access Granted
                                  </Button>
                               ) : (<>
                                  <Tabs
                                     value={'one'}
                                     aria-label="wrapped label tabs example"
                                     //onClick={() => handleWriteAccess(session.id)}
                                  >
                                     <Tab
                                        value="one"
                                        label="   Write Access Granted"
                                        wrapped
                                     />

                                  </Tabs>
                               </>)}
                            </>
                            ) : (
                               <>
                                  {!isSmall ? (
                                     <>
                                        <Button
                                           size="small"
                                           variant={"outlined"}
                                          onClick={() => handleWriteAccess(session.id)}
                                        >
                                           Grant Write Access
                                        </Button>

                                     </>
                                  ) : <>
                                     <Tabs
                                        value={'one'}
                                        aria-label="wrapped label tabs example"
                                       onClick={() => handleWriteAccess(session.id)}
                                     >
                                        <Tab
                                           value="one"
                                           label="   Grant Write Access"
                                           wrapped
                                        />

                                     </Tabs>
                                  </>}
                               </>

                            )}
                            {!isSmall ? (
                               <>
                                  {/* Responsive Logout Button */}
                                  <Button
                                     variant={"outlined"}
                                     onClick={() => handleSessionLogout(session.id)}
                                     color={isSmall ? "error" : "primary"}
                                     size="small"

                                  >
                                     {/* Show "Logout" only on large screens */}

                                     <ClearIcon />
                                  </Button>

                               </>
                            ) : <>

                            </>}
                         </Box>
                      </Grid>
                   </Grid>

                ))}

                <Pagination
                   count={Math.ceil(filteredSessions.length / sessionsPerPage)}
                   page={currentPage}
                   onChange={handlePageChange}
                   variant="outlined"
                   color="primary"
                   sx={{ marginTop: 2 }}
                />

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
             </Grid>
          </Paper>
       </div>
    );
}

export default DeviceInfo;