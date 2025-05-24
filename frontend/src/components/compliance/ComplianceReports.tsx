import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider, AdapterDateFns } from "@mui/x-date-pickers";
import { format } from "date-fns";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import ReportIcon from "@mui/icons-material/Description";
import ArticleIcon from "@mui/icons-material/Article";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileExcelIcon from "@mui/icons-material/InsertChart";
import {
  ComplianceFramework,
  ComplianceAudit,
  AssessmentResult,
} from "../../pages/compliance/CompliancePage";
import {
  generateComplianceReportData,
  generateExecutiveSummaryReport,
  sendToReportingEngine,
  ComplianceReportData,
  ComplianceReportSection,
} from "../../services/integrations/complianceReportingService";
import ComplianceReportPreview from "./ComplianceReportPreview";

// Interface for component props
interface ComplianceReportsProps {
  frameworks: ComplianceFramework[];
  audits: ComplianceAudit[];
  assessmentHistory?: AssessmentResult[];
}

// Report generation interface
interface ReportConfig {
  name: string;
  type: "framework" | "custom";
  frameworkId: string;
  format: "pdf" | "excel" | "csv";
  startDate: Date | null;
  endDate: Date | null;
  includeCharts: boolean;
  includeEvidence: boolean;
  includeRecommendations: boolean;
}

// Mock report interface
interface Report {
  id: string;
  name: string;
  created: Date;
  type: string;
  format: string;
  size: string;
  downloadUrl: string;
}

