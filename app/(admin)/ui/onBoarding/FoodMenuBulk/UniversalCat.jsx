import React, { useEffect, useState } from "react";
import { Box, TextField, Autocomplete } from "@mui/material";
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function UniversalCat({
  label = "Universal Category",
  value,
  onChange,

}) {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(search);
  const token = localStorage.getItem("authToken");
  const baseurl = import.meta.env.VITE_REACT_APP_BACKEND_URL;
  useEffect(() => {
    const fetchCategories = async () => {
      if (!debouncedSearch) {
        setOptions([]);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${baseurl}/api/v1/universal-categories`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { s: debouncedSearch },
        });
        const data =
          res.data?.data?.data?.map((cat) => ({
            label: cat.category_name,
            value: cat.id,
            image: cat.uc_cf_480px_image_url || cat.uc_cf_720px_image_url || cat.uc_cf_1080px_image_url || cat.uc_cf_360px_image_url || cat.uc_cf_240px_image_url || cat.uc_cf_placeholder_image_url || null,
          })) || [];
        setOptions(data);
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
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
        if (!o) return ""; // handle null/undefined
        return o.label || ""; // fallback if label is missing
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              gap: 1.5,
            }}
          >
            <span>{option.label}</span>
            {option.isAddNew ? (
              <AddCircleOutlineIcon sx={{ color: "#1976d2", fontSize: 20 }} />
            ) : option.image ? (
              <Box
                component="img"
                src={option.image}
                alt={option.label}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "6px",
                  objectFit: "cover",
                  border: "1px solid #e0e0e0"
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "6px",
                  backgroundColor: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9e9e9e"
                }}
              >
                <FastfoodIcon sx={{ fontSize: 18 }} />
              </Box>
            )}
          </Box>
        </Box>
      )}
      clearOnEscape
      clearIcon={<span>×</span>}
    />

  );
}
