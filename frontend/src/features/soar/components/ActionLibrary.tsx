/**
 * ActionLibrary Component
 *
 * Displays a library of available actions that can be added to playbooks.
 * Provides filtering, searching, and detailed information on each action.
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Search as SearchIcon,
  Code as CodeIcon,
  Webhook as WebhookIcon,
  Notifications as NotificationIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Email as EmailIcon,
  Cloud as CloudIcon,
  Add as AddIcon,
  Info as InfoIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { ActionTemplate } from "../types/soarTypes";

interface ActionLibraryProps {
  onSelectAction: (action: ActionTemplate) => void;
  category?: string;
}

/**
 * ActionLibrary Component
 */
const ActionLibrary: React.FC<ActionLibraryProps> = ({
  onSelectAction,
  category,
}) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    category || "all"
  );
  const [selectedAction, setSelectedAction] = useState<ActionTemplate | null>(
    null
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<ActionTemplate[]>([]);

  // Example action categories
  const categories = [
    { id: "all", label: "All" },
    { id: "system", label: "System" },
    { id: "security", label: "Security" },
    { id: "networking", label: "Networking" },
    { id: "notification", label: "Notification" },
    { id: "data", label: "Data" },
    { id: "cloud", label: "Cloud" },
    { id: "custom", label: "Custom" },
  ];

  // Example actions for the library
  const exampleActions: ActionTemplate[] = [
    {
      id: "run-command",
      name: "Run Command",
      description: "Execute a command on a target system",
      category: "system",
      parameters: [
        {
          name: "command",
          type: "string",
          required: true,
          description: "The command to execute",
        },
        {
          name: "target",
          type: "string",
          required: true,
          description: "The target system",
        },
        {
          name: "timeout",
          type: "number",
          required: false,
          default: 60,
          description: "Timeout in seconds",
        },
      ],
    },
    {
      id: "block-ip",
      name: "Block IP Address",
      description: "Block an IP address in the firewall",
      category: "security",
      parameters: [
        {
          name: "ipAddress",
          type: "string",
          required: true,
          description: "The IP address to block",
        },
        {
          name: "duration",
          type: "string",
          required: false,
          default: "permanent",
          description: "Duration of the block",
        },
      ],
    },
    {
      id: "send-email",
      name: "Send Email",
      description: "Send an email notification",
      category: "notification",
      parameters: [
        {
          name: "to",
          type: "string",
          required: true,
          description: "Recipient email address",
        },
        {
          name: "subject",
          type: "string",
          required: true,
          description: "Email subject",
        },
        {
          name: "body",
          type: "string",
          required: true,
          description: "Email body content",
        },
      ],
    },
    {
      id: "query-database",
      name: "Query Database",
      description: "Execute a query against a database",
      category: "data",
      parameters: [
        {
          name: "connection",
          type: "string",
          required: true,
          description: "Database connection string",
        },
        {
          name: "query",
          type: "string",
          required: true,
          description: "SQL query to execute",
        },
      ],
    },
    {
      id: "aws-lambda",
      name: "Invoke AWS Lambda",
      description: "Invoke an AWS Lambda function",
      category: "cloud",
      parameters: [
        {
          name: "functionName",
          type: "string",
          required: true,
          description: "Lambda function name or ARN",
        },
        {
          name: "payload",
          type: "object",
          required: false,
          description: "JSON payload to pass to the function",
        },
      ],
    },
  ];

  // Simulate API call to fetch actions
  useEffect(() => {
    const fetchActions = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setActions(exampleActions);
      setLoading(false);
    };

    fetchActions();
  }, []);

  // Filter actions based on search term and selected category
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      // Filter by category
      if (selectedCategory !== "all" && action.category !== selectedCategory) {
        return false;
      }

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          action.name.toLowerCase().includes(term) ||
          action.description.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [actions, searchTerm, selectedCategory]);

  // Get icon for action category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "system":
        return <CodeIcon />;
      case "security":
        return <SecurityIcon />;
      case "networking":
        return <WebhookIcon />;
      case "notification":
        return <NotificationIcon />;
      case "data":
        return <StorageIcon />;
      case "cloud":
        return <CloudIcon />;
      case "email":
        return <EmailIcon />;
      default:
        return <CodeIcon />;
    }
  };

  // Handle action click
  const handleActionClick = (action: ActionTemplate) => {
    onSelectAction(action);
  };

  // Open action details dialog
  const handleViewDetails = (action: ActionTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAction(action);
    setDetailsOpen(true);
  };

  // Handle category change
  const handleCategoryChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setSelectedCategory(newValue);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" gutterBottom>
          Action Library
        </Typography>

        <TextField
          fullWidth
          placeholder="Search actions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            ".MuiTab-root": {
              minWidth: "auto",
              px: 2,
            },
          }}
        >
          {categories.map((category) => (
            <Tab key={category.id} label={category.label} value={category.id} />
          ))}
        </Tabs>
      </Box>

      {/* Action List */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List disablePadding>
            {filteredActions.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  No actions match your search criteria
                </Typography>
              </Box>
            ) : (
              filteredActions.map((action) => (
                <React.Fragment key={action.id}>
                  <ListItem
                    button
                    onClick={() => handleActionClick(action)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      "&:hover": {
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.08)"
                            : "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getCategoryIcon(action.category)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="medium">
                          {action.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {action.description}
                          </Typography>
                          <Chip
                            label={action.category}
                            size="small"
                            sx={{
                              mt: 0.5,
                              height: 24,
                              fontSize: "0.75rem",
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "rgba(0, 0, 0, 0.08)",
                            }}
                          />
                        </>
                      }
                      secondaryTypographyProps={{ component: "div" }}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="View details">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={(e) => handleViewDetails(action, e)}
                        >
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            )}
          </List>
        )}
      </Box>

      {/* Action Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAction && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {getCategoryIcon(selectedAction.category)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedAction.name}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" paragraph>
                {selectedAction.description}
              </Typography>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Parameters:
              </Typography>

              <Paper variant="outlined" sx={{ mt: 1 }}>
                <List dense disablePadding>
                  {selectedAction.parameters.map((param, index) => (
                    <React.Fragment key={param.name}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem sx={{ py: 1 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography variant="body2" fontWeight="medium">
                                {param.name}
                              </Typography>
                              {param.required && (
                                <Chip
                                  label="Required"
                                  size="small"
                                  color="primary"
                                  sx={{
                                    ml: 1,
                                    height: 20,
                                    fontSize: "0.625rem",
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {param.description}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Type: {param.type}
                                {param.default !== undefined && (
                                  <>
                                    , Default: {JSON.stringify(param.default)}
                                  </>
                                )}
                              </Typography>
                            </>
                          }
                          secondaryTypographyProps={{ component: "div" }}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  onSelectAction(selectedAction);
                  setDetailsOpen(false);
                }}
                startIcon={<AddIcon />}
              >
                Add to Playbook
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ActionLibrary;
