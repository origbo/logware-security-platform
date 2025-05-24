/**
 * CaseDetailsTab Component
 *
 * Displays and allows editing of the main case information including
 * description, metadata, related entities, and tags.
 */

import React from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Paper,
  Chip,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
} from "@mui/icons-material";

// Import types
import { SecurityCase } from "../../types/soarTypes";

// Props interface
interface CaseDetailsTabProps {
  caseData: SecurityCase;
  editMode: boolean;
  onCaseUpdate: (updatedCase: SecurityCase) => void;
}

// Case type options
const CASE_TYPES = [
  "security_incident",
  "vulnerability",
  "suspicious_activity",
  "compliance",
  "policy_violation",
  "investigation",
];

// Case categories
const CASE_CATEGORIES = [
  "malware",
  "phishing",
  "data_breach",
  "unauthorized_access",
  "denial_of_service",
  "insider_threat",
  "social_engineering",
  "policy_violation",
  "misconfiguration",
  "other",
];

/**
 * CaseDetailsTab Component
 */
const CaseDetailsTab: React.FC<CaseDetailsTabProps> = ({
  caseData,
  editMode,
  onCaseUpdate,
}) => {
  // Handle field changes
  const handleFieldChange = (field: keyof SecurityCase, value: any) => {
    onCaseUpdate({
      ...caseData,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  // Handle adding a related entity
  const handleAddRelatedEntity = (entity: string) => {
    if (!entity.trim()) return;

    const updatedEntities = [...(caseData.relatedEntities || [])];
    if (!updatedEntities.includes(entity)) {
      updatedEntities.push(entity);
      handleFieldChange("relatedEntities", updatedEntities);
    }
  };

  // Handle removing a related entity
  const handleRemoveRelatedEntity = (entity: string) => {
    const updatedEntities = (caseData.relatedEntities || []).filter(
      (e) => e !== entity
    );
    handleFieldChange("relatedEntities", updatedEntities);
  };

  // Handle adding a tag
  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;

    const updatedTags = [...(caseData.tags || [])];
    if (!updatedTags.includes(tag)) {
      updatedTags.push(tag);
      handleFieldChange("tags", updatedTags);
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tag: string) => {
    const updatedTags = (caseData.tags || []).filter((t) => t !== tag);
    handleFieldChange("tags", updatedTags);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={3}>
        {/* Case Description */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Case Description
          </Typography>

          {editMode ? (
            <TextField
              fullWidth
              multiline
              rows={4}
              value={caseData.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              placeholder="Provide a detailed description of the case..."
            />
          ) : (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="body1">
                {caseData.description || "No description provided."}
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Case Metadata */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Case Metadata
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Case ID */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Case ID
                </Typography>
                <Typography variant="body1">{caseData.id}</Typography>
              </Grid>

              {/* Case Type */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Type
                </Typography>
                {editMode ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={caseData.type || "security_incident"}
                      onChange={(e) =>
                        handleFieldChange("type", e.target.value)
                      }
                    >
                      {CASE_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.replace("_", " ")}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {(caseData.type || "").replace("_", " ")}
                  </Typography>
                )}
              </Grid>

              {/* Case Category */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Category
                </Typography>
                {editMode ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={caseData.category || "other"}
                      onChange={(e) =>
                        handleFieldChange("category", e.target.value)
                      }
                    >
                      {CASE_CATEGORIES.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category.replace("_", " ")}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {(caseData.category || "").replace("_", " ")}
                  </Typography>
                )}
              </Grid>

              {/* Source */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Source
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    size="small"
                    value={caseData.source || ""}
                    onChange={(e) =>
                      handleFieldChange("source", e.target.value)
                    }
                  />
                ) : (
                  <Typography variant="body1">
                    {caseData.source || "Not specified"}
                  </Typography>
                )}
              </Grid>

              {/* Priority */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Priority
                </Typography>
                {editMode ? (
                  <FormControl fullWidth size="small">
                    <Select
                      value={caseData.priority}
                      onChange={(e) =>
                        handleFieldChange("priority", e.target.value)
                      }
                    >
                      <MenuItem value="high">High</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="low">Low</MenuItem>
                    </Select>
                  </FormControl>
                ) : (
                  <Typography
                    variant="body1"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {caseData.priority}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Related Entities */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Related Entities
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {editMode && (
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  freeSolo
                  options={[]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Add entity (IP, hostname, email, etc.)"
                      size="small"
                      fullWidth
                    />
                  )}
                  onChange={(_, value) => {
                    if (value) handleAddRelatedEntity(value);
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {caseData.relatedEntities &&
              caseData.relatedEntities.length > 0 ? (
                caseData.relatedEntities.map((entity, index) => (
                  <Chip
                    key={index}
                    label={entity}
                    onDelete={
                      editMode
                        ? () => handleRemoveRelatedEntity(entity)
                        : undefined
                    }
                  />
                ))
              ) : (
                <Typography color="text.secondary">
                  No related entities
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Tags */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Tags
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {editMode && (
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  freeSolo
                  options={[]}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Add tag"
                      size="small"
                      fullWidth
                    />
                  )}
                  onChange={(_, value) => {
                    if (value) handleAddTag(value);
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {caseData.tags && caseData.tags.length > 0 ? (
                caseData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={editMode ? () => handleRemoveTag(tag) : undefined}
                    color="primary"
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography color="text.secondary">No tags</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CaseDetailsTab;
