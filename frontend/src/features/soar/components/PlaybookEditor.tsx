import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
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
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../../features/auth/hooks/useAuth";
import soarApiService, {
  Playbook as ApiPlaybook,
  PlaybookStep as ApiPlaybookStep,
} from "../../../services/api/soarApiService";
import { Playbook, PlaybookStep } from "../types/soarTypes";
import {
  adaptApiStepToModuleStep,
  adaptModuleStepToApiStep,
  adaptApiPlaybookToModulePlaybook,
  adaptModulePlaybookToApiPlaybook,
} from "../utils/typeAdapters";
import PlaybookToolbox from "./PlaybookToolbox";
import PlaybookCanvas from "./PlaybookCanvas";
import PlaybookProperties from "./PlaybookProperties";

/**
 * PlaybookEditor Component
 *
 * Visual drag-and-drop editor for creating and editing SOAR playbooks
 */
const PlaybookEditor: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbook, setPlaybook] = useState<ApiPlaybook | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [toolboxOpen, setToolboxOpen] = useState(true);
  const [selectedStep, setSelectedStep] = useState<ApiPlaybookStep | null>(
    null
  );
  const [zoom, setZoom] = useState(1);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [testRunDialogOpen, setTestRunDialogOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize playbook or load existing one
  useEffect(() => {
    if (!isAuthenticated) return;

    const initializePlaybook = async () => {
      setLoading(true);
      setError(null);

      try {
        // If ID provided, load existing playbook
        if (id && id !== "new") {
          const response = await soarApiService.getPlaybook(id);
          setPlaybook(response.data);
        } else {
          // Create new playbook template
          setPlaybook({
            id: "",
            name: "New Playbook",
            description: "Describe your playbook",
            status: "draft",
            triggerType: "manual",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            steps: [],
            owner: "current-user", // Will be set properly on save
            successCount: 0,
            failureCount: 0,
          });
        }
      } catch (err) {
        console.error("Error loading playbook:", err);
        setError("Failed to load playbook. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initializePlaybook();
  }, [id, isAuthenticated]);

  // Mark unsaved changes when playbook is modified
  useEffect(() => {
    if (playbook) {
      setUnsavedChanges(true);
    }
  }, [playbook]);

  // Handle save playbook
  const handleSavePlaybook = async () => {
    if (!playbook) return;

    setLoading(true);
    setError(null);

    try {
      let response;

      if (id === "new" || !playbook.id) {
        // Create new playbook
        const { id, createdAt, updatedAt, ...playbookData } = playbook;
        // Add required fields for API Playbook
        const apiPlaybookData = {
          ...playbookData,
          successCount: 0,
          failureCount: 0,
        };
        response = await soarApiService.createPlaybook(apiPlaybookData);

        // Redirect to the edit page with the new ID
        navigate(`/soar/playbooks/edit/${response.data.id}`, { replace: true });
      } else {
        // Update existing playbook
        // Convert status to the expected format if it's a string
        const apiPlaybook: Partial<ApiPlaybook> = {
          ...playbook,
          status: playbook.status as
            | "active"
            | "disabled"
            | "draft"
            | "archived",
        };
        response = await soarApiService.updatePlaybook(
          playbook.id,
          apiPlaybook
        );
      }

      setPlaybook(response.data);
      setUnsavedChanges(false);
      setSnackbarMessage("Playbook saved successfully!");
    } catch (err) {
      console.error("Error saving playbook:", err);
      setError("Failed to save playbook. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle publish playbook
  const handlePublishPlaybook = async () => {
    if (!playbook) return;

    setLoading(true);
    setError(null);

    try {
      // Update playbook status to active
      const updatedPlaybook = { ...playbook, status: "active" };
      const response = await soarApiService.updatePlaybook(
        playbook.id,
        updatedPlaybook
      );

      setPlaybook(response.data);
      setUnsavedChanges(false);
      setPublishDialogOpen(false);
      setSnackbarMessage("Playbook published successfully!");
    } catch (err) {
      console.error("Error publishing playbook:", err);
      setError("Failed to publish playbook. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle test run playbook
  const handleTestRunPlaybook = async () => {
    if (!playbook) return;

    setLoading(true);
    setError(null);

    try {
      const response = await soarApiService.executePlaybook(playbook.id);
      setTestRunDialogOpen(false);
      setSnackbarMessage(
        `Test execution started! Execution ID: ${response.data.executionId}`
      );

      // Navigate to execution details
      navigate(`/soar/executions/${response.data.executionId}`);
    } catch (err) {
      console.error("Error testing playbook:", err);
      setError("Failed to execute playbook. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle playbook property changes
  const handlePropertyChange = (property: string, value: any) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [property]: value,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Add new step to playbook
  const handleAddStep = (
    stepTemplate: Partial<PlaybookStep>,
    position = { x: 100, y: 100 }
  ) => {
    if (!playbook) return;

    const newStep: PlaybookStep = {
      id: `step-${Date.now()}`,
      name: stepTemplate.name || "New Step",
      type: stepTemplate.type || "action",
      position: stepTemplate.position || position.x,
      config: stepTemplate.config || {},
      description: stepTemplate.description || "",
      nextSteps: [],
    };

    setPlaybook((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        steps: [...prev.steps, newStep],
        updatedAt: new Date().toISOString(),
      };
    });

    // Select the new step
    setSelectedStep(newStep);
  };

  // Update a step
  const handleUpdateStep = (updatedStep: PlaybookStep) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        steps: prev.steps.map((step) =>
          step.id === updatedStep.id ? updatedStep : step
        ),
        updatedAt: new Date().toISOString(),
      };
    });

    // Update selected step if it's the one being updated
    if (selectedStep && selectedStep.id === updatedStep.id) {
      setSelectedStep(updatedStep);
    }
  };

  // Delete a step
  const handleDeleteStep = (stepId: string) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return null;

      // Remove the step
      const newSteps = prev.steps.filter((step) => step.id !== stepId);

      // Remove references to this step from nextSteps arrays
      const updatedSteps = newSteps.map((step) => ({
        ...step,
        nextSteps: step.nextSteps
          ? step.nextSteps.filter((id) => id !== stepId)
          : [],
      }));

      return {
        ...prev,
        steps: updatedSteps,
        updatedAt: new Date().toISOString(),
      };
    });

    // Clear selection if the deleted step was selected
    if (selectedStep && selectedStep.id === stepId) {
      setSelectedStep(null);
    }
  };

  // Connect steps (add to nextSteps)
  const handleConnectSteps = (sourceId: string, targetId: string) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        steps: prev.steps.map((step) => {
          if (step.id === sourceId) {
            // Avoid duplicate connections
            const nextSteps = step.nextSteps || [];
            if (!nextSteps.includes(targetId)) {
              return {
                ...step,
                nextSteps: [...nextSteps, targetId],
              };
            }
          }
          return step;
        }),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Disconnect steps (remove from nextSteps)
  const handleDisconnectSteps = (sourceId: string, targetId: string) => {
    if (!playbook) return;

    setPlaybook((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        steps: prev.steps.map((step) => {
          if (step.id === sourceId && step.nextSteps) {
            return {
              ...step,
              nextSteps: step.nextSteps.filter((id) => id !== targetId),
            };
          }
          return step;
        }),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1.0);
  };

  // Navigate back to playbook list
  const handleNavigateBack = () => {
    if (unsavedChanges) {
      // Could show a confirmation dialog here
      if (
        !window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        return;
      }
    }

    navigate("/soar/playbooks");
  };

  // Handle closing snackbar
  const handleSnackbarClose = () => {
    setSnackbarMessage(null);
  };

  // Loading state
  if (loading && !playbook) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top AppBar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton edge="start" onClick={handleNavigateBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
            {playbook?.name || "Playbook Editor"}
          </Typography>

          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut}>
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ mx: 1 }}>
            {Math.round(zoom * 100)}%
          </Typography>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn}>
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton onClick={handleResetZoom}>
              <CenterIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

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

          {playbook?.status === "active" && (
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              onClick={() => setTestRunDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Test Run
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSavePlaybook}
            disabled={loading}
          >
            Save
          </Button>
        </Toolbar>
      </AppBar>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main content */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Toolbox Drawer */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={toolboxOpen}
          sx={{
            width: 250,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 250,
              position: "relative",
              transition: theme.transitions.create("width"),
              overflowY: "auto",
            },
          }}
        >
          <PlaybookToolbox onAddStep={handleAddStep} />
        </Drawer>

        {/* Canvas Area */}
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
          {playbook && (
            <PlaybookCanvas
              playbook={playbook}
              zoom={zoom}
              selectedStepId={selectedStep?.id}
              onSelectStep={setSelectedStep}
              onUpdateStep={handleUpdateStep}
              onDeleteStep={handleDeleteStep}
              onConnectSteps={handleConnectSteps}
              onDisconnectSteps={handleDisconnectSteps}
            />
          )}
        </Box>

        {/* Properties Drawer */}
        <Drawer
          variant="persistent"
          anchor="right"
          open={propertiesOpen}
          sx={{
            width: 340,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 340,
              position: "relative",
              overflowY: "auto",
            },
          }}
        >
          <PlaybookProperties
            playbook={playbook}
            selectedStep={selectedStep}
            onPlaybookChange={handlePropertyChange}
            onStepUpdate={handleUpdateStep}
            onStepDelete={handleDeleteStep}
          />
        </Drawer>
      </Box>

      {/* Publish Confirmation Dialog */}
      <Dialog
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
      >
        <DialogTitle>Publish Playbook</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to publish this playbook? Once published, it
            will be available for execution.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePublishPlaybook}
            disabled={loading}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Run Dialog */}
      <Dialog
        open={testRunDialogOpen}
        onClose={() => setTestRunDialogOpen(false)}
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
            disabled={loading}
          >
            Run Test
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default PlaybookEditor;
