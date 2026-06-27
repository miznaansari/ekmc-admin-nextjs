// CitySearch.jsx
import React, { useEffect, useState, useCallback } from "react";
import { TextField, Autocomplete, CircularProgress } from "@mui/material";
import instanceV1 from "../../restaurant/authaxios";

const CitySearch = ({ cityName, setCityId }) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const token = localStorage.getItem("authToken");

  // fetch cities by search text
  const fetchCities = useCallback(
    async (search, fromProps = false) => {
      if (!search || search.length < 2) {
        setOptions([]);
        return;
      }
      try {
        setLoading(true);
        const res = await instanceV1(token).get(
          `/api/admin/onboard/v1/cities?search=${search}`
        );
        if (res?.data?.status) {
          setOptions(res.data.data);

          // if initial cityName from props → do exact match
          if (fromProps && cityName) {
            const match = res.data.data.find(
              (c) =>
                c.city_name.trim().toLowerCase() ===
                cityName.trim().toLowerCase()
            );
            if (match) {
              setSelectedCity(match);
              setInputValue(match.city_name);
              setCityId(match.city_id);
            } else {
              setSelectedCity(null);
              setInputValue("");
            }
          }
        } else {
          setOptions([]);
        }
      } catch (err) {
        console.error("City search failed", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    },
    [token, cityName, setCityId]
  );

  // debounce user typing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue && !selectedCity) {
        fetchCities(inputValue, false);
      }
    }, 800);
    return () => clearTimeout(handler);
  }, [inputValue, fetchCities, selectedCity]);

  // initial load if cityName is given
  useEffect(() => {
    if (cityName) {
      setInputValue(cityName);
      fetchCities(cityName, true);
    } else {
      setSelectedCity(null);
      setInputValue("");
      setOptions([]);
    }
  }, [cityName, fetchCities]);

  return (
    <Autocomplete
      fullWidth
      size="small"
      options={options}
      loading={loading}
      value={selectedCity}
      getOptionLabel={(option) => option?.city_name || ""}
      isOptionEqualToValue={(option, value) =>
        option.city_id === value.city_id
      }
      noOptionsText="No city found"
      onChange={(e, newValue) => {
        if (newValue) {
          setSelectedCity(newValue);
          setCityId(newValue.city_id);
        } else {
          setSelectedCity(null);
          setCityId(null);
        }
      }}
      inputValue={inputValue}
      onInputChange={(e, newInputValue) => {
        setInputValue(newInputValue);
        if (!newInputValue) {
          setSelectedCity(null);
          setOptions([]);
        }
      }}
      renderInput={(params) => {
        console.log("Autocomplete renderInput params:", params);
        const inputProps = params.InputProps || params.slotProps?.input;
        const endAdornment = inputProps?.endAdornment;
        const customInputProps = {
          ...inputProps,
          endAdornment: (
            <>
              {loading ? <CircularProgress size={20} /> : null}
              {endAdornment}
            </>
          ),
        };
        return (
          <TextField
            {...params}
            fullWidth
            size="small"
            label="Search City"
            placeholder="No city selected"
            variant="outlined"
            {...(params.InputProps ? { InputProps: customInputProps } : { slotProps: { input: customInputProps } })}
          />
        );
      }}
    />
  );
};

export default CitySearch;
