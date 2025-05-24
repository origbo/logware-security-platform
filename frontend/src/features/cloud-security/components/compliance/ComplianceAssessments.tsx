import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  CloudCircle as CloudCircleIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useGetComplianceAssessmentsQuery } from "../../services/complianceService";
import {
  ComplianceStatus,
  CloudProvider,
} from "../../types/cloudSecurityTypes";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

/**
 * Compliance Assessments Component
 * Displays a list of compliance assessments and their status
 */
const ComplianceAssessments: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch compliance assessments
  const {
    data: assessments,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetComplianceAssessmentsQuery({});

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Start a new assessment
  const handleNewAssessment = () => {
    navigate("/cloud-security/compliance/assessments/new");
  };

  // View assessment details
  const handleViewAssessment = (assessmentId: string) => {
    navigate(`/cloud-security/compliance/assessments/${assessmentId}`);
  };

  // Get status color based on compliance status
  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case ComplianceStatus.COMPLIANT:
        return theme.palette.success.main;
      case ComplianceStatus.NON_COMPLIANT:
        return theme.palette.error.main;
      case ComplianceStatus.NOT_APPLICABLE:
        return theme.palette.grey[500];
      case ComplianceStatus.INSUFFICIENT_DATA:
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get cloud provider icon
  const getProviderIcon = (provider: CloudProvider) => {
    switch (provider) {
      case CloudProvider.AWS:
        return "🔶"; // AWS icon
      case CloudProvider.AZURE:
        return "🔷"; // Azure icon
      case CloudProvider.GCP:
        return "🔴"; // GCP icon
      default:
        return "☁️"; // Generic cloud icon
    }
  };

  // Calculate the overall status percentage
  const getCompliancePercentage = (
    compliant: number,
    nonCompliant: number,
    notApplicable: number,
    insufficientData: number
  ) => {
    const total = compliant + nonCompliant + notApplicable + insufficientData;
    if (total === 0) return 0;
    if (total === notApplicable) return 100; // All N/A means we're compliant

    // Only count the applicable controls
    const applicableTotal = total - notApplicable;
    if (applicableTotal === 0) return 0;

    return Math.round((compliant / applicableTotal) * 100);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2">
          Compliance Assessments
        </Typography>
        <Box>
          <Tooltip title="Refresh assessments">
            <IconButton onClick={() => refetch()} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AssessmentIcon />}
            onClick={handleNewAssessment}
            sx={{ ml: 1 }}
          >
            New Assessment
          </Button>
        </Box>
      </Box>

      {/* Assessments Table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Alert severity="error">
            Error loading compliance assessments:{" "}
            {(error as any)?.data?.message || "Unknown error"}
          </Alert>
        ) : !assessments || assessments.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <AssessmentIcon
              sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              No Assessments Found
            </Typography>
            <Typography variant="body1" color="textSecondary" paragraph>
              Start by running a compliance assessment for one of your
              frameworks.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssessmentIcon />}
              onClick={handleNewAssessment}
            >
              Run New Assessment
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table aria-label="compliance assessments table">
                <TableHead>
                  <TableRow>
                    <TableCell>Framework</TableCell>
                    <TableCell>Account</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell align="center">Compliance</TableCell>
                    <TableCell align="center">Controls</TableCell>
                    <TableCell>Last Assessed</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assessments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((assessment) => {
                      const compliancePercentage = getCompliancePercentage(
                        assessment.compliantControls,
                        assessment.nonCompliantControls,
                        assessment.notApplicableControls,
                        assessment.insufficientDataControls
                      );

                      return (
                        <TableRow
                          hover
                          key={assessment.id}
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleViewAssessment(assessment.id)}
                        >
                          <TableCell>
                            <Typography variant="body2">
                              {assessment.frameworkName}
                            </Typography>
                          </TableCell>
                          <TableCell>{assessment.accountId}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography sx={{ mr: 1 }}>
                                {getProviderIcon(assessment.provider)}
                              </Typography>
                              <Typography variant="body2">
                                {assessment.provider.toUpperCase()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Chip
                                label={`${compliancePercentage}%`}
                                size="small"
                                sx={{
                                  bgcolor: alpha(
                                    getStatusColor(assessment.status),
                                    0.1
                                  ),
                                  color: getStatusColor(assessment.status),
                                  fontWeight: 500,
                                }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              <Typography variant="body2">
                                {assessment.compliantControls} /{" "}
                                {assessment.compliantControls +
                                  assessment.nonCompliantControls}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {assessment.notApplicableControls > 0 &&
                                  `${assessment.notApplicableControls} N/A`}
                                {assessment.insufficientDataControls > 0 &&
                                  assessment.notApplicableControls > 0 &&
                                  ", "}
                                {assessment.insufficientDataControls > 0 &&
                                  `${assessment.insufficientDataControls} Unknown`}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {assessment.lastAssessedAt
                              ? format(
                                  new Date(assessment.lastAssessedAt),
                                  "MMM d, yyyy HH:mm"
                                )
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View details">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewAssessment(assessment.id);
                                }}
                              >
                                <ArrowForwardIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download report">
                              <IconButton
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={assessments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ComplianceAssessments;
