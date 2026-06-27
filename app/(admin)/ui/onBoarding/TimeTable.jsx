// created by Mohd Mizna Ansari
import { useEffect, useState } from "react";
import { Alert, Box, Button, Paper, Snackbar, Typography } from "@mui/material";
import TimeEditorBox from "../restaurant/TimeEditorBox";

// Static weekdays data
const STATIC_WEEKDAYS = [
    { weekday: 'Monday', opening_time: '19:00:00', closing_time: '18:25:00', holiday: 0 },
    { weekday: 'Tuesday', opening_time: '21:00:00', closing_time: '17:55:00', holiday: 0 },
    { weekday: 'Wednesday', opening_time: '18:30:00', closing_time: '18:29:00', holiday: 0 },
    { weekday: 'Thursday', opening_time: '19:00:00', closing_time: '12:00:00', holiday: 0 },
    { weekday: 'Friday', opening_time: '19:00:00', closing_time: '18:29:00', holiday: 0 },
    { weekday: 'Saturday', opening_time: '18:30:00', closing_time: '18:25:00', holiday: 0 },
    { weekday: 'Sunday', opening_time: '19:00:00', closing_time: '09:00:00', holiday: 0 },
];

export const TimeTable = () => {
    const [weekdayData, setWeekdayData] = useState([]);
    const [newWeekdays, setNewWeekdays] = useState([]);
    const [isModified, setIsModified] = useState(false);
    const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });

    const showAlert = (severity, message) => {
        setAlert({ open: true, severity, message });
        setTimeout(() => setAlert({ ...alert, open: false }), 3000);
    };

    useEffect(() => {
        // Initialize with static data
        setWeekdayData(STATIC_WEEKDAYS.map(day => ({ ...day })));
        setNewWeekdays(STATIC_WEEKDAYS.map(day => ({ ...day })));
    }, []);

    const convertUTCToLocal = (utcTimeStr) => {
        if (!utcTimeStr) return "";
        const [hours, minutes, seconds] = utcTimeStr.split(":").map(Number);
        let istHours = hours + 5;
        let istMinutes = minutes + 30;
        if (istMinutes >= 60) {
            istHours += 1;
            istMinutes -= 60;
        }
        if (istHours >= 24) istHours -= 24;
        return `${String(istHours).padStart(2, "0")}:${String(istMinutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const handleDaySubmit = (day) => {
        const updatedWeekdays = weekdayData.map(d => d.weekday === day.weekday ? day : d);
        setWeekdayData(updatedWeekdays);
        setNewWeekdays(updatedWeekdays);
        setIsModified(true);
        showAlert("success", `${day.weekday} updated successfully`);
    };

    const handleSaveAll = () => {
        // Since it's static data, we'll just show a success message
        setIsModified(false);
        showAlert("success", "All changes saved successfully!");
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Paper>
                <Box sx={{ p: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="h5">Time</Typography>
                        <Button onClick={handleSaveAll} disabled={!isModified} variant="contained">
                            Save
                        </Button>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        {weekdayData.map((el, index) => (
                            <TimeEditorBox
                                key={index}
                                el={el}
                                convertUTCToLocal={convertUTCToLocal}
                                handleDaySubmit={handleDaySubmit}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Alert Snackbar */}
                <Snackbar
                    open={alert.open}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    autoHideDuration={3000}
                    onClose={() => setAlert({ ...alert, open: false })}
                >
                    <Alert severity={alert.severity} sx={{ width: "100%" }}>
                        {alert.message}
                    </Alert>
                </Snackbar>
            </Paper>
        </Box>
    );
};
