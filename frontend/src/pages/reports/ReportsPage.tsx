import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format, subDays, addDays } from "date-fns";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import TableChartIcon from "@mui/icons-material/TableChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArticleIcon from "@mui/icons-material/Article";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ShareIcon from "@mui/icons-material/Share";
import PrintIcon from "@mui/icons-material/Print";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";

// Mock data for report templates
const reportTemplates = [
  {
    id: "sec-overview",
    name: "Security Overview",
    description: "Comprehensive overview of security posture and incidents",
    category: "security",
    icon: <DescriptionIcon />,
    sections: [
      "Executive Summary",
      "Threat Analysis",
      "Incident Overview",
      "Vulnerability Status",
      "Compliance Status",
    ],
  },
  {
    id: "net-traffic",
    name: "Network Traffic Analysis",
    description: "Detailed analysis of network traffic patterns and anomalies",
    category: "network",
    icon: <BarChartIcon />,
    sections: [
      "Traffic Summary",
      "Protocol Distribution",
      "Top Talkers",
      "Geographic Distribution",
      "Anomaly Detection",
    ],
  },
  {
    id: "compliance",
    name: "Compliance Report",
    description: "Status of compliance with regulatory frameworks",
    category: "compliance",
    icon: <ArticleIcon />,
    sections: [
      "Compliance Summary",
      "Requirements Status",
      "Gap Analysis",
      "Remediation Plan",
      "Evidence Collection",
    ],
  },
  {
    id: "incident",
    name: "Incident Response",
    description: "Details of security incidents and response actions",
    category: "security",
    icon: <DescriptionIcon />,
    sections: [
      "Incident Summary",
      "Timeline",
      "Impact Assessment",
      "Response Actions",
      "Lessons Learned",
    ],
  },
  {
    id: "vuln-mgmt",
    name: "Vulnerability Management",
    description: "Status of vulnerabilities and remediation efforts",
    category: "security",
    icon: <TableChartIcon />,
    sections: [
      "Vulnerability Summary",
      "Critical Findings",
      "Remediation Status",
      "Trend Analysis",
      "Risk Assessment",
    ],
  },
];

// Mock data for generated reports
const generatedReports = [
  {
    id: "1",
    name: "Monthly Security Overview - May 2025",
    template: "Security Overview",
    createdAt: "2025-05-14T08:30:00Z",
    createdBy: "admin@example.com",
    status: "completed",
    format: "pdf",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "Q1 Compliance Report 2025",
    template: "Compliance Report",
    createdAt: "2025-04-02T14:15:00Z",
    createdBy: "compliance@example.com",
    status: "completed",
    format: "pdf",
    size: "4.7 MB",
  },
  {
    id: "3",
    name: "Network Traffic Analysis - Week 19",
    template: "Network Traffic Analysis",
    createdAt: "2025-05-12T09:45:00Z",
    createdBy: "network@example.com",
    status: "completed",
    format: "xlsx",
    size: "1.2 MB",
  },
  {
    id: "4",
    name: "Security Incident #2345 Report",
    template: "Incident Response",
    createdAt: "2025-05-10T16:20:00Z",
    createdBy: "security@example.com",
    status: "completed",
    format: "pdf",
    size: "1.8 MB",
  },
  {
    id: "5",
    name: "Weekly Vulnerability Status",
    template: "Vulnerability Management",
    createdAt: "2025-05-13T11:00:00Z",
    createdBy: "admin@example.com",
    status: "generating",
    format: "pending",
    size: "-",
  },
];

// Mock data for scheduled reports
const scheduledReports = [
  {
    id: "sched-1",
    name: "Weekly Security Overview",
    template: "Security Overview",
    schedule: "Weekly on Monday at 07:00",
    recipients: ["security-team@example.com", "executive@example.com"],
    nextRun: "2025-05-20T07:00:00Z",
    lastRun: "2025-05-13T07:00:00Z",
    status: "active",
  },
  {
    id: "sched-2",
    name: "Monthly Compliance Status",
    template: "Compliance Report",
    schedule: "Monthly on 1st at 06:00",
    recipients: ["compliance@example.com", "auditors@example.com"],
    nextRun: "2025-06-01T06:00:00Z",
    lastRun: "2025-05-01T06:00:00Z",
    status: "active",
  },
  {
    id: "sched-3",
    name: "Daily Network Traffic Summary",
    template: "Network Traffic Analysis",
    schedule: "Daily at 23:00",
    recipients: ["network-ops@example.com"],
    nextRun: "2025-05-15T23:00:00Z",
    lastRun: "2025-05-14T23:00:00Z",
    status: "paused",
  },
];

