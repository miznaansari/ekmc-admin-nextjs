/* eslint-disable react/prop-types */

import { Button } from "@mui/material";

const Primary = (props) => {
  const {
    type,
    value,
    handleClick,
    width,
    height,
    marginTop,
    background,
    disabled,
    fontSize,
    fontFamily,
    fontWeight, orderDataMobileNumber
  } = props;

  return (
    // <Box >
    // </Box>
    <Button
      variant="contained"
      type={type}
      size="small"

      onClick={handleClick}
      disabled={disabled}
      sx={{
        textDecoration: "none",
        width: width,
        height: height,
        lineHeight: "1",
        fontSize: fontSize || "0.9375rem",
        color: "rgb(255, 255, 255)",
        // background: background ? background : "#00CF63",
        minWidth: "50px",
        textTransform: "none",
        boxShadow: "rgba(47, 43, 61, 0.14) 0px 2px 6px 0px",
        padding: "0.625rem 1.25rem",
        "&:hover": {
          boxShadow: "none",
          // background: background ? background : "#00CF63",
        },
        marginTop: { marginTop },
        fontFamily: fontFamily || 'default',
        fontWeight: fontWeight || 500
      }}
    >
      {value}
    </Button>
  );
};

export default Primary;
