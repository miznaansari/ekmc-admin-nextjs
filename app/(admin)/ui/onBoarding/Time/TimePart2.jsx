// TimePart2.jsx
import React from "react";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Alert,
  Tooltip,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { TimePicker } from "@mui/x-date-pickers";

const SlotRow = ({
  slot,
  timeIndex,
  dayIndex,
  onChange,
  onAdd,
  onDelete,
  errorMessage,
}) => {
  return (
    <Box
      sx={{
        mb: 2,
        border: errorMessage ? "1px solid red" : "1px solid transparent",
        borderRadius: 1,
        p: 1,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid
          size={{
            xs: 12,
            sm: 5
          }}>
          <TimePicker
            label="Opening Time"
            value={slot.open}
            onChange={(newValue) =>
              onChange(dayIndex, timeIndex, "open", newValue)
            }
            renderInput={(params) => (
              <TextField {...params} fullWidth error={!!errorMessage} />
            )}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 5
          }}>
          <TimePicker
            label="Closing Time"
            value={slot.close}
            onChange={(newValue) =>
              onChange(dayIndex, timeIndex, "close", newValue)
            }
            renderInput={(params) => (
              <TextField {...params} fullWidth error={!!errorMessage} />
            )}
          />
        </Grid>

        <Grid
          sx={{ display: "flex", gap: 1 }}
          size={{
            xs: 12,
            sm: 2
          }}>
          {timeIndex === 0 ? (
            <Tooltip title="Add slot">
              <IconButton onClick={() => onAdd(dayIndex)}>
                <Add />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Remove slot">
              <IconButton onClick={() => onDelete(dayIndex, timeIndex)}>
                <Delete />
              </IconButton>
            </Tooltip>
          )}
        </Grid>
      </Grid>
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
};

export default SlotRow;
