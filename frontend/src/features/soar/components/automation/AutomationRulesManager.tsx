import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as DuplicateIcon,
  PlayArrow as PlayArrowIcon,
  FilterList as FilterListIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

// Types
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  triggerType: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  isEnabled: boolean;
  priority: "low" | "medium" | "high" | "critical";
  createdBy: string;
  createdAt: string;
  lastModified: string;
  lastExecuted?: string;
  executionCount: number;
}

interface RuleCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator?: "AND" | "OR";
}

interface RuleAction {
  id: string;
  actionType: string;
  parameters: Record<string, any>;
  order: number;
}

// Mock Data
const triggerTypes = [
  {
    id: "alert",
    name: "New Alert",
    description: "Trigger when a new alert is generated",
  },
  {
    id: "incident",
    name: "Incident Created",
    description: "Trigger when a new incident is created",
  },
  {
    id: "status_change",
    name: "Status Change",
    description: "Trigger when an entity status changes",
  },
  { id: "scheduled", name: "Scheduled", description: "Trigger on a schedule" },
  { id: "api", name: "API Call", description: "Trigger via API call" },
];

const availableFields = [
  { id: "alert.severity", name: "Alert Severity", type: "string" },
  { id: "alert.source", name: "Alert Source", type: "string" },
  { id: "alert.type", name: "Alert Type", type: "string" },
  { id: "entity.type", name: "Entity Type", type: "string" },
  { id: "entity.name", name: "Entity Name", type: "string" },
  { id: "incident.category", name: "Incident Category", type: "string" },
  { id: "incident.priority", name: "Incident Priority", type: "string" },
];

const operators = [
  { id: "equals", name: "Equals", types: ["string", "number", "boolean"] },
  {
    id: "not_equals",
    name: "Not Equals",
    types: ["string", "number", "boolean"],
  },
  { id: "contains", name: "Contains", types: ["string"] },
  { id: "not_contains", name: "Not Contains", types: ["string"] },
  { id: "greater_than", name: "Greater Than", types: ["number"] },
  { id: "less_than", name: "Less Than", types: ["number"] },
  { id: "in", name: "In List", types: ["string", "number"] },
  { id: "not_in", name: "Not In List", types: ["string", "number"] },
];

const availableActions = [
  {
    id: "create_case",
    name: "Create Case",
    parameterFields: ["title", "description", "priority"],
  },
  {
    id: "assign_case",
    name: "Assign Case",
    parameterFields: ["caseId", "assigneeId"],
  },
  {
    id: "enrich_alert",
    name: "Enrich Alert Data",
    parameterFields: ["alertId", "enrichmentType"],
  },
  {
    id: "send_notification",
    name: "Send Notification",
    parameterFields: ["channel", "message", "recipients"],
  },
  {
    id: "run_playbook",
    name: "Run Playbook",
    parameterFields: ["playbookId", "inputParameters"],
  },
  {
    id: "add_to_blocklist",
    name: "Add to Blocklist",
    parameterFields: ["entityType", "entityValue"],
  },
];

