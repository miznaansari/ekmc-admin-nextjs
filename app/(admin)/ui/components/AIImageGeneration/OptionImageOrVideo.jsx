import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Close } from "@mui/icons-material";

import AddEditAIImageGeneration from "./AddEditAIImageGeneration";
import AddEditAIVideoGeneration from "./AddEditAIVideoGeneration";

const OptionImageOrVideo = ({
  open,
  onClose,
  setAlert,
  action,
  setAction,
}) => {
  const [type, setType] = useState("image"); // default = image

  return (
    <Drawer
disableEnforceFocus      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 800 },
          p: 1,
          height: "100vh",
          bgcolor: "#F7F7F7",
          m: 0,
        },
      }}
    >
      {/* Header */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          position: "sticky",
          top: 0,
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography fontWeight={600}>
          AI Generator
        </Typography>
        <Button onClick={onClose}>
          <Close />
        </Button>
      </Paper>

      {/* ================= Radio Selection ================= */}
      <Box sx={{ px: 2, mb: 2 }}>
        <RadioGroup
          row
        size="small"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <FormControlLabel
            value="image"
            control={<Radio size="small" />}
            label="Image"
          />
          <FormControlLabel
            value="video"
            control={<Radio size="small" />}
            label="Video"
          />
        </RadioGroup>
      </Box>

      {/* ================= Conditional Render ================= */}
      {type === "image" ? (
        <AddEditAIImageGeneration
          open={open}
          onClose={() => onClose(false)}
          setAlert={setAlert}
          action={action}
          setAction={setAction}
        />
      ) : (
        <AddEditAIVideoGeneration
          open={open}
          onClose={() => onClose(false)}
          setAlert={setAlert}
          action={action}
          setAction={setAction}
        />
      )}
    </Drawer>
  );
};

export default OptionImageOrVideo;