import {
  Box,
  Grid,
  Button,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Link,
  Tooltip,
  Tab,
  Chip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Modal,
  Paper,
  Drawer,
  useMediaQuery,
  Snackbar,
  Alert

} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { positions, useTheme } from "@mui/system";
import axios from "axios";
import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import AddEatshot from "./AddEatshot";
import mapAdminAccess from "../../mapAdminAccess.json"

import RightDrawer from "../RightDrawer/RightDrawer";
import EditEatshot from "./EditEatShot";
import ApproveEatshot from "./ApproveEatShot";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import { Dismiss24Regular, MoreVertical24Filled } from "@fluentui/react-icons";
import { CircularProgress } from "@mui/material";
import VideoPlayerModal from "./VideoPlayerModal";
import { styled } from '@mui/material/styles';
import VideoPlayer from "./VideoPlayer";
import { useLocation } from "react-router-dom";


const CustomCloseButton = styled(IconButton)(() => ({
  top: 0,
  right: 0,
  color: 'rgba(47, 43, 61, 0.54)',
  position: 'absolute',
  transform: 'translate(10px, -10px)',
  borderRadius: 6,
  backgroundColor: 'white',
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)',
    backgroundColor: 'white',
  },
}));


const statusMap = {
  1: { label: "Approved", color: "primary" },
  0: { label: "Pending", color: "secondary" }
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
  positions: "fixed",
  width: "auto"

};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  borderBottom: "none"
};

