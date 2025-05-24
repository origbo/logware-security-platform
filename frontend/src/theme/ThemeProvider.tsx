import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  Theme,
  PaletteMode,
} from "@mui/material";
import { useUserPreferences } from "../services/userPreferences/userPreferencesService";

interface ThemeContextProps {
  mode: PaletteMode;
  toggleColorMode: () => void;
  theme: Theme;
}

// Create theme context
const ThemeContext = createContext<ThemeContextProps>({
  mode: "light",
  toggleColorMode: () => {},
  theme: createTheme(),
});

// Create theme hook
export const useThemeContext = () => useContext(ThemeContext);

// Define theme options for light and dark modes
const getThemeOptions = (mode: PaletteMode): any => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode palette
          primary: {
            main: "#2196f3",
            light: "#64b5f6",
            dark: "#1976d2",
          },
          secondary: {
            main: "#f50057",
            light: "#ff4081",
            dark: "#c51162",
          },
          background: {
            default: "#f5f5f5",
            paper: "#ffffff",
          },
          text: {
            primary: "rgba(0, 0, 0, 0.87)",
            secondary: "rgba(0, 0, 0, 0.6)",
          },
          // Security-specific colors
          alert: {
            critical: "#d32f2f",
            high: "#f44336",
            medium: "#ff9800",
            low: "#ffeb3b",
            info: "#2196f3",
          },
          success: {
            main: "#4caf50",
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: "#90caf9",
            light: "#e3f2fd",
            dark: "#42a5f5",
          },
          secondary: {
            main: "#f48fb1",
            light: "#f8bbd0",
            dark: "#f06292",
          },
          background: {
            default: "#121212",
            paper: "#1e1e1e",
          },
          text: {
            primary: "#ffffff",
            secondary: "rgba(255, 255, 255, 0.7)",
          },
          // Security-specific colors
          alert: {
            critical: "#f44336",
            high: "#ff7961",
            medium: "#ffb74d",
            low: "#fff176",
            info: "#90caf9",
          },
          success: {
            main: "#81c784",
          },
        }),
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor:
            mode === "dark" ? "#6b6b6b #2b2b2b" : "#959595 #f5f5f5",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: mode === "dark" ? "#6b6b6b" : "#959595",
            minHeight: 24,
          },
          "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
            borderRadius: 8,
            backgroundColor: mode === "dark" ? "#2b2b2b" : "#f5f5f5",
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        color: mode === "dark" ? "default" : "primary",
      },
      styleOverrides: {
        root: {
          boxShadow:
            mode === "dark"
              ? "0px 2px 4px -1px rgba(0,0,0,0.4), 0px 4px 5px 0px rgba(0,0,0,0.35), 0px 1px 10px 0px rgba(0,0,0,0.32)"
              : "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            mode === "dark"
              ? "0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)"
              : "0px 2px 1px -1px rgba(0,0,0,0.1), 0px 1px 1px 0px rgba(0,0,0,0.07), 0px 1px 3px 0px rgba(0,0,0,0.06)",
          transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
          "&:hover": {
            boxShadow:
              mode === "dark"
                ? "0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 2px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)"
                : "0px 8px 10px -5px rgba(0,0,0,0.1), 0px 16px 24px 2px rgba(0,0,0,0.07), 0px 6px 30px 5px rgba(0,0,0,0.06)",
          },
        },
      },
    },
  },
});

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
}) => {
  // Get user preferences
  const { preferences, updateTheme } = useUserPreferences();

  // Set initial mode from preferences or default to light
  const [mode, setMode] = useState<PaletteMode>(
    preferences?.theme?.mode === "dark" ? "dark" : "light"
  );

  // Update mode when preferences change
  useEffect(() => {
    if (preferences?.theme?.mode) {
      setMode(preferences.theme.mode);
    }
  }, [preferences]);

  // Toggle theme mode
  const toggleColorMode = async () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);

    // Save preference to server
    if (updateTheme) {
      try {
        await updateTheme({
          mode: newMode,
          primaryColor: preferences?.theme?.primaryColor,
          secondaryColor: preferences?.theme?.secondaryColor,
        });
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }

    // Also save to local storage as backup
    localStorage.setItem("theme_mode", newMode);
  };

  // Generate theme with current mode - using proper type casting
  const theme = React.useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode, theme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
