import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Avatar,
  TextField,
  Chip,
  Badge,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  CircularProgress,
  Menu,
  MenuItem,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Send as SendIcon,
  PeopleAlt as PeopleIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Check as CheckIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Timeline as TimelineIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Add as AddIcon,
  VideoCall as VideoCallIcon,
  ScreenShare as ScreenShareIcon,
  ArrowRight as ArrowRightIcon,
} from "@mui/icons-material";

// Types for our collaborative response components
interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: "online" | "away" | "offline";
  lastActive?: string;
}

interface Message {
  id: string;
  caseId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  isAction?: boolean;
}

interface Attachment {
  id: string;
  type: "file" | "image" | "link";
  name: string;
  url: string;
  size?: number;
  preview?: string;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Task {
  id: string;
  caseId: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  assignedBy: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  comments?: TaskComment[];
}

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
}

interface CollaborationSession {
  id: string;
  caseId: string;
  title: string;
  description: string;
  createdAt: string;
  createdBy: string;
  participants: User[];
  status: "scheduled" | "active" | "completed";
  scheduledTime?: string;
  endTime?: string;
  sessionType: "war-room" | "daily-sync" | "post-mortem";
}

// Mock data
const mockUsers: User[] = [
  {
    id: "user1",
    name: "Alex Johnson",
    avatar: "/avatars/alex.jpg",
    role: "SOC Analyst",
    status: "online",
  },
  {
    id: "user2",
    name: "Maria Garcia",
    avatar: "/avatars/maria.jpg",
    role: "Incident Handler",
    status: "online",
  },
  {
    id: "user3",
    name: "David Kim",
    avatar: "/avatars/david.jpg",
    role: "Threat Hunter",
    status: "away",
  },
  {
    id: "user4",
    name: "Sarah Williams",
    avatar: "/avatars/sarah.jpg",
    role: "Security Engineer",
    status: "offline",
    lastActive: "2025-05-18T15:30:00Z",
  },
  {
    id: "user5",
    name: "James Lee",
    avatar: "/avatars/james.jpg",
    role: "SOC Manager",
    status: "online",
  },
];

const mockMessages: Message[] = [
  {
    id: "msg1",
    caseId: "case-123",
    userId: "user2",
    userName: "Maria Garcia",
    userAvatar: "/avatars/maria.jpg",
    content:
      "I just started investigating the suspicious network traffic from the sales department.",
    timestamp: "2025-05-19T07:45:00Z",
  },
  {
    id: "msg2",
    caseId: "case-123",
    userId: "user1",
    userName: "Alex Johnson",
    userAvatar: "/avatars/alex.jpg",
    content:
      "I can help analyze the endpoint logs. Have you checked if we have any alerts from EDR?",
    timestamp: "2025-05-19T07:47:00Z",
  },
  {
    id: "msg3",
    caseId: "case-123",
    userId: "user2",
    userName: "Maria Garcia",
    userAvatar: "/avatars/maria.jpg",
    content: "Yes, found 3 alerts from CrowdStrike. Here's the report:",
    timestamp: "2025-05-19T07:50:00Z",
    attachments: [
      {
        id: "att1",
        type: "file",
        name: "crowdstrike-alerts.pdf",
        url: "/files/crowdstrike-alerts.pdf",
        size: 2560000,
      },
    ],
  },
  {
    id: "msg4",
    caseId: "case-123",
    userId: "system",
    userName: "System",
    userAvatar: "/avatars/system.jpg",
    content: 'Maria Garcia has run automated playbook "EDR Alert Triage"',
    timestamp: "2025-05-19T07:55:00Z",
    isAction: true,
  },
];

const mockTasks: Task[] = [
  {
    id: "task1",
    caseId: "case-123",
    title: "Analyze suspicious network connections",
    description:
      "Review all outbound connections from host SALES-PC-23 in the last 24 hours.",
    status: "in-progress",
    priority: "high",
    assignedTo: "user2",
    assignedBy: "user5",
    createdAt: "2025-05-19T07:30:00Z",
    dueDate: "2025-05-19T11:30:00Z",
  },
  {
    id: "task2",
    caseId: "case-123",
    title: "Examine endpoint logs",
    description:
      "Check EDR logs for unusual process executions on SALES-PC-23.",
    status: "pending",
    priority: "high",
    assignedTo: "user1",
    assignedBy: "user5",
    createdAt: "2025-05-19T07:35:00Z",
    dueDate: "2025-05-19T12:00:00Z",
  },
  {
    id: "task3",
    caseId: "case-123",
    title: "Collect memory dump",
    description:
      "Get a memory dump from the affected system for forensic analysis.",
    status: "pending",
    priority: "medium",
    assignedTo: "user3",
    assignedBy: "user5",
    createdAt: "2025-05-19T07:40:00Z",
    dueDate: "2025-05-19T16:00:00Z",
  },
];