const EatShot = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [eatshots, setEatshots] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalpages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);
  const [drawerTitle, setDrawerTitle] = useState("");
  const token = localStorage.getItem("authToken");
  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const [open, setOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });

  const [searchQuery, setSearchQuery] = useState("");

  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setScreenHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpen = (url) => {
    setVideoUrl(url);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setVideoUrl("");
  };

  useEffect(() => {
    fetchEatShots();
  }, [page, limit, searchQuery]);

  const fetchEatShots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseurl}/api/v1/social/content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }, params: {
            search: searchQuery,
            limit: limit,
            page: page
          }
        }
      )
      setEatshots(response.data.response);
      //setTotalPages(response.data.total)
      console.log("eatshots response:", response.data.response);
      console.log("total =", response.data?.response?.total);
      setTotalEntries(response.data?.response?.total)
      setTotalPages(response.data.response.lastPage);


    } catch (e) {
      console.log("error during fetch eatshot- ", e);
    } finally {
      setLoading(false);
    }
  }


  console.log("total pages:", totalpages)

  //Open Addeatshot
  const openHandleAddeatShot = () => {
    setDrawerOpen(true);
    setDrawerTitle("Add Eatshot");
    setDrawerContent(<AddEatshot
      onSuccess={() => {
        setDrawerOpen(false);
        setDrawerContent(null);
        fetchEatShots();
        setAlert({ open: true, severity: "success", message: "eatshot added successfully" })
      }}
      onCancel={() => {
        setDrawerOpen(false);
        setDrawerContent(null);
      }}
    />)
  }
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setDrawerContent(null);
  }
  //Open EditEatShot
  const openHndleEditEatshot = (eatshot) => {
    console.log("eatshot id-", eatshot.content_id)
    setDrawerOpen(true);
    setDrawerTitle("Add Eatshot");
    setDrawerContent(<EditEatshot
      content_id={eatshot.content_id}
      eatshot={eatshot}
      onSuccess={(msg) => {
        setDrawerOpen(false);
        setDrawerContent(null);
        fetchEatShots();
        console.log("message in eatshot- ", msg)
        setAlert({ open: true, severity: "success", message: msg })
      }}
      onCancel={() => {
        setDrawerOpen(false);
        setDrawerContent(null);
      }}
      onApprove={() => {
        fetchEatShots();
      }}

    />)
  }

  //Handle approve Eatshot
  const HandleApproveeatshot = (eatshot) => {
    setDrawerOpen(true);
    setDrawerTitle("Manage Eatshot");
    console.log("is approved:", eatshot.is_approved);
    setDrawerContent(<ApproveEatshot
      content_id={eatshot.content_id}
      is_approve={eatshot.is_approved}
      onSuccess={() => {
        setDrawerOpen(false);
        setDrawerContent(null);
        fetchEatShots();
      }}
    />)
  }
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleStatusButton = async (id) => {
    try {
      const response = await axios.put(`${baseurl}/api/v1/social/approve`, {
        content_arr: [
          {
            content_id: id
          }
        ]
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        })
      console.log("Response:", response

      );
      if (response.status === 200) {
        setAlert({ open: true, severity: "success", message: "Approved" })
        fetchEatShots();
      }
    } catch (e) {
      console.log("error during update ststus- ", e);
      setAlert({ open: true, severity: "error", message: "Error: error updating status / server error" })
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
    <Box paddingTop={3}>
      <Paper sx={{ width: "100%", overflow: "hidden", mt: 1, p: 1, pb: 0 }}>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                Eatshot
              </Typography>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                placeholder="Value"
                onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={openHandleAddeatShot}
                sx={{
                  width: "120px",
                  height: "30px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                }}
              >
                ADD EATSHOT
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
          <TableContainer sx={{ maxHeight: `${screenHeight - 250}px`, overflowY: "auto" }}>
            <Table stickyHeader size="small">
              <TableHead
                sx={{
                  textTransform: "uppercase",
                  backgroundColor: "#f7faf7",
                  color: "#768DA9",
                }}
              >
                <TableRow>
                  <TableCell>S.NO.</TableCell>
                  <TableCell>EATSHOT VIDEO URL</TableCell>
                  <TableCell>AUTHOR NAME</TableCell>
                  <TableCell>TAGGED EATERIES</TableCell>
                  <TableCell>TAGGED USERS</TableCell>
                  <TableCell>IMPRESSION</TableCell>
                  <TableCell>View</TableCell>
                  <TableCell>LIKES</TableCell>
                  <TableCell>SHARES</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>IS TEST</TableCell>
                  {(userRole === '1' || hasWriteAccess) && (
                    <TableCell
                      sx={{
                        position: "sticky",
                        right: 0,
                        backgroundColor: theme.palette.background.paper,
                        zIndex: 100,
                      }}
                    >
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {eatshots.data?.length > 0 ? (
                  eatshots.data.map((eatshot, index) => (
                    <TableRow
                      key={eatshot.content_id}
                      sx={{
                        "&:hover": {
                          //backgroundColor: "#f5f5f5",
                          cursor: "pointer",
                        },
                        height: "32px",
                        transition: "background-color 0.3s ease-in-out",
                      }}
                    >
                      <TableCell>
                        {index + 1 + ((eatshots?.currentPage ?? 1) - 1) * (eatshots?.perPage ?? 10)}
                      </TableCell>

                      <TableCell>
                        <Typography
                          onClick={() => handleOpen(eatshot.cf_stream_url)}
                          //style={{ color: "blue", cursor: "pointer" }}
                          variant="h7"
                        >
                          View Video
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {eatshot.first_name.charAt(0).toUpperCase() + eatshot.first_name.slice(1)} {eatshot.last_name}
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            <Box>
                              {eatshot.cafes && eatshot.cafes.length > 0 ? (
                                eatshot.cafes.map((cafe, index) => (
                                  <Typography
                                    key={index}
                                    variant="body2"
                                    sx={{ whiteSpace: "pre-line" }}
                                  >
                                    {`${cafe.cafe_name}`}
                                  </Typography>
                                ))
                              ) : ("No cafes")}
                            </Box>
                          }
                        >
                          <span>{eatshot.cafes.length}</span>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Tooltip
                          title={
                            <Box>
                              {eatshot.content_peoples && eatshot.content_peoples.length > 0 ? (
                                eatshot.content_peoples.map((user, index) => (
                                  <Typography
                                    key={index}
                                    variant="body2"
                                    sx={{ whiteSpace: "pre-line" }}
                                  >
                                    {`${user.first_name} ${user.last_name}`}
                                  </Typography>
                                ))
                              ) : ("No Tagged users")}
                            </Box>
                          }
                        >
                          <span>{eatshot.content_peoples.length}</span>
                        </Tooltip>
                      </TableCell>

                      <TableCell>{eatshot.impressions}</TableCell>
                      <TableCell>{eatshot.view_count}</TableCell>
                      <TableCell>{eatshot.likes}</TableCell>
                      <TableCell>
                        {eatshot.shares}
                      </TableCell>
                      <TableCell>
                        <Chip
                          onClick={() => handleStatusButton(eatshot.content_id)}
                          size="small"
                          label={statusMap[eatshot.is_approved]?.label || "Pending"}
                          color={statusMap[eatshot.is_approved]?.color || "secondary"}
                        />
                      </TableCell>
                      <TableCell>
                        {eatshot.is_test === 1 || eatshot.is_test === "1" ? (
                          <Chip
                            size="small"
                            label="Test"
                            color="error"
                            variant="outlined"
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="Prod"
                            color="success"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      {(userRole === '1' || hasWriteAccess) && (
                        <TableCell
                          sx={{
                            position: "sticky",
                            right: 0,
                            backgroundColor: theme.palette.background.paper,
                            zIndex: 1,
                          }}
                        >
                          <IconButton
                            sx={{ color: "black" }}
                            onClick={() => openHndleEditEatshot(eatshot)}
                          >
                            <MoreVertical24Filled />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No eatshots found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination Footer */}
        <Grid container sx={{ my: 1 }}>
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
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  sx={{
                    minWidth: 70,
                    height: 32,
                    fontSize: "0.875rem",
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
                onChange={(e, val) => setPage(val)}
                shape="rounded"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
        <Modal open={open} onClose={handleClose}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 8,
              outline: "none",
              width: "90%",          // updated from 100%
              maxWidth: "400px",     // reduced from 600px
            }}
          >
            <CustomCloseButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 10,
                cursor: "pointer",
              }}
            >
              <Dismiss24Regular fontSize="1.25rem" />
            </CustomCloseButton>
            {/* <VideoPlayerModal videoUrl={videoUrl} /> */}
            <VideoPlayer url={videoUrl} />
          </div>
        </Modal>
        {/* <RightDrawer
                        open={drawerOpen}
                        title={drawerTitle}
                        onClose={handleDrawerClose}
                      >
                        {drawerContent}
                      </RightDrawer> */}
        <Drawer
          disableEnforceFocus anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          title={drawerTitle}
          PaperProps={{
            sx: { width: isSmallScreen ? "100%" : 800, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
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

export default EatShot;