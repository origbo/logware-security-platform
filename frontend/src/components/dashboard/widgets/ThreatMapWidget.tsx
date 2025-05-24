import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Public as PublicIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DashboardWidget } from "../../../services/dashboard/dashboardService";

// Define props interface
interface ThreatMapWidgetProps {
  data: any;
  widget: DashboardWidget;
}

// Define threat type
enum ThreatType {
  INTRUSION_ATTEMPT = "intrusion_attempt",
  MALWARE_DETECTED = "malware_detected",
  DDOS_ATTACK = "ddos_attack",
  DATA_EXFILTRATION = "data_exfiltration",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  BRUTE_FORCE = "brute_force",
  RECONNAISSANCE = "reconnaissance",
}

// Define threat severity
enum ThreatSeverity {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

// Define threat location
interface ThreatLocation {
  id: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  count: number;
  type: ThreatType;
  severity: ThreatSeverity;
  timestamp: string;
}

/**
 * ThreatMapWidget Component
 *
 * Displays a world map with threat origins visualized as heatmap points
 * with filtering by threat type, severity, and time range
 */
const ThreatMapWidget: React.FC<ThreatMapWidgetProps> = ({ data, widget }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [threatTypeFilter, setThreatTypeFilter] = useState<string>("all");
  const [mapInitialized, setMapInitialized] = useState(false);

  // Mock data for development
  const mockData = {
    totalThreats: 256,
    topCountries: [
      { country: "Russia", count: 45 },
      { country: "China", count: 38 },
      { country: "United States", count: 27 },
      { country: "Brazil", count: 18 },
      { country: "India", count: 15 },
    ],
    severityCounts: {
      [ThreatSeverity.CRITICAL]: 23,
      [ThreatSeverity.HIGH]: 78,
      [ThreatSeverity.MEDIUM]: 96,
      [ThreatSeverity.LOW]: 59,
    },
    threatLocations: [
      {
        id: "threat-1",
        latitude: 55.7558,
        longitude: 37.6173,
        country: "Russia",
        city: "Moscow",
        count: 15,
        type: ThreatType.INTRUSION_ATTEMPT,
        severity: ThreatSeverity.HIGH,
        timestamp: "2025-05-15T10:23:00Z",
      },
      {
        id: "threat-2",
        latitude: 39.9042,
        longitude: 116.4074,
        country: "China",
        city: "Beijing",
        count: 22,
        type: ThreatType.RECONNAISSANCE,
        severity: ThreatSeverity.MEDIUM,
        timestamp: "2025-05-15T11:05:00Z",
      },
      {
        id: "threat-3",
        latitude: 37.7749,
        longitude: -122.4194,
        country: "United States",
        city: "San Francisco",
        count: 8,
        type: ThreatType.BRUTE_FORCE,
        severity: ThreatSeverity.MEDIUM,
        timestamp: "2025-05-15T09:48:00Z",
      },
      {
        id: "threat-4",
        latitude: -23.5505,
        longitude: -46.6333,
        country: "Brazil",
        city: "São Paulo",
        count: 12,
        type: ThreatType.MALWARE_DETECTED,
        severity: ThreatSeverity.CRITICAL,
        timestamp: "2025-05-15T08:15:00Z",
      },
      {
        id: "threat-5",
        latitude: 51.5074,
        longitude: -0.1278,
        country: "United Kingdom",
        city: "London",
        count: 7,
        type: ThreatType.DDOS_ATTACK,
        severity: ThreatSeverity.HIGH,
        timestamp: "2025-05-15T12:37:00Z",
      },
      {
        id: "threat-6",
        latitude: 28.6139,
        longitude: 77.209,
        country: "India",
        city: "New Delhi",
        count: 9,
        type: ThreatType.SUSPICIOUS_ACTIVITY,
        severity: ThreatSeverity.LOW,
        timestamp: "2025-05-15T10:52:00Z",
      },
      {
        id: "threat-7",
        latitude: 48.8566,
        longitude: 2.3522,
        country: "France",
        city: "Paris",
        count: 5,
        type: ThreatType.DATA_EXFILTRATION,
        severity: ThreatSeverity.CRITICAL,
        timestamp: "2025-05-15T11:24:00Z",
      },
    ],
    lastUpdated: "2025-05-15T12:45:00Z",
  };

  // Use real data if available, otherwise use mock data
  const threatData = data || mockData;

  // Get filtered threats
  const getFilteredThreats = (): ThreatLocation[] => {
    if (threatTypeFilter === "all") {
      return threatData.threatLocations;
    }
    return threatData.threatLocations.filter(
      (threat) => threat.type === threatTypeFilter
    );
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  // Get color based on threat severity
  const getSeverityColor = (severity: ThreatSeverity): string => {
    switch (severity) {
      case ThreatSeverity.CRITICAL:
        return theme.palette.error.main;
      case ThreatSeverity.HIGH:
        return theme.palette.error.light;
      case ThreatSeverity.MEDIUM:
        return theme.palette.warning.main;
      case ThreatSeverity.LOW:
        return theme.palette.warning.light;
      default:
        return theme.palette.grey[500];
    }
  };

  // Format threat type for display
  const formatThreatType = (type: ThreatType): string => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Initialize map after component mounts
  useEffect(() => {
    if (!mapInitialized && mapContainerRef.current) {
      // In a real implementation, this would initialize a map library
      // like Leaflet, Google Maps, or a D3.js geo visualization
      initializeMap();
    }
  }, [mapContainerRef, mapInitialized]);

  // Initialize map function (placeholder - would use an actual mapping library in a real implementation)
  const initializeMap = () => {
    if (!mapContainerRef.current) return;

    // Create a simple world map visualization using CSS
    const container = mapContainerRef.current;
    container.innerHTML = "";

    // Create map background
    const mapBackground = document.createElement("div");
    mapBackground.className = "map-background";
    mapBackground.style.position = "absolute";
    mapBackground.style.top = "0";
    mapBackground.style.left = "0";
    mapBackground.style.right = "0";
    mapBackground.style.bottom = "0";
    mapBackground.style.backgroundColor = alpha(
      theme.palette.primary.main,
      0.05
    );
    mapBackground.style.borderRadius = "4px";
    container.appendChild(mapBackground);

    // Add threat points to the map
    getFilteredThreats().forEach((threat) => {
      const point = document.createElement("div");
      point.className = "threat-point";
      point.style.position = "absolute";

      // Convert lat/long to x,y coordinates (simplified for demo)
      // In a real implementation, this would use proper map projection
      const x = ((threat.longitude + 180) / 360) * 100;
      const y = ((90 - threat.latitude) / 180) * 100;

      point.style.left = `${x}%`;
      point.style.top = `${y}%`;
      point.style.width = `${Math.min(20, threat.count + 5)}px`;
      point.style.height = `${Math.min(20, threat.count + 5)}px`;
      point.style.borderRadius = "50%";
      point.style.backgroundColor = alpha(
        getSeverityColor(threat.severity),
        0.6
      );
      point.style.boxShadow = `0 0 ${Math.min(
        15,
        threat.count + 3
      )}px ${getSeverityColor(threat.severity)}`;
      point.style.transform = "translate(-50%, -50%)";
      point.style.zIndex =
        threat.severity === ThreatSeverity.CRITICAL ? "5" : "1";
      point.style.cursor = "pointer";

      // Add tooltip
      point.title = `${threat.city}, ${threat.country}\n${formatThreatType(
        threat.type
      )}\nCount: ${threat.count}`;

      container.appendChild(point);
    });

    // Add a simple world map outline using a background image
    // In a real implementation, this would be a proper map layer
    mapBackground.style.backgroundImage =
      "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTA2LjggMTQwLjdDNTEuNiAxMzEuOSA0OS44IDE2OS45IDMzLjggMTg2LjVjLTE2IDQuOS0xMS41IDQ3LjQtMTEuNSA2Mi4zIDAgMTEuOCAxOS42IDQ0LjMgMTkuOCA1NS45LjMgMTMuNS0yMC4zIDQ3LjItMjAuMyA2Mi4yIDAgMTIuMSAyNy4xIDQ3LjQgMzYuOCA2NS44IDguNSAxNi4xIDMwLjEgMzMuNyA1MC4yIDQ0LjQgMjIuOSAxMi4yIDQ2LjIgMjguMyA3MS42IDI4LjMgMjEuNyAwIDMyLjMtMTguOSA1MC40LTM0LjggMTIuNi0xMS4xIDQyLjgtMjYuOSA1Mi43LTM5LjEgOS41LTExLjctMS43LTM5LjYgOS4yLTUwLjUgMTIuMy0xMi4yIDM3LjQtMTIuNyA1My0xOC41IDE3LjUtNi42IDQ1LjEtMTkuOCA1OS44LTMxLjIgMTIuNS05LjYgMjUuMi0yOS4xIDI2LjgtNDQuMiAxLjctMTYtMTEuNC0zMi42LTIwLjctNDUuMi0xMS4zLTE1LjItMzMuOS0yOC43LTUwLjQtMzkuNC0xOS44LTEyLjgtMzEuMS00MS4zLTUwLjQtNTEtMTkuOC05LjktNTIuMi01LjctNzUuNC01LjctMzEuNCAwLTc1LjYtMjEuMS0xMDcuNy0xMC40LTkuOSAzLjMtMjUgMTUuNy0xOS45IDI2LjVaIiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')";
    mapBackground.style.backgroundRepeat = "no-repeat";
    mapBackground.style.backgroundPosition = "center";
    mapBackground.style.backgroundSize = "contain";

    setMapInitialized(true);
  };

  // Update map when filters change
  useEffect(() => {
    if (mapInitialized) {
      initializeMap();
    }
  }, [threatTypeFilter, timeRange, mapInitialized, theme]);

  // Handle time range change
  const handleTimeRangeChange = (event: any) => {
    setTimeRange(event.target.value);
  };

  // Handle threat type filter change
  const handleThreatTypeFilterChange = (event: any) => {
    setThreatTypeFilter(event.target.value);
  };

  // Handle refresh
  const handleRefresh = () => {
    // In a real implementation, this would refresh threat data
    console.log("Refreshing threat map data");
  };

  // Handle view all threats
  const handleViewAllThreats = () => {
    navigate("/threats");
  };

  // Format severity for display
  const formatSeverity = (severity: ThreatSeverity): string => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header with filters */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PublicIcon sx={{ mr: 1, color: "text.secondary" }} />
          <Typography variant="subtitle2" color="text.secondary">
            Global Threat Activity
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton size="small" onClick={handleRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 1,
          mb: 1,
        }}
      >
        <FormControl size="small" sx={{ flexGrow: 1 }}>
          <InputLabel id="threat-type-label">Threat Type</InputLabel>
          <Select
            labelId="threat-type-label"
            id="threat-type"
            value={threatTypeFilter}
            label="Threat Type"
            onChange={handleThreatTypeFilterChange}
          >
            <MenuItem value="all">All Threats</MenuItem>
            {Object.values(ThreatType).map((type) => (
              <MenuItem key={type} value={type}>
                {formatThreatType(type)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: 120 }}>
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            id="time-range"
            value={timeRange}
            label="Time Range"
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="1h">1 Hour</MenuItem>
            <MenuItem value="24h">24 Hours</MenuItem>
            <MenuItem value="7d">7 Days</MenuItem>
            <MenuItem value="30d">30 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Threat summary */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography variant="body2">
          Total Threats:{" "}
          <Typography component="span" fontWeight="bold">
            {threatData.totalThreats}
          </Typography>
        </Typography>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Critical Threats">
            <Chip
              icon={<ErrorIcon />}
              label={threatData.severityCounts[ThreatSeverity.CRITICAL]}
              size="small"
              color="error"
              variant="outlined"
              sx={{
                height: 20,
                "& .MuiChip-label": { px: 0.5, fontSize: "0.7rem" },
              }}
            />
          </Tooltip>

          <Tooltip title="High Threats">
            <Chip
              icon={<WarningIcon />}
              label={threatData.severityCounts[ThreatSeverity.HIGH]}
              size="small"
              color="warning"
              variant="outlined"
              sx={{
                height: 20,
                "& .MuiChip-label": { px: 0.5, fontSize: "0.7rem" },
              }}
            />
          </Tooltip>
        </Box>
      </Box>

      {/* Map */}
      <Box
        ref={mapContainerRef}
        sx={{
          flexGrow: 1,
          position: "relative",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: alpha(theme.palette.background.default, 0.5),
          mb: 1,
        }}
      />

      {/* Top countries */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Top Source Countries
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {threatData.topCountries.slice(0, 5).map((country, index) => (
            <Chip
              key={country.country}
              label={`${country.country} (${country.count})`}
              size="small"
              sx={{
                height: 20,
                "& .MuiChip-label": { px: 1, fontSize: "0.7rem" },
                bgcolor: alpha(
                  theme.palette.primary.main,
                  0.05 + (0.15 * (5 - index)) / 5
                ),
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: "auto", pt: 1, textAlign: "right" }}>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={handleViewAllThreats}
          size="small"
        >
          View All Threats
        </Button>
      </Box>
    </Box>
  );
};

export default ThreatMapWidget;
