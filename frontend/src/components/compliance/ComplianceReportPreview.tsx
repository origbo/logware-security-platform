import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import {
  Print as PrintIcon,
  Share as ShareIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import { ComplianceReportData } from "../../services/integrations/complianceReportingService";

interface ComplianceReportPreviewProps {
  reportData: ComplianceReportData;
  onClose: () => void;
  onSave: (reportData: ComplianceReportData, format: string) => Promise<void>;
  onShare: (reportData: ComplianceReportData) => Promise<void>;
}

const ComplianceReportPreview: React.FC<ComplianceReportPreviewProps> = ({
  reportData,
  onClose,
  onSave,
  onShare,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "compliant":
        return "#4caf50";
      case "non-compliant":
        return "#f44336";
      case "partially-compliant":
        return "#ff9800";
      case "not-applicable":
        return "#9e9e9e";
      default:
        return "#2196f3";
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#4caf50";
    if (score >= 60) return "#ff9800";
    return "#f44336";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSave = async (format: string) => {
    setLoading(true);
    setError(null);
    try {
      await onSave(reportData, format);
    } catch (err) {
      setError("Failed to save report. Please try again.");
      console.error("Error saving report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setLoading(true);
    setError(null);
    try {
      await onShare(reportData);
    } catch (err) {
      setError("Failed to share report. Please try again.");
      console.error("Error sharing report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!reportData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error">No report data available</Alert>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={onClose}>
          Close
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        maxWidth: "100%",
        overflowX: "auto",
        "@media print": {
          p: 0,
        },
      }}
    >
      {loading && <LinearProgress />}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          "@media print": {
            display: "none",
          },
        }}
      >
        <Typography variant="h5">Report Preview</Typography>
        <Box>
          <Tooltip title="Print Report">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download as PDF">
            <IconButton onClick={() => handleSave("pdf")}>
              <PdfIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download as Excel">
            <IconButton onClick={() => handleSave("excel")}>
              <ExcelIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Report">
            <IconButton onClick={handleShare}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" onClick={onClose} sx={{ ml: 1 }}>
            Close
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          "@media print": {
            boxShadow: "none",
          },
        }}
        className="report-container"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h4" gutterBottom>
            {reportData.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {reportData.subtitle}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Generated on: {formatDate(reportData.generatedOn)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Executive Summary */}
        <Typography variant="h5" gutterBottom>
          Executive Summary
        </Typography>
        <Typography variant="body1" paragraph>
          {reportData.executiveSummary}
        </Typography>

        {/* Overall Compliance Score */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            my: 4,
          }}
        >
          <Card sx={{ minWidth: 200, textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall Compliance Score
              </Typography>
              <Box sx={{ position: "relative", display: "inline-flex" }}>
                <CircularProgress
                  variant="determinate"
                  value={reportData.overallScore}
                  size={100}
                  thickness={5}
                  sx={{
                    color: getScoreColor(reportData.overallScore),
                    circle: {
                      strokeLinecap: "round",
                    },
                  }}
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
                  <Typography variant="h5">
                    {Math.round(reportData.overallScore)}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Framework Scores */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Framework Compliance
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {reportData.frameworkScores.map((framework) => (
            <Grid item xs={12} md={6} lg={4} key={framework.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {framework.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    display="block"
                  >
                    Version: {framework.version}
                  </Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={framework.score}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getScoreColor(framework.score),
                          borderRadius: 5,
                        },
                      }}
                    />
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Score: {framework.score}%
                    </Typography>
                    <Chip
                      size="small"
                      label={framework.status}
                      sx={{
                        backgroundColor: getStatusColor(framework.status),
                        color: "white",
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Control Status Summary */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Control Status Summary
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Framework</TableCell>
                <TableCell align="center">Compliant</TableCell>
                <TableCell align="center">Non-Compliant</TableCell>
                <TableCell align="center">Partially Compliant</TableCell>
                <TableCell align="center">Not Applicable</TableCell>
                <TableCell align="center">Total Controls</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.frameworkScores.map((framework) => (
                <TableRow key={framework.id}>
                  <TableCell component="th" scope="row">
                    {framework.name}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={framework.controlCounts.compliant}
                      sx={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={framework.controlCounts.nonCompliant}
                      sx={{ backgroundColor: "#ffebee", color: "#c62828" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={framework.controlCounts.partiallyCompliant}
                      sx={{ backgroundColor: "#fff3e0", color: "#e65100" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={framework.controlCounts.notApplicable}
                      sx={{ backgroundColor: "#f5f5f5", color: "#616161" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={framework.controlCounts.total}
                      sx={{ backgroundColor: "#e3f2fd", color: "#0d47a1" }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Critical Non-Compliant Controls */}
        {reportData.criticalIssues && reportData.criticalIssues.length > 0 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Critical Non-Compliant Controls
            </Typography>

            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Control ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Framework</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Due Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.criticalIssues.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell component="th" scope="row">
                        {control.controlId}
                      </TableCell>
                      <TableCell>{control.title}</TableCell>
                      <TableCell>{control.frameworkName}</TableCell>
                      <TableCell>{control.category}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={control.priority}
                          color="error"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={control.status}
                          sx={{
                            backgroundColor: getStatusColor(control.status),
                            color: "white",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {control.dueDate ? formatDate(control.dueDate) : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Recommendations */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Recommendations
        </Typography>

        <Box sx={{ mb: 4 }}>
          {reportData.recommendations.map((recommendation, index) => (
            <Alert
              key={index}
              severity={
                recommendation.priority === "high"
                  ? "error"
                  : recommendation.priority === "medium"
                  ? "warning"
                  : "info"
              }
              sx={{ mb: 2 }}
            >
              <Typography variant="subtitle1">
                {recommendation.title}
              </Typography>
              <Typography variant="body2">
                {recommendation.description}
              </Typography>
            </Alert>
          ))}
        </Box>

        {/* Report Metadata */}
        <Box sx={{ mt: 6 }}>
          <Divider />
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 2, display: "block" }}
          >
            Report ID: {reportData.id} • Created by: {reportData.author} •
            Logware Security Platform
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ComplianceReportPreview;
