import React, { useState } from 'react';
import {
    Typography, Grid, FormControl, InputLabel,
    Select, MenuItem, Paper, Box, Radio, RadioGroup,
    FormControlLabel, TextField, Button
} from "@mui/material";

const AddionalInfo = () => {


 


    const defaultData = {
        currency: "",
        is_dinein: "",
        is_takeaway: "",
        is_zomato_commission: "",
        is_swiggy_commission: "",
        is_zomato: "",
        is_swiggy: "",
        language: "",
        upi_id: "",
        name_at_bank: "",
        cafe_detection_radius: 500,
        is_user_location_required: true
    };

    const [data, setData] = useState(defaultData);
    const [originalData, setOriginalData] = useState(defaultData);
    const [isDataModified, setIsDataModified] = useState(false);

    const handleChange = (field) => (event) => {
        const newValue = event.target.value;
        setData(prev => ({ ...prev, [field]: newValue }));
        setIsDataModified(true);
    };

    const handleSave = () => {
        console.log("Saved Data:", data);
        setOriginalData(data);
        setIsDataModified(false);
        alert("Data saved successfully!");
    };

    const handleZomatoCommissionUpdate = () => {
        console.log("Zomato commission updated:", data.is_zomato_commission);
        alert("Zomato commission updated!");
    };

    const handleSwiggyCommissionUpdate = () => {
        console.log("Swiggy commission updated:", data.is_swiggy_commission);
        alert("Swiggy commission updated!");
    };

    return (
        <Paper sx={{ width: '100%' }}>
            <Box sx={{ width: "100%", p: 2 }}>
                <Typography variant="h5">Additional Info</Typography>

                <Grid container spacing={2} mt={2} mb={"16px"}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="currency-select-label">Currency</InputLabel>
                            <Select
                                labelId="currency-select-label"
                                value={data.currency}
                                label="Currency"
                                onChange={handleChange("currency")}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value="USD">USD</MenuItem>
                                <MenuItem value="EUR">EUR</MenuItem>
                                <MenuItem value="INR">INR</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="language-select-label">Language</InputLabel>
                            <Select
                                labelId="language-select-label"
                                value={data.language}
                                label="Language"
                                onChange={handleChange("language")}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem value="English">English</MenuItem>
                                <MenuItem value="es">Spanish</MenuItem>
                                <MenuItem value="fr">French</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Zomato Available */}
                <Typography variant="body1">Zomato Available</Typography>
                <RadioGroup row value={data.is_zomato} onChange={handleChange("is_zomato")}>
                    <FormControlLabel value="yes" control={<Radio color="secondary" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio color="secondary" />} label="No" />
                </RadioGroup>

                {/* Zomato Commission */}
                <Grid container spacing={2} mb={"16px"}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}>
                        <FormControl fullWidth size="small" disabled={data.is_zomato === "no"}>
                            <TextField
                                disabled={data.is_zomato === "no"}
                                label="Zomato Commission"
                                value={data.is_zomato_commission || ""}
                                onChange={handleChange("is_zomato_commission")}
                                variant="outlined"
                                size="small"
                            />
                        </FormControl>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}>
                        <Button
                            variant='outlined'
                            disabled={data.is_zomato === "no"}
                            onClick={handleZomatoCommissionUpdate}
                        >
                            Update Zomato Commission
                        </Button>
                    </Grid>
                </Grid>

                {/* Swiggy Available */}
                <Typography variant="body1">Swiggy Available</Typography>
                <RadioGroup row value={data.is_swiggy} onChange={handleChange("is_swiggy")}>
                    <FormControlLabel value="yes" control={<Radio color="secondary" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio color="secondary" />} label="No" />
                </RadioGroup>

                {/* Swiggy Commission */}
                <Grid container spacing={2} mb={"16px"}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}>
                        <FormControl fullWidth size="small" disabled={data.is_swiggy === "no"}>
                            <TextField
                                disabled={data.is_swiggy === "no"}
                                label="Swiggy Commission"
                                value={data.is_swiggy_commission || ""}
                                onChange={handleChange("is_swiggy_commission")}
                                variant="outlined"
                                size="small"
                            />
                        </FormControl>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}>
                        <Button
                            variant='outlined'
                            disabled={data.is_swiggy === "no"}
                            onClick={handleSwiggyCommissionUpdate}
                        >
                            Update Swiggy Commission
                        </Button>
                    </Grid>
                </Grid>

                {/* Dine-in */}
                <Typography variant="body1">Dine-in Available</Typography>
                <RadioGroup row value={data.is_dinein} onChange={handleChange("is_dinein")}>
                    <FormControlLabel value="yes" control={<Radio color="secondary" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio color="secondary" />} label="No" />
                </RadioGroup>

                {/* Takeaway */}
                <Typography variant="body1">Takeaway Available</Typography>
                <RadioGroup row value={data.is_takeaway} onChange={handleChange("is_takeaway")}>
                    <FormControlLabel value="yes" control={<Radio color="secondary" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio color="secondary" />} label="No" />
                </RadioGroup>

                <Grid container spacing={2} mt={1}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}>
                        <TextField
                            label="UPI"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={data.upi_id}
                            onChange={handleChange("upi_id")}
                        />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            md: 6
                        }}>
                        <TextField
                            label="Name at Bank"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={data.name_at_bank}
                            onChange={handleChange("name_at_bank")}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: "flex", mt: 2 }}>
                    <Button variant="contained" onClick={handleSave} disabled={!isDataModified}>
                        Save
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default AddionalInfo;
