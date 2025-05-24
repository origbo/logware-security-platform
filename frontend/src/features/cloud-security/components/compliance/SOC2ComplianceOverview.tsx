import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Verified as VerifiedIcon,
  Timer as TimerIcon,
  Lock as LockIcon,
  Storage as StorageIcon,
  FindInPage as FindIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SOC2ComplianceOverview: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock data - replace with actual API data in production
  const overviewData = {
    complianceScore: 83,
    lastAssessment: "2023-06-10T09:45:00Z",
    nonCompliantItems: 12,
    totalItems: 71,
    status: "In Progress",
    nextAuditDate: "2023-12-15T00:00:00Z",
    keyFindings: [
      {
        id: 1,
        title: "Incomplete change management procedures",
        severity: "High",
        category: "Change Management",
      },
      {
        id: 2,
        title: "Access review evidence needs improvement",
        severity: "Medium",
        category: "Access Control",
      },
      {
        id: 3,
        title: "Enhancement needed for vendor risk assessments",
        severity: "Medium",
        category: "Risk Management",
      },
      {
        id: 4,
        title: "Monitoring of system anomalies not fully documented",
        severity: "Low",
        category: "Monitoring",
      },
    ],
    trustCategories: [
      { name: "Security", compliant: 18, total: 22, score: 82 },
      { name: "Availability", compliant: 12, total: 14, score: 86 },
      { name: "Processing Integrity", compliant: 10, total: 12, score: 83 },
      { name: "Confidentiality", compliant: 11, total: 13, score: 85 },
      { name: "Privacy", compliant: 8, total: 10, score: 80 },
    ],
  };

  // Get color based on compliance score
  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get severity chip color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return {
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, 0.1),
        };
      case "medium":
        return {
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, 0.1),
        };
      case "low":
        return {
          color: theme.palette.info.main,
          bgColor: alpha(theme.palette.info.main, 0.1),
        };
      default:
        return {
          color: theme.palette.text.secondary,
          bgColor: alpha(theme.palette.text.secondary, 0.1),
        };
    }
  };

  // Navigate to detailed assessment
  const handleGoToAssessment = () => {
    navigate("/cloud-security/compliance/soc2/assessment");
  };

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundImage: "linear-gradient(to right, #1a237e, #3f51b5)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <VerifiedIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h4">SOC 2 Compliance</Typography>
        </Box>
        <Typography variant="subtitle1">
          System and Organization Controls for Service Organizations
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          Ensure your systems and processes meet the SOC 2 Trust Services
          Criteria for security, availability, processing integrity,
          confidentiality, and privacy.
        </Typography>
      </Paper>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall SOC 2 Compliance
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="h3"
                  sx={{
                    mr: 1,
                    color: getScoreColor(overviewData.complianceScore),
                  }}
                >
                  {overviewData.complianceScore}%
                </Typography>
                <Chip
                  label={overviewData.status}
                  sx={{
                    bgcolor: getScoreColor(overviewData.complianceScore),
                    color: "white",
                    fontWeight: "bold",
                  }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {overviewData.totalItems - overviewData.nonCompliantItems} of{" "}
                  {overviewData.totalItems} controls addressed
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={overviewData.complianceScore}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: alpha(
                      getScoreColor(overviewData.complianceScore),
                      0.2
                    ),
                    "& .MuiLinearProgress-bar": {
                      bgcolor: getScoreColor(overviewData.complianceScore),
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="textSecondary">
                  Last assessed:{" "}
                  {new Date(overviewData.lastAssessment).toLocaleDateString()}
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <TimerIcon sx={{ fontSize: 14, mr: 0.5 }} />
                  Next audit:{" "}
                  {new Date(overviewData.nextAuditDate).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trust Services Categories
              </Typography>
              {overviewData.trustCategories.map((category) => (
                <Box key={category.name} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2">{category.name}</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={getScoreColor(category.score)}
                    >
                      {category.score}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={{ flexGrow: 1, mr: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={category.score}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(getScoreColor(category.score), 0.1),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: getScoreColor(category.score),
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {category.compliant}/{category.total}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mt: 1 }}
                onClick={handleGoToAssessment}
              >
                View Detailed Assessment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trust Services Criteria
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Security"
                    secondary="Protection against unauthorized access, disclosure, and damage"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <TimerIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Availability"
                    secondary="System availability for operation and use as committed"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <VerifiedIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Processing Integrity"
                    secondary="System processing is complete, valid, accurate, timely, and authorized"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <LockIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Confidentiality"
                    secondary="Information designated as confidential is protected as committed"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Privacy"
                    secondary="Personal information is collected, used, retained, and disclosed in conformity with commitments"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Key Findings */}
      <Paper sx={{ mb: 3 }}>
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AssignmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6">Key Audit Findings</Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Finding</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {overviewData.keyFindings.map((finding) => {
                const severityColors = getSeverityColor(finding.severity);
                return (
                  <TableRow key={finding.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {finding.severity === "High" ? (
                          <ErrorIcon
                            sx={{ mr: 1, color: theme.palette.error.main }}
                          />
                        ) : finding.severity === "Medium" ? (
                          <WarningIcon
                            sx={{ mr: 1, color: theme.palette.warning.main }}
                          />
                        ) : (
                          <InfoIcon
                            sx={{ mr: 1, color: theme.palette.info.main }}
                          />
                        )}
                        <Typography variant="body2">{finding.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={finding.category}
                        size="small"
                        sx={{ fontWeight: "medium" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={finding.severity}
                        size="small"
                        sx={{
                          color: severityColors.color,
                          bgcolor: severityColors.bgColor,
                          fontWeight: "bold",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CheckIcon />}
                      >
                        Remediate
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* SOC 2 Readiness Cards */}
      <Typography variant="h6" gutterBottom>
        SOC 2 Audit Readiness
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <FindIcon
                  sx={{
                    fontSize: 40,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  Gap Assessment
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Identify control gaps against SOC 2 criteria
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <AssignmentIcon
                  sx={{
                    fontSize: 40,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  Evidence Collection
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Gather documentation to support control effectiveness
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <VerifiedIcon
                  sx={{
                    fontSize: 40,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  Remediation
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Implement controls to address identified gaps
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <SecurityIcon
                  sx={{
                    fontSize: 40,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  Audit Preparation
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Prepare for auditor review and testing
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<VerifiedIcon />}
          endIcon={<ArrowForwardIcon />}
          onClick={handleGoToAssessment}
        >
          Start SOC 2 Assessment
        </Button>
      </Box>
    </Box>
  );
};

export default SOC2ComplianceOverview;
