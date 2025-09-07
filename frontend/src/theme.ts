import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#007bff",
      light: "#58a6ff",
      dark: "#0052cc",
    },
    secondary: {
      main: "#6c757d",
      light: "#a1a7ac",
      dark: "#495057",
    },
    error: {
      main: "#dc3545",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#212529",
      secondary: "#6c757d",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
      color: "#343a40",
    },
    h6: {
      fontWeight: 600,
      color: "#343a40",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#ffffff",
          color: "#212529",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f8f9fa",
          "& .MuiTableCell-root": {
            fontWeight: 600,
            color: "#495057",
            borderBottom: "1px solid #dee2e6",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;
