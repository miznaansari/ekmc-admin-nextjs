// created by Mohd Mizna Ansari
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/system';
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
import LockIcon from '@mui/icons-material/Lock';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate } from 'react-router-dom';

import {
    AddSquare24Regular,
    Checkmark20Regular,
    ClipboardTaskListLtr20Regular,
    Clock24Regular,
    ImageMultiple24Regular,
    Location24Regular,
    PersonInfo24Regular,
    QrCode24Filled,
} from '@fluentui/react-icons';

import FoodMenuIcon from '../assets/icon/FoodMenuIcon';

const MenuOnBoarding = ({ completedFields = [], action, setAction, menuData }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const currentPath = location.pathname.split('/').pop();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [menuOpen, setMenuOpen] = useState(!isSmallScreen);
    const [cafeListId, setCafeListId] = useState(localStorage.getItem('cafeListId'));

    // Listen for custom event when cafeListId changes
    useEffect(() => {
        const handleCafeListChange = () => {
            setCafeListId(localStorage.getItem('cafeListId'));
        };
        window.addEventListener('cafeListIdChanged', handleCafeListChange);

        return () => {
            window.removeEventListener('cafeListIdChanged', handleCafeListChange);
        };
    }, [action]);

    useEffect(() => {
        setCafeListId(localStorage.getItem('cafeListId'))
    }, [menuData])

    const menuItems = [
        { title: 'Basic Info', icon: <PersonInfo24Regular />, path: 'settings', key: 'settings' },
        { title: 'Opening Hours', icon: <Clock24Regular />, path: 'time-price', key: 'time-price' },
        { title: 'Address Info', icon: <Location24Regular />, path: 'address-info', key: 'address-info' },
        { title: 'Image Gallery', icon: <ImageMultiple24Regular />, path: 'imggallery', key: 'imggallery' },
        { title: 'Single Food Menu', icon: <AddSquare24Regular />, path: 'single-food-menu', key: 'single-food-menu' },
        { title: 'Food Menu Bulk', icon: <FoodMenuIcon />, path: 'food-menu-bulk', key: 'food-menu-bulk' },
        { title: 'Assign QR', icon: <QrCode24Filled />, path: 'assign-qr', key: 'assign-qr' },
        { title: 'Completion', icon: <Checkmark20Regular />, path: 'completion', key: 'completion' },
        { title: 'Survey', icon: <ClipboardTaskListLtr20Regular />, path: 'survey', key: 'survey' },
    ];

    const handleToggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const handleNavigate = (path, key) => {
        if (!cafeListId && key !== 'settings') return; // block navigation if locked
        navigate(`/onboarding/${path}`);
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
                        const isCompleted = completedFields?.includes(item.key);
                        const isLocked = !cafeListId && item.key !== 'settings';

                        return (
                            <ListItem key={item.title} disablePadding>
                                <ListItemButton
                                    onClick={() => handleNavigate(item.path, item.key)}
                                    selected={isActive}
                                    disabled={isLocked}
                                    sx={{
                                        bgcolor: isActive ? 'white' : 'transparent',
                                        '&.Mui-selected': { bgcolor: 'white !important' },
                                        '&.Mui-selected:hover': { bgcolor: 'white !important' },
                                        '&:hover': {
                                            bgcolor: isLocked ? 'transparent' : isActive ? 'white' : 'grey.100',
                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color: isCompleted
                                                ? 'success.main'
                                                : isActive
                                                    ? 'black'
                                                    : 'gray',
                                            '.Mui-selected &': {
                                                color: isCompleted ? 'success.main' : 'black',
                                            },
                                        }}
                                    >
                                        {isLocked ? <LockIcon fontSize="small" /> : React.cloneElement(item.icon)}
                                    </ListItemIcon>

                                    <ListItemText
                                        primary={
                                            <Typography
                                                sx={{
                                                    color: isCompleted
                                                        ? 'success.main'
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
