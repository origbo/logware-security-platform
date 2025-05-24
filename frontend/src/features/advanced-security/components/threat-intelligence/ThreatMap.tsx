/**
 * Threat Map
 *
 * Component for displaying global threat intelligence data on a world map
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  CircularProgress,
  Alert,
  Chip,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import ReactTooltip from "react-tooltip";

import { useGetThreatMapDataQuery } from "../../services/threatIntelligenceService";
import { ThreatCategory, IndicatorType } from "../../types/threatIntelTypes";

// GeoJSON map data
const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

// Interface for threat location data
interface ThreatLocation {
  id: string;
  latitude: number;
  longitude: number;
  country: string;
  city?: string;
  count: number;
  category: ThreatCategory;
  type: IndicatorType;
  confidence: number;
}

// Interface for country threat data
interface CountryThreatData {
  id: string;
  name: string;
  count: number;
  threatCategories: Record<ThreatCategory, number>;
  indicatorTypes: Record<IndicatorType, number>;
}

const ThreatMap: React.FC = () => {
  const theme = useTheme();

  // State for map controls
  const [filterCategory, setFilterCategory] = useState<ThreatCategory | "">("");
  const [filterType, setFilterType] = useState<IndicatorType | "">("");
  const [minConfidence, setMinConfidence] = useState(0);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);

  // State for map position
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });

  // State for tooltips
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipEnabled, setTooltipEnabled] = useState(false);

  // Query for fetching map data
  const { data, isLoading, error } = useGetThreatMapDataQuery();

  // Enable tooltips after render
  useEffect(() => {
    setTooltipEnabled(true);
  }, []);

  // Apply filters to threat locations
  const filteredLocations =
    data?.threatLocations.filter((location) => {
      if (filterCategory && location.category !== filterCategory) {
        return false;
      }

      if (filterType && location.type !== filterType) {
        return false;
      }

      if (location.confidence < minConfidence) {
        return false;
      }

      return true;
    }) || [];

  // Apply filters to country data
  const filteredCountryData =
    data?.countryThreatData.filter((country) => {
      if (filterCategory) {
        return country.threatCategories[filterCategory] > 0;
      }

      if (filterType) {
        return country.indicatorTypes[filterType] > 0;
      }

      return true;
    }) || [];

  // Create color scale for heatmap
  const maxCountryCount =
    filteredCountryData.length > 0
      ? Math.max(...filteredCountryData.map((c) => c.count))
      : 0;

  const colorScale = scaleLinear<string>()
    .domain([0, maxCountryCount / 2, maxCountryCount])
    .range([
      theme.palette.primary.light,
      theme.palette.warning.main,
      theme.palette.error.dark,
    ]);

  // Handle map zoom
  const handleZoom = (zoom: number) => {
    setPosition((pos) => ({ ...pos, zoom }));
  };

  // Handle map movement
  const handleMoveEnd = (position: {
    coordinates: [number, number];
    zoom: number;
  }) => {
    setPosition(position);
  };

  // Get color for threat category
  const getCategoryColor = (category: ThreatCategory) => {
    switch (category) {
      case "MALWARE":
        return theme.palette.error.main;
      case "PHISHING":
        return theme.palette.warning.main;
      case "COMMAND_AND_CONTROL":
        return theme.palette.info.main;
      case "VULNERABILITY":
        return theme.palette.primary.main;
      case "RANSOMWARE":
        return theme.palette.error.dark;
      case "DATA_LEAK":
        return theme.palette.secondary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get color for indicator type
  const getTypeColor = (type: IndicatorType) => {
    switch (type) {
      case "IP":
        return theme.palette.primary.main;
      case "DOMAIN":
        return theme.palette.secondary.main;
      case "URL":
        return theme.palette.error.main;
      case "FILE_HASH":
        return theme.palette.warning.main;
      case "EMAIL":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Calculate marker size based on count and zoom level
  const getMarkerSize = (count: number) => {
    const baseSize = 3 + Math.min(count / 10, 5);
    return baseSize * (position.zoom > 2 ? 1 / (position.zoom / 2) : 1);
  };

  // Calculate top stats
  const calculateTopStats = () => {
    if (!data) return null;

    // Top countries by threat count
    const topCountries = [...data.countryThreatData]
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top categories
    const categoryTotals: Record<ThreatCategory, number> = {} as Record<
      ThreatCategory,
      number
    >;
    data.threatLocations.forEach((location) => {
      categoryTotals[location.category] =
        (categoryTotals[location.category] || 0) + location.count;
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([category, count]) => ({
        category: category as ThreatCategory,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { topCountries, topCategories };
  };

  const topStats = calculateTopStats();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading threat map data. Please try again.
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No threat map data available.
      </Alert>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Threat Category</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(e.target.value as ThreatCategory | "")
                }
                label="Threat Category"
              >
                <MenuItem value="">
                  <em>All Categories</em>
                </MenuItem>
                {Object.values(ThreatCategory).map((category) => (
                  <MenuItem key={category} value={category}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: getCategoryColor(category),
                          mr: 1,
                        }}
                      />
                      {category}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Indicator Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) =>
                  setFilterType(e.target.value as IndicatorType | "")
                }
                label="Indicator Type"
              >
                <MenuItem value="">
                  <em>All Types</em>
                </MenuItem>
                {Object.values(IndicatorType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" gutterBottom>
              Minimum Confidence: {minConfidence}%
            </Typography>
            <Slider
              value={minConfidence}
              onChange={(e, value) => setMinConfidence(value as number)}
              aria-labelledby="confidence-slider"
              valueLabelDisplay="auto"
              step={5}
              min={0}
              max={100}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Heatmap"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showMarkers}
                    onChange={(e) => setShowMarkers(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Markers"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Threats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Total Threats
              </Typography>
              <Typography variant="h4">
                {data.totalThreats.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Countries Affected */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Countries Affected
              </Typography>
              <Typography variant="h4">
                {data.countryThreatData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Campaigns */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Active Campaigns
              </Typography>
              <Typography variant="h4">{data.activeCampaigns}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Average Confidence */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Average Confidence
              </Typography>
              <Typography variant="h4">{data.avgConfidence}%</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Map Container */}
      <Paper sx={{ height: 500, position: "relative", mb: 3 }}>
        <ComposableMap
          data-tip=""
          projectionConfig={{ scale: 170 }}
          width={980}
          height={500}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryData = filteredCountryData.find(
                    (c) => c.id === geo.properties.ISO_A2
                  );

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        const { NAME } = geo.properties;
                        const threatCount = countryData ? countryData.count : 0;
                        setTooltipContent(`${NAME}: ${threatCount} threats`);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
                      }}
                      style={{
                        default: {
                          fill:
                            showHeatmap && countryData
                              ? colorScale(countryData.count)
                              : theme.palette.grey[300],
                          stroke: theme.palette.grey[500],
                          strokeWidth: 0.5,
                          outline: "none",
                        },
                        hover: {
                          fill: theme.palette.primary.light,
                          stroke: theme.palette.primary.main,
                          strokeWidth: 0.75,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: theme.palette.primary.main,
                          stroke: theme.palette.primary.dark,
                          strokeWidth: 1,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {showMarkers &&
              filteredLocations.map(
                ({
                  id,
                  latitude,
                  longitude,
                  count,
                  category,
                  type,
                  confidence,
                }) => (
                  <Marker
                    key={id}
                    coordinates={[longitude, latitude]}
                    onMouseEnter={() => {
                      setTooltipContent(`
                    <div>
                      <strong>Category:</strong> ${category}<br />
                      <strong>Type:</strong> ${type}<br />
                      <strong>Count:</strong> ${count}<br />
                      <strong>Confidence:</strong> ${confidence}%
                    </div>
                  `);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                  >
                    <circle
                      r={getMarkerSize(count)}
                      fill={getCategoryColor(category)}
                      fillOpacity={0.8}
                      stroke={theme.palette.background.paper}
                      strokeWidth={0.5}
                    />
                  </Marker>
                )
              )}
          </ZoomableGroup>
        </ComposableMap>

        {tooltipEnabled && (
          <ReactTooltip
            html
            backgroundColor={theme.palette.background.paper}
            textColor={theme.palette.text.primary}
            border
            borderColor={theme.palette.divider}
          >
            {tooltipContent}
          </ReactTooltip>
        )}

        {/* Map Controls */}
        <Box sx={{ position: "absolute", bottom: 20, right: 20, zIndex: 10 }}>
          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.8)",
              borderRadius: 1,
              p: 1,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Tooltip title="Zoom In">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => handleZoom(Math.min(position.zoom + 0.5, 4))}
              >
                +
              </Box>
            </Tooltip>
            <Tooltip title="Zoom Out">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => handleZoom(Math.max(position.zoom - 0.5, 1))}
              >
                -
              </Box>
            </Tooltip>
            <Tooltip title="Reset View">
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: theme.palette.primary.main,
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => setPosition({ coordinates: [0, 20], zoom: 1 })}
              >
                ↺
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Bottom Stats */}
      <Grid container spacing={3}>
        {/* Top Countries */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Countries by Threat Count
            </Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              {topStats?.topCountries.map((country) => (
                <Box key={country.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">{country.name}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {country.count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: theme.palette.grey[200],
                      borderRadius: 1,
                      height: 8,
                    }}
                  >
                    <Box
                      sx={{
                        width: `${
                          (country.count / topStats.topCountries[0].count) * 100
                        }%`,
                        bgcolor:
                          country.count > topStats.topCountries[0].count / 2
                            ? theme.palette.error.main
                            : theme.palette.warning.main,
                        height: 8,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Top Categories */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Threat Categories
            </Typography>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              {topStats?.topCategories.map((item) => (
                <Box key={item.category}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: getCategoryColor(item.category),
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2">{item.category}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.count}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      bgcolor: theme.palette.grey[200],
                      borderRadius: 1,
                      height: 8,
                    }}
                  >
                    <Box
                      sx={{
                        width: `${
                          (item.count / topStats.topCategories[0].count) * 100
                        }%`,
                        bgcolor: getCategoryColor(item.category),
                        height: 8,
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export { ThreatMap };
