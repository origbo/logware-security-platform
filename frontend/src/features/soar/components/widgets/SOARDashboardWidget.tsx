import React from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  SxProps,
  Theme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import FullscreenIcon from "@mui/icons-material/Fullscreen";

export interface SOARWidgetProps {
  title: string;
  height?: number | string;
  onRefresh?: () => void;
  onMenu?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFullscreen?: () => void;
  refreshing?: boolean;
  sx?: SxProps<Theme>;
  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
}

/**
 * Base widget component for SOAR dashboard
 * Provides consistent styling and standard widget actions (refresh, menu, fullscreen)
 */
const SOARDashboardWidget: React.FC<
  React.PropsWithChildren<SOARWidgetProps>
> = ({
  title,
  children,
  height = "auto",
  onRefresh,
  onMenu,
  onFullscreen,
  refreshing = false,
  sx = {},
  headerSx = {},
  contentSx = {},
}) => {
  return (
    <Paper
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          pl: 2,
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette.background.default
              : theme.palette.background.paper,
          ...headerSx,
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{ fontSize: "1rem", fontWeight: 500 }}
        >
          {title}
        </Typography>
        <Box>
          {onRefresh && (
            <IconButton
              size="small"
              onClick={onRefresh}
              disabled={refreshing}
              title="Refresh widget"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}

          {onFullscreen && (
            <IconButton
              size="small"
              onClick={onFullscreen}
              title="View fullscreen"
            >
              <FullscreenIcon fontSize="small" />
            </IconButton>
          )}

          {onMenu && (
            <IconButton size="small" onClick={onMenu} title="Widget options">
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          flexGrow: 1,
          overflow: "auto",
          ...contentSx,
        }}
      >
        {children}
      </Box>
    </Paper>
  );
};

export default SOARDashboardWidget;
