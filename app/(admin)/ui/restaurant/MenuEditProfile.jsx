import { Box, FormControl, MenuItem, Select } from "@mui/material";

const MenuEditProfile = ({
  margin,
  arr,
  option,
  set_option,
  setFormChanged,
  errors,
  setErrors,
  onOptionChange,
}) => {
  const defaultValue = arr?.length > 0 ? arr[0].value : "";

  const handleChange = (event) => {
    setErrors({ price_error: "" });
    const selectedOption = event.target.value;
    set_option(selectedOption);
    setFormChanged(true);
    if (onOptionChange) {
      onOptionChange(selectedOption);
    }
  };

  return (
    <Box marginTop="20px">
      <FormControl
        sx={{
          marginBlock: "12px",
          minWidth: "100%",
          margin: margin,
        }}
      >
        <Select
          value={option || defaultValue}
          onChange={handleChange}
          displayEmpty
          sx={{
            width: "100%",
            height: "2.4rem",
            borderRadius: "6px",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#FFA943",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#FFA943",
              borderWidth: "1px",
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                boxShadow: "rgba(47, 43, 61, 0.16) 0px 4px 11px 0px",
                borderRadius: "6px",
                minWidth: "120px",
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            <em style={{ marginLeft: "5px" }}>Choose an Option</em>
          </MenuItem>
          <MenuItem value="1" sx={{ "&.Mui-selected": { backgroundColor: "#ff6b34", color: "white" } }}>Most Expensive</MenuItem>
          <MenuItem value="2" sx={{ "&.Mui-selected": { backgroundColor: "#ff6b34", color: "white" } }}>Affordable</MenuItem>
          <MenuItem value="3" sx={{ "&.Mui-selected": { backgroundColor: "#ff6b34", color: "white" } }}>Normal</MenuItem>
          <MenuItem value="4" sx={{ "&.Mui-selected": { backgroundColor: "#ff6b34", color: "white" } }}>Economy</MenuItem>
          <MenuItem value="5" sx={{ "&.Mui-selected": { backgroundColor: "#ff6b34", color: "white" } }}>Most Economy</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default MenuEditProfile;
