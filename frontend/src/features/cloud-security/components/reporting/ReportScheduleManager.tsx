/**
 * Report Schedule Manager Component
 *
 * Allows users to schedule automatic report generation
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  Radio,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  SelectChangeEvent,
  Switch,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { ReportConfigType } from "./ReportConfiguration";
import {
  useGetReportSchedulesQuery,
  useCreateReportScheduleMutation,
  useUpdateReportScheduleMutation,
  useDeleteReportScheduleMutation,
  useToggleScheduleActiveMutation,
} from "../../services/reportingService";

// Fallback scheduled reports if API isn't available
const fallbackScheduledReports = [
  {
    id: "sched-1",
    name: "Weekly Executive Summary",
    frequency: "weekly",
    day: "monday",
    time: "08:00",
    recipients: ["security-team@example.com", "ciso@example.com"],
    nextRun: "2025-05-27T08:00:00Z",
    templateId: "executive-summary",
    active: true,
    config: {},
  },
  {
    id: "sched-2",
    name: "Monthly Compliance Report",
    frequency: "monthly",
    day: "1",
    time: "00:00",
    recipients: ["compliance@example.com", "auditors@example.com"],
    nextRun: "2025-06-01T00:00:00Z",
    templateId: "compliance-posture",
    active: true,
    config: {},
  },
];

interface ReportScheduleManagerProps {
  selectedTemplate: string | null;
  reportConfig: ReportConfigType;
}

/**
 * Report Schedule Manager Component
 */
