import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QrCodeIcon from '@mui/icons-material/QrCode';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MapIcon from '@mui/icons-material/Map';
import { Fade, Toolbar, useMediaQuery } from '@mui/material';
import Typography from '@mui/material/Typography';
import MuiAppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import { Grid, Stack } from "@mui/system";
import AssistantIcon from '@mui/icons-material/Assistant';
// Import the logo
import Logo from '../../../public/logo.png';
import Logout from '../Logout/Logout';
import { MenuSvg } from '../../assets/icon/menuSvg';
import { EatCollapse, Eats } from '../../assets/icon/Eats';
import { Switch } from '@mui/material';
import InsightIcon from '../../assets/icon/InsightIcon';
import ListResturantIcon from '../../assets/icon/ListResturantIcon';
import ListEmployeeIcon from '../../assets/icon/ListEmployeeIcon';
import ListCostumers from '../../assets/icon/ListCostumersIcons';
import EatShotIcon from '../../assets/icon/EatShotIcon';
import SettingsIcon from '../../assets/icon/SettingsIcon';
import CartIcon from '../../assets/icon/CartIcon';
import FoodMenuIcon from '../../assets/icon/FoodMenuIcon';
import RecommendationIcon from '../../assets/icon/RecommendationIcon';
import SubMenuIcon from '../../assets/icon/SubMenuIcon';
import { DataUsage24Regular } from '@fluentui/react-icons';
import { PeopleCommunity24Regular, PeopleCommunityRegular } from '@fluentui/react-icons';
import { Person24Regular } from '@fluentui/react-icons';
import { QrCode24Regular } from '@fluentui/react-icons';
import { StarEmphasis24Regular } from '@fluentui/react-icons';
import { Cart24Regular } from '@fluentui/react-icons';
import { Settings24Regular } from '@fluentui/react-icons';
import { Circle12Regular } from '@fluentui/react-icons';
import { ContentViewGallery24Regular } from '@fluentui/react-icons';
import { Food24Regular } from '@fluentui/react-icons';
import { version } from '../../../package.json'
import { RestaurantMenu } from '@mui/icons-material';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// const Drawer = styled(MuiDrawer, {
//   shouldForwardProp: (prop) => prop !== 'open',
// })(({ theme, open }) => ({
//   width: drawerWidth,
//   flexShrink: 0,
//   whiteSpace: 'nowrap',
//   boxSizing: 'border-box',
//   ...(open && {
//     ...openedMixin(theme),
//     '& .MuiDrawer-paper': openedMixin(theme),
//   }),
//   ...(!open && {
//     ...closedMixin(theme),
//     '& .MuiDrawer-paper': closedMixin(theme),
//   }),
// }));
const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MainNav({ open, setOpen }) {
  const theme = useTheme();
  const location = useLocation();

  console.log('open', open)
  //const [open, setOpen] = React.useState(false);
  const [foodMenuOpen, setFoodMenuOpen] = React.useState(false);
  const [qrManagementOpen, setQrManagementOpen] = React.useState(false);
  const [OrderOpen, setOrderOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [gamificationOpen, setGamificationOpen] = React.useState(false);
  const [bannersOpen, setbannersOpen] = React.useState(false);


  // Use useMediaQuery to determine if the screen size is small
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // Detect if the screen is small (e.g., max-width: 960px)

  const handleGamification = () => {
    setGamificationOpen(!gamificationOpen)
  }
  const handleFoodMenuToggle = () => {
    setFoodMenuOpen(!foodMenuOpen);
  };

  const handleQrManagementToggle = () => {
    setQrManagementOpen(!qrManagementOpen);
  };

  const handleOrderToggle = () => {
    setOrderOpen(!OrderOpen);
  };

  const handleBannersOpen = () => {
    setbannersOpen(!bannersOpen);

  }
  const isActive = (path) => location.pathname.startsWith(path);


  // Only render the Drawer on larger screens
  // if (isSmallScreen) {
  //   return null; // Don't show the Drawer on small screens
  // }
  const handleDrawer = () => {
    if (isSmallScreen) {
      setMobileOpen(!mobileOpen);  // Mobile
    } else {
      setOpen(!open);              // Desktop
    }
  };
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <>
      {/* <CssBaseline /> */}
      <MuiAppBar position='sticky' open={open} sx={{ top: '16px' }}>

        <Toolbar>
          <IconButton aria-label="open drawer" className="main-menu-svg" edge="start" onClick={handleDrawer}>
            <MenuSvg />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EatCollapse />
            <Eats />
          </Stack>
          <Box sx={{ marginLeft: "auto", display: "flex", gap: 2 }}>
            {/* <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }}>
              <Switch defaultChecked />
              <Typography variant="h6" noWrap>
                Notification
              </Typography>
            </Box> */}
            <Logout />
          </Box>
        </Toolbar>
      </MuiAppBar>

      <Fade in={mobileOpen && isSmallScreen} timeout={300}>
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1198,
          }}
        />
      </Fade>
      <Drawer
