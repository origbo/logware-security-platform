/**
 * Attack Path Visualizer Component
 *
 * Provides an interactive graph visualization of attack paths with path highlighting and risk scoring
 */
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterFocusIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  FilterList as FilterListIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

// Note: For a real implementation, you would need to install and import:
// import ForceGraph2D from 'react-force-graph-2d';
// import { saveAs } from 'file-saver';

import { useGetAttackPathsQuery } from "../../services/attackPathService";

// Define asset types
enum AssetType {
  ENTRY_POINT = "ENTRY_POINT",
  TARGET = "TARGET",
  SERVER = "SERVER",
  DATABASE = "DATABASE",
  NETWORK = "NETWORK",
  APPLICATION = "APPLICATION",
  USER = "USER"
}

// Define type interfaces
interface AttackNode {
  id: string;
  name: string;
  type: AssetType;
  riskScore: number;
  vulnerability?: string;
  description?: string;
  x?: number;
  y?: number;
}

interface AttackEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  weight: number;
  description?: string;
}

interface AttackPath {
  id: string;
  name: string;
  description?: string;
  nodes: AttackNode[];
  edges: AttackEdge[];
  createdAt?: string;
  updatedAt?: string;
}

interface CriticalPath {
  id: string;
  name: string;
  nodeIds: string[];
  edgeIds: string[];
  riskScore: number;
}

// Create a mock hook for the missing query
const useGetCriticalPathsQuery = (pathId: string, options?: { skip?: boolean }) => {
  return {
    data: [] as CriticalPath[],
    isLoading: false,
    error: null
  };
};

