import React from "react";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useThemeContext } from "../../theme/ThemeProvider";

interface ThemeSwitcherProps {
  tooltipPlacement?: "top" | "bottom" | "left" | "right";
}

/**
 * Theme Switcher Component
 *
 * Provides a button that toggles between light and dark mode
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  tooltipPlacement = "bottom",
}) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeContext();

  return (
    <Tooltip
      title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
      placement={tooltipPlacement}
    >
      <IconButton
        onClick={toggleColorMode}
        color="inherit"
        aria-label="toggle theme"
      >
        {mode === "light" ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;
