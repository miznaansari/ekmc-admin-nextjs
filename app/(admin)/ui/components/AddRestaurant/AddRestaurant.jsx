import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  CircularProgress,
  Paper,
  Autocomplete
} from "@mui/material";
import axios from "axios";
import CustomDropdown from "../custom dropdown/CustomDropdown";
import { useForm } from "react-hook-form";
import { useMemo } from "react";
import debounce from "lodash.debounce";

const countries = [
  { value: "101", label: "India" }
];

const AddRestaurant = ({ onClose, onSuccess }) => {
  const { control } = useForm();
  const [indianStates, setIndianStates] = useState()
  const [indianCities, setIndianCities] = useState()
  const [formData, setFormData] = useState({
    cafe_name: "",
    cafe_email: "",
    city_id: "",
    email: "",
    first_name: "",
    last_name: "",
    mobile_number: "",
    country: "101",
    allow_login: true,
    allow_menu_edit: true,
    allow_order: true,
    allow_qr_edit: true,
    cafe_mobile_number:""
  });
  const [citiesOption, setCitiesOption]=useState([]);
  const [searchCities, setSearchCities]=useState("ab");
  const [selectedCity, setSelectedCity] = useState(null);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");
  const baseUrl = process.env.VITE_REACT_APP_BACKEND_URL;

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobileNumber = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "cafe_name":
        if (!value.trim()) {
          error = "Restaurant name is required";
        }
        break;
      case "cafe_email":
        if (!value.trim()) {
          error = "Restaurant email is required";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Admin email is required";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "first_name":
        if (!value.trim()) {
          error = "First name is required";
        }
        break;
      case "last_name":
        if (!value.trim()) {
          error = "Last name is required";
        }
        break;
      case "mobile_number":
        if (!value.trim()) {
          error = "Mobile number is required";
        } else if (!validateMobileNumber(value)) {
          error = "Please enter a valid 10-digit mobile number";
        }
        break;
      case "cafe_mobile_number":
        if (!value.trim()) {
          error = "Cafe mobile number is required";
        } else if (!validateMobileNumber(value)) {
          error = "Please enter a valid 10-digit mobile number";
        }
        break;
      case "city_id":
        if (!value) {
          error = "Please select a city";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ""
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setValidationErrors({
      ...validationErrors,
      [name]: error
    });
  };

  const handleChange = (selectedOption, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'cafe_name', 'cafe_email', 'email', 'first_name', 
      'last_name', 'mobile_number', 'cafe_mobile_number', 'city_id'
    ];

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}/api/user/admin/create-restaurant`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        onSuccess();
      }
    } catch (error) {
      console.log("error during add restaurant- ", error)
      setError(
        error.response?.data?.msg ||
          "An error occurred while creating the restaurant."
      );
      console.log("error during create resturant :", error)
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChangeState = (selectedValue) => {
    setFormData((prevData) => ({
      ...prevData,
      state: selectedValue.value || "",
    }));
    fetchCity(selectedValue.value)
  };

  const handleDropdownChangeCountry = (selectedValue) => {
    setFormData((prevData) => ({
      ...prevData,
      country: selectedValue.value || "",
    }));
  };

  const handleDropdownChangeCity = (selectedValue) => {
    setFormData((prevData) => ({
      ...prevData,
      city_id: selectedValue?.value || "",
    }));
    
    // Clear city validation error when city is selected
    if (validationErrors.city_id) {
      setValidationErrors({
        ...validationErrors,
        city_id: ""
      });
    }
  };

  const debouncedFetchCity = useMemo(
    () =>
      debounce(async (input) => {
        try {
          setCitiesOption([])
          const res = await axios.get(`${baseUrl}/api/v1/city-list`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              search: input,
            },
          });

          const cities = res.data?.data || [];
          const mappedCities = cities.map((city) => ({
            label: city.city_name,
            value: city.city_id,
          }));
          setCitiesOption(mappedCities);
        } catch (err) {
          console.error("Failed to fetch cities", err);
        }
      }, 300),
    []
  );

  return (
    <Paper elevation={3} sx={{ padding: 4, boxShadow:"none" }} >
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        Add New Restaurant
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              label="Restaurant Name"
              name="cafe_name"
              fullWidth
              value={formData.cafe_name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={!!validationErrors.cafe_name}
              helperText={validationErrors.cafe_name}
              required
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              label="Restaurant Email"
              name="cafe_email"
              fullWidth
              value={formData.cafe_email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={!!validationErrors.cafe_email}
              helperText={validationErrors.cafe_email}
              required
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Autocomplete
              options={citiesOption}
              getOptionLabel={(option) => option.label || ""}
              isOptionEqualToValue={(option, val) => option.value === val?.value}
              value={selectedCity}
              onChange={(_, newValue) => {
                setSelectedCity(newValue);
                handleDropdownChangeCity(newValue);
                setFormData((prevData) => ({
                  ...prevData,
                  city_id: newValue?.value || "",
                }));
              }}
              onBlur={() => {
                // Clear cities when field loses focus and no city is selected
                if (!selectedCity) {
                  setCitiesOption([]);
                }
              }}

              onInputChange={(_, inputValue) => {
                if (inputValue.trim().length >= 1) {
                  setCitiesOption([])
                  debouncedFetchCity(inputValue);
                  setCitiesOption([])
                } else {
                  setCitiesOption([])
                }
              }}
              renderOption={(props, option) => (
                <li {...props} key={option.value}>
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="City"
                  fullWidth
                  variant="outlined"
                  error={!!validationErrors.city_id}
                  helperText={validationErrors.city_id}
                  required
                />
              )}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              label="Admin Email"
              name="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              required
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              label="First Name"
              name="first_name"
              fullWidth
              value={formData.first_name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={!!validationErrors.first_name}
              helperText={validationErrors.first_name}
              required
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              label="Last Name"
              name="last_name"
              fullWidth
              value={formData.last_name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={!!validationErrors.last_name}
              helperText={validationErrors.last_name}
              required
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              label="Admin Mobile Number"
              name="mobile_number"
              fullWidth
              type="tel"
              inputProps={{ inputMode: "numeric", maxLength: 10 }}
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                  e.preventDefault();
                }
              }}
              value={formData.mobile_number}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={!!validationErrors.mobile_number}
              helperText={validationErrors.mobile_number}
              required
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              label="Cafe Mobile Number"
              name="cafe_mobile_number"
              fullWidth
              type="tel"
              inputProps={{ inputMode: "numeric", maxLength: 10 }}
              onKeyDown={(e) => {
                if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                  e.preventDefault();
                }
              }}
              value={formData.cafe_mobile_number}
              onChange={handleInputChange}
              onBlur={handleBlur}
              error={!!validationErrors.cafe_mobile_number}
              helperText={validationErrors.cafe_mobile_number}
              required
            />
          </Grid>
          <Grid size={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allow_login}
                  onChange={handleCheckboxChange}
                  name="allow_login"
                />
              }
              label="Allow Login"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allow_menu_edit}
                  onChange={handleCheckboxChange}
                  name="allow_menu_edit"
                />
              }
              label="Allow Menu Edit"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allow_order}
                  onChange={handleCheckboxChange}
                  name="allow_order"
                />
              }
              label="Allow Order"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allow_qr_edit}
                  onChange={handleCheckboxChange}
                  name="allow_qr_edit"
                />
              }
              label="Allow QR Edit"
            />
          </Grid>
        </Grid>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ position: "relative" }}
            aria-live="polite"
          >
            {loading ? (
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                }}
              />
            ) : (
              "Add Restaurant"
            )}
          </Button>
          <Button onClick={onClose} sx={{ ml: 2 }}>
            Cancel
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default AddRestaurant;