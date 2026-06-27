import { Button, ButtonGroup } from "@mui/material";
import styled from "styled-components";

const CustomButton = styled(ButtonGroup)({
  "&>button": {
    background: "linear-gradient(166.45deg,#f2473f -14.38%,#ff6b34 105%)",
    "&:hover": {
      background: 'linear-gradient(166.45deg,#fb6058 -14.38%,#ef6836 105%)',
      // transform: "scale(1.02)",
    },
    "&.MuiButtonGroup-firstButton": {
      borderRight: "1px solid #f97341",
      borderColor: "#f97341",
    },
    "&.MuiButtonGroup-middleButton": {
      borderRight: "1px solid #f97341",
      borderColor: "#f97341",
    },
  },
});
const PrimaryGroup = () => {
  return (
    <CustomButton
      variant="contained"
      aria-label="outlined primary button group"
      sx={{
        width: "fit-content",
        borderRadius: "7px",
        boxShadow: " rgba(47, 43, 61, 0.14) 0px 2px 6px 0px;",
      }}
    >
      <Button>One</Button>
      <Button>Two</Button>
      <Button>Three</Button>
    </CustomButton>
  );
};

export default PrimaryGroup;
