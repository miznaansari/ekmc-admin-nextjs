import { Grid, TextField, Button, Autocomplete, InputAdornment, IconButton } from "@mui/material";
import { Search, MyLocation, Clear } from "@mui/icons-material";
import CitySearch from "./CitySearch";
import { useEffect } from "react";

const AddressInfoForm = ({
    data,
    setData,
    pincode,
    setPinCode,
    isOffline,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    getPlaceDetails,
    getCurrentLocation,
    submitData,
    cityId, setCityId
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        console.log(data.city)
    }, [data])

    return (
        <Grid container spacing={2}>
            <Grid size={6}>
                <TextField
                    label="Address 1"
                    name="address_1"
                    value={data.address_1}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    disabled={isOffline}
                />
            </Grid>
            <Grid size={6}>
                <TextField
                    label="Address 2"
                    name="address_2"
                    value={data.address_2}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    disabled={isOffline}
                />
            </Grid>
            <Grid size={6}>
                <CitySearch cityName={data.city} cityId={58126} setCityId={setCityId} />
            </Grid>
            <Grid size={6}>
                <TextField
                    label="Pincode"
                    value={pincode}
                    onChange={(e) => setPinCode(e.target.value)}
                    fullWidth
                    size="small"
                    disabled={isOffline}
                />
            </Grid>
            <Grid size={12}>
                <Autocomplete
                    fullWidth
                    freeSolo
                    options={searchResults}
                    getOptionLabel={(o) => o.title || ""}
                    loading={isSearching}
                    onInputChange={(e, v) => setSearchQuery(v)}
                    onChange={(e, v) => { if (v) getPlaceDetails(v.placeId); }}
                    inputValue={searchQuery}
                    renderInput={(params) => {
                        const inputProps = params.InputProps || params.slotProps?.input;
                        const endAdornment = inputProps?.endAdornment;
                        const customInputProps = {
                            ...inputProps,
                            startAdornment: (
                                <>
                                    <InputAdornment position="start"><Search /></InputAdornment>
                                    {inputProps?.startAdornment}
                                </>
                            ),
                            endAdornment: (
                                <>
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={getCurrentLocation} disabled={isOffline}><MyLocation /></IconButton>
                                        {searchQuery && <IconButton size="small" onClick={() => setSearchQuery("")}><Clear /></IconButton>}
                                    </InputAdornment>
                                    {endAdornment}
                                </>
                            )
                        };
                        return (
                            <TextField
                                {...params}
                                label="Location on Map"
                                size="small"
                                disabled={isOffline}
                                {...(params.InputProps ? { InputProps: customInputProps } : { slotProps: { input: customInputProps } })}
                            />
                        );
                    }}
                />
            </Grid>
            <Grid size={12}>
                <Button variant="contained" onClick={submitData} disabled={isOffline}>Save</Button>
            </Grid>
        </Grid>
    );
};

export default AddressInfoForm;