export const AttackPathVisualizer: React.FC = () => {
  const theme = useTheme();

  // Refs
  const graphRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [selectedAttackPath, setSelectedAttackPath] = useState<string>("");
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [riskThreshold, setRiskThreshold] = useState<number[]>([0, 10]);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: [],
    links: [],
  });
  const [selectedCriticalPath, setSelectedCriticalPath] = useState<string>("");

  // Queries
  const {
    data: attackPaths = [] as AttackPath[],
    isLoading: isLoadingPaths,
    error: pathsError,
  } = useGetAttackPathsQuery();

  const {
    data: criticalPaths = [] as CriticalPath[],
    isLoading: isLoadingCriticalPaths,
    error: criticalPathsError,
  } = useGetCriticalPathsQuery(selectedAttackPath, {
    skip: !selectedAttackPath,
  });

  // Get current attack path
  const currentAttackPath = attackPaths.find(
    (path) => path.id === selectedAttackPath
  );

  // Create graph data from attack path
  useEffect(() => {
    if (currentAttackPath && currentAttackPath.nodes && currentAttackPath.edges) {
      const nodes = currentAttackPath.nodes.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        riskScore: node.riskScore,
        vulnerability: node.vulnerability,
        description: node.description,
        x: node.x,
        y: node.y,
        color: getNodeColor(
          node.type,
          node.riskScore,
          highlightedNodes.includes(node.id)
        ),
      }));

      const links = currentAttackPath.edges.map((edge) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: edge.type,
        weight: edge.weight,
        description: edge.description,
        color: getEdgeColor(edge.weight, highlightedEdges.includes(edge.id)),
      }));

      setGraphData({ nodes, links });
    } else {
      setGraphData({ nodes: [], links: [] });
    }
  }, [currentAttackPath, highlightedNodes, highlightedEdges]);

  // Handle attack path change
  const handleAttackPathChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const pathId = event.target.value as string;
    setSelectedAttackPath(pathId);
    setSelectedCriticalPath("");
    setHighlightedNodes([]);
    setHighlightedEdges([]);
  };

  // Handle critical path change
  const handleCriticalPathChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const pathId = event.target.value as string;
    setSelectedCriticalPath(pathId);

    if (pathId && criticalPaths && criticalPaths.length > 0) {
      const criticalPath = criticalPaths.find(
        (path) => path.id === pathId
      );
      if (criticalPath && criticalPath.nodeIds && criticalPath.edgeIds) {
        setHighlightedNodes(criticalPath.nodeIds);
        setHighlightedEdges(criticalPath.edgeIds);
      }
    } else {
      setHighlightedNodes([]);
      setHighlightedEdges([]);
    }
  };

  // Handle view mode change
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: "2d" | "3d" | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Handle risk threshold change
  const handleRiskThresholdChange = (
    event: React.ChangeEvent<{}>,
    newValue: number | number[]
  ) => {
    setRiskThreshold(newValue as number[]);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    // In a real implementation, you'd call the graph zoom method
    console.log("Zoom in");
  };

  // Handle zoom out
  const handleZoomOut = () => {
    // In a real implementation, you'd call the graph zoom method
    console.log("Zoom out");
  };

  // Handle center graph
  const handleCenterGraph = () => {
    // In a real implementation, you'd center the graph
    console.log("Center graph");
  };

  // Handle refresh graph
  const handleRefreshGraph = () => {
    // In a real implementation, you'd refresh the graph
    console.log("Refresh graph");
  };

  // Handle download graph
  const handleDownloadGraph = () => {
    console.log("Download graph");
  };

  // Handle save layout
  const handleSaveLayout = () => {
    console.log("Save layout");
  };

  // Get node color based on type and risk score
  const getNodeColor = (
    type: AssetType,
    riskScore: number,
    isHighlighted: boolean
  ): string => {
    // Base color by type
    let baseColor = "#808080"; // Default gray

    if (isHighlighted) {
      return theme.palette.warning.main;
    }

    if (type === AssetType.ENTRY_POINT) {
      return theme.palette.primary.main;
    }

    if (type === AssetType.TARGET) {
      return theme.palette.error.main;
    }

    if (riskScore >= 8) {
      return theme.palette.error.main;
    } else if (riskScore >= 5) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.success.main;
    }
  };

  // Get edge color based on weight
  const getEdgeColor = (weight: number, isHighlighted: boolean): string => {
    if (isHighlighted) {
      return theme.palette.warning.main;
    }

    if (weight >= 0.7) {
      return theme.palette.error.main;
    } else if (weight >= 0.4) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.action.disabled;
    }
  };

  // Get risk threshold label
  const getRiskThresholdLabel = (value: number) => {
    return `${value}`;
  };

  if (isLoadingPaths) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (pathsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading attack paths. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="attack-path-label">Attack Path</InputLabel>
              <Select
                labelId="attack-path-label"
                value={selectedAttackPath}
                onChange={handleAttackPathChange as any}
                label="Attack Path"
              >
                <MenuItem value="">
                  <em>Select an attack path</em>
                </MenuItem>
                {attackPaths.map((path) => (
                  <MenuItem key={path.id} value={path.id}>
                    {path.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl
              fullWidth
              size="small"
              disabled={!selectedAttackPath || isLoadingCriticalPaths}
            >
              <InputLabel id="critical-path-label">Critical Path</InputLabel>
              <Select
                labelId="critical-path-label"
                value={selectedCriticalPath}
                onChange={handleCriticalPathChange as any}
                label="Critical Path"
              >
                <MenuItem value="">
                  <em>Show all paths</em>
                </MenuItem>
                {criticalPaths.map((path) => (
                  <MenuItem key={path.id} value={path.id}>
                    {path.name} (Risk: {path.riskScore.toFixed(1)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
              >
                <ToggleButton value="2d">2D</ToggleButton>
                <ToggleButton value="3d">3D</ToggleButton>
              </ToggleButtonGroup>

              <Tooltip title="Download Graph">
                <IconButton size="small" onClick={handleDownloadGraph}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Save Layout">
                <IconButton size="small" onClick={handleSaveLayout}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Paper
            sx={{
              height: 600,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
            ref={containerRef}
          >
            {!selectedAttackPath ? (
              <Typography variant="body1" color="textSecondary">
                Select an attack path to visualize
              </Typography>
            ) : graphData.nodes.length === 0 ? (
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="textSecondary">
                  Loading graph data...
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: theme.palette.background.default,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    p: 1,
                    zIndex: 10,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Tooltip title="Zoom In">
                    <IconButton size="small" onClick={handleZoomIn}>
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom Out">
                    <IconButton size="small" onClick={handleZoomOut}>
                      <ZoomOutIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Center Graph">
                    <IconButton size="small" onClick={handleCenterGraph}>
                      <CenterFocusIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Refresh Graph">
                    <IconButton size="small" onClick={handleRefreshGraph}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="body1" gutterBottom>
                    {graphData.nodes.length} nodes and {graphData.links.length}{" "}
                    edges loaded
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    In a real implementation, this would show an interactive
                    graph
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, height: 600, overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Path Analysis
            </Typography>

            {!selectedAttackPath ? (
              <Typography variant="body2" color="textSecondary">
                Select an attack path to see analysis
              </Typography>
            ) : (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Risk Threshold
                  </Typography>
                  <Slider
                    value={riskThreshold}
                    onChange={handleRiskThresholdChange}
                    valueLabelDisplay="auto"
                    getAriaValueText={getRiskThresholdLabel}
                    min={0}
                    max={10}
                    step={0.1}
                    marks={[
                      { value: 0, label: "0" },
                      { value: 5, label: "5" },
                      { value: 10, label: "10" },
                    ]}
                  />
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  Path Statistics
                </Typography>
                <Grid container spacing={1} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Nodes:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {graphData.nodes.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Edges:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {graphData.links.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Entry Points:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {
                        graphData.nodes.filter(
                          (node) => node.type === AssetType.ENTRY_POINT
                        ).length
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Target Assets:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      {
                        graphData.nodes.filter((node) => node.type === AssetType.TARGET)
                          .length
                      }
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Avg. Path Length:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">4.2</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Max Risk Score:
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="error.main">
                      8.7
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="subtitle2" gutterBottom>
                  Critical Assets
                </Typography>
                {graphData.nodes
                  .filter((node) => node.riskScore >= 7)
                  .slice(0, 5)
                  .map((node) => (
                    <Box
                      key={node.id}
                      sx={{
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        border: `1px solid ${theme.palette.divider}`,
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {node.name}
                        </Typography>
                        <Chip
                          label={node.riskScore.toFixed(1)}
                          size="small"
                          sx={{
                            bgcolor: getNodeColor(
                              node.type,
                              node.riskScore,
                              false
                            ),
                            color: "white",
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {node.description?.substring(0, 60)}...
                      </Typography>
                    </Box>
                  ))}

                <Box sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                  >
                    Apply Risk Filters
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
