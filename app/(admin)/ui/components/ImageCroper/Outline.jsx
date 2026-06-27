/* eslint-disable react/prop-types */
import { Button } from "@mui/material";

const Outline = ({ value, handleClick, width, color, backgroundColor, disabled, fontSize, style, icon, padding, fontWeight, height, fontFamily }) => {
  // const { value, handleClick, width, color, backgroundColor, disabled, fontSize, style, icon, padding, fontWeight, height, fontFamily } = props;
  return (
    // outline button component

    <Button variant="outlined"
      onClick={handleClick}
      style={style}
      sx={{
        height: height || '2.36rem',
        textWrap: "nowrap",
        fontSize: fontSize,
        fontWeight: fontWeight || '',
        border: `1px solid ${color ? color : '#D0D5DD'}!important`,
        backgroundColor: backgroundColor ? backgroundColor : 'transparent',
        color: color ? color : '#344054',
        width: width ? width : "100%",
        padding: padding || '.786rem 1.5rem',
        fontFamily: fontFamily || 'inherit',
        borderRadius: '.358rem',
        '&:disabled': {
          borderColor: '#ccc',
          color: '#82868B',
          backgroundColor: 'transparent',
          border: ` 1px solid var(--1-theme-color-secondary, #82868B) !important`,
        },

      }}
      disabled={disabled}
      endIcon={icon}
    >{value}</Button>
  );
};

export default Outline;
