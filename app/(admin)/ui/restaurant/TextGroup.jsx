import { Box, Button, ButtonGroup } from "@mui/material";

const TextGroup = () => {
  return (
    <Box marginTop="20px">
      <h4>Text Button Froup</h4>
      <ButtonGroup variant="text">
        <Button sx={{color:'#82868b', borderRight:'1px solid #82868b'}} >One</Button>
        <Button sx={{color:'#82868b', borderRight:'1px solid #82868b'}}>Two</Button>
        <Button sx={{color:'#82868b'}}>Three</Button>
      </ButtonGroup>
    </Box>
  );
};

export default TextGroup;
