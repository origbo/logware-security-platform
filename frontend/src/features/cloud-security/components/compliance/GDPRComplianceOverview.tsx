import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  LinearProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Lock as LockIcon,
  VerifiedUser as VerifiedUserIcon,
  Person as PersonIcon,
  DataUsage as DataUsageIcon,
  Business as BusinessIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

/**
 * GDPR Compliance Overview Component
 * Provides an overview of GDPR compliance status and key requirements
 */
const GDPRComplianceOverview: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock compliance data (in a real implementation, this would come from the API)
  const complianceData = {
    overallCompliance: 72,
    assessmentDate: "2025-05-15",
    categories: [
      {
        id: "data-processing",
        name: "Data Processing Principles",
        compliance: 85,
        controls: 8,
        compliant: 7,
      },
      {
        id: "data-rights",
        name: "Data Subject Rights",
        compliance: 70,
        controls: 10,
        compliant: 7,
      },
      {
        id: "security",
        name: "Security of Processing",
        compliance: 80,
        controls: 12,
        compliant: 10,
      },
      {
        id: "dpia",
        name: "Data Protection Impact Assessment",
        compliance: 60,
        controls: 5,
        compliant: 3,
      },
      {
        id: "dpo",
        name: "Data Protection Officer",
        compliance: 100,
        controls: 3,
        compliant: 3,
      },
      {
        id: "breach",
        name: "Breach Notification",
        compliance: 66,
        controls: 6,
        compliant: 4,
      },
      {
        id: "international",
        name: "International Transfers",
        compliance: 50,
        controls: 4,
        compliant: 2,
      },
    ],
    keyMeasures: [
      {
        id: "controllers",
        name: "Controllers & Processors",
        status: "compliant",
        icon: <BusinessIcon />,
      },
      {
        id: "consent",
        name: "Consent Management",
        status: "warning",
        icon: <PersonIcon />,
      },
      {
        id: "pii",
        name: "PII Identification",
        status: "compliant",
        icon: <DataUsageIcon />,
      },
      {
        id: "encryption",
        name: "Data Encryption",
        status: "compliant",
        icon: <LockIcon />,
      },
      {
        id: "dpo-appointment",
        name: "DPO Appointment",
        status: "compliant",
        icon: <AssignmentIcon />,
      },
      {
        id: "breach-process",
        name: "Breach Process",
        status: "warning",
        icon: <SecurityIcon />,
      },
    ],
  };

  // Get status color based on compliance percentage
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return theme.palette.success.main;
    if (percentage >= 70) return theme.palette.success.light;
    if (percentage >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get status color based on compliance status text
  const getStatusColorFromText = (status: string) => {
    switch (status) {
      case "compliant":
        return theme.palette.success.main;
      case "warning":
        return theme.palette.warning.main;
      case "non-compliant":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Navigate to assessment
  const handleRunAssessment = () => {
    navigate("/cloud-security/compliance/gdpr/assessment");
  };

  // Navigate to details
  const handleViewDetails = () => {
    navigate("/cloud-security/compliance/gdpr/details");
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              GDPR Compliance
            </Typography>
            <Typography variant="body1" paragraph>
              General Data Protection Regulation (GDPR) is a regulation in EU
              law on data protection and privacy for all individuals within the
              European Union.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Chip
                label={`Last Assessment: ${formatDate(
                  complianceData.assessmentDate
                )}`}
                size="small"
                sx={{ mr: 2 }}
              />
              <Chip
                label={`${complianceData.overallCompliance}% Compliant`}
                size="small"
                color={
                  complianceData.overallCompliance >= 70
                    ? "success"
                    : complianceData.overallCompliance >= 50
                    ? "warning"
                    : "error"
                }
              />
            </Box>
          </Box>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRunAssessment}
              sx={{ mr: 1 }}
            >
              Run Assessment
            </Button>
            <Button variant="outlined" onClick={handleViewDetails}>
              View Details
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Compliance Categories */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Compliance Categories
            </Typography>

            <List>
              {complianceData.categories.map((category) => (
                <React.Fragment key={category.id}>
                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body1">
                            {category.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: "bold",
                              color: getStatusColor(category.compliance),
                            }}
                          >
                            {category.compliance}%
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ width: "100%" }}>
                          <LinearProgress
                            variant="determinate"
                            value={category.compliance}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              mb: 0.5,
                              backgroundColor: alpha(
                                getStatusColor(category.compliance),
                                0.2
                              ),
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                backgroundColor: getStatusColor(
                                  category.compliance
                                ),
                              },
                            }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            {category.compliant} of {category.controls} controls
                            compliant
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Key Compliance Measures */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Key Compliance Measures
            </Typography>

            <List>
              {complianceData.keyMeasures.map((measure) => (
                <React.Fragment key={measure.id}>
                  <ListItem sx={{ py: 1 }}>
                    <ListItemIcon>
                      {React.cloneElement(measure.icon, {
                        color:
                          measure.status === "compliant"
                            ? "success"
                            : measure.status === "warning"
                            ? "warning"
                            : "error",
                      })}
                    </ListItemIcon>
                    <ListItemText primary={measure.name} />
                    <Chip
                      label={
                        measure.status.charAt(0).toUpperCase() +
                        measure.status.slice(1)
                      }
                      size="small"
                      sx={{
                        bgcolor: `${getStatusColorFromText(measure.status)}20`,
                        color: getStatusColorFromText(measure.status),
                        textTransform: "capitalize",
                      }}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleViewDetails}
              >
                View All Measures
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* GDPR Information */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          About GDPR Compliance
        </Typography>

        <Typography variant="body2" paragraph>
          The General Data Protection Regulation (GDPR) is a legal framework
          that sets guidelines for the collection and processing of personal
          information from individuals who live in the European Union (EU). It
          mandates that organizations protect the personal data and privacy of
          EU citizens for transactions that occur within EU member states.
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <PersonIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Data Subject Rights</Typography>
                </Box>
                <Typography variant="body2">
                  Right to access, rectify, delete personal data, and more.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LockIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Security Measures</Typography>
                </Box>
                <Typography variant="body2">
                  Implement appropriate technical and organizational security
                  measures.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <SecurityIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Breach Notification</Typography>
                </Box>
                <Typography variant="body2">
                  Notify authorities of data breaches within 72 hours.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Documentation</Typography>
                </Box>
                <Typography variant="body2">
                  Maintain records of processing activities and impact
                  assessments.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default GDPRComplianceOverview;
