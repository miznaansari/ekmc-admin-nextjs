import {
  Alert,
  Button,
  Chip,
  Checkbox,
  Collapse,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import NewTimeManagement from "./Time/NewTimeManagement";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TimeSetting = ({ cafeId, transferTargetCafeId = null, timeTransferSignal = 0, onTransferSuccess = null, onSave = null }) => {
  const { control, handleSubmit, setValue, reset, getValues, watch } = useForm({
    defaultValues: {
      monday_opening_time: "",
      monday_closing_time: "",
      tuesday_opening_time: "",
      tuesday_closing_time: "",
      wednesday_opening_time: "",
      wednesday_closing_time: "",
      thursday_opening_time: "",
      thursday_closing_time: "",
      friday_opening_time: "",
      friday_closing_time: "",
      saturday_opening_time: "",
      saturday_closing_time: "",
      sunday_opening_time: "",
      sunday_closing_time: "",
    },
  });

  const [alert, setAlert] = useState({ open: false, severity: 'info', message: '' });
  const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  const token = localStorage.getItem("authToken");
  const [holidayDays, setHolidayDays] = useState({});
  const [isFormModified, setIsFormModified] = useState(false);
  const originalFormData = useRef(null);
  const [originalHolidays, setOriginalHolidays] = useState({});
  const [priceRange, setPriceRange] = useState(null);
  const [originalPriceRange, setOriginalPriceRange] = useState(null);
  const [isPriceRangeModified, setIsPriceRangeModified] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferState, setTransferState] = useState({ done: false, targetCafeId: null });
  const [timeRefreshKey, setTimeRefreshKey] = useState(0);

  // Watch all form values for changes
  const watchedValues = watch();

  // Check if form data changed
  useEffect(() => {
    if (originalFormData.current) {
      const currentValues = getValues();
      const originalValues = originalFormData.current;

      // Deep comparison of form values
      const isFormValueChanged = JSON.stringify(currentValues) !== JSON.stringify(originalValues);
      const isHolidaysChanged = JSON.stringify(holidayDays) !== JSON.stringify(originalHolidays);

      setIsFormModified(isFormValueChanged || isHolidaysChanged);
    }
  }, [watchedValues, holidayDays]); // Watch watchedValues instead of isDirty

  // Check if price range changed
  useEffect(() => {
    if (originalPriceRange !== null) {
      setIsPriceRangeModified(priceRange !== originalPriceRange);
    }
  }, [priceRange, originalPriceRange]);

  // Convert UTC time to IST for display
  const convertUTCToIST = (utcTime) => {
    if (!utcTime || utcTime.trim() === "") return "";

    try {
      // Create a date object with UTC time
      const [hours, minutes, seconds = "00"] = utcTime.split(":");
      const utcDate = new Date();
      utcDate.setUTCHours(parseInt(hours, 10));
      utcDate.setUTCMinutes(parseInt(minutes, 10));
      utcDate.setUTCSeconds(parseInt(seconds, 10));

      // Convert to IST (UTC+5:30)
      const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));

      // Format as HH:MM
      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(istDate.getUTCHours())}:${pad(istDate.getUTCMinutes())}`;
    } catch (error) {
      console.error("Error converting UTC to IST:", error);
      return utcTime.substring(0, 5); // Fallback to original time
    }
  };

  const convertToTimeInfo = (data) => {
    const result = {};
    const holidays = {};

    // Create a map of existing data by day
    const dataMap = {};
    data.forEach((item) => {
      const day = item.weekday?.toLowerCase();
      if (day) {
        dataMap[day] = item;
      }
    });

    // Process all days, using defaults if data is missing
    days.forEach((day) => {
      const lowerDay = day.toLowerCase();
      const dayData = dataMap[lowerDay];

      if (dayData) {
        // Prefer slots[] shape, fallback to flat fields.
        const firstSlot = Array.isArray(dayData.slots) && dayData.slots.length > 0
          ? dayData.slots[0]
          : null;

        const openingSource = firstSlot?.opening_time || dayData.opening_time;
        const closingSource = firstSlot?.closing_time || dayData.closing_time;

        // Convert UTC times to IST for display
        const openingTime = openingSource && String(openingSource).trim() !== ""
          ? convertUTCToIST(openingSource)
          : "22:00";
        const closingTime = closingSource && String(closingSource).trim() !== ""
          ? convertUTCToIST(closingSource)
          : "04:00";

        result[`${lowerDay}_opening_time`] = openingTime;
        result[`${lowerDay}_closing_time`] = closingTime;
        holidays[lowerDay] = dayData.holiday === 1;
      } else {
        // Use default times (10 PM to 4 AM) when no data exists for the day
        result[`${lowerDay}_opening_time`] = "22:00";
        result[`${lowerDay}_closing_time`] = "04:00";
        holidays[lowerDay] = false;
      }
    });

    setHolidayDays({ ...holidays });
    setOriginalHolidays({ ...holidays });
    return result;
  };
  const [schduleData, setSchduleData] = useState()

  const fetchWeekendTimes = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${cafeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("res= ", response);
      const data = response.data.activeWeekdays || [];
      setSchduleData(data)
      const timeInfo = convertToTimeInfo(data);

      // Reset form with fetched data
      reset(timeInfo);

      // Store original values for comparison
      originalFormData.current = JSON.parse(JSON.stringify(timeInfo));

      // Set price range
      const fetchedPriceRange = response.data.data?.[0]?.cafe_price_range || 0;
      setPriceRange(fetchedPriceRange);
      setOriginalPriceRange(fetchedPriceRange);
      console.log("price range = ", fetchedPriceRange);

      // Ensure buttons are disabled on initial load
      setIsFormModified(false);
      setIsPriceRangeModified(false);

    } catch (e) {
      console.log("Error during fetching weekend times -", e);
      setAlert({ open: true, severity: "error", message: "Failed to load schedule data" });
    }
  };

  useEffect(() => {
    fetchWeekendTimes();
  }, [cafeId, timeTransferSignal]);

  useEffect(() => {
    setTransferState({ done: false, targetCafeId: null });
  }, [cafeId, transferTargetCafeId]);

  useEffect(() => {
    const handleTimeRefresh = (event) => {
      const affectedCafeIds = event.detail?.cafeIds || [];

      if (affectedCafeIds.includes(cafeId)) {
        fetchWeekendTimes();
        setTimeRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("cafe-time-updated", handleTimeRefresh);
    return () => window.removeEventListener("cafe-time-updated", handleTimeRefresh);
  }, [cafeId]);

  // Helper function to check if a day's data has changed
  const hasDayChanged = (day, currentData) => {
    const lowerDay = day.toLowerCase();
    const original = originalFormData.current;

    if (!original) return true;

    const currentOpeningTime = currentData[`${lowerDay}_opening_time`] || "";
    const currentClosingTime = currentData[`${lowerDay}_closing_time`] || "";
    const currentHoliday = holidayDays[lowerDay] || false;

    const originalOpeningTime = original[`${lowerDay}_opening_time`] || "";
    const originalClosingTime = original[`${lowerDay}_closing_time`] || "";
    const originalHoliday = originalHolidays[lowerDay] || false;

    return (
      currentOpeningTime !== originalOpeningTime ||
      currentClosingTime !== originalClosingTime ||
      currentHoliday !== originalHoliday
    );
  };

  // Convert IST time to UTC format for API
  const convertISTToUTC = (istTime) => {
    if (!istTime || !/^\d{2}:\d{2}$/.test(istTime)) return "";

    try {
      const [hours, minutes] = istTime.split(":").map(Number);

      // Create IST date
      const istDate = new Date();
      istDate.setHours(hours);
      istDate.setMinutes(minutes);
      istDate.setSeconds(0);
      istDate.setMilliseconds(0);

      // Convert IST to UTC (subtract 5.5 hours)
      const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));

      const pad = (n) => String(n).padStart(2, "0");
      return `${pad(utcDate.getHours())}:${pad(utcDate.getMinutes())}:00`;
    } catch (error) {
      console.error("Error converting IST to UTC:", error);
      return "";
    }
  };

  // Submit time change - only for modified days
  const handleTimeChange = async (data) => {
    const formatTime = convertISTToUTC;

    // Only create payloads for days that have changed
    const payloads = days
      .filter(day => hasDayChanged(day, data))
      .map((day) => {
        const lowerDay = day.toLowerCase();
        return {
          cafe_list_id: cafeId,
          weekday: day,
          opening_time: formatTime(data[`${lowerDay}_opening_time`]),
          closing_time: formatTime(data[`${lowerDay}_closing_time`]),
          is_holiday: holidayDays[lowerDay] ? 1 : 0
        };
      });

    if (payloads.length === 0) {
      setAlert({ open: true, message: "No changes to save", severity: "info" });
      return;
    }

    try {
      console.log(`Updating ${payloads.length} days:`, payloads.map(p => p.weekday));

      const responses = await Promise.all(
        payloads.map(payload =>
          axios.post(`${baseUrl}/api/v2/schedule`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          })
        )
      );

      setAlert({ open: true, message: `Schedule updated for ${payloads.length} day(s)!`, severity: "success" });
      onSave?.();

      // Update original references with current values
      originalFormData.current = JSON.parse(JSON.stringify(data));
      setOriginalHolidays({ ...holidayDays });

      // Force update the form state to ensure react-hook-form is in sync
      setTimeout(() => {
        setIsFormModified(false);
      }, 0);

    } catch (e) {
      console.log("Error during submit change - ", e);
      setAlert({ open: true, severity: "error", message: "Failed to update schedule" });
    }
  };

  // Update price range
  const handlePriceRange = async () => {
    if (!isPriceRangeModified) {
      setAlert({ open: true, message: "No changes to save", severity: "info" });
      return;
    }

    const pricePayload = {
      cafe_price_range: priceRange
    };

    try {
      const res = await axios.put(`${baseUrl}/api/v2/cafe-price/${cafeId}`, pricePayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("res pricerange update= ", res);
      setAlert({ open: true, message: "Price range updated successfully!", severity: "success" });
      setOriginalPriceRange(priceRange);
      setIsPriceRangeModified(false);

    } catch (e) {
      console.log("error during updating price- ", e);
      console.log("error message = ", e.response?.data?.msg)
      setAlert({ open: true, severity: "error", message: e.response?.data?.msg || "Failed to update price range" });
    }
  };

  const handleTransferTimeAndPrice = async () => {
    if (!transferTargetCafeId) {
      setAlert({ open: true, severity: "info", message: "No target cafe selected" });
      return;
    }

    try {
      setIsTransferring(true);

      const response = await axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${cafeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sourceWeekdays = response.data?.activeWeekdays || [];
      const sourcePriceRange = response.data?.data?.[0]?.cafe_price_range || 0;

      if (sourceWeekdays.length > 0) {
        const schedulesByWeekday = sourceWeekdays.reduce((acc, item) => {
          const weekday = item.weekday;
          if (!weekday) return acc;

          if (!acc[weekday]) {
            acc[weekday] = {
              weekday,
              is_holiday: item.is_holiday === 1 || item.holiday === 1 ? 1 : 0,
              slots: [],
            };
          }

          // New API shape: timings are inside item.slots[]
          if (Array.isArray(item.slots) && item.slots.length > 0) {
            item.slots.forEach((slot) => {
              if (slot?.opening_time && slot?.closing_time) {
                acc[weekday].slots.push({
                  opening_time: slot.opening_time,
                  closing_time: slot.closing_time,
                });
              }
            });
          } else if (item.opening_time && item.closing_time) {
            // Backward compatibility for older flat weekday payloads
            acc[weekday].slots.push({
              opening_time: item.opening_time,
              closing_time: item.closing_time,
            });
          }

          return acc;
        }, {});

        const schedulePayload = {
          cafe_list_id: String(transferTargetCafeId),
          schedules: Object.values(schedulesByWeekday),
        };

        await axios.post(`${baseUrl}/api/v2/schedule`, schedulePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

    

      // Refetch both cafes immediately after transfer to ensure latest schedule is available.
      await Promise.all([
        axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${cafeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/api/user/admin/restaurant-all-info/${transferTargetCafeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      window.dispatchEvent(
        new CustomEvent("cafe-time-updated", {
          detail: { cafeIds: [cafeId, transferTargetCafeId] },
        })
      );

      setTransferState({ done: true, targetCafeId: transferTargetCafeId });
      onTransferSuccess?.();

      setAlert({ open: true, severity: "success", message: `Time and price transferred to cafe ${transferTargetCafeId}` });
    } catch (e) {
      console.log("error during transfer time and price - ", e);
      setAlert({ open: true, severity: "error", message: "Failed to transfer time and price" });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper elevation={0} sx={{ p: 0, width: '100%' }}>
     <NewTimeManagement key={`${cafeId}-${timeRefreshKey}`} datas={schduleData} cafeListId={cafeId}/>

        <Stack p={2}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} mb={2} spacing={1}>
            <Typography variant="h7">
              Price Range
            </Typography>
            {transferTargetCafeId && (
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Button
                  variant="outlined"
                  onClick={handleTransferTimeAndPrice}
                  disabled={isTransferring}
                >
                  {isTransferring ? "Transferring..." : `Transfer Time & Price to ${transferTargetCafeId}`}
                </Button>
                {transferState.done && transferState.targetCafeId === transferTargetCafeId && (
                  <Chip size="small" color="success" label={`Transferred to ${transferTargetCafeId}`} />
                )}
              </Stack>
            )}
          </Stack>
          <Grid container spacing={2} mb={"16px"}>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                label="Price Range"
                select
                variant="outlined"
                fullWidth
                size="small"
                required
                value={priceRange !== null && priceRange !== undefined ? priceRange : ''}
                onChange={(e) => {
                  console.log("pricerange selected-", e.target.value);
                  setPriceRange(e.target.value);
                }}
                InputProps={{
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderRadius: '7px',
                    },
                  },
                }}
              >
                <MenuItem value={0}>Select Price Range</MenuItem>
                <MenuItem value={1}>Most Expensive</MenuItem>
                <MenuItem value={2}>Expensive</MenuItem>
                <MenuItem value={3}>Normal</MenuItem>
                <MenuItem value={4}>Economy</MenuItem>
                <MenuItem value={5}>Most Economy</MenuItem>
              </TextField>

            </Grid>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <Button
                variant="contained"
                onClick={handlePriceRange}
                disabled={!isPriceRangeModified}
              >
                UPDATE PRICE RANGE
              </Button>
            </Grid>

          </Grid>
        </Stack>


      </Paper>
    </LocalizationProvider>
  );
};

export default TimeSetting;