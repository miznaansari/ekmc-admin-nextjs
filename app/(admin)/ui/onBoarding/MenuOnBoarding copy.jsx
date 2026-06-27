// created by Mohd Mizna Ansari
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Collapse,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { Box } from '@mui/system';
import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
    AddSquare24Regular,
    Checkmark20Regular,
    Clock24Regular,
    DocumentAdd24Regular,
    ImageMultiple24Regular,
    Location24Regular,
    PersonInfo24Regular,
    PhoneMultiple24Regular,
    QrCode24Filled,
} from '@fluentui/react-icons';
import useMediaQuery from '@mui/material/useMediaQuery';
import FoodMenuIcon from '../assets/icon/FoodMenuIcon';

const MenuOnBoarding = ({ completedFields = [] }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const currentPath = location.pathname.split('/').pop();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [menuOpen, setMenuOpen] = useState(!isSmallScreen); // Initially open on desktop

    const menuItems = [
        { title: 'Basic Info', icon: <PersonInfo24Regular />, path: 'settings', key: 'settings' },
        { title: 'Opening Hours', icon: <Clock24Regular />, path: 'time-price', key: 'time-price' },
        { title: 'Address Info', icon: <Location24Regular />, path: 'address-info', key: 'address-info' },
        { title: 'Image Gallery', icon: <ImageMultiple24Regular />, path: 'imggallery', key: 'imggallery' },
        { title: 'Single Food Menu', icon: <AddSquare24Regular />, path: 'single-food-menu', key: 'single-food-menu' },
        { title: 'Food Menu Bulk', icon: <FoodMenuIcon />, path: 'food-menu-bulk', key: 'food-menu-bulk' },
        { title: 'Assign QR', icon: <QrCode24Filled />, path: 'assign-qr', key: 'assign-qr' },
        { title: 'Completion', icon: <Checkmark20Regular />, path: 'completion', key: 'completion' },
    ];

    const handleToggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    return (
        <Box
            sx={{
                minWidth: { xs: '100%', sm: '100%', md: '286px' },
                p: 0,
                position: { xs: 'static', sm: 'static', md: 'sticky' },
                top: { md: '105px' },
            }}
        >
            {/* Header */}
            {isSmallScreen ? (
                <ListItemButton onClick={handleToggleMenu}>
                    <ListItemText
                        primary={
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Typography variant="body2">Restaurant Settings</Typography>
                                {menuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </Box>
                        }
                    />
                </ListItemButton>
            ) : (
                <Typography variant="h5" sx={{ my: 2 }}>
                    Restaurant Settings
                </Typography>
            )}

            {/* Menu list */}
            <Collapse in={!isSmallScreen || menuOpen} timeout="auto" unmountOnExit>
                <List>
                    {menuItems.map((item) => {
                        const isActive = item.key === currentPath;
                        const isCompleted = completedFields.includes(item.key);

                        return (
                            <ListItem key={item.title} disablePadding>
                                <ListItemButton
                                    onClick={() => navigate(`/onboarding/${item.path}`)}
                                    selected={isActive}
                                    sx={{
                                        bgcolor: isActive ? 'white' : 'transparent',
                                        '&.Mui-selected': {
                                            bgcolor: 'white !important',
                                        },
                                        '&.Mui-selected:hover': {
                                            bgcolor: 'white !important',
                                        },
                                        '&:hover': {
                                            bgcolor: isActive ? 'white' : 'grey.100',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color: isCompleted
                                                ? 'success.main' // ✅ completed always green
                                                : isActive
                                                    ? 'black'
                                                    : 'gray',
                                            '.Mui-selected &': {
                                                color: isCompleted ? 'success.main' : 'black', // ✅ enforce when selected
                                            },
                                        }}
                                    >
                                        {React.cloneElement(item.icon)}
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            <Typography
                                                sx={{
                                                    color: isCompleted
                                                        ? 'success.main' // ✅ completed always green
                                                        : isActive
                                                            ? 'black'
                                                            : 'text.primary',
                                                    fontWeight: isCompleted ? 600 : 400,
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Collapse>
        </Box>
    );
};

export default MenuOnBoarding;
