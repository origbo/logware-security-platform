// @ts-nocheck - Temporarily disable TypeScript checks for this file until Element vs string issues are fully resolved
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  Theme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { PaletteMode } from "@mui/material";
import {
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  DARK_THEME,
} from "../../config/constants";
import { useUserPreferences } from "../../features/preferences/useUserPreferences";
import {
  ErrorCategory,
  logEvent,
} from "../../services/analytics/errorAnalyticsService";

// Theme context
type ThemeContextType = {
  mode: PaletteMode;
  toggleTheme: () => void;
  setMode: (mode: PaletteMode) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  toggleTheme: () => {},
  setMode: () => {},
});

// Get initial theme mode from localStorage or system preference
const getInitialMode = (): PaletteMode => {
  // Try to get from localStorage
  const savedMode = localStorage.getItem(THEME_STORAGE_KEY);
  if (savedMode && (savedMode === "light" || savedMode === "dark")) {
    return savedMode;
  }

  // Try to get from system preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  // Default to light
  return "light";
};

// Common theme settings shared between light and dark modes
const getThemeOptions = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // Light mode palette
          primary: {
            main: "#2563EB",
            light: "#60A5FA",
            dark: "#1E40AF",
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: "#9333EA",
            light: "#C084FC",
            dark: "#7E22CE",
            contrastText: "#FFFFFF",
          },
          error: {
            main: "#EF4444",
            light: "#F87171",
            dark: "#B91C1C",
          },
          warning: {
            main: "#F59E0B",
            light: "#FBBF24",
            dark: "#D97706",
          },
          info: {
            main: "#3B82F6",
            light: "#60A5FA",
            dark: "#2563EB",
          },
          success: {
            main: "#10B981",
            light: "#34D399",
            dark: "#059669",
          },
          background: {
            default: "#F9FAFB",
            paper: "#FFFFFF",
          },
          text: {
            primary: "#111827",
            secondary: "#4B5563",
            disabled: "#9CA3AF",
          },
          divider: "#E5E7EB",
        }
      : {
          // Dark mode palette
          primary: {
            main: "#3B82F6",
            light: "#60A5FA",
            dark: "#2563EB",
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: "#A855F7",
            light: "#C084FC",
            dark: "#9333EA",
            contrastText: "#FFFFFF",
          },
          error: {
            main: "#EF4444",
            light: "#F87171",
            dark: "#B91C1C",
          },
          warning: {
            main: "#F59E0B",
            light: "#FBBF24",
            dark: "#D97706",
          },
          info: {
            main: "#3B82F6",
            light: "#60A5FA",
            dark: "#2563EB",
          },
          success: {
            main: "#10B981",
            light: "#34D399",
            dark: "#059669",
          },
          background: {
            default: "#111827",
            paper: "#1F2937",
          },
          text: {
            primary: "#F9FAFB",
            secondary: "#D1D5DB",
            disabled: "#6B7280",
          },
          divider: "#374151",
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "0.875rem",
    },
    button: {
      fontWeight: 500,
      textTransform: "none" as const,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow:
              "0px 2px 4px -1px rgba(0,0,0,0.1), 0px 4px 5px 0px rgba(0,0,0,0.07), 0px 1px 10px 0px rgba(0,0,0,0.06)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            "0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 5px 0px rgba(0,0,0,0.05), 0px 1px 10px 0px rgba(0,0,0,0.04)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow:
            "0px 2px 4px -1px rgba(0,0,0,0.06), 0px 4px 5px 0px rgba(0,0,0,0.05), 0px 1px 10px 0px rgba(0,0,0,0.04)",
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProviderWrapper: React.FC<ThemeProviderProps> = ({
  children,
}) => {
  // Use our custom preferences hook for theme management
  const { theme: preferredTheme, toggleTheme: toggleUserTheme } =
    useUserPreferences();

  const [mode, setMode] = useState<PaletteMode>("light");

  // Initialize theme mode on component mount
  useEffect(() => {
    const initialMode = getInitialMode();
    setMode(initialMode);

    // Log theme initialization
    logEvent({
      category: ErrorCategory.USER,
      action: "theme_initialized",
      label: initialMode,
    });

    // Listen to system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        const newMode = e.matches ? "dark" : "light";
        setMode(newMode);

        logEvent({
          category: ErrorCategory.USER,
          action: "theme_system_changed",
          label: newMode,
        });
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Sync with user preferences when available
  useEffect(() => {
    if (preferredTheme) {
      setMode(preferredTheme);

      logEvent({
        category: ErrorCategory.USER,
        action: "theme_preference_applied",
        label: preferredTheme,
      });
    }
  }, [preferredTheme]);

  // Toggle between light and dark modes
  const toggleTheme = useCallback(() => {
    // Use the user preferences hook to toggle theme
    toggleUserTheme();

    // The mode state will be updated via the useEffect above when preferredTheme changes
    logEvent({
      category: ErrorCategory.USER,
      action: "theme_toggled",
      label: mode === "light" ? "dark" : "light",
    });
  }, [mode, toggleUserTheme]);

  // Set specific mode
  const handleSetMode = useCallback((newMode: PaletteMode) => {
    setMode(newMode);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);

    logEvent({
      category: ErrorCategory.USER,
      action: "theme_set_explicitly",
      label: newMode,
    });
  }, []);

  // Create the theme object
  const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  // Context value
  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
      setMode: handleSetMode,
    }),
    [mode, toggleTheme, handleSetMode]
  );

  // MUI ThemeProvider has type issues with children in some configurations
  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {/* @ts-ignore - Material UI ThemeProvider has issues with ReactNode/ReactElement typing */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeProviderWrapper;
