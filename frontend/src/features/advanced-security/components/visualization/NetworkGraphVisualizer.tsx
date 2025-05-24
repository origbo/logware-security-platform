/**
 * Network Graph Visualizer Component
 *
 * A reusable visualization component for rendering network graphs
 * with interactive features like zooming, filtering, and highlighting.
 * Can be used for attack paths, threat networks, anomaly correlations, etc.
 */
import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterFocusIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  FilterList as FilterListIcon,
  SettingsOverscan as FullscreenIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

// Note: In a real implementation, you would install and import:
// import ForceGraph2D from 'react-force-graph-2d';
// import ForceGraph3D from 'react-force-graph-3d';
// import { saveAs } from 'file-saver';

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  group?: string;
  value?: number;
  color?: string;
  x?: number;
  y?: number;
  z?: number;
  metadata?: Record<string, any>;
}

export interface GraphLink {
  id: string;
  source: string;
  target: string;
  type?: string;
  value?: number;
  color?: string;
  bidirectional?: boolean;
  metadata?: Record<string, any>;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface NodeColorMap {
  [key: string]: string;
}

interface LinkColorMap {
  [key: string]: string;
}

export interface NetworkGraphVisualizerProps {
  data: GraphData;
  title?: string;
  height?: number | string;
  width?: number | string;
  nodeColorMap?: NodeColorMap;
  linkColorMap?: LinkColorMap;
  nodeSizeAttribute?: string;
  linkWidthAttribute?: string;
  highlightedNodes?: string[];
  highlightedLinks?: string[];
  onNodeClick?: (node: GraphNode) => void;
  onLinkClick?: (link: GraphLink) => void;
  loading?: boolean;
  enableDrag?: boolean;
  enableZoom?: boolean;
  showLabels?: boolean;
  labelAttribute?: string;
  darkMode?: boolean;
}

export const NetworkGraphVisualizer: React.FC<NetworkGraphVisualizerProps> = ({
  data,
  title = "Network Graph",
  height = 600,
  width = "100%",
  nodeColorMap = {
    default: "#1976d2", // Primary color
    highlighted: "#ff9800", // Warning color
  },
  linkColorMap = {
    default: "#bdbdbd", // Grey color
    highlighted: "#ff9800", // Warning color
  },
  nodeSizeAttribute = "value",
  linkWidthAttribute = "value",
  highlightedNodes = [],
  highlightedLinks = [],
  onNodeClick,
  onLinkClick,
  loading = false,
  enableDrag = true,
  enableZoom = true,
  showLabels = true,
  labelAttribute = "name",
  darkMode = false,
}) => {
  const theme = useTheme();
  const graphRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [nodeScale, setNodeScale] = useState<number>(1);
  const [labelSize, setLabelSize] = useState<number>(1);
  const [filterValue, setFilterValue] = useState<number[]>([0, 10]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [nodeFilter, setNodeFilter] = useState<string>("all");
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Process data for rendering
  const processedData = React.useMemo(() => {
    if (!data) return { nodes: [], links: [] };

    // Process nodes
    const nodes = data.nodes.map((node) => ({
      ...node,
      val: (node[nodeSizeAttribute as keyof GraphNode] as number) || 1,
      color: highlightedNodes.includes(node.id)
        ? nodeColorMap.highlighted
        : nodeColorMap[node.type] || nodeColorMap.default,
    }));

    // Process links
    const links = data.links.map((link) => ({
      ...link,
      width: (link[linkWidthAttribute as keyof GraphLink] as number) || 1,
      color: highlightedLinks.includes(link.id)
        ? linkColorMap.highlighted
        : linkColorMap[link.type as string] || linkColorMap.default,
    }));

    return { nodes, links };
  }, [
    data,
    nodeColorMap,
    linkColorMap,
    highlightedNodes,
    highlightedLinks,
    nodeSizeAttribute,
    linkWidthAttribute,
  ]);

  // Handle view mode change
  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: "2d" | "3d" | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Handle node scale change
  const handleNodeScaleChange = (event: Event, newValue: number | number[]) => {
    setNodeScale(newValue as number);
  };

  // Handle label size change
  const handleLabelSizeChange = (event: Event, newValue: number | number[]) => {
    setLabelSize(newValue as number);
  };

  // Handle filter value change
  const handleFilterValueChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    setFilterValue(newValue as number[]);
  };

  // Handle node filter change
  const handleNodeFilterChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setNodeFilter(event.target.value as string);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    if (graphRef.current) {
      // In a real implementation, you would call graphRef.current.zoom(1.2);
      console.log("Zoom in");
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (graphRef.current) {
      // In a real implementation, you would call graphRef.current.zoom(0.8);
      console.log("Zoom out");
    }
  };

  // Handle center graph
  const handleCenterGraph = () => {
    if (graphRef.current) {
      // In a real implementation, you would call graphRef.current.centerAt();
      console.log("Center graph");
    }
  };

  // Handle refresh graph
  const handleRefreshGraph = () => {
    if (graphRef.current) {
      // In a real implementation, you would call graphRef.current.refresh();
      console.log("Refresh graph");
    }
  };

  // Handle download graph
  const handleDownloadGraph = () => {
    // In a real implementation, you would generate and download an image of the graph
    console.log("Download graph");
  };

  // Handle fullscreen toggle
  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);

