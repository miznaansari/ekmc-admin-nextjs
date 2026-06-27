import { useState, useEffect } from "react";
import {
  Box,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import Outline from "../../../Components/Button/Outline";
import TextArea from "../../../Components/FormFields/TextArea";
import RadioField from "../../../Components/FormFields/Radio";
import Spinner from "../../../Components/Progress/Spinner";
import SucessModal from "../../../Components/Modal/SucessModal";
import ErrorText from "../../../Components/ErrorText";
import cafe_profile from "../../../utils/OfflineData/cafe_profile.json";
import { lastUpdatedAtDateToUTC } from "../../../utils/ConvertTime";
import { db } from "../../../db/schema";

const RestaurantSetting = () => {
  const [data, setData] = useState({});
  const [upiId, setUpiId] = useState();
  const [, setIsUpi] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [, setUpdated] = useState();
  const [errors, setErrors] = useState({
    zomato: "",
    swiggy: "",
  });

  const CurrencyOptions = ["INR", "USD", "EURO"];
  const LanguageOptions = ["ENGLISH", "HINDI"];

  const RadioList = [
    {
      value: 1,
      label: "Yes",
    },
    {
      value: 0,
      label: "No",
    },
  ];

  const handleRadioChange = (field) => (event) => {
    // console.log(e.target.value)
    const events = parseInt(event.target.value, 10);
    handleDataChange(field, events);
  };

  const handleTextArea = (field) => (event) => {
    const value = parseInt(event.target.value);
    handleDataChange(field, value);

    setErrors({
      zomato: "",
      swiggy: "",
    });
  };

  const getRestaurantSettingData = async () => {
    try {
      const allProfiles = await db.database.cafe_profile.toArray();

      if (allProfiles.length === 0) {
        // No data in IndexedDB, store from JSON file
        const initialData = cafe_profile;
        const upi_id = initialData?.upi_id;
        setData(initialData);
        setUpiId(upi_id);
        if (upi_id?.length > 0) {
          setIsUpi(true);
        }

        // Save data to IndexedDB
        await db.database.cafe_profile.add({
          ...initialData,
          is_dirty: false,
          is_modified: true,
          last_updated_at: lastUpdatedAtDateToUTC(),
        });
      } else {
        // Use data from IndexedDB
        const result = allProfiles[0];
        setData(result);
        setUpiId(result?.upi_id);
        if (result?.upi_id?.length > 0) {
          setIsUpi(true);
        }
      }
    } catch (error) {
      console.error("Error fetching/storing data in IndexedDB:", error);
    }
  };

  const handleDataChange = (field, value) => {
    setData((prevData) => {
      const updatedData = {
        ...prevData,
        [field]: value,
        is_dirty: false,
        is_modified: true,
        last_updated_at: lastUpdatedAtDateToUTC(),
      };
      // updateIndexedDB(updatedData);
      return updatedData;
    });
    setFormChanged(true);
  };

  const updateIndexedDB = async (updatedData) => {
    try {
      // Clear existing data
      await db.database.cafe_profile.clear();

      // Add new data
      await db.database.cafe_profile.add(updatedData);

      //console.log("IndexedDB updated successfully!");
    } catch (error) {
      console.error("Error updating IndexedDB:", error);
    }
  };

  const handleRestaurantSettingData = async () => {
    // const newInstance = instanceV1(token);
    if (!formChanged) return;

    try {
      setUpdated(null);
      setSuccessModalOpen(false);
      // Save changes to IndexedDB first
      const updatedData = {
        ...data,
        is_dirty: false,
        is_modified: true,
        last_updated_at: lastUpdatedAtDateToUTC(),
      }; // Mark data as dirty
      // alert(JSON.stringify(updatedData))
      await updateIndexedDB(updatedData);

      setUpdated("Updated Successfully !!");
      setSuccessModalOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleZomatoCommission = async () => {
    // const newInstance = instanceV1(token);
    if (!data?.zomato_commission) {
      setErrors({ ...errors, zomato: "Commission is required" });
      return;
    }
    try {
      const updatedData = { ...data };
      delete updatedData.zomato_commison;
      updatedData.upi_id = upiId;
      updatedData.is_dirty = false;
      updatedData.is_modified = true;
      updatedData.last_updated_at = lastUpdatedAtDateToUTC();
      await updateIndexedDB(updatedData);
      setSuccessModalOpen(true);
    } catch (error) {
      //console.log("Error updating Zomato commission:", error);
    }
  };

  const handleSwiggyCommission = async () => {
    // const newInstance = instanceV1(token);
    if (!data?.swiggy_commission) {
      setErrors({ ...errors, swiggy: "Commission is required" });
      return;
    }
    try {
      const updatedData = { ...data };
      delete updatedData.swiggy_commision;
      updatedData.upi_id = upiId;
      updatedData.is_dirty = false;
      updatedData.is_modified = true;
      updatedData.last_updated_at = lastUpdatedAtDateToUTC();
      await updateIndexedDB(updatedData);

      setSuccessModalOpen(true);
    } catch (error) {
      //console.log("Error updating Swiggy commission:", error);
    }
  };

  useEffect(() => {
    getRestaurantSettingData();
  }, []);

  useEffect(() => {
    // Update the currency and language values when data changes
    if (data?.currency && !CurrencyOptions.includes(data?.currency)) {
      // Find the index of the matched currency in the CurrencyOptions array
      const currencyIndex = CurrencyOptions.indexOf(data?.currency);

      // If the currency is found in the array, set it as the initial value
      if (currencyIndex !== -1) {
        setData((prevData) => ({
          ...prevData,
          currency: CurrencyOptions[currencyIndex],
        }));
      }
    }

    if (data?.language && !LanguageOptions.includes(data?.language)) {
      // Find the index of the matched language in the LanguageOptions array
      const languageIndex = LanguageOptions.indexOf(data?.language);

      // If the language is found in the array, set it as the initial value
      if (languageIndex !== -1) {
        setData((prevData) => ({
          ...prevData,
          language: LanguageOptions[languageIndex],
        }));
      }
    }
  }, [data, CurrencyOptions, LanguageOptions]);

  return (
    <div>
      {data?.length === 0 ? (
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
        <Grid container>
          <Grid
            container
            alignItems="center"
            display={"flex"}
            flexWrap={"wrap"}
          >
            <Grid size={{ xs: 12, sm: 3 }} mb={"12px"}>
              Currency
            </Grid>
            <Grid size={{ xs: 12, sm: 5, md: 4.34 }}>
              <FormControl fullWidth>
                <Select
                  disabled
                  sx={{
                    textAlign: "center",
                  }}
                  id="demo-simple-select"
                  value={data?.currency || CurrencyOptions[0]} // Set the initial value based on API data
                  onChange={(value) => setData({ ...data, currency: value })}
                >
                  {CurrencyOptions.map((item, indx) => (
                    <MenuItem key={indx} value={CurrencyOptions[indx]}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Divider
            orientation="horizontal"
            sx={{ width: "66.5%", marginBottom: "20px", marginTop: "20px" }}
          />
          <Grid container display={"flex"} flexWrap={"wrap"} size={12}>
            <Grid size={{ xs: 12, sm: 3 }} mb={"20px"}>
              <Typography>Zomato Available</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 8, md: 8 }}>
              <Box sx={{ mb: "12px" }}>
                <RadioField
                  arr={RadioList}
                  value={data?.is_zomato ? data?.is_zomato : 0}
                  onChange={handleRadioChange("is_zomato")}
                />
              </Box>
              <Grid display={"flex"} gap={1}>
                <Grid
                  size={{
                    xs: 8,
                    sm: 4
                  }}>
                  <TextArea
                    InputProps={{
                      inputProps: {
                        type: "Number",
                        min: 0,
                        max: 100,
                      },
                    }}
                    sx={{ width: "100%" }}
                    placeholder={"Commision"}
                    disabled={data?.is_zomato ? data?.is_zomato == 0 : true}
                    value={
                      data?.zomato_commission > 0 ? data?.zomato_commission : ""
                    }
                    onChange={handleTextArea("zomato_commission")}
                  />
                </Grid>

                <Box
                  xs={2.5}
                  onClick={async () => await handleZomatoCommission()}
                >
                  <Outline
                    disabled={data?.is_zomato ? data?.is_zomato == 0 : true}
                    style={{
                      borderRadius: "var(--radius-md, 8px)",
                      background:
                        data?.is_zomato == 0
                          ? "var(--Text-Grey_50, #CBCBCB)"
                          : "#00CF63",
                      boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                      color: "white",
                      border: "0px solid black",
                      fontSize: "14px",
                      Outline: "none !important",
                    }}
                    color={"#CBCBCB"}
                    type={"outline"}
                    value={"Update Menu Price"}
                  />
                </Box>
              </Grid>
              {errors.zomato && <ErrorText value={errors.zomato} />}
            </Grid>
          </Grid>
          <Divider
            orientation="horizontal"
            sx={{ width: "66.5%", marginBottom: "20px", marginTop: "20px" }}
          />

          <Grid container display={"flex"} flexWrap={"wrap"} size={12}>
            <Grid size={{ xs: 12, sm: 3 }} mb={"20px"}>
              Swiggy Available
            </Grid>
            <Grid size={{ xs: 12, sm: 8, md: 8 }}>
              <Box sx={{ mb: "12px" }}>
                <RadioField
                  arr={RadioList}
                  value={data?.is_swiggy ? data?.is_swiggy : 0}
                  onChange={handleRadioChange("is_swiggy")}
                />
              </Box>
              <Grid display={"flex"} gap={1}>
                <Grid
                  size={{
                    xs: 8,
                    sm: 4
                  }}>
                  <TextArea
                    InputProps={{
                      inputProps: {
                        type: "Number",
                        min: 0,
                        max: 100,
                      },
                    }}
                    // type={"Number"}
                    placeholder={"Commision"}
                    disabled={data?.is_swiggy ? data?.is_swiggy == 0 : true}
                    value={
                      (data?.swiggy_commission && data?.swiggy_commission) || ""
                    }
                    onChange={handleTextArea("swiggy_commission")}
                  />
                </Grid>

                <Box
                  xs={2.5}
                  onClick={async () => await handleSwiggyCommission()}
                >
                  <Outline
                    disabled={data?.is_swiggy ? data?.is_swiggy == 0 : true}
                    style={{
                      borderRadius: "var(--radius-md, 8px)",
                      background:
                        data?.is_swiggy == 0
                          ? "var(--Text-Grey_50, #CBCBCB)"
                          : "#00CF63",
                      boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                      color: "white",
                      border: "0px solid black",
                      fontSize: "14px",
                      Outline: "none !important",
                    }}
                    color={"#CBCBCB"}
                    type={"outline"}
                    value={"Update Menu Price"}
                  />
                </Box>
              </Grid>
              {errors.swiggy && <ErrorText value={errors.swiggy} />}
            </Grid>
          </Grid>
          <Divider
            orientation="horizontal"
            sx={{ width: "66.5%", marginBottom: "20px", marginTop: "20px" }}
          />

          <Grid container display={"flex"} flexWrap={"wrap"}>
            <Grid size={{ xs: 12, sm: 12, md: 3 }} mb={"10px"}>
              Takeaway Available
            </Grid>
            <Grid>
              <Grid display={"flex"}>
                <RadioField
                  arr={RadioList}
                  value={data?.is_takeaway ? data?.is_takeaway : 0}
                  onChange={handleRadioChange("is_takeaway")}
                />
              </Grid>
            </Grid>
          </Grid>
          <Divider
            orientation="horizontal"
            sx={{ width: "66.5%", marginBottom: "20px", marginTop: "20px" }}
          />

          <Grid container display={"flex"} flexWrap={"wrap"}>
            <Grid size={{ xs: 12, sm: 12, md: 3 }} mb={"10px"}>
              Dine-in Available
            </Grid>
            <Grid>
              <Grid display={"flex"}>
                <RadioField
                  arr={RadioList}
                  value={data?.is_dinein ? data?.is_dinein : 0}
                  onChange={handleRadioChange("is_dinein")}
                />
              </Grid>
            </Grid>
          </Grid>
          <Divider
            orientation="horizontal"
            sx={{ width: "66.5%", marginBottom: "20px", marginTop: "20px" }}
          />
          <Grid container display={"flex"} flexWrap={"wrap"}>
            <Grid size={{ xs: 12, sm: 12, md: 3 }} mb={"10px"}>
              Upi Id
            </Grid>
            <Grid>
              <Grid display={"flex"}>
                <TextArea
                  placeholder={"upi_id"}
                  value={data.upi_id || ""}
                  onChange={(e) => {
                    setData({ ...data, upi_id: e.target.value });
                    setFormChanged(true);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Divider
            orientation="horizontal"
            sx={{ width: "66.5%", marginBottom: "20px", marginTop: "20px" }}
          />

          <Grid container display="flex" flexWrap={"wrap"} alignItems="Center">
            <Grid size={{ xs: 12, sm: 3 }} mb={"10px"}>
              Language
            </Grid>
            <Grid size={{ xs: 12, sm: 5, md: 4.34 }}>
              <FormControl fullWidth>
                <Select
                  disabled
                  sx={{
                    textAlign: "center",
                  }}
                  id="demo-simple-select"
                  value={data?.language || LanguageOptions[0]} // Set the initial value based on API data
                  onChange={(value) => setData({ ...data, language: value })}
                >
                  {LanguageOptions.map((item, indx) => (
                    <MenuItem key={indx} value={LanguageOptions[indx]}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Divider
            orientation="horizontal"
            sx={{ width: "66.5%", marginBottom: "10px", marginTop: "20px" }}
          />
          <Grid container display={"flex"} flexWrap={"wrap"} size={12}>
            <Grid size={{ xs: 12, sm: 3 }} mb={"20px"}>
              Radius
            </Grid>
            <Grid size={{ xs: 12, sm: 8, md: 8 }}>
              <Box sx={{ mb: "12px" }}>
                <RadioField
                  arr={RadioList}
                  value={
                    data?.is_user_location_required
                      ? data?.is_user_location_required
                      : 0
                  }
                  onChange={handleRadioChange("is_user_location_required")}
                />
              </Box>
              <Grid display={"flex"} gap={1}>
                <Grid size={{ xs: 12, sm: 8, md: 4.34 }}>
                  <TextArea
                    endadornment="Meter"
                    placeholder={"Enter Radius in meter"}
                    disabled={!data.is_user_location_required}
                    value={data.cafe_detection_radius || ""}
                    onChange={(e) => {
                      setData({
                        ...data,
                        cafe_detection_radius: e.target.value,
                      });
                      setFormChanged(true);
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider
            orientation="horizontal"
            sx={{ width: "66.5%", marginBottom: "20px", marginTop: "20px" }}
          />

          <Grid
            container
            marginTop={1}
            marginBottom={20}
            display={"flex"}
            gap={2}
          >
            <Grid size={{ xs: 12, sm: 3 }}>
              <Outline
                style={{
                  display: "flex",
                  width: "100%",
                  padding: "10px 16px", // Fallback padding if the custom variable is not defined
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "6px", // Fallback gap if the custom variable is not defined
                  flexShrink: "0",
                  borderRadius: "8px", // Fallback radius if the custom variable is not defined
                  border: "1px solid #D0D5DD", // Fallback border color if the custom variable is not defined
                  background: "#FFF", // Fallback background color if the custom variable is not defined
                  boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                  color: "#344054",
                }}
                color={"#D0D5DD"}
                type={"outline"}
                value={"Cancel"}
                width={"181px"}
              />{" "}
            </Grid>
            <Grid
              size={12}
              onClick={async () => await handleRestaurantSettingData()}
              size={{
                sm: 3
              }}>
              <Outline
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid #00CF63",
                  background: "#00CF63",
                  boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                  color: "#FFF", // Fallback color if the custom variable is not defined
                  // fontFamily: 'Inter',
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: "600",
                  lineHeight: "24px",
                }}
                disabled={!formChanged}
                color={"rgba(16, 24, 40, 0.05)"}
                type={"outline"}
                value={"Save Changes"}
                width={"100%"}
              />
            </Grid>
          </Grid>

          {/* Success Modal */}
          {successModalOpen && (
            <SucessModal
              open={successModalOpen}
              onClose={() => setSuccessModalOpen(false)}
              message={"Changes Done Sucessfully"}
            />
          )}
        </Grid>
      )}
    </div>
  );
};

export default RestaurantSetting;
