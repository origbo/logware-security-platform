import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Add as AddIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  BugReport as BugIcon,
  Cloud as CloudIcon,
  Storage as StorageIcon,
  Computer as ComputerIcon,
  Api as ApiIcon,
  PlayArrow as PlayArrowIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

// Define types for response actions
interface ActionParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  required: boolean;
  default?: any;
}

interface ActionOutput {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
}

interface ResponseAction {
  id: string;
  name: string;
  description: string;
  category: string;
  integration: string;
  parameters: ActionParameter[];
  outputs: ActionOutput[];
  permissionLevel: "basic" | "elevated" | "admin";
  isCustom: boolean;
  createdBy?: string;
  createdAt?: string;
  lastModified?: string;
  usageCount: number;
}

// Mock data for action categories and integrations
const actionCategories = [
  { id: "investigation", name: "Investigation", icon: <SearchIcon /> },
  { id: "containment", name: "Containment", icon: <SecurityIcon /> },
  { id: "eradication", name: "Eradication", icon: <BugIcon /> },
  { id: "remediation", name: "Remediation", icon: <ComputerIcon /> },
  { id: "data_enrichment", name: "Data Enrichment", icon: <StorageIcon /> },
  { id: "notification", name: "Notification", icon: <ApiIcon /> },
  { id: "custom", name: "Custom Actions", icon: <CodeIcon /> },
];

const integrations = [
  { id: "azure_sentinel", name: "Azure Sentinel", vendor: "Microsoft" },
  { id: "crowdstrike", name: "CrowdStrike Falcon", vendor: "CrowdStrike" },
  { id: "splunk", name: "Splunk", vendor: "Splunk" },
  { id: "elastic", name: "Elastic Security", vendor: "Elastic" },
  { id: "aws_security_hub", name: "AWS Security Hub", vendor: "Amazon" },
  { id: "gcp_security", name: "GCP Security Command Center", vendor: "Google" },
  { id: "virustotal", name: "VirusTotal", vendor: "Google" },
  { id: "jira", name: "Jira", vendor: "Atlassian" },
  { id: "servicenow", name: "ServiceNow", vendor: "ServiceNow" },
];

