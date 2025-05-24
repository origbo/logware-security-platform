/**
 * ISMS Framework Component
 *
 * This component represents the Information Security Management System (ISMS)
 * framework according to ISO 27001 requirements, showing the organization's
 * approach to information security governance.
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Policy as PolicyIcon,
  Apps as FrameworkIcon,
  Description as DocumentIcon,
  Assignment as ProcessIcon,
  GroupWork as ScopeIcon,
  Business as ResponsibilityIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PlaylistAddCheck as ControlsIcon,
  Assessment as AssessmentIcon,
  Loop as PlanActIcon,
} from "@mui/icons-material";

// ISMS Framework component
const ISMSFramework: React.FC = () => {
  const theme = useTheme();

  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<
    "scope" | "policy" | "risk" | "responsibility"
  >("scope");

  // ISMS components progress
  const componentProgress = {
    scope: 85,
    leadership: 90,
    planning: 75,
    support: 80,
    operation: 70,
    performance: 65,
    improvement: 60,
  };

  // Load data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setError(null);
      } catch (err) {
        setError("Failed to load ISMS framework data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Open dialog for editing
  const handleOpenDialog = (
    type: "scope" | "policy" | "risk" | "responsibility"
  ) => {
    setDialogType(type);
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Render component progress
  const renderProgress = (label: string, value: number) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" color="textSecondary">
          {value}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{ height: 8, borderRadius: 1 }}
        color={value > 75 ? "success" : value > 50 ? "warning" : "error"}
      />
    </Box>
  );

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
            <FrameworkIcon color="primary" sx={{ fontSize: 40 }} />
          </Grid>
          <Grid item xs>
            <Typography variant="h5" component="h1" gutterBottom>
              ISMS Framework
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Information Security Management System (ISMS) framework according
              to ISO 27001 requirements.
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<DocumentIcon />}
              sx={{ mr: 1 }}
            >
              Export ISMS Documentation
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
        <Grid container spacing={3}>
          {/* ISMS Overview Card */}
          <Grid item xs={12} md={4}>
            <Card
              elevation={0}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                height: "100%",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">ISMS Overview</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Overall Implementation Progress
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{ position: "relative", display: "inline-flex", mr: 2 }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={75}
                      size={60}
                      thickness={5}
                      sx={{ color: theme.palette.success.main }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="body2"
                        component="div"
                        color="text.secondary"
                      >
                        75%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      Last updated: May 5, 2025
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Next review: August 5, 2025
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="subtitle2" gutterBottom>
                  ISMS Component Implementation
                </Typography>
                {renderProgress(
                  "4. Context of the Organization",
                  componentProgress.scope
                )}
                {renderProgress("5. Leadership", componentProgress.leadership)}
                {renderProgress("6. Planning", componentProgress.planning)}
                {renderProgress("7. Support", componentProgress.support)}
                {renderProgress("8. Operation", componentProgress.operation)}
                {renderProgress(
                  "9. Performance Evaluation",
                  componentProgress.performance
                )}
                {renderProgress(
                  "10. Improvement",
                  componentProgress.improvement
                )}

                <Box sx={{ mt: 2 }}>
                  <Button
                    startIcon={<AssessmentIcon />}
                    variant="outlined"
                    fullWidth
                  >
                    View Detailed ISMS Metrics
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* ISMS Framework Details */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{ border: `1px solid ${theme.palette.divider}` }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="h6">ISMS Framework Components</Typography>
              </Box>

              {/* ISMS Scope */}
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="isms-scope-content"
                  id="isms-scope-header"
                >
                  <ScopeIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1">
                    4. Context of the Organization & Scope
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" paragraph>
                      The scope of the Information Security Management System
                      covers all information assets, systems, and processes
                      related to the organization's core business operations,
                      including:
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Cloud-based customer data management systems"
                          secondary="Including all associated infrastructure and applications"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Financial management systems"
                          secondary="Including accounting software and payment processing systems"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <SecurityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Employee information systems"
                          secondary="Including HR databases and remote access capabilities"
                        />
                      </ListItem>
                    </List>
                  </Box>
                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog("scope")}
                    >
                      Edit Scope
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* ISMS Leadership */}
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="isms-leadership-content"
                  id="isms-leadership-header"
                >
                  <ResponsibilityIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1">
                    5. Leadership & Commitment
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" gutterBottom>
                    5.1 Leadership and Commitment
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Top management demonstrates leadership and commitment with
                    respect to the ISMS by ensuring that information security
                    objectives are established and are compatible with the
                    strategic direction of the organization.
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    5.2 Information Security Policy
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The organization has established an information security
                    policy that is appropriate to the purpose of the
                    organization, includes information security objectives, and
                    includes a commitment to satisfy applicable requirements.
                  </Typography>
                  <Button
                    startIcon={<DocumentIcon />}
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    View Information Security Policy
                  </Button>

                  <Typography variant="subtitle2" gutterBottom>
                    5.3 Organizational Roles, Responsibilities, and Authorities
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <ResponsibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Chief Information Security Officer (CISO)"
                          secondary="Overall responsibility for the ISMS and information security strategy"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <ResponsibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Information Security Manager"
                          secondary="Day-to-day management of the ISMS and security controls"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <ResponsibilityIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Information Security Committee"
                          secondary="Cross-functional team that reviews and approves security policies and initiatives"
                        />
                      </ListItem>
                    </List>
                  </Box>
                  <Box
                    sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenDialog("responsibility")}
                    >
                      Edit Roles & Responsibilities
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* ISMS Planning */}
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="isms-planning-content"
                  id="isms-planning-header"
                >
                  <AssessmentIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1">6. Planning</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" gutterBottom>
                    6.1 Actions to Address Risks and Opportunities
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The organization has implemented a risk assessment
                    methodology to identify information security risks, analyze
                    and evaluate those risks, and determine appropriate risk
                    treatment plans.
                  </Typography>
                  <Button
                    startIcon={<AssessmentIcon />}
                    size="small"
                    sx={{ mb: 2 }}
                    onClick={() => handleOpenDialog("risk")}
                  >
                    View Risk Assessment Methodology
                  </Button>

                  <Typography variant="subtitle2" gutterBottom>
                    6.2 Information Security Objectives and Planning
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The organization has established information security
                    objectives at relevant functions and levels. These
                    objectives are measurable, monitored, communicated, and
                    updated as appropriate.
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <ControlsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Achieve 95% compliance with security awareness training requirements"
                        secondary="Target date: Q3 2025"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ControlsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reduce security incidents by 20% compared to previous year"
                        secondary="Target date: Q4 2025"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ControlsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Implement MFA for all critical systems"
                        secondary="Target date: Q2 2025"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>

              {/* ISMS Support */}
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="isms-support-content"
                  id="isms-support-header"
                >
                  <ProcessIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1">7. Support</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      7.1 Resources
                    </Typography>
                    <Typography variant="body2" paragraph>
                      The organization determines and provides the resources
                      needed for the establishment, implementation, maintenance,
                      and continual improvement of the ISMS.
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      7.2 Competence
                    </Typography>
                    <Typography variant="body2" paragraph>
                      The organization ensures that personnel responsible for
                      information security are competent on the basis of
                      appropriate education, training, or experience.
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      7.3 Awareness
                    </Typography>
                    <Typography variant="body2" paragraph>
                      All personnel are aware of the information security
                      policy, their contribution to the effectiveness of the
                      ISMS, and the implications of not conforming to ISMS
                      requirements.
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      7.4 Communication
                    </Typography>
                    <Typography variant="body2" paragraph>
                      The organization has determined the internal and external
                      communications relevant to the ISMS, including what, when,
                      with whom, and how to communicate.
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>
                      7.5 Documented Information
                    </Typography>
                    <Typography variant="body2" paragraph>
                      The ISMS includes documented information required by the
                      ISO 27001 standard and determined by the organization as
                      necessary for the effectiveness of the ISMS.
                    </Typography>
                  </Box>
                  <Button startIcon={<DocumentIcon />} size="small">
                    View ISMS Documentation Library
                  </Button>
                </AccordionDetails>
              </Accordion>

              {/* ISMS Operation */}
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="isms-operation-content"
                  id="isms-operation-header"
                >
                  <ControlsIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1">8. Operation</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" gutterBottom>
                    8.1 Operational Planning and Control
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The organization plans, implements, and controls the
                    processes needed to meet information security requirements
                    and to implement the actions determined in the planning
                    phase.
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    8.2 Information Security Risk Assessment
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The organization performs information security risk
                    assessments at planned intervals or when significant changes
                    occur, according to the established risk assessment
                    methodology.
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    8.3 Information Security Risk Treatment
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The organization implements the information security risk
                    treatment plan and determines all controls necessary to
                    implement the risk treatment options chosen.
                  </Typography>
                  <Button startIcon={<AssessmentIcon />} size="small">
                    View Risk Register
                  </Button>
                </AccordionDetails>
              </Accordion>

              {/* ISMS Performance Evaluation */}
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="isms-evaluation-content"
                  id="isms-evaluation-header"
                >
                  <AssessmentIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1">
                    9. Performance Evaluation
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" gutterBottom>
                    9.1 Monitoring, Measurement, Analysis, and Evaluation
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The organization evaluates the information security
                    performance and the effectiveness of the ISMS through
                    monitoring, measurement, analysis, and evaluation.
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    9.2 Internal Audit
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The organization conducts internal audits at planned
                    intervals to provide information on whether the ISMS
                    conforms to the organization's own requirements and the
                    requirements of ISO 27001.
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    9.3 Management Review
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Top management reviews the organization's ISMS at planned
                    intervals to ensure its continuing suitability, adequacy,
                    and effectiveness.
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Next Management Review: July 15, 2025
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* ISMS Improvement */}
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="isms-improvement-content"
                  id="isms-improvement-header"
                >
                  <PlanActIcon
                    sx={{ mr: 1, color: theme.palette.primary.main }}
                  />
                  <Typography variant="subtitle1">10. Improvement</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="subtitle2" gutterBottom>
                    10.1 Nonconformity and Corrective Action
                  </Typography>
                  <Typography variant="body2" paragraph>
                    When nonconformities occur, the organization takes action to
                    control and correct them, and deals with the consequences.
                    It also evaluates the need for action to eliminate the
                    causes of nonconformity.
                  </Typography>

                  <Typography variant="subtitle2" gutterBottom>
                    10.2 Continual Improvement
                  </Typography>
                  <Typography variant="body2" paragraph>
                    The organization continually improves the suitability,
                    adequacy, and effectiveness of the ISMS through the use of
                    the results of management review, internal audits, and
                    corrective actions.
                  </Typography>
                  <Button startIcon={<PlanActIcon />} size="small">
                    View Improvement Initiatives
                  </Button>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Dialog for editing components */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialogType === "scope" && "Edit ISMS Scope"}
          {dialogType === "policy" && "Edit Information Security Policy"}
          {dialogType === "risk" && "Edit Risk Assessment Methodology"}
          {dialogType === "responsibility" && "Edit Roles & Responsibilities"}
        </DialogTitle>
        <DialogContent dividers>
          {dialogType === "scope" && (
            <TextField
              fullWidth
              multiline
              rows={10}
              variant="outlined"
              label="ISMS Scope"
              defaultValue="The scope of the Information Security Management System covers all information assets, systems, and processes related to the organization's core business operations, including:
              
- Cloud-based customer data management systems, including all associated infrastructure and applications
- Financial management systems, including accounting software and payment processing systems
- Employee information systems, including HR databases and remote access capabilities
- Data centers, network infrastructure, and communication systems
- Third-party services that process or store organization data"
            />
          )}

          {dialogType === "responsibility" && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Information Security Roles & Responsibilities
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                label="Roles & Responsibilities"
                defaultValue="Chief Information Security Officer (CISO): Overall responsibility for the ISMS and information security strategy.
                
Information Security Manager: Day-to-day management of the ISMS and security controls.
                
Information Security Committee: Cross-functional team that reviews and approves security policies and initiatives.
                
IT Operations Team: Implementation and maintenance of technical security controls.
                
Compliance Officer: Ensuring that the ISMS meets regulatory and contractual requirements."
                sx={{ mb: 2 }}
              />

              <Button startIcon={<AddIcon />} variant="outlined" sx={{ mt: 1 }}>
                Add New Role
              </Button>
            </Box>
          )}

          {dialogType === "risk" && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Risk Assessment Methodology
              </Typography>
              <Typography variant="body2" paragraph>
                Describe the approach used to identify, analyze, and evaluate
                information security risks.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                variant="outlined"
                label="Risk Assessment Methodology"
                defaultValue="The organization follows a structured risk assessment approach that includes:

1. Asset identification and valuation
2. Threat and vulnerability identification
3. Risk analysis using a qualitative approach (likelihood x impact)
4. Risk evaluation against established criteria
5. Risk treatment option selection
6. Implementation of controls
7. Monitoring and review of risks

Risks are categorized as Low, Medium, High, or Critical based on their combined likelihood and impact scores."
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseDialog}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ISMSFramework;