const ComplianceReports: React.FC<ComplianceReportsProps> = ({
  frameworks,
  audits,
  assessmentHistory = [],
}) => {
  const theme = useTheme();

  // Additional state for enhanced reporting
  const [loading, setLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [previewReport, setPreviewReport] =
    useState<ComplianceReportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedReportSection, setSelectedReportSection] = useState<number>(0);

  // Reports generation form state
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: "",
    type: "framework",
    frameworkId: "",
    format: "pdf",
    startDate: null,
    endDate: null,
    includeCharts: true,
    includeEvidence: true,
    includeRecommendations: true,
  });

  // Reports state
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      name: "PCI DSS Quarterly Report",
      created: new Date(2025, 2, 15),
      type: "PCI DSS",
      format: "pdf",
      size: "2.3 MB",
      downloadUrl: "#",
    },
    {
      id: "2",
      name: "ISO 27001 Annual Assessment",
      created: new Date(2025, 0, 10),
      type: "ISO 27001",
      format: "excel",
      size: "4.7 MB",
      downloadUrl: "#",
    },
    {
      id: "3",
      name: "GDPR Compliance Status",
      created: new Date(2025, 3, 5),
      type: "GDPR",
      format: "pdf",
      size: "3.1 MB",
      downloadUrl: "#",
    },
    {
      id: "4",
      name: "HIPAA Security Audit Report",
      created: new Date(2025, 1, 28),
      type: "HIPAA",
      format: "pdf",
      size: "2.8 MB",
      downloadUrl: "#",
    },
  ]);

  // Handle form changes
  const handleConfigChange = (
    event: React.ChangeEvent<
      HTMLInputElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = event.target;
    setReportConfig((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleFormatChange = (event: SelectChangeEvent) => {
    setReportConfig((prev) => ({
      ...prev,
      format: event.target.value as "pdf" | "excel" | "csv",
    }));
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setReportConfig((prev) => ({
      ...prev,
      type: event.target.value as "framework" | "custom",
    }));
  };

  const handleFrameworkChange = (event: SelectChangeEvent) => {
    setReportConfig((prev) => ({
      ...prev,
      frameworkId: event.target.value as string,
    }));
  };

  const handleDateChange =
    (field: "startDate" | "endDate") => (date: Date | null) => {
      setReportConfig((prev) => ({
        ...prev,
        [field]: date,
      }));
    };

  const handleToggleOption = (
    field: "includeCharts" | "includeEvidence" | "includeRecommendations"
  ) => {
    setReportConfig((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Handle closing alerts
  const handleCloseAlert = () => {
    setReportSuccess(null);
    setReportError(null);
  };

  // Generate a report preview
  const handlePreviewReport = async () => {
    try {
      setLoading(true);
      let reportData: ComplianceReportData | null = null;

      if (reportConfig.type === "framework") {
        const framework = frameworks.find(
          (f) => f.id === reportConfig.frameworkId
        );
        if (!framework) {
          throw new Error("Selected framework not found");
        }

        // Get assessment results for this framework if available
        const frameworkAssessments = assessmentHistory.filter(
          (a) => a.frameworkId === reportConfig.frameworkId
        );

        const reportDataArray = generateComplianceReportData(
          [framework],
          audits.filter((a) => a.frameworkIds.includes(framework.id)),
          frameworkAssessments.length > 0 ? frameworkAssessments : undefined
        );

        if (reportDataArray.length > 0) {
          reportData = reportDataArray[0];
        }
      } else {
        // Executive summary report across all frameworks
        reportData = generateExecutiveSummaryReport(frameworks, audits);
      }

      if (reportData) {
        // Update report properties based on user input
        reportData.title =
          reportConfig.name ||
          (reportConfig.type === "framework"
            ? frameworks.find((f) => f.id === reportConfig.frameworkId)?.name +
              " Report"
            : "Executive Summary Report");
        reportData.format = reportConfig.format;
        reportData.includeCharts = reportConfig.includeCharts;
        reportData.includeEvidence = reportConfig.includeEvidence;
        reportData.includeRecommendations = reportConfig.includeRecommendations;

        // Add date range to subtitle if specified
        if (reportConfig.startDate && reportConfig.endDate) {
          const formattedStartDate = format(
            reportConfig.startDate,
            "MMM d, yyyy"
          );
          const formattedEndDate = format(reportConfig.endDate, "MMM d, yyyy");
          reportData.description = `Report Period: ${formattedStartDate} to ${formattedEndDate}`;
        }

        // Add information about source to description
        reportData.description = 
          (reportData.description || "") + 
          "\nGenerated by Logware Security Platform";
        reportData.id = `report-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        reportData.timestamp = new Date();

        setPreviewReport(reportData);
        setShowPreview(true);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error generating report preview:", error);
      setReportError("Failed to generate report preview. Please try again.");
      setLoading(false);
    }
  };

  // Close the preview dialog
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  // Generate a new report without preview
  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      // Create report data
      let reportData: ComplianceReportData | null = null;

      if (reportConfig.type === "framework") {
        const framework = frameworks.find(
          (f) => f.id === reportConfig.frameworkId
        );
        if (!framework) {
          throw new Error("Selected framework not found");
        }

        // Get assessment results for this framework if available
        const frameworkAssessments = assessmentHistory.filter(
          (a) => a.frameworkId === reportConfig.frameworkId
        );

        const reportDataArray = generateComplianceReportData(
          [framework],
          audits.filter((a) => a.frameworkIds.includes(framework.id)),
          frameworkAssessments.length > 0 ? frameworkAssessments : undefined
        );

        if (reportDataArray.length > 0) {
          reportData = reportDataArray[0];
        }
      } else {
        // Executive summary report across all frameworks
        reportData = generateExecutiveSummaryReport(frameworks, audits);
      }

      if (reportData) {
        // Update report properties based on user input
        reportData.title =
          reportConfig.name ||
          (reportConfig.type === "framework"
            ? frameworks.find((f) => f.id === reportConfig.frameworkId)?.name +
              " Report"
            : "Executive Summary Report");
        reportData.format = reportConfig.format;
        reportData.includeCharts = reportConfig.includeCharts;
        reportData.includeEvidence = reportConfig.includeEvidence;
        reportData.includeRecommendations = reportConfig.includeRecommendations;

        // Add date range to subtitle if specified
        if (reportConfig.startDate && reportConfig.endDate) {
          const formattedStartDate = format(
            reportConfig.startDate,
            "MMM d, yyyy"
          );
          const formattedEndDate = format(reportConfig.endDate, "MMM d, yyyy");
          reportData.description = `Report Period: ${formattedStartDate} to ${formattedEndDate}`;
        }

        // Add information about source to description
        reportData.description = 
          (reportData.description || "") + 
          "\nGenerated by Logware Security Platform";
        reportData.id = `report-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;
        reportData.timestamp = new Date();

        // Send to reporting engine
        const result = await sendToReportingEngine(reportData);

        if (result.success && result.reportUrl) {
          // Create a new report entry
          const newReport: Report = {
            id: reportData.id,
            name: reportData.title,
            created: new Date(),
            type:
              reportConfig.type === "framework"
                ? frameworks.find((f) => f.id === reportConfig.frameworkId)
                    ?.name || "Custom Report"
                : "Executive Summary",
            format: reportConfig.format,
            size: `${(Math.random() * 5 + 1).toFixed(1)} MB`, // Mock size for now
            downloadUrl: result.reportUrl,
          };

          setReports([newReport, ...reports]);
          setReportSuccess("Report generated successfully");

          // Reset form
          setReportConfig({
            ...reportConfig,
            name: "",
          });
        } else {
          throw new Error("Failed to send report to reporting engine");
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error generating report:", error);
      setReportError("Failed to generate report. Please try again.");
      setLoading(false);
    }
  };

  // Delete a report
  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter((report) => report.id !== reportId));
  };

  // Render the report preview using our dedicated component
  const renderReportPreview = () => {
    if (!previewReport) return null;

    // These functions are defined here to have access to component state
    const handleSaveReport = async (
      reportData: ComplianceReportData,
      format: string
    ) => {
      try {
        setLoading(true);
        const result = await sendToReportingEngine(reportData);
        if (result.success) {
          setReportSuccess(
            `Report saved successfully in ${format.toUpperCase()} format`
          );

          // Create a new report entry
          const newReport: Report = {
            id: reportData.id,
            name: reportData.title,
            created: new Date(),
            type: reportData.reportType === "framework" ? 
                (frameworks.find(f => reportData.frameworkIds?.includes(f.id))?.name || "Framework Report") : 
                "Custom Report",
            format: format,
            size: `${(Math.random() * 5 + 1).toFixed(1)} MB`, // Mock size for now
            downloadUrl: result.reportUrl || "#",
          };

          // Update the reports list with the new report
          setReports([newReport, ...reports]);
        } else {
          throw new Error("Failed to save report");
        }
      } catch (error) {
        console.error("Error saving report:", error);
        setReportError("Failed to save report. Please try again.");
      } finally {
        setLoading(false);
        setShowPreview(false);
      }
    };

    const handleShareReport = async (reportData: ComplianceReportData) => {
      try {
        setLoading(true);
        // Mock sharing functionality
        setTimeout(() => {
          setReportSuccess(
            "Report link copied to clipboard: report-" +
              reportData.id.substring(0, 8)
          );
          setLoading(false);
          setShowPreview(false);
        }, 1000);
      } catch (error) {
        console.error("Error sharing report:", error);
        setReportError("Failed to share report. Please try again.");
        setLoading(false);
      }
    };

    return (
      <Dialog
        open={showPreview}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <ComplianceReportPreview
          reportData={previewReport}
          onClose={handleClosePreview}
          onSave={handleSaveReport}
          onShare={handleShareReport}
        />
      </Dialog>
    );
  };

  // Return the JSX for the component
  return (
    <Box>
      {/* Success and error alerts */}
      <Snackbar
        open={!!reportSuccess}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="success"
          sx={{ width: "100%" }}
        >
          {reportSuccess}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!reportError}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="error"
          sx={{ width: "100%" }}
        >
          {reportError}
        </Alert>
      </Snackbar>

      {/* Report preview dialog */}
      {renderReportPreview()}
      <Grid container spacing={3}>
        {/* Report Generation Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate New Report
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Report Name"
                  name="name"
                  value={reportConfig.name}
                  onChange={handleConfigChange}
                  margin="normal"
                  variant="outlined"
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel id="report-type-label">Report Type</InputLabel>
                  <Select
                    labelId="report-type-label"
                    id="report-type"
                    value={reportConfig.type}
                    label="Report Type"
                    onChange={handleTypeChange}
                  >
                    <MenuItem value="framework">Framework Report</MenuItem>
                    <MenuItem value="custom">Custom Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {reportConfig.type === "framework" && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel id="framework-label">Framework</InputLabel>
                    <Select
                      labelId="framework-label"
                      id="framework"
                      value={reportConfig.frameworkId}
                      label="Framework"
                      onChange={handleFrameworkChange}
                    >
                      {frameworks.map((framework) => (
                        <MenuItem key={framework.id} value={framework.id}>
                          {framework.name} (v{framework.version})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel id="format-label">Report Format</InputLabel>
                  <Select
                    labelId="format-label"
                    id="format"
                    value={reportConfig.format}
                    label="Report Format"
                    onChange={handleFormatChange}
                  >
                    <MenuItem value="pdf">PDF Document</MenuItem>
                    <MenuItem value="excel">Excel Spreadsheet</MenuItem>
                    <MenuItem value="csv">CSV File</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={reportConfig.startDate}
                    onChange={handleDateChange("startDate")}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        margin: "normal",
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={reportConfig.endDate}
                    onChange={handleDateChange("endDate")}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        margin: "normal",
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                  <Chip
                    label="Include Controls"
                    color={reportConfig.includeCharts ? "primary" : "default"}
                    onClick={() => handleToggleOption("includeCharts")}
                    variant={
                      reportConfig.includeCharts ? "filled" : "outlined"
                    }
                  />
                  <Chip
                    label="Include Evidence"
                    color={reportConfig.includeEvidence ? "primary" : "default"}
                    onClick={() => handleToggleOption("includeEvidence")}
                    variant={
                      reportConfig.includeEvidence ? "filled" : "outlined"
                    }
                  />
                  <Chip
                    label="Include Findings"
                    color={reportConfig.includeRecommendations ? "primary" : "default"}
                    onClick={() => handleToggleOption("includeRecommendations")}
                    variant={
                      reportConfig.includeRecommendations ? "filled" : "outlined"
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handlePreviewReport}
                    disabled={
                      loading ||
                      !reportConfig.name ||
                      (reportConfig.type === "framework" &&
                        !reportConfig.frameworkId)
                    }
                    startIcon={<AssessmentIcon />}
                  >
                    Preview Report
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateReport}
                    disabled={
                      loading ||
                      !reportConfig.name ||
                      (reportConfig.type === "framework" &&
                        !reportConfig.frameworkId)
                    }
                    startIcon={<ReportIcon />}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Generate Report"
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Reports Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generated Reports
            </Typography>

            <TableContainer>
              <Table sx={{ minWidth: 650 }} size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>Report Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Generated On</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report: Report) => (
                    <TableRow key={report.id}>
                      <TableCell component="th" scope="row">
                        {report.name}
                      </TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.format.toUpperCase()}
                          size="small"
                          color={
                            report.format === "pdf"
                              ? "error"
                              : report.format === "excel"
                              ? "success"
                              : "primary"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(report.created), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Download">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setReportSuccess(
                                `Downloading ${
                                  report.name
                                } in ${report.format.toUpperCase()} format...`
                              );
                              // In a real app, this would trigger an actual download
                              window.open(report.downloadUrl, "_blank");
                            }}
                          >
                            {report.format === "pdf" ? (
                              <PictureAsPdfIcon />
                            ) : report.format === "excel" ? (
                              <FileExcelIcon />
                            ) : (
                              <DownloadIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Share">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setReportSuccess(
                                `Report link for ${report.name} copied to clipboard`
                              );
                              // In a real app, this would copy a sharing link
                            }}
                          >
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setReportSuccess(
                                `Preparing ${report.name} for printing...`
                              );
                              // In a real app, this would open a print dialog
                            }}
                          >
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {reports.length === 0 && (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Typography variant="body1" color="textSecondary">
                  No reports have been generated yet.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplianceReports;