const mockRules: AutomationRule[] = [
  {
    id: "rule-1",
    name: "High Severity Alert Triage",
    description:
      "Automatically triage high severity alerts by creating and assigning cases",
    triggerType: "alert",
    conditions: [
      {
        id: "cond-1",
        field: "alert.severity",
        operator: "equals",
        value: "high",
      },
      {
        id: "cond-2",
        field: "alert.source",
        operator: "in",
        value: "SIEM,EDR,Firewall",
        logicalOperator: "AND",
      },
    ],
    actions: [
      {
        id: "action-1",
        actionType: "create_case",
        parameters: {
          title: "{alert.name} - Automatic Triage",
          description:
            "Auto-generated case from high severity alert: {alert.description}",
          priority: "high",
        },
        order: 1,
      },
      {
        id: "action-2",
        actionType: "assign_case",
        parameters: {
          caseId: "{case.id}",
          assigneeId: "tier2-oncall",
        },
        order: 2,
      },
    ],
    isEnabled: true,
    priority: "high",
    createdBy: "admin",
    createdAt: "2025-04-10T15:30:00.000Z",
    lastModified: "2025-05-15T08:15:00.000Z",
    lastExecuted: "2025-05-18T14:23:00.000Z",
    executionCount: 24,
  },
  {
    id: "rule-2",
    name: "Repeated Failed Login Automation",
    description:
      "Create incident and notify team when repeated failed logins are detected",
    triggerType: "alert",
    conditions: [
      {
        id: "cond-1",
        field: "alert.type",
        operator: "equals",
        value: "failed_login",
      },
      {
        id: "cond-2",
        field: "entity.type",
        operator: "equals",
        value: "user",
        logicalOperator: "AND",
      },
    ],
    actions: [
      {
        id: "action-1",
        actionType: "run_playbook",
        parameters: {
          playbookId: "failed-login-investigation",
          inputParameters: {
            userId: "{entity.name}",
            alertId: "{alert.id}",
          },
        },
        order: 1,
      },
      {
        id: "action-2",
        actionType: "send_notification",
        parameters: {
          channel: "slack",
          message:
            "Potential brute force attack detected for user {entity.name}",
          recipients: "security-team",
        },
        order: 2,
      },
    ],
    isEnabled: true,
    priority: "medium",
    createdBy: "admin",
    createdAt: "2025-04-15T11:45:00.000Z",
    lastModified: "2025-05-10T09:20:00.000Z",
    lastExecuted: "2025-05-17T22:15:00.000Z",
    executionCount: 12,
  },
  {
    id: "rule-3",
    name: "Daily Malware Scan",
    description: "Schedule a daily malware scan across all endpoints",
    triggerType: "scheduled",
    conditions: [],
    actions: [
      {
        id: "action-1",
        actionType: "run_playbook",
        parameters: {
          playbookId: "endpoint-malware-scan",
          inputParameters: {
            scanType: "full",
            priority: "normal",
          },
        },
        order: 1,
      },
    ],
    isEnabled: false,
    priority: "medium",
    createdBy: "system",
    createdAt: "2025-03-28T09:15:00.000Z",
    lastModified: "2025-05-05T16:40:00.000Z",
    executionCount: 43,
  },
];

