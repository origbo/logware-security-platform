/**
 * NetworkVisualization Component
 *
 * Provides interactive visualization of network topology, traffic flow,
 * and security events with real-time monitoring capabilities.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  CircularProgress,
  useTheme,
  alpha,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  FitScreen as FitScreenIcon,
  FilterList as FilterIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import ForceGraph2D from "react-force-graph-2d";
import ForceGraph3D from "react-force-graph-3d";
import { ForceGraphInstance } from "force-graph";

// Interface for network node
interface NetworkNode {
  id: string;
  name: string;
  group: string;
  type:
    | "server"
    | "router"
    | "switch"
    | "firewall"
    | "client"
    | "device"
    | "subnet";
  ip?: string;
  status: "normal" | "warning" | "critical" | "unknown";
  metrics?: {
    cpu?: number;
    memory?: number;
    disk?: number;
    traffic?: number;
  };
  vulnCount?: number;
  lastSeen?: string;
  os?: string;
  location?: string;
  val?: number; // Size factor
}

// Interface for network link
interface NetworkLink {
  source: string;
  target: string;
  type: "physical" | "logical" | "vpn" | "vlan";
  status: "normal" | "warning" | "critical" | "unknown";
  value: number; // Traffic volume
  bidirectional: boolean;
  protocol?: string;
  latency?: number;
  packetLoss?: number;
  encrypted?: boolean;
}

// Interface for network graph data
interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

// Interface for component props
interface NetworkVisualizationProps {
  data?: NetworkGraphData;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  data,
  loading = false,
  error = null,
  onRefresh,
}) => {
  const theme = useTheme();
  const graphRef = useRef<ForceGraphInstance>();
  const [graphData, setGraphData] = useState<NetworkGraphData | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [layoutStopped, setLayoutStopped] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [liveModeEnabled, setLiveModeEnabled] = useState(true);

  // Mock data if none provided
  const mockNetworkData: NetworkGraphData = {
    nodes: [
      {
        id: "fw1",
        name: "Main Firewall",
        group: "network",
        type: "firewall",
        status: "normal",
        ip: "192.168.1.1",
        val: 2,
      },
      {
        id: "router1",
        name: "Core Router",
        group: "network",
        type: "router",
        status: "normal",
        ip: "192.168.1.2",
        val: 1.8,
      },
      {
        id: "switch1",
        name: "Switch 1",
        group: "network",
        type: "switch",
        status: "normal",
        ip: "192.168.1.3",
        val: 1.5,
      },
      {
        id: "switch2",
        name: "Switch 2",
        group: "network",
        type: "switch",
        status: "warning",
        ip: "192.168.1.4",
        val: 1.5,
      },
      {
        id: "server1",
        name: "Web Server",
        group: "servers",
        type: "server",
        status: "normal",
        ip: "192.168.2.10",
        val: 1.5,
      },
      {
        id: "server2",
        name: "Database Server",
        group: "servers",
        type: "server",
        status: "normal",
        ip: "192.168.2.11",
        val: 1.5,
      },
      {
        id: "server3",
        name: "Authentication Server",
        group: "servers",
        type: "server",
        status: "critical",
        ip: "192.168.2.12",
        val: 1.5,
      },
      {
        id: "server4",
        name: "File Server",
        group: "servers",
        type: "server",
        status: "normal",
        ip: "192.168.2.13",
        val: 1.5,
      },
      {
        id: "client1",
        name: "Admin Workstation",
        group: "clients",
        type: "client",
        status: "normal",
        ip: "192.168.3.10",
        val: 1,
      },
      {
        id: "client2",
        name: "Developer Workstation",
        group: "clients",
        type: "client",
        status: "normal",
        ip: "192.168.3.11",
        val: 1,
      },
      {
        id: "client3",
        name: "HR Workstation",
        group: "clients",
        type: "client",
        status: "warning",
        ip: "192.168.3.12",
        val: 1,
      },
      {
        id: "subnet1",
        name: "DMZ Subnet",
        group: "subnet",
        type: "subnet",
        status: "normal",
        val: 2.5,
      },
      {
        id: "subnet2",
        name: "Corporate Subnet",
        group: "subnet",
        type: "subnet",
        status: "normal",
        val: 2.5,
      },
      {
        id: "subnet3",
        name: "Guest Subnet",
        group: "subnet",
        type: "subnet",
        status: "normal",
        val: 2,
      },
      {
        id: "device1",
        name: "Printer",
        group: "devices",
        type: "device",
        status: "normal",
        ip: "192.168.4.20",
        val: 0.8,
      },
      {
        id: "device2",
        name: "IoT Controller",
        group: "devices",
        type: "device",
        status: "warning",
        ip: "192.168.4.21",
        val: 0.8,
      },
    ],
    links: [
      {
        source: "fw1",
        target: "router1",
        type: "physical",
        status: "normal",
        value: 10,
        bidirectional: true,
      },
      {
        source: "router1",
        target: "switch1",
        type: "physical",
        status: "normal",
        value: 8,
        bidirectional: true,
      },
      {
        source: "router1",
        target: "switch2",
        type: "physical",
        status: "normal",
        value: 7,
        bidirectional: true,
      },
      {
        source: "switch1",
        target: "server1",
        type: "physical",
        status: "normal",
        value: 5,
        bidirectional: true,
      },
      {
        source: "switch1",
        target: "server2",
        type: "physical",
        status: "normal",
        value: 6,
        bidirectional: true,
      },
      {
        source: "switch2",
        target: "server3",
        type: "physical",
        status: "critical",
        value: 4,
        bidirectional: true,
      },
      {
        source: "switch2",
        target: "server4",
        type: "physical",
        status: "normal",
        value: 3,
        bidirectional: true,
      },
      {
        source: "switch1",
        target: "client1",
        type: "physical",
        status: "normal",
        value: 2,
        bidirectional: true,
      },
      {
        source: "switch1",
        target: "client2",
        type: "physical",
        status: "normal",
        value: 2,
        bidirectional: true,
      },
      {
        source: "switch2",
        target: "client3",
        type: "physical",
        status: "warning",
        value: 2,
        bidirectional: true,
      },
      {
        source: "fw1",
        target: "subnet1",
        type: "logical",
        status: "normal",
        value: 9,
        bidirectional: true,
      },
      {
        source: "router1",
        target: "subnet2",
        type: "logical",
        status: "normal",
        value: 8,
        bidirectional: true,
      },
      {
        source: "router1",
        target: "subnet3",
        type: "logical",
        status: "normal",
        value: 5,
        bidirectional: true,
      },
      {
        source: "switch2",
        target: "device1",
        type: "physical",
        status: "normal",
        value: 1,
        bidirectional: true,
      },
      {
        source: "switch2",
        target: "device2",
        type: "physical",
        status: "warning",
        value: 1,
        bidirectional: true,
      },
      {
        source: "server1",
        target: "server2",
        type: "logical",
        status: "normal",
        value: 7,
        bidirectional: true,
      },
      {
        source: "server2",
        target: "server3",
        type: "logical",
        status: "normal",
        value: 6,
        bidirectional: true,
      },
    ],
  };

  // Initialize with data or mock data
  useEffect(() => {
    if (data) {
      setGraphData(data);
    } else {
      setGraphData(mockNetworkData);
    }
  }, [data]);

  // Filter data based on search query and filters
  useEffect(() => {
    if (!data && !mockNetworkData) return;

    const sourceData = data || mockNetworkData;

    // Filter nodes based on search query and status/type filters
    const filteredNodes = sourceData.nodes.filter((node) => {
      // Search query filter
      const matchesSearch =
        !searchQuery ||
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.ip && node.ip.includes(searchQuery));

      // Status filter
      const matchesStatus =
        filterStatus.length === 0 || filterStatus.includes(node.status);

      // Type filter
      const matchesType =
        filterTypes.length === 0 || filterTypes.includes(node.type);

      return matchesSearch && matchesStatus && matchesType;
    });

    // Get ids of filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map((node) => node.id));

    // Filter links that connect filtered nodes
    const filteredLinks = sourceData.links.filter(
      (link) =>
        filteredNodeIds.has(link.source as string) &&
        filteredNodeIds.has(link.target as string)
    );

    setGraphData({
      nodes: filteredNodes,
      links: filteredLinks,
    });
  }, [searchQuery, filterStatus, filterTypes, data]);

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle filter by status
  const handleStatusFilterChange = (event: SelectChangeEvent<string[]>) => {
    setFilterStatus(event.target.value as string[]);
  };

  // Handle filter by type
  const handleTypeFilterChange = (event: SelectChangeEvent<string[]>) => {
    setFilterTypes(event.target.value as string[]);
  };

  // Handle node click
  const handleNodeClick = useCallback(
    (node: NetworkNode) => {
      setSelectedNode(node);

      // Highlight connections
      const newHighlightNodes = new Set<string>();
      const newHighlightLinks = new Set<string>();

      newHighlightNodes.add(node.id);

      if (graphData) {
        graphData.links.forEach((link) => {
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;

          if (sourceId === node.id || targetId === node.id) {
            newHighlightLinks.add(`${sourceId}-${targetId}`);
            if (sourceId === node.id) newHighlightNodes.add(targetId);
            if (targetId === node.id) newHighlightNodes.add(sourceId);
          }
        });
      }

      setHighlightNodes(newHighlightNodes);
      setHighlightLinks(newHighlightLinks);

      if (graphRef.current) {
        graphRef.current.centerAt(node.x, node.y, 1000);

        graphRef.current.zoom(1.5, 1000);
      }
    },
    [graphData]
  );

  // Clear selection
  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());
  }, []);

  // Get node color based on status
  const getNodeColor = (node: NetworkNode) => {
    const highlighted = selectedNode && highlightNodes.has(node.id);

    if (highlighted) {
      return theme.palette.primary.main;
    }

    switch (node.status) {
      case "critical":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "normal":
        switch (node.type) {
          case "server":
            return theme.palette.success.main;
          case "router":
            return theme.palette.info.main;
          case "switch":
            return theme.palette.info.light;
          case "firewall":
            return theme.palette.error.light;
          case "subnet":
            return theme.palette.grey[500];
          default:
            return theme.palette.grey[700];
        }
      default:
        return theme.palette.grey[500];
    }
  };

  // Get link color based on status
  const getLinkColor = (link: NetworkLink) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;
    const linkId = `${sourceId}-${targetId}`;
    const highlighted = highlightLinks.has(linkId);

    if (highlighted) {
      return theme.palette.primary.main;
    }

    switch (link.status) {
      case "critical":
        return theme.palette.error.main;
      case "warning":
        return theme.palette.warning.main;
      case "normal":
        return theme.palette.divider;
      default:
        return theme.palette.grey[500];
    }
  };

  // Toggle 2D/3D view
  const toggleViewMode = () => {
    setViewMode(viewMode === "2d" ? "3d" : "2d");
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(1.2);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(0.8);
    }
  };

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };

  // Toggle layout simulation
  const toggleLayoutSimulation = () => {
    if (graphRef.current) {
      if (layoutStopped) {
        graphRef.current.resumeAnimation();
      } else {
        graphRef.current.pauseAnimation();
      }
      setLayoutStopped(!layoutStopped);
    }
  };

  // Toggle live mode
  const toggleLiveMode = () => {
    setLiveModeEnabled(!liveModeEnabled);
  };

  // Refresh data
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Network Topology Visualization</Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            placeholder="Search devices..."
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ mr: 1, width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              multiple
              value={filterStatus}
              onChange={handleStatusFilterChange}
              label="Status"
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      color={
                        value === "critical"
                          ? "error"
                          : value === "warning"
                          ? "warning"
                          : value === "normal"
                          ? "success"
                          : "default"
                      }
                    />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="unknown">Unknown</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ mr: 1, minWidth: 120 }}>
            <InputLabel id="type-filter-label">Device Type</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter"
              multiple
              value={filterTypes}
              onChange={handleTypeFilterChange}
              label="Device Type"
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="server">Servers</MenuItem>
              <MenuItem value="router">Routers</MenuItem>
              <MenuItem value="switch">Switches</MenuItem>
              <MenuItem value="firewall">Firewalls</MenuItem>
              <MenuItem value="client">Clients</MenuItem>
              <MenuItem value="device">Devices</MenuItem>
              <MenuItem value="subnet">Subnets</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Toggle 2D/3D View">
            <IconButton onClick={toggleViewMode}>
              {viewMode === "2d" ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            height: "100%",
            position: "relative",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(0,0,0,0.2)"
                : "rgba(0,0,0,0.02)",
            borderRadius: 1,
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
          ) : error ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Typography color="error">{error}</Typography>
            </Box>
          ) : (
            <>
              {/* Graph Visualization */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                {viewMode === "2d" ? (
                  <ForceGraph2D
                    ref={graphRef}
                    graphData={graphData}
                    nodeRelSize={6}
                    nodeLabel={(node: any) =>
                      `${node.name} (${node.ip || "N/A"})`
                    }
                    nodeColor={getNodeColor}
                    nodeVal={(node: any) => node.val || 1}
                    linkWidth={(link: any) => {
                      const sourceId =
                        typeof link.source === "object"
                          ? link.source.id
                          : link.source;
                      const targetId =
                        typeof link.target === "object"
                          ? link.target.id
                          : link.target;
                      const linkId = `${sourceId}-${targetId}`;
                      return highlightLinks.has(linkId) ? 3 : 1;
                    }}
                    linkColor={getLinkColor}
                    linkDirectionalParticles={(link: any) => link.value * 0.2}
                    linkDirectionalParticleWidth={1.5}
                    cooldownTicks={layoutStopped ? 0 : Infinity}
                    onNodeClick={handleNodeClick}
                    onBackgroundClick={handleBackgroundClick}
                    backgroundColor={
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.background.default, 0.9)
                        : alpha(theme.palette.background.default, 0.9)
                    }
                  />
                ) : (
                  <ForceGraph3D
                    ref={graphRef}
                    graphData={graphData}
                    nodeLabel={(node: any) =>
                      `${node.name} (${node.ip || "N/A"})`
                    }
                    nodeColor={getNodeColor}
                    nodeVal={(node: any) => node.val || 1}
                    linkWidth={(link: any) => {
                      const sourceId =
                        typeof link.source === "object"
                          ? link.source.id
                          : link.source;
                      const targetId =
                        typeof link.target === "object"
                          ? link.target.id
                          : link.target;
                      const linkId = `${sourceId}-${targetId}`;
                      return highlightLinks.has(linkId) ? 3 : 1;
                    }}
                    linkColor={getLinkColor}
                    linkDirectionalParticles={(link: any) => link.value * 0.2}
                    linkDirectionalParticleWidth={1.5}
                    cooldownTicks={layoutStopped ? 0 : Infinity}
                    onNodeClick={handleNodeClick}
                    onBackgroundClick={handleBackgroundClick}
                    backgroundColor={
                      theme.palette.mode === "dark"
                        ? alpha(theme.palette.background.default, 0.9)
                        : alpha(theme.palette.background.default, 0.9)
                    }
                  />
                )}
              </Box>

              {/* Controls overlay */}
              <Box
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  borderRadius: 1,
                  p: 1,
                  boxShadow: 1,
                }}
              >
                <Tooltip title="Zoom In">
                  <IconButton
                    onClick={handleZoomIn}
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Zoom Out">
                  <IconButton
                    onClick={handleZoomOut}
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Fit View">
                  <IconButton
                    onClick={handleFitView}
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    <FitScreenIcon />
                  </IconButton>
                </Tooltip>
                <Divider sx={{ my: 1 }} />
                <Tooltip
                  title={layoutStopped ? "Resume Animation" : "Pause Animation"}
                >
                  <IconButton
                    onClick={toggleLayoutSimulation}
                    size="small"
                    sx={{ mb: 1 }}
                  >
                    <PlayIcon color={layoutStopped ? "action" : "primary"} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Toggle Live Updates">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Switch
                      size="small"
                      checked={liveModeEnabled}
                      onChange={toggleLiveMode}
                      color="primary"
                    />
                  </Box>
                </Tooltip>
              </Box>

              {/* Selected node details */}
              {selectedNode && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    zIndex: 1,
                    width: 350,
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    borderRadius: 1,
                    p: 2,
                    boxShadow: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="h6">{selectedNode.name}</Typography>
                    <IconButton size="small" onClick={handleBackgroundClick}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Type
                        </Typography>
                        <Typography variant="body2">
                          {selectedNode.type}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          IP Address
                        </Typography>
                        <Typography variant="body2">
                          {selectedNode.ip || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="caption" color="textSecondary">
                          Status
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {selectedNode.status === "critical" && (
                            <ErrorIcon
                              fontSize="small"
                              color="error"
                              sx={{ mr: 0.5 }}
                            />
                          )}
                          {selectedNode.status === "warning" && (
                            <WarningIcon
                              fontSize="small"
                              color="warning"
                              sx={{ mr: 0.5 }}
                            />
                          )}
                          <Typography variant="body2">
                            {selectedNode.status}
                          </Typography>
                        </Box>
                      </Grid>

                      {selectedNode.metrics && (
                        <>
                          <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="subtitle2">
                              Performance Metrics
                            </Typography>
                          </Grid>
                          {selectedNode.metrics.cpu !== undefined && (
                            <Grid item xs={3}>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                CPU
                              </Typography>
                              <Typography variant="body2">
                                {selectedNode.metrics.cpu}%
                              </Typography>
                            </Grid>
                          )}
                          {selectedNode.metrics.memory !== undefined && (
                            <Grid item xs={3}>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Memory
                              </Typography>
                              <Typography variant="body2">
                                {selectedNode.metrics.memory}%
                              </Typography>
                            </Grid>
                          )}
                          {selectedNode.metrics.disk !== undefined && (
                            <Grid item xs={3}>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Disk
                              </Typography>
                              <Typography variant="body2">
                                {selectedNode.metrics.disk}%
                              </Typography>
                            </Grid>
                          )}
                          {selectedNode.metrics.traffic !== undefined && (
                            <Grid item xs={3}>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                Traffic
                              </Typography>
                              <Typography variant="body2">
                                {selectedNode.metrics.traffic} Mbps
                              </Typography>
                            </Grid>
                          )}
                        </>
                      )}
                    </Grid>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color={
                        selectedNode.status === "critical" ||
                        selectedNode.status === "warning"
                          ? "warning"
                          : "primary"
                      }
                    >
                      {selectedNode.status === "critical" ||
                      selectedNode.status === "warning"
                        ? "Investigate"
                        : "Monitor"}
                    </Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NetworkVisualization;
