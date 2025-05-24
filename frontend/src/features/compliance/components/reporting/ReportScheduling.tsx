/**
 * Report Scheduling Component
 *
 * Allows scheduling of compliance reports across different frameworks
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Stack,
  useTheme,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import {
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PauseCircle as PauseIcon,
  PlayCircle as PlayIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

// Props interface
interface ReportSchedulingProps {
  framework?: string;
}

// Scheduled report interface
interface ScheduledReport {
  id: string;
  name: string;
  framework: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  nextRunDate: string;
  lastRunDate?: string;
  recipients: string[];
  status: "active" | "paused" | "completed";
  createdBy: string;
  createdAt: string;
  templateId: string;
}

// Sample scheduled reports
const sampleScheduledReports: ScheduledReport[] = [
  {
    id: "schedule-1",
    name: "Weekly GDPR Compliance Report",
    framework: "GDPR",
    frequency: "weekly",
    nextRunDate: "2025-05-27T09:00:00Z",
    lastRunDate: "2025-05-20T09:00:00Z",
    recipients: ["john.smith@example.com", "sarah.jones@example.com"],
    status: "active",
    createdBy: "John Smith",
    createdAt: "2025-01-15T14:30:00Z",
    templateId: "template-1",
  },
  {
    id: "schedule-2",
    name: "Monthly PCI-DSS Compliance Report",
    framework: "PCI-DSS",
    frequency: "monthly",
    nextRunDate: "2025-06-01T10:00:00Z",
    lastRunDate: "2025-05-01T10:00:00Z",
    recipients: ["compliance@example.com", "security@example.com"],
    status: "active",
    createdBy: "Emily Chen",
    createdAt: "2025-02-10T11:45:00Z",
    templateId: "template-2",
  },
  {
    id: "schedule-3",
    name: "Quarterly ISO 27001 Compliance Report",
    framework: "ISO 27001",
    frequency: "quarterly",
    nextRunDate: "2025-07-01T08:00:00Z",
    lastRunDate: "2025-04-01T08:00:00Z",
    recipients: ["ciso@example.com", "iso@example.com"],
    status: "active",
    createdBy: "David Kim",
    createdAt: "2025-03-05T16:20:00Z",
    templateId: "template-3",
  },
  {
    id: "schedule-4",
    name: "Monthly HIPAA Compliance Report",
    framework: "HIPAA",
    frequency: "monthly",
    nextRunDate: "2025-06-05T14:00:00Z",
    lastRunDate: "2025-05-05T14:00:00Z",
    recipients: ["privacy@example.com", "compliance@example.com"],
    status: "paused",
    createdBy: "Sarah Wilson",
    createdAt: "2025-02-20T13:10:00Z",
    templateId: "template-4",
  },
];

/**
 * Report Scheduling Component
 */
