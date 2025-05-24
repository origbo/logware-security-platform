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
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  HealthAndSafety as HealthIcon,
  Lock as LockIcon,
  FindInPage as FindIcon,
  DataSaverOn as DataIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const HIPAAComplianceOverview: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock data - replace with actual API data in production
  const overviewData = {
    complianceScore: 76,
    lastAssessment: "2023-05-15T14:30:00Z",
    nonCompliantItems: 8,
    totalItems: 33,
    status: "In Progress",
    keyFindings: [
      {
        id: 1,
        title: "Encryption at rest not enabled for some databases",
        severity: "High",
        rule: "164.312(a)(2)(iv)",
      },
      {
        id: 2,
        title: "Missing contingency plans for some systems",
        severity: "Medium",
        rule: "164.308(a)(7)",
      },
      {
        id: 3,
        title: "Incomplete audit logging for user activities",
        severity: "Medium",
        rule: "164.312(b)",
      },
      {
        id: 4,
        title: "Access review process needs improvement",
        severity: "Low",
        rule: "164.308(a)(3)(ii)(B)",
      },
    ],
    categories: [
      {
        name: "Administrative Safeguards",
        compliant: 12,
        total: 15,
        score: 80,
      },
      { name: "Physical Safeguards", compliant: 5, total: 6, score: 83 },
      { name: "Technical Safeguards", compliant: 8, total: 12, score: 67 },
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

  // Navigate to the detailed assessment page
  const handleGoToAssessment = () => {
    navigate("/cloud-security/compliance/hipaa/assessment");
  };

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundImage: "linear-gradient(to right, #2a5298, #1976d2)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <HealthIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h4">HIPAA Compliance</Typography>
        </Box>
        <Typography variant="subtitle1">
          Health Insurance Portability and Accountability Act
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          Monitor your organization's compliance with HIPAA regulations to
          secure protected health information (PHI).
        </Typography>
      </Paper>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Compliance Status
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
                  {overviewData.totalItems} requirements met
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
              <Typography variant="caption" color="textSecondary">
                Last assessed:{" "}
                {new Date(overviewData.lastAssessment).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                HIPAA Categories
              </Typography>
              {overviewData.categories.map((category) => (
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
            <CardContent sx={{ height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Key Requirements
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LockIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Access Controls"
                    secondary="Implement technical policies for accessing PHI"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <VerifiedIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Audit Controls"
                    secondary="Record and examine system activity"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DataIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Data Integrity"
                    secondary="Ensure PHI is not improperly altered or destroyed"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <FindIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Authentication"
                    secondary="Verify identity of persons seeking PHI access"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Transmission Security"
                    secondary="Guard against unauthorized access during transit"
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
            <Typography variant="h6">Key Compliance Findings</Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Finding</TableCell>
                <TableCell>HIPAA Rule</TableCell>
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
                        label={finding.rule}
                        size="small"
                        sx={{ fontFamily: "monospace", fontWeight: "medium" }}
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

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<HealthIcon />}
          onClick={handleGoToAssessment}
        >
          Start HIPAA Assessment
        </Button>
      </Box>
    </Box>
  );
};

export default HIPAAComplianceOverview;
