/**
 * ThreatMapWidget Component
 *
 * Visualizes geographic origin of security threats and attacks using
 * an interactive world map with real-time updates.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Tooltip,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Public as GlobeIcon,
} from "@mui/icons-material";
// Comment out the react-simple-maps imports
// import {
//   ComposableMap,
//   Geographies,
//   Geography,
//   Marker,
//   ZoomableGroup
// } from "react-simple-maps";

// Create a mock implementation for the missing map components
const SimplifiedWorldMap: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: '100%',
        height: 300,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.mode === 'dark' ? '#1a2027' : '#f5f5f5',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        World Map Visualization (requires react-simple-maps)
      </Typography>
      {children}
    </Box>
  );
};

// Mock components to replace react-simple-maps
const ComposableMap = SimplifiedWorldMap;
const Geographies = ({children}: {children: React.ReactNode}) => <>{children}</>;
const Geography = () => null;
const Marker = ({coordinates}: {coordinates: [number, number]}) => {
  const theme = useTheme();
  // Convert geo coordinates to relative position in the box
  const x = (coordinates[0] + 180) / 360 * 100; // longitude to x%
  const y = (90 - coordinates[1]) / 180 * 100; // latitude to y%
  
  return (
    <Box
      sx={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: theme.palette.error.main,
        transform: 'translate(-50%, -50%)',
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: theme.palette.error.main,
          opacity: 0.3,
          transform: 'translate(-50%, -50%)',
          left: '50%',
          top: '50%',
        }
      }}
    />
  );
};
const ZoomableGroup = ({children}: {children: React.ReactNode}) => <>{children}</>;


// World map topology JSON
const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

// Mock threat data
const threatLocations = [
  { name: "Russia", coordinates: [105.3188, 61.524], count: 128, active: true },
  { name: "China", coordinates: [104.1954, 35.8617], count: 94, active: true },
  {
    name: "North Korea",
    coordinates: [127.5101, 40.3399],
    count: 62,
    active: true,
  },
  { name: "Iran", coordinates: [53.688, 32.4279], count: 57, active: true },
  { name: "Nigeria", coordinates: [8.6753, 9.082], count: 45, active: false },
  { name: "Romania", coordinates: [25.0136, 45.9432], count: 38, active: true },
  {
    name: "Brazil",
    coordinates: [-51.9253, -14.235],
    count: 36,
    active: false,
  },
  {
    name: "Vietnam",
    coordinates: [108.2772, 14.0583],
    count: 31,
    active: true,
  },
  {
    name: "Indonesia",
    coordinates: [113.9213, -0.7893],
    count: 28,
    active: false,
  },
  {
    name: "United States",
    coordinates: [-95.7129, 37.0902],
    count: 23,
    active: true,
  },
];

type ViewType = "all" | "active" | "top5";

interface ThreatMapWidgetProps {
  title?: string;
  widgetId: string;
  onDelete?: (widgetId: string) => void;
}

const ThreatMapWidget: React.FC<ThreatMapWidgetProps> = ({
  title = "Global Threat Map",
  widgetId,
  onDelete,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [threats, setThreats] = useState(threatLocations);
  const [viewType, setViewType] = useState<ViewType>("all");

  // Filter threats based on view type
  const getFilteredThreats = () => {
    switch (viewType) {
      case "active":
        return threats.filter((threat) => threat.active);
      case "top5":
        return [...threats].sort((a, b) => b.count - a.count).slice(0, 5);
      default:
        return threats;
    }
  };

  // Handle view type change
  const handleViewTypeChange = (event: SelectChangeEvent<ViewType>) => {
    setViewType(event.target.value as ViewType);
  };

  // Refresh data
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      // In a real application, this would fetch new data
      setThreats(threatLocations);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    refreshData();

    // Real-time updates every 5 minutes
    const intervalId = setInterval(refreshData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Calculate marker size based on threat count
  const getMarkerSize = (count: number) => {
    const baseSize = 4;
    const maxSize = 18;
    // Log scale to prevent very large markers
    return Math.min(baseSize + Math.log10(count) * 5, maxSize);
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <GlobeIcon sx={{ mr: 1 }} />
            <Typography variant="h6">{title}</Typography>
          </Box>
        }
        action={
          <Box>
            <Tooltip title="Refresh data">
              <IconButton onClick={refreshData} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={() => onDelete?.(widgetId)}>
              <MoreIcon />
            </IconButton>
          </Box>
        }
      />
      <Divider />

      <Box sx={{ px: 2, pt: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="view-type-label">View</InputLabel>
          <Select
            labelId="view-type-label"
            id="view-type-select"
            value={viewType}
            label="View"
            onChange={handleViewTypeChange}
          >
            <MenuItem value="all">All Threats</MenuItem>
            <MenuItem value="active">Active Threats</MenuItem>
            <MenuItem value="top5">Top 5 Sources</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 0, pt: 2, position: "relative" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <ComposableMap
            projectionConfig={{
              scale: 140,
              rotation: [-10, 0, 0],
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={theme.palette.mode === "dark" ? "#333333" : "#EAEAEC"}
                    stroke={
                      theme.palette.mode === "dark" ? "#666666" : "#D6D6DA"
                    }
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        fill: theme.palette.primary.light,
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {getFilteredThreats().map(
              ({ name, coordinates, count, active }) => (
                <Marker
                  key={name}
                  coordinates={coordinates as [number, number]}
                >
                  <circle
                    r={getMarkerSize(count)}
                    fill={
                      active
                        ? theme.palette.error.main
                        : theme.palette.warning.main
                    }
                    fillOpacity={0.8}
                    stroke={theme.palette.background.paper}
                    strokeWidth={1}
                  />
                  <title>{`${name}: ${count} threats`}</title>
                </Marker>
              )
            )}
          </ComposableMap>
        )}

        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            borderRadius: 1,
            p: 1,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" display="block">
            Total Threats:{" "}
            {threats.reduce((sum, threat) => sum + threat.count, 0)}
          </Typography>
          <Typography variant="caption" display="block">
            Active Sources: {threats.filter((t) => t.active).length}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ThreatMapWidget;
