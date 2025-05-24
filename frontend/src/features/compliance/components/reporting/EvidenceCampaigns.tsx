/**
 * Evidence Campaigns Component
 *
 * Manages evidence collection campaigns across compliance frameworks
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  LinearProgress,
  Divider,
  Tab,
  Tabs,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Launch as LaunchIcon,
  Archive as ArchiveIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

// Import types
import { EvidenceCampaign } from "../../types/evidenceTypes";

// Props interface
interface EvidenceCampaignsProps {
  framework?: string;
}

/**
 * Evidence Campaigns Component
 */
const EvidenceCampaigns: React.FC<EvidenceCampaignsProps> = ({ framework }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<EvidenceCampaign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  // Sample data
  const sampleCampaigns: EvidenceCampaign[] = [
    {
      id: "campaign-1",
      name: "Annual GDPR Evidence Collection",
      description: "Annual collection of GDPR compliance evidence",
      framework: "GDPR",
      startDate: "2025-05-01T00:00:00Z",
      endDate: "2025-05-31T23:59:59Z",
      status: "active",
      created: "2025-04-15T10:00:00Z",
      createdBy: "John Smith",
      items: [
        {
          id: "item-1",
          requirement: "Article 30 - Records of processing",
          description: "Updated records of processing activities",
          status: "collected",
          assignedTo: "David Kim",
          dueDate: "2025-05-15T00:00:00Z",
          evidenceId: "ev-123",
          notes: "Completed on schedule",
        },
        {
          id: "item-2",
          requirement: "Article 35 - DPIA",
          description: "Data Protection Impact Assessment for new processing",
          status: "pending",
          assignedTo: "Sarah Wilson",
          dueDate: "2025-05-20T00:00:00Z",
        },
        {
          id: "item-3",
          requirement: "Article 28 - Processor",
          description: "Updated processor agreements",
          status: "verified",
          assignedTo: "Mike Johnson",
          dueDate: "2025-05-10T00:00:00Z",
          evidenceId: "ev-124",
          notes: "All processor agreements verified",
        },
      ],
    },
    {
      id: "campaign-2",
      name: "Q2 PCI-DSS Evidence Collection",
      description: "Quarterly PCI-DSS compliance evidence collection",
      framework: "PCI-DSS",
      startDate: "2025-04-01T00:00:00Z",
      endDate: "2025-06-30T23:59:59Z",
      status: "active",
      created: "2025-03-20T14:30:00Z",
      createdBy: "Emily Chen",
      items: [
        {
          id: "item-1",
          requirement: "Requirement 11.2 - Vulnerability Scans",
          description: "Quarterly vulnerability scan results",
          status: "collected",
          assignedTo: "Robert Chen",
          dueDate: "2025-04-15T00:00:00Z",
          evidenceId: "ev-125",
          notes: "Scan completed by third-party provider",
        },
        {
          id: "item-2",
          requirement: "Requirement 10.6 - Log Reviews",
          description: "Evidence of daily log reviews",
          status: "pending",
          assignedTo: "Lisa Johnson",
          dueDate: "2025-06-15T00:00:00Z",
        },
      ],
    },
    {
      id: "campaign-3",
      name: "ISO 27001 Certification Preparation",
      description: "Collection of evidence for ISO 27001 certification audit",
      framework: "ISO 27001",
      startDate: "2025-03-01T00:00:00Z",
      endDate: "2025-07-31T23:59:59Z",
      status: "active",
      created: "2025-02-15T09:45:00Z",
      createdBy: "Jane Doe",
      items: [
        {
          id: "item-1",
          requirement: "A.5 - Information security policies",
          description: "Updated information security policies",
          status: "verified",
          assignedTo: "John Smith",
          dueDate: "2025-03-15T00:00:00Z",
          evidenceId: "ev-126",
          notes: "Policies approved by management",
        },
        {
          id: "item-2",
          requirement: "A.8 - Asset management",
          description: "Asset inventory and classification",
          status: "collected",
          assignedTo: "Sarah Wilson",
          dueDate: "2025-04-01T00:00:00Z",
          evidenceId: "ev-127",
          notes: "Inventory complete, pending verification",
        },
        {
          id: "item-3",
          requirement: "A.12 - Operations security",
          description: "Operational procedures and responsibilities",
          status: "pending",
          assignedTo: "Mike Johnson",
          dueDate: "2025-05-01T00:00:00Z",
        },
        {
          id: "item-4",
          requirement: "A.18 - Compliance",
          description: "Identification of applicable legislation",
          status: "pending",
          assignedTo: "Lisa Johnson",
          dueDate: "2025-06-01T00:00:00Z",
        },
      ],
    },
    {
      id: "campaign-4",
      name: "Q1 2025 HIPAA Compliance Review",
      description: "First quarter HIPAA compliance evidence collection",
      framework: "HIPAA",
      startDate: "2025-01-01T00:00:00Z",
      endDate: "2025-03-31T23:59:59Z",
      status: "completed",
      created: "2024-12-15T11:20:00Z",
      createdBy: "Emily Chen",
      items: [
        {
          id: "item-1",
          requirement: "§ 164.308(a)(1) - Risk Analysis",
          description: "Updated risk analysis documentation",
          status: "verified",
          assignedTo: "David Kim",
          dueDate: "2025-02-15T00:00:00Z",
          evidenceId: "ev-128",
          notes: "Risk analysis completed and approved",
        },
        {
          id: "item-2",
          requirement: "§ 164.312(a)(1) - Access Control",
          description: "Access control audit results",
          status: "verified",
          assignedTo: "Sarah Wilson",
          dueDate: "2025-03-01T00:00:00Z",
          evidenceId: "ev-129",
          notes: "Access controls confirmed effective",
        },
        {
          id: "item-3",
          requirement: "§ 164.312(e)(1) - Transmission Security",
          description: "Evidence of encrypted transmissions",
          status: "verified",
          assignedTo: "Robert Chen",
          dueDate: "2025-03-15T00:00:00Z",
          evidenceId: "ev-130",
          notes: "All transmissions properly encrypted",
        },
      ],
    },
  ];

  // Load campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Filter campaigns by framework if specified
        const filteredCampaigns = framework
          ? sampleCampaigns.filter((c) => c.framework === framework)
          : sampleCampaigns;

        setCampaigns(filteredCampaigns);
        setError(null);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to load evidence campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [framework]);

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Calculate filtered campaigns based on tab
  const getFilteredCampaigns = () => {
    if (tabValue === 0) {
      return campaigns.filter((c) => c.status === "active");
    } else if (tabValue === 1) {
      return campaigns.filter((c) => c.status === "completed");
    } else if (tabValue === 2) {
      return campaigns.filter((c) => c.status === "draft");
    } else {
      return campaigns.filter((c) => c.status === "archived");
    }
  };

  // Calculate campaign statistics
  const calculateCampaignStats = (campaign: EvidenceCampaign) => {
    const total = campaign.items.length;
    const collected = campaign.items.filter(
      (i) => i.status === "collected" || i.status === "verified"
    ).length;
    const verified = campaign.items.filter(
      (i) => i.status === "verified"
    ).length;
    const percentComplete =
      total > 0 ? Math.round((collected / total) * 100) : 0;

    return { total, collected, verified, percentComplete };
  };

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    campaignId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaignId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
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

  // Get filtered campaigns
  const filteredCampaigns = getFilteredCampaigns();

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h6">
          Evidence Campaigns {framework ? `(${framework})` : ""}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Campaign
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Active" />
          <Tab label="Completed" />
          <Tab label="Draft" />
          <Tab label="Archived" />
        </Tabs>
      </Box>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No campaigns found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {tabValue === 0
              ? 'There are no active campaigns. Click "New Campaign" to create one.'
              : "No campaigns match the selected filter."}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredCampaigns.map((campaign) => {
            const stats = calculateCampaignStats(campaign);

            return (
              <Grid item xs={12} md={6} lg={4} key={campaign.id}>
                <Card variant="outlined">
                  <CardContent sx={{ pb: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" noWrap sx={{ maxWidth: "80%" }}>
                        {campaign.name}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label="more"
                        onClick={(e) => handleMenuOpen(e, campaign.id)}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Chip
                      label={campaign.framework}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />

                    <Typography variant="body2" color="textSecondary" paragraph>
                      {campaign.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="textSecondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {stats.percentComplete}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stats.percentComplete}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                        >
                          Due Date
                        </Typography>
                        <Typography variant="body2">
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                        >
                          Items
                        </Typography>
                        <Typography variant="body2">
                          {stats.collected}/{stats.total} Collected
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                        >
                          Verified
                        </Typography>
                        <Typography variant="body2">
                          {stats.verified}/{stats.total}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  <Divider />

                  <CardActions>
                    <Button size="small" startIcon={<LaunchIcon />} fullWidth>
                      View Campaign
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Campaign menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {tabValue === 0 && (
          <MenuItem onClick={handleMenuClose}>
            <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
            Mark as Completed
          </MenuItem>
        )}
        <MenuItem
          onClick={handleMenuClose}
          sx={{ color: theme.palette.error.main }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Campaign
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EvidenceCampaigns;
