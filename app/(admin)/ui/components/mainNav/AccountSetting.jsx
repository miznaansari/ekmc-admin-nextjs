import { useContext, useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  ThemeProvider,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";
import { Link } from "react-router-dom";
import Spinner from "../../restaurant/Spinner";
import ErrorText from "../../restaurant/ErrorText";
import Demo from "../../restaurant/Demo";

import Toast from "../../restaurant/Toast";
import Grid from "@mui/material/Grid";
import { useMemo } from "react";
import instanceV1 from "../../restaurant/authaxios";
import { DrawerContext } from "../../context/DrawerContext";

const AccountSetting = () => {
  const context = useContext(DrawerContext)
  const {action, setAction} = context;
  // const context = useContext(ekmcContext);
  // const { setAlert } = context;
  const [email, setEmail] = useState(localStorage.getItem("email") ?? '');
  const [mobileno, setMobileNo] = useState(localStorage.getItem("mobile_number") ?? '');
  const token = localStorage.getItem("authToken");
  const [password, set_password] = useState({
    current_password: "",
    new_password: "",
    gemini_api_key: "",
  });


 const [initialValues, setInitialValues] = useState({
  firstName: '',
  lastName: '',
  profile_pic: '',
});

useEffect(() => {
  setInitialValues({
    firstName: localStorage.getItem("firstName") ?? '',
    lastName: localStorage.getItem("lastName") ?? '',
    profile_pic: localStorage.getItem("profile_pic_image_id") ?? '',
  });
}, []);
  const [values, setValues] = useState(initialValues);
  useEffect(()=>{
setValues(initialValues)
  },[initialValues])

  const isModified = useMemo(() => {
    return (
      values.firstName !== initialValues.firstName ||
      values.lastName !== initialValues.lastName ||
      values.profile_pic !== initialValues.profile_pic
    );
  }, [values, initialValues]);

  const [loading, setLoading] = useState(false);
  const [ProfileLoading, setProfileLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // State to hold the selected image file
  const [errors, setErrors] = useState(null);
  const [first_name_error, setFirst_name_error] = useState([]);
  // const [first_name_error, setFirst_name_error] = useState([]);
  // const [first_name_error, setFirst_name_error] = useState([]);
  const [last_name_error, setLast_name_error] = useState([]);
  const [showToast, setShowToast] = useState(false); // State to control the visibility of the Toast
  const [toastMessage, setToastMessage] = useState("");

  const handleChangePassword = (e) => {
    set_password({ ...password, [e.target.name]: e.target.value });
    setErrors(null);
  };
  const handleSubmitPassword = async (e) => {
    //console.log('object')
    e.preventDefault();
    //console.log("pass", password);
    const newInstance = instanceV1(token);
    try {
      let res = await newInstance.put("/reset-password", {
        oldpassword: password.current_password,
        newpassword: password.new_password,
        // reenternewpassword: password.new_password,
      });
      set_password({
        current_password: "",
        new_password: "",
      });
      // setAlert({ open: true, message: "Password changed successfully", severity: "success" });

      setToastMessage("Password changed successfully"); // Set the toast message
      setShowToast(true); // Show the Toast
      setTimeout(() => setShowToast(false), 5000);
    } catch (error) {
      console.log(error);

      setErrors(error.response.data.msg);
      console.log(errors);
    } finally {
      setErrors(errors.response.data.msg);
    }
  };

  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    setFirst_name_error(null);
    setLast_name_error(null);
  };



  // const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let newInstance = instanceV1(token);
    let first_name = values.firstName;
    let last_name = values.lastName;
    let profile_image =
      values.profile_pic;

    if (!first_name) {
      setFirst_name_error("First name is required");
      setLoading(false);
      return;
    }
    if (!last_name) {
      setLast_name_error("Last name is required");
      setLoading(false);
      return;
    }

    try {
      await newInstance.put("/edit-admin", {
        profile_pic_image_id: profile_image,
        first_name: first_name,
        last_name: last_name,
      });

      const user_data = {
        first_name,
        last_name,
        profile_image,
      };
      localStorage.setItem("firstName", first_name);
      localStorage.setItem("lastName", last_name);
      localStorage.setItem("profile_pic_image_id", profile_image);

      setLoading(false);
      setToastMessage("Profile updated successfully"); // Set the toast message
      setShowToast(true); // Show the Toast
      setAction(!action)
      setTimeout(() => setShowToast(false), 5000);

    } catch (error) {
      console.log(error);

      const errorMsg =
        error?.response?.data?.msg || "Something went wrong. Please try again.";

      setLoading(false);
    }

  };


  const uploadImage = async (s) => {
    console.log(s);
    const newInstance = instanceV1(token);
    setProfileLoading(true);
    try {
      const response = await newInstance.post(
        "/api/admin/cf/v1/upload",
        {
          file: s,
          uploadType: "user_admin_profile",
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      //console.log("Upload Response:", response);
      const newProfilePicId = response.data.customUrl;
      setValues({ ...values, profile_pic: newProfilePicId });
   setToastMessage("Profile picture updated successfully"); // Set the toast message
      setShowToast(true); // Show the Toast
      setTimeout(() => setShowToast(false), 5000);
      // setAlert({ open: true, message: "Profile picture updated successfully.", severity: "success" });
    } catch (error) {
      //console.log("Upload Error:", error);
         setToastMessage("Failed to upload image. Please try again."); // Set the toast message
      setShowToast(true); // Show the Toast
      setTimeout(() => setShowToast(false), 5000);
      // setAlert({ open: true, message: "Failed to upload image. Please try again.", severity: "error" });
    } finally {
      setProfileLoading(false);
    }
  };


  const [openCropDialog, setOpenCropDialog] = useState(false);

  const handleChooseImage = (event) => {
    const file = event.target.files[0];
    setSelectedImage(URL.createObjectURL(file));
    setOpenCropDialog(true);
  };

  const handleReset = () => {
    setSelectedImage(null);

  }

  const handleCloseModal = () => {
    setOpenCropDialog(false);
    setSelectedImage(null);
  };
  const handleSecretKeyChange = (e) => {
    set_password({ ...password, [e.target.name]: e.target.value });
  };
const handleSubmitSecretKey = async (e) => {
  e.preventDefault();
  const newInstance = instanceV1(token);
  try {
    await newInstance.put("/api/admin/v1/key", {
      key: password.gemini_api_key,
    });
    const apiMetaData = {
      api_key: password.gemini_api_key,
    };
    localStorage.setItem('api_key', JSON.stringify(apiMetaData));

    set_password({
      gemini_api_key: "",
    });
    setToastMessage("Gemini API Key updated successfully");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  } catch (error) {
    console.log(error);
    const errorMsg =
      error?.response?.data?.msg || "Something went wrong. Please try again.";
    setToastMessage(errorMsg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  }
};
  return (
    <Paper sx={{ padding: 3, maxWidth: '100%', margin: "auto",mt:1 }}>
      {showToast && <Toast err={toastMessage} type="success" />}
      <Typography
        variant="h5"
        fontWeight={400}
        marginBottom={1}
      >
        Personal
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center" my={2}>
        <Avatar
          variant="rounded"
          sx={{ width: 80, height: 80 }}
          src={selectedImage || values.profile_pic }
        >
          {!selectedImage && (
            (values.firstName?.[0] && values.lastName?.[0])
              ? values.firstName[0].toUpperCase() + values.lastName[0].toUpperCase()
              : "EK"
          )}

        </Avatar>

        <Box>
          <Typography variant="subtitle1" mb={1}>
            Profile Image Upload
          </Typography>

          <Stack direction="row" spacing={1} mb={1}>
            <Button
              size="small"
              color="primary"
              variant="contained"
              component="label"
            >
              {ProfileLoading ? "Uploading..." : "Upload"}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleChooseImage}
              />
            </Button>

            <Button
              variant="contained"
              size="small"
              disabled={!selectedImage}
              onClick={handleReset} // You can define this function as needed
            >
              Reset
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Allowed file types: png, jpg, jpeg.
          </Typography>
        </Box>
      </Stack>
      <Grid container spacing={2} pb={2}>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <TextField
            variant="outlined"
            fullWidth
            size="small"
            margin="dense"
            label="First Name"
            id="firstName"
            value={values.firstName}
            onChange={handleChange("firstName")}
          />
          {first_name_error && <ErrorText value={first_name_error} />}
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6
          }}>

          <TextField
            label="Last Name"
            variant="outlined"
            fullWidth
            size="small"
            margin="dense"
            id="lastName"
            value={values.lastName}
            onChange={handleChange("lastName")}
          />
          {last_name_error && <ErrorText value={last_name_error} />}
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6
          }}>

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            size="small"
            disabled
            margin="dense"
            id="email"
            value={email}
            onChange={handleChange("email")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6
          }}>

          <TextField
            label="Mobile Number"
            variant="outlined"
            fullWidth
            size="small"
            margin="dense"
            disabled
            id="mobileNumber"
            value={mobileno}
            onChange={handleChange("mobile_number")}
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          color="primary"
          disabled={!isModified || !values.firstName || !values.lastName}
          onClick={() => {
            setValues(initialValues);
            setSelectedImage(null);


          }}>Cancel</Button>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!isModified || !values.firstName || !values.lastName}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            Save
            {loading && <Spinner size={20} thickness={5} color="white" />}
          </Box>
        </Button>

      </Box>
      {/* Security Section */}
      <Typography
        lineHeight={1.2}
        paddingTop={4}
        fontWeight={400}
        fontSize="calc(1.325rem + .1vw)"
        marginBottom={1}
      >
        Security:
      </Typography>
      <Grid container spacing={3} pb={2}>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>

          <TextField
            label="Current Password"
            variant="outlined"
            fullWidth
            size="small"
            margin="dense"
            name="current_password"
            placeholder="Enter current password"
            value={password.current_password}
            onChange={handleChangePassword}
            required
          />
          {errors && (
            <ErrorText
              value={errors.charAt(0).toUpperCase() + errors.slice(1)}
            />
          )}
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6
          }}>

          <TextField
            label="New Password"
            variant="outlined"
            fullWidth
            size="small"
            margin="dense"
            name="new_password"
            placeholder="Enter new password"
            type="password"
            value={password.new_password}
            onChange={handleChangePassword}
            required
          />
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          color="primary"
          disabled={!password.new_password && !password.current_password}
          onClick={() => {


            set_password({
              current_password: "",
              new_password: "",
            });
          }}>Cancel</Button>

        {password.new_password && password.current_password ? (
          <Button variant="contained" onClick={handleSubmitPassword}>
            Save
          </Button>
        ) : (
          <Button disabled variant="contained">
            Save
          </Button>
        )}
      </Box>
      <Typography
        lineHeight={1.2}
        paddingTop={4}
        fontWeight={400}
        fontSize="calc(1.325rem + .1vw)"
        marginBottom={1}
      >
        Secret Key:
      </Typography>
      <Grid container spacing={3} pb={2}>
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>

          {/* <Typography variant="body1" color="text.secondary">
            GEMINI API KEY
          </Typography> */}
          <TextField
            label="Enter New Gemini API Key"
            variant="outlined"
            fullWidth
            size="small"
            margin="dense"
            name="gemini_api_key"
            placeholder="Enter new Gemini API Key"
            type="password"
            value={password.gemini_api_key}
            onChange={handleSecretKeyChange}
            required
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 6
          }}>

          
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          color="primary"
          disabled={!password.gemini_api_key}
          onClick={() => {


            set_password({
              gemini_api_key: "",
            });
          }}>Cancel</Button>

        {password.gemini_api_key ? (
          <Button variant="contained" onClick={handleSubmitSecretKey}>
            Save
          </Button>
        ) : (
          <Button disabled variant="contained">
            Save
          </Button>
        )}
      </Box>
      {/* Image Crop Modal */}
      <Demo
        uploadImage={uploadImage}
        aspect={1}
        selectedImage={selectedImage}
        onClose={handleCloseModal}
        open={openCropDialog}
        setSelectedImage={setSelectedImage}
        setOpenCropDialog={setOpenCropDialog}
      />
    </Paper>
  );
};

export default AccountSetting;
