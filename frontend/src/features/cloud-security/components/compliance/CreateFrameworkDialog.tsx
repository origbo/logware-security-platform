import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Tab,
  Tabs,
  Divider,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  SelectChangeEvent,
} from "@mui/material";
import {
  Add as AddIcon,
  ContentCopy as ContentCopyIcon,
  Description as DescriptionIcon,
  DeveloperBoard as DeveloperBoardIcon,
} from "@mui/icons-material";
import {
  useGetFrameworkTemplatesQuery,
  useCreateFrameworkFromTemplateMutation,
  useCreateComplianceFrameworkMutation,
} from "../../services/complianceService";

interface CreateFrameworkDialogProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`framework-create-tabpanel-${index}`}
      aria-labelledby={`framework-create-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

/**
 * Create Framework Dialog Component
 * Allows creating a new compliance framework from scratch or from a template
 */
const CreateFrameworkDialog: React.FC<CreateFrameworkDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // From scratch form state
  const [newFramework, setNewFramework] = useState({
    name: "",
    description: "",
    version: "1.0",
  });

  // From template form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templateFramework, setTemplateFramework] = useState({
    name: "",
    description: "",
  });

  // Queries and mutations
  const { data: templates, isLoading: isLoadingTemplates } =
    useGetFrameworkTemplatesQuery();
  const [
    createFramework,
    { isLoading: isCreating, isError: isCreateError, error: createError },
  ] = useCreateComplianceFrameworkMutation();
  const [
    createFromTemplate,
    {
      isLoading: isCreatingFromTemplate,
      isError: isTemplateError,
      error: templateError,
    },
  ] = useCreateFrameworkFromTemplateMutation();

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle from scratch form change
  const handleNewFrameworkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFramework((prev) => ({ ...prev, [name]: value }));
  };

  // Handle template form change
  const handleTemplateFrameworkChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTemplateFramework((prev) => ({ ...prev, [name]: value }));
  };

  // Handle template selection
  const handleTemplateSelection = (event: SelectChangeEvent<string>) => {
    setSelectedTemplateId(event.target.value);

    // Find the selected template
    const selected = templates?.find((t) => t.id === event.target.value);
    if (selected) {
      setTemplateFramework({
        name: `${selected.name} Copy`,
        description: selected.description || "",
      });
    }
  };

  // Create framework from scratch
  const handleCreateFramework = async () => {
    try {
      await createFramework({
        name: newFramework.name,
        description: newFramework.description,
        version: newFramework.version,
        controls: [], // Start with no controls
        categories: [], // Start with no categories
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create framework:", error);
    }
  };

  // Create framework from template
  const handleCreateFromTemplate = async () => {
    try {
      await createFromTemplate({
        templateId: selectedTemplateId,
        name: templateFramework.name,
        description: templateFramework.description,
      });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Failed to create framework from template:", error);
    }
  };

  // Reset all form state
  const resetForm = () => {
    setTabValue(0);
    setNewFramework({
      name: "",
      description: "",
      version: "1.0",
    });
    setSelectedTemplateId("");
    setTemplateFramework({
      name: "",
      description: "",
    });
  };

  // Reset form on dialog close
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Compliance Framework</DialogTitle>

      <DialogContent dividers>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="framework creation tabs"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<AddIcon />} iconPosition="start" label="Create New" />
          <Tab
            icon={<ContentCopyIcon />}
            iconPosition="start"
            label="From Template"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="subtitle1" gutterBottom>
            Create a framework from scratch
          </Typography>

          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Framework Name"
            name="name"
            value={newFramework.name}
            onChange={handleNewFrameworkChange}
            autoFocus
          />

          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={newFramework.description}
            onChange={handleNewFrameworkChange}
            multiline
            rows={3}
          />

          <TextField
            margin="normal"
            required
            id="version"
            label="Version"
            name="version"
            value={newFramework.version}
            onChange={handleNewFrameworkChange}
            sx={{ width: 120 }}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              After creating the framework, you can add controls and categorize
              them.
            </Typography>
          </Box>

          {isCreateError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(createError as any)?.data?.message ||
                "Failed to create framework. Please try again."}
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="subtitle1" gutterBottom>
            Create a framework from an existing template
          </Typography>

          <FormControl fullWidth margin="normal">
            <InputLabel id="template-select-label">Template</InputLabel>
            <Select
              labelId="template-select-label"
              id="template-select"
              value={selectedTemplateId}
              label="Template"
              onChange={handleTemplateSelection}
              disabled={isLoadingTemplates}
            >
              {isLoadingTemplates ? (
                <MenuItem value="" disabled>
                  Loading templates...
                </MenuItem>
              ) : templates && templates.length > 0 ? (
                templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No templates available
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {selectedTemplateId && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Template Details
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {templates?.find((t) => t.id === selectedTemplateId)
                    ?.description || "No description available."}
                </Typography>
              </Paper>

              <TextField
                margin="normal"
                required
                fullWidth
                id="template-name"
                label="New Framework Name"
                name="name"
                value={templateFramework.name}
                onChange={handleTemplateFrameworkChange}
              />

              <TextField
                margin="normal"
                fullWidth
                id="template-description"
                label="Description"
                name="description"
                value={templateFramework.description}
                onChange={handleTemplateFrameworkChange}
                multiline
                rows={3}
              />
            </>
          )}

          {isTemplateError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(templateError as any)?.data?.message ||
                "Failed to create framework from template. Please try again."}
            </Alert>
          )}
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {tabValue === 0 ? (
          <Button
            onClick={handleCreateFramework}
            variant="contained"
            color="primary"
            disabled={!newFramework.name || isCreating}
            startIcon={
              isCreating ? (
                <CircularProgress size={20} />
              ) : (
                <DeveloperBoardIcon />
              )
            }
          >
            {isCreating ? "Creating..." : "Create Framework"}
          </Button>
        ) : (
          <Button
            onClick={handleCreateFromTemplate}
            variant="contained"
            color="primary"
            disabled={
              !selectedTemplateId ||
              !templateFramework.name ||
              isCreatingFromTemplate
            }
            startIcon={
              isCreatingFromTemplate ? (
                <CircularProgress size={20} />
              ) : (
                <ContentCopyIcon />
              )
            }
          >
            {isCreatingFromTemplate ? "Creating..." : "Create From Template"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateFrameworkDialog;
