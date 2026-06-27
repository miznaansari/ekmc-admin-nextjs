import React, { useEffect, useState } from "react";
import {
    Button,
    Typography,
    Box,
    TextField,
    Grid,
    Paper,
    Checkbox,
    Snackbar,
    Alert,
    Collapse,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { Eggdsvg, Nonvegdsvg, Vegdsvg } from "../../restaurant/Sidebar";
import OwnerKyc from "./OwnerKyc";
import AdditionalInfo from "./AdditionalInfo";
import instanceV1 from "../../restaurant/authaxios";
import Autocomplete from "@mui/material/Autocomplete";
import useDebounce from "../../hooks/useDebounce"; // optional debounce hook

const DEFAULT_DATA = {
    cafe_name: "",
    city_name: "",
    cafe_email: "",
    cafe_slogan: "",
    cafe_mobile: "",
    owner_first_name: "",
    owner_last_name: "",
    owner_email: "",
    owner_mobile: "",
    price_range: "",
    is_veg: false,
    is_non_veg: false,
    is_egg: false,
};

const GeneralInfo = ({ datas, action, setAction, actionIdChanged, setMenuData, setActionIdChanged, setCafeName, setCompletedFields }) => {

    // ...
    const [isExistingCafe, setIsExistingCafe] = useState(false);

    useEffect(() => {
        setIsExistingCafe(!!datas);
    }, [datas]);
    const [selectedCafe, setSelectedCafe] = useState(null);

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [data, setData] = useState(DEFAULT_DATA);
    const [initialData, setInitialData] = useState(DEFAULT_DATA);

    useEffect(() => {
        console.log('data', data);
        // ...
    }, [data])
    useEffect(() => {
        console.log('initialData', initialData);
    }, [initialData])
    const [originalData, setOriginalData] = useState(DEFAULT_DATA);
    const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });
    const [cafes, setCafes] = useState([]);
    const [searchText, setSearchText] = useState("");
    const debouncedSearch = useDebounce(searchText, 300);
    const [loader, setLoader] = useState(false);

    // Preload data if exists
    useEffect(() => {
        if (datas) {
            const initialData = {
                ...DEFAULT_DATA,
                ...datas,
                cafe_mobile: datas?.cafe_mobile_number ?? "",
                price_range: datas?.cafe_price_range ?? "",
                city_name: datas?.city_name ?? "",
            };
            setData(initialData);
            setInitialData(initialData);
            setOriginalData(initialData);
        }
    }, [datas]);


    useEffect(() => {
        // console.log('isExistingCafe,isExistingCafe',isExistingCafe);
    }, [isExistingCafe]);

    const isReadOnly = isExistingCafe;
    // console.log('isExistingCafe,isExistingCafe',isExistingCafe);



    // Online/offline detection
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    // Fetch cafe list when user types
    useEffect(() => {
        const fetchCafes = async () => {
            if (!debouncedSearch) return;
            try {
                const token = localStorage.getItem("authToken");
                const instance = instanceV1(token);
                const res = await instance.get("/api/admin/onboard/v1/onboard-cafe", {
                    params: { search: debouncedSearch },
                });
                if (res.data.status) setCafes(res.data.data);
            } catch (err) {
                console.error("Failed to fetch cafes", err);
            }
        };
        fetchCafes();
    }, [debouncedSearch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
        if (name === "cafe_name") setSearchText(value);
    };

    const handleCafeSelect = (event, selectedCafe) => {
        if (!selectedCafe) return;

        setIsExistingCafe(true); // ✅ existing

        setData({
            ...DEFAULT_DATA,
            cafe_name: selectedCafe.cafe_name,
            city_name: selectedCafe.city_name || "",
        });

        setOriginalData({
            ...DEFAULT_DATA,
            cafe_name: selectedCafe.cafe_name,
            city_name: selectedCafe.city_name || "",
        });

        localStorage.setItem("cafeListId", selectedCafe.cafe_list_id);
        localStorage.setItem("cafeName", selectedCafe.cafe_name);
        setActionIdChanged((prev) => !prev);
    };


    const handleCheckboxChange = (name) => (e) => {
        setData((prev) => ({ ...prev, [name]: e.target.checked }));
    };

    const showAlert = (severity, message) => {
        setAlert({ open: true, severity, message });
        setTimeout(() => setAlert((prev) => ({ ...prev, open: false })), 4000);
    };

    const isDataModified = JSON.stringify(data) !== JSON.stringify(originalData);

    const handleSave = async () => {
        // Additional manual validation (optional)
        if (!data.owner_email) {
            showAlert("error", "Owner email is required");
            return;
        }
        if (!data.owner_mobile || !/^\d{10}$/.test(data.owner_mobile)) {
            showAlert("error", "Owner phone must be 10 digits");
            return;
        }

        setLoader(true);
        try {

            const token = localStorage.getItem("authToken");
            const instance = instanceV1(token);
            const payload = initialData.cafe?.id
                ? {
                    cafe_list_id: initialData.cafe.id,

                    ...(initialData.cafe_slogan === null ||
                        initialData.cafe_slogan === ""
                        ? { cafe_slogan: data.cafe_slogan }
                        : {}),

                    ...(initialData.cafe_email === null ||
                        initialData.cafe_email === ""
                        ? { cafe_email: data.cafe_email }
                        : {}),

                    ...(initialData.cafe_mobile === null ||
                        initialData.cafe_mobile === ""
                        ? { cafe_mobile: data.cafe_mobile }
                        : {}),

                    ...(initialData.owner_first_name === null ||
                        initialData.owner_first_name === ""
                        ? { owner_first_name: data.owner_first_name }
                        : {}),

                    ...(initialData.owner_last_name === null ||
                        initialData.owner_last_name === ""
                        ? { owner_last_name: data.owner_last_name }
                        : {}),

                    ...(initialData.owner_email === null ||
                        initialData.owner_email === ""
                        ? { owner_email: data.owner_email }
                        : {}),

                    ...(initialData.owner_mobile === null ||
                        initialData.owner_mobile === ""
                        ? { owner_mobile: data.owner_mobile }
                        : {}),

                    ...(initialData.price_range === null ||
                        initialData.price_range === ""
                        ? { price_range: data.price_range }
                        : {}),

                    ...(!initialData.is_non_veg && !initialData.is_veg && !initialData.is_egg
                        ? {
                            is_veg: data.is_veg,
                            is_non_veg: data.is_non_veg,
                            is_egg: data.is_egg,
                        }
                        : {}),
                }
                : data;
            const res = await instance.post("/api/admin/onboard/v1/cafe", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.setItem("cafeListId", res.data.cafe_list_id);
            localStorage.setItem("cafeName", data.cafe_name);
            setAction(() => !action);
            setActionIdChanged(() => !actionIdChanged);
            setOriginalData({ ...data });
            showAlert("success", "Saved successfully!");
        } catch (err) {
            // console.log(err.response);
            showAlert("error", err.response?.data?.msg || "Failed to save data.");
        } finally {
            setLoader(false);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ p: 2, width: "100%" }}>
                <Typography variant="h5">General Info</Typography>

                <Collapse in={alert.open}>
                    <Snackbar
                        open={alert.open}
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                        sx={{ mt: 2 }}
                    >
                        <Alert severity={alert.severity} sx={{ width: "100%" }}>
                            {alert.message}
                        </Alert>
                    </Snackbar>
                </Collapse>

                {/* Wrap fields in a form to enable native HTML5 validation */}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSave();
                    }}
                >
                    <Grid container spacing={2} mt={1}>
                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <Autocomplete
                                freeSolo
                                options={cafes}
                                getOptionLabel={(option) =>
                                    typeof option === "string" ? option : option.cafe_name
                                }
                                renderOption={(props, option) => (
                                    <li {...props} key={option.cafe_list_id}>
                                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                                            <Typography>{option.cafe_name}</Typography>
                                            {option.city_name ? (
                                                <Typography variant="body2" color="text.secondary">
                                                    {option.city_name}
                                                </Typography>
                                            ) : null}
                                        </Box>
                                    </li>
                                )}
                                onInputChange={(event, value, reason) => {
                                    setSearchText(value);

                                    // ❌ Ignore automatic calls on mount / reset
                                    if (reason !== "input") return;

                                    const exists = cafes.some(
                                        (cafe) => cafe.cafe_name.toLowerCase() === value.toLowerCase()
                                    );

                                    if (!exists && value.trim() !== "") {
                                        // 🆕 USER TYPED A NEW RESTAURANT
                                        setIsExistingCafe(false);
                                        setMenuData([]);
                                        setData({
                                            ...DEFAULT_DATA,
                                            cafe_name: value,
                                            city_name: "",
                                        });
                                        setOriginalData(DEFAULT_DATA);
                                        setInitialData(DEFAULT_DATA);
                                        setCompletedFields([])
                                        localStorage.removeItem("cafeListId");
                                        localStorage.removeItem("cafeName");
                                        setCafeName(null);
                                    }
                                }}

                                onChange={handleCafeSelect}
                                value={data.cafe_name}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Restaurant Name"
                                        required
                                        size="small"
                                        fullWidth
                                        disabled={!isOnline}
                                    />
                                )}
                            />

                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            {/* <p>{data.cafe_slogan === ""? 'data.cafe_slogan' : 'null'}</p> */}
                            {/* {isReadOnly ?'true':'false'} */}
                            <TextField
                                size="small"
                                label="Slogan"
                                fullWidth
                                value={data.cafe_slogan}
                                name="cafe_slogan"
                                onChange={handleInputChange}
                                disabled={!initialData.cafe_slogan ? false : true || !isReadOnly}
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <TextField
                                size="small"
                                label="Public Email"
                                fullWidth
                                type="email"
                                value={data.cafe_email}
                                name="cafe_email"
                                required

                                onChange={handleInputChange}
                                disabled={!initialData.cafe_email ? false : true || !isReadOnly}

                            // disabled={isReadOnly || !isOnline}
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <TextField
                                size="small"
                                label="Public Phone Number"
                                fullWidth
                                required

                                value={data.cafe_mobile}
                                name="cafe_mobile"
                                onChange={(e) => {
                                    let value = e.target.value;

                                    // remove all non-digits (includes spaces)
                                    value = value.replace(/\D/g, "");

                                    // remove leading zero(s)
                                    value = value.replace(/^0+/, "");
                                    value = value.slice(0, 10);


                                    setData((prev) => ({
                                        ...prev,
                                        cafe_mobile: value,
                                    }));
                                }}
                                disabled={!initialData.cafe_mobile ? false : true || !isReadOnly}

                            // disabled={isReadOnly || !isOnline}
                            />

                        </Grid>

                        {/* Owner Fields */}
                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <TextField
                                size="small"
                                label="Owner First Name"
                                fullWidth
                                value={data.owner_first_name}
                                name="owner_first_name"
                                required
                                disabled={!initialData.owner_first_name ? false : true || !isReadOnly}

                                onChange={handleInputChange}
                            // disabled={isReadOnly || !isOnline}
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <TextField
                                size="small"
                                label="Owner Last Name"
                                fullWidth
                                value={data.owner_last_name}
                                name="owner_last_name"
                                onChange={handleInputChange}
                                required

                                // disabled={isReadOnly || !isOnline}
                                disabled={!initialData.owner_last_name ? false : true || !isReadOnly}

                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <TextField
                                size="small"
                                label="Owner Email"
                                fullWidth
                                type="email"
                                value={data.owner_email}
                                name="owner_email"
                                onChange={handleInputChange}
                                // disabled={isReadOnly || !isOnline}
                                disabled={!initialData.owner_email ? false : true || !isReadOnly}

                                required
                            />
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <TextField
                                size="small"
                                label="Owner Phone Number"
                                fullWidth
                                value={data.owner_mobile}
                                name="owner_mobile"
                                type="tel"
                                onChange={(e) => {
                                    let value = e.target.value;

                                    // remove non-digits
                                    value = value.replace(/\D/g, "");

                                    // remove leading zero(s)
                                    value = value.replace(/^0+/, "");

                                    // limit to 10 digits (IMPORTANT)
                                    value = value.slice(0, 10);

                                    setData((prev) => ({
                                        ...prev,
                                        owner_mobile: value,
                                    }));
                                }}

                                // disabled={isReadOnly || !isOnline}
                                disabled={!initialData.owner_mobile ? false : true || !isReadOnly}

                                required
                            />


                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                sm: 6
                            }}>
                            <FormControl fullWidth size="small" disabled={!initialData.price_range ? false : true || !isReadOnly}>
                                <InputLabel id="price-range-label">Price Range</InputLabel>
                                <Select
                                    labelId="price-range-label"
                                    id="price-range"
                                    value={data.price_range}
                                    name="price_range"
                                    label="Price Range"
                                    onChange={handleInputChange}
                                >
                                    <MenuItem value="">
                                        <em>Select Price Range</em>
                                    </MenuItem>
                                    <MenuItem value={1}>Affordable</MenuItem>
                                    <MenuItem value={2}>Moderate</MenuItem>
                                    <MenuItem value={3}>Expensive</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Typography variant="body1" mt={2}>
                        Food Type
                    </Typography>
                    <Grid container alignItems="center" spacing={1}>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Checkbox
                                checked={data.is_non_veg}
                                onChange={handleCheckboxChange("is_non_veg")}
                                disabled={(!initialData.is_non_veg && !initialData.is_veg && !initialData.is_egg) ? false : true || !isReadOnly}
                            />
                            <Nonvegdsvg />
                            <Typography>Non-Veg</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Checkbox
                                checked={data.is_veg}
                                onChange={handleCheckboxChange("is_veg")}
                                disabled={(!initialData.is_non_veg && !initialData.is_veg && !initialData.is_egg) ? false : true || !isReadOnly}
                            />
                            <Vegdsvg />
                            <Typography>Veg</Typography>
                        </Grid>
                        <Grid display="flex" alignItems="center" gap={1}>
                            <Checkbox
                                checked={data.is_egg}
                                onChange={handleCheckboxChange("is_egg")}
                                disabled={(!initialData.is_non_veg && !initialData.is_veg && !initialData.is_egg) ? false : true || !isReadOnly}
                            />
                            <Eggdsvg />
                            <Typography>Egg</Typography>
                        </Grid>
                    </Grid>

                    {/* Save button */}
                    <Box sx={{ display: "flex", mt: 2 }}>
                        <Button
                            type="submit" // triggers HTML5 validation
                            variant="contained"
                            disabled={!isDataModified || !isOnline || loader}
                            startIcon={loader ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {loader ? "Saving..." : "Save"}
                        </Button>
                    </Box>
                </form>
            </Paper>
            <OwnerKyc datas={datas} />
            <AdditionalInfo datas={datas} />
        </Box>
    );
};

export default GeneralInfo;
