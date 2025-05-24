/**
 * Risk Assessment Tool Component
 *
 * Tool for conducting information security risk assessments
 * according to ISO 27001 requirements
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
  Rating,
  Divider,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Business as AssetIcon,
  Security as SecurityIcon,
  BugReport as ThreatIcon,
  Error as VulnerabilityIcon,
  VerifiedUser as ControlIcon,
} from "@mui/icons-material";

// Import ISO 27001 types
import {
  Risk,
  RiskLevel,
  InformationAsset,
  IsoControl,
} from "../../types/iso27001Types";

// Sample data - replace with API call in production
const sampleRisks: Risk[] = [
  {
    id: "risk-1",
    title: "Unauthorized data access",
    description:
      "Risk of unauthorized access to sensitive information due to weak access controls",
    assets: ["asset-1", "asset-3"],
    threatSource: "External threat actors, malicious insiders",
    vulnerability:
      "Weak access control mechanisms, lack of multi-factor authentication",
    likelihood: "MEDIUM",
    impact: "HIGH",
    inherentRiskLevel: RiskLevel.HIGH,
    controls: ["A.9.2.1", "A.9.2.3", "A.9.4.2"],
    residualRiskLevel: RiskLevel.MEDIUM,
    treatment: "MITIGATE",
    treatmentPlan:
      "Implement multi-factor authentication and enhance access controls",
    treatmentOwner: "IT Security Team",
    reviewFrequency: "QUARTERLY",
    nextReview: "2025-07-15T10:00:00Z",
    status: "OPEN",
    createdAt: "2025-04-15T10:30:00Z",
    updatedAt: "2025-04-15T10:30:00Z",
  },
  {
    id: "risk-2",
    title: "Data breach through cloud services",
    description: "Risk of data breach through misconfigured cloud services",
    assets: ["asset-2", "asset-4"],
    threatSource: "External threat actors, misconfigurations",
    vulnerability: "Misconfigured cloud storage buckets, excessive permissions",
    likelihood: "MEDIUM",
    impact: "HIGH",
    inherentRiskLevel: RiskLevel.HIGH,
    controls: ["A.13.1.3", "A.14.2.1"],
    residualRiskLevel: RiskLevel.MEDIUM,
    treatment: "MITIGATE",
    treatmentPlan:
      "Implement cloud security monitoring and regular vulnerability assessments",
    treatmentOwner: "Cloud Security Team",
    reviewFrequency: "QUARTERLY",
    nextReview: "2025-07-20T10:00:00Z",
    status: "OPEN",
    createdAt: "2025-04-10T14:45:00Z",
    updatedAt: "2025-04-10T14:45:00Z",
  },
  {
    id: "risk-3",
    title: "Business continuity disruption",
    description:
      "Risk of business operations disruption due to system failures or disasters",
    assets: ["asset-1", "asset-5"],
    threatSource: "Natural disasters, system failures, power outages",
    vulnerability:
      "Inadequate business continuity planning, single points of failure",
    likelihood: "LOW",
    impact: "HIGH",
    inherentRiskLevel: RiskLevel.MEDIUM,
    controls: ["A.17.1.1", "A.17.1.2", "A.17.2.1"],
    residualRiskLevel: RiskLevel.LOW,
    treatment: "MITIGATE",
    treatmentPlan:
      "Enhance business continuity plans and disaster recovery capabilities",
    treatmentOwner: "Business Continuity Team",
    reviewFrequency: "BIANNUALLY",
    nextReview: "2025-10-15T10:00:00Z",
    status: "OPEN",
    createdAt: "2025-04-05T15:10:00Z",
    updatedAt: "2025-04-05T15:10:00Z",
  },
];

// Risk Assessment Tool component
const RiskAssessmentTool: React.FC = () => {
  const theme = useTheme();

  // State for data
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // State for risk assessment wizard
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Load data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setRisks(sampleRisks);
        setError(null);
      } catch (err) {
        setError("Failed to load risk assessment data");
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

  // Filter risks based on search and filters
  const filteredRisks = risks.filter((risk) => {
    const matchesSearch =
      !searchQuery ||
      risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRiskLevel =
      !riskLevelFilter || risk.residualRiskLevel === riskLevelFilter;
    const matchesStatus = !statusFilter || risk.status === statusFilter;

    return matchesSearch && matchesRiskLevel && matchesStatus;
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

  // Risk assessment wizard steps
  const wizardSteps = [
    "Identify Assets",
    "Identify Threats & Vulnerabilities",
    "Assess Likelihood & Impact",
    "Determine Controls",
    "Calculate Residual Risk",
    "Define Treatment Plan",
  ];

  // Handle wizard next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle wizard back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle wizard reset
  const handleReset = () => {
    setActiveStep(0);
  };

  // Handle wizard close
  const handleWizardClose = () => {
    setWizardOpen(false);
    setActiveStep(0);
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
            <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              Risk Assessment Tool
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Identify, assess, and manage information security risks according
              to ISO 27001 requirements.
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setWizardOpen(true)}
            >
              New Risk Assessment
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Risk Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Total Risks
              </Typography>
              <Typography variant="h4" component="div">
                {risks.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last updated:{" "}
                {risks.length > 0
                  ? new Date(risks[0].updatedAt).toLocaleDateString()
                  : "N/A"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                By Risk Level
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}
              >
                {Object.values(RiskLevel).map((level) => {
                  const count = risks.filter(
                    (risk) => risk.residualRiskLevel === level
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
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                By Treatment
              </Typography>
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}
              >
                {["MITIGATE", "ACCEPT", "TRANSFER", "AVOID"].map(
                  (treatment) => {
                    const count = risks.filter(
                      (risk) => risk.treatment === treatment
                    ).length;
                    if (count === 0) return null;

                    return (
                      <Box
                        key={treatment}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2">{treatment}</Typography>
                        <Chip label={count} size="small" variant="outlined" />
                      </Box>
                    );
                  }
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Upcoming Reviews
              </Typography>
              <Typography variant="h6" component="div">
                2 Risks
              </Typography>
              <Typography variant="body2">Due in the next 30 days</Typography>
              <Box sx={{ mt: 1 }}>
                <Button size="small" color="primary">
                  View Schedule
                </Button>
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
              placeholder="Search risks..."
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
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="TREATED">Treated</MenuItem>
                <MenuItem value="ACCEPTED">Accepted</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Button
              onClick={() => {
                setSearchQuery("");
                setRiskLevelFilter("");
                setStatusFilter("");
              }}
            >
              Clear Filters
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
                  <TableCell>Risk Title</TableCell>
                  <TableCell>Inherent Risk</TableCell>
                  <TableCell>Controls</TableCell>
                  <TableCell>Residual Risk</TableCell>
                  <TableCell>Treatment</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Next Review</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRisks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No risks found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRisks.map((risk) => (
                    <TableRow key={risk.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {risk.title}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {risk.description.slice(0, 60)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {renderRiskLevelChip(risk.inherentRiskLevel)}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {risk.controls.slice(0, 2).map((control) => (
                            <Chip
                              key={control}
                              label={control}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          ))}
                          {risk.controls.length > 2 && (
                            <Chip
                              label={`+${risk.controls.length - 2}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {renderRiskLevelChip(risk.residualRiskLevel)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={risk.treatment}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={risk.status}
                          size="small"
                          color={
                            risk.status === "CLOSED" ? "success" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(risk.nextReview).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
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

      {/* Risk Assessment Wizard Dialog */}
      <Dialog
        open={wizardOpen}
        onClose={handleWizardClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AssessmentIcon sx={{ mr: 1 }} />
            Risk Assessment Wizard
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {wizardSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Wizard Content */}
          <Box sx={{ mt: 2 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Step 1: Identify Assets
                </Typography>
                <Typography variant="body2" paragraph>
                  Select the information assets that may be affected by this
                  risk.
                </Typography>
                {/* Asset selection form would go here */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="asset-select-label">Select Assets</InputLabel>
                  <Select
                    labelId="asset-select-label"
                    multiple
                    value={[]}
                    label="Select Assets"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="Customer Database">
                      Customer Database
                    </MenuItem>
                    <MenuItem value="Financial Records">
                      Financial Records
                    </MenuItem>
                    <MenuItem value="Web Application">Web Application</MenuItem>
                    <MenuItem value="Internal Network">
                      Internal Network
                    </MenuItem>
                    <MenuItem value="Employee Data">Employee Data</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Step 2: Identify Threats & Vulnerabilities
                </Typography>
                <Typography variant="body2" paragraph>
                  Describe the threats and vulnerabilities that could exploit
                  the assets.
                </Typography>
                {/* Threats and vulnerabilities form would go here */}
                <TextField
                  label="Threat Sources"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="External threat actors, malicious insiders, natural disasters, etc."
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Vulnerabilities"
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Weak access controls, unpatched systems, lack of training, etc."
                  sx={{ mb: 2 }}
                />
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Step 3: Assess Likelihood & Impact
                </Typography>
                <Typography variant="body2" paragraph>
                  Rate the likelihood of the risk occurring and the potential
                  impact.
                </Typography>
                {/* Likelihood and impact assessment form would go here */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Likelihood Rating
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Likelihood</InputLabel>
                      <Select label="Likelihood" value="MEDIUM">
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Impact Rating
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Impact</InputLabel>
                      <Select label="Impact" value="HIGH">
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 3 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Step 4: Determine Controls
                </Typography>
                <Typography variant="body2" paragraph>
                  Select the controls that mitigate this risk.
                </Typography>
                {/* Controls selection form would go here */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="controls-select-label">
                    Select Controls
                  </InputLabel>
                  <Select
                    labelId="controls-select-label"
                    multiple
                    value={[]}
                    label="Select Controls"
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="A.9.2.1">
                      A.9.2.1 User registration and de-registration
                    </MenuItem>
                    <MenuItem value="A.9.2.3">
                      A.9.2.3 Management of privileged access rights
                    </MenuItem>
                    <MenuItem value="A.9.4.2">
                      A.9.4.2 Secure log-on procedures
                    </MenuItem>
                    <MenuItem value="A.13.1.3">
                      A.13.1.3 Segregation in networks
                    </MenuItem>
                    <MenuItem value="A.14.2.1">
                      A.14.2.1 Secure development policy
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}

            {activeStep === 4 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Step 5: Calculate Residual Risk
                </Typography>
                <Typography variant="body2" paragraph>
                  Determine the residual risk level after implementing controls.
                </Typography>
                {/* Residual risk assessment form would go here */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Inherent Risk Level
                    </Typography>
                    <Chip label="HIGH" color="error" sx={{ mt: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Residual Risk Level
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Residual Risk</InputLabel>
                      <Select label="Residual Risk" value="MEDIUM">
                        <MenuItem value="LOW">Low</MenuItem>
                        <MenuItem value="MEDIUM">Medium</MenuItem>
                        <MenuItem value="HIGH">High</MenuItem>
                        <MenuItem value="CRITICAL">Critical</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 5 && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Step 6: Define Treatment Plan
                </Typography>
                <Typography variant="body2" paragraph>
                  Specify how the risk will be treated and the action plan.
                </Typography>
                {/* Treatment plan form would go here */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Treatment Strategy</InputLabel>
                  <Select label="Treatment Strategy" value="MITIGATE">
                    <MenuItem value="MITIGATE">Mitigate</MenuItem>
                    <MenuItem value="ACCEPT">Accept</MenuItem>
                    <MenuItem value="TRANSFER">Transfer</MenuItem>
                    <MenuItem value="AVOID">Avoid</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Treatment Plan"
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Describe the specific actions to be taken to treat the risk"
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Treatment Owner</InputLabel>
                  <Select label="Treatment Owner" value="">
                    <MenuItem value="IT Security Team">
                      IT Security Team
                    </MenuItem>
                    <MenuItem value="Cloud Security Team">
                      Cloud Security Team
                    </MenuItem>
                    <MenuItem value="Business Continuity Team">
                      Business Continuity Team
                    </MenuItem>
                    <MenuItem value="Data Protection Team">
                      Data Protection Team
                    </MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Review Frequency</InputLabel>
                  <Select label="Review Frequency" value="QUARTERLY">
                    <MenuItem value="MONTHLY">Monthly</MenuItem>
                    <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                    <MenuItem value="BIANNUALLY">Biannually</MenuItem>
                    <MenuItem value="ANNUALLY">Annually</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWizardClose}>Cancel</Button>
          <Box sx={{ flex: "1 1 auto" }} />
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          {activeStep === wizardSteps.length - 1 ? (
            <Button variant="contained" color="primary">
              Complete Assessment
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNext}>
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskAssessmentTool;
