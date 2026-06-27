/* eslint-disable react/prop-types */
import { Button, ButtonGroup, Box } from "@mui/material";
import  { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";

const OutlineGroup = (props) => {
  const { arr } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = useState("");
  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname]);

  return (
    <ButtonGroup
      variant="outlined"
      sx={{
        overflowX: "auto",
        overflowY: "hidden",
        maxWidth: "100%",
        display: "inline-flex",
        scrollbarWidth: "thin", 
        scrollbarColor: "transparent transparent",
      }}
    >
      {arr.map((item, key) => (
        <Box
          key={key}
          sx={{
            display: "flex",
            textWrap: "nowrap",
            width: "100%", 
          }}
        >
          <Button
            onClick={() => navigate(item.route)}
            sx={{
              background:
                currentRoute === item.route
                  ? "linear-gradient(166.45deg, rgb(242, 71, 63) -14.38%, rgb(255, 107, 52) 105%)"
                  : "transparent",
              color: currentRoute === item.route ? "white" : "#82868b",
              border: "1px solid #82868b",
              "&:hover": {
                border: "1px solid #82868b",
              },
              width: "100%", 
          }}
          >
            {item.name}
          </Button>
        </Box>
      ))}
    </ButtonGroup>
  );
};

export default OutlineGroup;