const AutomationRulesManager: React.FC = () => {
  const theme = useTheme();
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);
  const [openRuleDialog, setOpenRuleDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [filterEnabled, setFilterEnabled] = useState<boolean | null>(null);
  const [filterTriggerType, setFilterTriggerType] = useState<string>("");

  // Handle rule toggle
  const handleToggleRule = (ruleId: string) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId ? { ...rule, isEnabled: !rule.isEnabled } : rule
      )
    );
  };

  // Open dialog to create/edit rule
  const handleOpenRuleDialog = (rule?: AutomationRule) => {
    setSelectedRule(rule || null);
    setOpenRuleDialog(true);
  };

  // Close rule dialog
  const handleCloseRuleDialog = () => {
    setOpenRuleDialog(false);
    setSelectedRule(null);
  };

  // Apply filters
  const filteredRules = rules.filter((rule) => {
    // Filter by enabled status if set
    if (filterEnabled !== null && rule.isEnabled !== filterEnabled) {
      return false;
    }

    // Filter by trigger type if selected
    if (filterTriggerType && rule.triggerType !== filterTriggerType) {
      return false;
    }

    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setFilterEnabled(null);
    setFilterTriggerType("");
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return theme.palette.error.dark;
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.info.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Automation Rules</Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenRuleDialog()}
        >
          Create New Rule
        </Button>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                Total Rules
              </Typography>
              <Typography variant="h3">{rules.length}</Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Chip
                  size="small"
                  label={`${
                    rules.filter((rule) => rule.isEnabled).length
                  } Active`}
                  color="success"
                  sx={{ mr: 1 }}
                />
                <Chip
                  size="small"
                  label={`${
                    rules.filter((rule) => !rule.isEnabled).length
                  } Disabled`}
                  color="default"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                Executions (Last 30 Days)
              </Typography>
              <Typography variant="h3">
                {rules.reduce((sum, rule) => sum + rule.executionCount, 0)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Across{" "}
                  {rules.filter((rule) => rule.executionCount > 0).length} rules
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                Most Common Trigger
              </Typography>
              <Typography variant="h6">
                {/* Find most common trigger type */}
                {(() => {
                  const counts: Record<string, number> = {};
                  rules.forEach((rule) => {
                    counts[rule.triggerType] =
                      (counts[rule.triggerType] || 0) + 1;
                  });
                  const mostCommon = Object.entries(counts).sort(
                    (a, b) => b[1] - a[1]
                  )[0];
                  return mostCommon
                    ? triggerTypes.find((t) => t.id === mostCommon[0])?.name ||
                        mostCommon[0]
                    : "None";
                })()}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Used in{" "}
                  {Math.max(
                    ...Object.values(
                      rules.reduce((acc, rule) => {
                        acc[rule.triggerType] =
                          (acc[rule.triggerType] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ),
                    0
                  )}{" "}
                  rules
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="textSecondary">
                Most Used Action
              </Typography>
              <Typography variant="h6">
                {/* Find most common action type */}
                {(() => {
                  const counts: Record<string, number> = {};
                  rules.forEach((rule) => {
                    rule.actions.forEach((action) => {
                      counts[action.actionType] =
                        (counts[action.actionType] || 0) + 1;
                    });
                  });
                  const mostCommon = Object.entries(counts).sort(
                    (a, b) => b[1] - a[1]
                  )[0];
                  return mostCommon
                    ? availableActions.find((a) => a.id === mostCommon[0])
                        ?.name || mostCommon[0]
                    : "None";
                })()}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Used {rules.flatMap((rule) => rule.actions).length} times in
                  all rules
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="subtitle1">Filters:</Typography>
          </Grid>

          <Grid item>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="trigger-type-filter-label">
                Trigger Type
              </InputLabel>
              <Select
                labelId="trigger-type-filter-label"
                id="trigger-type-filter"
                value={filterTriggerType}
                label="Trigger Type"
                onChange={(e) => setFilterTriggerType(e.target.value)}
              >
                <MenuItem value="">All Triggers</MenuItem>
                {triggerTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={
                  filterEnabled === null
                    ? ""
                    : filterEnabled
                    ? "active"
                    : "disabled"
                }
                label="Status"
                onChange={(e) => {
                  if (e.target.value === "") {
                    setFilterEnabled(null);
                  } else {
                    setFilterEnabled(e.target.value === "active");
                  }
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <Button
              startIcon={<FilterListIcon />}
              onClick={clearFilters}
              disabled={filterEnabled === null && filterTriggerType === ""}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Rules Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Trigger</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Last Executed</TableCell>
              <TableCell>Executions</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No rules found matching the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredRules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {rule.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {rule.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {triggerTypes.find((t) => t.id === rule.triggerType)
                      ?.name || rule.triggerType}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={rule.priority}
                      sx={{
                        backgroundColor: alpha(
                          getPriorityColor(rule.priority),
                          0.1
                        ),
                        color: getPriorityColor(rule.priority),
                        fontWeight: "medium",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {rule.lastExecuted
                      ? new Date(rule.lastExecuted).toLocaleString()
                      : "Never"}
                  </TableCell>
                  <TableCell align="center">{rule.executionCount}</TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.isEnabled}
                          onChange={() => handleToggleRule(rule.id)}
                          color="primary"
                        />
                      }
                      label={rule.isEnabled ? "Active" : "Disabled"}
                      labelPlacement="start"
                      sx={{ m: 0 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <Tooltip title="Edit Rule">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenRuleDialog(rule)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate Rule">
                        <IconButton size="small">
                          <DuplicateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Rule">
                        <IconButton size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Test Rule">
                        <IconButton size="small" disabled={!rule.isEnabled}>
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Rule Dialog - just showing placeholder for now since full implementation would be complex */}
      <Dialog
        open={openRuleDialog}
        onClose={handleCloseRuleDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRule ? "Edit Rule" : "Create New Rule"}
          <IconButton
            aria-label="close"
            onClick={handleCloseRuleDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1">
            This dialog would contain a multi-step form for creating or editing
            automation rules, including fields for basic information, trigger
            configuration, condition builder, and action selection. For brevity,
            it's not fully implemented in this example.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRuleDialog}>Cancel</Button>
          <Button variant="contained" color="primary">
            {selectedRule ? "Save Changes" : "Create Rule"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AutomationRulesManager;
