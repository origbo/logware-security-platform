import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

// Example component with fontSize issues
const SystemHealthWidgetExample: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">System Health Example</Typography>

      {/* Example of incorrect fontSize usage */}
      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
        <InfoIcon fontSize="medium" sx={{ mr: 1 }} />
        <Typography>This has an incorrect fontSize value</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
        <WarningIcon fontSize="medium" sx={{ mr: 1 }} />
        <Typography>This also has an incorrect fontSize value</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
        <ErrorIcon fontSize="large" sx={{ mr: 1 }} />
        <Typography>This has a correct fontSize value</Typography>
      </Box>
    </Box>
  );
};

export default SystemHealthWidgetExample;
