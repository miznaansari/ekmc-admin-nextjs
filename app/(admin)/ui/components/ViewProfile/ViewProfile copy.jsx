import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  IconButton,
  Divider,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LanguageIcon from "@mui/icons-material/Language";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import axios from "axios";
import Slider from "react-slick";
import { DrawerContext } from "../../context/DrawerContext";
import { useParams, useNavigate } from "react-router-dom";

const ViewProfile = ({ onClose }) => {
  const { cafeId } = useParams();
  const navigate = useNavigate();
  const { drawerOpenL } = useContext(DrawerContext);

  const [cafeData, setCafeData] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [weekdays, setWeekdays] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog states for employee details
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = (emp) => {
    setSelectedEmployee(emp);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
  };

  // Pagination states for employees table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedEmployees = employees.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, rolesRes] = await Promise.all([
          axios.get(
            `${baseUrl}/api/user/admin/restaurant/viewprofile/${cafeId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          ),
          axios.get(`${baseUrl}/api/admin/role/v1/public`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }).catch(() => ({ data: { all_roles: [] } }))
        ]);

        if (!profileRes?.data?.data?.[0]) {
          setError("No restaurant data found");
          return;
        }

        setCafeData(profileRes.data.data[0]);
        setGallery(Array.isArray(profileRes.data.gallery) ? profileRes.data.gallery : []);
        setWeekdays(Array.isArray(profileRes.data.activeWeekdays) ? profileRes.data.activeWeekdays : []);
        setEmployees(Array.isArray(profileRes.data.employees) ? profileRes.data.employees : []);

        const map = {};
        if (rolesRes?.data?.all_roles) {
          rolesRes.data.all_roles.forEach((r) => {
            map[r.id] = r.role_name;
          });
        }
        setRolesMap(map);

      } catch (err) {
        setError("Failed to load restaurant profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cafeId, baseUrl]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  /* =========================
     STATES
  ========================= */
  if (loading) {
    return (
      <Box sx={{ height: "80vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: "80vh", display: "grid", placeItems: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: drawerOpenL ? "80vw" : "100vw",
        p: { xs: 1, md: 1 },
        backgroundColor: "#f6f7fb",
        minHeight: "100vh",
      }}
    >
      {/* CLOSE */}
      {/* <IconButton
        onClick={() => (onClose ? onClose() : navigate("/list-restaurants"))}
        sx={{
          // position: "absolute",
          // top: 16,
          // left: 16,
          backgroundColor: "#fff",
          boxShadow: 1,
          zIndex: 10,
        }}
      >
        <CloseIcon />
      </IconButton> */}
      {/* HEADER */}
      <Grid container spacing={1}>
        {/* LEFT COLUMN */}
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          {/* ABOUT */}
          <Card sx={{ mb: 1, position: "relative" }}>
            <CardContent>
              {/* CLOSE BUTTON */}
              <IconButton
                onClick={() => (onClose ? onClose() : navigate("/list-restaurants"))}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                }}
              >
                <CloseIcon />
              </IconButton>

              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar
                  variant="rounded"
                  sx={{ width: 72, height: 72 }}
                  src="/placeholder-image.png"
                />
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {cafeData.cafe_name}
                  </Typography>
                  <Typography color="text.secondary">
                    {cafeData.cafe_slogan}
                  </Typography>

                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {cafeData.is_veg === 1 && (
                      <Chip label="Veg" color="success" size="small" />
                    )}
                    {cafeData.is_non_veg === 1 && (
                      <Chip label="Non-Veg" color="warning" size="small" />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {cafeData.cafe_about || "No description provided."}
              </Typography>
            </CardContent>
          </Card>

          {/* CONTACT */}
          <Card sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>

              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <EmailIcon fontSize="small" />
                  <Typography variant="body2">
                    {cafeData.cafe_email}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon fontSize="small" />
                  <Typography variant="body2">
                    {cafeData.cafe_mobile_number}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <LocationOnIcon fontSize="small" />
                  <Typography variant="body2">
                    {cafeData.address_1}, {cafeData.address_2}
                    <br />
                    {cafeData.city_name}, {cafeData.state_name},{" "}
                    {cafeData.country_name} - {cafeData.pin_code}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* SOCIAL */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Social Links
              </Typography>

              <Stack spacing={1}>
                {cafeData.website_url && (
                  <Button
                    startIcon={<LanguageIcon />}
                    href={cafeData.website_url}
                    target="_blank"
                  >
                    Website
                  </Button>
                )}
                {cafeData.social_facebook_url && (
                  <Button
                    startIcon={<FacebookIcon />}
                    href={cafeData.social_facebook_url}
                    target="_blank"
                  >
                    Facebook
                  </Button>
                )}
                {cafeData.social_instagram_url && (
                  <Button
                    startIcon={<InstagramIcon />}
                    href={cafeData.social_instagram_url}
                    target="_blank"
                  >
                    Instagram
                  </Button>
                )}
                {cafeData.social_twitter_url && (
                  <Button
                    startIcon={<TwitterIcon />}
                    href={cafeData.social_twitter_url}
                    target="_blank"
                  >
                    Twitter
                  </Button>
                )}
                {cafeData.social_linkedin_url && (
                  <Button
                    startIcon={<LinkedInIcon />}
                    href={cafeData.social_linkedin_url}
                    target="_blank"
                  >
                    LinkedIn
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid
          size={{
            xs: 12,
            md: 8
          }}>
          {/* GALLERY */}



          {/* EMPLOYEES */}
          <Card sx={{ mb: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employees
              </Typography>
              {employees.length > 0 ? (
                <>
                  <TableContainer sx={{ maxHeight: 300 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>S.No</TableCell>
                          <TableCell>Employee ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Mobile Number</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedEmployees.map((emp, index) => (
                          <TableRow key={emp.id}>
                            <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                            <TableCell>{emp.id}</TableCell>
                            <TableCell>{emp.first_name} {emp.last_name}</TableCell>
                            <TableCell>
                              <Chip
                                label={rolesMap[emp.user_role_id] || `Role ${emp.user_role_id}`}
                                size="small"
                                color={emp.user_role_id === 1 ? "primary" : emp.user_role_id === 2 ? "secondary" : "default"}
                              />
                            </TableCell>
                            <TableCell>
                              {emp.country_code ? `+${emp.country_code} ` : ""}{emp.mobile_number}
                            </TableCell>
                            <TableCell>
                              <Button size="small" variant="outlined" onClick={() => handleOpenDialog(emp)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={employees.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No employee details found.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* OPERATING HOURS */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Operating Hours
              </Typography>

              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Timings</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(weekdays) && weekdays.length > 0 ? (
                    weekdays.map((day) => (
                      <TableRow key={day?.weekday || Math.random()}>
                        <TableCell>{day?.weekday}</TableCell>
                        <TableCell>
                          {day?.is_holiday ? (
                            <Chip
                              label="Holiday"
                              color="error"
                              size="small"
                            />
                          ) : (
                            Array.isArray(day?.slots) ? day.slots.map((slot) => (
                              <Typography
                                key={slot.id}
                                variant="body2"
                              >
                                {slot.opening_time} – {slot.closing_time}
                              </Typography>
                            )) : "N/A"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          Operating hours not available.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card sx={{ mb: 3, mt: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gallery
              </Typography>

              {gallery.length ? (
                <Grid container spacing={2}>
                  {gallery.map((img) => (
                    <Grid
                      key={img.id}
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 4
                      }}>
                      <Box
                        component="img"
                        src={img.gallery_cf_original_image_url}
                        alt={img.cafe_image_name}
                        sx={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 2,
                          boxShadow: 1,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No images available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* EMPLOYEE "ADMIT CARD" DIALOG */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        {selectedEmployee && (
          <>
            <DialogTitle sx={{ textAlign: "center", bgcolor: "primary.main", color: "white", py: 2 }}>
              Employee Profile
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2, mt: 2 }}>
                <Avatar
                  sx={{ width: 90, height: 90, mb: 2, boxShadow: 2, bgcolor: "primary.light", fontSize: 36 }}
                >
                  {selectedEmployee.first_name?.[0] || ""}{selectedEmployee.last_name?.[0] || ""}
                </Avatar>
                <Typography variant="h5" fontWeight="700">
                  {selectedEmployee.first_name} {selectedEmployee.last_name}
                </Typography>
                <Chip
                  label={rolesMap[selectedEmployee.user_role_id] || `Role ${selectedEmployee.user_role_id}`}
                  size="small"
                  color="primary"
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Employee ID:</Typography>
                  <Typography variant="body2" fontWeight="600">{selectedEmployee.id}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                  <Typography variant="body2" fontWeight="600">
                    {selectedEmployee.country_code ? `+${selectedEmployee.country_code} ` : ""}{selectedEmployee.mobile_number}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body2" fontWeight="600">{selectedEmployee.email || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Typography variant="body2" fontWeight="600">
                    {selectedEmployee.status === 1 ? "Active" : "Inactive"}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} variant="contained" fullWidth>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ViewProfile;
