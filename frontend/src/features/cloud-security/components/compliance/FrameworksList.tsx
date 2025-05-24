import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  IconButton,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  alpha,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  FileCopy as CopyIcon,
  Description as DescriptionIcon,
  VerifiedUser as VerifiedUserIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import {
  useDeleteComplianceFrameworkMutation,
  useExportFrameworkAsTemplateMutation,
} from "../../services/complianceService";
import {
  ComplianceFramework,
  ComplianceStatus,
} from "../../types/cloudSecurityTypes";
import { useNavigate } from "react-router-dom";

interface FrameworksListProps {
  frameworks: ComplianceFramework[];
}

/**
 * Frameworks List Component
 * Displays a grid of compliance frameworks with key information and actions
 */
const FrameworksList: React.FC<FrameworksListProps> = ({ frameworks }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Delete framework mutation
  const [deleteFramework, { isLoading: isDeleting }] =
    useDeleteComplianceFrameworkMutation();

  // Export framework as template mutation
  const [exportAsTemplate, { isLoading: isExporting }] =
    useExportFrameworkAsTemplateMutation();

  // Handle opening the framework menu
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    frameworkId: string
  ) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedFrameworkId(frameworkId);
  };

  // Handle closing the framework menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle framework view
  const handleViewFramework = (frameworkId: string) => {
    navigate(`/cloud-security/compliance/frameworks/${frameworkId}`);
    handleMenuClose();
  };

  // Handle framework edit
  const handleEditFramework = (frameworkId: string) => {
    navigate(`/cloud-security/compliance/frameworks/${frameworkId}/edit`);
    handleMenuClose();
  };

  // Handle framework delete
  const handleDeleteFramework = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  // Confirm framework delete
  const confirmDeleteFramework = async () => {
    if (selectedFrameworkId) {
      try {
        await deleteFramework({ frameworkId: selectedFrameworkId });
      } catch (error) {
        console.error("Failed to delete framework:", error);
      }
    }
    setDeleteDialogOpen(false);
  };

  // Handle running an assessment
  const handleRunAssessment = (frameworkId: string) => {
    navigate(
      `/cloud-security/compliance/assessments/new?frameworkId=${frameworkId}`
    );
    handleMenuClose();
  };

  // Handle framework export as template
  const handleExportAsTemplate = async (frameworkId: string) => {
    try {
      const framework = frameworks.find((f) => f.id === frameworkId);
      if (framework) {
        await exportAsTemplate({
          frameworkId,
          name: `${framework.name} Template`,
          description: `Template created from ${framework.name}`,
        });
      }
    } catch (error) {
      console.error("Failed to export framework as template:", error);
    }
    handleMenuClose();
  };

  // Calculate compliance score
  const getComplianceScore = (framework: ComplianceFramework) => {
    if (!framework.controls || framework.controls.length === 0) return 0;

    const compliantCount = framework.controls.filter(
      (c) => c.status === ComplianceStatus.COMPLIANT
    ).length;

    return Math.round((compliantCount / framework.controls.length) * 100);
  };

  // Get status color based on compliance score
  const getStatusColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.success.light;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get status text based on compliance score
  const getStatusText = (score: number) => {
    if (score >= 90) return "Compliant";
    if (score >= 70) return "Mostly Compliant";
    if (score >= 50) return "Partially Compliant";
    return "Non-Compliant";
  };

  return (
    <Box>
      {frameworks.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <DescriptionIcon
            sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom>
            No Compliance Frameworks
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Start by creating a new compliance framework or using a template.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DescriptionIcon />}
          >
            Create First Framework
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {frameworks.map((framework) => {
            const complianceScore = getComplianceScore(framework);
            const statusColor = getStatusColor(complianceScore);
            const statusText = getStatusText(complianceScore);

            return (
              <Grid item xs={12} sm={6} md={4} key={framework.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardHeader
                    title={framework.name}
                    subheader={`Version ${framework.version}`}
                    action={
                      <IconButton
                        aria-label="framework options"
                        onClick={(e) => handleMenuOpen(e, framework.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    }
                    titleTypographyProps={{ variant: "h6" }}
                  />

                  <Divider />

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {framework.description}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        gutterBottom
                      >
                        Compliance Status
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Box sx={{ flexGrow: 1, mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={complianceScore}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha(statusColor, 0.2),
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 4,
                                backgroundColor: statusColor,
                              },
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ minWidth: 35 }}
                        >
                          {complianceScore}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Chip
                          label={statusText}
                          size="small"
                          sx={{
                            bgcolor: alpha(statusColor, 0.1),
                            color: statusColor,
                            fontWeight: 500,
                          }}
                        />
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 3,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Controls
                        </Typography>
                        <Typography variant="body2">
                          {framework.controls.length}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Categories
                        </Typography>
                        <Typography variant="body2">
                          {framework.categories?.length || 0}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body2">
                          {new Date().toLocaleDateString()}{" "}
                          {/* This would come from API */}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Divider />

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<VerifiedUserIcon />}
                      onClick={() => handleRunAssessment(framework.id)}
                    >
                      Run Assessment
                    </Button>
                    <Button
                      size="small"
                      endIcon={<LaunchIcon />}
                      onClick={() => handleViewFramework(framework.id)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Framework Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            selectedFrameworkId && handleViewFramework(selectedFrameworkId)
          }
        >
          <AssessmentIcon fontSize="small" sx={{ mr: 1.5 }} />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedFrameworkId && handleRunAssessment(selectedFrameworkId)
          }
        >
          <VerifiedUserIcon fontSize="small" sx={{ mr: 1.5 }} />
          Run Assessment
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedFrameworkId && handleEditFramework(selectedFrameworkId)
          }
        >
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit Framework
        </MenuItem>
        <MenuItem
          onClick={() =>
            selectedFrameworkId && handleExportAsTemplate(selectedFrameworkId)
          }
        >
          <CopyIcon fontSize="small" sx={{ mr: 1.5 }} />
          Export as Template
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleDeleteFramework}
          sx={{ color: theme.palette.error.main }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Delete Framework
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Compliance Framework</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this compliance framework? This
            action cannot be undone and all related assessments will also be
            deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteFramework}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FrameworksList;
