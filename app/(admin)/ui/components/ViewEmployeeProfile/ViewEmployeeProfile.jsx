import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Container,
  TextField,
  Button,
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { Image32Regular } from '@fluentui/react-icons';
import { Close } from '@mui/icons-material';
const baseUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const ViewEmployeeProfile = ({ employeeId, onClose, onEdit ,handleClose}) => {
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewImage , setPreviewImage]=useState("");

  useEffect(() => {
    const fetchEmployeeData = async () => {
      console.log("before api call in view employee profile , id is- ",employeeId)
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/api/user/admin/get-employee/${employeeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
          }
        );
        console.log("emplouee id inside viewemployeeprofile.jsx- ",employeeId)
        console.log("response in view employee profile= ",response.data)
        setEmployeeData(response.data.data);
        setPreviewImage(response?.data?.data?.uap_azure_original_image_url || "")
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch employee data');
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [employeeId]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }
const roleLabels = {
  2: 'Manager',
  3: 'Kitchen',
  4: 'Captain',
};

  return (
    <>
      <Box position={"sticky"} top={0} zIndex={999} sx={{ bgcolor: "#F7F7F7", p: 1 }}>
        <Paper sx={{ padding: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Employee Profile</Typography>
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
          </Stack>
        </Paper>
      </Box>
      <Box>
        <Container
          maxWidth="sm"
          sx={{
            position: 'relative',
            backgroundColor: '#fff',
            padding: 1,
            
            
          }}
        >
          {/* Close button */}
         

        

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* <Avatar
              alt={employeeData.first_name}
              src={employeeData.uap_azure_original_image_url ? employeeData.uap_azure_original_image_url: '/placeholder-image.png'}
              sx={{ width: 128, height: 128, margin: '0 auto' }}
            /> */}
            {previewImage ? (
                <Avatar src={previewImage} sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }} />
              ) : (
                <Avatar sx={{ width: '100%', height: 150, margin: 'auto', borderRadius: '10px' }}>
                  <Image32Regular color="black" />
                </Avatar>
              )}

          </Box>

          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <TextField
                label="First Name"
                value={employeeData.first_name || ''}
                variant="outlined"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <TextField
                label="Last Name"
                value={employeeData.last_name || ''}
                variant="outlined"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <TextField
                label="Restaurant Name"
                value={employeeData.cafe_name || ''}
                variant="outlined"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <TextField
                label="Employee Role"
                value={roleLabels[employeeData.user_role_id] || ''}
                variant="outlined"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>


            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <TextField
                label="Employee Email"
                value={employeeData.email || ''}
                variant="outlined"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 12
              }}>
              <TextField
                label="Employee Phone"
                value={employeeData.mobile_number || ''}
                variant="outlined"
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                
              />
            </Grid>

            {/* File Links */}
            {/* <Grid item xs={12} sm={12}>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                {employeeData.photo_proof_id_url ? (
                  <a href={employeeData.photo_proof_id_url} target="_blank" rel="noopener noreferrer">
                    View Photo Proof
                  </a>
                ) : (
                  'No Photo Proof Available'
                )}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={12}>
              <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                {employeeData.address_proof_id_url ? (
                  <a href={employeeData.address_proof_id_url} target="_blank" rel="noopener noreferrer">
                    View Address Proof
                  </a>
                ) : (
                  'No Address Proof Available'
                )}
              </Typography>
            </Grid> */}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

export default ViewEmployeeProfile;
