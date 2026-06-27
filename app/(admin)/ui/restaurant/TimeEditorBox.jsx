/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CheckBoxField from "./CheckBoxField";
import { useMediaQuery } from "@mui/system";

const TimeEditorBox = ({ el, handleDaySubmit }) => {
  const data = el;
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));

  // Online/offline status
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(true);
    const handleOfflineStatus = () => setIsOnline(false);

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, []);

  const handleHolidayChange = () => {
    if (isOnline) {
      handleDaySubmit({ ...data, holiday: data.holiday === 1 ? 0 : 1 });
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2} mb={2} alignItems="center" justifyContent="space-around">
        {/* Weekday */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: isLgUp ? "70px" : "100%" }}>
          <Typography variant="h6">{data.weekday}</Typography>

          {/* Holiday Checkbox for small screens */}
          <Box sx={{ display: isLgUp ? "none" : "flex", alignItems: "center" }}>
            <CheckBoxField
              margin="0px"
              disabled={!isOnline}
              check={data.holiday === 1}
              setCheck={handleHolidayChange}
            />
            <Typography ml={1}>Holiday</Typography>
          </Box>
        </Box>

        {/* Opening Time */}
        <Grid
          size={{
            xs: 12,
            md: 12,
            lg: 4
          }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              disabled={data.holiday === 1 || !isOnline}
              label="Opening Time"
              value={dayjs(data.opening_time, "HH:mm:ss")}
              onChange={(newValue) => {
                if (newValue) {
                  handleDaySubmit({ ...data, opening_time: newValue.format("HH:mm:ss") });
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  InputLabelProps: { shrink: true },
                  sx: { width: "100%" },
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Closing Time */}
        <Grid
          size={{
            xs: 12,
            md: 12,
            lg: 4
          }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              disabled={data.holiday === 1 || !isOnline}
              label="Closing Time"
              value={dayjs(data.closing_time, "HH:mm:ss")}
              onChange={(newValue) => {
                if (newValue) {
                  handleDaySubmit({ ...data, closing_time: newValue.format("HH:mm:ss") });
                }
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  InputLabelProps: { shrink: true },
                  sx: { width: "100%" },
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Holiday Checkbox for large screens */}
        <Box sx={{ display: isLgUp ? "flex" : "none", width: "100px", alignItems: "center" }}>
          <CheckBoxField
            margin="0px"
            disabled={!isOnline}
            check={data.holiday === 1}
            setCheck={handleHolidayChange}
          />
          <Typography ml={1}>Holiday</Typography>
        </Box>
      </Grid>
    </Box>
  );
};

export default TimeEditorBox;
