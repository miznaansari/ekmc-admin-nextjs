import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  AddSquare24Regular,
  ArrowLeft24Regular,
  Clock24Regular,
  DocumentAdd24Regular,
  ImageMultiple24Regular,
  Location24Regular,
  PeopleTeam24Regular,
  PersonInfo24Regular,
  PhoneMultiple24Regular,
} from "@fluentui/react-icons";
import useMediaQuery from "@mui/material/useMediaQuery";

const MergeRestaurant = ({ menu, setMenu }) => {

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [menuOpen, setMenuOpen] = useState(!isSmallScreen);

  useEffect(() => {
    setMenuOpen(!isSmallScreen);
  }, [isSmallScreen]);

  const menuItems = [
    { title: "General Info", icon: <PersonInfo24Regular />, path: "settings" },
    { title: "Time", icon: <Clock24Regular />, path: "time" },
    { title: "Address Info", icon: <Location24Regular />, path: "address-info" },
    { title: "Social Info", icon: <PeopleTeam24Regular />, path: "social-info" },
    { title: "Image Gallery", icon: <ImageMultiple24Regular />, path: "imggallery" },
  ];

  const handleToggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <Box sx={{ minWidth: isSmallScreen ? "100%" : "286px", position: 'sticky', top: 70, bgcolor: '#f7faf7', zIndex: 99 }}>
      {/* HEADER */}
      {isSmallScreen && (
        <ListItemButton onClick={handleToggleMenu}>
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="body2">Edit Restaurant Menu</Typography>
                {menuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
            }
          />
        </ListItemButton>
      )}

      {/* MENU */}
      <Collapse in={!isSmallScreen || menuOpen} timeout="auto" unmountOnExit>
        <List>
          {menuItems.map((item) => {
            const isActive = menu === item.path;

            return (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={() => {
                    setMenu(item.path);
                    if (isSmallScreen) setMenuOpen(false);
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? "primary.main" : "gray" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </Box>
  );
};

export default MergeRestaurant;
