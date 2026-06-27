import React, { useState } from 'react';
import { Radio, RadioGroup, FormControlLabel, TextField, MenuItem, Grid, Box, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';


const SettingsTab = () => {
  // Define the state to handle the form values
  const [currency, setCurrency] = useState('INR');
  const [zomatoAvailable, setZomatoAvailable] = useState(false);
  const [swiggyAvailable, setSwiggyAvailable] = useState(false);
  const [takeawayAvailable, setTakeawayAvailable] = useState(false);
  const [dineInAvailable, setDineInAvailable] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [language, setLanguage] = useState('ENGLISH');
  const [radius, setRadius] = useState(false);
  
  // State for loading buttons
  const [loadingZomato, setLoadingZomato] = useState(false);
  const [loadingSwiggy, setLoadingSwiggy] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // Simulate async save functionality
  const simulateLoading = (setLoadingFunc) => {
    setLoadingFunc(true);
    setTimeout(() => setLoadingFunc(false), 2000); // Simulate 2 seconds loading
  };

  const handleSaveChanges = () => {
    simulateLoading(setLoadingSave);
    console.log("Changes Saved!");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid size={12}>
          <TextField
            select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            fullWidth
          >
            <MenuItem value="INR">INR</MenuItem>
           
          </TextField>
        </Grid>

        {/* Zomato Section */}
        <Grid size={12}>
            <Typography >ZomatoAvailable</Typography>
          <RadioGroup
            row
            value={zomatoAvailable ? "Yes" : "No"}
            onChange={(e) => setZomatoAvailable(e.target.value === "Yes")}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="yes" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
          <TextField
            label="Commission"
            disabled={!zomatoAvailable}
            value={zomatoAvailable ? "Commission" : ""}
            fullWidth
            margin="dense"
          />
          <LoadingButton
            variant="contained"
            color="success"
            fullWidth
            disabled={!zomatoAvailable}
            loading={loadingZomato}  // This controls the loading state
            onClick={() => simulateLoading(setLoadingZomato)}  // Set loading on click
          >
            Update Menu Price
          </LoadingButton>
        </Grid>

        {/* Swiggy Section */}
        <Grid size={12}>
          <RadioGroup
            row
            value={swiggyAvailable ? "Yes" : "No"}
            onChange={(e) => setSwiggyAvailable(e.target.value === "Yes")}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Swiggy Available" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
          <TextField
            label="Commission"
            disabled={!swiggyAvailable}
            value={swiggyAvailable ? "Commission" : ""}
            fullWidth
            margin="dense"
          />
          <LoadingButton
            variant="contained"
            color="success"
            fullWidth
            disabled={!swiggyAvailable}
            loading={loadingSwiggy}  // Loading state for Swiggy button
            onClick={() => simulateLoading(setLoadingSwiggy)}  // Set loading on click
          >
            Update Menu Price
          </LoadingButton>
        </Grid>

        {/* Other options */}
        <Grid size={12}>
          <RadioGroup
            row
            value={takeawayAvailable ? "Yes" : "No"}
            onChange={(e) => setTakeawayAvailable(e.target.value === "Yes")}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Takeaway Available" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        <Grid size={12}>
          <RadioGroup
            row
            value={dineInAvailable ? "Yes" : "No"}
            onChange={(e) => setDineInAvailable(e.target.value === "Yes")}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Dine-in Available" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        {/* UPI and Language */}
        <Grid size={12}>
          <TextField
            label="UPI ID"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            fullWidth
            margin="dense"
          />
        </Grid>

        <Grid size={12}>
          <TextField
            select
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            fullWidth
          >
            <MenuItem value="ENGLISH">English</MenuItem>
            <MenuItem value="HINDI">Hindi</MenuItem>
          </TextField>
        </Grid>

        {/* Radius Toggle */}
        <Grid size={12}>
          <RadioGroup
            row
            value={radius ? "Yes" : "No"}
            onChange={(e) => setRadius(e.target.value === "Yes")}
          >
            <FormControlLabel value="Yes" control={<Radio />} label="Radius" />
            <FormControlLabel value="No" control={<Radio />} label="No" />
          </RadioGroup>
        </Grid>

        {/* Cancel and Save Changes */}
        <Grid size={6}>
          <LoadingButton
            variant="outlined"
            color="primary"
            fullWidth
            disabled={loadingSave}  // Disable when save button is loading
          >
            Cancel
          </LoadingButton>
        </Grid>
        <Grid size={6}>
          <LoadingButton
            variant="contained"
            color="success"
            fullWidth
            loading={loadingSave}  // Loading state for Save button
            onClick={handleSaveChanges}  // Set loading when Save is clicked
          >
            Save Changes
          </LoadingButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsTab;
