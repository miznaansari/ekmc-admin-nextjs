
import {
  TableContainer,
  Alert, Box, Button, Chip, CircularProgress, Drawer, Grid, IconButton, InputAdornment, MenuItem, Pagination, Paper, Select, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
  useMediaQuery
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search"; // Corrected import
import { MoreVertical24Filled } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { styled, useTheme } from '@mui/material/styles';
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import EditRoute from "../List Routes/EditRoute";
import AddBanner from "./AddBanner";
import EditBanner from "./EditBanner";
import mapAdminAccess from "../../../mapAdminAccess.json"
import { useLocation } from "@/ui/utils/nextRouting";

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
  positions: "fixed",
  width: "auto"

};

const tableCellStyle = {
  fontSize: "0.75rem",
  padding: "1.2vh 1.8vh",
  borderBottom: "none"
};



const ListBanners = () => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    message: ""
  });
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const token = localStorage.getItem("authToken");
  const baseurl = process.env.VITE_REACT_APP_BACKEND_URL;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalpages, setTotalPages] = useState(1);

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setDrawerContent(null)
  }
  const [banners, setBanners] = useState([]);

  //set banner routes vars
  const [bannerRoutes, setBannerRoutes] = useState([]);
  const [bannerRouteId, setBannerRouteId] = useState(null);


  const fetchListBanners = async () => {
    try {
      setLoading(true)

      const response = await axios.get(`${baseurl}/api/banner/main/v1/banners`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: page,
          limit: limit,
        }
      })

      console.log("banners- ", response)

      setBanners(response.data?.data)
      setTotalPages(response.data?.totalPages);


    }
    catch (e) {
      console.log("error during list route fetch - ", e);
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {

    fetchListBanners();
  }, [page, limit])

  //handle add drawer open
  const handleOpenAddRoute = () => {
    setDrawerOpen(true)
    setDrawerContent(<AddBanner
      onCancel={() => {
        setDrawerOpen(false)
        setDrawerContent(null)
      }}
      onSuccess={() => {
        setDrawerOpen(false)
        setDrawerContent(null)
        fetchListBanners();
        setAlert({ open: true, severity: "success", message: "Banner Added!!" })
      }}
    />)
  }

  //handle edit route drawer
  const handleOpenEditBanner = (banner) => {
    setDrawerOpen(true)
    setDrawerContent(<EditBanner
      bannerId={banner.id}
      onSuccess={() => {
        setDrawerOpen(false)
        setDrawerContent(null)
        fetchListBanners();
        setAlert({ open: true, severity: "success", message: "Banner Updated!!" })
      }}
      onCancel={() => {
        setDrawerOpen(false)
        setDrawerContent(null)
      }}
    />)
  }

  //handle status update sec.

  const handleStatusUpdate = async (banner) => {
    console.log(banner)
    const updatedStatus = banner.status === 1 ? 0 : 1;
    const payload = {
      banner_title: banner.banner_title,
      is_lottie: banner.is_lottie,
      is_video: banner.is_video,
      is_image: banner.is_image,
      banner_url: banner.banner_url,
      banner_expiry: banner.banner_expiry
        ? dayjs(banner.banner_expiry).format("YYYY-MM-DD HH:mm:ss")
        : ""
      ,
      status: updatedStatus,
      banner_placement_id: banner.banner_placement_id,
      banner_route_id: banner.banner_route_id,
      condition_id: banner.condition_id
    }

    console.log("payload ", payload)
    try {

      const response = await axios.put(`${baseurl}/api/banner/main/v1/banner/${banner.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 200) {
        fetchListBanners();
        setAlert({ open: true, severity: "success", message: "status updated !!" })

      }



    } catch (e) {
      console.log("error during update status -", e);
      setAlert({ open: true, severity: "error", message: "status update failed !!" })
    }
  }

  //fetch banner routes
  const fetchBnannerRoutes = async () => {
    try {
      const response = await axios.get(`${baseurl}/api/banner/route/v1/banners`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })


      const data = response.data?.data?.map((res) => ({
        label: res.banner_route,
        value: res.id
      }))
      console.log("routes data- ", data)
      setBannerRoutes(data);

    } catch (e) {
      console.log("error during fetch banner routes- ", e);
    }
  }

  useEffect(() => {
    fetchBnannerRoutes()
  }, [])




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
                Banners
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
                ADD BANNER
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
                  <TableCell sx={tableHeaderCellStyle}>PATH</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>TYPE</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>URL</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>TOTAL VIEWS</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>TOTAL CLICKS</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>CREATED AT</TableCell>
                  <TableCell sx={tableHeaderCellStyle}>EXPIRY DATE</TableCell>
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
                {banners?.length > 0 ? (
                  banners.map((banner, index) => (
                    <TableRow
                      key={banner.id}
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
                        {banner.id}
                      </TableCell>

                      <TableCell sx={tableCellStyle}>
                        {banner.banner_title}
                      </TableCell>

                      <TableCell sx={tableCellStyle}>
                        {
                          bannerRoutes.find(route => route.value === banner.banner_route_id)?.label
                          || banner.banner_route_id
                        }
                      </TableCell>

                      <TableCell sx={tableCellStyle}>
                        {banner?.is_image === 1
                          ? "Image"
                          : banner?.is_lottie === 1
                            ? "Lottie"
                            : banner?.is_video === 1
                              ? "Video"
                              : "-"}

                      </TableCell>

                      <TableCell sx={tableCellStyle}>
                        {banner.banner_url?.startsWith("http")
                          ? new URL(banner.banner_url).pathname
                          : banner.banner_url}
                      </TableCell>

                      <TableCell sx={tableCellStyle}>
                        {banner.views}
                      </TableCell>

                      <TableCell sx={tableCellStyle}>
                        {banner.clicks}
                      </TableCell>


                      <TableCell sx={tableCellStyle}>

                        {dayjs.utc(banner.created_at).format("DD MMM YYYY, hh:mm A")}
                      </TableCell>

                      <TableCell sx={tableCellStyle}>

                        {dayjs(banner.banner_expiry).format("DD MMM YYYY, hh:mm A")}
                        {console.log("single banner - ", banner)}
                      </TableCell>

                      <TableCell sx={tableCellStyle}>
                        <Chip
                          onClick={() => handleStatusUpdate(banner)}
                          label={banner.status === 1 ? "Active" : "Inactive"}
                          sx={{
                            backgroundColor: banner.status === 1 ? "#e8f5e9" : "rgba(255,0,0,0.1)", // light green or light yellow
                            color: banner.status === 1 ? "#1b5e20" : "red", // dark green or orange
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
                          sx={{ color: "black" }}
                          onClick={() => handleOpenEditBanner(banner)}
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
disableEnforceFocus          anchor="right"
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

export default ListBanners;