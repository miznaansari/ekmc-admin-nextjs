import {
  TextField,
  Grid,
  Typography,
  Button,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { Box } from '@mui/system';
import React, { useEffect, useState } from 'react';

const STATIC_SOCIAL_DATA = {
  website_url: "https://example.com",
  social_facebook_url: "https://facebook.com/example",
  social_instagram_url: "https://instagram.com/example",
  social_linkedin_url: "https://linkedin.com/in/example",
  social_twitter_url: "https://twitter.com/example",
  social_swiggy_url: "https://swiggy.com/example",
  social_dineout_url: "https://dineout.com/example",
  social_googlemaps_url: "https://maps.google.com/?q=example",
  social_zomato_url: "https://zomato.com/example"
};

const SocialLink = () => {
  const [data, setData] = useState({ ...STATIC_SOCIAL_DATA });
  const [initialData, setInitialData] = useState({ ...STATIC_SOCIAL_DATA });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });

  const hasSpace = (str) => /\s/.test(str);
  const hasAnySpace = Object.values(data).some((val) => hasSpace(val));

  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
    setTimeout(() => setAlert(prev => ({ ...prev, open: false })), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prevData => ({ ...prevData, [name]: value }));
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSave = () => {
    // Validate spaces
    const invalidFields = Object.entries(data).filter(([key, value]) => hasSpace(value));
    if (invalidFields.length > 0) {
      showAlert("error", "URLs should not contain spaces.");
      return;
    }

    // Update in-memory static data
    setInitialData({ ...data });
    showAlert("success", "Updated Successfully (static demo)!");
  };

  const isSaveDisabled = JSON.stringify(data) === JSON.stringify(initialData) || !isOnline || hasAnySpace;

  return (
    <Paper sx={{ p: 2 }}>
      <Box>
        <Typography variant="h5" mb={2}>Social Info</Typography>

        <Grid container spacing={2}>
          {[
            { name: "website_url", label: "Website" },
            { name: "social_facebook_url", label: "Facebook" },
            { name: "social_instagram_url", label: "Instagram" },
            { name: "social_twitter_url", label: "Twitter" },
            { name: "social_linkedin_url", label: "Linkedin" },
            { name: "social_swiggy_url", label: "Swiggy" },
            { name: "social_dineout_url", label: "Dineout" },
            { name: "social_googlemaps_url", label: "Google Maps" },
            { name: "social_zomato_url", label: "Zomato" },
          ].map(({ name, label }) => (
            <Grid
              key={name}
              size={{
                xs: 12,
                md: 6
              }}>
              <TextField
                name={name}
                value={data[name]}
                onChange={handleChange}
                label={label}
                variant="outlined"
                fullWidth
                size="small"
                multiline
                InputLabelProps={{ shrink: true }}
                disabled={!isOnline}
                sx={{
                  borderRadius: 2,
                  boxShadow: hasSpace(data[name]) ? "0px 0px 10px 2px red" : "none"
                }}
                error={hasSpace(data[name])}
                helperText={hasSpace(data[name]) ? "URL should not contain spaces" : ""}
              />
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isSaveDisabled}
          >
            Save
          </Button>
        </Box>
      </Box>
      <Snackbar
        open={alert.open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={alert.severity} sx={{ width: "100%" }}>{alert.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default SocialLink;
