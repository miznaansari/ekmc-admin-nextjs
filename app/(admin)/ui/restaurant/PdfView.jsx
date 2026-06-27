/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Box, Dialog, Typography, DialogTitle, DialogContent, IconButton, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { RxCross2 } from 'react-icons/rx';

const CustomCloseButton = styled(IconButton)(() => ({
  top: 0,
  right: 0,
  color: 'rgba(47, 43, 61, 0.54)',
  position: 'absolute',
  transform: 'translate(10px, -10px)',
  borderRadius: 6,
  backgroundColor: 'white',
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)',
    backgroundColor: 'white',
  },
}));

const PdfView = ({ row , color , disabled }) => {
  // ** State
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => !disabled && setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Typography display="flex" onClick={handleClickOpen} sx={{ color: color ? "black" :'white' }}>
        View
      </Typography>
      <Dialog

        open={open}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        sx={{
          '& .MuiDialog-paper': {height:'50rem', mb: '1rem', width: { lg: '35%', xs: '80%' }, overflow: 'visible', boxShadow: 'none', borderRadius: '6px' },
          
        }}
      >
        <DialogTitle id="customized-dialog-title" sx={{ py: '0.5rem' }}>

          <CustomCloseButton aria-label="close" onClick={handleClose} sx={{ position: 'absolute', zIndex: 1 }}>
            <RxCross2 icon="tabler:x" fontSize="1.25rem" />
          </CustomCloseButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box>
            <Grid container spacing={2}>
              <Grid  size={{ xs: 12, sm: 12, md: 5.7, lg: 5.7 }} >
                <Box>
                  <iframe
                  style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
                  src={`https://docs.google.com/gview?url=${row}&embedded=true`} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PdfView;
