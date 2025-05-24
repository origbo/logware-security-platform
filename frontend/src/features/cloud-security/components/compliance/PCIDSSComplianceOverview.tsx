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
  CreditCard as CreditCardIcon,
  Lock as LockIcon,
  ShieldOutlined as ShieldIcon,
  Storage as StorageIcon,
  FindInPage as FindIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  MonetizationOn as MonetizationOnIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const PCIDSSComplianceOverview: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Mock data - replace with actual API data in production
  const overviewData = {
    complianceScore: 79,
    lastAssessment: "2023-07-22T11:15:00Z",
    nonCompliantItems: 25,
    totalItems: 119,
    status: "In Progress",
    merchantLevel: "Level 2",
    assessmentType: "Self-Assessment Questionnaire D",
    keyFindings: [
      {
        id: 1,
        title: "Weak encryption for stored cardholder data",
        severity: "High",
        requirement: "3.4",
      },
      {
        id: 2,
        title: "Incomplete network segmentation",
        severity: "High",
        requirement: "1.3",
      },
      {
        id: 3,
        title: "Vulnerabilities found in quarterly scan",
        severity: "Medium",
        requirement: "11.2",
      },
      {
        id: 4,
        title: "Documentation of security processes needs updating",
        severity: "Low",
        requirement: "12.1",
      },
    ],
    requirementCategories: [
      {
        name: "Build and Maintain a Secure Network",
        compliant: 18,
        total: 24,
        score: 75,
      },
      { name: "Protect Cardholder Data", compliant: 16, total: 20, score: 80 },
      {
        name: "Maintain Vulnerability Management Program",
        compliant: 14,
        total: 18,
        score: 78,
      },
      {
        name: "Implement Strong Access Control Measures",
        compliant: 22,
        total: 27,
        score: 81,
      },
      {
        name: "Regularly Monitor and Test Networks",
        compliant: 19,
        total: 25,
        score: 76,
      },
      {
        name: "Maintain Information Security Policy",
        compliant: 5,
        total: 5,
        score: 100,
      },
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
    navigate("/cloud-security/compliance/pcidss/assessment");
  };

  return (
    <Box>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          backgroundImage: "linear-gradient(to right, #d32f2f, #f44336)",
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <CreditCardIcon sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h4">PCI DSS Compliance</Typography>
        </Box>
        <Typography variant="subtitle1">
          Payment Card Industry Data Security Standard
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          Monitor your organization's compliance with PCI DSS requirements to
          secure payment card data and maintain a secure environment.
        </Typography>
      </Paper>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall PCI DSS Compliance
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: "block" }}
                  >
                    Merchant Level: {overviewData.merchantLevel}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: "block" }}
                  >
                    Last Assessment:{" "}
                    {new Date(overviewData.lastAssessment).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                PCI DSS Requirements
              </Typography>
              {overviewData.requirementCategories.map((category) => (
                <Box key={category.name} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ maxWidth: "70%" }}
                      title={category.name}
                    >
                      {category.name}
                    </Typography>
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
                Key PCI DSS Requirements
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <ShieldIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Install and maintain a firewall"
                    secondary="Protect cardholder data in your network"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Protect stored cardholder data"
                    secondary="Use encryption, tokenization, or masking"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Vulnerability management"
                    secondary="Regular updates and security patches"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <LockIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Strong access control"
                    secondary="Restrict access to cardholder data"
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <FindIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Network monitoring and testing"
                    secondary="Regular security system testing"
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
            <Typography variant="h6">Key Non-Compliance Findings</Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Finding</TableCell>
                <TableCell>Requirement</TableCell>
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
                        label={`Req ${finding.requirement}`}
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

      {/* Compliance Steps */}
      <Typography variant="h6" gutterBottom>
        PCI DSS Compliance Roadmap
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
                  Assessment
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Identify cardholder data and assess systems
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
                  Remediation
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Fix vulnerabilities and implement controls
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
                  Reporting
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Submit compliance documentation
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
                <MonetizationOnIcon
                  sx={{
                    fontSize: 40,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  Maintenance
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Maintain compliance processes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current Assessment Info */}
      <Paper
        sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <InfoIcon sx={{ color: theme.palette.info.main, mr: 2, mt: 0.5 }} />
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Assessment Information
            </Typography>
            <Typography variant="body2" paragraph>
              Your organization is classified as {overviewData.merchantLevel}{" "}
              and required to complete the {overviewData.assessmentType}. This
              assessment must be completed annually and quarterly network scans
              are required.
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AssignmentIcon />}
              size="small"
            >
              View Assessment Requirements
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CreditCardIcon />}
          onClick={handleGoToAssessment}
        >
          Start PCI DSS Assessment
        </Button>
      </Box>
    </Box>
  );
};

export default PCIDSSComplianceOverview;
