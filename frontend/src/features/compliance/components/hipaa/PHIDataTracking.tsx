/**
 * PHI Data Tracking Component
 *
 * Track and monitor protected health information storage locations
 * for HIPAA compliance
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Folder as FolderIcon,
  LockOutlined as EncryptionIcon,
  Shield as SecurityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

// Import HIPAA types
import { PhiLocation, PhiType, RiskLevel } from "../../types/hipaaTypes";

// Sample data - replace with API call in production
const samplePhiLocations: PhiLocation[] = [
  {
    id: "phi-1",
    name: "Patient Records Database",
    description: "Primary database storing patient medical records",
    phiTypes: [
      PhiType.DEMOGRAPHIC,
      PhiType.MEDICAL_RECORDS,
      PhiType.DIAGNOSTIC,
    ],
    systemType: "DATABASE",
    location: "Data Center A",
    dataOwner: "Medical Records Department",
    technicalOwner: "IT Department",
    securityControls: [
      "Encryption",
      "Access Control",
      "Audit Logging",
      "Backups",
    ],
    encryptionInPlace: true,
    accessControls: ["Role-based access", "MFA", "Automatic logout"],
    retentionPolicy: "7 years after last patient contact",
    backupStrategy: "Daily incremental, weekly full, offsite storage",
    lastRiskAssessment: "2025-04-15T10:30:00Z",
    riskLevel: RiskLevel.LOW,
    createdAt: "2024-08-10T09:00:00Z",
    updatedAt: "2025-04-15T10:30:00Z",
  },
  {
    id: "phi-2",
    name: "Electronic Health Records System",
    description: "EHR application for clinical staff",
    phiTypes: [
      PhiType.DEMOGRAPHIC,
      PhiType.MEDICAL_RECORDS,
      PhiType.MEDICATION,
      PhiType.DIAGNOSTIC,
      PhiType.TREATMENT,
    ],
    systemType: "APPLICATION",
    location: "Cloud (AWS)",
    dataOwner: "Clinical Services",
    technicalOwner: "Health IT Team",
    securityControls: [
      "Encryption",
      "Access Control",
      "Audit Logging",
      "Intrusion Detection",
    ],
    encryptionInPlace: true,
    accessControls: [
      "Role-based access",
      "Context-aware authentication",
      "Session timeout",
    ],
    retentionPolicy: "10 years after last patient contact",
    backupStrategy: "Continuous replication, multi-region",
    lastRiskAssessment: "2025-04-10T14:45:00Z",
    riskLevel: RiskLevel.MEDIUM,
    createdAt: "2024-07-15T11:30:00Z",
    updatedAt: "2025-04-10T14:45:00Z",
  },
  {
    id: "phi-3",
    name: "Billing System",
    description: "Financial system processing patient billing information",
    phiTypes: [PhiType.DEMOGRAPHIC, PhiType.FINANCIAL, PhiType.INSURANCE],
    systemType: "APPLICATION",
    location: "Data Center B",
    dataOwner: "Finance Department",
    technicalOwner: "IT Department",
    securityControls: ["Encryption", "Access Control", "Audit Logging"],
    encryptionInPlace: true,
    accessControls: ["Role-based access", "MFA", "IP restrictions"],
    retentionPolicy: "7 years",
    backupStrategy: "Daily full backups, offsite storage",
    lastRiskAssessment: "2025-03-20T09:15:00Z",
    riskLevel: RiskLevel.LOW,
    createdAt: "2024-09-05T13:45:00Z",
    updatedAt: "2025-03-20T09:15:00Z",
  },
  {
    id: "phi-4",
    name: "Radiology PACS",
    description:
      "Picture archiving and communication system for radiology images",
    phiTypes: [PhiType.DEMOGRAPHIC, PhiType.DIAGNOSTIC],
    systemType: "APPLICATION",
    location: "Data Center A",
    dataOwner: "Radiology Department",
    technicalOwner: "IT Department",
    securityControls: [
      "Encryption",
      "Access Control",
      "Audit Logging",
      "Network Segmentation",
    ],
    encryptionInPlace: true,
    accessControls: ["Role-based access", "Clinical context authentication"],
    retentionPolicy: "7 years for adults, 21 years for pediatric",
    backupStrategy: "Daily incremental, weekly full, offsite storage",
    lastRiskAssessment: "2025-04-05T15:10:00Z",
    riskLevel: RiskLevel.MEDIUM,
    createdAt: "2024-08-20T10:30:00Z",
    updatedAt: "2025-04-05T15:10:00Z",
  },
  {
    id: "phi-5",
    name: "Physical Records Storage",
    description: "Physical storage for paper medical records",
    phiTypes: [
      PhiType.DEMOGRAPHIC,
      PhiType.MEDICAL_RECORDS,
      PhiType.DIAGNOSTIC,
      PhiType.TREATMENT,
    ],
    systemType: "PHYSICAL",
    location: "Secure Storage Facility",
    dataOwner: "Medical Records Department",
    technicalOwner: "Facilities Management",
    securityControls: [
      "Physical Access Control",
      "Fire Protection",
      "Environmental Controls",
    ],
    encryptionInPlace: false,
    accessControls: ["Key card access", "Sign-in/out logs", "Surveillance"],
    retentionPolicy: "7 years after last patient contact",
    backupStrategy: "Scanned copies stored in EHR as backup",
    lastRiskAssessment: "2025-02-15T11:20:00Z",
    riskLevel: RiskLevel.HIGH,
    createdAt: "2024-07-10T09:15:00Z",
    updatedAt: "2025-02-15T11:20:00Z",
  },
];

// PHI Data Tracking component
const PHIDataTracking: React.FC = () => {
  const theme = useTheme();

  // State for data
  const [phiLocations, setPhiLocations] = useState<PhiLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [systemTypeFilter, setSystemTypeFilter] = useState<string>("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("");

  // State for detailed view
  const [selectedLocation, setSelectedLocation] = useState<PhiLocation | null>(
    null
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Load data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setPhiLocations(samplePhiLocations);
        setError(null);
      } catch (err) {
        setError("Failed to load PHI location data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Open detail dialog for a PHI location
  const handleViewDetails = (location: PhiLocation) => {
    setSelectedLocation(location);
    setDetailDialogOpen(true);
  };

  // Close detail dialog
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setSelectedLocation(null);
  };

  // Filter locations based on search and filters
  const filteredLocations = phiLocations.filter((location) => {
    const matchesSearch =
      !searchQuery ||
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.dataOwner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSystemType =
      !systemTypeFilter || location.systemType === systemTypeFilter;
    const matchesRiskLevel =
      !riskLevelFilter || location.riskLevel === riskLevelFilter;

    return matchesSearch && matchesSystemType && matchesRiskLevel;
  });

  // Format risk level chip
  const renderRiskLevelChip = (riskLevel: RiskLevel) => {
    let color: "success" | "warning" | "error" | "default" = "default";

    switch (riskLevel) {
      case RiskLevel.LOW:
        color = "success";
        break;
      case RiskLevel.MEDIUM:
        color = "warning";
        break;
      case RiskLevel.HIGH:
      case RiskLevel.CRITICAL:
        color = "error";
        break;
    }

    return <Chip label={riskLevel} color={color} size="small" />;
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
            <FolderIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              PHI Data Tracking
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track and monitor the location of protected health information
              across systems and applications.
            </Typography>
          </Grid>
          <Grid item>
            <Button variant="contained" startIcon={<AddIcon />}>
              Add PHI Location
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* PHI Type Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                PHI by System Type
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}
              >
                {["DATABASE", "APPLICATION", "PHYSICAL", "CLOUD", "DEVICE"].map(
                  (type) => {
                    const count = phiLocations.filter(
                      (loc) => loc.systemType === type
                    ).length;
                    if (count === 0) return null;

                    return (
                      <Box
                        key={type}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2">{type}</Typography>
                        <Chip label={count} size="small" variant="outlined" />
                      </Box>
                    );
                  }
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                PHI by Risk Level
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}
              >
                {Object.values(RiskLevel).map((level) => {
                  const count = phiLocations.filter(
                    (loc) => loc.riskLevel === level
                  ).length;
                  if (count === 0) return null;

                  return (
                    <Box
                      key={level}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">{level}</Typography>
                      <Chip
                        label={count}
                        size="small"
                        color={
                          level === RiskLevel.LOW
                            ? "success"
                            : level === RiskLevel.MEDIUM
                            ? "warning"
                            : "error"
                        }
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Security Status
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="body2">Encryption in place</Typography>
                <Chip
                  label={`${
                    phiLocations.filter((loc) => loc.encryptionInPlace).length
                  }/${phiLocations.length}`}
                  size="small"
                  color="success"
                  icon={<EncryptionIcon />}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="body2">Risk assessment needed</Typography>
                <Chip
                  label={
                    phiLocations.filter((loc) => {
                      const lastAssessment = new Date(
                        loc.lastRiskAssessment || ""
                      );
                      const threeMonthsAgo = new Date();
                      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
                      return lastAssessment < threeMonthsAgo;
                    }).length
                  }
                  size="small"
                  color="warning"
                  icon={<WarningIcon />}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">High risk locations</Typography>
                <Chip
                  label={
                    phiLocations.filter(
                      (loc) =>
                        loc.riskLevel === RiskLevel.HIGH ||
                        loc.riskLevel === RiskLevel.CRITICAL
                    ).length
                  }
                  size="small"
                  color="error"
                  icon={<SecurityIcon />}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
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
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              placeholder="Search PHI locations..."
              fullWidth
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="system-type-filter-label">System Type</InputLabel>
              <Select
                labelId="system-type-filter-label"
                value={systemTypeFilter}
                label="System Type"
                onChange={(e) => setSystemTypeFilter(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="DATABASE">Database</MenuItem>
                <MenuItem value="APPLICATION">Application</MenuItem>
                <MenuItem value="PHYSICAL">Physical</MenuItem>
                <MenuItem value="CLOUD">Cloud</MenuItem>
                <MenuItem value="DEVICE">Device</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="risk-level-filter-label">Risk Level</InputLabel>
              <Select
                labelId="risk-level-filter-label"
                value={riskLevelFilter}
                label="Risk Level"
                onChange={(e) => setRiskLevelFilter(e.target.value)}
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value={RiskLevel.LOW}>Low</MenuItem>
                <MenuItem value={RiskLevel.MEDIUM}>Medium</MenuItem>
                <MenuItem value={RiskLevel.HIGH}>High</MenuItem>
                <MenuItem value={RiskLevel.CRITICAL}>Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button startIcon={<FilterIcon />} sx={{ mr: 1 }}>
              More Filters
            </Button>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSystemTypeFilter("");
                setRiskLevelFilter("");
              }}
            >
              Clear
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
                  <TableCell>PHI Location</TableCell>
                  <TableCell>System Type</TableCell>
                  <TableCell>PHI Types</TableCell>
                  <TableCell>Data Owner</TableCell>
                  <TableCell>Security</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Last Assessment</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No PHI locations found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {location.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {location.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={location.systemType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {location.phiTypes.slice(0, 2).map((type) => (
                            <Chip
                              key={type}
                              label={type.split("_").join(" ")}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          ))}
                          {location.phiTypes.length > 2 && (
                            <Chip
                              label={`+${location.phiTypes.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{location.dataOwner}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            location.encryptionInPlace
                              ? "Encrypted"
                              : "Unencrypted"
                          }
                          color={
                            location.encryptionInPlace ? "success" : "error"
                          }
                          size="small"
                          icon={<EncryptionIcon />}
                        />
                      </TableCell>
                      <TableCell>
                        {renderRiskLevelChip(location.riskLevel)}
                      </TableCell>
                      <TableCell>
                        {location.lastRiskAssessment
                          ? new Date(
                              location.lastRiskAssessment
                            ).toLocaleDateString()
                          : "Not assessed"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(location)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
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

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={handleCloseDetailDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedLocation && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FolderIcon sx={{ mr: 1 }} />
                {selectedLocation.name}
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {selectedLocation.description}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    System Information
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <strong>Type:</strong> {selectedLocation.systemType}
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <strong>Location:</strong> {selectedLocation.location}
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <strong>Data Owner:</strong> {selectedLocation.dataOwner}
                  </Typography>
                  <Typography variant="body2" component="div">
                    <strong>Technical Owner:</strong>{" "}
                    {selectedLocation.technicalOwner}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Risk Information
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <strong>Risk Level:</strong>{" "}
                    {renderRiskLevelChip(selectedLocation.riskLevel)}
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <strong>Last Assessment:</strong>{" "}
                    {selectedLocation.lastRiskAssessment
                      ? new Date(
                          selectedLocation.lastRiskAssessment
                        ).toLocaleDateString()
                      : "Not assessed"}
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <strong>Encryption:</strong>{" "}
                    {selectedLocation.encryptionInPlace
                      ? "Enabled"
                      : "Not enabled"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    PHI Types
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedLocation.phiTypes.map((type) => (
                      <Chip
                        key={type}
                        label={type.split("_").join(" ")}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Security Controls
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedLocation.securityControls.map((control) => (
                      <Chip
                        key={control}
                        label={control}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Access Controls
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedLocation.accessControls.map((control) => (
                      <Chip
                        key={control}
                        label={control}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Data Management
                  </Typography>
                  <Typography variant="body2" component="div" gutterBottom>
                    <strong>Retention Policy:</strong>{" "}
                    {selectedLocation.retentionPolicy}
                  </Typography>
                  <Typography variant="body2" component="div">
                    <strong>Backup Strategy:</strong>{" "}
                    {selectedLocation.backupStrategy}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>Close</Button>
              <Button variant="outlined" startIcon={<EditIcon />}>
                Edit
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default PHIDataTracking;
