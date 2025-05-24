import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import {
  ComplianceFramework,
  ComplianceAudit,
  ComplianceControl,
} from "../../pages/compliance/CompliancePage";

interface ComplianceDashboardProps {
  frameworks: ComplianceFramework[];
  audits: ComplianceAudit[];
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  frameworks,
  audits,
}) => {
  const theme = useTheme();

  // Calculate overall compliance score
  const overallScore =
    frameworks.length > 0
      ? Math.round(
          frameworks.reduce((sum, fw) => sum + fw.overallScore, 0) /
            frameworks.length
        )
      : 0;

  // Prepare data for pie chart (compliance status distribution)
  const statusCounts = {
    compliant: 0,
    "partially-compliant": 0,
    "non-compliant": 0,
    pending: 0,
  };

  frameworks.forEach((fw) => {
    statusCounts[fw.status]++;
  });

  const pieChartData = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.replace("-", " "),
    value,
  }));

  // Prepare data for bar chart (framework scores)
  const barChartData = frameworks.map((fw) => ({
    name: fw.name,
    score: fw.overallScore,
  }));

  // Collect all controls from all frameworks
  const allControls = frameworks.flatMap((fw) => fw.controls);

  // Calculate compliance by priority
  const priorityCompliance = {
    critical: { total: 0, compliant: 0 },
    high: { total: 0, compliant: 0 },
    medium: { total: 0, compliant: 0 },
    low: { total: 0, compliant: 0 },
  };

  allControls.forEach((control) => {
    priorityCompliance[control.priority].total++;
    if (control.status === "compliant") {
      priorityCompliance[control.priority].compliant++;
    }
  });

  // Recent audits (last 3)
  const recentAudits = [...audits]
    .sort(
      (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    )
    .slice(0, 3);

  // Non-compliant controls (by priority)
  const nonCompliantControls = allControls
    .filter((control) => control.status !== "compliant")
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 5);

  // Color map for status
  const statusColors = {
    compliant: theme.palette.success.main,
    "partially-compliant": theme.palette.warning.main,
    "non-compliant": theme.palette.error.main,
    pending: theme.palette.grey[500],
  };

  // Color map for priorities
  const priorityColors = {
    critical: theme.palette.error.main,
    high: theme.palette.error.light,
    medium: theme.palette.warning.main,
    low: theme.palette.success.light,
  };

  // Color map for audit status
  const auditStatusColors = {
    scheduled: theme.palette.info.main,
    "in-progress": theme.palette.warning.main,
    completed: theme.palette.success.main,
    archived: theme.palette.grey[500],
  };

  // Helper function to determine score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.success.light;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box>
      {/* Top Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: "100%", textAlign: "center" }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Overall Compliance
            </Typography>
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h3"
                component="div"
                sx={{
                  color: getScoreColor(overallScore),
                }}
              >
                {overallScore}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={overallScore}
                sx={{
                  width: "100%",
                  height: 8,
                  borderRadius: 5,
                  mt: 1,
                  mb: 1,
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: getScoreColor(overallScore),
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Frameworks
            </Typography>
            <Typography variant="h3" component="div">
              {frameworks.length}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {Object.entries(statusCounts).map(
                ([status, count]) =>
                  count > 0 && (
                    <Chip
                      key={status}
                      label={`${count} ${status.replace("-", " ")}`}
                      size="small"
                      sx={{
                        mr: 0.5,
                        mb: 0.5,
                        backgroundColor:
                          statusColors[status as keyof typeof statusCounts],
                      }}
                    />
                  )
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Controls
            </Typography>
            <Typography variant="h3" component="div">
              {allControls.length}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                By Status:
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
              >
                <Chip
                  label={`${
                    allControls.filter((c) => c.status === "compliant").length
                  } compliant`}
                  size="small"
                  sx={{
                    backgroundColor: statusColors.compliant,
                    color: "#fff",
                  }}
                />
                <Chip
                  label={`${
                    allControls.filter((c) => c.status !== "compliant").length
                  } non-compliant`}
                  size="small"
                  sx={{
                    backgroundColor: statusColors["non-compliant"],
                    color: "#fff",
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Recent Audits
            </Typography>
            <Typography variant="h3" component="div">
              {audits.length}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Status:
              </Typography>
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}
              >
                {(
                  ["scheduled", "in-progress", "completed", "archived"] as const
                ).map((status) => {
                  const count = audits.filter(
                    (a) => a.status === status
                  ).length;
                  return count > 0 ? (
                    <Chip
                      key={status}
                      label={`${count} ${status}`}
                      size="small"
                      sx={{
                        backgroundColor: auditStatusColors[status],
                        color: "#fff",
                      }}
                    />
                  ) : null;
                })}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Compliance Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          statusColors[
                            entry.name.replace(
                              " ",
                              "-"
                            ) as keyof typeof statusColors
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Framework Scores
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="score"
                    name="Compliance Score"
                    fill={theme.palette.primary.main}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Audits
              </Typography>
              <List>
                {recentAudits.map((audit) => (
                  <React.Fragment key={audit.id}>
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Chip
                          label={audit.status}
                          size="small"
                          sx={{
                            backgroundColor: auditStatusColors[audit.status],
                            color: "#fff",
                          }}
                        />
                      }
                    >
                      <ListItemText
                        primary={audit.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              {audit.auditor}
                            </Typography>
                            {` — ${format(
                              new Date(audit.startDate),
                              "MMM d, yyyy"
                            )} to ${format(
                              new Date(audit.endDate),
                              "MMM d, yyyy"
                            )}`}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Critical Non-Compliance
              </Typography>
              <List>
                {nonCompliantControls.map((control) => (
                  <React.Fragment key={control.id}>
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Chip
                          label={control.priority}
                          size="small"
                          sx={{
                            backgroundColor: priorityColors[control.priority],
                            color: "#fff",
                          }}
                        />
                      }
                    >
                      <ListItemText
                        primary={control.title}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              {control.controlId}
                            </Typography>
                            {` — ${control.category}`}
                            {control.dueDate && (
                              <Typography variant="body2" color="error">
                                Due:{" "}
                                {format(
                                  new Date(control.dueDate),
                                  "MMM d, yyyy"
                                )}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceDashboard;
