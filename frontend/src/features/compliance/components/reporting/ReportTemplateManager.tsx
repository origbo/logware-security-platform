/**
 * Report Template Manager Component
 *
 * Allows users to create, edit, and manage report templates
 * for different compliance frameworks
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  ListItem,
  ListItemText,
  ListItemIcon,
  List,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Assignment as TemplateIcon,
  Check as CheckIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  BarChart as ChartIcon,
  Search as FindIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

// Template types
interface ReportSection {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  type: "text" | "chart" | "table" | "evidence" | "metrics";
  order: number;
  content?: string;
  dataSource?: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  framework: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  isSystem: boolean;
  sections: ReportSection[];
  coverPage?: {
    title: string;
    subtitle?: string;
    logo?: string;
    showDate: boolean;
    showAuthor: boolean;
    customText?: string;
  };
  footerText?: string;
  headerText?: string;
}

// Props interface
interface ReportTemplateManagerProps {
  framework: string;
}

/**
 * Report Template Manager Component
 */
const ReportTemplateManager: React.FC<ReportTemplateManagerProps> = ({
  framework,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sectionsDialogOpen, setSectionsDialogOpen] = useState(false);

  // New template form state
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    framework: "ALL",
  });

  // Sample data - in a real app, these would come from an API
  const sampleTemplates: ReportTemplate[] = [
    {
      id: "template-1",
      name: "GDPR Compliance Report",
      description: "Comprehensive report for GDPR compliance status",
      framework: "GDPR",
      createdAt: "2025-05-01T10:00:00Z",
      updatedAt: "2025-05-15T14:30:00Z",
      author: "System",
      isSystem: true,
      sections: [
        {
          id: "section-1",
          title: "Executive Summary",
          description: "Overview of GDPR compliance status",
          isRequired: true,
          type: "text",
          order: 1,
        },
        {
          id: "section-2",
          title: "Data Processing Activities",
          description: "Inventory of data processing activities",
          isRequired: true,
          type: "table",
          order: 2,
        },
        {
          id: "section-3",
          title: "Risk Assessment",
          description: "GDPR-related risks and mitigation measures",
          isRequired: true,
          type: "chart",
          order: 3,
        },
      ],
      coverPage: {
        title: "GDPR Compliance Report",
        subtitle: "Quarterly Status and Recommendations",
        showDate: true,
        showAuthor: true,
      },
    },
    {
      id: "template-2",
      name: "PCI-DSS Compliance Summary",
      description: "Executive summary for PCI-DSS compliance status",
      framework: "PCI-DSS",
      createdAt: "2025-05-02T11:15:00Z",
      updatedAt: "2025-05-16T09:45:00Z",
      author: "System",
      isSystem: true,
      sections: [
        {
          id: "section-1",
          title: "Executive Summary",
          description: "Overview of PCI-DSS compliance status",
          isRequired: true,
          type: "text",
          order: 1,
        },
        {
          id: "section-2",
          title: "Requirement Status",
          description: "Status of each PCI-DSS requirement",
          isRequired: true,
          type: "table",
          order: 2,
        },
      ],
      coverPage: {
        title: "PCI-DSS Compliance Summary",
        showDate: true,
        showAuthor: true,
      },
    },
    {
      id: "template-3",
      name: "HIPAA Compliance Report",
      description: "Detailed report for HIPAA compliance",
      framework: "HIPAA",
      createdAt: "2025-05-03T14:20:00Z",
      updatedAt: "2025-05-17T16:40:00Z",
      author: "System",
      isSystem: true,
      sections: [
        {
          id: "section-1",
          title: "Executive Summary",
          description: "Overview of HIPAA compliance status",
          isRequired: true,
          type: "text",
          order: 1,
        },
        {
          id: "section-2",
          title: "PHI Locations",
          description: "Inventory of PHI storage locations",
          isRequired: true,
          type: "table",
          order: 2,
        },
      ],
      coverPage: {
        title: "HIPAA Compliance Report",
        subtitle: "Protected Health Information Security Status",
        showDate: true,
        showAuthor: true,
      },
    },
    {
      id: "template-4",
      name: "ISO 27001 Audit Preparation",
      description: "Report to prepare for ISO 27001 certification audit",
      framework: "ISO 27001",
      createdAt: "2025-05-04T09:10:00Z",
      updatedAt: "2025-05-18T11:25:00Z",
      author: "System",
      isSystem: true,
      sections: [
        {
          id: "section-1",
          title: "Executive Summary",
          description: "Overview of ISO 27001 compliance status",
          isRequired: true,
          type: "text",
          order: 1,
        },
        {
          id: "section-2",
          title: "ISMS Status",
          description: "Status of Information Security Management System",
          isRequired: true,
          type: "chart",
          order: 2,
        },
        {
          id: "section-3",
          title: "Control Implementation",
          description: "Status of Annex A controls implementation",
          isRequired: true,
          type: "table",
          order: 3,
        },
      ],
      coverPage: {
        title: "ISO 27001 Audit Preparation Report",
        subtitle: "ISMS Implementation Status",
        showDate: true,
        showAuthor: true,
      },
    },
    {
      id: "template-5",
      name: "Custom Executive Dashboard",
      description:
        "High-level executive dashboard for all compliance frameworks",
      framework: "ALL",
      createdAt: "2025-05-05T15:30:00Z",
      updatedAt: "2025-05-19T10:15:00Z",
      author: "John Doe",
      isSystem: false,
      sections: [
        {
          id: "section-1",
          title: "Compliance Overview",
          description: "High-level overview of all compliance frameworks",
          isRequired: true,
          type: "chart",
          order: 1,
        },
        {
          id: "section-2",
          title: "Risk Summary",
          description: "Summary of compliance risks",
          isRequired: true,
          type: "chart",
          order: 2,
        },
        {
          id: "section-3",
          title: "Recent Findings",
          description: "Recent compliance findings and issues",
          isRequired: false,
          type: "table",
          order: 3,
        },
      ],
      coverPage: {
        title: "Executive Compliance Dashboard",
        subtitle: "Cross-Framework Compliance Status",
        showDate: true,
        showAuthor: true,
      },
    },
  ];

  // Load templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Filter templates by framework if specified
        const filteredTemplates =
          framework === "ALL"
            ? sampleTemplates
            : sampleTemplates.filter(
                (t) => t.framework === framework || t.framework === "ALL"
              );

        setTemplates(filteredTemplates);
        setError(null);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError("Failed to load report templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [framework]);

  // Handle create template dialog open
  const handleCreateDialogOpen = () => {
    setNewTemplate({
      name: "",
      description: "",
      framework: framework === "ALL" ? "ALL" : framework,
    });
    setCreateDialogOpen(true);
  };

  // Handle create template dialog close
  const handleCreateDialogClose = () => {
    setCreateDialogOpen(false);
  };

  // Handle edit template dialog open
  const handleEditDialogOpen = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setEditDialogOpen(true);
  };

  // Handle edit template dialog close
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
    setSelectedTemplate(null);
  };

  // Handle delete template dialog open
  const handleDeleteDialogOpen = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  // Handle delete template dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setSelectedTemplate(null);
  };

  // Handle sections dialog open
  const handleSectionsDialogOpen = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setSectionsDialogOpen(true);
  };

  // Handle sections dialog close
  const handleSectionsDialogClose = () => {
    setSectionsDialogOpen(false);
    setSelectedTemplate(null);
  };

  // Handle new template form change
  const handleNewTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTemplate({ ...newTemplate, [name]: value });
  };

  // Handle framework select change
  const handleFrameworkChange = (e: any) => {
    setNewTemplate({ ...newTemplate, framework: e.target.value });
  };

  // Handle create template
  const handleCreateTemplate = () => {
    // In a real app, this would call an API to create the template
    const newTemplateObject: ReportTemplate = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      framework: newTemplate.framework,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Current User",
      isSystem: false,
      sections: [
        {
          id: `section-${Date.now()}-1`,
          title: "Executive Summary",
          description: "Overview of compliance status",
          isRequired: true,
          type: "text",
          order: 1,
        },
      ],
      coverPage: {
        title: newTemplate.name,
        showDate: true,
        showAuthor: true,
      },
    };

    setTemplates([...templates, newTemplateObject]);
    setCreateDialogOpen(false);
  };

  // Handle delete template
  const handleDeleteTemplate = () => {
    if (selectedTemplate) {
      // In a real app, this would call an API to delete the template
      const updatedTemplates = templates.filter(
        (t) => t.id !== selectedTemplate.id
      );
      setTemplates(updatedTemplates);
      setDeleteDialogOpen(false);
      setSelectedTemplate(null);
    }
  };

  // Handle duplicate template
  const handleDuplicateTemplate = (template: ReportTemplate) => {
    // In a real app, this would call an API to duplicate the template
    const duplicatedTemplate: ReportTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Current User",
      isSystem: false,
    };

    setTemplates([...templates, duplicatedTemplate]);
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  // Render no templates state
  if (templates.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <TemplateIcon
          sx={{ fontSize: 60, color: theme.palette.grey[400], mb: 2 }}
        />
        <Typography variant="h6" gutterBottom>
          No templates found
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {framework === "ALL"
            ? "No report templates available. Create a new template to get started."
            : `No ${framework} report templates available. Create a new template or switch to All Frameworks view.`}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Create Template
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">
          Report Templates {framework !== "ALL" && `(${framework})`}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateDialogOpen}
        >
          Create Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} md={6} lg={4} key={template.id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  {template.isSystem && (
                    <Chip
                      label="System"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  {template.description}
                </Typography>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    label={template.framework}
                    size="small"
                    color={template.framework === "ALL" ? "default" : "primary"}
                  />
                  <Chip
                    label={`${template.sections.length} sections`}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="caption" display="block">
                  Created: {new Date(template.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Last updated:{" "}
                  {new Date(template.updatedAt).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" display="block">
                  Author: {template.author}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleSectionsDialogOpen(template)}
                >
                  View Sections
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                {!template.isSystem && (
                  <IconButton
                    size="small"
                    onClick={() => handleEditDialogOpen(template)}
                    title="Edit template"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => handleDuplicateTemplate(template)}
                  title="Duplicate template"
                >
                  <DuplicateIcon fontSize="small" />
                </IconButton>
                {!template.isSystem && (
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteDialogOpen(template)}
                    title="Delete template"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create Template Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCreateDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Report Template</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Template Name"
              name="name"
              value={newTemplate.name}
              onChange={handleNewTemplateChange}
              fullWidth
              required
            />

            <TextField
              label="Description"
              name="description"
              value={newTemplate.description}
              onChange={handleNewTemplateChange}
              fullWidth
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Compliance Framework</InputLabel>
              <Select
                value={newTemplate.framework}
                label="Compliance Framework"
                onChange={handleFrameworkChange}
              >
                <MenuItem value="ALL">All Frameworks</MenuItem>
                <MenuItem value="GDPR">GDPR</MenuItem>
                <MenuItem value="PCI-DSS">PCI-DSS</MenuItem>
                <MenuItem value="HIPAA">HIPAA</MenuItem>
                <MenuItem value="ISO 27001">ISO 27001</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="subtitle2" color="textSecondary">
              The template will be created with a default Executive Summary
              section. You can add more sections after creation.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            disabled={!newTemplate.name}
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Template</DialogTitle>
        <DialogContent dividers>
          {selectedTemplate && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}
            >
              <TextField
                label="Template Name"
                defaultValue={selectedTemplate.name}
                fullWidth
                required
              />

              <TextField
                label="Description"
                defaultValue={selectedTemplate.description}
                fullWidth
                multiline
                rows={3}
              />

              <FormControl fullWidth>
                <InputLabel>Compliance Framework</InputLabel>
                <Select
                  defaultValue={selectedTemplate.framework}
                  label="Compliance Framework"
                >
                  <MenuItem value="ALL">All Frameworks</MenuItem>
                  <MenuItem value="GDPR">GDPR</MenuItem>
                  <MenuItem value="PCI-DSS">PCI-DSS</MenuItem>
                  <MenuItem value="HIPAA">HIPAA</MenuItem>
                  <MenuItem value="ISO 27001">ISO 27001</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="subtitle2">Cover Page Options</Typography>
              <TextField
                label="Cover Title"
                defaultValue={selectedTemplate.coverPage?.title}
                fullWidth
              />

              <TextField
                label="Cover Subtitle"
                defaultValue={selectedTemplate.coverPage?.subtitle}
                fullWidth
              />

              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      defaultChecked={selectedTemplate.coverPage?.showDate}
                    />
                  }
                  label="Show Date on Cover"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      defaultChecked={selectedTemplate.coverPage?.showAuthor}
                    />
                  }
                  label="Show Author on Cover"
                />
              </Box>

              <TextField
                label="Footer Text"
                defaultValue={selectedTemplate.footerText}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleEditDialogClose}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Template Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete the template "
            {selectedTemplate?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteTemplate}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Sections Dialog */}
      <Dialog
        open={sectionsDialogOpen}
        onClose={handleSectionsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {selectedTemplate?.name} - Sections
            </Typography>
            <IconButton onClick={handleSectionsDialogClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTemplate && (
            <List>
              {selectedTemplate.sections.map((section, index) => (
                <React.Fragment key={section.id}>
                  <ListItem
                    secondaryAction={
                      !selectedTemplate.isSystem && (
                        <IconButton edge="end" size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemIcon>
                      {section.type === "text" && <DescriptionIcon />}
                      {section.type === "chart" && <ChartIcon />}
                      {section.type === "table" && <TemplateIcon />}
                      {section.type === "evidence" && <FindIcon />}
                      {section.type === "metrics" && <AssessmentIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {section.title}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            {section.description}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                            <Chip
                              label={section.type}
                              size="small"
                              variant="outlined"
                            />
                            {section.isRequired && (
                              <Chip
                                label="Required"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < selectedTemplate.sections.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}

          {selectedTemplate && !selectedTemplate.isSystem && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Button startIcon={<AddIcon />} variant="outlined">
                Add New Section
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSectionsDialogClose}>Close</Button>
          {selectedTemplate && !selectedTemplate.isSystem && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSectionsDialogClose}
            >
              Save Changes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportTemplateManager;
