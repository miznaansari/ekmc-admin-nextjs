import React, { useEffect, useState } from "react";
import { Box, TextField, Autocomplete } from "@mui/material";
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";

export default function RestaurantSearch({ label = "Search Restaurant", value, onChange }) {
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);

    const token = localStorage.getItem("authToken");
    const baseurl = process.env.VITE_REACT_APP_BACKEND_URL;

    useEffect(() => {
        const fetchRestaurants = async () => {
            if (!debouncedSearch) return;

            try {
                const res = await axios.get(`${baseurl}/api/user/admin/cafe-list/get/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { s: debouncedSearch },
                });
                console.log(res.data.data)

                const data =
                    res.data?.data?.map((rest) => ({
                        label: rest.cafe_name,
                        value: rest.id,
                    })) || [];

                setOptions(data);
            } catch (err) {
                console.error("Error fetching restaurants:", err);
                setOptions([]);
            }
        };

        fetchRestaurants();
    }, [debouncedSearch, baseurl, token]);

    return (
        <Autocomplete
            options={options}
            getOptionLabel={(option) => option.label || ""}
            isOptionEqualToValue={(option, val) => option.value === val?.value}
            value={value || null} // must be null if nothing selected
            onChange={(_, newValue) => onChange(newValue)}
            inputValue={search}
            onInputChange={(_, newInputValue) => setSearch(newInputValue)}
            renderInput={(params) => <TextField {...params} label={label} size="small" />}
            clearOnEscape
            clearIcon={<span>×</span>}
            noOptionsText="No restaurant found"
        />
    );
}
