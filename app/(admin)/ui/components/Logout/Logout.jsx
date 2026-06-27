import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useLocation } from '@/ui/utils/nextRouting';
import {
  Avatar, Menu, MenuItem, Typography, Box, Paper, IconButton, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Divider,
  Drawer, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import FoodMenuIcon from '@mui/icons-material/MenuBook';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MapIcon from '@mui/icons-material/Map';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Logo from '@/assets/logo.png'; // Import your logo
import instanceV1 from '../../restaurant/authaxios';
import { ArrowExit20Regular, ArrowExit24Regular, DoorArrowRight20Regular, Settings16Regular, SignOut24Regular } from '@fluentui/react-icons';
import { DrawerContext } from '../../context/DrawerContext';

export default function Logout() {
  const theme = useTheme();
    const context = useContext(DrawerContext)
    const {action, setAction} = context;
  const userRole = localStorage.getItem('userRole');


  const [roleMapping, setRoleMapping] = useState({});

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const instance = instanceV1(token);

        const res = await instance.get("/api/admin/role/v1/public");

        if (res?.data?.status && Array.isArray(res.data.all_roles)) {
          const map = res.data.all_roles.reduce((acc, role) => {
            acc[Number(role.id)] = role.role_name;
            return acc;
          }, {});

          setRoleMapping(map);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);


  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Check if screen size is mobile
  const imageDeliveryUrl = process.env.VITE_REACT_APP_IMAGE_DELIVERY_URL;
  const [drawerOpen, setDrawerOpen] = useState(false); // For controlling the Drawer
  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // For dropdown menu control
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    profile_pic_image_id: '',
  });
  const [foodMenuOpen, setFoodMenuOpen] = useState(false);
  const [qrManagementOpen, setQrManagementOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  // Fetch user data on component mount
  useEffect(()=>{
  console.log('action',action)

  },[action])
  useEffect(() => {
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const profilePicId = localStorage.getItem('profile_pic_image_id');
    // console.log("first name:", firstName)
    // console.log("lname:", lastName)
    // console.log("pf id:", profilePicId);
    setUserData({
      first_name: firstName || 'Admin',
      last_name: lastName || '',
      profile_pic_image_id: profilePicId || '/default-avatar.png',
    });
  }, [action]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    localStorage.removeItem('profile_pic_image_id');
    navigate('/login');
  };

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget); // Open dropdown
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null); // Close dropdown
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen); // Toggle Drawer open/close
  };

  const isActive = (path) => location.pathname === path;

  const drawerContent = (
    <Box sx={{ width: 260 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <img src={Logo.src || Logo} alt="Logo" style={{ maxWidth: '40px' }} />  <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>EKMC</Typography>
          <Typography variant="subtitle1" component="p" sx={{ color: theme.palette.primary.main }}>PLATFORM</Typography>
        </Box>
      </Box>

      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/AdminDashboard" sx={{ backgroundColor: isActive('/AdminDashboard') ? 'green' : 'transparent' }}>
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/list-restaurants" sx={{ backgroundColor: isActive('/list-restaurants') ? 'green' : 'transparent' }}>
            <ListItemIcon><RestaurantIcon /></ListItemIcon>
            <ListItemText primary="List Restaurants" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/list-employees" sx={{ backgroundColor: isActive('/list-employees') ? 'green' : 'transparent' }}>
            <ListItemIcon><PeopleIcon /></ListItemIcon>
            <ListItemText primary="List Employees" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/list-customers" sx={{ backgroundColor: isActive('/list-customers') ? 'green' : 'transparent' }}>
            <ListItemIcon><PersonIcon /></ListItemIcon>
            <ListItemText primary="List Customers" />
          </ListItemButton>
        </ListItem>

        {/* Collapsible Food Menu Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setFoodMenuOpen(!foodMenuOpen)}>
            <ListItemIcon><FoodMenuIcon /></ListItemIcon>
            <ListItemText primary="Food Menu" />
            {foodMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
        </ListItem>
        <Collapse in={foodMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} to="/universal-category" sx={{ pl: 4 }}>
              <ListItemText primary="Universal Category" />
            </ListItemButton>
            <ListItemButton component={Link} to="/universal-item" sx={{ pl: 4 }}>
              <ListItemText primary="Universal Item" />
            </ListItemButton>
            <ListItemButton component={Link} to="/restaurant-menu" sx={{ pl: 4 }}>
              <ListItemText primary="Restaurant Menu" />
            </ListItemButton>
            <ListItemButton component={Link} to="/restaurant-combos" sx={{ pl: 4 }}>
              <ListItemText primary="Restaurant Combos" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Collapsible QR Management Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setQrManagementOpen(!qrManagementOpen)}>
            <ListItemIcon><QrCodeIcon /></ListItemIcon>
            <ListItemText primary="QR Management" />
            {qrManagementOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
        </ListItem>
        <Collapse in={qrManagementOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} to="/generate-qr" sx={{ pl: 4 }}>
              <ListItemText primary="Generate QR" />
            </ListItemButton>
            <ListItemButton component={Link} to="/table-management" sx={{ pl: 4 }}>
              <ListItemText primary="Table Management" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Find Eateries Section */}
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/find-eateries" sx={{ backgroundColor: isActive('/find-eateries') ? 'green' : 'transparent' }}>
            <ListItemIcon><MapIcon /></ListItemIcon>
            <ListItemText primary="Find Eateries" />
          </ListItemButton>
        </ListItem>

        {/* Collapsible Live Orders Section */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => setOrderOpen(!orderOpen)}>
            <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
            <ListItemText primary="Live Orders" />
            {orderOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
        </ListItem>
        <Collapse in={orderOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} to="/live-orders" sx={{ pl: 4 }}>
              <ListItemText primary="Live Orders" />
            </ListItemButton>
            <ListItemButton component={Link} to="/order-history" sx={{ pl: 4 }}>
              <ListItemText primary="Order History" />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </Box>
  );

  return (
    <Paper elevation={0} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3%' }}>



      {/* Empty Box for spacing */}
      <Box />

      {/* Avatar and User Info aligned to the right */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', cursor: 'pointer', marginLeft: 'auto', width: '150px' }} onClick={handleMenuClick}>
        <Avatar
          src={userData.profile_pic_image_id ? `${userData.profile_pic_image_id}` : '/default-avatar.png'}
          alt={`${userData.first_name} ${userData.last_name}`}
          sx={{ width: 50, height: 50, marginRight: 1 }}
        />
        {/* <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Typography variant="body1" sx={{ marginRight: 1 }}>
            {userData.first_name}
          </Typography>
          <Typography variant="body1">
            {userData.last_name}
          </Typography>
        </Box> */}

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
          }}
        >
          <Typography
            fontSize="14px"
            sx={{
              mr: "5px",
              color: "#6e6b7b",
            }}
          >
            {userData.first_name}&nbsp;{userData.last_name}
          </Typography>

          <Typography
            fontSize={12}
            sx={{
              mr: "5px",
              color: "#6e6b7b",
            }}
          >
            {roleMapping[userRole] ?? ""}
          </Typography>
        </Box>

      </Box>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => {
          navigate('/accountSetting');
        }}>
          <Settings16Regular aria-label="Account Settings" style={{ marginRight: '10px' }} />

          Account Setting</MenuItem>
        <MenuItem onClick={handleLogout}>
          <ArrowExit20Regular aria-label="Logout" style={{ marginRight: '5px' }} />

          Logout</MenuItem>
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
disableEnforceFocus        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Improve performance on mobile
      >
        {drawerContent}
      </Drawer>
    </Paper>
  );
}
