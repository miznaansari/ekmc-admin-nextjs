import React, { useState } from "react";
import { Box, TextField, Paper, Typography } from "@mui/material";
import NotificationSentHistoryTable from "./NotificationSentHistoryTable";

const NotificationSentHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Paper sx={{ p: 2, mt: 1 }}>
      {/* Search Box */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5">
          Notification Sent History
        </Typography>
        <TextField
          label="Notification Sent History"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {/* Table Component */}
      <NotificationSentHistoryTable searchTerm={searchTerm} />
    </Paper>
  );
};

export default NotificationSentHistory;
