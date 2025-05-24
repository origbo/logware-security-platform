/**
 * Report Configuration Component
 *
 * Allows customization of compliance reports across different frameworks
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  FormGroup,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Help as HelpIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Props interface
interface ReportConfigurationProps {
  framework?: string;
}

// Report template interface
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  isSystem: boolean;
  sections: ReportSection[];
}

// Report section interface
interface ReportSection {
  id: string;
  title: string;
  description: string;
  isRequired: boolean;
  type: "text" | "chart" | "table" | "control-summary" | "evidence-summary";
  order: number;
  options?: Record<string, any>;
}

// Sample report templates
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
        title: "Compliance Overview",
        description: "Summary of compliance status by control category",
        isRequired: true,
        type: "chart",
        order: 2,
        options: {
          chartType: "pie",
        },
      },
      {
        id: "section-3",
        title: "Key Findings",
        description: "Critical compliance gaps and issues",
        isRequired: true,
        type: "text",
        order: 3,
      },
      {
        id: "section-4",
        title: "Control Assessment",
        description: "Detailed assessment of each control",
        isRequired: true,
        type: "table",
        order: 4,
      },
      {
        id: "section-5",
        title: "Evidence Summary",
        description: "Summary of compliance evidence collected",
        isRequired: false,
        type: "evidence-summary",
        order: 5,
      },
    ],
  },
  {
    id: "template-2",
    name: "PCI-DSS Compliance Report",
    description: "Full PCI-DSS compliance assessment report",
    framework: "PCI-DSS",
    createdAt: "2025-04-10T09:15:00Z",
    updatedAt: "2025-05-20T11:45:00Z",
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
        title: "Control Requirements Status",
        description: "Compliance status for each PCI-DSS requirement",
        isRequired: true,
        type: "chart",
        order: 2,
        options: {
          chartType: "bar",
        },
      },
      {
        id: "section-3",
        title: "Risk Assessment",
        description: "Assessment of risks based on compliance gaps",
        isRequired: true,
        type: "text",
        order: 3,
      },
      {
        id: "section-4",
        title: "Detailed Findings",
        description: "Detailed findings for each control requirement",
        isRequired: true,
        type: "control-summary",
        order: 4,
      },
    ],
  },
  {
    id: "template-3",
    name: "ISO 27001 Compliance Report",
    description: "ISO 27001 ISMS compliance status report",
    framework: "ISO 27001",
    createdAt: "2025-03-15T13:20:00Z",
    updatedAt: "2025-05-10T16:40:00Z",
    author: "System",
    isSystem: true,
    sections: [
      {
        id: "section-1",
        title: "Executive Summary",
        description: "Overview of ISO 27001 compliance",
        isRequired: true,
        type: "text",
        order: 1,
      },
      {
        id: "section-2",
        title: "ISMS Performance",
        description:
          "Information Security Management System performance metrics",
        isRequired: true,
        type: "chart",
        order: 2,
      },
      {
        id: "section-3",
        title: "Control Assessment Summary",
        description: "Summary of control assessments",
        isRequired: true,
        type: "table",
        order: 3,
      },
      {
        id: "section-4",
        title: "Evidence Collection Status",
        description: "Status of evidence collection for ISO 27001 controls",
        isRequired: false,
        type: "evidence-summary",
        order: 4,
      },
    ],
  },
];

/**
 * Report Configuration Component
 */
