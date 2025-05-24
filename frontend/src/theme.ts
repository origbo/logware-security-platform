import {
  createTheme,
  responsiveFontSizes,
  Theme,
  PaletteMode,
} from "@mui/material/styles";
import { createContext, useMemo, useState, useEffect } from "react";

// Define custom colors for the Logware platform
declare module "@mui/material/styles" {
  interface Palette {
    neutral: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
    };
    security: {
      critical: string;
      high: string;
      medium: string;
      low: string;
      info: string;
    };
  }
  interface PaletteOptions {
    neutral?: {
      main: string;
      dark: string;
      light: string;
      contrastText: string;
    };
    security?: {
      critical: string;
      high: string;
      medium: string;
      low: string;
      info: string;
    };
  }
}

// Define the context for the color mode
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
  mode: "light" as PaletteMode,
});

// Define theme settings based on mode
const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode palette
          primary: {
            main: "#2563eb",
            light: "#60a5fa",
            dark: "#1e40af",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#7c3aed",
            light: "#a78bfa",
            dark: "#5b21b6",
            contrastText: "#ffffff",
          },
          background: {
            default: "#f8fafc",
            paper: "#ffffff",
          },
          text: {
            primary: "#1e293b",
            secondary: "#64748b",
          },
          neutral: {
            main: "#64748B",
            light: "#94a3b8",
            dark: "#334155",
            contrastText: "#ffffff",
          },
          security: {
            critical: "#dc2626",
            high: "#ea580c",
            medium: "#eab308",
            low: "#16a34a",
            info: "#2563eb",
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: "#3b82f6",
            light: "#60a5fa",
            dark: "#1d4ed8",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#8b5cf6",
            light: "#a78bfa",
            dark: "#6d28d9",
            contrastText: "#ffffff",
          },
          background: {
            default: "#0f172a",
            paper: "#1e293b",
          },
          text: {
            primary: "#f8fafc",
            secondary: "#cbd5e1",
          },
          neutral: {
            main: "#cbd5e1",
            light: "#f1f5f9",
            dark: "#94a3b8",
            contrastText: "#0f172a",
          },
          security: {
            critical: "#ef4444",
            high: "#f97316",
            medium: "#facc15",
            low: "#22c55e",
            info: "#3b82f6",
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
    subtitle1: {
      fontSize: "1.125rem",
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: "0.875rem",
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 400,
    },
    body2: {
      fontSize: "0.875rem",
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "0.5rem",
          padding: "0.5rem 1.25rem",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        sizeSmall: {
          padding: "0.25rem 0.75rem",
        },
        sizeLarge: {
          padding: "0.75rem 1.5rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "0.75rem",
          boxShadow:
            mode === "light"
              ? "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
              : "0 1px 3px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom:
            mode === "light" ? "1px solid #e2e8f0" : "1px solid #334155",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: mode === "light" ? "#e2e8f0" : "#334155",
        },
      },
    },
  },
});

// Create a theme instance
export const theme = responsiveFontSizes(createTheme(getDesignTokens("light")));

// Custom hook for using the theme with color mode switching
export const useColorMode = () => {
  const [mode, setMode] = useState<PaletteMode>("light");

  // Load saved theme from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as PaletteMode | null;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        const newMode = mode === "light" ? "dark" : "light";
        setMode(newMode);
        localStorage.setItem("themeMode", newMode);
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () => responsiveFontSizes(createTheme(getDesignTokens(mode))),
    [mode]
  );

  return { theme, colorMode };
};
