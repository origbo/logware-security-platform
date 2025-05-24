/**
 * PlaybookDesignerV2 Component
 *
 * Enhanced visual designer for creating and editing SOAR playbooks.
 * Provides drag-and-drop functionality, connection management, and step configuration.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Tooltip,
  TextField,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Divider,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import {
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  ArrowBack as ArrowBackIcon,
  Publish as PublishIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  CenterFocusStrong as CenterIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  History as HistoryIcon,
  MoreVert as MoreIcon,
  Create as CreateIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// Import SOAR components
import PlaybookToolbox from "./PlaybookToolbox";
import PlaybookCanvas from "./PlaybookCanvas";
import ActionLibrary from "./ActionLibrary";

// Import custom hooks
import { usePlaybooks } from "../hooks/usePlaybooks";

// Import types
import {
  Playbook,
  PlaybookStep,
  StepType,
  PlaybookStatus,
  TriggerType,
} from "../types/soarTypes";
import * as apiTypes from "../../../services/api/soarApiService";
import {
  adaptApiStepToModuleStep,
  adaptModuleStepToApiStep,
  adaptApiPlaybookToModulePlaybook,
  adaptModulePlaybookToApiPlaybook,
} from "../utils/typeAdapters";

// Tab panel component for different sections
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`playbook-tabpanel-${index}`}
      aria-labelledby={`playbook-tab-${index}`}
      style={{ height: "100%", overflow: "auto" }}
      {...other}
    >
      {value === index && <Box sx={{ height: "100%" }}>{children}</Box>}
    </div>
  );
};

/**
 * PlaybookDesignerV2 Component
 */
