import { useEffect, useState } from "react";
import { Box, Checkbox, Grid, InputLabel, Typography, Snackbar, Alert } from "@mui/material";
import EditOptions from "./EditOptions";
import Primary from "./Primary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import MenuEditProfile from "./MenuEditProfile";
import Spinner from "./Spinner";
// import ErrorText from "../../../Components/ErrorText";
import cafe_profile from "./cafe_profile.json";
import TimeEditorBox from "./TimeEditorBox";
import { convertToUTC, lastUpdatedAtDateToUTC } from "./ConvertTime";

export const TimePrice = () => {
  const navigate = useNavigate();
  const drawer = false; // No Redux

  const [isSavePrice, setIsSavePrice] = useState(false);
  const [succ, setSucc] = useState(null);
  const [option, set_option] = useState();
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({});
  const [formChanged, setFormChanged] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [initialLoadingSpinner, setInitialLoadingSpinner] = useState(true);
  const [holidayDays, setHolidayDays] = useState({});
  const [weekdayData, setWeekdayData] = useState([]);
  const [openingTimeChanged, setOpeningTimeChanged] = useState(false);
  const [closingTimeChanged, setClosingTimeChanged] = useState(false);
  const [buttonEnable, setButtonEnable] = useState();
  const [errors, setErrors] = useState({ price_error: "" });
  const [copyToOtherDays, setCopyToOtherDays] = useState(false);
  const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });

  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
    setTimeout(() => setAlert(prev => ({ ...prev, open: false })), 3000);
  };

  // Load static data from JSON
  const getCafeData = () => {
    const data = cafe_profile;
    setAllData(data);
    set_option(data.cafe_price_range);
    setSelectedOption(data.cafe_price_range);
    if (data.activeWeekdays?.length > 0) {
      processAndSetWeekdays(data.activeWeekdays);
    } else {
      setWeekdayData(getStaticWeekdays());
    }
    setInitialLoadingSpinner(false);
  };

  useEffect(() => {
    getCafeData();
  }, []);

  const processAndSetWeekdays = (fetchedWeekdayData) => {
    const processedWeekdayData = fetchedWeekdayData.map((day) => ({
      ...day,
      opening_time: convertFromUTC(day.opening_time),
      closing_time: convertFromUTC(day.closing_time),
    }));

    if (fetchedWeekdayData.length < 7) {
      const mergedWeekdayData = getStaticWeekdays().map((staticDay) => {
        return (
          processedWeekdayData.find(day => day.weekday === staticDay.weekday) || staticDay
        );
      });
      setWeekdayData(mergedWeekdayData);
    } else {
      setWeekdayData(processedWeekdayData);
    }

    setHolidayDays(getHolidayDays(fetchedWeekdayData));
    setOpeningTimeChanged(getInitialChangeState(fetchedWeekdayData));
    setClosingTimeChanged(getInitialChangeState(fetchedWeekdayData));
  };

  const getStaticWeekdays = () => [
    { weekday: "Monday", opening_time: "", closing_time: "", holiday: 0 },
    { weekday: "Tuesday", opening_time: "", closing_time: "", holiday: 0 },
    { weekday: "Wednesday", opening_time: "", closing_time: "", holiday: 0 },
    { weekday: "Thursday", opening_time: "", closing_time: "", holiday: 0 },
    { weekday: "Friday", opening_time: "", closing_time: "", holiday: 0 },
    { weekday: "Saturday", opening_time: "", closing_time: "", holiday: 0 },
    { weekday: "Sunday", opening_time: "", closing_time: "", holiday: 0 },
  ];

  const getHolidayDays = (weekdays) =>
    weekdays.reduce((acc, day) => {
      if (day.holiday === 1) acc[day.weekday] = true;
      return acc;
    }, {});

  const getInitialChangeState = (weekdays) =>
    weekdays.reduce((acc, day) => {
      acc[day.weekday] = false;
      return acc;
    }, {});

  const convertFromUTC = (utcTimeString) => {
    if (!utcTimeString) return "";
    try {
      const [hours, minutes, seconds = 0] = utcTimeString.split(":").map(Number);
      const date = new Date();
      date.setUTCHours(hours, minutes, seconds, 0);
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
    } catch (error) {
      console.error("Error converting time from UTC:", error);
      return utcTimeString;
    }
  };

  const handleDaySubmit = (day1, callback) => {
    const oldWeekDays = [...weekdayData];
    const dayIndex = oldWeekDays.findIndex(el => el.weekday === day1.weekday);

    if (dayIndex !== -1) {
      oldWeekDays[dayIndex] = day1;
      const updatedWeekDay = oldWeekDays.map(k => ({
        ...k,
        opening_time: k.opening_time ? convertToUTC(k.opening_time) : "",
        closing_time: k.closing_time ? convertToUTC(k.closing_time) : "",
      }));

      const updatedData = {
        ...allData,
        activeWeekdays: updatedWeekDay,
        last_updated_at: lastUpdatedAtDateToUTC(),
      };

      setAllData(updatedData);
      showAlert("success", `Data saved for ${day1.weekday}`);
      if (callback) callback(day1.weekday);
    } else {
      showAlert("error", "Failed to save data - day not found");
    }
  };

  const handleOptionChange = (newOption) => {
    setSelectedOption(newOption);
    set_option(newOption);
    setFormChanged(true);
  };

  const handleSubmitPrice = () => {
    if (!option) {
      setErrors({ ...errors, price_error: "Choose an Option" });
      return;
    }

    const updatedData = { ...allData, cafe_price_range: option, last_updated_at: lastUpdatedAtDateToUTC() };
    setAllData(updatedData);
    setSelectedOption(option);
    setFormChanged(false);
    showAlert("success", "Price saved successfully");
  };

  const handleCopyToOtherDaysChange = (event) => {
    setCopyToOtherDays(event.target.checked);
    if (event.target.checked) {
      const firstDayData = weekdayData.find(day => day.opening_time && day.closing_time);
      if (firstDayData) {
        const { opening_time, closing_time } = firstDayData;
        const updatedWeekdayData = weekdayData.map(day => (!day.opening_time && !day.closing_time ? { ...day, opening_time, closing_time } : day));
        setWeekdayData(updatedWeekdayData);
      }
    }
  };

  return (
    <>
      {initialLoadingSpinner ? (
        <Box style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <Spinner />
        </Box>
      ) : (
        <Box sx={{ pl: { xs: "4%", lg: drawer ? "19%" : "6.3%" }, pr: "4%", transition: "padding-left 0.4s ease" }}>
          <Snackbar
            open={alert.open}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            autoHideDuration={3000}
            onClose={() => setAlert(prev => ({ ...prev, open: false }))}
          >
            <Alert severity={alert.severity} sx={{ width: "100%" }}>
              {alert.message}
            </Alert>
          </Snackbar>

          <Typography
            paddingTop="12px"
            fontSize="1.285rem"
            fontWeight="600"
            marginBottom={1}
            display="flex"
            alignItems="center"
            style={{ cursor: "pointer", width: "100%", justifyContent: "start" }}
            onClick={() => navigate("/manager/profile/edit-restaurant")}
          >
            <ArrowBackIcon style={{ color: "black" }} /> Edit
          </Typography>

          <Box marginBottom={5}>
            <EditOptions />
          </Box>

          <Box sx={{ "& span": { "&.Mui-checked": { color: "#00cf63" } }, display: "flex", gap: "4px", mb: "16px" }}>
            <Checkbox checked={copyToOtherDays} onChange={handleCopyToOtherDaysChange} />
            <Typography sx={{ color: "rgba(0, 0, 0, 0.60)", fontSize: "16px", fontWeight: 400, lineHeight: "24px" }}>
              COPY TO ALL
            </Typography>
          </Box>

          <Box marginBottom={10}>
            {weekdayData?.map((el, index) => (
              <TimeEditorBox key={index} el={el} handleDaySubmit={handleDaySubmit} />
            ))}

            <Grid container spacing={2} alignItems="flex-end" mt={2}>
              <Grid size={{ xs: 12, sm: 8, md: 6, lg: 4 }}>
                <InputLabel htmlFor="price">Price</InputLabel>
                <MenuEditProfile
                  margin="-15px -10px"
                  width="200px"
                  option={option}
                  set_option={set_option}
                  setFormChanged={setFormChanged}
                  errors={errors}
                  setErrors={setErrors}
                  onOptionChange={handleOptionChange}
                />
                {errors.price_error && '<ErrorText value={errors.price_error} />'}
              </Grid>

              <Grid marginTop="auto" size={{ xs: 6, sm: 8, md: 2, lg: 2 }}>
                <Primary
                  disabled={!formChanged && option === selectedOption}
                  handleClick={handleSubmitPrice}
                  value={<Box sx={{ display: "flex", gap: 1 }}>{isSavePrice ? <Spinner size={20} thickness={5} color="white" /> : "Save Price"}</Box>}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </>
  );
};