const ReportScheduleManager: React.FC<ReportScheduleManagerProps> = ({
  selectedTemplate,
  reportConfig,
}) => {
  const theme = useTheme();

  // Fetch schedules from API
  const {
    data: apiSchedules,
    isLoading,
    isError,
    refetch,
  } = useGetReportSchedulesQuery();

  // Mutations for CRUD operations
  const [createSchedule, { isLoading: isCreating }] =
    useCreateReportScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] =
    useUpdateReportScheduleMutation();
  const [deleteSchedule, { isLoading: isDeleting }] =
    useDeleteReportScheduleMutation();
  const [toggleActive] = useToggleScheduleActiveMutation();

  // State for scheduled reports
  const [scheduledReports, setScheduledReports] = useState(
    fallbackScheduledReports
  );

  // Update scheduledReports when API data changes
  useEffect(() => {
    if (apiSchedules) {
      setScheduledReports(apiSchedules);
    }
  }, [apiSchedules]);

  // State for editing a schedule
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null
  );

  // State for new/edited schedule
  const [schedule, setSchedule] = useState({
    name: "",
    frequency: "weekly",
    day: "monday",
    time: "08:00",
    recipients: [] as string[],
    active: true,
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSchedule((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select change
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setSchedule((prev) => ({ ...prev, [name]: value }));
  };

  // Handle toggle change
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSchedule((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle add recipient
  const [newRecipient, setNewRecipient] = useState("");

  const handleAddRecipient = () => {
    if (newRecipient && !schedule.recipients.includes(newRecipient)) {
      setSchedule((prev) => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient],
      }));
      setNewRecipient("");
    }
  };

  // Handle remove recipient
  const handleRemoveRecipient = (recipient: string) => {
    setSchedule((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r !== recipient),
    }));
  };

  // Handle save schedule
  const handleSaveSchedule = async () => {
    if (!schedule.name || schedule.recipients.length === 0) {
      return; // Don't save if required fields are missing
    }

    try {
      if (editingScheduleId) {
        // Update existing schedule
        await updateSchedule({
          id: editingScheduleId,
          schedule: {
            name: schedule.name,
            frequency: schedule.frequency as
              | "daily"
              | "weekly"
              | "monthly"
              | "quarterly",
            day: schedule.day,
            time: schedule.time,
            recipients: schedule.recipients,
            active: schedule.active,
            templateId: selectedTemplate || undefined,
            config: selectedTemplate ? reportConfig : undefined,
          },
        }).unwrap();
      } else {
        // Create new schedule
        await createSchedule({
          name: schedule.name,
          frequency: schedule.frequency as
            | "daily"
            | "weekly"
            | "monthly"
            | "quarterly",
          day: schedule.day,
          time: schedule.time,
          recipients: schedule.recipients,
          active: schedule.active,
          templateId: selectedTemplate || "custom-report",
          config: reportConfig,
        }).unwrap();
      }

      // Refetch schedules after successful update
      refetch();
      setIsAddingSchedule(false);
      resetScheduleForm();
    } catch (error) {
      console.error("Failed to save schedule:", error);
    }
  };

  // Calculate next run date based on frequency
  const calculateNextRun = (frequency: string, day: string, time: string) => {
    const now = new Date();
    const nextRun = new Date();

    // This is a simplified calculation - would be more comprehensive in real implementation
    switch (frequency) {
      case "daily":
        nextRun.setDate(now.getDate() + 1);
        break;
      case "weekly":
        const daysOfWeek = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
        const targetDay = daysOfWeek.indexOf(day);
        const currentDay = now.getDay();
        const daysToAdd = (targetDay + 7 - currentDay) % 7;
        nextRun.setDate(now.getDate() + daysToAdd);
        break;
      case "monthly":
        nextRun.setMonth(now.getMonth() + 1);
        nextRun.setDate(parseInt(day));
        break;
      case "quarterly":
        nextRun.setMonth(now.getMonth() + 3);
        nextRun.setDate(parseInt(day));
        break;
    }

    const [hours, minutes] = time.split(":").map(Number);
    nextRun.setHours(hours, minutes, 0, 0);

    return nextRun.toISOString();
  };

  // Handle edit schedule
  const handleEditSchedule = (id: string) => {
    const scheduleToEdit = scheduledReports.find((s) => s.id === id);
    if (scheduleToEdit) {
      setSchedule({
        name: scheduleToEdit.name,
        frequency: scheduleToEdit.frequency,
        day: scheduleToEdit.day,
        time: scheduleToEdit.time,
        recipients: [...scheduleToEdit.recipients],
        active: scheduleToEdit.active,
      });
      setEditingScheduleId(id);
      setIsAddingSchedule(true);
    }
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteSchedule(id).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to delete schedule:", error);
    }
  };

  // Handle toggle schedule active state
  const handleToggleScheduleActive = async (id: string) => {
    try {
      const scheduleToToggle = scheduledReports.find((s) => s.id === id);
      if (scheduleToToggle) {
        await toggleActive({ id, active: !scheduleToToggle.active }).unwrap();
        refetch();
      }
    } catch (error) {
      console.error("Failed to toggle schedule active state:", error);
    }
  };

  // Reset schedule form
  const resetScheduleForm = () => {
    setSchedule({
      name: "",
      frequency: "weekly",
      day: "monday",
      time: "08:00",
      recipients: [],
      active: true,
    });
    setNewRecipient("");
    setEditingScheduleId(null);
  };

  // Handle cancel
  const handleCancel = () => {
    setIsAddingSchedule(false);
    resetScheduleForm();
  };

  // Render day selection based on frequency
  const renderDaySelection = () => {
    switch (schedule.frequency) {
      case "daily":
        return null;
      case "weekly":
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel id="day-label">Day of Week</InputLabel>
            <Select
              labelId="day-label"
              id="day"
              name="day"
              value={schedule.day}
              onChange={handleSelectChange}
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
        );
      case "monthly":
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel id="day-label">Day of Month</InputLabel>
            <Select
              labelId="day-label"
              id="day"
              name="day"
              value={schedule.day}
              onChange={handleSelectChange}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <MenuItem key={day} value={day.toString()}>
                  {day}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case "quarterly":
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel id="day-label">Day of First Month</InputLabel>
            <Select
              labelId="day-label"
              id="day"
              name="day"
              value={schedule.day}
              onChange={handleSelectChange}
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <MenuItem key={day} value={day.toString()}>
                  {day}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Schedule Reports
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Set up automatic report generation on a schedule.
      </Typography>

      {isAddingSchedule ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {editingScheduleId ? "Edit Schedule" : "New Schedule"}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Schedule Name"
                name="name"
                value={schedule.name}
                onChange={handleInputChange}
                margin="normal"
                placeholder="e.g., Weekly Security Report"
                required
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="frequency-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  id="frequency"
                  name="frequency"
                  value={schedule.frequency}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="quarterly">Quarterly</MenuItem>
                </Select>
              </FormControl>

              {renderDaySelection()}

              <TextField
                fullWidth
                label="Time"
                name="time"
                type="time"
                value={schedule.time}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={schedule.active}
                    onChange={handleToggleChange}
                    name="active"
                    color="primary"
                  />
                }
                label="Active"
                sx={{ mt: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Recipients
              </Typography>

              <Box sx={{ display: "flex", mb: 2 }}>
                <TextField
                  label="Email Address"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="email@example.com"
                  fullWidth
                  size="small"
                />
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddRecipient}
                  variant="contained"
                  sx={{ ml: 1 }}
                  disabled={!newRecipient}
                >
                  Add
                </Button>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  p: 1,
                  minHeight: 100,
                  maxHeight: 200,
                  overflow: "auto",
                  bgcolor: theme.palette.background.default,
                }}
              >
                {schedule.recipients.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ p: 1 }}
                  >
                    No recipients added
                  </Typography>
                ) : (
                  <List dense>
                    {schedule.recipients.map((recipient, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            onClick={() => handleRemoveRecipient(recipient)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={recipient} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Paper>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Selected Template: {selectedTemplate || "None selected"}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveSchedule}
              startIcon={
                isCreating || isUpdating ? (
                  <CircularProgress size={24} />
                ) : (
                  <SaveIcon />
                )
              }
              disabled={
                !schedule.name ||
                schedule.recipients.length === 0 ||
                isCreating ||
                isUpdating
              }
            >
              {isCreating || isUpdating ? "Saving..." : "Save Schedule"}
            </Button>
          </Box>
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<ScheduleIcon />}
              onClick={() => setIsAddingSchedule(true)}
              disabled={!selectedTemplate || isLoading}
            >
              Create New Schedule
            </Button>
            {!selectedTemplate && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Please select a report template first
              </Typography>
            )}
          </Box>

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Failed to load scheduled reports. Using fallback data.
            </Alert>
          )}
        </>
      )}

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Scheduled Reports
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        {scheduledReports.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              No scheduled reports yet
            </Typography>
          </Box>
        ) : (
          <List>
            {scheduledReports.map((scheduled, index) => (
              <React.Fragment key={scheduled.id}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditSchedule(scheduled.id)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteSchedule(scheduled.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="subtitle1">
                          {scheduled.name}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={scheduled.active}
                              onChange={() =>
                                handleToggleScheduleActive(scheduled.id)
                              }
                              size="small"
                            />
                          }
                          label={scheduled.active ? "Active" : "Inactive"}
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" component="span">
                          Frequency:{" "}
                          {scheduled.frequency.charAt(0).toUpperCase() +
                            scheduled.frequency.slice(1)}
                          {scheduled.frequency !== "daily" &&
                            ` (${scheduled.day})`}{" "}
                          at {scheduled.time}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mt: 0.5,
                          }}
                        >
                          <EmailIcon
                            fontSize="small"
                            sx={{
                              mr: 0.5,
                              color: theme.palette.text.secondary,
                            }}
                          />
                          <Typography variant="body2" color="textSecondary">
                            {scheduled.recipients.join(", ")}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="textSecondary">
                            Next run:{" "}
                            {new Date(scheduled.nextRun).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < scheduledReports.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default ReportScheduleManager;
