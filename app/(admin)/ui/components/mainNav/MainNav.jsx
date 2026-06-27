import * as React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Toolbar,
  Fade,
  useMediaQuery,
  Stack,
  Drawer,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import { Link, useLocation } from "@/ui/utils/nextRouting";
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  GroupWorkOutlined,
} from "@mui/icons-material";
import mapAdminAccess from "../../mapAdminAccess.json";
// Icons
import {
  DataUsage24Regular,
  Food24Regular,
  PeopleCommunity24Regular,
  Person24Regular,
  StarEmphasis24Regular,
  QrCode24Regular,
  Cart24Regular,
  Settings24Regular,
  Circle12Regular,
  ContentViewGallery24Regular,
  People24Regular,
  Sparkle20Regular,
  Sparkle28Regular,
  Sparkle24Regular,
  ArrowClockwise24Regular,
} from "@fluentui/react-icons";

import { RestaurantMenu } from "@mui/icons-material";
import pkg from "../../../../../package.json";
const { version } = pkg;
import { MenuSvg } from "@/assets/icon/menuSvg";
import { EatCollapse, Eats } from "@/assets/icon/Eats";
import Logout from "../Logout/Logout";




// ---------------- CONFIG -----------------
const menuItems = [
  { label: "Insights", path: "/dashboard/insights", icon: <DataUsage24Regular /> },

  {
    label: "Eatry Management",
    icon: <Food24Regular />,
    children: [
      { label: "Onboard New Eatery", path: "/onboarding" },
      { label: "List Eatery", path: "/list-restaurants" },
      { label: "List Employees", path: "/users/employees" },
    ],
  },

  { label: "List Customers", path: "/users/customers", icon: <Person24Regular /> },

  { label: "Recommendation", path: "/recommendations", icon: <StarEmphasis24Regular /> },
  { label: "Eatshot", path: "/eatshot", icon: <QrCode24Regular /> },
  { label: "AI  Generation", path: "/ai-image-gen", icon: <Sparkle24Regular /> },

  {
    label: "Data Moderator",
    icon: <ContentViewGallery24Regular />,
    children: [
      { label: "Cafe Gallery", path: "/restaurants/gallery" },
      { label: "Instagram", path: "/integrations/instagram" },
    ],
  },

  {
    label: "Team Member",
    icon: <People24Regular />,
    children: [
      { label: "Team", path: "/team" },
      { label: "Team Role", path: "/team/roles" },
    ],
  },

  {
    label: "Marketing",
    icon: <ContentViewGallery24Regular />,
    children: [
      { label: "List Routes", path: "/system/routes" },
      { label: "List Conditions", path: "/system/conditions" },
      { label: "List Banner Placement", path: "/banners/placements" },
      { label: "List Banners", path: "/banners" },
      { label: "Notification Campaigns", path: "/notifications/campaign" },
      { label: "Notification Template", path: "/notifications/templates" },
      { label: "Notification History", path: "/notifications/history" },
    ],
  },

  {
    label: "Gamification",
    icon: <ContentViewGallery24Regular />,
    children: [
      { label: "Contributions", path: "/gamification/contributions" },
      { label: "Milestones", path: "/gamification/milestones" },
      { label: "Levels", path: "/gamification/levels" },
    ],
  },

  {
    label: "Food Menu",
    icon: <ContentViewGallery24Regular />,
    children: [
      { label: "Universal Category", path: "/catalog/categories" },
      { label: "Universal Item", path: "/catalog/items" },
      { label: "Restaurant Menu", path: "/restaurants/menu" },
      { label: "Restaurant Combos", path: "/restaurants/combos" },
      { label: "Explore Food", path: "/catalog/explore" },
    ],
  },

  {
    label: "QR Management",
    icon: <QrCode24Regular />,
    children: [
      { label: "QR Management", path: "/qr/management" },
      { label: "Table Management", path: "/restaurants/tables" },
    ],
  },

  // { label: "Find Eateries", path: "/restaurants/find", icon: <Settings24Regular /> },

  {
    label: "Live Orders",
    icon: <Cart24Regular />,
    children: [
      { label: "Live Orders", path: "/orders/live" },
      { label: "Order History", path: "/orders/history" },
    ],
  },
  { label: "Released Log", path: "/released-log", icon: <ArrowClockwise24Regular /> },

];

// ---------------- END CONFIG -----------------

