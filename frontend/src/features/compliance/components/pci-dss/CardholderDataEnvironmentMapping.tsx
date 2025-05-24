/**
 * Cardholder Data Environment Mapping Component
 *
 * Map and manage system components in the cardholder data environment
 * for PCI-DSS compliance
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterAlt as FilterIcon,
  SaveAlt as ExportIcon,
  Cancel as CancelIcon,
  DeviceHub as DeviceHubIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

// Import types
import {
  SystemComponent,
  SystemComponentType as BaseSystemComponentType,
  EnvironmentType as BaseEnvironmentType,
} from "../../types/pciDssTypes";

// Extended type definitions to include the values actually being used
type SystemComponentType =
  | BaseSystemComponentType
  | "SERVER"
  | "PAYMENT_TERMINAL"
  | "DATABASE"
  | "APPLICATION"
  | "NETWORK_DEVICE";
type EnvironmentType = BaseEnvironmentType | "CDE" | "CONNECTED";

// Sample data - replace with API call in production
const sampleComponents: SystemComponent[] = [
  {
    id: "comp-1",
    name: "Payment Gateway Server",
    type: "SERVER",
    description: "Primary payment processing server",
    environment: "CDE",
    location: "Data Center A",
    ownerId: "user-123",
    ownerName: "John Smith",
    ipAddress: "10.0.0.12",
    function: "Payment Processing",
    securityControls: ["Firewall", "IDS", "Encryption", "Access Control"],
    inScope: true,
    lastScan: "2025-04-18T08:30:00Z",
    createdAt: "2024-10-01T09:00:00Z",
    updatedAt: "2025-04-18T08:30:00Z",
  },
  {
    id: "comp-2",
    name: "POS Terminal 101",
    type: "PAYMENT_TERMINAL",
    description: "Point-of-Sale Terminal in Main Store",
    environment: "CDE",
    location: "Main Store",
    ownerId: "user-456",
    ownerName: "Jane Doe",
    function: "Payment Acceptance",
    securityControls: ["Encryption", "Tamper Protection", "P2PE"],
    inScope: true,
    lastScan: "2025-04-15T10:15:00Z",
    createdAt: "2024-11-15T11:30:00Z",
    updatedAt: "2025-04-15T10:15:00Z",
  },
  {
    id: "comp-3",
    name: "Customer Database",
    type: "DATABASE",
    description: "Database storing customer and transaction data",
    environment: "CDE",
    location: "Cloud (AWS)",
    ownerId: "user-789",
    ownerName: "David Johnson",
    function: "Data Storage",
    securityControls: [
      "Encryption",
      "Access Control",
      "Audit Logging",
      "Backup",
    ],
    inScope: true,
    lastScan: "2025-04-10T14:20:00Z",
    createdAt: "2024-09-20T13:45:00Z",
    updatedAt: "2025-04-10T14:20:00Z",
  },
  {
    id: "comp-4",
    name: "Internal Web Server",
    type: "SERVER",
    description: "Internal web server for employee access",
    environment: "CONNECTED",
    location: "Data Center B",
    ownerId: "user-123",
    ownerName: "John Smith",
    ipAddress: "10.0.0.25",
    function: "Web Hosting",
    securityControls: ["Firewall", "Access Control", "Monitoring"],
    inScope: true,
    lastScan: "2025-04-12T09:45:00Z",
    createdAt: "2024-08-15T11:00:00Z",
    updatedAt: "2025-04-12T09:45:00Z",
  },
  {
    id: "comp-5",
    name: "Merchant Portal Application",
    type: "APPLICATION",
    description: "Web application for merchant management",
    environment: "CDE",
    location: "Cloud (AWS)",
    ownerId: "user-456",
    ownerName: "Jane Doe",
    function: "Merchant Management",
    securityControls: ["WAF", "HTTPS", "Access Control", "Audit Logging"],
    inScope: true,
    lastScan: "2025-04-05T13:20:00Z",
    createdAt: "2024-09-10T10:30:00Z",
    updatedAt: "2025-04-05T13:20:00Z",
  },
  {
    id: "comp-6",
    name: "Network Firewall",
    type: "NETWORK_DEVICE",
    description: "Main perimeter firewall",
    environment: "CDE",
    location: "Data Center A",
    ownerId: "user-789",
    ownerName: "David Johnson",
    ipAddress: "10.0.0.1",
    function: "Network Security",
    securityControls: ["Rule Audit", "Logging", "Monitoring"],
    inScope: true,
    lastScan: "2025-04-20T10:00:00Z",
    createdAt: "2024-07-05T09:15:00Z",
    updatedAt: "2025-04-20T10:00:00Z",
  },
];

// Default component structure for new components
const defaultComponent: Omit<
  SystemComponent,
  "id" | "createdAt" | "updatedAt"
> = {
  name: "",
  type: "SERVER",
  description: "",
  environment: "CDE",
  location: "",
  ownerId: "",
  ownerName: "",
  ipAddress: "",
  function: "",
  securityControls: [],
  inScope: true,
};

// Interface for component form
type ComponentForm = Omit<SystemComponent, "id" | "createdAt" | "updatedAt">;

// Cardholder Data Environment Mapping component
const CardholderDataEnvironmentMapping: React.FC = () => {
  const theme = useTheme();

  // State for data
  const [components, setComponents] = useState<SystemComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editingComponent, setEditingComponent] =
    useState<ComponentForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  // State for new security control
  const [newSecurityControl, setNewSecurityControl] = useState("");

  // Load data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setComponents(sampleComponents);
        setError(null);
      } catch (err) {
        setError("Failed to load CDE components");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter components based on search and filters
  const filteredComponents = components.filter((comp) => {
    const matchesSearch =
      !searchQuery ||
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEnvironment =
      !environmentFilter || comp.environment === environmentFilter;
    const matchesType = !typeFilter || comp.type === typeFilter;

    return matchesSearch && matchesEnvironment && matchesType;
  });

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle dialog open for adding new component
  const handleAddComponent = () => {
    setEditingComponent({ ...defaultComponent });
    setIsEditing(false);
    setOpenDialog(true);
  };

  // Handle dialog open for editing component
  const handleEditComponent = (component: SystemComponent) => {
    setEditingComponent({
      name: component.name,
      type: component.type,
      description: component.description,
      environment: component.environment,
      location: component.location,
      ownerId: component.ownerId,
      ownerName: component.ownerName,
      ipAddress: component.ipAddress || "",
      function: component.function,
      securityControls: [...component.securityControls],
      inScope: component.inScope,
      lastScan: component.lastScan,
    });
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingComponent(null);
  };

  // Handle form field change
  const handleFormChange = (field: keyof ComponentForm, value: any) => {
    if (editingComponent) {
      setEditingComponent({ ...editingComponent, [field]: value });
    }
  };

  // Handle adding a security control
  const handleAddSecurityControl = () => {
    if (newSecurityControl && editingComponent) {
      setEditingComponent({
        ...editingComponent,
        securityControls: [
          ...editingComponent.securityControls,
          newSecurityControl,
        ],
      });
      setNewSecurityControl("");
    }
  };

  // Handle removing a security control
  const handleRemoveSecurityControl = (control: string) => {
    if (editingComponent) {
      setEditingComponent({
        ...editingComponent,
        securityControls: editingComponent.securityControls.filter(
          (c) => c !== control
        ),
      });
    }
  };

  // Handle save component
  const handleSaveComponent = () => {
    if (!editingComponent) return;

    if (isEditing) {
      // Update existing component
      setComponents((prev) =>
        prev.map((comp) =>
          comp.id === editingComponent.id
            ? {
                ...comp,
                ...editingComponent,
                updatedAt: new Date().toISOString(),
              }
            : comp
        )
      );
    } else {
      // Add new component
      const newComponent: SystemComponent = {
        id: `comp-${Date.now()}`,
        ...editingComponent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setComponents((prev) => [...prev, newComponent]);
    }

    handleCloseDialog();
  };

  // Handle delete component
  const handleDeleteComponent = (id: string) => {
    // In a real app, you would show a confirmation dialog before deleting
    setComponents((prev) => prev.filter((comp) => comp.id !== id));
  };

  // Render environment chip
  const renderEnvironmentChip = (environment: EnvironmentType) => {
    let color: "error" | "warning" | "success" | "default" = "default";

    switch (environment) {
      case "CDE":
        color = "error";
        break;
      case "CONNECTED":
        color = "warning";
        break;
      case "SEGMENTED":
        color = "success";
        break;
    }

    return <Chip label={environment} color={color} size="small" />;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <DeviceHubIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Cardholder Data Environment Mapping
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Map and manage system components that store, process, or transmit
              cardholder data.
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddComponent}
            >
              Add Component
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters and Search */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              placeholder="Search components..."
              value={searchQuery}
              onChange={handleSearchChange}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    fontSize="small"
                    sx={{ mr: 1, color: theme.palette.text.secondary }}
                  />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="environment-filter-label">Environment</InputLabel>
              <Select
                labelId="environment-filter-label"
                value={environmentFilter}
                label="Environment"
                onChange={(e) => setEnvironmentFilter(e.target.value)}
              >
                <MenuItem value="">All Environments</MenuItem>
                <MenuItem value="CDE">CDE</MenuItem>
                <MenuItem value="CONNECTED">Connected</MenuItem>
                <MenuItem value="SEGMENTED">Segmented</MenuItem>
                <MenuItem value="OUT_OF_SCOPE">Out of Scope</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="type-filter-label">Component Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                label="Component Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="SERVER">Server</MenuItem>
                <MenuItem value="NETWORK_DEVICE">Network Device</MenuItem>
                <MenuItem value="APPLICATION">Application</MenuItem>
                <MenuItem value="DATABASE">Database</MenuItem>
                <MenuItem value="PAYMENT_TERMINAL">Payment Terminal</MenuItem>
                <MenuItem value="POINT_OF_SALE">Point of Sale</MenuItem>
                <MenuItem value="WORKSTATION">Workstation</MenuItem>
                <MenuItem value="CLOUD_SERVICE">Cloud Service</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            sm={2}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              startIcon={<RefreshIcon />}
              onClick={() => {
                setSearchQuery("");
                setEnvironmentFilter("");
                setTypeFilter("");
              }}
            >
              Reset
            </Button>
            <Button startIcon={<ExportIcon />} sx={{ ml: 1 }}>
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.background.paper }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Environment</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Owner</TableCell>
                  <TableCell>Function</TableCell>
                  <TableCell>Security Controls</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredComponents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No components found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComponents.map((component) => (
                    <TableRow key={component.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {component.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {component.ipAddress && `IP: ${component.ipAddress}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={component.type.replace(/_/g, " ")}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {renderEnvironmentChip(component.environment)}
                      </TableCell>
                      <TableCell>{component.location}</TableCell>
                      <TableCell>{component.ownerName}</TableCell>
                      <TableCell>{component.function}</TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {component.securityControls
                            .slice(0, 2)
                            .map((control) => (
                              <Chip
                                key={control}
                                label={control}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            ))}
                          {component.securityControls.length > 2 && (
                            <Tooltip
                              title={component.securityControls
                                .slice(2)
                                .join(", ")}
                            >
                              <Chip
                                label={`+${
                                  component.securityControls.length - 2
                                }`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditComponent(component)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteComponent(component.id)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Component Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Component" : "Add New Component"}
        </DialogTitle>
        <DialogContent dividers>
          {editingComponent && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  value={editingComponent.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  fullWidth
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={editingComponent.type}
                    label="Type"
                    onChange={(e) => handleFormChange("type", e.target.value)}
                  >
                    <MenuItem value="NETWORK_DEVICE">Network Device</MenuItem>
                    <MenuItem value="SERVER">Server</MenuItem>
                    <MenuItem value="APPLICATION">Application</MenuItem>
                    <MenuItem value="DATABASE">Database</MenuItem>
                    <MenuItem value="POINT_OF_SALE">Point of Sale</MenuItem>
                    <MenuItem value="PAYMENT_TERMINAL">
                      Payment Terminal
                    </MenuItem>
                    <MenuItem value="WORKSTATION">Workstation</MenuItem>
                    <MenuItem value="MOBILE_DEVICE">Mobile Device</MenuItem>
                    <MenuItem value="VIRTUAL_COMPONENT">
                      Virtual Component
                    </MenuItem>
                    <MenuItem value="CLOUD_SERVICE">Cloud Service</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={editingComponent.description}
                  onChange={(e) =>
                    handleFormChange("description", e.target.value)
                  }
                  fullWidth
                  multiline
                  rows={2}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Environment</InputLabel>
                  <Select
                    value={editingComponent.environment}
                    label="Environment"
                    onChange={(e) =>
                      handleFormChange("environment", e.target.value)
                    }
                  >
                    <MenuItem value="CDE">
                      CDE (Cardholder Data Environment)
                    </MenuItem>
                    <MenuItem value="CONNECTED">Connected to CDE</MenuItem>
                    <MenuItem value="SEGMENTED">Segmented from CDE</MenuItem>
                    <MenuItem value="OUT_OF_SCOPE">Out of Scope</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  value={editingComponent.location}
                  onChange={(e) => handleFormChange("location", e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="e.g., Data Center A, Cloud (AWS)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Owner Name"
                  value={editingComponent.ownerName}
                  onChange={(e) =>
                    handleFormChange("ownerName", e.target.value)
                  }
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="IP Address"
                  value={editingComponent.ipAddress}
                  onChange={(e) =>
                    handleFormChange("ipAddress", e.target.value)
                  }
                  fullWidth
                  margin="normal"
                  placeholder="Optional"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Function"
                  value={editingComponent.function}
                  onChange={(e) => handleFormChange("function", e.target.value)}
                  fullWidth
                  margin="normal"
                  placeholder="e.g., Payment Processing, Data Storage"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Security Controls
                </Typography>
                <Box sx={{ display: "flex", mb: 1 }}>
                  <TextField
                    value={newSecurityControl}
                    onChange={(e) => setNewSecurityControl(e.target.value)}
                    fullWidth
                    size="small"
                    placeholder="Add security control"
                  />
                  <Button
                    onClick={handleAddSecurityControl}
                    disabled={!newSecurityControl}
                    sx={{ ml: 1 }}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {editingComponent.securityControls.map((control) => (
                    <Chip
                      key={control}
                      label={control}
                      onDelete={() => handleRemoveSecurityControl(control)}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveComponent}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={!editingComponent?.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CardholderDataEnvironmentMapping;
