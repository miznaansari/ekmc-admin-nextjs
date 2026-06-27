import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: '#F7FAF7', // Set your desired background color
      paper: '#ffffff', // Background color for Paper-based components
    },
    primary: {
      main: "#004A00",
      light: "#64926F",
      dark: "#326E3F",
      contrast: "#FFFFFF",
      containedHoverBackground: "#004A00",
      outlinedHoverBackground: "#004A0014",
      outlinedRestingBackground: "#004A0080",
    },

    secondary: {
      main: "#FF6F00",
      light: "#FFF7F2",
      dark: "#572600",
      contrast: "#FFFFFF",
      containedHoverBackground:
        "linear-gradient(0deg, #FF6F00, #FF6F00),linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3))",
      outlinedHoverBackground: "#FF6F0014",
      outlinedRestingHover: "#FF6F0080",
    },

    error: {
      main: "#FF4C51",
      light: "#FF7074",
      dark: "#E64449",
      contrast: "#FFFFFF",
    },

    warning: {
      main: "#FFA527",
      light: "#FFB95C",
      dark: "#E6891F",
      contrast: "#FFFFFF",
    },

    info: {
      main: "#1EBAFF",
      light: "#72D5FF",
      dark: "#1586B8",
      contrast: "#FFFFFF",
    },

    success: {
      main: "#28C76F",
      light: "#53D28C",
      dark: "#004A00",
      contrast: "#FFFFFF",
    },

    text: {
      primary: "#212121",
      secondary: "#666666",
      disabled: "#9E9E9E",
      hint: "#BDBDBD",
    },

    action: {
      active: "#0000008A",
      hover: "#0000000A",
      selected: "#00000014",
      disabled: "#00000042",
      disabledBackground: "#0000001F",
      focus: "#0000001F",
    },

    other: {
      divider: "#0000001F",
      outlineBorder: "#0000003B",
      standardInputLine: "#0000006B",
      backdropOverlay: "#00000080",
      ratingActive: "#FFB400",
      snackbarBackground: "#323232",
    },
  },
  typography: {
    fontFamily: "'Inter', Helvetica",
    h1: {
      fontSize: "46px",
      fontWeight: 500,
      lineHeight: "68px",
    },
    h2: {
      fontSize: "38px",
      fontWeight: 500,
      lineHeight: "56px%",
    },
    h3: {
      fontSize: "28px",
      fontWeight: 500,
      lineHeight: "42px",
    },
    h4: {
      fontSize: "24px",
      fontWeight: 500,
      lineHeight: "38px",
    },
    h5: {
      fontSize: "18px",
      fontWeight: 500,
      lineHeight: "28px",
    },
    h6: {
      fontSize: "15px",
      fontWeight: 500,
      lineHeight: "22px",
    },
    subtitle1: {
      fontSize: "15px",
      fontWeight: 400,
      lineHeight: "22px",
    },
    subtitle2: {
      fontSize: "13px",
      fontWeight: 400,
      lineHeight: "20px",
    },
    body1: {
      fontSize: "15px",
      fontWeight: 400,
      lineHeight: "22px",
    },
    body2: {
      fontSize: "13px",
      fontWeight: 400,
      lineHeight: "20px",
    },
    caption: {
      fontSize: "13px",
      fontWeight: 400,
      letterSpacing: "0.4px",
      lineHeight: "18px",
    },
    overline: {
      fontSize: "12px",
      fontWeight: 400,
      lineHeight: "14px",
      textTransform: "uppercase",
      letterSpacing: "0.4px",
    },
    button: {
      fontSize: "15px",
      fontWeight: 500,
      lineHeight: "22px",
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 10,
  },
  transitions: {
    duration: {
      standard: 400,
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  zIndex: {
    mobileStepper: 1000,
    appBar: 1300,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  shadows: [
    "none",
    "0px 1px 2px 0px rgba(0, 0, 0, 0.05), 0px 1px 1px 0px rgba(0, 0, 0, 0.08)",
    "0px 1px 3px 0px rgba(0, 0, 0, 0.05), 0px 2px 2px 0px rgba(0, 0, 0, 0.08)",
    "0px 1px 4px 0px rgba(0, 0, 0, 0.05), 0px 3px 3px 0px rgba(0, 0, 0, 0.08)",
    "0px 1px 5px 0px rgba(0, 0, 0, 0.05), 0px 4px 4px 0px rgba(0, 0, 0, 0.08)",
    "0px 1px 6px 0px rgba(0, 0, 0, 0.05), 0px 5px 5px 0px rgba(0, 0, 0, 0.08)",
    "0px 1px 7px 0px rgba(0, 0, 0, 0.05), 0px 6px 6px 0px rgba(0, 0, 0, 0.08)",
    "0px 2px 8px 1px rgba(0, 0, 0, 0.05), 0px 7px 7px 1px rgba(0, 0, 0, 0.08)",
    "0px 3px 9px 1px rgba(0, 0, 0, 0.05), 0px 8px 8px 1px rgba(0, 0, 0, 0.08)",
    "0px 3px 10px 1px rgba(0, 0, 0, 0.05), 0px 9px 9px 1px rgba(0, 0, 0, 0.08)",
    "0px 4px 11px 2px rgba(0, 0, 0, 0.05), 0px 10px 10px 1px rgba(0, 0, 0, 0.08)",
    "0px 4px 12px 2px rgba(0, 0, 0, 0.05), 0px 11px 11px 1px rgba(0, 0, 0, 0.08)",
    "0px 5px 13px 2px rgba(0, 0, 0, 0.05), 0px 12px 12px 1px rgba(0, 0, 0, 0.08)",
    "0px 5px 14px 2px rgba(0, 0, 0, 0.05), 0px 13px 13px 1px rgba(0, 0, 0, 0.08)",
    "0px 5px 15px 2px rgba(0, 0, 0, 0.05), 0px 14px 14px 1px rgba(0, 0, 0, 0.08)",
    "0px 6px 16px 3px rgba(0, 0, 0, 0.05), 0px 15px 15px 1px rgba(0, 0, 0, 0.08)",
    "0px 6px 17px 3px rgba(0, 0, 0, 0.05), 0px 16px 16px 1px rgba(0, 0, 0, 0.08)",
    "0px 6px 18px 3px rgba(0, 0, 0, 0.05), 0px 17px 17px 1px rgba(0, 0, 0, 0.08)",
    "0px 7px 19px 4px rgba(0, 0, 0, 0.05), 0px 18px 18px 2px rgba(0, 0, 0, 0.08)",
    "0px 7px 20px 4px rgba(0, 0, 0, 0.05), 0px 19px 19px 2px rgba(0, 0, 0, 0.08)",
    "0px 8px 21px 4px rgba(0, 0, 0, 0.05), 0px 20px 20px 2px rgba(0, 0, 0, 0.08)",
    "0px 8px 22px 4px rgba(0, 0, 0, 0.05), 0px 21px 21px 2px rgba(0, 0, 0, 0.08)",
    "0px 8px 23px 4px rgba(0, 0, 0, 0.05), 0px 22px 22px 2px rgba(0, 0, 0, 0.08)",
    "0px 9px 24px 5px rgba(0, 0, 0, 0.05), 0px 23px 23px 2px rgba(0, 0, 0, 0.08)",
    "0px 9px 25px 5px rgba(0, 0, 0, 0.05), 0px 24px 24px 2px rgba(0, 0, 0, 0.08)"
  ],

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: "16px",  // ✅ Adds 16px margin to the whole app
          //padding:"10px",

        },

        "*": {
          boxSizing: "border-box",  // ✅ Prevents layout shifts due to margins
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          //top: "16px",
          padding: '0px !important',
          boxShadow: "none", // Optional: Removes shadow for a cleaner look
          borderRadius: theme.shape.borderRadius, // Optional: adds rounded corners
          backgroundColor: theme.palette.background.paper, // Optional: sets background color
          color: theme.palette.text.primary, // Optional: sets text color
          maxHeight: "64px", // Optional: sets height
          //marginLeft: '16px',
          //marginRight: '16px',
          //width: `calc(100% - 32px)`, // full width minus both margins
          width: "100%",
          //gap:"2"
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme, ownerState }) => ({
          textTransform: "none", // Optional: Removes uppercase transformation

          /** Contained Buttons */
          ...(ownerState.variant === "contained" && {
            ...(ownerState.color === "primary" && {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }),
            ...(ownerState.color === "secondary" && {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.primary.contrastText,
              "&:hover": {
                backgroundColor: theme.palette.secondary.containedHoverBackground,
              },
            }),
          }),

          /** Outlined Buttons */
          ...(ownerState.variant === "outlined" && {
            borderColor: theme.palette[ownerState.color]?.main,
            color: theme.palette[ownerState.color]?.main,
            "&:hover": {
              borderColor: theme.palette[ownerState.color]?.main,
              backgroundColor: theme.palette[ownerState.color]?.outlinedHoverBackground,
            },
          }),

          /** Text Buttons */
          ...(ownerState.variant === "text" && {
            color: theme.palette[ownerState.color]?.main,
            "&:hover": {
              backgroundColor: theme.palette[ownerState.color]?.textHoverBackground,
            },
          }),
        }),
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme, ownerState }) => {
          const isLeft = !ownerState || ownerState.anchor === "left";
          return {
            padding: isLeft ? "8px" : "0px",
            borderRadius: isLeft ? "12px" : "0px",
            margin: isLeft ? "8px" : "0px",
            borderRight: 0,
            // width: isLeft ? "240px" : "auto",
            marginTop: isLeft ? "90px" : "0px",
            marginLeft: isLeft ? 16 : 0,
            height: isLeft ? `calc(98vh - 88px)` : "100%",
          };
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "8px",
          color: theme.palette.text.secondary, // Defined in your theme
          "&:hover": {
            backgroundColor: theme.palette.secondary.outlinedHoverBackground,
            color: theme.palette.text.secondary, // Defined in your theme
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrast, // Click effect

            "&:hover": {
              backgroundColor: theme.palette.secondary.dark, // Darker on hover when selected
            },
          },
          "&:active": {
            backgroundColor: theme.palette.secondary.outlinedHoverBackground, // Selected state
            color: theme.palette.secondary.contrast,

          },
        }),
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: "inherit", // Inherit color from ListItemButton
          minWidth: "40px", // Reduce default spacing (default is 56px)        
          ".Mui-selected &": {
            color: "inherit", // Change icon color when selected
          },
        }),
      },
    },
    // MuiSwitch: {
    //   styleOverrides: {
    //     root: {
    //       width: 46,
    //       height: 24,
    //       padding: 0,
    //       margin: 8,
    //       overflow: 'visible',
    //     },
    //     switchBase: {
    //       padding: 2,
    //       color: '#fff',
    //       '&.Mui-checked': {
    //         transform: 'translateX(22px)',
    //         color: '#004A00', // Dark green circle when checked
    //         '& + .MuiSwitch-track': {
    //           opacity: 1,
    //           backgroundColor: '#64926F', // Light green track when checked
    //           border: 'none',
    //         },
    //       },
    //       '&.Mui-focusVisible .MuiSwitch-thumb': {
    //         border: '6px solid #fff',
    //       },
    //     },
    //     thumb: {
    //       width: 20,
    //       height: 20,
    //       boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    //     },
    //     track: {
    //       borderRadius: 12,
    //       border: '1px solid #bdbdbd',
    //       backgroundColor: '#e0e0e0',
    //       opacity: 1,
    //       transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    //     },
    //   },
    // },
    MuiMenu: {
      styleOverrides: {
        list: {
          padding: "4px 8px", // Add padding around the menu items
          borderRadius: "inherit",
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "4px 8px", // remove default 16px padding
        },
        head: {
          padding: "4px 8px",
        },
        body: {
          padding: "4px 8px",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "8px", // Consistent with ListItemButton
          padding: "8px 16px", // Adjust padding as needed
          margin: "4px 0", // Optional: adds margin between items
          "&:hover": {
            backgroundColor: theme.palette.secondary.outlineBorder, // Same as ListItemButton hover
          },
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.outlinedHoverBackground, // Active state color
            color: theme.palette.primary.main, // Text contrast

          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "",
          textDecoration: "none",
        },
        defaultProps: {
          underline: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius, // Use global border-radius
          borderColor: theme.palette.other.outlineBorder, // Default border color
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main, // Primary color on focus
            borderWidth: "2px",
          },
          '&.Mui-disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.text.disabled,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.action.disabled,
            }
          }
        })
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          // margin: "20px",
          //padding:"5px",
          boxShadow: "none",
        })
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: ({ theme }) => ({
          boxShadow: theme.shadows[10], // Same as MUI Menu
          borderRadius: 12,
        }),
        listbox: {
          padding: 8,
        },
        option: ({ theme }) => ({
          borderRadius: 8,
          "&:hover": {
            backgroundColor: theme.palette.secondary.outlineBorder, // Same hover effect as MenuList
          },
          "&[aria-selected='true']": {
            backgroundColor: "#e0e0e0", // Same selection color as MenuList
          },
        }),
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: ({ theme }) => ({
          boxShadow: theme.shadows[10], // Use theme elevation level 6
          borderRadius: 8, // Optional rounded corners
        }),
      },
    },
  },
  props: {
    MuiList: {
      dense: true,
    },
    MuiMenuItem: {
      dense: true,
    },
    MuiTable: {
      size: "small",
    },
  },
});

export default theme;
