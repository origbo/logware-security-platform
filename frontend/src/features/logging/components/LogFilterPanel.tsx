import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Button,
  Divider,
  OutlinedInput,
  Checkbox,
  ListItemText,
  SelectChangeEvent,
  useTheme,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { LogLevel, LogSource, LogFilter } from "../services/LogViewerService";

interface LogFilterPanelProps {
  filter: LogFilter;
  onFilterChange: (filter: LogFilter) => void;
  onClose: () => void;
}

/**
 * Log Filter Panel Component
 *
 * Advanced filter panel for the log viewer
 */
const LogFilterPanel: React.FC<LogFilterPanelProps> = ({
  filter,
  onFilterChange,
  onClose,
}) => {
  const theme = useTheme();
  const [localFilter, setLocalFilter] = useState<LogFilter>({ ...filter });

  // Menu props for multi-select
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  // Apply filter changes
  const applyFilter = () => {
    onFilterChange(localFilter);
    onClose();
  };

  // Reset filter to default
  const resetFilter = () => {
    const defaultFilter: LogFilter = {
      levels: Object.values(LogLevel),
      limit: 100,
    };

    setLocalFilter(defaultFilter);
    onFilterChange(defaultFilter);
  };

  // Handle level change
  const handleLevelChange = (event: SelectChangeEvent<LogLevel[]>) => {
    const value = event.target.value as LogLevel[];
    setLocalFilter((prev) => ({ ...prev, levels: value }));
  };

  // Handle source change
  const handleSourceChange = (event: SelectChangeEvent<LogSource[]>) => {
    const value = event.target.value as LogSource[];
    setLocalFilter((prev) => ({ ...prev, sources: value }));
  };

  // Handle start time change
  const handleStartTimeChange = (value: Date | null) => {
    setLocalFilter((prev) => ({
      ...prev,
      startTime: value ? value.toISOString() : undefined,
    }));
  };

  // Handle end time change
  const handleEndTimeChange = (value: Date | null) => {
    setLocalFilter((prev) => ({
      ...prev,
      endTime: value ? value.toISOString() : undefined,
    }));
  };

  // Handle text field changes
  const handleTextChange =
    (field: keyof LogFilter) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLocalFilter((prev) => ({
        ...prev,
        [field]: event.target.value || undefined,
      }));
    };

  // Handle limit change
  const handleLimitChange = (event: SelectChangeEvent) => {
    setLocalFilter((prev) => ({
      ...prev,
      limit: parseInt(event.target.value),
    }));
  };

  // Clear a specific filter
  const clearFilter = (field: keyof LogFilter) => {
    setLocalFilter((prev) => {
      const newFilter = { ...prev };
      if (field === "levels") {
        newFilter.levels = Object.values(LogLevel);
      } else {
        delete newFilter[field];
      }
      return newFilter;
    });
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" component="h2">
          Advanced Log Filters
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={applyFilter}
        >
          Apply Filters
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Grid container spacing={2}>
        {/* Log Levels */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="log-level-label">Log Levels</InputLabel>
            <Select
              labelId="log-level-label"
              multiple
              value={localFilter.levels || []}
              onChange={handleLevelChange}
              input={<OutlinedInput label="Log Levels" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as LogLevel[]).map((level) => (
                    <Chip key={level} label={level} size="small" />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {Object.values(LogLevel).map((level) => (
                <MenuItem key={level} value={level}>
                  <Checkbox
                    checked={(localFilter.levels || []).indexOf(level) > -1}
                  />
                  <ListItemText primary={level} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Log Sources */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="log-source-label">Log Sources</InputLabel>
            <Select
              labelId="log-source-label"
              multiple
              value={localFilter.sources || []}
              onChange={handleSourceChange}
              input={<OutlinedInput label="Log Sources" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as LogSource[]).map((source) => (
                    <Chip key={source} label={source} size="small" />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {Object.values(LogSource).map((source) => (
                <MenuItem key={source} value={source}>
                  <Checkbox
                    checked={(localFilter.sources || []).indexOf(source) > -1}
                  />
                  <ListItemText primary={source} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Time Range */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Time Range
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Start Time"
              value={
                localFilter.startTime ? new Date(localFilter.startTime) : null
              }
              onChange={handleStartTimeChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  InputProps: {
                    endAdornment: localFilter.startTime ? (
                      <Button
                        size="small"
                        onClick={() => clearFilter("startTime")}
                        sx={{ minWidth: "30px", p: 0 }}
                      >
                        <ClearIcon fontSize="small" />
                      </Button>
                    ) : null,
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="End Time"
              value={localFilter.endTime ? new Date(localFilter.endTime) : null}
              onChange={handleEndTimeChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                  InputProps: {
                    endAdornment: localFilter.endTime ? (
                      <Button
                        size="small"
                        onClick={() => clearFilter("endTime")}
                        sx={{ minWidth: "30px", p: 0 }}
                      >
                        <ClearIcon fontSize="small" />
                      </Button>
                    ) : null,
                  },
                },
              }}
            />
          </LocalizationProvider>
        </Grid>

        {/* Additional Filters */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="User ID"
            value={localFilter.userId || ""}
            onChange={handleTextChange("userId")}
            InputProps={{
              endAdornment: localFilter.userId ? (
                <Button
                  size="small"
                  onClick={() => clearFilter("userId")}
                  sx={{ minWidth: "30px", p: 0 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              ) : null,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Correlation ID"
            value={localFilter.correlationId || ""}
            onChange={handleTextChange("correlationId")}
            InputProps={{
              endAdornment: localFilter.correlationId ? (
                <Button
                  size="small"
                  onClick={() => clearFilter("correlationId")}
                  sx={{ minWidth: "30px", p: 0 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              ) : null,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="IP Address"
            value={localFilter.ipAddress || ""}
            onChange={handleTextChange("ipAddress")}
            InputProps={{
              endAdornment: localFilter.ipAddress ? (
                <Button
                  size="small"
                  onClick={() => clearFilter("ipAddress")}
                  sx={{ minWidth: "30px", p: 0 }}
                >
                  <ClearIcon fontSize="small" />
                </Button>
              ) : null,
            }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel id="log-limit-label">Result Limit</InputLabel>
            <Select
              labelId="log-limit-label"
              value={localFilter.limit?.toString() || "100"}
              label="Result Limit"
              onChange={handleLimitChange}
            >
              <MenuItem value="50">50 entries</MenuItem>
              <MenuItem value="100">100 entries</MenuItem>
              <MenuItem value="200">200 entries</MenuItem>
              <MenuItem value="500">500 entries</MenuItem>
              <MenuItem value="1000">1000 entries</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button variant="text" startIcon={<ClearIcon />} onClick={resetFilter}>
          Reset All Filters
        </Button>

        <Box>
          <Button sx={{ mr: 1 }} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FilterIcon />}
            onClick={applyFilter}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LogFilterPanel;
