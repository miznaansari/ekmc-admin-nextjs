import { useEffect, useState } from "react";
import TextArea from "../../../Components/FormFields/TextArea";
import { Box, Divider, Grid, InputAdornment, Typography } from "@mui/material";
import RadioField from "../../../Components/FormFields/Radio";
import UploadCloudIcon from "../../../assets/Icons/RestaurantSettingIcon/UploadCloudIcon";
import Spinner from "../../../Components/Progress/Spinner";
import SuccessModal from "../../../Components/Modal/SucessModal";
import ErrorText from "../../../Components/ErrorText";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import PdfView from "../restaurant/PdfView";
import cafe_profile from "../../../utils/OfflineData/cafe_profile.json";
import { lastUpdatedAtDateToUTC } from "../../../utils/ConvertTime";
import Outline from "../../../Components/Button/Outline";
import { db } from "../../../db/schema";

const RestaurantDocuments = () => {
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const RadioList = [
    { value: 1, label: "Yes" },
    { value: 0, label: "No" },
  ];
  const [data, setData] = useState([]);
  const [taxationOption, setTaxationOption] = useState(0);
  const [fssaiOption, setFssaiOption] = useState(0);
  const [uploading, setUploading] = useState({
    tax_doc: false,
    fssai_doc: false,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [formChanged, setFormChanged] = useState(false);
  const [, setUpdated] = useState();

  const handleTaxationRadioChange = (event) => {
    setValidationErrors({
      ...validationErrors,
      gst_no: "",
      trade_name: "",
      legal_name: "",
      registered_on: "",
    });
    const is_tax = parseInt(event.target.value, 10);
    setTaxationOption(is_tax);
    handleDataChange("is_tax", is_tax);
  };

  const handleFssaiRadioChange = (event) => {
    setValidationErrors({
      ...validationErrors,
      fssai_no: "",
    });
    const is_fssai = parseInt(event.target.value, 10);

    setFssaiOption(is_fssai);
    handleDataChange("is_fssai", is_fssai);
  };

  const handleTextArea = (field) => (event) => {
    handleDataChange(field, event.target.value);
  };

  const getRestaurantDocumentsData = async () => {
    try {
      const allProfiles = await db.database.cafe_profile.toArray();

      if (allProfiles.length === 0) {
        // No data in IndexedDB, store from JSON file
        const initialData = cafe_profile[0];
        setData(initialData);
        setTaxationOption(initialData?.is_tax || 0);
        setFssaiOption(initialData?.is_fssai || 0);

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
        setTaxationOption(result?.is_tax || 0);
        setFssaiOption(result?.is_fssai || 0);
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

      // Set update message
      setUpdated("Updated Successfully !!");
    } catch (error) {
      console.error("Error updating IndexedDB:", error);
    }
  };
  useEffect(() => {
    getRestaurantDocumentsData();
  }, []);

  function formatDate(dateString, time = "18:30:00") {
    const [year, month, day] = dateString.split("-");
    const dateObj = new Date(`${year}-${month}-${day}T${time}`);
    return dateObj.toISOString();
  }

  const handleRestaurantDocumentsData = async () => {
    setValidationErrors({});
    const errors = {};
    if (taxationOption == 1) {
      if (!data?.gst_no.length) {
        errors.gst_no = "GST Number is required";
      }
      if (!data?.trade_name) {
        errors.trade_name = "Trade Name is required";
      }
      if (!data?.legal_name) {
        errors.legal_name = "Legal Name is required";
      }
      if (!data?.registered_on) {
        errors.registered_on = "Registered On is required";
      }
    }

    if (fssaiOption == 1) {
      if (!data.fssai_no) {
        errors.fssai_no = "FSSAI Licence Number is required";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    // setSaving(true)
    const originalDate = data?.registered_on
      ? new Date(data.registered_on)
      : null;
    const formattedDate =
      originalDate && originalDate?.toISOString()?.split("T")[0];
    const documentData = {
      ...data,
      registered_on: formatDate(formattedDate),
      is_dirty: false,
      is_modified: true,
      last_updated_at: lastUpdatedAtDateToUTC(),
    };

    updateIndexedDB(documentData);
    setSuccessModalOpen(true);
    // 3 seconds delay
  };

  const uploadTest = async (file, name) => {
    // //console.log("url_name", file.name)

    try {
      if (name == "fssai") {
        setUploading({
          fssai_doc: true,
          tax_doc: false,
        });
      }
      if (name == "taxation") {
        setUploading({
          fssai_doc: false,
          tax_doc: true,
        });
      }

      if (name === "fssai") {
        setData((prevData) => {
          const updatedData = {
            ...prevData,
            fssai_certificate_url: `https://eats-staging-bucket-v1.s3.ap-south-1.amazonaws.com/documents/${file?.name}`,
            is_dirty: false,
            is_modified: true,
            last_updated_at: lastUpdatedAtDateToUTC(),
          };
          updateIndexedDB(updatedData);
          return updatedData;
        });
      } else {
        setData((prevData) => {
          const updatedData = {
            ...prevData,
            // gst_certificate_url: j.data,
            gst_certificate_url: `https://eats-staging-bucket-v1.s3.ap-south-1.amazonaws.com/documents/${file?.name}`,
            is_dirty: false,
            is_modified: true,
            last_updated_at: lastUpdatedAtDateToUTC(),
          };
          updateIndexedDB(updatedData);
          return updatedData;
        });
      }
      setFormChanged(true);
      // props.onChange(j.data)
    } catch (err) {
      console.log(err);
    } finally {
      if (name == "fssai") {
        setUploading({
          ...uploading,
          fssai_doc: false,
        });
      } else {
        setUploading({
          ...uploading,
          tax_doc: false,
        });
      }
    }
  };

  const handleDateChange = (date) => {
    setData((prevData) => ({
      ...prevData,
      registered_on: date,
    }));
    setFormChanged(true);
  };

  return (
    <div>
      {
        <Grid container marginTop={2} display={"flex"} flexWrap={"wrap"}>
          <Grid
            display={"flex"}
            flexWrap={"wrap"}
            justifyContent={"space-between"}
            size={12}>
            <Box sx={{ width: "250px", mb: "20px" }}>
              <Typography>Taxation Details</Typography>
            </Box>
            <Grid size={{ xs: 12, sm: 9 }}>
              <RadioField
                arr={RadioList}
                onChange={handleTaxationRadioChange}
                value={taxationOption}
              />
              <Grid size={{ xs: 12, sm: 8, lg: 6 }}>
                <Box marginBottom={2}>
                  <TextArea
                    placeholder="GST Number"
                    InputProps={{
                      inputProps: {
                        type: "text",
                      },
                    }}
                    value={data?.gst_no || ""}
                    disabled={taxationOption == 0}
                    onChange={handleTextArea("gst_no")}
                  />
                  {validationErrors.gst_no && (
                    <ErrorText value={validationErrors.gst_no} />
                  )}
                </Box>
                <Box marginBottom={2}>
                  <TextArea
                    placeholder="Business Trade Name"
                    value={data?.trade_name || ""}
                    disabled={taxationOption == 0}
                    onChange={handleTextArea("trade_name")}
                  />

                  {validationErrors.trade_name && (
                    <ErrorText value={validationErrors.trade_name} />
                  )}
                </Box>
                <Box marginBottom={2}>
                  <TextArea
                    placeholder="Business Legal Name"
                    value={data?.legal_name || ""}
                    disabled={taxationOption == 0}
                    onChange={handleTextArea("legal_name")}
                  />

                  {validationErrors.legal_name && (
                    <ErrorText value={validationErrors.legal_name} />
                  )}
                </Box>
                <Box marginBottom={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={["DatePicker"]}>
                      <DatePicker
                        disabled={taxationOption == 0}
                        onChange={handleDateChange}
                        value={
                          data?.registered_on
                            ? dayjs(data?.registered_on)
                            : null
                        }
                        slotProps={{ textField: { size: "small" } }}
                        sx={{
                          backgroundColor:
                            taxationOption == 0 ? "#F7F7F7" : "transparent",
                          width: "100%",
                          height: "100%",
                          "& .MuiOutlinedInput-root": {
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#FFA943",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#FFA943",
                              border: "1px solid #FFA943",
                              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                            },
                          },
                          "& .MuiInputBase-input": {
                            color: "rgb(47 43 61 / 68%)",
                          },
                        }}
                      />
                    </DemoContainer>
                  </LocalizationProvider>

                  {validationErrors.registered_on && (
                    <ErrorText value={validationErrors.registered_on} />
                  )}
                </Box>
                <label
                  htmlFor="taxation-file-upload"
                  style={{
                    display: "block",
                    cursor: "pointer",
                    marginBottom: "16px",
                  }}
                >
                  <Grid
                    size={12}
                    component={Box}
                    width="100%"
                    height="100px"
                    bgcolor={taxationOption == 0 ? "#F7F7F7" : "transparent"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    borderRadius={"10px"}
                    border={
                      "1px solid var(--Colors-Border-border-primary, #D0D5DD)"
                    }>
                    <Box padding={"14px"} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                      <div
                        style={{
                          background: "transparent",
                          borderRadius: "8px",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <input
                          id="taxation-file-upload"
                          type="file"
                          hidden
                          accept=".pdf,.jpg,.jpeg,.png,image/*"
                          disabled={taxationOption == 0}
                          onChange={(e) => {
                            if (!uploading.tax_doc && e.target.files[0]) {
                              uploadTest(e.target.files[0], "taxation");
                            }
                          }}
                        />

                        <>
                          {uploading?.tax_doc ? (
                            <Spinner size={20} thickness={5} color={"Black"} />
                          ) : (
                            <>
                              <UploadCloudIcon />
                              <Box sx={{ display: "flex", gap: 1 }}>
                                <Typography
                                  style={{
                                    color: "var(--Secondary-Cyan_1, #00CF63)",
                                    
                                    fontSize: "14px",
                                    fontStyle: "normal",
                                    fontWeight: 600,
                                    lineHeight: "20px", // 142.857%
                                  }}
                                >
                                  Click to upload
                                </Typography>

                                <Typography
                                  style={{
                                    color: "#475467",
                                    
                                    fontSize: "14px",
                                    fontStyle: "normal",
                                    fontWeight: 400,
                                    lineHeight: "20px", // 142.857%
                                  }}
                                >
                                  or drag and drop
                                </Typography>
                              </Box>
                            </>
                          )}
                        </>
                      </div>
                    </Box>
                  </Grid>
                </label>
              </Grid>
              <Grid size={{ xs: 12, sm: 8, lg: 6 }}>
                <TextArea
                  value={
                    data?.gst_certificate_url
                      ? data?.gst_certificate_url.split("/").pop()
                      : ""
                  }
                  placeholder={"Uploaded Document "}
                  disabled={taxationOption == 0}
                  readOnly={true}
                  endAdornment={
                    <>
                      <Divider orientation="vertical" />
                      <InputAdornment position="end">
                        <PdfView
                          row={data.gst_certificate_url}
                          color={"#344054"}
                          disabled={taxationOption == 0}
                        />
                      </InputAdornment>
                    </>
                  }
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid
            size={{ xs: 12, sm: 6 }}
            size={{
              md: 7
            }}>
            {" "}
            <Divider
              orientation="horizontal"
              sx={{ width: "100%", marginBottom: "20px", marginTop: "20px" }}
            />
          </Grid>

          <Grid
            display={"flex"}
            flexWrap={"wrap"}
            justifyContent={"space-between"}
            size={12}>
            <Box sx={{ width: "250px", mb: "20px" }}>
              <Typography>FSSAI Certificate</Typography>
            </Box>
            <Grid size={{ xs: 12, sm: 9 }}>
              <RadioField
                arr={RadioList}
                onChange={handleFssaiRadioChange}
                value={fssaiOption}
              />
              <Grid size={{ xs: 12, sm: 8, lg: 6 }}>
                <TextArea
                  placeholder="Fassai Lic No"
                  InputProps={{
                    inputProps: {
                      type: "Text",
                    },
                  }}
                  value={data?.fssai_no || ""}
                  disabled={fssaiOption == 0}
                  onChange={handleTextArea("fssai_no")}
                />

                {validationErrors.fssai_no && (
                  <ErrorText value={validationErrors.fssai_no} />
                )}
                <label
                  htmlFor="fssai-file-upload"
                  style={{
                    display: "block",
                    cursor: "pointer",
                    marginBottom: "16px",
                  }}
                >
                  <Grid
                    size={12}
                    component={Box}
                    width="100%"
                    height="100px"
                    marginTop={3}
                    bgcolor={fssaiOption == 0 ? "#F7F7F7" : "transparent"}
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    borderRadius={"10px"}
                    border={
                      "1px solid var(--Colors-Border-border-primary, #D0D5DD)"
                    }>
                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                      <div
                        style={{
                          background: "transparent",
                          borderRadius: "8px",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <input
                          id="fssai-file-upload"
                          type="file"
                          accept=".pdf,image/*"
                          hidden
                          disabled={fssaiOption == 0}
                          onChange={(e) => {
                            if (!uploading.fssai_doc && e.target.files[0]) {
                              uploadTest(e.target.files[0], "fssai");
                            }
                          }}
                        />

                        {uploading?.fssai_doc ? (
                          <Spinner size={20} thickness={5} color={"Black"} />
                        ) : (
                          <>
                            <UploadCloudIcon />
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Typography
                                style={{
                                  color: "var(--Secondary-Cyan_1, #00CF63)",
                                  
                                  fontSize: "14px",
                                  fontStyle: "normal",
                                  fontWeight: 600,
                                  lineHeight: "20px", // 142.857%
                                }}
                              >
                                Click to upload
                              </Typography>

                              <Typography
                                style={{
                                  color: "#475467",
                                  
                                  fontSize: "14px",
                                  fontStyle: "normal",
                                  fontWeight: 400,
                                  lineHeight: "20px", // 142.857%
                                }}
                              >
                                or drag and drop
                              </Typography>
                            </Box>
                          </>
                        )}
                      </div>
                    </Box>
                  </Grid>
                </label>
              </Grid>
              <Grid size={{ xs: 12, sm: 8, lg: 6 }}>
                <TextArea
                  disabled={fssaiOption == 0}
                  value={
                    data?.fssai_certificate_url
                      ? data?.fssai_certificate_url.split("/").pop()
                      : ""
                  }
                  placeholder={"Uploaded Document "}
                  readOnly={true}
                  endAdornment={
                    <>
                      <Divider orientation="vertical" />
                      <InputAdornment position="end">
                        <PdfView
                          row={data?.fssai_certificate_url}
                          color={"#344054"}
                          disabled={fssaiOption == 0}
                        />
                      </InputAdornment>
                    </>
                  }
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 6 }}
            size={{
              md: 7
            }}>
            {" "}
            <Divider
              orientation="horizontal"
              sx={{ width: "100%", marginBottom: "20px", marginTop: "20px" }}
            />
          </Grid>

          <Grid
            container
            marginTop={1}
            marginBottom={20}
            display={"flex"}
            gap={2}
          >
            <Grid size={{ xs: 12, sm: 3.5, md: 2 }}>
              {" "}
              <Outline
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "6px",
                  flexShrink: "0",
                  borderRadius: "8px",
                  border: "1px solid #D0D5DD",
                  background: "#FFF",
                  boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                  color: "#344054",
                }}
                color={"#D0D5DD"}
                type={"outline"}
                value={"Cancel"}
                width={"100%"}
              />{" "}
            </Grid>
            <Grid size={{ xs: 12, sm: 3.5, md: 2 }}>
              <Outline
                disabled={!formChanged}
                handleClick={async () => await handleRestaurantDocumentsData()}
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: "1px solid #00CF63",
                  background: "#00CF63",
                  boxShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
                  color: "#FFF", // Fallback color if the custom variable is not defined
                  
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: "600",
                  lineHeight: "24px",
                }}
                color={"rgba(16, 24, 40, 0.05)"}
                type={"outline"}
                value={"Save Changes"}
                width={"100%"}
              />
            </Grid>
          </Grid>

          {successModalOpen && (
            <SuccessModal
              open={successModalOpen}
              onClose={() => setSuccessModalOpen(false)}
              message={"Changes Done Sucessfully"}
            />
          )}
        </Grid>
      }
    </div>
  );
};

export default RestaurantDocuments;