export default function MainNav({ open, setOpen }) {
  const theme = useTheme();
  const location = useLocation();
  const [expanded, setExpanded] = React.useState({});
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const userRole = Number(localStorage.getItem("userRole"));

  let showError = false;

  const storedPermissions =
    JSON.parse(localStorage.getItem("user_permission")) || [];

  const defaultPermission = {
    permission_id: null,
    permission_name: "ai_image_generation-read",
    status: 1,
  };

  // 👉 merge while fetching
  const actualPermissions = [
    ...storedPermissions,
    ...(
      storedPermissions.some(
        (p) => p.permission_name === defaultPermission.permission_name
      )
        ? []
        : [defaultPermission]
    ),
  ];

  /* =========================
     SUPER ADMIN → ALL ACCESS
     ========================= */
  let filteredMenu;

  if (userRole === 1) {
    filteredMenu = menuItems; // 🔥 full menu
  } else {
    // step 1: allowed permission set
    const allowedPermissionSet = new Set(
      actualPermissions
        .filter(p => p.status === 1)
        .map(p => p.permission_name)
    );

    // step 2: allowed routes from master map
    const allowedRoutes = mapAdminAccess
      .filter(item => allowedPermissionSet.has(item.permission))
      .map(item => item.path);

    const allowedRouteSet = new Set(allowedRoutes);

    // step 3: dynamic menu filtering
    filteredMenu = menuItems
      .map(menu => {
        // menu without children
        if (!menu.children) {
          return allowedRouteSet.has(menu.path) ? menu : null;
        }

        // menu with children
        const allowedChildren = menu.children.filter(child =>
          allowedRouteSet.has(child.path)
        );

        if (allowedChildren.length === 0) return null;

        return {
          ...menu,
          children: allowedChildren,
        };
      })
      .filter(Boolean);

    if (filteredMenu.length === 0) {
      showError = true;
    }
  }


  // Special case: On Boarding should be active if URL contains "onboard"
  const isActive = (path, isParent = false) => {
    const currentPath = location.pathname.toLowerCase();
    const targetPath = path.toLowerCase();

    // Parent menu: only active if exact match
    if (isParent) {
      return currentPath === targetPath;
    }

    // Child menu: exact match OR deeper route
    return (
      currentPath === targetPath ||
      currentPath.startsWith(targetPath + "/")
    );
  };

  // Automatically expand parent if a child is active
  React.useEffect(() => {
    const newExpanded = {};
    filteredMenu.forEach((item) => {
      if (item.children && item.children.some((child) => isActive(child.path, item.label))) {
        newExpanded[item.label] = true;
      }
    });
    setExpanded(newExpanded);
  }, [location.pathname, userRole]);

  const handleDrawer = () => {
    console.log('object')
    localStorage.setItem('drawerOpen', JSON.stringify(!open));
    // if (isSmallScreen) setMobileOpen(!mobileOpen);

    setOpen(!open);
  };

  const toggleExpand = (label) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };
  React.useEffect(() => {
    console.log('opem', open)
  }, [open])


  const isMobileScreen = useMediaQuery(theme.breakpoints.up("md"));
  return (
    <>
      <MuiAppBar position="static" open={open}>
        <Toolbar  >
          <IconButton aria-label="open drawer" edge="start" onClick={handleDrawer}>
            <MenuSvg />
          </IconButton>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
            <EatCollapse />
            <Eats />
          </Box>
          <Box sx={{ marginLeft: "auto" }}>
            <Logout />
          </Box>
        </Toolbar>
      </MuiAppBar>

      <Fade in={open && !isMobileScreen} timeout={300}>
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1198,
          }}
        />
      </Fade>

      <Drawer
        variant="persistent"
        open={open}
        anchor="left"
        sx={{
          width: 255,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 260,
            boxSizing: "border-box",
            height: "100%",
          },
        }}
      >
        {showError ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            Your role id does not match our permissions
          </Box>
        ) : (
          <List>
            {filteredMenu.map((item) =>
              item.children ? (
                <React.Fragment key={item.label}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => toggleExpand(item.label)}>
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.label} />
                      {expanded[item.label] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ListItemButton>
                  </ListItem>
                  <Collapse in={expanded[item.label]} timeout="auto" unmountOnExit>
                    {item.children.map((child) => (
                      <ListItemButton
                        key={child.label}
                        component={Link}
                        to={child.path}
                        selected={isActive(child.path, item.label)}
                        sx={{ pl: 3 }}
                      >
                        <ListItemIcon sx={{ minWidth: 20, p: 0, m: 0 }}>
                          <Circle12Regular fontSize={10} />
                        </ListItemIcon>

                        <ListItemText
                          primary={child.label}
                          primaryTypographyProps={{ fontSize: "14px" }}
                        />

                      </ListItemButton>
                    ))}
                  </Collapse>
                </React.Fragment>
              ) : (
                <ListItem disablePadding key={item.label}>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    selected={isActive(item.path, item.label)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              )
            )}
          </List>
        )}

        <Box sx={{ textAlign: "center", my: 2, pb: 10 }}>
          UI Version {version}
        </Box>
      </Drawer>
    </>
  );
}
