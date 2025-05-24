import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Avatar,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tab,
  Tabs,
  Tooltip,
  useTheme,
} from "@mui/material";
import DatePicker from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format, isAfter, isBefore, isToday } from "date-fns";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import WorkIcon from "@mui/icons-material/Work";
import AddIcon from "@mui/icons-material/Add";
import ArchiveIcon from "@mui/icons-material/Archive";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  ComplianceAudit,
  ComplianceFramework,
} from "../../pages/compliance/CompliancePage";

// Component props interface
interface ComplianceAuditsProps {
  audits: ComplianceAudit[];
  frameworks: ComplianceFramework[];
}

// Interface for audit creation/edit
interface AuditFormData {
  title: string;
  frameworkId: string;
  startDate: Date | null;
  endDate: Date | null;
  auditor: string;
  notes: string;
}

// Tab Panel interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`audit-tabpanel-${index}`}
      aria-labelledby={`audit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ComplianceAudits: React.FC<ComplianceAuditsProps> = ({
  audits,
  frameworks,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [auditFormData, setAuditFormData] = useState<AuditFormData>({
    title: "",
    frameworkId: "",
    startDate: null,
    endDate: null,
    auditor: "",
    notes: "",
  });
  const [selectedAudit, setSelectedAudit] = useState<ComplianceAudit | null>(
    null
  );

  // Filter audits by status
  const upcomingAudits = audits.filter(
    (audit) =>
      (audit.status === "scheduled" &&
        isAfter(new Date(audit.startDate), new Date())) ||
      (audit.status === "in-progress" &&
        isAfter(new Date(audit.endDate), new Date()))
  );

  const activeAudits = audits.filter(
    (audit) =>
      audit.status === "in-progress" ||
      (audit.status === "scheduled" &&
        (isToday(new Date(audit.startDate)) ||
          isBefore(new Date(audit.startDate), new Date())))
  );

  const completedAudits = audits.filter(
    (audit) => audit.status === "completed" || audit.status === "archived"
  );

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open dialog for creating a new audit
  const handleOpenCreateDialog = () => {
    setSelectedAudit(null);
    setAuditFormData({
      title: "",
      frameworkId: "",
      startDate: null,
      endDate: null,
      auditor: "",
      notes: "",
    });
    setDialogOpen(true);
  };

  // Open dialog for editing an existing audit
  const handleOpenEditDialog = (audit: ComplianceAudit) => {
    setSelectedAudit(audit);
    setAuditFormData({
      title: audit.title,
      frameworkId: audit.frameworkId,
      startDate: new Date(audit.startDate),
      endDate: new Date(audit.endDate),
      auditor: audit.auditor,
      notes: "",
    });
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle form data changes
  const handleFormChange = (
    event: React.ChangeEvent<
      HTMLInputElement | { name?: string; value: unknown }
    >
  ) => {
    const { name, value } = event.target;
    setAuditFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleFrameworkChange = (event: SelectChangeEvent) => {
    setAuditFormData((prev) => ({
      ...prev,
      frameworkId: event.target.value,
    }));
  };

  const handleDateChange =
    (field: "startDate" | "endDate") => (date: Date | null) => {
      setAuditFormData((prev) => ({
        ...prev,
        [field]: date,
      }));
    };

  // Submit form to create/edit audit
  const handleSubmitAudit = () => {
    // In a real app, this would call an API
    console.log("Audit data submitted:", auditFormData);
    setDialogOpen(false);
  };

  // Delete an audit
  const handleDeleteAudit = (auditId: string) => {
    // In a real app, this would call an API
    console.log("Delete audit:", auditId);
  };

  // Function to get color based on audit status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return theme.palette.info.main;
      case "in-progress":
        return theme.palette.warning.main;
      case "completed":
        return theme.palette.success.main;
      case "archived":
        return theme.palette.grey[500];
      default:
        return theme.palette.primary.main;
    }
  };

  // Function to get background color for audit cards
  const getCardBackground = (status: string) => {
    switch (status) {
      case "scheduled":
        return theme.palette.info.light;
      case "in-progress":
        return theme.palette.warning.light;
      case "completed":
        return theme.palette.success.light;
      case "archived":
        return theme.palette.grey[200];
      default:
        return theme.palette.background.paper;
    }
  };

  // Render audit card
  const renderAuditCard = (audit: ComplianceAudit) => {
    const framework = frameworks.find((fw) => fw.id === audit.frameworkId);

    return (
      <Card
        key={audit.id}
        sx={{
          mb: 2,
          boxShadow: 2,
          borderLeft: `4px solid ${getStatusColor(audit.status)}`,
          transition: "transform 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 4,
          },
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: getStatusColor(audit.status) }}>
              {audit.status === "scheduled" && <CalendarTodayIcon />}
              {audit.status === "in-progress" && <WorkIcon />}
              {audit.status === "completed" && <AssignmentTurnedInIcon />}
              {audit.status === "archived" && <ArchiveIcon />}
            </Avatar>
          }
          title={<Typography variant="h6">{audit.title}</Typography>}
          subheader={
            <Typography variant="body2" color="textSecondary">
              {framework?.name || "Unknown Framework"} • {audit.auditor}
            </Typography>
          }
          action={
            <Box>
              <Chip
                label={audit.status.replace("-", " ")}
                size="small"
                sx={{
                  bgcolor: getStatusColor(audit.status),
                  color: "#fff",
                  textTransform: "capitalize",
                  mr: 1,
                }}
              />
              <Tooltip title="View Details">
                <IconButton size="small">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => handleOpenEditDialog(audit)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteAudit(audit.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CalendarTodayIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "text.secondary" }}
                />
                <Typography variant="body2">
                  {format(new Date(audit.startDate), "MMM d, yyyy")} -{" "}
                  {format(new Date(audit.endDate), "MMM d, yyyy")}
                </Typography>
              </Box>

              {audit.status === "completed" && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <DescriptionIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2">
                    Score: <strong>{audit.score}%</strong>
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {audit.findings && audit.findings.length > 0 && (
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Key Findings:
                  </Typography>
                  <List dense disablePadding>
                    {audit.findings.map((finding, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <FindInPageIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary={finding}
                          primaryTypographyProps={{ variant: "body2" }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {audit.reportUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<DescriptionIcon />}
                  sx={{ mt: 1 }}
                  href={audit.reportUrl}
                  target="_blank"
                >
                  View Report
                </Button>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Compliance Audits</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Schedule Audit
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="audit tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={`Active (${activeAudits.length})`}
            id="audit-tab-0"
            aria-controls="audit-tabpanel-0"
          />
          <Tab
            label={`Upcoming (${upcomingAudits.length})`}
            id="audit-tab-1"
            aria-controls="audit-tabpanel-1"
          />
          <Tab
            label={`Completed (${completedAudits.length})`}
            id="audit-tab-2"
            aria-controls="audit-tabpanel-2"
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {activeAudits.length > 0 ? (
          activeAudits.map((audit) => renderAuditCard(audit))
        ) : (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body1" color="textSecondary">
              No active audits at this time.
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {upcomingAudits.length > 0 ? (
          upcomingAudits.map((audit) => renderAuditCard(audit))
        ) : (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body1" color="textSecondary">
              No upcoming audits scheduled.
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {completedAudits.length > 0 ? (
          completedAudits.map((audit) => renderAuditCard(audit))
        ) : (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="body1" color="textSecondary">
              No completed audits found.
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Create/Edit Audit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAudit ? "Edit Audit" : "Schedule New Audit"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Audit Title"
                name="title"
                value={auditFormData.title}
                onChange={handleFormChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="framework-select-label">Framework</InputLabel>
                <Select
                  labelId="framework-select-label"
                  id="framework-select"
                  value={auditFormData.frameworkId}
                  label="Framework"
                  onChange={handleFrameworkChange}
                  required
                >
                  {frameworks.map((framework) => (
                    <MenuItem key={framework.id} value={framework.id}>
                      {framework.name} (v{framework.version})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Auditor"
                name="auditor"
                value={auditFormData.auditor}
                onChange={handleFormChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={auditFormData.startDate}
                  onChange={handleDateChange("startDate")}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={auditFormData.endDate}
                  onChange={handleDateChange("endDate")}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={auditFormData.notes}
                onChange={handleFormChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmitAudit}
            variant="contained"
            color="primary"
            disabled={
              !auditFormData.title ||
              !auditFormData.frameworkId ||
              !auditFormData.auditor ||
              !auditFormData.startDate ||
              !auditFormData.endDate
            }
          >
            {selectedAudit ? "Update" : "Schedule"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceAudits;
