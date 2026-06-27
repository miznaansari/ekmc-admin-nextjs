import React from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  FormLabel,
  Grid,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';

// Custom Document Section Component
const DocumentSection = ({ title, documentInfo, handleFileUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleFileUpload(title, acceptedFiles),
  });
  console.log("document info- ",documentInfo)

  return (
    <Box sx={{ mb: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <FormControl component="fieldset">
          <FormLabel component="legend">{title}</FormLabel>
          <RadioGroup row defaultValue="yes">
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              fullWidth
              label={documentInfo.numberLabel}
              variant="outlined"
              defaultValue={documentInfo.number}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              fullWidth
              label={documentInfo.nameLabel}
              variant="outlined"
              defaultValue={documentInfo.name}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              fullWidth
              label={documentInfo.issuedByLabel}
              variant="outlined"
              defaultValue={documentInfo.issuedBy}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <TextField
              fullWidth
              label={documentInfo.expiryDateLabel}
              variant="outlined"
              type="date"
              defaultValue={documentInfo.expiryDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid size={12}>
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed #ccc',
                padding: '20px',
                textAlign: 'center',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
                mt: 2,
              }}
            >
              <input {...getInputProps()} />
              <Typography color="textSecondary">
                Click to upload or drag and drop
              </Typography>
            </Box>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              disabled
            >
              Uploaded Document
            </Button>
          </Grid>
          <Grid
            size={{
              xs: 12,
              sm: 6
            }}>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
            >
              View
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

// Main DocumentsTab Component
const DocumentsTab = () => {
  // Hardcoded document data
  const documentsData = [
    {
      title: 'Taxation Details',
      info: {
        numberLabel: 'Tax ID',
        number: '000000000000000fr',
        nameLabel: 'Company Name',
        name: 'A2D Eatsrr',
        issuedByLabel: 'Issuer',
        issuedBy: 'A2D Eats',
        expiryDateLabel: 'Expiry Date',
        expiryDate: '2024-03-31',
      },
    },
    {
      title: 'FSSAI Certificate',
      info: {
        numberLabel: 'FSSAI License Number',
        number: '0909090909',
        nameLabel: 'Certificate Name',
        name: 'A2D Eats',
        issuedByLabel: 'Issued By',
        issuedBy: '',
        expiryDateLabel: 'Expiry Date',
        expiryDate: '',
      },
    },
  ];

  // Handle file upload
  const handleFileUpload = (title, files) => {
    console.log(`Files uploaded for ${title}:`, files);
    // Implement your file handling logic here
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Documents
      </Typography>
      {documentsData.map((doc, index) => (
        <DocumentSection
          key={index}
          title={doc.title}
          documentInfo={doc.info}
          handleFileUpload={handleFileUpload}
        />
      ))}
    </Box>
  );
};

export default DocumentsTab;