// Mock data for response actions
const mockActions: ResponseAction[] = [
  {
    id: "action1",
    name: "Isolate Endpoint",
    description:
      "Isolate an endpoint from the network to prevent lateral movement",
    category: "containment",
    integration: "crowdstrike",
    parameters: [
      {
        name: "deviceId",
        type: "string",
        description: "CrowdStrike device ID",
        required: true,
      },
      {
        name: "isolationType",
        type: "string",
        description: "Type of isolation (full, network)",
        required: false,
        default: "full",
      },
    ],
    outputs: [
      {
        name: "success",
        type: "boolean",
        description: "Whether the isolation was successful",
      },
      {
        name: "requestId",
        type: "string",
        description: "Request ID for the isolation action",
      },
    ],
    permissionLevel: "admin",
    isCustom: false,
    usageCount: 45,
  },
  {
    id: "action2",
    name: "Get Process Details",
    description: "Retrieve details about a running process on an endpoint",
    category: "investigation",
    integration: "crowdstrike",
    parameters: [
      {
        name: "deviceId",
        type: "string",
        description: "CrowdStrike device ID",
        required: true,
      },
      {
        name: "processId",
        type: "string",
        description: "Process ID to investigate",
        required: true,
      },
    ],
    outputs: [
      {
        name: "processInfo",
        type: "object",
        description:
          "Process information including name, path, args, parent, user",
      },
    ],
    permissionLevel: "basic",
    isCustom: false,
    usageCount: 122,
  },
  {
    id: "action3",
    name: "Block IP Address",
    description: "Block an IP address at the firewall level",
    category: "containment",
    integration: "azure_sentinel",
    parameters: [
      {
        name: "ipAddress",
        type: "string",
        description: "IP address to block",
        required: true,
      },
      {
        name: "duration",
        type: "number",
        description: "Duration in hours (0 for permanent)",
        required: false,
        default: 24,
      },
      {
        name: "direction",
        type: "string",
        description: "Traffic direction (inbound, outbound, both)",
        required: false,
        default: "both",
      },
    ],
    outputs: [
      {
        name: "success",
        type: "boolean",
        description: "Whether the block was successful",
      },
      {
        name: "ruleId",
        type: "string",
        description: "ID of the created firewall rule",
      },
    ],
    permissionLevel: "elevated",
    isCustom: false,
    usageCount: 67,
  },
  {
    id: "action4",
    name: "Create Jira Ticket",
    description: "Create a Jira ticket for tracking security incidents",
    category: "notification",
    integration: "jira",
    parameters: [
      {
        name: "project",
        type: "string",
        description: "Jira project key",
        required: true,
      },
      {
        name: "summary",
        type: "string",
        description: "Ticket summary",
        required: true,
      },
      {
        name: "description",
        type: "string",
        description: "Detailed description",
        required: true,
      },
      {
        name: "issueType",
        type: "string",
        description: "Type of issue",
        required: false,
        default: "Task",
      },
      {
        name: "priority",
        type: "string",
        description: "Ticket priority",
        required: false,
        default: "Medium",
      },
    ],
    outputs: [
      {
        name: "ticketId",
        type: "string",
        description: "Created Jira ticket ID",
      },
      {
        name: "ticketUrl",
        type: "string",
        description: "URL to the created Jira ticket",
      },
    ],
    permissionLevel: "basic",
    isCustom: false,
    usageCount: 89,
  },
  {
    id: "action5",
    name: "Enrich IP with Threat Intel",
    description: "Enrich IP address with threat intelligence data",
    category: "data_enrichment",
    integration: "virustotal",
    parameters: [
      {
        name: "ipAddress",
        type: "string",
        description: "IP address to enrich",
        required: true,
      },
    ],
    outputs: [
      {
        name: "malicious",
        type: "boolean",
        description: "Whether the IP is considered malicious",
      },
      {
        name: "score",
        type: "number",
        description: "Maliciousness score (0-100)",
      },
      {
        name: "lastSeen",
        type: "string",
        description: "When the IP was last seen in malicious activity",
      },
      {
        name: "categories",
        type: "array",
        description: "Categories associated with this IP",
      },
    ],
    permissionLevel: "basic",
    isCustom: false,
    usageCount: 156,
  },
  {
    id: "action6",
    name: "Custom Log Parser",
    description: "Custom action to parse specific log formats and extract IOCs",
    category: "custom",
    integration: "custom",
    parameters: [
      {
        name: "logContent",
        type: "string",
        description: "Raw log content to parse",
        required: true,
      },
      {
        name: "logType",
        type: "string",
        description: "Type of log (firewall, web, email)",
        required: true,
      },
      {
        name: "extractionPatterns",
        type: "array",
        description: "Regex patterns for extraction",
        required: false,
      },
    ],
    outputs: [
      {
        name: "extractedIPs",
        type: "array",
        description: "Extracted IP addresses",
      },
      {
        name: "extractedDomains",
        type: "array",
        description: "Extracted domains",
      },
      {
        name: "extractedHashes",
        type: "array",
        description: "Extracted file hashes",
      },
    ],
    permissionLevel: "elevated",
    isCustom: true,
    createdBy: "admin",
    createdAt: "2025-04-15T10:30:00Z",
    lastModified: "2025-05-02T14:45:00Z",
    usageCount: 32,
  },
];

