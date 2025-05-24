import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Paper,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Code as CodeIcon,
  Notifications as NotificationIcon,
  Webhook as WebhookIcon,
  Timer as TimerIcon,
  HelpOutline as HelpIcon,
  Check as CheckIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Search as SearchIcon,
  Cloud as CloudIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import { PlaybookStep } from "../../../services/api/soarApiService";

interface PlaybookToolboxProps {
  onAddStep: (
    step: Partial<PlaybookStep>,
    position?: { x: number; y: number }
  ) => void;
}

// Step template types
interface StepTemplate {
  name: string;
  type: string;
  icon: React.ReactNode;
  description: string;
  config: any;
  category: string;
}

/**
 * PlaybookToolbox Component
 *
 * Sidebar with step templates for drag-and-drop onto the playbook canvas
 */
const PlaybookToolbox: React.FC<PlaybookToolboxProps> = ({ onAddStep }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["actions", "conditions"])
  );

  // Define step templates by category
  const stepTemplates: Record<string, StepTemplate[]> = {
    actions: [
      {
        name: "Execute Command",
        type: "action",
        icon: <CodeIcon />,
        description: "Run a command on a target system",
        config: {
          command: "",
          target: "",
          timeout: 60,
        },
        category: "actions",
      },
      {
        name: "Send Email",
        type: "action",
        icon: <EmailIcon />,
        description: "Send an email notification",
        config: {
          to: "",
          subject: "",
          body: "",
          attachments: [],
        },
        category: "actions",
      },
      {
        name: "Create Ticket",
        type: "action",
        icon: <AddIcon />,
        description: "Create a ticket in ticketing system",
        config: {
          title: "",
          description: "",
          priority: "medium",
          assignee: "",
        },
        category: "actions",
      },
      {
        name: "Block IP",
        type: "action",
        icon: <SecurityIcon />,
        description: "Block an IP address in the firewall",
        config: {
          ipAddress: "",
          duration: "permanent",
          reason: "",
        },
        category: "actions",
      },
      {
        name: "Query Database",
        type: "action",
        icon: <StorageIcon />,
        description: "Run a query against a database",
        config: {
          connection: "",
          query: "",
          parameters: {},
        },
        category: "actions",
      },
    ],
    conditions: [
      {
        name: "Check Condition",
        type: "condition",
        icon: <CheckIcon />,
        description: "Branch based on a condition",
        config: {
          condition: "",
          trueLabel: "True",
          falseLabel: "False",
        },
        category: "conditions",
      },
      {
        name: "Filter Events",
        type: "condition",
        icon: <SearchIcon />,
        description: "Filter events based on criteria",
        config: {
          field: "",
          operator: "equals",
          value: "",
        },
        category: "conditions",
      },
    ],
    integrations: [
      {
        name: "API Call",
        type: "integration",
        icon: <CloudIcon />,
        description: "Make an API call to external service",
        config: {
          url: "",
          method: "GET",
          headers: {},
          body: "",
          auth: {
            type: "none",
          },
        },
        category: "integrations",
      },
      {
        name: "SIEM Integration",
        type: "integration",
        icon: <SecurityIcon />,
        description: "Interact with SIEM platform",
        config: {
          platform: "",
          action: "",
          parameters: {},
        },
        category: "integrations",
      },
    ],
    notifications: [
      {
        name: "Send Notification",
        type: "notification",
        icon: <NotificationIcon />,
        description: "Send a notification to users or channels",
        config: {
          channel: "",
          message: "",
          level: "info",
        },
        category: "notifications",
      },
      {
        name: "Webhook",
        type: "notification",
        icon: <WebhookIcon />,
        description: "Send data to a webhook endpoint",
        config: {
          url: "",
          payload: {},
          headers: {},
        },
        category: "notifications",
      },
    ],
    timing: [
      {
        name: "Wait",
        type: "wait",
        icon: <TimerIcon />,
        description: "Wait for a specified duration",
        config: {
          duration: 60,
          unit: "seconds",
        },
        category: "timing",
      },
      {
        name: "Schedule",
        type: "wait",
        icon: <TimerIcon />,
        description: "Schedule execution for a specific time",
        config: {
          datetime: "",
          timezone: "UTC",
        },
        category: "timing",
      },
    ],
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, template: StepTemplate) => {
    e.dataTransfer.setData("application/json", JSON.stringify(template));
    e.dataTransfer.effectAllowed = "copy";
  };

  // Filter templates based on search term
  const getFilteredTemplates = () => {
    if (!searchTerm) {
      return stepTemplates;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered: Record<string, StepTemplate[]> = {};

    Object.entries(stepTemplates).forEach(([category, templates]) => {
      const matchingTemplates = templates.filter(
        (template) =>
          template.name.toLowerCase().includes(searchLower) ||
          template.description.toLowerCase().includes(searchLower)
      );

      if (matchingTemplates.length > 0) {
        filtered[category] = matchingTemplates;
      }
    });

    return filtered;
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <Box
      sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}
    >
      <Typography variant="h6" gutterBottom>
        Toolbox
      </Typography>

      {/* Search Box */}
      <TextField
        placeholder="Search steps..."
        size="small"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Categories and Templates */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {Object.entries(filteredTemplates).length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mt: 2 }}
          >
            No items match your search
          </Typography>
        ) : (
          Object.entries(filteredTemplates).map(([category, templates]) => (
            <Box key={category} sx={{ mb: 2 }}>
              {/* Category Header */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  p: 1,
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={() => toggleCategory(category)}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: "medium",
                    flex: 1,
                  }}
                >
                  {category}
                </Typography>
                {expandedCategories.has(category) ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </Box>

              {/* Template Items */}
              <Collapse in={expandedCategories.has(category)}>
                <List disablePadding>
                  {templates.map((template) => (
                    <ListItem
                      key={`${template.category}-${template.name}`}
                      disablePadding
                      sx={{
                        pl: 1,
                        borderRadius: 1,
                        mb: 0.5,
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                        cursor: "grab",
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, template)}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {template.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={template.name}
                        primaryTypographyProps={{ variant: "body2" }}
                        secondary={template.description}
                        secondaryTypographyProps={{
                          variant: "caption",
                          noWrap: true,
                        }}
                      />
                      <Tooltip title="Add to canvas">
                        <IconButton
                          size="small"
                          onClick={() => onAddStep(template)}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))
        )}
      </Box>

      {/* Help Box */}
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          mt: 2,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(0,0,0,0.2)"
              : "rgba(0,0,0,0.03)",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
        >
          <HelpIcon fontSize="small" sx={{ mr: 0.5 }} />
          Quick Help
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Drag and drop items from the toolbox onto the canvas to build your
          playbook. Connect steps by dragging from one step's output to another
          step's input.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PlaybookToolbox;