const ReportsPage: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);

  // State for report generation dialog
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [reportName, setReportName] = useState("");
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [reportFormat, setReportFormat] = useState("pdf");

  // State for scheduling dialog
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState("daily");
  const [scheduleDay, setScheduleDay] = useState("monday");
  const [scheduleDate, setScheduleDate] = useState("1");
  const [scheduleTime, setScheduleTime] = useState("08:00");
  const [scheduleRecipients, setScheduleRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState("");

  // State for alerts
  const [successAlert, setSuccessAlert] = useState("");

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = reportTemplates.find((t) => t.id === templateId);
    if (template) {
      setReportName(`${template.name} - ${format(new Date(), "yyyy-MM-dd")}`);
      setSelectedSections(template.sections);
    }
    setGenerateDialogOpen(true);
  };

  // Handle section toggle
  const handleSectionToggle = (section: string) => {
    if (selectedSections.includes(section)) {
      setSelectedSections(selectedSections.filter((s) => s !== section));
    } else {
      setSelectedSections([...selectedSections, section]);
    }
  };

  // Handle report generation
  const handleGenerateReport = () => {
    // In a real app, this would make an API call to generate the report
    console.log("Generating report:", {
      template: selectedTemplate,
      name: reportName,
      dateRange,
      sections: selectedSections,
      format: reportFormat,
    });

    setGenerateDialogOpen(false);
    setSuccessAlert(
      "Report generation started. You will be notified when it is complete."
    );
    setTimeout(() => setSuccessAlert(""), 5000);
  };

  // Handle scheduling a report
  const handleScheduleReport = () => {
    // In a real app, this would make an API call to schedule the report
    console.log("Scheduling report:", {
      template: selectedTemplate,
      name: reportName,
      scheduleType,
      scheduleDay,
      scheduleDate,
      scheduleTime,
      recipients: scheduleRecipients,
    });

    setScheduleDialogOpen(false);
    setSuccessAlert("Report scheduled successfully.");
    setTimeout(() => setSuccessAlert(""), 5000);
  };

  // Handle adding a recipient
  const handleAddRecipient = () => {
    if (newRecipient && !scheduleRecipients.includes(newRecipient)) {
      setScheduleRecipients([...scheduleRecipients, newRecipient]);
      setNewRecipient("");
    }
  };

  // Handle removing a recipient
  const handleRemoveRecipient = (email: string) => {
    setScheduleRecipients(scheduleRecipients.filter((r) => r !== email));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy HH:mm");
  };

  // Render icon based on format
  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <PictureAsPdfIcon fontSize="small" color="error" />;
      case "xlsx":
        return <InsertDriveFileIcon fontSize="small" color="primary" />;
      case "csv":
        return <TableChartIcon fontSize="small" color="success" />;
      default:
        return <DescriptionIcon fontSize="small" />;
    }
  };

  // Get status chip for reports
  const getStatusChip = (status: string) => {
    switch (status) {
      case "completed":
        return <Chip size="small" color="success" label="Completed" />;
      case "generating":
        return <Chip size="small" color="primary" label="Generating" />;
      case "failed":
        return <Chip size="small" color="error" label="Failed" />;
      case "active":
        return <Chip size="small" color="success" label="Active" />;
      case "paused":
        return <Chip size="small" color="warning" label="Paused" />;
      default:
        return <Chip size="small" label={status} />;
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reports
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Generate, schedule, and manage security and compliance reports.
        </Typography>

        {successAlert && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successAlert}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Report Templates" />
            <Tab label="Generated Reports" />
            <Tab label="Scheduled Reports" />
          </Tabs>
        </Box>

        {/* Report Templates Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            {reportTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box sx={{ color: "primary.main", mr: 1 }}>
                        {template.icon}
                      </Box>
                      <Typography variant="h6" gutterBottom component="div">
                        {template.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {template.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        size="small"
                        label={template.category}
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        size="small"
                        label={`${template.sections.length} sections`}
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                  <Divider />
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      Generate
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ScheduleIcon />}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setReportName(`Scheduled ${template.name}`);
                        setScheduleDialogOpen(true);
                      }}
                    >
                      Schedule
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Generated Reports Tab */}
        {activeTab === 1 && (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {generatedReports.map((report) => (
                  <TableRow
                    key={report.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {report.name}
                    </TableCell>
                    <TableCell>{report.template}</TableCell>
                    <TableCell>
                      {formatDate(report.createdAt)}
                      <Typography variant="caption" display="block">
                        by {report.createdBy}
                      </Typography>
                    </TableCell>
                    <TableCell>{getStatusChip(report.status)}</TableCell>
                    <TableCell>
                      {report.status === "completed" ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {getFormatIcon(report.format)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {report.format.toUpperCase()}
                          </Typography>
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{report.size}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex" }}>
                        {report.status === "completed" && (
                          <>
                            <Tooltip title="Download">
                              <IconButton size="small">
                                <FileDownloadIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View">
                              <IconButton size="small">
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Share">
                              <IconButton size="small">
                                <ShareIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Scheduled Reports Tab */}
        {activeTab === 2 && (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Template</TableCell>
                  <TableCell>Schedule</TableCell>
                  <TableCell>Next Run</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scheduledReports.map((report) => (
                  <TableRow
                    key={report.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {report.name}
                    </TableCell>
                    <TableCell>{report.template}</TableCell>
                    <TableCell>{report.schedule}</TableCell>
                    <TableCell>
                      {formatDate(report.nextRun)}
                      <Typography variant="caption" display="block">
                        Last run: {formatDate(report.lastRun)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {report.recipients.length > 0 ? (
                        <Tooltip title={report.recipients.join(", ")}>
                          <span>{report.recipients.length} recipients</span>
                        </Tooltip>
                      ) : (
                        "None"
                      )}
                    </TableCell>
                    <TableCell>{getStatusChip(report.status)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex" }}>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Run Now">
                          <IconButton size="small">
                            <PlayArrowIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip
                          title={
                            report.status === "active" ? "Pause" : "Resume"
                          }
                        >
                          <IconButton size="small">
                            {report.status === "active" ? (
                              <PauseIcon fontSize="small" />
                            ) : (
                              <PlayCircleFilledIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Generate Report Dialog */}
        <Dialog
          open={generateDialogOpen}
          onClose={() => setGenerateDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Generate Report</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Report Name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={dateRange.start}
                    onChange={(newValue) => {
                      if (newValue) {
                        setDateRange({ ...dateRange, start: newValue });
                      }
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={dateRange.end}
                    onChange={(newValue) => {
                      if (newValue) {
                        setDateRange({ ...dateRange, end: newValue });
                      }
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Sections to Include
                </Typography>
                <FormGroup row>
                  {reportTemplates
                    .find((t) => t.id === selectedTemplate)
                    ?.sections.map((section) => (
                      <FormControlLabel
                        key={section}
                        control={
                          <Checkbox
                            checked={selectedSections.includes(section)}
                            onChange={() => handleSectionToggle(section)}
                          />
                        }
                        label={section}
                        sx={{ width: "50%", mb: 1 }}
                      />
                    ))}
                </FormGroup>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="report-format-label">
                    Report Format
                  </InputLabel>
                  <Select
                    labelId="report-format-label"
                    value={reportFormat}
                    onChange={(e) => setReportFormat(e.target.value)}
                    label="Report Format"
                  >
                    <MenuItem value="pdf">PDF Document</MenuItem>
                    <MenuItem value="xlsx">Excel Spreadsheet</MenuItem>
                    <MenuItem value="csv">CSV File</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleGenerateReport}
              variant="contained"
              color="primary"
              disabled={!reportName || selectedSections.length === 0}
            >
              Generate Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Report Dialog */}
        <Dialog
          open={scheduleDialogOpen}
          onClose={() => setScheduleDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Schedule Report</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Report Name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="schedule-type-label">Frequency</InputLabel>
                  <Select
                    labelId="schedule-type-label"
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    label="Frequency"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {scheduleType === "weekly" && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="schedule-day-label">Day of Week</InputLabel>
                    <Select
                      labelId="schedule-day-label"
                      value={scheduleDay}
                      onChange={(e) => setScheduleDay(e.target.value)}
                      label="Day of Week"
                    >
                      <MenuItem value="monday">Monday</MenuItem>
                      <MenuItem value="tuesday">Tuesday</MenuItem>
                      <MenuItem value="wednesday">Wednesday</MenuItem>
                      <MenuItem value="thursday">Thursday</MenuItem>
                      <MenuItem value="friday">Friday</MenuItem>
                      <MenuItem value="saturday">Saturday</MenuItem>
                      <MenuItem value="sunday">Sunday</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {(scheduleType === "monthly" || scheduleType === "quarterly") && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="schedule-date-label">
                      Day of Month
                    </InputLabel>
                    <Select
                      labelId="schedule-date-label"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      label="Day of Month"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <MenuItem key={day} value={day.toString()}>
                            {day}
                          </MenuItem>
                        )
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Time"
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Recipients
                </Typography>
                <Box sx={{ display: "flex", mb: 1 }}>
                  <TextField
                    label="Email Address"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    fullWidth
                    sx={{ mr: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddRecipient}
                    disabled={!newRecipient}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                  {scheduleRecipients.map((email) => (
                    <Chip
                      key={email}
                      label={email}
                      onDelete={() => handleRemoveRecipient(email)}
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                  {scheduleRecipients.length === 0 && (
                    <Typography variant="body2" color="textSecondary">
                      No recipients added
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleScheduleReport}
              variant="contained"
              color="primary"
              disabled={!reportName || scheduleRecipients.length === 0}
            >
              Schedule Report
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ReportsPage;
