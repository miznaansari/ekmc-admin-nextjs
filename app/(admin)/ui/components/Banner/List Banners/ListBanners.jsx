import {
  TableContainer,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  useMediaQuery,
  Pagination
} from "@mui/material";

import TableSortLabel from "@mui/material/TableSortLabel";
import { MoreVertical24Filled } from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
import AddBanner from "./AddBanner";
import EditBanner from "./EditBanner";
import mapAdminAccess from "../../../mapAdminAccess.json";
import { useLocation } from "@/ui/utils/nextRouting";
import { formatUTCToLocal, FormattedDate } from "../../../utils/timeUtils";

dayjs.extend(utc);
dayjs.extend(duration);

const ListBanners = () => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const token = localStorage.getItem("authToken");
  const baseurl = process.env.VITE_REACT_APP_BACKEND_URL;

  const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalpages, setTotalPages] = useState(1);

  const [banners, setBanners] = useState([]);

const [sortBy, setSortBy] = useState("");
const [sortOrder, setSortOrder] = useState("asc");


const handleSort = (column) => {
  const isAsc = sortBy === column && sortOrder === "asc";
  setSortOrder(isAsc ? "desc" : "asc");
  setSortBy(column);
};


  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setDrawerContent(null);
  };

  const fetchListBanners = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${baseurl}/api/banner/main/v1/banners`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit, sort_order: sortOrder, sort_by: sortBy }
        }
      );

      setBanners(response.data?.data);
      setTotalPages(response.data?.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListBanners();
  }, [page, sortOrder, sortBy]);

  const handleOpenAddRoute = () => {
    setDrawerOpen(true);
    setDrawerContent(
      <AddBanner
        onCancel={handleDrawerClose}
        onSuccess={() => {
          handleDrawerClose();
          fetchListBanners();
          setAlert({ open: true, severity: "success", message: "Banner Added!!" });
        }}
      />
    );
  };

  const handleOpenEditBanner = (banner) => {
    setDrawerOpen(true);
    setDrawerContent(
      <EditBanner
        bannerId={banner.id}
        onSuccess={() => {
          handleDrawerClose();
          fetchListBanners();
          setAlert({ open: true, severity: "success", message: "Banner Updated!!" });
        }}
        onCancel={handleDrawerClose}
      />
    );
  };

  const handleStatusUpdate = async (banner) => {
    const updatedStatus = banner.status === 1 ? 0 : 1;

    try {
      const res = await axios.put(
        `${baseurl}/api/banner/main/v1/banner/${banner.id}`,
        { ...banner, status: updatedStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlert({
        open: true,
        severity: "success",
        message: "Status updated successfully",
      });

      fetchListBanners();
    } catch (error) {
      console.log(error.response.data.msg)
      setAlert({
        open: true,
        severity: "error",
        message: error.response.data.msg || "Failed to update status",
      });
    }
  };
  const [bannerRoutes, setBannerRoutes] = useState([]);

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


  // extract filename from URL
  const getFileName = (url) => {
    if (!url) return "";
    return url.split("/").pop();
  };

  const location = useLocation();
  const locationName = location.pathname;
  const pathName = mapAdminAccess.filter((access) => access.path === locationName);
  const basePermission = pathName?.[0]?.permission || "";
  const userRole = localStorage.getItem("userRole") || "";
  const writePermission = basePermission.replace(/-read$/, "-write");

  const accessMember = JSON.parse(localStorage.getItem("user_permission")) || [];
  const checkAccess = accessMember.filter(
    (access) => access?.permission_name === writePermission
  );

  const hasWriteAccess = checkAccess[0]?.status === 1;

  return (
    <Box paddingTop={3}>
      <Paper>
        <Grid container justifyContent="space-between" alignItems="center" p={2}>
          <Typography variant="h5" >Banners</Typography>

          {(userRole === "1" || hasWriteAccess) && (
            <Button variant="contained" onClick={handleOpenAddRoute}>
              ADD BANNER
            </Button>
          )}
        </Grid>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", height: "60vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: "65vh" }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ "& th": { p: 1} }}>
                  <TableCell>S.NO.</TableCell>
                  <TableCell>ID</TableCell>
                  <TableCell>TITLE</TableCell>
                  <TableCell>PATH</TableCell>
                  <TableCell>TYPE</TableCell>
                  <TableCell>URL</TableCell>

                <TableCell>
  <TableSortLabel
    active={sortBy === "views"}
    direction={sortBy === "views" ? sortOrder : "asc"}
    onClick={() => handleSort("views")}
  >
    VIEWS
  </TableSortLabel>
</TableCell>


               <TableCell>
  <TableSortLabel
    active={sortBy === "clicks"}
    direction={sortBy === "clicks" ? sortOrder : "asc"}
    onClick={() => handleSort("clicks")}
  >
    CLICKS
  </TableSortLabel>
</TableCell>


                  <TableCell>CREATED AT</TableCell>
                  <TableCell>EXPIRY DATE</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>ACTION</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {banners?.map((banner, index) => (
                  <TableRow key={banner.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{banner.id}</TableCell>
                    <TableCell>{banner.banner_title}</TableCell>
                    <TableCell>
                      {
                        bannerRoutes.find(route => route.value === banner.banner_route_id)?.label
                        || banner.banner_route_id
                      }
                    </TableCell>
                    <TableCell>{banner.is_image ? "Image" : "Video"}</TableCell>

                    {/* URL with hover preview */}
                    <TableCell>
                      <Tooltip
                        placement="right"
                        arrow
                        title={
                          banner.banner_url ? (
                            <img
                              src={banner.banner_url}
                              alt="preview"
                              style={{ maxWidth: 270, borderRadius: 6 }}
                            />
                          ) : ""
                        }
                      >
                        <span style={{ cursor: "pointer", color: "#1976d2" }}>
                          {banner.banner_url?.split("/").pop()}
                        </span>
                      </Tooltip>
                    </TableCell>


                    <TableCell>{banner.views}</TableCell>
                    <TableCell>{banner.clicks}</TableCell>
                    <TableCell sx={{ fontSize: "10px" }}>
                      <FormattedDate value={banner.created_at} />
                    </TableCell>

                    <TableCell sx={{ fontSize: "10px" }}>
                      <FormattedDate value={banner.banner_expiry} />
                    </TableCell>



                    <TableCell>
                      <Chip
                        label={banner.status === 1 ? "Active" : "Inactive"}
                        color={banner.status === 1 ? "primary" : "error"}
                        // variant="outlined"
                        size="small"

                        onClick={() => handleStatusUpdate(banner)}
                        sx={{ cursor: "pointer",p:0 }}
                      />

                    </TableCell>

                    <TableCell>
                      <IconButton onClick={() => handleOpenEditBanner(banner)}>
                        <MoreVertical24Filled />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/* PAGINATION */}
        <Box px={2} py={1} sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
          <Pagination
            count={totalpages}
            page={page}
            onChange={(event, value) => setPage(value)}
            shape="rounded"
            variant="outlined"
            size="medium"
          />
        </Box>
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
          autoHideDuration={3000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
        >
          <Alert severity={alert.severity}>{alert.message}</Alert>
        </Snackbar>

      </Paper>
    </Box>
  );
};

export default ListBanners;
