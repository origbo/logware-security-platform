import React, { useState } from "react";
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
  Typography,
  Chip,
  Stack,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DatePicker from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// Custom styled components
const StyledChip = styled(Chip)(({ theme }) => ({
  margin: "0 4px 4px 0",
  "&.critical": {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
  "&.high": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  },
  "&.medium": {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  "&.low": {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
  },
  "&.info": {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText,
  },
  "&.open": {
    backgroundColor: theme.palette.warning.light,
    borderColor: theme.palette.warning.main,
  },
  "&.in_progress": {
    backgroundColor: theme.palette.info.light,
    borderColor: theme.palette.info.main,
  },
  "&.resolved": {
    backgroundColor: theme.palette.success.light,
    borderColor: theme.palette.success.main,
  },
  "&.closed": {
    backgroundColor: theme.palette.grey[300],
    borderColor: theme.palette.grey[500],
  },
  "&.false_positive": {
    backgroundColor: theme.palette.grey[200],
    borderColor: theme.palette.grey[400],
  },
}));

// Props interface
interface AlertsFilterProps {
  severityOptions: string[];
  statusOptions: string[];
  typeOptions: string[];
  selectedSeverities: string[];
  selectedStatuses: string[];
  selectedTypes: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  onSeverityChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  onStatusChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  onTypeChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  onDateRangeChange: (dateRange: {
    start: string | null;
    end: string | null;
  }) => void;
}

// Utilities
const formatSeverityLabel = (severity: string): string => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

const formatStatusLabel = (status: string): string => {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const AlertsFilter: React.FC<AlertsFilterProps> = ({
  severityOptions,
  statusOptions,
  typeOptions,
  selectedSeverities,
  selectedStatuses,
  selectedTypes,
  dateRange,
  onSeverityChange,
  onStatusChange,
  onTypeChange,
  onDateRangeChange,
}) => {
  const theme = useTheme();

  // Handle date changes
  const handleStartDateChange = (date: Date | null) => {
    onDateRangeChange({
      start: date ? date.toISOString() : null,
      end: dateRange.end,
    });
  };

  const handleEndDateChange = (date: Date | null) => {
    onDateRangeChange({
      start: dateRange.start,
      end: date ? date.toISOString() : null,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        {/* Severity Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="severity-filter-label">Severity</InputLabel>
            <Select
              labelId="severity-filter-label"
              id="severity-filter"
              multiple
              value={selectedSeverities}
              onChange={onSeverityChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                  {(selected as string[]).map((value) => (
                    <StyledChip
                      key={value}
                      label={formatSeverityLabel(value)}
                      className={value}
                      size="small"
                    />
                  ))}
                </Box>
              )}
              label="Severity"
            >
              {severityOptions.map((severity) => (
                <MenuItem key={severity} value={severity}>
                  <Checkbox
                    checked={selectedSeverities.indexOf(severity) > -1}
                  />
                  <ListItemText primary={formatSeverityLabel(severity)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Status Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              multiple
              value={selectedStatuses}
              onChange={onStatusChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                  {(selected as string[]).map((value) => (
                    <StyledChip
                      key={value}
                      label={formatStatusLabel(value)}
                      className={value}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
              label="Status"
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  <Checkbox checked={selectedStatuses.indexOf(status) > -1} />
                  <ListItemText primary={formatStatusLabel(status)} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Alert Type Filter */}
        <Grid item xs={12} md={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="type-filter-label">Alert Type</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter"
              multiple
              value={selectedTypes}
              onChange={onTypeChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      sx={{ m: "0 4px 4px 0" }}
                    />
                  ))}
                </Box>
              )}
              label="Alert Type"
            >
              {typeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={selectedTypes.indexOf(type) > -1} />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Date Range Filter */}
        <Grid item xs={12} md={3}>
          <Typography variant="subtitle2" gutterBottom>
            Date Range
          </Typography>
          <Stack spacing={2}>
            <DatePicker
              label="From"
              value={dateRange.start ? new Date(dateRange.start) : null}
              onChange={handleStartDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  size: "small",
                },
              }}
            />
            <DatePicker
              label="To"
              value={dateRange.end ? new Date(dateRange.end) : null}
              onChange={handleEndDateChange}
              minDate={dateRange.start ? new Date(dateRange.start) : undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  size: "small",
                },
              }}
            />
          </Stack>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default AlertsFilter;
