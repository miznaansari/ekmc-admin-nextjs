import React from "react";
import { Snackbar, Alert } from "@mui/material";

export default function GlobalSnackbar({ alert, setAlert }) {
  return (
    <Snackbar
      open={alert.open}
      autoHideDuration={3000}
      onClose={() => setAlert({ ...alert, open: false })}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={() => setAlert({ ...alert, open: false })}
        severity={alert.severity}
        sx={{ width: "100%" }}
      >
        {alert.message}
      </Alert>
    </Snackbar>
  );
}
