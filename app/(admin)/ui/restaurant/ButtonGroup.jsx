import { Box } from "@mui/material";
import PrimaryGroup from "./PrimaryGroup";
import OutlineGroup from "./OutlineGroup";
import TextGroup from "./TextGroup";

const ButtonGroup = () => {
  return (
    <Box marginTop={10} sx={{ display: "flex", flexDirection: "column" }}>
      <h2>Button Group</h2>
      <PrimaryGroup />
      <OutlineGroup />
      <TextGroup />
    </Box>
  );
};

export default ButtonGroup;
