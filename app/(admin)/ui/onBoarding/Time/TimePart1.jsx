// TimePart1.jsx
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Checkbox,
  Tooltip,
  Divider,
} from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import SlotRow from "./TimePart2";

const TimePart1 = ({
  schedule,
  errors,
  handleHolidayToggle,
  handleCopyDayToAll,
  handleTimeChange,
  handleAddSlot,
  handleDeleteSlot,
}) => {
  return (
    <>
      {schedule.map((dayData, dayIndex) => (
        <Box key={dayData.day} sx={{ mb: 2,width:'100%' }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {dayData.day}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Tooltip title="Copy this day's slots to all days">
                <IconButton onClick={() => handleCopyDayToAll(dayIndex)}>
                  <ContentCopy />
                </IconButton>
              </Tooltip>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  checked={dayData.holiday}
                  onChange={() => handleHolidayToggle(dayIndex)}
                />
                <Typography variant="body2">Holiday</Typography>
              </Box>
            </Box>
          </Box>

          {!dayData.holiday &&
            dayData.times.map((slot, timeIndex) => {
              const errorMessage = errors[`${dayIndex}-${timeIndex}`] || null;
              return (
                <SlotRow
                  key={timeIndex}
                  slot={slot}
                  timeIndex={timeIndex}
                  dayIndex={dayIndex}
                  onChange={handleTimeChange}
                  onAdd={handleAddSlot}
                  onDelete={handleDeleteSlot}
                  errorMessage={errorMessage}
                />
              );
            })}

          <Divider />
        </Box>
      ))}
    </>
  );
};

export default TimePart1;
