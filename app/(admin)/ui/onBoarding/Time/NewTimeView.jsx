// NewTimeView.jsx
import React, { useState, useRef } from "react";
import {
  Drawer,
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import instanceV1 from "../../restaurant/authaxios";

// Utility: convert IST "HH:mm" string → UTC "HH:mm"
const convertISTtoUTC = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hours - 5, minutes - 30, 0, 0); // IST → UTC
  return date.toISOString().substr(11, 5); // "HH:mm"
};

// Utility: convert UTC "HH:mm" → IST "hh:mm AM/PM"
const convertUTCtoIST = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setUTCHours(hours, minutes, 0, 0);
  const istHours = date.getHours();
  const istMinutes = date.getMinutes();
  const ampm = istHours >= 12 ? "PM" : "AM";
  const h = istHours % 12 === 0 ? 12 : istHours % 12;
  return `${h.toString().padStart(2, "0")}:${istMinutes
    .toString()
    .padStart(2, "0")} ${ampm}`;
};

// Default week slots (user enters IST)
const defaultWeekSlots = [
  { day: "Sunday", holiday: false, times: [{ opening_time: "11:00", closing_time: "14:00" }] },
  { day: "Monday", holiday: false, times: [{ opening_time: "11:00", closing_time: "14:00" }] },
  { day: "Tuesday", holiday: false, times: [{ opening_time: "11:00", closing_time: "14:00" }] },
  { day: "Wednesday", holiday: false, times: [{ opening_time: "11:00", closing_time: "14:00" }] },
  { day: "Thursday", holiday: false, times: [{ opening_time: "11:00", closing_time: "14:00" }] },
  { day: "Friday", holiday: false, times: [{ opening_time: "11:00", closing_time: "14:00" }] },
  { day: "Saturday", holiday: false, times: [{ opening_time: "11:00", closing_time: "14:00" }] },
];

export default function NewTimeView({ viewTimeViewDrawer, setViewTimeViewDrawer }) {
  const [weekSlots, setWeekSlots] = useState(defaultWeekSlots);
  const token = localStorage.getItem("authToken");
  const api = instanceV1(token);

  const toggleDrawer = (newOpen) => () => setViewTimeViewDrawer(newOpen);

  // Add new slot
  const handleAddSlot = (dayIndex) => {
    const updated = [...weekSlots];
    updated[dayIndex].times.push({ opening_time: "09:00", closing_time: "18:00" });
    setWeekSlots(updated);
  };

  // Delete slot
  const handleDeleteSlot = (dayIndex, slotIndex) => {
    const updated = [...weekSlots];
    updated[dayIndex].times.splice(slotIndex, 1);
    setWeekSlots(updated);
  };

  // Update time input
  const handleTimeChange = (dayIndex, slotIndex, field, value) => {
    const updated = [...weekSlots];
    updated[dayIndex].times[slotIndex][field] = value;
    setWeekSlots(updated);
  };

  // Toggle holiday
  const handleToggleHoliday = (dayIndex) => {
    const updated = [...weekSlots];
    updated[dayIndex].holiday = !updated[dayIndex].holiday;
    setWeekSlots(updated);
  };

  // Prepare payload for API
  const prepareSchedulePayload = () => {
    return weekSlots.map((daySlot) => ({
      weekday: daySlot.day,
      is_holiday: daySlot.holiday ? 1 : 0,
      slots: daySlot.times.map((slot) => ({
        opening_time: convertISTtoUTC(slot.opening_time),
        closing_time: convertISTtoUTC(slot.closing_time),
      })),
    }));
  };

  const handleSave = async () => {
    const payload = {
      cafe_list_id: "1",
      schedules: prepareSchedulePayload(),
    };

    try {
      const res = await api.post("/api/admin/onboard/v1/cafe/schedule", payload);
      console.log("Schedule saved:", res.data);
    } catch (err) {
      console.error("Failed to save schedule:", err);
    }
  };

  return (
    <Drawer
disableEnforceFocus      anchor="bottom"
      open={viewTimeViewDrawer}
      onClose={toggleDrawer(false)}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          m: 0,
          width: "100%",
          height: "450px",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p: 1 }}>
        {/* Grip */}
        <Box
          sx={{
            width: 60,
            height: 4,
            backgroundColor: "#DCDCDC",
            borderRadius: 2,
            mx: "auto",
            my: 1,
            cursor: "grab",
          }}
        />

        <Typography variant="h5" fontWeight={600} sx={{ px: 1 }}>
          Operating Hours
        </Typography>

        <Box sx={{ overflowY: "auto", flexGrow: 1, mt: 1 }}>
          {weekSlots.map((daySlot, dayIndex) => (
            <Paper key={daySlot.day} sx={{ mb: 1, p: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontWeight={500}>{daySlot.day}</Typography>
                <Button size="small" color={daySlot.holiday ? "error" : "primary"} onClick={() => handleToggleHoliday(dayIndex)}>
                  {daySlot.holiday ? "Holiday" : "Active"}
                </Button>
              </Box>

              {!daySlot.holiday &&
                daySlot.times.map((slot, slotIndex) => (
                  <Box key={slotIndex} sx={{ display: "flex", alignItems: "center", mt: 1, gap: 1 }}>
                    <TextField
                      label="Open (HH:mm)"
                      type="time"
                      value={slot.opening_time}
                      onChange={(e) => handleTimeChange(dayIndex, slotIndex, "opening_time", e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Close (HH:mm)"
                      type="time"
                      value={slot.closing_time}
                      onChange={(e) => handleTimeChange(dayIndex, slotIndex, "closing_time", e.target.value)}
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                    <IconButton color="error" onClick={() => handleDeleteSlot(dayIndex, slotIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}

              {!daySlot.holiday && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddSlot(dayIndex)}
                  sx={{ mt: 1 }}
                >
                  Add Slot
                </Button>
              )}
            </Paper>
          ))}
        </Box>

        <Button variant="contained" color="primary" onClick={handleSave} sx={{ mt: 1 }}>
          Save Schedule
        </Button>
      </Box>
    </Drawer>
  );
}