const ReportConfiguration: React.FC<ReportConfigurationProps> = ({
  framework = "ALL",
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [customizedTemplate, setCustomizedTemplate] =
    useState<ReportTemplate | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionType, setNewSectionType] =
    useState<ReportSection["type"]>("text");

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
                (template) => template.framework === framework
              );

        setTemplates(filteredTemplates);
        setError(null);
      } catch (err) {
        console.error("Error fetching report templates:", err);
        setError("Failed to load report templates");
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [framework]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      // Create a deep copy for customization
      setCustomizedTemplate(JSON.parse(JSON.stringify(template)));
    }
  };

  // Handle section toggle
  const handleSectionToggle = (sectionId: string) => {
    if (!customizedTemplate) return;

    const updatedSections = customizedTemplate.sections.map((section) => {
      if (section.id === sectionId && !section.isRequired) {
        return { ...section, isRequired: !section.isRequired };
      }
      return section;
    });

    setCustomizedTemplate({
      ...customizedTemplate,
      sections: updatedSections,
    });
  };

  // Handle section reorder
  const handleSectionReorder = (
    sectionId: string,
    direction: "up" | "down"
  ) => {
    if (!customizedTemplate) return;

    const sectionIndex = customizedTemplate.sections.findIndex(
      (s) => s.id === sectionId
    );
    if (sectionIndex === -1) return;

    if (direction === "up" && sectionIndex > 0) {
      const updatedSections = [...customizedTemplate.sections];
      const temp = updatedSections[sectionIndex];
      updatedSections[sectionIndex] = updatedSections[sectionIndex - 1];
      updatedSections[sectionIndex - 1] = temp;

      // Update order properties
      updatedSections[sectionIndex].order = sectionIndex + 1;
      updatedSections[sectionIndex - 1].order = sectionIndex;

      setCustomizedTemplate({
        ...customizedTemplate,
        sections: updatedSections,
      });
    } else if (
      direction === "down" &&
      sectionIndex < customizedTemplate.sections.length - 1
    ) {
      const updatedSections = [...customizedTemplate.sections];
      const temp = updatedSections[sectionIndex];
      updatedSections[sectionIndex] = updatedSections[sectionIndex + 1];
      updatedSections[sectionIndex + 1] = temp;

      // Update order properties
      updatedSections[sectionIndex].order = sectionIndex + 1;
      updatedSections[sectionIndex + 1].order = sectionIndex + 2;

      setCustomizedTemplate({
        ...customizedTemplate,
        sections: updatedSections,
      });
    }
  };

  // Handle adding a new section
  const handleAddSection = () => {
    if (!customizedTemplate || !newSectionTitle) return;

    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      title: newSectionTitle,
      description: `Description for ${newSectionTitle}`,
      isRequired: false,
      type: newSectionType,
      order: customizedTemplate.sections.length + 1,
    };

    setCustomizedTemplate({
      ...customizedTemplate,
      sections: [...customizedTemplate.sections, newSection],
    });

    setNewSectionTitle("");
  };

  // Handle removing a section
  const handleRemoveSection = (sectionId: string) => {
    if (!customizedTemplate) return;

    const updatedSections = customizedTemplate.sections.filter(
      (s) => s.id !== sectionId
    );

    // Update order of remaining sections
    const reorderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index + 1,
    }));

    setCustomizedTemplate({
      ...customizedTemplate,
      sections: reorderedSections,
    });
  };

  // Save template customizations
  const handleSaveCustomizations = async () => {
    try {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Here you would normally save the customized template to the server

      setLoading(false);
      // Success message could be shown here
    } catch (err) {
      console.error("Error saving template customizations:", err);
      setError("Failed to save template customizations");
      setLoading(false);
    }
  };

  // Get type label
  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "text":
        return "Text Section";
      case "chart":
        return "Chart/Graph";
      case "table":
        return "Table Data";
      case "control-summary":
        return "Control Summary";
      case "evidence-summary":
        return "Evidence Summary";
      default:
        return type;
    }
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

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">
          Report Configuration {framework !== "ALL" && `(${framework})`}
        </Typography>
        <IconButton color="primary" title="Refresh Templates">
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Template Selection Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
              Select Report Template
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {templates.length === 0 ? (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="textSecondary">
                  No templates available for the selected framework.
                </Typography>
              </Box>
            ) : (
              <Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Template</InputLabel>
                  <Select
                    value={selectedTemplate?.id || ""}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    label="Template"
                  >
                    {templates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedTemplate && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {selectedTemplate.description}
                    </Typography>
                    <Box
                      sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}
                    >
                      <Chip
                        label={selectedTemplate.framework}
                        size="small"
                        color="primary"
                      />
                      <Chip
                        label={
                          selectedTemplate.isSystem
                            ? "System Template"
                            : "Custom Template"
                        }
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Template Customization Panel */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Customize Report Sections
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {!customizedTemplate ? (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="textSecondary">
                  Select a template to customize its sections.
                </Typography>
              </Box>
            ) : (
              <>
                {/* Sections List */}
                {customizedTemplate.sections.map((section) => (
                  <Accordion key={section.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2">
                            {section.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {getTypeLabel(section.type)}
                          </Typography>
                        </Box>
                        <Box>
                          <Chip
                            size="small"
                            label={section.isRequired ? "Required" : "Optional"}
                            color={section.isRequired ? "primary" : "default"}
                            sx={{ mr: 1 }}
                          />
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            label="Section Title"
                            fullWidth
                            value={section.title}
                            onChange={(e) => {
                              const updatedSections =
                                customizedTemplate.sections.map((s) =>
                                  s.id === section.id
                                    ? { ...s, title: e.target.value }
                                    : s
                                );
                              setCustomizedTemplate({
                                ...customizedTemplate,
                                sections: updatedSections,
                              });
                            }}
                            size="small"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            label="Description"
                            fullWidth
                            value={section.description}
                            onChange={(e) => {
                              const updatedSections =
                                customizedTemplate.sections.map((s) =>
                                  s.id === section.id
                                    ? { ...s, description: e.target.value }
                                    : s
                                );
                              setCustomizedTemplate({
                                ...customizedTemplate,
                                sections: updatedSections,
                              });
                            }}
                            size="small"
                            multiline
                            rows={2}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mt: 1,
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={section.isRequired}
                                  onChange={() =>
                                    handleSectionToggle(section.id)
                                  }
                                  disabled={
                                    section.isRequired &&
                                    customizedTemplate.isSystem
                                  }
                                />
                              }
                              label="Required Section"
                            />

                            <Box>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleSectionReorder(section.id, "up")
                                }
                                disabled={section.order === 1}
                              >
                                <Tooltip title="Move Up">
                                  <span>↑</span>
                                </Tooltip>
                              </IconButton>

                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleSectionReorder(section.id, "down")
                                }
                                disabled={
                                  section.order ===
                                  customizedTemplate.sections.length
                                }
                              >
                                <Tooltip title="Move Down">
                                  <span>↓</span>
                                </Tooltip>
                              </IconButton>

                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveSection(section.id)}
                                disabled={
                                  section.isRequired &&
                                  customizedTemplate.isSystem
                                }
                              >
                                <Tooltip title="Remove Section">
                                  <DeleteIcon />
                                </Tooltip>
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}

                {/* Add New Section */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    border: `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Add New Section
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        label="Section Title"
                        fullWidth
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Section Type</InputLabel>
                        <Select
                          value={newSectionType}
                          label="Section Type"
                          onChange={(e) =>
                            setNewSectionType(
                              e.target.value as ReportSection["type"]
                            )
                          }
                        >
                          <MenuItem value="text">Text Section</MenuItem>
                          <MenuItem value="chart">Chart/Graph</MenuItem>
                          <MenuItem value="table">Table Data</MenuItem>
                          <MenuItem value="control-summary">
                            Control Summary
                          </MenuItem>
                          <MenuItem value="evidence-summary">
                            Evidence Summary
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={2}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddSection}
                        disabled={!newSectionTitle}
                        fullWidth
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {/* Save Customizations */}
                <Box
                  sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveCustomizations}
                  >
                    Save Configuration
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportConfiguration;