const mockSessions: CollaborationSession[] = [
  {
    id: "session1",
    caseId: "case-123",
    title: "Sales Department Incident War Room",
    description:
      "Coordination room for the ongoing incident in the Sales department.",
    createdAt: "2025-05-19T07:30:00Z",
    createdBy: "user5",
    participants: mockUsers,
    status: "active",
    sessionType: "war-room",
  },
];

const CollaborativeResponseHub: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [sessions, setSessions] =
    useState<CollaborationSession[]>(mockSessions);
  const [activeUsers, setActiveUsers] = useState<User[]>(mockUsers);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: `msg${messages.length + 1}`,
        caseId: "case-123",
        userId: "user1", // Current user ID
        userName: "Alex Johnson", // Current user name
        userAvatar: "/avatars/alex.jpg", // Current user avatar
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  // Handle pressing Enter to send a message
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Handle attachment menu
  const handleAttachmentMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleAttachmentMenuClose = () => {
    setMenuAnchorEl(null);
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in-progress":
        return theme.palette.warning.main;
      case "completed":
        return theme.palette.success.main;
      case "blocked":
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
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
        <Typography variant="h4">Collaborative Response</Typography>

        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<VideoCallIcon />}
            sx={{ mr: 2 }}
          >
            Start Video Call
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />}>
            New Session
          </Button>
        </Box>
      </Box>

      {/* Active Session Banner */}
      <Alert
        severity="info"
        sx={{
          mb: 3,
          borderLeft: `4px solid ${theme.palette.info.main}`,
        }}
      >
        <AlertTitle>Active Session: {sessions[0].title}</AlertTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2">
            Started at {new Date(sessions[0].createdAt).toLocaleString()} •
            {sessions[0].participants.length} participants • Session type:{" "}
            {sessions[0].sessionType.replace("-", " ")}
          </Typography>
          <Button size="small" color="info" endIcon={<ArrowRightIcon />}>
            Session Details
          </Button>
        </Box>
      </Alert>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Chat and Tabs */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{ height: "70vh", display: "flex", flexDirection: "column" }}
          >
            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab icon={<ChatIcon />} iconPosition="start" label="Chat" />
              <Tab
                icon={<AssignmentIcon />}
                iconPosition="start"
                label="Tasks"
              />
              <Tab
                icon={<TimelineIcon />}
                iconPosition="start"
                label="Timeline"
              />
            </Tabs>

            {/* Chat Tab */}
            <Box
              role="tabpanel"
              hidden={tabValue !== 0}
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                height: tabValue === 0 ? "auto" : 0,
                overflow: "hidden",
              }}
            >
              {tabValue === 0 && (
                <>
                  {/* Messages Container */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflowY: "auto",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {messages.map((message) => (
                      <Box
                        key={message.id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignSelf:
                            message.userId === "user1"
                              ? "flex-end"
                              : "flex-start",
                          maxWidth: "75%",
                          ...(message.isAction && {
                            alignSelf: "center",
                            maxWidth: "100%",
                            backgroundColor: alpha(
                              theme.palette.grey[500],
                              0.1
                            ),
                            borderRadius: 1,
                            px: 2,
                            py: 1,
                          }),
                        }}
                      >
                        {!message.isAction && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <Avatar
                              src={message.userAvatar}
                              alt={message.userName}
                              sx={{ width: 24, height: 24, mr: 1 }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {message.userName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ ml: 1 }}
                            >
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        )}

                        <Paper
                          sx={{
                            p: 2,
                            backgroundColor:
                              message.userId === "user1"
                                ? alpha(theme.palette.primary.main, 0.1)
                                : message.isAction
                                ? "transparent"
                                : alpha(theme.palette.grey[500], 0.1),
                            borderRadius: 2,
                            boxShadow: message.isAction ? "none" : 1,
                          }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>

                          {/* Attachments */}
                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                {message.attachments.map((attachment) => (
                                  <Box
                                    key={attachment.id}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      p: 1,
                                      borderRadius: 1,
                                      backgroundColor: alpha(
                                        theme.palette.background.paper,
                                        0.5
                                      ),
                                    }}
                                  >
                                    <InsertDriveFileIcon sx={{ mr: 1 }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                      <Typography variant="body2">
                                        {attachment.name}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="textSecondary"
                                      >
                                        {attachment.size
                                          ? `${Math.round(
                                              attachment.size / 1024
                                            )} KB`
                                          : ""}
                                      </Typography>
                                    </Box>
                                    <Button size="small">View</Button>
                                  </Box>
                                ))}
                              </Box>
                            )}
                        </Paper>
                      </Box>
                    ))}
                  </Box>

                  {/* Message Input */}
                  <Box
                    sx={{
                      p: 2,
                      borderTop: 1,
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      color="primary"
                      onClick={handleAttachmentMenuOpen}
                    >
                      <AttachFileIcon />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl)}
                      onClose={handleAttachmentMenuClose}
                    >
                      <MenuItem onClick={handleAttachmentMenuClose}>
                        <ListItemIcon>
                          <InsertDriveFileIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Upload File" />
                      </MenuItem>
                      <MenuItem onClick={handleAttachmentMenuClose}>
                        <ListItemIcon>
                          <ImageIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Upload Image" />
                      </MenuItem>
                      <MenuItem onClick={handleAttachmentMenuClose}>
                        <ListItemIcon>
                          <LinkIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Add Link" />
                      </MenuItem>
                      <MenuItem onClick={handleAttachmentMenuClose}>
                        <ListItemIcon>
                          <ScreenShareIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Share Screen" />
                      </MenuItem>
                    </Menu>

                    <TextField
                      fullWidth
                      placeholder="Type your message..."
                      variant="outlined"
                      size="small"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      sx={{ mx: 2 }}
                    />

                    <IconButton
                      color="primary"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </Box>

            {/* Tasks Tab */}
            <Box
              role="tabpanel"
              hidden={tabValue !== 1}
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                p: 0,
                height: tabValue === 1 ? "auto" : 0,
                overflow: "hidden",
              }}
            >
              {tabValue === 1 && (
                <List sx={{ width: "100%" }}>
                  {tasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemIcon>
                          <Checkbox
                            checked={task.status === "completed"}
                            onChange={() => {}} // Would handle task status update
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              sx={{
                                textDecoration:
                                  task.status === "completed"
                                    ? "line-through"
                                    : "none",
                              }}
                            >
                              {task.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                {task.description}
                              </Typography>
                              <Box
                                sx={{
                                  mt: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Chip
                                  size="small"
                                  label={task.priority}
                                  sx={{
                                    backgroundColor: alpha(
                                      getPriorityColor(task.priority),
                                      0.1
                                    ),
                                    color: getPriorityColor(task.priority),
                                  }}
                                />
                                <Chip
                                  size="small"
                                  label={task.status}
                                  sx={{
                                    backgroundColor: alpha(
                                      getStatusColor(task.status),
                                      0.1
                                    ),
                                    color: getStatusColor(task.status),
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  Due:{" "}
                                  {new Date(
                                    task.dueDate || ""
                                  ).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip
                            title={`Assigned to ${
                              mockUsers.find((u) => u.id === task.assignedTo)
                                ?.name || ""
                            }`}
                          >
                            <Avatar
                              src={
                                mockUsers.find((u) => u.id === task.assignedTo)
                                  ?.avatar || ""
                              }
                              sx={{ width: 32, height: 32 }}
                            />
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>

            {/* Timeline Tab */}
            <Box
              role="tabpanel"
              hidden={tabValue !== 2}
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                p: 2,
                height: tabValue === 2 ? "auto" : 0,
                overflow: "hidden",
              }}
            >
              {tabValue === 2 && (
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      position: "absolute",
                      left: 16,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      backgroundColor: theme.palette.divider,
                    }}
                  />

                  {/* This would be a more complex timeline component */}
                  <Typography sx={{ ml: 5, mb: 3 }}>
                    Timeline content would go here
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right Column - Participants and Resources */}
        <Grid item xs={12} md={4}>
          {/* Participants Card */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title="Participants"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <List sx={{ maxHeight: "30vh", overflow: "auto" }}>
              {activeUsers.map((user) => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      variant="dot"
                      color={
                        user.status === "online"
                          ? "success"
                          : user.status === "away"
                          ? "warning"
                          : "default"
                      }
                    >
                      <Avatar src={user.avatar} alt={user.name} />
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText primary={user.name} secondary={user.role} />
                  <ListItemSecondaryAction>
                    <IconButton size="small">
                      <ChatIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Card>

          {/* Case Resources Card */}
          <Card>
            <CardHeader
              title="Case Resources"
              action={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Typography variant="body2" color="textSecondary" paragraph>
                Key resources for this incident.
              </Typography>

              <List disablePadding>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <InsertDriveFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Incident Playbook"
                    secondary="Standard procedure for this type of incident"
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <InsertDriveFileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Network Diagram"
                    secondary="Sales department network"
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <LinkIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="MITRE ATT&CK"
                    secondary="Reference for tactics and techniques"
                  />
                </ListItem>
              </List>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                size="small"
                sx={{ mt: 2 }}
              >
                Add Resource
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// For internal components
interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange }) => {
  return (
    <IconButton
      edge="start"
      onClick={onChange}
      color={checked ? "primary" : "default"}
      sx={{ p: 1 }}
    >
      {checked ? (
        <CheckIcon />
      ) : (
        <div
          style={{
            width: 24,
            height: 24,
            border: "1px solid rgba(0,0,0,0.2)",
            borderRadius: "4px",
          }}
        />
      )}
    </IconButton>
  );
};

export default CollaborativeResponseHub;
