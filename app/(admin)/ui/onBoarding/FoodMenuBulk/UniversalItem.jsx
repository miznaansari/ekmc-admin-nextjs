import React, { useEffect, useState } from "react";
import { Box, TextField, Autocomplete } from "@mui/material";
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";


export default function UniversalItem({
  label = "Universal Item",
  value,
  onChange,

}) {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search);


  useEffect(() => {
    console.log('value', value)
  }, [value])

  const token = localStorage.getItem("authToken");
  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  useEffect(() => {
    const fetchItems = async () => {
      if (!debouncedSearch) {
        setOptions([]);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${baseurl}/api/v1/universal-item`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { s: debouncedSearch },
        });
        const data =
          res.data?.data?.data?.map((it) => ({
            label: it.item_name,
            value: it.id,
          })) || [];
        setOptions(data);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [debouncedSearch, baseurl, token]);

  const withAddNew = (options, inputValue) => {
    if (!inputValue.trim() || loading || search !== debouncedSearch) return options;
    const exact = options.find(
      (o) => o.label.toLowerCase() === inputValue.toLowerCase()
    );
    return exact
      ? options
      : [
        ...options,
        {
          label: `Add new "${inputValue}"`,
          value: `new-${Date.now()}`,
          isAddNew: true,
          newValue: inputValue,
        },
      ];
  };

  return (
    <Autocomplete
      options={withAddNew(options, search)}
      getOptionLabel={(o) => {
        if (!o) return ""; // handle null or undefined
        if (typeof o === "string") return o; // just in case a string sneaks in
        return o.label || ""; // fallback
      }}
      isOptionEqualToValue={(a, b) => a?.value === b?.value}
      value={value || null} // ensure null instead of undefined
      onChange={(_, opt) => onChange(opt)}
      onInputChange={(_, val) => setSearch(val)}
      renderInput={(params) => <TextField {...params} label={label} size="small" />}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            ...(option.isAddNew && {
              backgroundColor: "#e3f2fd",
              fontStyle: "italic",
              color: "#1976d2",
            }),
          }}
        >
          {option.label}
        </Box>
      )}
      clearOnEscape
      clearIcon={<span>×</span>}
    />

  );
}
