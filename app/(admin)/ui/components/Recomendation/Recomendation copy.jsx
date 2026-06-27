import { display, Grid } from "@mui/system";
import React, { useContext, useEffect, useState } from "react";
import { styled, useTheme } from "@mui/system";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  TableContainer,
  Chip,
  IconButton,
  FormLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Snackbar,
  Alert,
  InputAdornment,
  CssBaseline,
  Paper,
  Drawer,
  useMediaQuery,
  Stack
} from "@mui/material";
import mapAdminAccess from "../../mapAdminAccess.json"
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import axios from "axios";
import AddRecommendation from "./AddRecomendation";
import RightDrawer from "../RightDrawer/RightDrawer";
import EditRecommendation from "./EditRecomendation";
import { Pagination } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import useDebounce from "../../hooks/useDebounce";
import { getTimeDifference } from "../../utils/timeUtils";
import { MoreVertical24Filled } from "@fluentui/react-icons";
import { DrawerContext } from "../../context/DrawerContext";
import { Close } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
dayjs.extend(utc);
dayjs.extend(duration);


const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  flex: 1,
  height: "calc(89vh - 136px)",
  overflowY: "auto",
  overflowX: "auto",
  width: "100%",
}));

const tableHeaderCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  color: "#000",
  //fontWeight: "bold",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",
  borderBottom: "none",
};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  color: "#000",

  borderBottom: "none",
  //borderBottom: "none",
  backgroundColor: "white", // <--- This removes the default background
  boxShadow: "none",

};
const statusMap = {
  1: { label: "In Review", color: "warning" },
  2: { label: "Active", color: "success" },
  3: { label: "Expired", color: "default" },
};
const statusStyleMap = {
  "In Review": {
    backgroundColor: "#fff8e1",
    color: "#ff6f00",
  },
  "Active": {
    backgroundColor: "#e8f5e9",
    color: "##004A0014",
  },
  "Expired": {
    backgroundColor: "#eceff1",
    color: "#607d8b",
  },
};