const ResponseActionsLibrary: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actions, setActions] = useState<ResponseAction[]>(mockActions);
  const [selectedAction, setSelectedAction] = useState<ResponseAction | null>(
    null
  );
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [openTestDialog, setOpenTestDialog] = useState(false);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter actions based on category and search term
  const filteredActions = actions.filter((action) => {
    // Apply category filter
    if (selectedCategory !== "all" && action.category !== selectedCategory) {
      return false;
    }

    // Apply search term
    if (
      searchTerm &&
      !action.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !action.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Handle selecting an action
  const handleSelectAction = (action: ResponseAction) => {
    setSelectedAction(action);
    setOpenActionDialog(true);
  };

  // Handle testing an action
  const handleTestAction = (action: ResponseAction) => {
    setSelectedAction(action);
    setOpenTestDialog(true);
  };

  // Close dialogs
  const handleCloseDialog = () => {
    setOpenActionDialog(false);
    setOpenTestDialog(false);
    setSelectedAction(null);
  };

  // Map permission level to user-friendly text and color
  const getPermissionDisplay = (level: string) => {
    switch (level) {
      case "admin":
        return { text: "Admin", color: theme.palette.error.main };
      case "elevated":
        return { text: "Elevated", color: theme.palette.warning.main };
      case "basic":
        return { text: "Basic", color: theme.palette.info.main };
      default:
        return { text: level, color: theme.palette.text.secondary };
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
        <Typography variant="h4">Response Actions Library</Typography>

        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          Create Custom Action
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Action Catalog" />
          <Tab label="Integrations" />
          <Tab label="Custom Development" />
        </Tabs>
      </Paper>

      {/* Action Catalog Tab */}
      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Action Categories Sidebar */}
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Categories
                </Typography>
                <List disablePadding>
                  <ListItem
                    button
                    selected={selectedCategory === "all"}
                    onClick={() => setSelectedCategory("all")}
                  >
                    <ListItemIcon>
                      <FilterIcon />
                    </ListItemIcon>
                    <ListItemText primary="All Actions" />
                    <Chip
                      label={actions.length}
                      size="small"
                      color={selectedCategory === "all" ? "primary" : "default"}
                    />
                  </ListItem>

                  {actionCategories.map((category) => (
                    <ListItem
                      button
                      key={category.id}
                      selected={selectedCategory === category.id}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <ListItemIcon>{category.icon}</ListItemIcon>
                      <ListItemText primary={category.name} />
                      <Chip
                        label={
                          actions.filter(
                            (action) => action.category === category.id
                          ).length
                        }
                        size="small"
                        color={
                          selectedCategory === category.id
                            ? "primary"
                            : "default"
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Action List */}
            <Grid item xs={12} md={9}>
              <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search actions..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Paper>

              {filteredActions.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body1" color="textSecondary">
                    No actions found matching your criteria.
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Action Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Integration</TableCell>
                        <TableCell>Permission</TableCell>
                        <TableCell>Usage Count</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredActions.map((action) => (
                        <TableRow key={action.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {action.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {action.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {actionCategories.find(
                              (cat) => cat.id === action.category
                            )?.name || action.category}
                          </TableCell>
                          <TableCell>
                            {integrations.find(
                              (int) => int.id === action.integration
                            )?.name || action.integration}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                getPermissionDisplay(action.permissionLevel)
                                  .text
                              }
                              style={{
                                backgroundColor: `${
                                  getPermissionDisplay(action.permissionLevel)
                                    .color
                                }20`,
                                color: getPermissionDisplay(
                                  action.permissionLevel
                                ).color,
                                fontWeight: "medium",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {action.usageCount}
                          </TableCell>
                          <TableCell align="center">
                            <Box
                              sx={{ display: "flex", justifyContent: "center" }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleSelectAction(action)}
                                title="View Details"
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleTestAction(action)}
                                title="Test Action"
                              >
                                <PlayArrowIcon fontSize="small" />
                              </IconButton>
                              {action.isCustom && (
                                <IconButton size="small" title="Edit Action">
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Integrations Tab - Placeholder */}
      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Integrations
            </Typography>
            <Typography variant="body1" color="textSecondary">
              This tab would display all available integrations with their
              connection status, authentication details, and capabilities. Users
              could configure and test integrations here.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              {integrations.slice(0, 4).map((integration) => (
                <Grid item xs={12} sm={6} md={3} key={integration.id}>
                  <Card>
                    <CardHeader
                      title={integration.name}
                      subheader={`by ${integration.vendor}`}
                    />
                    <CardContent>
                      <Chip
                        label="Connected"
                        color="success"
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        {integration.id === "crowdstrike"
                          ? "12 available actions"
                          : integration.id === "azure_sentinel"
                          ? "15 available actions"
                          : integration.id === "virustotal"
                          ? "4 available actions"
                          : "8 available actions"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Custom Development Tab - Placeholder */}
      <Box role="tabpanel" hidden={tabValue !== 2}>
        {tabValue === 2 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Custom Action Development
            </Typography>
            <Typography variant="body1" color="textSecondary">
              This tab would provide tools for creating, testing, and validating
              custom actions. Users could write action code, define parameters
              and outputs, and test functionality before publishing to the
              action library.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Action Details Dialog */}
      <Dialog
        open={openActionDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedAction && (
          <>
            <DialogTitle>
              {selectedAction.name}
              {selectedAction.isCustom && (
                <Chip
                  label="Custom"
                  color="primary"
                  size="small"
                  sx={{ ml: 1 }}
                />
              )}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" paragraph>
                {selectedAction.description}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Basic Information
                  </Typography>
                  <Box
                    component="dl"
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr",
                      rowGap: 2,
                    }}
                  >
                    <Typography
                      component="dt"
                      variant="body2"
                      color="textSecondary"
                    >
                      Category:
                    </Typography>
                    <Typography component="dd" variant="body2">
                      {actionCategories.find(
                        (cat) => cat.id === selectedAction.category
                      )?.name || selectedAction.category}
                    </Typography>

                    <Typography
                      component="dt"
                      variant="body2"
                      color="textSecondary"
                    >
                      Integration:
                    </Typography>
                    <Typography component="dd" variant="body2">
                      {integrations.find(
                        (int) => int.id === selectedAction.integration
                      )?.name || selectedAction.integration}
                    </Typography>

                    <Typography
                      component="dt"
                      variant="body2"
                      color="textSecondary"
                    >
                      Permission Level:
                    </Typography>
                    <Typography component="dd" variant="body2">
                      <Chip
                        size="small"
                        label={
                          getPermissionDisplay(selectedAction.permissionLevel)
                            .text
                        }
                        style={{
                          backgroundColor: `${
                            getPermissionDisplay(selectedAction.permissionLevel)
                              .color
                          }20`,
                          color: getPermissionDisplay(
                            selectedAction.permissionLevel
                          ).color,
                        }}
                      />
                    </Typography>

                    <Typography
                      component="dt"
                      variant="body2"
                      color="textSecondary"
                    >
                      Usage Count:
                    </Typography>
                    <Typography component="dd" variant="body2">
                      {selectedAction.usageCount} times
                    </Typography>

                    {selectedAction.isCustom && (
                      <>
                        <Typography
                          component="dt"
                          variant="body2"
                          color="textSecondary"
                        >
                          Created By:
                        </Typography>
                        <Typography component="dd" variant="body2">
                          {selectedAction.createdBy}
                        </Typography>

                        <Typography
                          component="dt"
                          variant="body2"
                          color="textSecondary"
                        >
                          Last Modified:
                        </Typography>
                        <Typography component="dd" variant="body2">
                          {selectedAction.lastModified
                            ? new Date(
                                selectedAction.lastModified
                              ).toLocaleString()
                            : "Unknown"}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Parameters
                  </Typography>
                  {selectedAction.parameters.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                      No parameters required
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Required</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedAction.parameters.map((param) => (
                            <TableRow key={param.name}>
                              <TableCell>{param.name}</TableCell>
                              <TableCell>{param.type}</TableCell>
                              <TableCell>
                                {param.required ? "Yes" : "No"}
                              </TableCell>
                              <TableCell>{param.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}

                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Outputs
                  </Typography>
                  {selectedAction.outputs.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                      No outputs defined
                    </Typography>
                  ) : (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedAction.outputs.map((output) => (
                            <TableRow key={output.name}>
                              <TableCell>{output.name}</TableCell>
                              <TableCell>{output.type}</TableCell>
                              <TableCell>{output.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<PlayArrowIcon />}
                onClick={() => {
                  handleCloseDialog();
                  handleTestAction(selectedAction);
                }}
              >
                Test Action
              </Button>
              {selectedAction.isCustom && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                >
                  Edit Action
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Test Action Dialog - Simplified */}
      <Dialog
        open={openTestDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedAction && (
          <>
            <DialogTitle>Test Action: {selectedAction.name}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" paragraph>
                This dialog would provide a form to test the action with sample
                inputs. Users could execute the action in a test environment and
                view the results.
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Input Parameters
              </Typography>
              {selectedAction.parameters.map((param) => (
                <TextField
                  key={param.name}
                  label={`${param.name}${param.required ? " *" : ""}`}
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  size="small"
                  helperText={param.description}
                  defaultValue={param.default || ""}
                />
              ))}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Test Results
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  minHeight: 100,
                  fontFamily: "monospace",
                }}
              >
                <Typography
                  variant="body2"
                  color="textSecondary"
                  fontFamily="monospace"
                >
                  // Test results will appear here after execution
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="contained" color="primary">
                Run Test
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ResponseActionsLibrary;
