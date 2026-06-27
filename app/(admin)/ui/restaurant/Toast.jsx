/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Snackbar, Alert, useTheme, useMediaQuery } from "@mui/material";

export default function Toast({ err, type }) {
  const [open, setOpen] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  // Auto-close after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={6000}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      sx={{
        top: isMobile ? 8 : 24,
      }}
    >
      <Alert
        onClose={handleClose}
        severity={type} // error | success | info | warning
        variant="filled"
        sx={{
          width: "100%",
          alignItems: "center",
        }}
      >
        {err}
      </Alert>
    </Snackbar>
  );
}
