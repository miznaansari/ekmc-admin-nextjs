import { Box, Typography, Grid, TextField, Snackbar, Alert } from "@mui/material";
import EditOptions from "./EditOptions";
import Primary from "./Primary";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "@/ui/utils/nextRouting";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import cafe_profile from "./cafe_profile.json";

const SocialInfo = () => {
  const navigate = useNavigate();
  const drawer = false;

  const [loadingSpinner, setLoadingSpinner] = useState(true);
  const [formChanged, setFormChanged] = useState(false);
  const [data, setData] = useState({
    website_url: "",
    social_facebook_url: "",
    social_instagram_url: "",
    social_linkedin_url: "",
    social_twitter_url: ""
  });
  const [alert, setAlert] = useState({ open: false, severity: "info", message: "" });
  const [loading, setLoading] = useState(false);

  const showAlert = (severity, message) => {
    setAlert({ open: true, severity, message });
    setTimeout(() => setAlert(prev => ({ ...prev, open: false })), 3000);
  };

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormChanged(true);
  };

  useEffect(() => {
    setData({
      website_url: cafe_profile.website_url || "",
      social_facebook_url: cafe_profile.social_facebook_url || "",
      social_instagram_url: cafe_profile.social_instagram_url || "",
      social_linkedin_url: cafe_profile.social_linkedin_url || "",
      social_twitter_url: cafe_profile.social_twitter_url || ""
    });
    setLoadingSpinner(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Saved data:", data);
      setFormChanged(false);
      showAlert("success", "Updated Successfully!");
    } catch (error) {
      console.error(error);
      showAlert("error", "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loadingSpinner ? (
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
        <Box sx={{ pl: { xs: "4%", lg: drawer ? "19%" : "6.3%" }, pr: "4%", transition: "padding-left 0.4s ease" }}>
          <Typography
            paddingTop="12px"
            fontSize="1.285rem"
            fontWeight="600"
            marginBottom={1}
            display="flex"
            alignItems="center"
            style={{ cursor: "pointer", width: "100%", justifyContent: "start" }}
            onClick={() => navigate("/manager/profile/address")}
          >
            <ArrowBackIcon style={{ color: "black" }} />
            Edit
          </Typography>

          <Box marginBottom={10}>
            <EditOptions />
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} marginTop={2} marginBottom={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 4
                  }}>
                  <TextField
                    label="Website"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="https://theoracafe.com"
                    type="url"
                    onChange={handleChange}
                    name="website_url"
                    value={data.website_url}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} marginTop={2} marginBottom={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 4
                  }}>
                  <TextField
                    label="Facebook"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="https://www.faceBook.com/TheOraCafe"
                    type="url"
                    onChange={handleChange}
                    name="social_facebook_url"
                    value={data.social_facebook_url}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    md: 4
                  }}>
                  <TextField
                    label="Instagram"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="https://www.instagram.com/TheOraCafe"
                    type="url"
                    onChange={handleChange}
                    name="social_instagram_url"
                    value={data.social_instagram_url}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} marginTop={2} marginBottom={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 4
                  }}>
                  <TextField
                    label="Twitter"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="https://www.twitter.com/TheOraCafe"
                    type="url"
                    onChange={handleChange}
                    name="social_twitter_url"
                    value={data.social_twitter_url}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    md: 4
                  }}>
                  <TextField
                    label="LinkedIn"
                    variant="outlined"
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="https://www.linkedIn.com/TheOraCafe"
                    type="url"
                    onChange={handleChange}
                    name="social_linkedin_url"
                    value={data.social_linkedin_url}
                  />
                </Grid>
              </Grid>

              <Primary
                type="submit"
                value={<Box sx={{ display: "flex", gap: 1 }}>Save {loading && <Spinner size={20} thickness={5} color="white" />}</Box>}
                marginTop="50px"
                disabled={!formChanged || loading}
              />
            </form>
          </Box>
        </Box>
      )}
      <Snackbar
        open={alert.open}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={3000}
        onClose={() => setAlert(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SocialInfo;
