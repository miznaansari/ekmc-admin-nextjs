import React, { useState } from "react";
import {
  TextField,
  Grid,
  Button,
  Chip,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import instanceV1 from "../../restaurant/authaxios";

const Survey = () => {
  const [formData, setFormData] = useState({
    weeklyAverageSales: "",
    monthlySales: "",
    weekdaysFootfall: "",
    weekendsFootfall: "",
    averageOrderValue: "",
    marketingExpense: "",
    staffAvailable: "",
    offlineOrders: "",
    swiggyZomatoOrders: "",
    staffProblem: "",
    software: [],
    marketingStrategy: [],
  });

  const softwareOptions = [
    "Software 1",
    "Software 2",
    "Software 3",
    "Software 4",
    "Software 5",
    "Software 6",
    "Software 7",
    "Software 8",
  ];

  const strategyOptions = [
    "Strategy 1",
    "Strategy 2",
    "Strategy 3",
    "Strategy 4",
    "Strategy 5",
    "Strategy 6",
    "Strategy 7",
    "Strategy 8",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleArrayValue = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    const instance = instanceV1(token);

    const payload = {
      weeklyAverageSales: formData.weeklyAverageSales,
      monthlySales: formData.monthlySales,
      weekdaysFootfall: formData.weekdaysFootfall,
      weekendsFootfall: formData.weekendsFootfall,
      averageOrderValue: formData.averageOrderValue,
      marketingExpense: formData.marketingExpense,
      staffAvailable: formData.staffAvailable,
      offlineOrders: formData.offlineOrders,
      swiggyZomatoOrders: formData.swiggyZomatoOrders,
      staffProblem: formData.staffProblem,
      software: formData.software,
      marketingStrategy: formData.marketingStrategy,
    };

    try {
      const res = await instance.post("/survery", payload);
      console.log("Survey Submitted:", res.data);
    } catch (error) {
      console.error("Survey Error:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Paper elevation={1}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Info
          </Typography>

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Weekly average Sales"
                name="weeklyAverageSales"
                placeholder="Enter weekly average sales"
                value={formData.weeklyAverageSales}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Monthly Sales"
                name="monthlySales"
                placeholder="Enter monthly sales"
                value={formData.monthlySales}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Weekdays footfall"
                name="weekdaysFootfall"
                placeholder="Enter no. of people"
                value={formData.weekdaysFootfall}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Staff availability"
                name="staffAvailable"
                placeholder="Enter no. of staff available"
                value={formData.staffAvailable}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Weekends footfall"
                name="weekendsFootfall"
                placeholder="Enter no. of people"
                value={formData.weekendsFootfall}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Marketing expense"
                name="marketingExpense"
                placeholder="Enter marketing expense"
                value={formData.marketingExpense}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Average Order Value"
                name="averageOrderValue"
                placeholder="Enter Average Order Value"
                value={formData.averageOrderValue}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Number of orders Offline"
                name="offlineOrders"
                placeholder="Enter no. of orders"
                value={formData.offlineOrders}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Staff Problem / Other Problem"
                name="staffProblem"
                placeholder="Enter your problem"
                value={formData.staffProblem}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
              size="small"
                fullWidth
                label="Number of orders via Swiggy/Zomato"
                name="swiggyZomatoOrders"
                placeholder="Enter no. of orders"
                value={formData.swiggyZomatoOrders}
                onChange={handleChange}
              />
            </Grid>

            {/* Software Chips */}
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <Typography variant="subtitle2">
                Which POS or software are you using?
              </Typography>
              <Grid container spacing={1}>
                {softwareOptions.map((item) => (
                  <Grid key={item}>
                    <Chip
                      label={item}
                      clickable
                      color={
                        formData.software.includes(item)
                          ? "success"
                          : "default"
                      }
                      onClick={() => toggleArrayValue("software", item)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Strategy Chips */}
            <Grid
              size={{
                xs: 12,
                md: 6
              }}>
              <Typography variant="subtitle2">
                Marketing strategy of restaurant and cafe
              </Typography>
              <Grid container spacing={1}>
                {strategyOptions.map((item) => (
                  <Grid key={item}>
                    <Chip
                      label={item}
                      clickable
                      color={
                        formData.marketingStrategy.includes(item)
                          ? "success"
                          : "default"
                      }
                      onClick={() =>
                        toggleArrayValue("marketingStrategy", item)
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
            >
              SAVE AND PROCEED
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Survey;
