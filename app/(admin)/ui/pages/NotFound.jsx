// pages/NotFound.jsx
import React from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    Paper,
    Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
    ArrowEnterLeft24Regular,
    ErrorCircle24Regular,
    Home24Regular,
} from "@fluentui/react-icons";

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/dashboard/insights");
    };

    const handleGoLogin = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <Box minHeight="100vh" sx={{ backgroundColor: "#eef1f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Paper
                elevation={0}
                sx={{
                    p: 6,
                    maxWidth: 460,
                    width: "100%",
                    borderRadius: 4,
                    border: "1px solid #e0e3e7",
                    backgroundColor: "#ffffff",
                }}
            >
                {/* Icon */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                    <Box borderRadius="50%" bgcolor="#fdecea" sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64 }}>
                        <ErrorCircle24Regular
                            style={{ fontSize: 28, color: "#d32f2f" }}
                        />
                    </Box>
                </Box>

                {/* Title */}
                <Typography
                    variant="h4"
                    fontWeight={600}
                    align="center"
                    gutterBottom
                >
                    Page not found
                </Typography>

                {/* Subtitle */}
                <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                    mb={3}
                >
                    The page you are trying to access doesn’t exist or may have been moved.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {/* Actions */}
                <Stack spacing={1.5}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<Home24Regular />}
                        onClick={handleGoHome}
                    >
                        Back to Home
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        size="large"
                        color="inherit"
                        startIcon={<ArrowEnterLeft24Regular />}
                        onClick={handleGoLogin}
                        sx={{ opacity: 0.85 }}
                    >
                        Go to Login
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
};

export default NotFound;
