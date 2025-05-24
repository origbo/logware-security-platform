import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CloudCircle as CloudCircleIcon,
} from "@mui/icons-material";
import {
  CloudProvider,
  ComplianceStatus,
} from "../../types/cloudSecurityTypes";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface OverviewTabProps {
  overviewData: any; // In a real application, we would define a proper type
}

/**
 * Overview Tab Component
 * Displays a comprehensive overview of multi-cloud compliance status
 */
const OverviewTab: React.FC<OverviewTabProps> = ({ overviewData }) => {
  const theme = useTheme();

  if (!overviewData) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <Typography variant="body1">No compliance data available.</Typography>
      </Box>
    );
  }

  // Prepare chart data for resource compliance
  const resourceComplianceData = [
    {
      name: "Compliant",
      value: overviewData.resources.compliant,
      color: theme.palette.success.main,
    },
    {
      name: "Non-Compliant",
      value: overviewData.resources.nonCompliant,
      color: theme.palette.error.main,
    },
    {
      name: "Not Applicable",
      value: overviewData.resources.notApplicable,
      color: theme.palette.grey[500],
    },
  ];

  // Prepare chart data for provider compliance
  const providerComplianceData = overviewData.providers.map(
    (provider: any) => ({
      name: provider.provider.toUpperCase(),
      value: provider.resourceCount,
      color:
        provider.provider === CloudProvider.AWS
          ? "#FF9900" // AWS color
          : provider.provider === CloudProvider.AZURE
          ? "#0089D6" // Azure color
          : "#4285F4", // GCP color
    })
  );

  // Calculate provider compliance percentages
  const getProviderCompliancePercentage = (provider: string) => {
    const providerData = overviewData.providers.find(
      (p: any) => p.provider === provider
    );

    if (providerData) {
      const total = providerData.compliant + providerData.nonCompliant;
      return total > 0 ? Math.round((providerData.compliant / total) * 100) : 0;
    }

    return 0;
  };

  // Get color based on compliance percentage
  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return theme.palette.success.main;
    if (percentage >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Format recent findings list
  const formatFindings = (findings: any[]) => {
    return findings.map((finding) => ({
      ...finding,
      severity: finding.severity || "info",
      timestamp: new Date(finding.timestamp).toLocaleString(),
    }));
  };

  const recentFindings = formatFindings(overviewData.recentFindings || []);

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Resource Compliance Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Resource Compliance Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceComplianceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {resourceComplianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} resources`, "Count"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Cloud Provider Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Cloud Provider Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerComplianceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {providerComplianceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} resources`, "Count"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Provider Compliance Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Provider Compliance Status
            </Typography>
            <Grid container spacing={3}>
              {/* AWS Compliance */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CloudCircleIcon sx={{ mr: 1, color: "#FF9900" }} />
                      <Typography variant="h6">AWS</Typography>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2">
                          Compliance Score
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={getComplianceColor(
                            getProviderCompliancePercentage(CloudProvider.AWS)
                          )}
                        >
                          {getProviderCompliancePercentage(CloudProvider.AWS)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getProviderCompliancePercentage(
                          CloudProvider.AWS
                        )}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(
                            getComplianceColor(
                              getProviderCompliancePercentage(CloudProvider.AWS)
                            ),
                            0.2
                          ),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            backgroundColor: getComplianceColor(
                              getProviderCompliancePercentage(CloudProvider.AWS)
                            ),
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Resources
                        </Typography>
                        <Typography variant="body2">
                          {overviewData.providers.find(
                            (p: any) => p.provider === CloudProvider.AWS
                          )?.resourceCount || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Compliant
                        </Typography>
                        <Typography variant="body2">
                          {overviewData.providers.find(
                            (p: any) => p.provider === CloudProvider.AWS
                          )?.compliant || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Non-Compliant
                        </Typography>
                        <Typography variant="body2">
                          {overviewData.providers.find(
                            (p: any) => p.provider === CloudProvider.AWS
                          )?.nonCompliant || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Azure Compliance */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CloudCircleIcon sx={{ mr: 1, color: "#0089D6" }} />
                      <Typography variant="h6">Azure</Typography>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2">
                          Compliance Score
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={getComplianceColor(
                            getProviderCompliancePercentage(CloudProvider.AZURE)
                          )}
                        >
                          {getProviderCompliancePercentage(CloudProvider.AZURE)}
                          %
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getProviderCompliancePercentage(
                          CloudProvider.AZURE
                        )}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(
                            getComplianceColor(
                              getProviderCompliancePercentage(
                                CloudProvider.AZURE
                              )
                            ),
                            0.2
                          ),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            backgroundColor: getComplianceColor(
                              getProviderCompliancePercentage(
                                CloudProvider.AZURE
                              )
                            ),
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Resources
                        </Typography>
                        <Typography variant="body2">
                          {overviewData.providers.find(
                            (p: any) => p.provider === CloudProvider.AZURE
                          )?.resourceCount || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Compliant
                        </Typography>
                        <Typography variant="body2">
                          {overviewData.providers.find(
                            (p: any) => p.provider === CloudProvider.AZURE
                          )?.compliant || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Non-Compliant
                        </Typography>
                        <Typography variant="body2">
                          {overviewData.providers.find(
                            (p: any) => p.provider === CloudProvider.AZURE
                          )?.nonCompliant || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* GCP Compliance */}
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <CloudCircleIcon sx={{ mr: 1, color: "#4285F4" }} />
                      <Typography variant="h6">Google Cloud</Typography>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="body2">
                          Compliance Score
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={getComplianceColor(
                            getProviderCompliancePercentage(CloudProvider.GCP)
                          )}
                        >
                          {getProviderCompliancePercentage(CloudProvider.GCP)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getProviderCompliancePercentage(
                          CloudProvider.GCP
                        )}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(
                            getComplianceColor(
                              getProviderCompliancePercentage(CloudProvider.GCP)
                            ),
                            0.2
                          ),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            backgroundColor: getComplianceColor(
                              getProviderCompliancePercentage(CloudProvider.GCP)
                            ),
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Resources
                        </Typography>
                        <Typography variant="body2">
                          {overviewData.providers.find(
                            (p: any) => p.provider === CloudProvider.GCP
                          )?.resourceCount || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Compliant
                        </Typography>
                        <Typography variant="body2">
                          {overviewData.providers.find(
                            (p: any) => p.provider === CloudProvider.GCP
                          )?.compliant || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Non-Compliant
                        </Typography>
                        <Typography variant="body2">
                          {overviewData.providers.find(
                            (p: any) => p.provider === CloudProvider.GCP
                          )?.nonCompliant || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Compliance Findings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Compliance Findings
            </Typography>

            {recentFindings.length > 0 ? (
              <List>
                {recentFindings.map((finding: any, index: number) => {
                  // Get icon based on severity
                  const getSeverityIcon = (severity: string) => {
                    switch (severity.toLowerCase()) {
                      case "critical":
                      case "high":
                        return <ErrorIcon color="error" />;
                      case "medium":
                        return <WarningIcon color="warning" />;
                      case "low":
                        return <InfoIcon color="info" />;
                      default:
                        return <CheckIcon color="success" />;
                    }
                  };

                  // Get color based on severity
                  const getSeverityColor = (severity: string) => {
                    switch (severity.toLowerCase()) {
                      case "critical":
                      case "high":
                        return theme.palette.error.main;
                      case "medium":
                        return theme.palette.warning.main;
                      case "low":
                        return theme.palette.info.main;
                      default:
                        return theme.palette.success.main;
                    }
                  };

                  return (
                    <React.Fragment key={finding.id || index}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          {getSeverityIcon(finding.severity)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="subtitle1">
                                {finding.title}
                              </Typography>
                              <Chip
                                label={finding.severity.toUpperCase()}
                                size="small"
                                sx={{
                                  ml: 1,
                                  bgcolor: alpha(
                                    getSeverityColor(finding.severity),
                                    0.1
                                  ),
                                  color: getSeverityColor(finding.severity),
                                  fontWeight: 500,
                                }}
                              />
                              <Chip
                                label={finding.provider.toUpperCase()}
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {finding.description}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{ mt: 0.5 }}
                              >
                                {finding.timestamp} • Resource:{" "}
                                {finding.resourceId}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < recentFindings.length - 1 && (
                        <Divider component="li" />
                      )}
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ textAlign: "center", p: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  No recent findings to display.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewTab;
