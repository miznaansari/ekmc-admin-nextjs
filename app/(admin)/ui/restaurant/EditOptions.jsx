import { Box } from "@mui/material";
import OutlineGroup from "./OutlineGroup";

const EditOptions = () => {
  const arr = [
    {
      id: 0,
      route: "/manager/profile/edit-restaurant",
      name: "General Info",
    },
    {
      id: 1,
      route: "/manager/profile/time-price",
      name: "Time & Price",
    },
    {
      id: 2,
      route: "/manager/profile/address",
      name: "Address Info",
    },
    {
      id: 3,
      route: "/manager/profile/social-info",
      name: "Social Info",
    },
    {
      id: 4,
      route: "/manager/profile/feature-image",
      name: "Featured Image",
    },

    {
      id: 5,
      route: "/manager/profile/image-gallery",
      name: "Image Gallery",
    },
  ];
  return (
    <div>
      <Box>
        <OutlineGroup arr={arr} />
      </Box>
    </div>
  );
};

export default EditOptions;
