import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Button,
  LinearProgress,
  Divider,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { format } from "date-fns";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EditIcon from "@mui/icons-material/Edit";
import {
  ComplianceFramework,
  ComplianceControl,
} from "../../pages/compliance/CompliancePage";

// Styled components
const FrameworkCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-4px)",
  },
}));

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'status',
})(({ theme, status, ...props }: { theme: any; status: string }) => ({
  position: "absolute",
  top: 16,
  right: 16,
  ...(status === "compliant" && {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  }),
  ...(status === "partially-compliant" && {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  }),
  ...(status === "non-compliant" && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  }),
  ...(status === "pending" && {
    backgroundColor: theme.palette.grey[500],
    color: theme.palette.getContrastText(theme.palette.grey[500]),
  }),
}));

// Interface for component props
interface ComplianceFrameworksProps {
  frameworks: ComplianceFramework[];
}

const ComplianceFrameworks: React.FC<ComplianceFrameworksProps> = ({
  frameworks,
}) => {
  const theme = useTheme();
  const [expandedFramework, setExpandedFramework] = useState<string | null>(
    null
  );

  // Toggle expanded framework
  const handleToggleFramework = (frameworkId: string) => {
    setExpandedFramework(
      expandedFramework === frameworkId ? null : frameworkId
    );
  };

  // Function to get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return theme.palette.success.main;
      case "partially-compliant":
        return theme.palette.warning.main;
      case "non-compliant":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Function to get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.success.light;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Function to get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return theme.palette.error.main;
      case "high":
        return theme.palette.error.light;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.success.light;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {frameworks.map((framework) => (
          <Grid item xs={12} key={framework.id}>
            <FrameworkCard>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {framework.name}
                      </Typography>
                      <Typography variant="subtitle1" color="textSecondary">
                        Version {framework.version}
                      </Typography>
                    </Box>

                    <Typography variant="body2" paragraph>
                      {framework.description}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ mr: 1 }}
                      >
                        Compliance Score:
                      </Typography>
                      <Box sx={{ flexGrow: 1, mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={framework.overallScore}
                          sx={{
                            height: 8,
                            borderRadius: 5,
                            backgroundColor: theme.palette.grey[200],
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: getScoreColor(
                                framework.overallScore
                              ),
                            },
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{
                          fontWeight: "bold",
                          color: getScoreColor(framework.overallScore),
                        }}
                      >
                        {framework.overallScore}%
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      <Chip
                        size="small"
                        label={`${framework.controls.length} Controls`}
                        color="primary"
                      />
                      <Chip
                        size="small"
                        label={`Last Updated: ${format(
                          new Date(framework.lastUpdated),
                          "MMM d, yyyy"
                        )}`}
                        variant="outlined"
                      />
                      {framework.nextAuditDate && (
                        <Chip
                          size="small"
                          label={`Next Audit: ${format(
                            new Date(framework.nextAuditDate),
                            "MMM d, yyyy"
                          )}`}
                          variant="outlined"
                          color="secondary"
                        />
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <StatusChip
                        label={framework.status.replace("-", " ")}
                        status={framework.status}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 2,
                        }}
                      >
                        <Tooltip title="Generate Report">
                          <IconButton color="primary" sx={{ mr: 1 }}>
                            <AssessmentIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Export Framework">
                          <IconButton color="primary" sx={{ mr: 1 }}>
                            <CloudDownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Framework">
                          <IconButton color="primary" sx={{ mr: 1 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            expandedFramework === framework.id
                              ? "Hide Controls"
                              : "Show Controls"
                          }
                        >
                          <IconButton
                            onClick={() => handleToggleFramework(framework.id)}
                            color="primary"
                          >
                            {expandedFramework === framework.id ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>

              <Collapse
                in={expandedFramework === framework.id}
                timeout="auto"
                unmountOnExit
              >
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Controls
                  </Typography>

                  <TableContainer
                    component={Paper}
                    elevation={0}
                    variant="outlined"
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Last Assessed</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {framework.controls.map((control) => (
                          <TableRow key={control.id}>
                            <TableCell>{control.controlId}</TableCell>
                            <TableCell>
                              <Tooltip title={control.description}>
                                <span>{control.title}</span>
                              </Tooltip>
                            </TableCell>
                            <TableCell>{control.category}</TableCell>
                            <TableCell>
                              <Chip
                                label={control.status.replace("-", " ")}
                                size="small"
                                sx={{
                                  backgroundColor: getStatusColor(
                                    control.status
                                  ),
                                  color: "#fff",
                                  fontWeight: "bold",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: getScoreColor(control.score),
                                  fontWeight: "bold",
                                }}
                              >
                                {control.score}%
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={control.priority}
                                size="small"
                                sx={{
                                  backgroundColor: getPriorityColor(
                                    control.priority
                                  ),
                                  color: "#fff",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(control.lastAssessed),
                                "MMM d, yyyy"
                              )}
                            </TableCell>
                            <TableCell>
                              <Tooltip title="View Details">
                                <IconButton size="small">
                                  <KeyboardArrowDownIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Collapse>
            </FrameworkCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ComplianceFrameworks;
