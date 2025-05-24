import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Grid,
  Box,
  SelectChangeEvent,
  Paper,
  useTheme,
} from "@mui/material";
import { SoarWidgetType, WidgetSize } from "../../hooks/useSoarDashboard";

// Import widget preview icons/components
import SecurityIcon from "@mui/icons-material/Security";
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import BugReportIcon from "@mui/icons-material/BugReport";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";

export interface AddWidgetFormData {
  type: SoarWidgetType;
  title: string;
  size: WidgetSize;
}

interface AddWidgetDialogProps {
  open: boolean;
  onClose: () => void;
  onAddWidget: (widgetData: AddWidgetFormData) => void;
}

/**
 * Dialog for adding a new widget to the SOAR dashboard
 * Allows selection of widget type, title customization, and size
 */
const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({
  open,
  onClose,
  onAddWidget,
}) => {
  const theme = useTheme();

  // Default form values
  const [formData, setFormData] = useState<AddWidgetFormData>({
    type: SoarWidgetType.ACTIVE_CASES,
    title: "Active Cases",
    size: WidgetSize.MEDIUM,
  });

  // Get a default title for a widget type
  const getDefaultWidgetTitle = (type: SoarWidgetType): string => {
    switch (type) {
      case SoarWidgetType.ACTIVE_CASES:
        return "Active Cases";
      case SoarWidgetType.PLAYBOOK_PERFORMANCE:
        return "Playbook Performance";
      case SoarWidgetType.SOAR_ANALYTICS:
        return "SOAR Analytics";
      case SoarWidgetType.ALERT_TO_CASE:
        return "Alert to Case Conversion";
      case SoarWidgetType.NETWORK_VISUALIZATION:
        return "Network Visualization";
      case SoarWidgetType.CASE_TIMELINE:
        return "Case Timeline";
      default:
        return "New Widget";
    }
  };

  // Get an icon for a widget type
  const getWidgetIcon = (type: SoarWidgetType) => {
    switch (type) {
      case SoarWidgetType.ACTIVE_CASES:
        return <SecurityIcon sx={{ fontSize: 48 }} color="primary" />;
      case SoarWidgetType.PLAYBOOK_PERFORMANCE:
        return <AutoGraphIcon sx={{ fontSize: 48 }} color="primary" />;
      case SoarWidgetType.SOAR_ANALYTICS:
        return <BarChartIcon sx={{ fontSize: 48 }} color="primary" />;
      case SoarWidgetType.ALERT_TO_CASE:
        return <BugReportIcon sx={{ fontSize: 48 }} color="primary" />;
      case SoarWidgetType.NETWORK_VISUALIZATION:
        return <NetworkCheckIcon sx={{ fontSize: 48 }} color="primary" />;
      case SoarWidgetType.CASE_TIMELINE:
        return <TimelineIcon sx={{ fontSize: 48 }} color="primary" />;
      default:
        return <BarChartIcon sx={{ fontSize: 48 }} color="primary" />;
    }
  };

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;

    // For select components
    if (name === "type") {
      const widgetType = value as SoarWidgetType;
      setFormData({
        ...formData,
        [name]: widgetType,
        title: getDefaultWidgetTitle(widgetType),
      });
    } else {
      setFormData({
        ...formData,
        [name as string]: value,
      });
    }
  };

  // Handle add widget button click
  const handleAddWidget = () => {
    onAddWidget(formData);

    // Reset form to defaults
    setFormData({
      type: SoarWidgetType.ACTIVE_CASES,
      title: getDefaultWidgetTitle(SoarWidgetType.ACTIVE_CASES),
      size: WidgetSize.MEDIUM,
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Widget to Dashboard</DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Widget Type Select */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="widget-type-label">Widget Type</InputLabel>
              <Select
                labelId="widget-type-label"
                id="widget-type"
                name="type"
                value={formData.type}
                label="Widget Type"
                onChange={handleChange as (event: SelectChangeEvent) => void}
              >
                <MenuItem value={SoarWidgetType.ACTIVE_CASES}>
                  Active Cases
                </MenuItem>
                <MenuItem value={SoarWidgetType.PLAYBOOK_PERFORMANCE}>
                  Playbook Performance
                </MenuItem>
                <MenuItem value={SoarWidgetType.SOAR_ANALYTICS}>
                  SOAR Analytics
                </MenuItem>
                <MenuItem value={SoarWidgetType.ALERT_TO_CASE}>
                  Alert to Case Conversion
                </MenuItem>
                <MenuItem value={SoarWidgetType.NETWORK_VISUALIZATION}>
                  Network Visualization
                </MenuItem>
                <MenuItem value={SoarWidgetType.CASE_TIMELINE}>
                  Case Timeline
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              id="widget-title"
              name="title"
              label="Widget Title"
              value={formData.title}
              onChange={handleChange}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="widget-size-label">Widget Size</InputLabel>
              <Select
                labelId="widget-size-label"
                id="widget-size"
                name="size"
                value={formData.size}
                label="Widget Size"
                onChange={handleChange as (event: SelectChangeEvent) => void}
              >
                <MenuItem value={WidgetSize.SMALL}>Small (4x3)</MenuItem>
                <MenuItem value={WidgetSize.MEDIUM}>Medium (6x4)</MenuItem>
                <MenuItem value={WidgetSize.LARGE}>Large (8x6)</MenuItem>
                <MenuItem value={WidgetSize.XLARGE}>
                  Extra Large (12x8)
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Widget Preview */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Widget Preview
            </Typography>

            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRadius: 2,
                bgcolor: theme.palette.background.default,
              }}
            >
              {getWidgetIcon(formData.type)}

              <Typography variant="h6" sx={{ mt: 2 }}>
                {formData.title}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {formData.size === WidgetSize.SMALL && "Small (4x3)"}
                {formData.size === WidgetSize.MEDIUM && "Medium (6x4)"}
                {formData.size === WidgetSize.LARGE && "Large (8x6)"}
                {formData.size === WidgetSize.XLARGE && "Extra Large (12x8)"}
              </Typography>
            </Paper>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                This widget will display{" "}
                {formData.type === SoarWidgetType.ACTIVE_CASES &&
                  "information about active security cases by severity and status"}
                {formData.type === SoarWidgetType.PLAYBOOK_PERFORMANCE &&
                  "performance metrics for security playbooks execution"}
                {formData.type === SoarWidgetType.SOAR_ANALYTICS &&
                  "analytics and KPIs for the SOAR platform"}
                {formData.type === SoarWidgetType.ALERT_TO_CASE &&
                  "statistics on alert to case conversion rates"}
                {formData.type === SoarWidgetType.NETWORK_VISUALIZATION &&
                  "interactive network topology visualization"}
                {formData.type === SoarWidgetType.CASE_TIMELINE &&
                  "timeline view of important case activities"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAddWidget}
          variant="contained"
          color="primary"
          disabled={!formData.title.trim()}
        >
          Add Widget
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddWidgetDialog;