    // In a real implementation, you would handle fullscreen mode
    // Dynamically adjust the container size
    if (containerRef.current) {
      if (!isFullscreen) {
        // Store original styles, then set fullscreen styles
        containerRef.current.style.position = "fixed";
        containerRef.current.style.top = "0";
        containerRef.current.style.left = "0";
        containerRef.current.style.width = "100vw";
        containerRef.current.style.height = "100vh";
        containerRef.current.style.zIndex = "9999";
      } else {
        // Restore original styles
        containerRef.current.style.position = "";
        containerRef.current.style.top = "";
        containerRef.current.style.left = "";
        containerRef.current.style.width = "";
        containerRef.current.style.height = "";
        containerRef.current.style.zIndex = "";
      }
    }
  };

  // Handle node click
  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node === selectedNode ? null : node);
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // Handle link click
  const handleLinkClick = (link: GraphLink) => {
    if (onLinkClick) {
      onLinkClick(link);
    }
  };

  return (
    <Paper
      sx={{
        position: "relative",
        overflow: "hidden",
        height: isFullscreen ? "100vh" : height,
        width: isFullscreen ? "100vw" : width,
        backgroundColor: darkMode
          ? theme.palette.grey[900]
          : theme.palette.background.paper,
      }}
      ref={containerRef}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: darkMode
              ? theme.palette.common.white
              : theme.palette.text.primary,
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="2d">2D</ToggleButton>
            <ToggleButton value="3d">3D</ToggleButton>
          </ToggleButtonGroup>

          {!isFullscreen ? (
            <Tooltip title="Graph Controls">
              <IconButton
                size="small"
                onClick={() => {
                  /* Toggle controls panel */
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          ) : null}

          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <IconButton size="small" onClick={handleToggleFullscreen}>
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Controls Panel */}
      {!isFullscreen && (
        <Box
          sx={{
            position: "absolute",
            top: 48,
            right: 0,
            width: 250,
            backgroundColor: darkMode
              ? "rgba(0,0,0,0.6)"
              : "rgba(255,255,255,0.9)",
            p: 2,
            zIndex: 10,
            borderRadius: "0 0 0 8px",
            boxShadow: theme.shadows[3],
          }}
        >
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{
              color: darkMode
                ? theme.palette.common.white
                : theme.palette.text.primary,
            }}
          >
            Graph Controls
          </Typography>

          <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
            <InputLabel
              id="node-filter-label"
              sx={{ color: darkMode ? theme.palette.grey[300] : undefined }}
            >
              Filter Nodes
            </InputLabel>
            <Select
              labelId="node-filter-label"
              value={nodeFilter}
              onChange={handleNodeFilterChange as any}
              label="Filter Nodes"
              sx={{
                color: darkMode ? theme.palette.common.white : undefined,
                ".MuiOutlinedInput-notchedOutline": {
                  borderColor: darkMode
                    ? "rgba(255, 255, 255, 0.23)"
                    : undefined,
                },
              }}
            >
              <MenuItem value="all">All Node Types</MenuItem>
              <MenuItem value="server">Servers</MenuItem>
              <MenuItem value="client">Clients</MenuItem>
              <MenuItem value="router">Routers</MenuItem>
              <MenuItem value="application">Applications</MenuItem>
            </Select>
          </FormControl>

          <Typography
            variant="body2"
            gutterBottom
            sx={{
              color: darkMode
                ? theme.palette.grey[300]
                : theme.palette.text.secondary,
            }}
          >
            Value Filter Range:
          </Typography>
          <Slider
            value={filterValue}
            onChange={handleFilterValueChange}
            valueLabelDisplay="auto"
            min={0}
            max={10}
            step={0.1}
            sx={{ mb: 2 }}
          />

          <Typography
            variant="body2"
            gutterBottom
            sx={{
              color: darkMode
                ? theme.palette.grey[300]
                : theme.palette.text.secondary,
            }}
          >
            Node Size:
          </Typography>
          <Slider
            value={nodeScale}
            onChange={handleNodeScaleChange}
            valueLabelDisplay="auto"
            min={0.5}
            max={2}
            step={0.1}
            sx={{ mb: 2 }}
          />

          <Typography
            variant="body2"
            gutterBottom
            sx={{
              color: darkMode
                ? theme.palette.grey[300]
                : theme.palette.text.secondary,
            }}
          >
            Label Size:
          </Typography>
          <Slider
            value={labelSize}
            onChange={handleLabelSizeChange}
            valueLabelDisplay="auto"
            min={0}
            max={2}
            step={0.1}
          />
        </Box>
      )}

      {/* Toolbar */}
      <Box
        sx={{
          position: "absolute",
          top: isFullscreen ? 70 : 58,
          left: 10,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          zIndex: 5,
          backgroundColor: darkMode
            ? "rgba(0,0,0,0.6)"
            : "rgba(255,255,255,0.8)",
          p: 0.5,
          borderRadius: 1,
          boxShadow: theme.shadows[2],
        }}
      >
        <Tooltip title="Zoom In">
          <IconButton
            size="small"
            onClick={handleZoomIn}
            disabled={!enableZoom}
          >
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton
            size="small"
            onClick={handleZoomOut}
            disabled={!enableZoom}
          >
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Center Graph">
          <IconButton size="small" onClick={handleCenterGraph}>
            <CenterFocusIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Refresh Graph">
          <IconButton size="small" onClick={handleRefreshGraph}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download Graph Image">
          <IconButton size="small" onClick={handleDownloadGraph}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Graph Visualization */}
      <Box
        sx={{
          width: "100%",
          height: isFullscreen
            ? "calc(100vh - 48px)"
            : `calc(${
                typeof height === "number" ? height + "px" : height
              } - 48px)`,
          position: "relative",
        }}
      >
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
          <>
            {/* In a real implementation, this would be the actual ForceGraph component */}
            {/* For this exercise, showing a visualization placeholder */}
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: darkMode
                  ? theme.palette.common.white
                  : theme.palette.text.primary,
              }}
            >
              <Typography variant="body1" gutterBottom>
                Network Graph Visualization
              </Typography>
              <Typography
                variant="body2"
                color={
                  darkMode
                    ? theme.palette.grey[400]
                    : theme.palette.text.secondary
                }
              >
                {processedData.nodes.length} nodes and{" "}
                {processedData.links.length} links
              </Typography>
              <Typography
                variant="body2"
                color={
                  darkMode
                    ? theme.palette.grey[400]
                    : theme.palette.text.secondary
                }
              >
                View Mode:{" "}
                {viewMode === "2d" ? "2D Force-Directed" : "3D Force-Directed"}
              </Typography>

              {/* Simplified Visualization For Demonstration */}
              <Box
                sx={{
                  width: "80%",
                  height: "70%",
                  border: `1px dashed ${
                    darkMode ? theme.palette.grey[700] : theme.palette.divider
                  }`,
                  borderRadius: 2,
                  my: 4,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Sample Nodes */}
                {processedData.nodes.slice(0, 10).map((node, index) => (
                  <Box
                    key={node.id}
                    sx={{
                      position: "absolute",
                      top: `${20 + Math.random() * 60}%`,
                      left: `${10 + (index % 5) * 18}%`,
                      width: 30 + (node.val || 1) * 10 * nodeScale,
                      height: 30 + (node.val || 1) * 10 * nodeScale,
                      borderRadius: "50%",
                      backgroundColor: node.color || nodeColorMap.default,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.getContrastText(
                        node.color || nodeColorMap.default
                      ),
                      fontSize: 12 * labelSize,
                      fontWeight: "bold",
                      boxShadow:
                        node.id === selectedNode?.id
                          ? `0 0 0 4px ${theme.palette.primary.main}`
                          : "none",
                      zIndex: 2,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                      },
                    }}
                    onClick={() => handleNodeClick(node)}
                  >
                    {showLabels ? node[labelAttribute] : ""}
                  </Box>
                ))}

                {/* Simplified SVG Links */}
                <svg
                  width="100%"
                  height="100%"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                >
                  {processedData.links.slice(0, 15).map((link, index) => {
                    // For demo purposes, creating some arbitrary coordinates
                    const sourceIndex = processedData.nodes.findIndex(
                      (n) => n.id === link.source
                    );
                    const targetIndex = processedData.nodes.findIndex(
                      (n) => n.id === link.target
                    );

                    // Only draw links for nodes we're displaying
                    if (
                      sourceIndex < 0 ||
                      targetIndex < 0 ||
                      sourceIndex >= 10 ||
                      targetIndex >= 10
                    ) {
                      return null;
                    }

                    const sourceX = 10 + (sourceIndex % 5) * 18 + "%";
                    const sourceY = 20 + Math.random() * 60 + "%";
                    const targetX = 10 + (targetIndex % 5) * 18 + "%";
                    const targetY = 20 + Math.random() * 60 + "%";

                    return (
                      <line
                        key={link.id || index}
                        x1={sourceX}
                        y1={sourceY}
                        x2={targetX}
                        y2={targetY}
                        stroke={link.color}
                        strokeWidth={(link.width || 1) * 2}
                        strokeDasharray={link.bidirectional ? undefined : "5,5"}
                        markerEnd={
                          link.bidirectional ? undefined : "url(#arrowhead)"
                        }
                      />
                    );
                  })}

                  {/* Arrow markers for directed graphs */}
                  <defs>
                    <marker
                      id="arrowhead"
                      viewBox="0 0 10 10"
                      refX="5"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto"
                    >
                      <path
                        d="M 0 0 L 10 5 L 0 10 z"
                        fill={linkColorMap.default}
                      />
                    </marker>
                  </defs>
                </svg>
              </Box>

              <Typography
                variant="caption"
                color={
                  darkMode
                    ? theme.palette.grey[500]
                    : theme.palette.text.secondary
                }
              >
                This is a placeholder. In a real implementation, this would be
                an interactive force-directed graph.
              </Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Node Detail Panel (when a node is selected) */}
      {selectedNode && (
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 300,
            backgroundColor: darkMode
              ? "rgba(0,0,0,0.8)"
              : "rgba(255,255,255,0.95)",
            p: 2,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
            zIndex: 10,
            color: darkMode
              ? theme.palette.common.white
              : theme.palette.text.primary,
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            {selectedNode.name}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2">
              <strong>Type:</strong> {selectedNode.type}
            </Typography>
            {selectedNode.group && (
              <Typography variant="body2">
                <strong>Group:</strong> {selectedNode.group}
              </Typography>
            )}
            {selectedNode.value !== undefined && (
              <Typography variant="body2">
                <strong>Value:</strong> {selectedNode.value}
              </Typography>
            )}
            {selectedNode.metadata &&
              Object.keys(selectedNode.metadata).map((key) => (
                <Typography key={key} variant="body2">
                  <strong>{key}:</strong>{" "}
                  {JSON.stringify(selectedNode.metadata?.[key])}
                </Typography>
              ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};
