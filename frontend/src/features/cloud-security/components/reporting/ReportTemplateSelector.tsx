/**
 * Report Template Selector Component
 *
 * Displays available report templates and allows selection
 */
import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Avatar,
  CircularProgress,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Description as ReportIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  AccountTree as ResourceIcon,
  Gavel as ComplianceIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useGetReportTemplatesQuery } from "../../services/reportingService";

// Default templates to use if API isn't available yet
const defaultTemplates = [
  {
    id: "executive-summary",
    name: "Executive Summary",
    description:
      "High-level security posture overview for executives and stakeholders.",
    icon: "assessment",
    iconColor: "#5664d2",
    tags: ["Executive", "Summary", "Overview"],
    lastUsed: "2025-04-15",
  },
  {
    id: "security-findings",
    name: "Security Findings Report",
    description:
      "Detailed findings across all cloud providers with remediation guidance.",
    icon: "security",
    iconColor: "#d32f2f",
    tags: ["Technical", "Findings", "Remediation"],
    lastUsed: "2025-05-10",
  },
  {
    id: "data-protection",
    name: "Data Protection Assessment",
    description: "Focused report on data storage security and access controls.",
    icon: "storage",
    iconColor: "#388e3c",
    tags: ["Storage", "Data", "Protection"],
    lastUsed: null,
  },
  {
    id: "resource-inventory",
    name: "Resource Security Inventory",
    description:
      "Comprehensive inventory of cloud resources with security status.",
    icon: "account_tree",
    iconColor: "#ff9800",
    tags: ["Inventory", "Resources", "Assets"],
    lastUsed: "2025-03-22",
  },
  {
    id: "compliance-posture",
    name: "Compliance Posture Report",
    description:
      "Security posture mapped to compliance frameworks (HIPAA, PCI, ISO, etc).",
    icon: "gavel",
    iconColor: "#7b1fa2",
    tags: ["Compliance", "Regulatory", "Frameworks"],
    lastUsed: "2025-05-01",
  },
  {
    id: "custom-report",
    name: "Custom Report",
    description:
      "Create a fully customized report with selected metrics and findings.",
    icon: "description",
    iconColor: "#0288d1",
    tags: ["Custom", "Flexible"],
    lastUsed: null,
  },
];

interface ReportTemplateSelectorProps {
  onSelect: (templateId: string) => void;
  selectedTemplateId: string | null;
}

/**
 * Report Template Selector Component
 */
const ReportTemplateSelector: React.FC<ReportTemplateSelectorProps> = ({
  onSelect,
  selectedTemplateId,
}) => {
  const theme = useTheme();

  // Fetch report templates from API
  const { data: templates, isLoading, isError } = useGetReportTemplatesQuery();

  // Select first template if none selected and templates are loaded
  useEffect(() => {
    if (templates?.length && !selectedTemplateId) {
      onSelect(templates[0].id);
    }
  }, [templates, selectedTemplateId, onSelect]);

  // Helper to get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "assessment":
        return <AssessmentIcon />;
      case "security":
        return <SecurityIcon />;
      case "storage":
        return <StorageIcon />;
      case "account_tree":
        return <ResourceIcon />;
      case "gavel":
        return <ComplianceIcon />;
      case "description":
        return <ReportIcon />;
      default:
        return <ReportIcon />;
    }
  };

  // When templates are loading
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  // When error occurs
  if (isError) {
    return (
      <Box sx={{ textAlign: "center", p: 3 }}>
        <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography color="error" gutterBottom>
          Failed to load report templates
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Using default templates instead
        </Typography>
      </Box>
    );
  }

  // Use API data if available, otherwise fall back to default templates
  const reportTemplates = templates || defaultTemplates;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Report Template
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Choose a template as the starting point for your security report.
      </Typography>

      <Grid container spacing={3}>
        {reportTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{
                height: "100%",
                border:
                  template.id === selectedTemplateId
                    ? `2px solid ${theme.palette.primary.main}`
                    : "1px solid transparent",
                boxShadow:
                  template.id === selectedTemplateId
                    ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`
                    : undefined,
              }}
            >
              <CardActionArea
                sx={{ height: "100%" }}
                onClick={() => onSelect(template.id)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(template.iconColor, 0.1),
                        color: template.iconColor,
                        mr: 2,
                      }}
                    >
                      {templates
                        ? getIconComponent(template.icon)
                        : template.icon}
                    </Avatar>
                    <Typography variant="h6">{template.name}</Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mb: 2 }}
                  >
                    {template.description}
                  </Typography>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {template.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ fontSize: "0.7rem" }}
                      />
                    ))}

                    {template.lastUsed && (
                      <Chip
                        label={`Last used: ${new Date(
                          template.lastUsed
                        ).toLocaleDateString()}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", ml: "auto" }}
                      />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportTemplateSelector;
