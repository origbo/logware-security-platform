/**
 * CaseArtifactsTab Component
 *
 * Displays and manages artifacts related to a security case,
 * allowing users to add, view, and delete evidence.
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  FileDownload as DownloadIcon,
  FileCopy as FileIcon,
  Link as LinkIcon,
  Code as CodeIcon,
  Fingerprint as HashIcon,
  Image as ImageIcon,
  AttachFile as AttachIcon,
} from "@mui/icons-material";

// Import types
import { SecurityCase, Artifact, ArtifactType } from "../../types/soarTypes";

// Props interface
interface CaseArtifactsTabProps {
  caseData: SecurityCase;
  onAddArtifact: (artifact: Omit<Artifact, "id">) => void;
  onDeleteArtifact: (artifactId: string) => void;
}

// Artifact type options
const ARTIFACT_TYPES: {
  value: ArtifactType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "file", label: "File", icon: <FileIcon /> },
  { value: "url", label: "URL", icon: <LinkIcon /> },
  { value: "ip_address", label: "IP Address", icon: <CodeIcon /> },
  { value: "hash", label: "Hash", icon: <HashIcon /> },
  { value: "image", label: "Image", icon: <ImageIcon /> },
  { value: "log", label: "Log Data", icon: <AttachIcon /> },
  { value: "other", label: "Other", icon: <AttachIcon /> },
];

/**
 * Get icon for artifact type
 */
const getArtifactIcon = (type: ArtifactType) => {
  const artifactType = ARTIFACT_TYPES.find((t) => t.value === type);
  return artifactType ? artifactType.icon : <AttachIcon />;
};

/**
 * CaseArtifactsTab Component
 */
const CaseArtifactsTab: React.FC<CaseArtifactsTabProps> = ({
  caseData,
  onAddArtifact,
  onDeleteArtifact,
}) => {
  // State for add artifact dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newArtifact, setNewArtifact] = useState<Partial<Artifact>>({
    type: "file",
    name: "",
    description: "",
    content: "",
    source: "",
    isMalicious: false,
  });

  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    setAddDialogOpen(true);
  };

  // Handle closing add dialog
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    // Reset form
    setNewArtifact({
      type: "file",
      name: "",
      description: "",
      content: "",
      source: "",
      isMalicious: false,
    });
  };

  // Handle field change in new artifact form
  const handleArtifactFieldChange = (field: keyof Artifact, value: any) => {
    setNewArtifact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle submitting new artifact
  const handleSubmitArtifact = () => {
    if (!newArtifact.name || !newArtifact.type) return;

    onAddArtifact({
      name: newArtifact.name || "",
      type: newArtifact.type as ArtifactType,
      description: newArtifact.description || "",
      content: newArtifact.content || "",
      source: newArtifact.source || "manual",
      isMalicious: newArtifact.isMalicious || false,
      createdAt: new Date().toISOString(),
    });

    handleCloseAddDialog();
  };

  // Handle artifact deletion
  const handleDeleteArtifact = (artifactId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this artifact? This action cannot be undone."
      )
    ) {
      onDeleteArtifact(artifactId);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Case Artifacts</Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Add Artifact
        </Button>
      </Box>

      {caseData.artifacts && caseData.artifacts.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Added On</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {caseData.artifacts.map((artifact) => (
                <TableRow key={artifact.id}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {getArtifactIcon(artifact.type)}
                      <Typography sx={{ ml: 1, textTransform: "capitalize" }}>
                        {artifact.type.replace("_", " ")}
                      </Typography>
                      {artifact.isMalicious && (
                        <Chip
                          label="Malicious"
                          color="error"
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{artifact.name}</TableCell>
                  <TableCell>{artifact.description}</TableCell>
                  <TableCell>{artifact.source}</TableCell>
                  <TableCell>
                    {new Date(artifact.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Download">
                      <IconButton size="small" sx={{ mr: 1 }}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteArtifact(artifact.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          No artifacts have been added to this case. Add files, URLs, hashes, or
          other evidence related to this case.
        </Alert>
      )}

      {/* Add Artifact Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Artifact</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* Artifact Type */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Artifact Type</InputLabel>
              <Select
                value={newArtifact.type || "file"}
                label="Artifact Type"
                onChange={(e) =>
                  handleArtifactFieldChange("type", e.target.value)
                }
              >
                {ARTIFACT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {type.icon}
                      <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Artifact Name */}
            <TextField
              fullWidth
              label="Name"
              value={newArtifact.name || ""}
              onChange={(e) =>
                handleArtifactFieldChange("name", e.target.value)
              }
              margin="normal"
              required
            />

            {/* Artifact Description */}
            <TextField
              fullWidth
              label="Description"
              value={newArtifact.description || ""}
              onChange={(e) =>
                handleArtifactFieldChange("description", e.target.value)
              }
              margin="normal"
              multiline
              rows={2}
            />

            {/* Artifact Content */}
            <TextField
              fullWidth
              label="Content/Value"
              value={newArtifact.content || ""}
              onChange={(e) =>
                handleArtifactFieldChange("content", e.target.value)
              }
              margin="normal"
              placeholder={
                newArtifact.type === "file"
                  ? "File path or upload"
                  : newArtifact.type === "url"
                  ? "https://example.com"
                  : newArtifact.type === "ip_address"
                  ? "192.168.1.1"
                  : newArtifact.type === "hash"
                  ? "SHA256 hash value"
                  : "Artifact value"
              }
            />

            {/* Source */}
            <TextField
              fullWidth
              label="Source"
              value={newArtifact.source || ""}
              onChange={(e) =>
                handleArtifactFieldChange("source", e.target.value)
              }
              margin="normal"
              placeholder="Where this artifact was found"
            />

            {/* Is Malicious */}
            <FormControl fullWidth margin="normal">
              <InputLabel>Is Malicious?</InputLabel>
              <Select
                value={newArtifact.isMalicious ? "true" : "false"}
                label="Is Malicious?"
                onChange={(e) =>
                  handleArtifactFieldChange(
                    "isMalicious",
                    e.target.value === "true"
                  )
                }
              >
                <MenuItem value="false">No (Benign)</MenuItem>
                <MenuItem value="true">Yes (Malicious)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitArtifact}
            disabled={!newArtifact.name || !newArtifact.type}
          >
            Add Artifact
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CaseArtifactsTab;
