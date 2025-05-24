import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Divider,
  IconButton,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Code as CodeIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { Playbook, PlaybookStep } from "../../../services/api/soarApiService";

interface PlaybookPropertiesProps {
  playbook: Playbook | null;
  selectedStep: PlaybookStep | null;
  onPlaybookChange: (property: string, value: any) => void;
  onStepUpdate: (step: PlaybookStep) => void;
  onStepDelete: (stepId: string) => void;
}

/**
 * PlaybookProperties Component
 *
 * Properties panel for editing playbook and step details
 */
const PlaybookProperties: React.FC<PlaybookPropertiesProps> = ({
  playbook,
  selectedStep,
  onPlaybookChange,
  onStepUpdate,
  onStepDelete,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [configJson, setConfigJson] = useState<string>("");
  const [jsonValid, setJsonValid] = useState(true);

  // Update local state when playbook or selected step changes
  useEffect(() => {
    setTags(playbook?.tags || []);
  }, [playbook]);

  useEffect(() => {
    if (selectedStep) {
      try {
        setConfigJson(JSON.stringify(selectedStep.config || {}, null, 2));
        setJsonValid(true);
      } catch (error) {
        setConfigJson("{}");
        setJsonValid(false);
      }
    }
  }, [selectedStep]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle tag changes
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      onPlaybookChange("tags", updatedTags);
      setNewTag("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToDelete);
    setTags(updatedTags);
    onPlaybookChange("tags", updatedTags);
  };

  // Handle JSON config changes
  const handleConfigChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfigJson(e.target.value);

    try {
      const parsedConfig = JSON.parse(e.target.value);
      setJsonValid(true);

      if (selectedStep) {
        onStepUpdate({
          ...selectedStep,
          config: parsedConfig,
        });
      }
    } catch (error) {
      setJsonValid(false);
    }
  };

  // Handle selected step property change
  const handleStepPropertyChange = (property: string, value: any) => {
    if (selectedStep) {
      onStepUpdate({
        ...selectedStep,
        [property]: value,
      });
    }
  };

  return (
    <Box
      sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Typography variant="h6" gutterBottom>
        Properties
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Playbook" />
        <Tab label="Selected Step" disabled={!selectedStep} />
      </Tabs>

      {/* Playbook Properties Tab */}
      {tabValue === 0 && playbook && (
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Typography variant="subtitle1" gutterBottom>
            Playbook Details
          </Typography>

          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={playbook.name}
            onChange={(e) => onPlaybookChange("name", e.target.value)}
          />

          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={playbook.description}
            onChange={(e) => onPlaybookChange("description", e.target.value)}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={playbook.status}
              label="Status"
              onChange={(e) => onPlaybookChange("status", e.target.value)}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Trigger Type</InputLabel>
            <Select
              value={playbook.triggerType}
              label="Trigger Type"
              onChange={(e) => onPlaybookChange("triggerType", e.target.value)}
            >
              <MenuItem value="manual">Manual</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="event-driven">Event Driven</MenuItem>
            </Select>
          </FormControl>

          {/* Tags Section */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Tags
          </Typography>

          <Box sx={{ display: "flex", mb: 1 }}>
            <TextField
              label="Add Tag"
              size="small"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddTag();
                }
              }}
              sx={{ flex: 1, mr: 1 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddTag}
              disabled={!newTag}
            >
              Add
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 3 }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleDeleteTag(tag)}
              />
            ))}
            {tags.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                No tags added yet
              </Typography>
            )}
          </Box>

          {/* Playbook Statistics */}
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Statistics
            </Typography>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body2">
                {new Date(playbook.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body2">
                {new Date(playbook.updatedAt).toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Last Run
              </Typography>
              <Typography variant="body2">
                {playbook.lastRunAt
                  ? new Date(playbook.lastRunAt).toLocaleString()
                  : "Never"}
              </Typography>
            </Box>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" color="text.secondary">
                Success / Failure
              </Typography>
              <Typography variant="body2">
                {playbook.successCount} / {playbook.failureCount}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">
                Steps
              </Typography>
              <Typography variant="body2">{playbook.steps.length}</Typography>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Step Properties Tab */}
      {tabValue === 1 && selectedStep && (
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="subtitle1">Step Details</Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              size="small"
              onClick={() => onStepDelete(selectedStep.id)}
            >
              Delete Step
            </Button>
          </Box>

          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={selectedStep.name}
            onChange={(e) => handleStepPropertyChange("name", e.target.value)}
          />

          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={selectedStep.description || ""}
            onChange={(e) =>
              handleStepPropertyChange("description", e.target.value)
            }
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Step Type</InputLabel>
            <Select
              value={selectedStep.type}
              label="Step Type"
              onChange={(e) => handleStepPropertyChange("type", e.target.value)}
            >
              <MenuItem value="action">Action</MenuItem>
              <MenuItem value="condition">Condition</MenuItem>
              <MenuItem value="notification">Notification</MenuItem>
              <MenuItem value="integration">Integration</MenuItem>
              <MenuItem value="wait">Wait</MenuItem>
            </Select>
          </FormControl>

          {/* Step Configuration */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Configuration (JSON)
          </Typography>

          {!jsonValid && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Invalid JSON format
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={10}
            value={configJson}
            onChange={handleConfigChange}
            error={!jsonValid}
            InputProps={{
              sx: {
                fontFamily: "monospace",
                fontSize: "0.85rem",
              },
            }}
          />

          {/* Next Steps */}
          <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
            Connected Steps
          </Typography>

          {selectedStep.nextSteps && selectedStep.nextSteps.length > 0 ? (
            <Box>
              {selectedStep.nextSteps.map((stepId) => {
                const nextStep = playbook?.steps.find((s) => s.id === stepId);
                return (
                  <Box
                    key={stepId}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1,
                      mb: 0.5,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {nextStep?.name || "Unknown Step"}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        const updatedNextSteps =
                          selectedStep.nextSteps?.filter(
                            (id) => id !== stepId
                          ) || [];
                        handleStepPropertyChange("nextSteps", updatedNextSteps);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No connections to other steps
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PlaybookProperties;
