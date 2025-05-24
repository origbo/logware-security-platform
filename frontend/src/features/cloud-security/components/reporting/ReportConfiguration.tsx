/**
 * Report Configuration Component
 *
 * Allows users to configure report settings
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  SelectChangeEvent,
  Chip,
  Divider,
  Tooltip,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  CloudOutlined as CloudIcon,
  Timeline as TimelineIcon,
  Description as FormatIcon,
  ViewHeadline as ContentIcon,
} from "@mui/icons-material";

// Report configuration types
export interface ReportConfigType {
  name: string;
  description: string;
  cloudProviders: string[];
  timeRange: string;
  format: string;
  includeExecutiveSummary: boolean;
  includeDetailedFindings: boolean;
  includeRemediation: boolean;
  includeComplianceMapping: boolean;
  includeResourceDetails: boolean;
}

interface ReportConfigurationProps {
  selectedTemplate: any;
  onConfigChange: (config: Partial<ReportConfigType>) => void;
  reportConfig: ReportConfigType;
}

/**
 * Report Configuration Component
 */
const ReportConfiguration: React.FC<ReportConfigurationProps> = ({
  selectedTemplate,
  onConfigChange,
  reportConfig,
}) => {
  const theme = useTheme();

  // Fetch configuration options from API
  // Mock data - replace with actual API call when available
  const isLoading = false;
  const isError = false;
  const configOptions = null;

  // State for configuration options
  const [cloudProviderOptions, setCloudProviderOptions] = useState([
    { value: "AWS", label: "AWS" },
    { value: "Azure", label: "Azure" },
    { value: "GCP", label: "Google Cloud" },
  ]);
  const [contentOptions, setContentOptions] = useState([
    { value: "includeExecutiveSummary", label: "Executive Summary" },
    { value: "includeDetailedFindings", label: "Detailed Findings" },
    { value: "includeRemediation", label: "Remediation Steps" },
    {
      value: "includeComplianceMapping",
      label: "Compliance Framework Mapping",
    },
    { value: "includeResourceDetails", label: "Resource Details" },
  ]);
  const [formatOptions, setFormatOptions] = useState([
    { value: "pdf", label: "PDF Document" },
    { value: "excel", label: "Excel Spreadsheet" },
    { value: "csv", label: "CSV Files" },
    { value: "html", label: "HTML Report" },
    { value: "json", label: "JSON Data" },
  ]);

  // Update options when API data changes
  useEffect(() => {
    // We're using mock data, so no need for null checks
    // This would be used with actual API calls
    // if (configOptions) {
    //   if (configOptions.cloudProviders) {
    //     setCloudProviderOptions(configOptions.cloudProviders);
    //   }
    //   if (configOptions.contentOptions) {
    //     setContentOptions(configOptions.contentOptions);
    //   }
    //   if (configOptions.formatOptions) {
    //     setFormatOptions(configOptions.formatOptions);
    //   }
    // }
  }, []); // Remove configOptions dependency since we're not using it

  // Handle provider selection
  const handleProvidersChange = (event: SelectChangeEvent<string[]>) => {
    const providers = event.target.value as string[];
    onConfigChange({ cloudProviders: providers });
  };

  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    onConfigChange({ timeRange: event.target.value });
  };

  // Handle format change
  const handleFormatChange = (event: SelectChangeEvent) => {
    onConfigChange({ format: event.target.value });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ [event.target.name]: event.target.checked });
  };

  // Handle text field changes
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ [event.target.name]: event.target.value });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure Report
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Customize your report settings and content.
      </Typography>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load configuration options. Using default options.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Info */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              1. Basic Information
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Report Name"
                  name="name"
                  value={reportConfig.name}
                  onChange={handleTextChange}
                  margin="normal"
                  placeholder="e.g., Monthly AWS Security Assessment"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={reportConfig.description}
                  onChange={handleTextChange}
                  margin="normal"
                  placeholder="Brief description of this report's purpose"
                  multiline
                  rows={2}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Scope Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CloudIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Scope
              </Typography>
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel id="cloud-providers-label">
                Cloud Providers
              </InputLabel>
              <Select
                labelId="cloud-providers-label"
                id="cloud-providers"
                multiple
                value={reportConfig.cloudProviders}
                onChange={handleProvidersChange}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((provider) => (
                      <Chip key={provider} label={provider} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="AWS">AWS</MenuItem>
                <MenuItem value="Azure">Azure</MenuItem>
                <MenuItem value="GCP">Google Cloud</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel id="time-range-label">Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                id="time-range"
                value={reportConfig.timeRange}
                onChange={handleTimeRangeChange}
              >
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 90 days</MenuItem>
                <MenuItem value="180">Last 6 months</MenuItem>
                <MenuItem value="365">Last 12 months</MenuItem>
                <MenuItem value="custom">Custom range</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Format & Content Settings */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              height: "100%",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FormatIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Format & Content
              </Typography>
            </Box>

            <FormControl fullWidth margin="normal">
              <InputLabel id="format-label">Report Format</InputLabel>
              <Select
                labelId="format-label"
                id="format"
                value={reportConfig.format}
                onChange={handleFormatChange}
              >
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                <MenuItem value="csv">CSV Files</MenuItem>
                <MenuItem value="html">HTML Report</MenuItem>
                <MenuItem value="json">JSON Data</MenuItem>
              </Select>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Include in Report:
            </Typography>

            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeExecutiveSummary}
                    onChange={handleCheckboxChange}
                    name="includeExecutiveSummary"
                  />
                }
                label="Executive Summary"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeDetailedFindings}
                    onChange={handleCheckboxChange}
                    name="includeDetailedFindings"
                  />
                }
                label="Detailed Findings"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeRemediation}
                    onChange={handleCheckboxChange}
                    name="includeRemediation"
                  />
                }
                label="Remediation Steps"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeComplianceMapping}
                    onChange={handleCheckboxChange}
                    name="includeComplianceMapping"
                  />
                }
                label="Compliance Framework Mapping"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeResourceDetails}
                    onChange={handleCheckboxChange}
                    name="includeResourceDetails"
                  />
                }
                label="Resource Details"
              />
            </FormGroup>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportConfiguration;