const ReportScheduling: React.FC<ReportSchedulingProps> = ({
  framework = "ALL",
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(
    []
  );

  // Dialog states
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduledReport>>({
    framework: framework !== "ALL" ? framework : "",
    frequency: "monthly",
    recipients: [],
    status: "active",
  });

  const [recipientEmail, setRecipientEmail] = useState("");

  // Load scheduled reports
  useEffect(() => {
    const fetchScheduledReports = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Filter reports by framework if specified
        const filteredReports =
          framework === "ALL"
            ? sampleScheduledReports
            : sampleScheduledReports.filter(
                (report) => report.framework === framework
              );

        setScheduledReports(filteredReports);
        setError(null);
      } catch (err) {
        console.error("Error fetching scheduled reports:", err);
        setError("Failed to load scheduled reports");
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledReports();
  }, [framework]);

  // Handle adding a recipient
  const handleAddRecipient = () => {
    if (
      recipientEmail &&
      recipientEmail.includes("@") &&
      !newSchedule.recipients?.includes(recipientEmail)
    ) {
      setNewSchedule({
        ...newSchedule,
        recipients: [...(newSchedule.recipients || []), recipientEmail],
      });
      setRecipientEmail("");
    }
  };

  // Handle removing a recipient
  const handleRemoveRecipient = (email: string) => {
    setNewSchedule({
      ...newSchedule,
      recipients: newSchedule.recipients?.filter((r) => r !== email),
    });
  };

  // Handle schedule creation
  const handleCreateSchedule = async () => {
    try {
      // Validate form
      if (
        !newSchedule.name ||
        !newSchedule.framework ||
        !newSchedule.frequency ||
        !newSchedule.nextRunDate ||
        !newSchedule.recipients?.length
      ) {
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Close dialog and reset form
      setOpenScheduleDialog(false);
      setNewSchedule({
        framework: framework !== "ALL" ? framework : "",
        frequency: "monthly",
        recipients: [],
        status: "active",
      });
    } catch (err) {
      console.error("Error creating schedule:", err);
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "completed":
        return "info";
      default:
        return "default";
    }
  };

  // Get frequency text
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      default:
        return frequency;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">
          Scheduled Reports {framework !== "ALL" && `(${framework})`}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenScheduleDialog(true)}
        >
          Schedule New Report
        </Button>
      </Box>

      {scheduledReports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CalendarIcon
            sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            No Scheduled Reports
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            No reports have been scheduled yet. Click the 'Schedule New Report'
            button to create one.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Framework</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Next Run</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Recipients</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scheduledReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{report.framework}</TableCell>
                  <TableCell>{getFrequencyText(report.frequency)}</TableCell>
                  <TableCell>{formatDate(report.nextRunDate)}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      size="small"
                      color={getStatusColor(report.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${report.recipients.length} recipient${
                        report.recipients.length !== 1 ? "s" : ""
                      }`}
                      size="small"
                      icon={<EmailIcon />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color={report.status === "active" ? "warning" : "success"}
                      title={
                        report.status === "active"
                          ? "Pause Schedule"
                          : "Activate Schedule"
                      }
                    >
                      {report.status === "active" ? (
                        <PauseIcon />
                      ) : (
                        <PlayIcon />
                      )}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      title="Edit Schedule"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      title="Delete Schedule"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Schedule Dialog */}
      <Dialog
        open={openScheduleDialog}
        onClose={() => setOpenScheduleDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Schedule New Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                label="Report Name"
                fullWidth
                value={newSchedule.name || ""}
                onChange={(e) =>
                  setNewSchedule({ ...newSchedule, name: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Framework</InputLabel>
                <Select
                  value={newSchedule.framework || ""}
                  label="Framework"
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      framework: e.target.value,
                    })
                  }
                  disabled={framework !== "ALL"}
                >
                  <MenuItem value="GDPR">GDPR</MenuItem>
                  <MenuItem value="PCI-DSS">PCI-DSS</MenuItem>
                  <MenuItem value="HIPAA">HIPAA</MenuItem>
                  <MenuItem value="ISO 27001">ISO 27001</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={newSchedule.frequency || "monthly"}
                  label="Frequency"
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      frequency: e.target.value as
                        | "daily"
                        | "weekly"
                        | "monthly"
                        | "quarterly",
                    })
                  }
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={
                    newSchedule.nextRunDate
                      ? new Date(newSchedule.nextRunDate)
                      : null
                  }
                  onChange={(date) =>
                    setNewSchedule({
                      ...newSchedule,
                      nextRunDate: date ? date.toISOString() : undefined,
                    })
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newSchedule.status || "active"}
                  label="Status"
                  onChange={(e) =>
                    setNewSchedule({
                      ...newSchedule,
                      status: e.target.value as
                        | "active"
                        | "paused"
                        | "completed",
                    })
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="paused">Paused</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Recipients
              </Typography>
              <Box sx={{ display: "flex", mb: 2 }}>
                <TextField
                  label="Email Address"
                  size="small"
                  fullWidth
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddRecipient}
                  disabled={!recipientEmail || !recipientEmail.includes("@")}
                >
                  Add
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {newSchedule.recipients?.map((email) => (
                  <Chip
                    key={email}
                    label={email}
                    onDelete={() => handleRemoveRecipient(email)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>

              {(newSchedule.recipients?.length || 0) === 0 && (
                <Typography variant="body2" color="textSecondary">
                  Add at least one recipient email address.
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScheduleDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateSchedule}
            disabled={
              !newSchedule.name ||
              !newSchedule.framework ||
              !newSchedule.frequency ||
              !newSchedule.nextRunDate ||
              !(newSchedule.recipients?.length || 0)
            }
          >
            Schedule Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportScheduling;