const PlaybookDesignerV2: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    playbookById,
    createPlaybook,
    updatePlaybook,
    addStep,
    updateStep,
    deleteStep,
    connectSteps,
    disconnectSteps,
    publishPlaybook,
    executePlaybook,
    loading,
    error,
  } = usePlaybooks();

  // State for playbook editor
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [selectedStep, setSelectedStep] = useState<PlaybookStep | null>(null);
  const [zoom, setZoom] = useState(1);
  const [toolboxWidth, setToolboxWidth] = useState(250);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [toolboxOpen, setToolboxOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState(0);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [testRunDialogOpen, setTestRunDialogOpen] = useState(false);
  const [codeViewOpen, setCodeViewOpen] = useState(false);
  const [historyMenuAnchor, setHistoryMenuAnchor] =
    useState<null | HTMLElement>(null);

  // Canvas ref for scrolling and positioning
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize playbook data
  useEffect(() => {
    const initPlaybook = async () => {
      // If ID is provided, fetch existing playbook
      if (id && id !== "new") {
        const existingPlaybook = playbookById(id);
        if (existingPlaybook) {
          setPlaybook(existingPlaybook);
        } else {
          // Create a new playbook if none exists
          createNewPlaybook();
        }
      } else {
        // Create a new playbook
        createNewPlaybook();
      }
    };

    initPlaybook();
  }, [id, playbookById]);

  // Create a new playbook template
  const createNewPlaybook = () => {
    setPlaybook({
      id: uuidv4(),
      name: "New Playbook",
      description: "Describe your playbook",
      status: "draft",
      triggerType: "manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
      owner: "current-user",
      successCount: 0,
      failureCount: 0,
      tags: [],
      category: "general",
      version: "1.0.0",
    });
  };

  // Mark unsaved changes when playbook is modified
  useEffect(() => {
    if (playbook) {
      setUnsavedChanges(true);
    }
  }, [playbook]);

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Handle panel toggles
  const toggleToolbox = () => {
    setToolboxOpen((prev) => !prev);
  };

  const toggleRightPanel = () => {
    setRightPanelOpen((prev) => !prev);
  };

  // Handle right panel tab change
  const handleRightPanelTabChange = (
    event: React.SyntheticEvent,
    newValue: number
  ) => {
    setRightPanelTab(newValue);
  };

  // Handle playbook property changes
  const handlePlaybookPropertyChange = (property: string, value: any) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [property]: value,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Handle adding a new step
  const handleAddStep = (
    stepTemplate: Partial<PlaybookStep>,
    position = { x: 100, y: 100 }
  ) => {
    if (!playbook) return;

    const newStep: PlaybookStep = {
      id: uuidv4(),
      name: stepTemplate.name || "New Step",
      type: (stepTemplate.type as StepType) || "action",
      description: stepTemplate.description || "",
      position: position,
      config: stepTemplate.config || {},
      nextSteps: [],
      status: "idle",
    };

    setPlaybook((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: [...prev.steps, newStep],
        updatedAt: new Date().toISOString(),
      };
    });

    // Select the newly added step
    setSelectedStep(newStep);
  };

  // Handle updating a step
  const handleUpdateStep = (updatedStep: PlaybookStep) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps.map((step) =>
        step.id === updatedStep.id ? updatedStep : step
      );

      return {
        ...prev,
        steps: updatedSteps,
        updatedAt: new Date().toISOString(),
      };
    });

    // Update selected step if it's the one being edited
    if (selectedStep && selectedStep.id === updatedStep.id) {
      setSelectedStep(updatedStep);
    }
  };

  // Handle deleting a step
  const handleDeleteStep = (stepId: string) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return prev;

      // Remove the step
      const updatedSteps = prev.steps.filter((step) => step.id !== stepId);

      // Remove any connections to this step
      updatedSteps.forEach((step) => {
        if (step.nextSteps.includes(stepId)) {
          step.nextSteps = step.nextSteps.filter((id) => id !== stepId);
        }
      });

      return {
        ...prev,
        steps: updatedSteps,
        updatedAt: new Date().toISOString(),
      };
    });

    // Clear selected step if it's the one being deleted
    if (selectedStep && selectedStep.id === stepId) {
      setSelectedStep(null);
    }
  };

  // Handle connecting steps
  const handleConnectSteps = (sourceId: string, targetId: string) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps.map((step) => {
        if (step.id === sourceId && !step.nextSteps.includes(targetId)) {
          return {
            ...step,
            nextSteps: [...step.nextSteps, targetId],
          };
        }
        return step;
      });

      return {
        ...prev,
        steps: updatedSteps,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Handle disconnecting steps
  const handleDisconnectSteps = (sourceId: string, targetId: string) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return prev;

      const updatedSteps = prev.steps.map((step) => {
        if (step.id === sourceId) {
          return {
            ...step,
            nextSteps: step.nextSteps.filter((id) => id !== targetId),
          };
        }
        return step;
      });

      return {
        ...prev,
        steps: updatedSteps,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Handle saving the playbook
  const handleSavePlaybook = async () => {
    if (!playbook) return;

    try {
      if (id === "new") {
        // Create new playbook
        await createPlaybook(playbook);

        // Redirect to the edit page with the new ID
        navigate(`/soar/playbooks/edit/${playbook.id}`, { replace: true });
      } else {
        // Update existing playbook
        await updatePlaybook(playbook);
      }

      setUnsavedChanges(false);
      setSnackbarMessage("Playbook saved successfully");
    } catch (error) {
      console.error("Error saving playbook:", error);
      setSnackbarMessage("Failed to save playbook");
    }
  };

  // Handle publishing the playbook
  const handlePublishPlaybook = async () => {
    if (!playbook) return;

    try {
      await publishPlaybook(playbook.id);

      setPlaybook((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: "active",
          updatedAt: new Date().toISOString(),
        };
      });

      setPublishDialogOpen(false);
      setSnackbarMessage("Playbook published successfully");
    } catch (error) {
      console.error("Error publishing playbook:", error);
      setSnackbarMessage("Failed to publish playbook");
    }
  };

  // Handle test run of the playbook
  const handleTestRunPlaybook = async () => {
    if (!playbook) return;

    try {
      await executePlaybook(playbook.id);

      setTestRunDialogOpen(false);
      setSnackbarMessage("Playbook execution started");
    } catch (error) {
      console.error("Error executing playbook:", error);
      setSnackbarMessage("Failed to execute playbook");
    }
  };

  // Handle navigation back to playbook list
  const handleNavigateBack = () => {
    if (unsavedChanges) {
      // Ask for confirmation
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        navigate("/soar/playbooks");
      }
    } else {
      navigate("/soar/playbooks");
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarMessage(null);
  };

  // Handle history menu
  const handleHistoryMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHistoryMenuAnchor(event.currentTarget);
  };

  const handleHistoryMenuClose = () => {
    setHistoryMenuAnchor(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleNavigateBack}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            {playbook?.name || "New Playbook"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {playbook?.status === "draft" && (
              <Button
                variant="outlined"
                startIcon={<PublishIcon />}
                onClick={() => setPublishDialogOpen(true)}
                sx={{ mr: 1 }}
              >
                Publish
              </Button>
            )}

            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={() => setTestRunDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Test Run
            </Button>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSavePlaybook}
              disabled={!unsavedChanges}
            >
              Save
            </Button>

            <IconButton
              color="inherit"
              onClick={handleHistoryMenuOpen}
              sx={{ ml: 1 }}
            >
              <HistoryIcon />
            </IconButton>

            <IconButton
              color="inherit"
              onClick={() => setCodeViewOpen(true)}
              sx={{ ml: 1 }}
            >
              <CodeIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Toolbox */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={toolboxOpen}
          sx={{
            width: toolboxWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: toolboxWidth,
              position: "relative",
              transition: theme.transitions.create("width"),
              boxSizing: "border-box",
              overflowY: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <Tabs value={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tab label="Steps" />
            <Tab label="Actions" disabled />
          </Tabs>

          <Box sx={{ overflow: "auto", flex: 1 }}>
            <PlaybookToolbox
              onAddStep={(stepTemplate, position) => {
                // Adapt the API step template to the module step format
                const adaptedStep = adaptApiStepToModuleStep(
                  stepTemplate as apiTypes.PlaybookStep
                );
                handleAddStep(adaptedStep, position);
              }}
            />
          </Box>
        </Drawer>

        {/* Canvas */}
        <Box
          ref={canvasRef}
          sx={{
            flex: 1,
            height: "100%",
            position: "relative",
            overflow: "auto",
            bgcolor:
              theme.palette.mode === "dark"
                ? "rgba(0,0,0,0.2)"
                : "rgba(0,0,0,0.03)",
          }}
        >
          {/* Canvas Controls */}
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              zIndex: 10,
              borderRadius: 1,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", p: 0.5 }}>
              <Tooltip title="Zoom In">
                <IconButton size="small" onClick={handleZoomIn}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Reset Zoom">
                <IconButton size="small" onClick={handleResetZoom}>
                  <CenterIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Zoom Out">
                <IconButton size="small" onClick={handleZoomOut}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Canvas Content */}
          {playbook && (
            <PlaybookCanvas
              playbook={adaptApiPlaybookToModulePlaybook(
                playbook as unknown as apiTypes.Playbook
              )}
              zoom={zoom}
              selectedStepId={selectedStep?.id}
              onSelectStep={(step) => {
                if (step) {
                  const adaptedStep = adaptApiStepToModuleStep(
                    step as unknown as apiTypes.PlaybookStep
                  );
                  setSelectedStep(adaptedStep as PlaybookStep);
                } else {
                  setSelectedStep(null);
                }
              }}
              onUpdateStep={(step) => {
                const adaptedStep = adaptModuleStepToApiStep(
                  step as PlaybookStep
                );
                handleUpdateStep(adaptedStep as apiTypes.PlaybookStep);
              }}
              onDeleteStep={handleDeleteStep}
              onConnectSteps={handleConnectSteps}
              onDisconnectSteps={handleDisconnectSteps}
            />
          )}
        </Box>

        {/* Right Panel */}
        <Drawer
          variant="persistent"
          anchor="right"
          open={rightPanelOpen}
          sx={{
            width: rightPanelWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: rightPanelWidth,
              position: "relative",
              boxSizing: "border-box",
              overflowY: "hidden",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <Tabs
            value={rightPanelTab}
            onChange={handleRightPanelTabChange}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Properties" />
            <Tab label="Library" />
            <Tab label="Execution" />
          </Tabs>

          <Box sx={{ flex: 1, overflow: "hidden" }}>
            {/* Properties Tab */}
            <TabPanel value={rightPanelTab} index={0}>
              {playbook && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Playbook Properties
                  </Typography>

                  <TextField
                    fullWidth
                    label="Name"
                    value={playbook.name}
                    onChange={(e) =>
                      handlePlaybookPropertyChange("name", e.target.value)
                    }
                    margin="normal"
                  />

                  <TextField
                    fullWidth
                    label="Description"
                    value={playbook.description}
                    onChange={(e) =>
                      handlePlaybookPropertyChange(
                        "description",
                        e.target.value
                      )
                    }
                    multiline
                    rows={3}
                    margin="normal"
                  />

                  <Divider sx={{ my: 2 }} />

                  {selectedStep ? (
                    <>
                      <Typography variant="h6" gutterBottom>
                        Step Properties
                      </Typography>

                      <TextField
                        fullWidth
                        label="Name"
                        value={selectedStep.name}
                        onChange={(e) =>
                          handleUpdateStep({
                            ...selectedStep,
                            name: e.target.value,
                          })
                        }
                        margin="normal"
                      />

                      <TextField
                        fullWidth
                        label="Description"
                        value={selectedStep.description || ""}
                        onChange={(e) =>
                          handleUpdateStep({
                            ...selectedStep,
                            description: e.target.value,
                          })
                        }
                        multiline
                        rows={2}
                        margin="normal"
                      />

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Step Configuration
                        </Typography>

                        {/* Dynamic form based on step type */}
                        {Object.entries(selectedStep.config).map(
                          ([key, value]) => (
                            <TextField
                              key={key}
                              fullWidth
                              label={key.charAt(0).toUpperCase() + key.slice(1)}
                              value={value}
                              onChange={(e) => {
                                const updatedConfig = {
                                  ...selectedStep.config,
                                  [key]: e.target.value,
                                };
                                handleUpdateStep({
                                  ...selectedStep,
                                  config: updatedConfig,
                                });
                              }}
                              margin="normal"
                            />
                          )
                        )}
                      </Box>
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      Select a step to edit its properties
                    </Typography>
                  )}
                </Box>
              )}
            </TabPanel>

            {/* Library Tab */}
            <TabPanel value={rightPanelTab} index={1}>
              <ActionLibrary
                onSelectAction={(action) => {
                  // Convert action to step template
                  const stepTemplate: Partial<PlaybookStep> = {
                    name: action.name,
                    type: "action",
                    description: action.description,
                    config: action.parameters.reduce((acc, param) => {
                      acc[param.name] =
                        param.default !== undefined ? param.default : "";
                      return acc;
                    }, {} as Record<string, any>),
                  };
                  handleAddStep(stepTemplate);
                }}
              />
            </TabPanel>

            {/* Execution Tab */}
            <TabPanel value={rightPanelTab} index={2}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Execution History
                </Typography>

                {/* Placeholder for execution history */}
                <Typography color="text.secondary">
                  No execution history available
                </Typography>
              </Box>
            </TabPanel>
          </Box>
        </Drawer>
      </Box>

      {/* Publish Dialog */}
      <Dialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Publish Playbook</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Are you sure you want to publish this playbook? Once published, it
            will be available for execution in production.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Note: You should ensure that all steps are properly configured and
            tested before publishing.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublishPlaybook}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Run Dialog */}
      <Dialog
        open={testRunDialogOpen}
        onClose={() => setTestRunDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Test Run Playbook</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            This will execute the playbook in a test environment. Do you want to
            continue?
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Note: Any actions defined in the playbook will be executed with real
            system impacts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestRunDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleTestRunPlaybook}
          >
            Run Test
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Menu */}
      <Menu
        anchorEl={historyMenuAnchor}
        open={Boolean(historyMenuAnchor)}
        onClose={handleHistoryMenuClose}
      >
        <MenuItem onClick={handleHistoryMenuClose}>
          <ListItemText
            primary="No version history"
            secondary="Save the playbook to create a version"
          />
        </MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default PlaybookDesignerV2;