const Recomendation = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [Recommendations, setRecommendations] = useState([]);
  const [limit, setLimit] = useState(50);
  const token = localStorage.getItem("authToken");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("");
  const [drawerContent, setDrawerContent] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openAddCombo, setOpenAddCombo] = useState(false);
  const [editDrawerContent, setEditDrawerContent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [totalPages, setTotalPages] = useState();
  const [totalRecords, setTotalRecords] = useState();
  const { drawerOpenL } = useContext(DrawerContext);
  const [status, setStatus] = useState("");

  console.log("drawer state:", drawerOpenL);

  const StyledContainerLarge = styled(Box)(({ theme }) => ({
    // marginTop: theme.spacing(1),
    // marginBottom: theme.spacing(1),
    //padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    //boxShadow: theme.shadows[1],
    //minHeight: "70vh",
    //width: "93vw",
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    //overflow:"hidden",
    width: "100%", // ✅ Make it take full width of parent
    padding: theme.spacing(3), // Optional: add spacing
    //minHeight: "100vh",
    // marginRight:"100px",
    // paddingRight: drawerOpenL ?'250px':'16px',
    // transition: "padding-right 0.3s ease", 
    //height:`calc(98vh - 88px)`,
    boxShadow: "none",
    marginTop: "12px",

    //right: "24px"
    height: `calc(98vh - 88px)`



  }));
  useEffect(() => {

    FetchRecomendations();
  }, [limit, page, searchQuery, status])

  const FetchRecomendations = async () => {
    try {
      console.log("token before axios get=", token);
      setLoading(true);

      const Response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/myeats/v1/recommendations`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            search: searchQuery,
            limits: limit,
            page_no: page,
            status: status   // <-- pass selected status
          }
        }
      );

      setRecommendations(Response.data.records);
      setTotalPages(Response.data.total_pages);
      setTotalRecords(Response.data?.total_records);

    } catch (e) {
      console.log("error during fetch recommendation from Api:", e);
    } finally {
      setLoading(false);
    }
  };



  const handleDrawerClose = () => {
    setDrawerOpen(false); // Close the drawer
    setDrawerContent(null); // Reset content
  };

  const openRecommendationDialog = (type, recommendation = null) => {
    setDrawerOpen(true);
    setDrawerContent(
      <AddRecommendation
        onSuccess={() => (
          setDrawerOpen(false),
          setDrawerContent(null),
          setSnackbarOpen(true),
          setSnackbarMessage("Recommendation added successfully!"),
          FetchRecomendations()
        )}
        onCancel={() => (
          setDrawerOpen(false),
          setDrawerContent(null)
        )}
      />
    );
    setDrawerTitle("Add Recommendation");
  };

  const openEditRecommendationDialog = (recommendation) => {
    setDrawerOpen(true);
    setDrawerTitle("Edit Recommendation");
    console.log("recommendation id in Recommedation.jsx:", recommendation.id);
    setDrawerContent(
      <EditRecommendation
        id={recommendation.id}
        onSuccess={() => {
          setDrawerOpen(false);
          setDrawerContent(null);
          setSnackbarOpen(true);
          FetchRecomendations();
          setSnackbarMessage("Recommendation updated!");
        }}
        onCancel={() => {
          setDrawerOpen(false);
          setDrawerContent(null);

        }}
      />
    );
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false)
  }


  // useEffect(()=>{
  //   setSnackbarMessage("hello")
  //   setSnackbarOpen(true)
  // },[])

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSearchRecommendation = () => {

  }



  //-===========================================
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
      <CssBaseline></CssBaseline>
      <Paper >
        <Grid
          container
          spacing={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{ overflow: "hidden" }}
        >
          <Grid
            paddingTop={1}
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                Recommendation
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
              <FormControl fullWidth size="small" sx={{ width: 150 }}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Status"
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                    // FetchRecomendations();
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="1">In Review</MenuItem>
                  <MenuItem value="2">Approved</MenuItem>
                  <MenuItem value="3">Expired</MenuItem>
                </Select>
              </FormControl>


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
                onClick={openRecommendationDialog}
                sx={{
                  width: "180px",
                  height: "30px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                }}
              >
                ADD RECOMMENDATION
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
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <StyledTableContainer>
            <Table stickyHeader>
              <TableHead  >
                <TableRow >
                  <TableCell sx={tableHeaderCellStyle}>S.NO.</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>TITLE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>AUTHOR NAME</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>TAGGED</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>DATED</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>IMPRESSIONS</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>VIEWS</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>SHARES</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>VALID TILL</TableCell>
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
                    </TableCell>
                  </>)}
                </TableRow>
              </TableHead>

              <TableBody>
                {Recommendations.length > 0 ? (
                  Recommendations.map((Recommendation, index) => (
                    <TableRow
                      key={Recommendation.id}
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
                      <TableCell sx={tableCellStyle}> {Recommendation.title.charAt(0).toUpperCase() + Recommendation.title.slice(1)}</TableCell>

                      <TableCell sx={tableCellStyle}>
                        <Tooltip
                          title={
                            <Box sx={{ whiteSpace: 'pre-line' }}>
                            </Box>
                          }
                        >
                              {Recommendation.first_name.charAt(0).toUpperCase() + Recommendation.first_name.slice(1)} {Recommendation.last_name.charAt(0).toUpperCase() + Recommendation.last_name.slice(1)}
<br /><Typography variant="subtitle" sx={{  mt: 0.5,color:'gray' }}>
                          

                          {Recommendation.mobile_number}
                        </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        <Tooltip
                          title={
                            <Box>
                              {Recommendation.cafes && Recommendation.cafes.length > 0 ? (
                                Recommendation.cafes.map((cafe, index) => (
                                  <Typography
                                    key={index}
                                    variant="body2"
                                    sx={{ whiteSpace: "pre-line" }}
                                  >
                                    {`${cafe.cafe_name}: ${cafe.address_1 || ""}${cafe.address_2 ? ", " + cafe.address_2 : ""}`}
                                  </Typography>
                                ))
                              ) : (
                                "No Cafés"
                              )}
                            </Box>
                          }
                          arrow
                        >
                          <span>{Recommendation.cafes.length}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        <Tooltip title={getTimeDifference(Recommendation.created_at)}>
                          <span>
                            {dayjs.utc(Recommendation.created_at).format("DD MMM YYYY, hh:mm A")}
                          </span>
                        </Tooltip>
                      </TableCell>

                      <TableCell sx={tableCellStyle}>{Recommendation.impression_count}</TableCell>
                      <TableCell sx={tableCellStyle}>{Recommendation.views}</TableCell>
                      <TableCell sx={tableCellStyle}>{Recommendation.shares}</TableCell>
                      <TableCell sx={tableCellStyle}>
                        {dayjs
                          .utc(Recommendation.created_at)
                          .add(Recommendation.validity_in_days, "day")
                          .format("DD MMM YYYY, hh:mm A ")
                        }
                      </TableCell>
                      <TableCell sx={tableCellStyle}>
                        <Chip
                          label={statusMap[Recommendation.status]?.label || "unknown"}
                          sx={{
                            ...statusStyleMap[statusMap[Recommendation.status]?.label],
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
                        <MoreVertical24Filled
                          onClick={() => openEditRecommendationDialog(Recommendation)}
                          sx={{
                            transition: "transform 0.2s ease-in-out",
                            "&:hover": {
                              transform: "scale(1.2)",
                            },
                          }}
                        >
                          <EditIcon />
                        </MoreVertical24Filled>
                      </TableCell> </>)}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No Recommendations found.
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
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                shape="rounded"
                variant="outlined"
                size="medium"
              />
            </Box>
          </Grid>
        </Grid>


        {/* <RightDrawer
                  open={drawerOpen}
                  onClose={handleDrawerClose}
                  title={drawerTitle}
                >
                  {drawerContent}
                </RightDrawer> */}
        <Drawer
disableEnforceFocus          anchor="right"
          open={drawerOpen}
          onClose={handleDrawerClose}
          title={drawerTitle}
          PaperProps={{
            sx: { width: isSmallScreen ? "100%" : 400, p: 0, margin: "0px", height: "100vh", bgcolor: "#F7F7F7" },
          }}

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
}

export default Recomendation;