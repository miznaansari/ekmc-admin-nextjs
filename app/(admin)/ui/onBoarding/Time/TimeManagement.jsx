// TimeManagement.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import instanceV1 from "../../restaurant/authaxios";
import TimePart1 from "./TimePart1"; // UI Part
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// 🔹 Convert UTC string (e.g. "05:30") to DayJS in IST
const fromUTCToIST = (utcTimeStr) =>
  dayjs.utc(utcTimeStr, "HH:mm").tz("Asia/Kolkata");

// 🔹 Convert DayJS to UTC string (for saving)
const toUTCString = (time) => time.utc().format("HH:mm:ss");

export default function TimeManagement({ datas,action,setAction }) {
  const token = localStorage.getItem("authToken");
  const api = instanceV1(token);

  const [schedule, setSchedule] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [errors, setErrors] = useState({}); // { "dayIndex-timeIndex": "error message" }

  // 🔸 Initialize from `datas`
  useEffect(() => {
    console.log('datas',datas)
    if (!datas?.schedules) return;

    const parsed = daysOfWeek.map((day) => {
      const dayData = datas.schedules.find((d) => d.weekday === day);

      if (!dayData) {
        return {
          day,
          holiday: false,
          times: [
            {
              open: dayjs().hour(11).minute(0),
              close: dayjs().hour(14).minute(0),
            },
          ],
        };
      }

      return {
        day,
        holiday: dayData.is_holiday === 1,
        times: dayData.slots.map((slot) => ({
          id: slot.id,
          open: fromUTCToIST(slot.opening_time),
          close: fromUTCToIST(slot.closing_time),
        })),
      };
    });

    setSchedule(parsed);
  }, [datas]);

  // 🔸 Validation
  const validateSchedule = () => {
    let valid = true;
    let newErrors = {};

    schedule.forEach((day, dayIndex) => {
      if (day.holiday) return;

      day.times.forEach((slot, timeIndex) => {
        if (!slot.open || !slot.close) {
          newErrors[`${dayIndex}-${timeIndex}`] =
            "Both opening and closing times are required!";
          valid = false;
        } else if (!slot.close.isAfter(slot.open)) {
          newErrors[`${dayIndex}-${timeIndex}`] =
            "Closing time cannot be earlier than opening time!";
          valid = false;
        }
      });
    });

    // setErrors(newErrors);
    return valid;
  };

  useEffect(() => {
    // setIsValid(validateSchedule());
  }, [schedule]);

  // 🔸 Handlers
const handleHolidayToggle = (dayIndex) =>
  setSchedule((prev) =>
    prev.map((d, i) => {
      if (i !== dayIndex) return d;

      const newHoliday = !d.holiday;

      return {
        ...d,
        holiday: newHoliday,
        times: newHoliday
          ? [] // remove slots if marked as holiday
          : d.times.length > 0
          ? d.times // keep existing slots
          : [
              // ensure at least one default slot
              { open: dayjs().hour(11).minute(0), close: dayjs().hour(14).minute(0) },
            ],
      };
    })
  );


  const handleTimeChange = (dayIndex, timeIndex, field, value) => {
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              times: d.times.map((t, j) =>
                j === timeIndex ? { ...t, [field]: value } : t
              ),
            }
          : d
      )
    );

    // Instant toast feedback
    const currentDay = schedule[dayIndex];
    const currentSlot = currentDay.times[timeIndex];
    const newSlot = { ...currentSlot, [field]: value };

    if (!newSlot.open || !newSlot.close) {
      setToastMessage("Both opening and closing times are required!");
      setToastOpen(true);
    } else if (!newSlot.close.isAfter(newSlot.open)) {
      // setToastMessage("Closing time cannot be earlier than opening time!");
      // setToastOpen(true);
    }
  };

  const handleAddSlot = (dayIndex) =>
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              times: [
                ...d.times,
                {
                  open: dayjs().hour(17),
                  close: dayjs().hour(21),
                },
              ],
            }
          : d
      )
    );

  const handleDeleteSlot = async (dayIndex, timeIndex) => {
    const slot = schedule[dayIndex].times[timeIndex];

    if (slot.id) {
      // Send DELETE request to API
      try {
        await api.delete(`/api/admin/onboard/v1/cafe/schedule/${slot.id}`);
        console.log(`Deleted slot with id ${slot.id}`);
      } catch (err) {
        console.error("Failed to delete slot from server", err);
        setToastMessage("Failed to delete slot from server.");
        setToastOpen(true);
        return;
      }
    }

    // Remove from state
    setSchedule((prev) =>
      prev.map((d, i) =>
        i === dayIndex
          ? {
              ...d,
              times:
                d.times.length > 1
                  ? d.times.filter((_, j) => j !== timeIndex)
                  : d.times,
            }
          : d
      )
    );
  };

  const handleCopyDayToAll = (sourceDayIndex) => {
    const sourceSlots = schedule[sourceDayIndex].times;
    setSchedule((prev) =>
      prev.map((d, i) => ({
        ...d,
        holiday: false,
        times: sourceSlots.map((s) => ({ ...s, id: undefined })),
      }))
    );
  };

  const preparePayload = (cafeListId) => ({
    cafe_list_id: cafeListId,
    schedules: schedule.map((day) => ({
      weekday: day.day,
      is_holiday: day.holiday ? 1 : 0,
      slots: day.times.map((slot) => ({
        opening_time: toUTCString(slot.open),
        closing_time: toUTCString(slot.close),
      })),
    })),
  });
        const navigate = useNavigate();

  const handleSave = async () => {
    // if (!validateSchedule()) {
    //   setToastMessage("Please fix the errors before saving.");
    //   setToastOpen(true);
    //   return;
    // }

    const cafeListId = localStorage.getItem("cafeListId");
    const payload = preparePayload(cafeListId);

    try {
      const res = await api.post(
        "/api/admin/onboard/v1/cafe/schedule",
        payload
      );
      console.log("Schedule saved:", res.data);
      setAction(()=>!action)
      // alert("Schedule saved successfully!");
            navigate("/onboarding/address-info");


    } catch (err) {
      console.error("Failed to save schedule:", err);
      alert("Failed to save schedule");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          width: "100%",
          // maxWidth: 960,
          // mx: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Time Management
        </Typography>

        <TimePart1
          schedule={schedule}
          errors={errors}
          handleHolidayToggle={handleHolidayToggle}
          handleCopyDayToAll={handleCopyDayToAll}
          handleTimeChange={handleTimeChange}
          handleAddSlot={handleAddSlot}
          handleDeleteSlot={handleDeleteSlot}
        />

        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isValid}
          >
            Save Schedule
          </Button>
        </Box>

        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setToastOpen(false)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {toastMessage || "Invalid schedule!"}
          </Alert>
        </Snackbar>
      </Paper>
    </LocalizationProvider>
  );
}
