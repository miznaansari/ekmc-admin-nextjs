import { Checkbox, FormControlLabel } from "@mui/material";

const CheckBoxField = ({ label, check, setCheck }) => {
  const handleChange = (event) => {
    setCheck(event.target.checked);
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          color="secondary"
          checked={check}
          onChange={handleChange}
        />
      }
      label={label}
    />
  );
};

export default CheckBoxField;