disableEnforceFocus        variant={isSmallScreen ? "persistent" : "persistent"}
        open={isSmallScreen ? mobileOpen : open}
        anchor='left'
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >

        {/* Drawer Header with Logo */}
        {/* <DrawerHeader>
          <img
            src={Logo}
            alt="Logo"
            style={{ maxWidth: '40px', marginRight: '25px', transition: 'max-width 0.3s ease' }}
            className={open ? 'logo-open' : 'logo-closed'}
          />
           <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>EKMC</Typography>
          <Typography variant="subtitle1" component="p" sx={{ color: theme.palette.primary.main }}>PLATFORM</Typography>
        </Box>
        </DrawerHeader> */}
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/AdminDashboard"
              selected={isActive(("/AdminDashboard"))}
            //sx={{ backgroundColor: isActive('/AdminDashboard') ? 'green' : 'transparent' }}
            //onClick={()=>setOpen(false)}
            >
              <ListItemIcon>
                <DataUsage24Regular />
              </ListItemIcon>
              <ListItemText primary="Insights" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/onboarding/settings"
              selected={isActive(("/onboarding"))}
            //sx={{ backgroundColor: isActive('/list-restaurants') ? theme.palette?.tertiary?.main : 'transparent' }}
            //onClick={()=>setOpen(false)}
            >
              <ListItemIcon>
                <RestaurantMenu />
              </ListItemIcon>
              <ListItemText primary="On Boarding" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/list-restaurants"
              selected={isActive(("/list-restaurants"))}
            //sx={{ backgroundColor: isActive('/list-restaurants') ? theme.palette?.tertiary?.main : 'transparent' }}
            //onClick={()=>setOpen(false)}
            >
              <ListItemIcon>
                <Food24Regular />
              </ListItemIcon>
              <ListItemText primary="List Restaurants" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/list-employees"
              selected={isActive(("/list-employees"))}
            //sx={{ backgroundColor: isActive('/list-employees') ? theme.palette?.tertiary?.main : 'transparent' }}
            //onClick={()=> setOpen(false)}
            >
              <ListItemIcon>
                <PeopleCommunity24Regular />
              </ListItemIcon>
              <ListItemText primary="List Employees" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/list-customers"
              selected={isActive(("/list-customers"))}
            //sx={{ backgroundColor: isActive('/list-customers') ? theme.palette?.tertiary?.main : 'transparent' }}
            //onClick={()=>setOpen(false)}
            >
              <ListItemIcon>
                <Person24Regular />
              </ListItemIcon>
              <ListItemText primary="List Customers" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/RecomendationPage"
              selected={isActive(("/RecomendationPage"))}
            //sx={{ backgroundColor: isActive('/AdminDashboard') ? 'green' : 'transparent' }}
            //onClick={()=>setOpen(false)}
            >
              <ListItemIcon>
                <StarEmphasis24Regular />
              </ListItemIcon>
              <ListItemText primary="Recommendation" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/EatshotPage"
              selected={isActive(("/EatshotPage"))}
            //sx={{ backgroundColor: isActive('/AdminDashboard') ? 'green' : 'transparent' }}
            //onClick={()=>setOpen(false)}
            >
              <ListItemIcon>
                <QrCode24Regular />
              </ListItemIcon>
              <ListItemText primary="Eatshot" />
            </ListItemButton>
          </ListItem>
          {/* Banners section */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleBannersOpen}>
              <ListItemIcon>
                <ContentViewGallery24Regular />
              </ListItemIcon>
              <ListItemText primary="Banners" />
              {bannersOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse in={bannersOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/listroutes" selected={isActive(("/listroutes"))} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Circle12Regular />
                </ListItemIcon>
                <ListItemText primary="List Routes" />
              </ListItemButton>
            </List>

            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/listconditions" selected={isActive(("/listconditions"))} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Circle12Regular />
                </ListItemIcon>
                <ListItemText primary="List Conditions" />
              </ListItemButton>
            </List>

            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/listplacements" selected={isActive(("/listplacements"))} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Circle12Regular />
                </ListItemIcon>
                <ListItemText primary="List Placement" />
              </ListItemButton>
            </List>

            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/listbanners" selected={isActive(("/listbanners"))} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Circle12Regular />
                </ListItemIcon>
                <ListItemText primary="List Banners" />
              </ListItemButton>
            </List>
          </Collapse>


          {/* Gamification section */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleGamification}>
              <ListItemIcon>
                <ContentViewGallery24Regular />
              </ListItemIcon>
              <ListItemText primary="Gamification" />
              {gamificationOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>

          <Collapse in={gamificationOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/Contribution" selected={isActive(("/Contribution"))} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Circle12Regular />
                </ListItemIcon>
                <ListItemText primary="Contributions" />
              </ListItemButton>
            </List>

            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/Milestones" selected={isActive(("/Milestones"))} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Circle12Regular />
                </ListItemIcon>
                <ListItemText primary="Milestones" />
              </ListItemButton>
            </List>

            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/Levels" selected={isActive(("/Levels"))} sx={{ pl: 4 }}>
                <ListItemIcon>
                  <Circle12Regular />
                </ListItemIcon>
                <ListItemText primary="Levels" />
              </ListItemButton>
            </List>
          </Collapse>


          {/* Food Menu Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleFoodMenuToggle}>
              <ListItemIcon>
                <ContentViewGallery24Regular />
              </ListItemIcon>
              <ListItemText primary="Food Menu" />
              {foodMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse in={foodMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/universal-category" selected={isActive(("/universal-category"))} sx={{ pl: 4 }}>
                <ListItemIcon><Circle12Regular /></ListItemIcon>
                <ListItemText primary="Universal Category" />

              </ListItemButton>
              <ListItemButton component={Link} to="/universal-item" selected={isActive(("/universal-item"))} sx={{ pl: 4 }}>
                <ListItemIcon><Circle12Regular /></ListItemIcon>
                <ListItemText primary="Universal Item" />

              </ListItemButton>
              <ListItemButton component={Link} to="/restaurant-menu" selected={isActive(("/restaurant-menu"))} sx={{ pl: 4 }}>
                <ListItemIcon><Circle12Regular /></ListItemIcon>
                <ListItemText primary="Restaurant Menu" />
              </ListItemButton>
              <ListItemButton component={Link} to="/restaurant-combos" selected={isActive(("/restaurant-combos"))} sx={{ pl: 4 }}>
                <ListItemIcon><Circle12Regular /></ListItemIcon>
                <ListItemText primary="Restaurant Combos" />
              </ListItemButton>
              <ListItemButton
                component={Link}
                to="/universal-recommendation"
                selected={isActive(("/universal-recommendation"))}
                sx={{
                  pl: 4,
                }}
              //onClick={()=>setOpen(false)}
              >
                <ListItemIcon><Circle12Regular /></ListItemIcon>
                <ListItemText primary="Explore Food" />
              </ListItemButton>
            </List>
          </Collapse>
          {/* QR Management Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleQrManagementToggle}>
              <ListItemIcon>
                <QrCode24Regular />
              </ListItemIcon>
              <ListItemText primary="QR Management" />
              {qrManagementOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse in={qrManagementOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/generate-qr" selected={isActive(("/generate-qr"))} sx={{ pl: 4 }} >
                <ListItemIcon><Circle12Regular /></ListItemIcon>
                <ListItemText primary="QR Management" />
              </ListItemButton>
              <ListItemButton component={Link} to="/table-management" selected={isActive(("/table-management"))} sx={{ pl: 4 }}>
                <ListItemIcon><Circle12Regular /></ListItemIcon>
                <ListItemText primary="Table Management" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Find Eateries Section */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/find-eateries"
              selected={isActive(("/find-eateries"))}
            //sx={{ backgroundColor: isActive('/find-eateries') ? 'green' : 'transparent' }}
            //onClick={()=>setOpen(false)}
            >
              <ListItemIcon>
                <Settings24Regular />
              </ListItemIcon>
              <ListItemText primary="Find Eateries" />
            </ListItemButton>
          </ListItem>

          {/* Live Orders Section */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleOrderToggle}>
              <ListItemIcon>
                <Cart24Regular />
              </ListItemIcon>
              <ListItemText primary="Live Orders" />
              {OrderOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          <Collapse in={OrderOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton component={Link} to="/live-orders" selected={isActive(("/live-orders"))} sx={{ pl: 4 }}>
                <ListItemIcon><Circle12Regular /></ListItemIcon>
                <ListItemText primary="Live Orders" />
              </ListItemButton>
              <ListItemButton component={Link} to="/order-history" selected={isActive(("/order-history"))} sx={{ pl: 4 }}>
                <ListItemIcon><Circle12Regular /></ListItemIcon>
                <ListItemText primary="Order History" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
        <Box sx={{ textAlign: "center", my: 2 }}>UI Version {version}</Box>
      </Drawer>
    </>
  );
}
