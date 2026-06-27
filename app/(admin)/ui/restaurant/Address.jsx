import { StyleBox } from "../../../styles/Restaurant/EditRestaurant";
import { Box, Grid, TextField, Typography, Button } from "@mui/material";
import EditOptions from "./EditOptions";
import Primary from "../../../Components/Button/Primary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Spinner from "../../../Components/Progress/Spinner";
import Toast from "../../../Components/Toast";
import cafe_profile from "../../../utils/OfflineData/cafe_profile.json";
import { lastUpdatedAtDateToUTC } from "../../../utils/ConvertTime";
import { db } from "../../../db/schema";

const Address = () => {
  const navigate = useNavigate();
  const [err, setErr] = useState(null);
  const [updated, setUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [initialLoadingSpinner, setInitialLoadingSpinner] = useState(true);
  const [data, setData] = useState({
    country: "India",
    address_1: "",
    address_2: "",
    cafe_city: "",
    state: "",
    pin_code: "",
    latitude: 0,
    longitude: 0,
  });
  const [recordKey, setRecordKey] = useState(null);
  const [errors, setErrors] = useState({
    address_1_error: "",
    pincode_error: "",
  });

  const drawer = useSelector((state) => state.drawerSlice.currentDrawer);

  // Fetch initial data
  const getCafeById = async () => {
    try {
      const cafeProfiles = await db.database.cafe_profile.toArray();

      if (cafeProfiles.length === 0) {
        //console.log("No cafe profiles found, initializing with default data");
        const initialData = {
          ...cafe_profile,
          country: "India",
          address_1: "",
          address_2: "",
          cafe_city: "",
          state: "",
          pin_code: "",
          latitude: 0,
          longitude: 0,
          is_dirty: false,
          is_modified: true,
          last_updated_at: lastUpdatedAtDateToUTC()
        };
        setData(initialData);

        try {
          // Add initial data to database
          const key = await db.database.cafe_profile.add(initialData);
          //console.log("Added initial cafe profile to database with key:", key);
          setRecordKey(key);
        } catch (addError) {
          console.error("Error adding initial cafe profile:", addError);
          setErr("Failed to initialize cafe profile: " + addError.message);
        }
      } else {
        //console.log("Found existing cafe profile, loading data");
        const existingProfile = cafeProfiles[0];

        // Extract the key using the actual key field name
        const key = existingProfile.key;
        //console.log("Found record key:", key);
        setRecordKey(key);

        // Merge existing data with default values to ensure all fields exist
        const mergedData = {
          country: "India",
          address_1: "",
          address_2: "",
          cafe_city: "",
          state: "",
          pin_code: "",
          latitude: 0,
          longitude: 0,
          ...existingProfile
        };

        setData(mergedData);
        //console.log("Loaded data:", mergedData);
      }
    } catch (error) {
      console.error("Error fetching cafe profile:", error);
      setErr("Failed to fetch cafe profile: " + error.message);
    } finally {
      setInitialLoadingSpinner(false);
    }
  };

  useEffect(() => {
    getCafeById();
  }, []);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    setFormChanged(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      address_1_error: "",
      pincode_error: "",
    });

    // Validate form
    let hasErrors = false;
    if (!data.address_1) {
      setErrors(prev => ({
        ...prev,
        address_1_error: "Address is Required",
      }));
      hasErrors = true;
    }

    if (!data.pin_code) {
      setErrors(prev => ({
        ...prev,
        pincode_error: "Pincode is Required",
      }));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for update
      const updatedData = {
        ...data,
        is_dirty: false,
        is_modified: true,
        last_updated_at: lastUpdatedAtDateToUTC(),
      };

      //console.log("Updating with data:", updatedData);
      //console.log("Using record key:", recordKey);

      if (recordKey) {
        // Update using the key field
        await db.database.cafe_profile.update(recordKey, updatedData);
        //console.log("Updated existing cafe profile");
      } else {
        // If no key, check if there are existing records
        const existingProfiles = await db.database.cafe_profile.toArray();

        if (existingProfiles.length > 0) {
          // Use the key from the first record
          const existingKey = existingProfiles[0].key;
          if (existingKey) {
            //console.log("Found existing record with key:", existingKey);
            await db.database.cafe_profile.update(existingKey, updatedData);
            setRecordKey(existingKey);
          } else {
            // If no key found, try to put the record using the first record's primary key
            //console.log("No key found, trying to put record");
            const newKey = await db.database.cafe_profile.put(updatedData);
            setRecordKey(newKey);
          }
        } else {
          // If no existing records, add a new one
          //console.log("No existing records, adding new record");
          const newKey = await db.database.cafe_profile.add(updatedData);
          setRecordKey(newKey);
        }
      }

      setUpdated("Updated Successfully !!");
      setFormChanged(false);

      // Refresh data to show the latest changes
      await getCafeById();
    } catch (error) {
      console.error("Error saving to database:", error);
      setErr("Failed to save data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Debug function to view current data in database
  const debugViewData = async () => {
    try {
      const allData = await db.database.cafe_profile.toArray();
      //console.log("All cafe profiles in database:", allData);

      if (allData.length > 0) {
        const firstRecord = allData[0];
        //console.log("First record:", firstRecord);
        //console.log("Record key:", firstRecord.key);
        //console.log("Record primary key type:", typeof (firstRecord.key));
        //console.log("All keys in record:", Object.keys(firstRecord));
      } else {
        //console.log("No records found in database");
      }

      alert("Data logged to console. Check browser developer tools.");
    } catch (error) {
      console.error("Error viewing data:", error);
      setErr("Failed to view data: " + error.message);
    }
  };

  // Debug function to clear all data and start fresh
  const debugClearData = async () => {
    try {
      await db.database.cafe_profile.clear();
      //console.log("Cleared all cafe profiles from database");
      setRecordKey(null);
      setData({
        country: "India",
        address_1: "",
        address_2: "",
        cafe_city: "",
        state: "",
        pin_code: "",
        latitude: 0,
        longitude: 0,
      });
      setFormChanged(false);
      alert("Database cleared. Starting fresh.");
    } catch (error) {
      console.error("Error clearing data:", error);
      setErr("Failed to clear data: " + error.message);
    }
  };

  // Clear update message after 3 seconds
  useEffect(() => {
    if (updated) {
      const timer = setTimeout(() => {
        setUpdated(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updated]);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (err) {
      const timer = setTimeout(() => {
        setErr(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [err]);

  return (
    <>
      {initialLoadingSpinner ? (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <Spinner />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              pl: {
                xs: "4%",
                lg: drawer ? "19%" : "6.3%",
              },
              pr: "4%",
              transition: "padding-left 0.4s ease",
            }}
          >
            {err && <Toast err={err} type={"error"} />}
            {updated && <Toast err={updated} type={"success"} />}
            <Typography
              paddingTop={"12px"}
              fontSize="1.285rem"
              fontWeight="600"
              marginBottom={1}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              onClick={() => navigate("/restaurant/profile/time-price")}
              style={{
                cursor: "pointer",
                width: "100%",
                display: "flex",
                justifyContent: "start",
              }}
            >
              <ArrowBackIcon style={{ color: "black" }} />
              Edit
            </Typography>
            <StyleBox marginBottom={10}>
              <EditOptions />
              <Grid container spacing={2} marginTop={2} marginBottom={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Address 1"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="Enter Address 1"
                    type="text"
                    name="address1"
                    value={data.address_1 || ""}
                    onChange={(e) => handleFieldChange("address_1", e.target.value)}
                    required={true}
                    error={Boolean(errors.address_1_error)}
                    helperText={errors.address_1_error}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Address 2"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="Enter Address 2"
                    type="text"
                    name="address2"
                    value={data.address_2 || ""}
                    onChange={(e) => handleFieldChange("address_2", e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} marginTop={2} marginBottom={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="City"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={data.cafe_city || ""}
                    onChange={(e) => handleFieldChange("cafe_city", e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="State"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    value={data.state || ""}
                    onChange={(e) => handleFieldChange("state", e.target.value)}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} marginBottom={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Country"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="India"
                    value={data.country || "India"}
                    onChange={(e) => handleFieldChange("country", e.target.value)}
                    required={true}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    label="Pincode"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="Enter Pincode"
                    value={data.pin_code || ""}
                    onChange={(e) => handleFieldChange("pin_code", e.target.value)}
                    error={Boolean(errors.pincode_error)}
                    helperText={errors.pincode_error}
                  />
                </Grid>
              </Grid>

              {/* Debug buttons */}
              <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={debugViewData}
                >
                  Debug: View Current Data
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={debugClearData}
                >
                  Debug: Clear Database
                </Button>
              </Box>

              <Primary
                handleClick={handleSubmit}
                disabled={!formChanged || loading}
                marginTop="72px"
                value={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    Save
                    {loading ? (
                      <Spinner size={20} thickness={5} color={"white"} />
                    ) : (
                      ""
                    )}
                  </Box>
                }
              />
            </StyleBox>
          </Box>
        </>
      )}
    </>
  );
};

export default Address;