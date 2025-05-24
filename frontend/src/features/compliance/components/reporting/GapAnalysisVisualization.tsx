/**
 * Gap Analysis Visualization
 *
 * Visualizes gaps in compliance requirements across frameworks
 */
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Props interface
interface GapAnalysisVisualizationProps {
  framework?: string;
}

// Sample gap analysis data
const sampleGapData = {
  GDPR: {
    compliantItems: 47,
    nonCompliantItems: 15,
    notApplicableItems: 8,
    totalItems: 70,
    requirements: [
      {
        name: "Article 5 - Principles",
        compliant: 6,
        nonCompliant: 1,
        notApplicable: 0,
        total: 7,
      },
      {
        name: "Article 6 - Lawfulness",
        compliant: 5,
        nonCompliant: 1,
        notApplicable: 0,
        total: 6,
      },
      {
        name: "Article 13-14 - Information",
        compliant: 4,
        nonCompliant: 2,
        notApplicable: 1,
        total: 7,
      },
      {
        name: "Article 15-20 - Rights",
        compliant: 8,
        nonCompliant: 4,
        notApplicable: 0,
        total: 12,
      },
      {
        name: "Article 25 - Privacy by Design",
        compliant: 3,
        nonCompliant: 2,
        notApplicable: 0,
        total: 5,
      },
      {
        name: "Article 30 - Records",
        compliant: 4,
        nonCompliant: 0,
        notApplicable: 1,
        total: 5,
      },
      {
        name: "Article 32 - Security",
        compliant: 7,
        nonCompliant: 3,
        notApplicable: 0,
        total: 10,
      },
      {
        name: "Article 35 - DPIA",
        compliant: 4,
        nonCompliant: 1,
        notApplicable: 0,
        total: 5,
      },
      {
        name: "Article 37-39 - DPO",
        compliant: 3,
        nonCompliant: 0,
        notApplicable: 3,
        total: 6,
      },
      {
        name: "Other Articles",
        compliant: 3,
        nonCompliant: 1,
        notApplicable: 3,
        total: 7,
      },
    ],
  },
  "PCI-DSS": {
    compliantItems: 82,
    nonCompliantItems: 21,
    notApplicableItems: 15,
    totalItems: 118,
    requirements: [
      {
        name: "Req 1: Firewalls",
        compliant: 9,
        nonCompliant: 3,
        notApplicable: 0,
        total: 12,
      },
      {
        name: "Req 2: Defaults",
        compliant: 7,
        nonCompliant: 2,
        notApplicable: 0,
        total: 9,
      },
      {
        name: "Req 3: CHD Protection",
        compliant: 10,
        nonCompliant: 4,
        notApplicable: 0,
        total: 14,
      },
      {
        name: "Req 4: Encryption",
        compliant: 5,
        nonCompliant: 1,
        notApplicable: 2,
        total: 8,
      },
      {
        name: "Req 5: Malware",
        compliant: 5,
        nonCompliant: 0,
        notApplicable: 1,
        total: 6,
      },
      {
        name: "Req 6: Systems",
        compliant: 12,
        nonCompliant: 4,
        notApplicable: 2,
        total: 18,
      },
      {
        name: "Req 7: Access",
        compliant: 8,
        nonCompliant: 1,
        notApplicable: 0,
        total: 9,
      },
      {
        name: "Req 8: Authentication",
        compliant: 9,
        nonCompliant: 3,
        notApplicable: 0,
        total: 12,
      },
      {
        name: "Req 9: Physical",
        compliant: 6,
        nonCompliant: 0,
        notApplicable: 6,
        total: 12,
      },
      {
        name: "Req 10: Monitoring",
        compliant: 7,
        nonCompliant: 2,
        notApplicable: 0,
        total: 9,
      },
      {
        name: "Req 11: Testing",
        compliant: 7,
        nonCompliant: 1,
        notApplicable: 2,
        total: 10,
      },
      {
        name: "Req 12: Policy",
        compliant: 8,
        nonCompliant: 0,
        notApplicable: 2,
        total: 10,
      },
    ],
  },
  HIPAA: {
    compliantItems: 54,
    nonCompliantItems: 18,
    notApplicableItems: 10,
    totalItems: 82,
    requirements: [
      {
        name: "Administrative Safeguards",
        compliant: 25,
        nonCompliant: 7,
        notApplicable: 3,
        total: 35,
      },
      {
        name: "Physical Safeguards",
        compliant: 12,
        nonCompliant: 3,
        notApplicable: 5,
        total: 20,
      },
      {
        name: "Technical Safeguards",
        compliant: 15,
        nonCompliant: 7,
        notApplicable: 0,
        total: 22,
      },
      {
        name: "Organizational Requirements",
        compliant: 2,
        nonCompliant: 1,
        notApplicable: 2,
        total: 5,
      },
    ],
  },
  "ISO 27001": {
    compliantItems: 75,
    nonCompliantItems: 25,
    notApplicableItems: 14,
    totalItems: 114,
    requirements: [
      {
        name: "A.5 Information Security Policies",
        compliant: 3,
        nonCompliant: 1,
        notApplicable: 0,
        total: 4,
      },
      {
        name: "A.6 Organization of Information Security",
        compliant: 7,
        nonCompliant: 2,
        notApplicable: 0,
        total: 9,
      },
      {
        name: "A.7 Human Resource Security",
        compliant: 6,
        nonCompliant: 3,
        notApplicable: 0,
        total: 9,
      },
      {
        name: "A.8 Asset Management",
        compliant: 9,
        nonCompliant: 1,
        notApplicable: 0,
        total: 10,
      },
      {
        name: "A.9 Access Control",
        compliant: 12,
        nonCompliant: 2,
        notApplicable: 0,
        total: 14,
      },
      {
        name: "A.10 Cryptography",
        compliant: 2,
        nonCompliant: 0,
        notApplicable: 0,
        total: 2,
      },
      {
        name: "A.11 Physical Security",
        compliant: 7,
        nonCompliant: 1,
        notApplicable: 7,
        total: 15,
      },
      {
        name: "A.12 Operations Security",
        compliant: 10,
        nonCompliant: 4,
        notApplicable: 0,
        total: 14,
      },
      {
        name: "A.13 Communications Security",
        compliant: 6,
        nonCompliant: 1,
        notApplicable: 0,
        total: 7,
      },
      {
        name: "A.14 System Development",
        compliant: 8,
        nonCompliant: 5,
        notApplicable: 0,
        total: 13,
      },
      {
        name: "A.15 Supplier Relationships",
        compliant: 4,
        nonCompliant: 1,
        notApplicable: 0,
        total: 5,
      },
      {
        name: "A.16 Incident Management",
        compliant: 5,
        nonCompliant: 2,
        notApplicable: 0,
        total: 7,
      },
      {
        name: "A.17 Business Continuity",
        compliant: 3,
        nonCompliant: 1,
        notApplicable: 0,
        total: 4,
      },
      {
        name: "A.18 Compliance",
        compliant: 3,
        nonCompliant: 1,
        notApplicable: 0,
        total: 4,
      },
    ],
  },
};

/**
 * Gap Analysis Visualization Component
 */
const GapAnalysisVisualization: React.FC<GapAnalysisVisualizationProps> = ({
  framework = "ALL",
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frameworkData, setFrameworkData] = useState<any>(null);
  const [displayMode, setDisplayMode] = useState<"overview" | "detailed">(
    "overview"
  );

  // COLORS
  const COLORS = {
    compliant: theme.palette.success.main,
    nonCompliant: theme.palette.error.main,
    notApplicable: theme.palette.grey[400],
  };

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (framework === "ALL") {
          setFrameworkData({
            compliantItems: Object.values(sampleGapData).reduce(
              (sum: number, data: any) => sum + data.compliantItems,
              0
            ),
            nonCompliantItems: Object.values(sampleGapData).reduce(
              (sum: number, data: any) => sum + data.nonCompliantItems,
              0
            ),
            notApplicableItems: Object.values(sampleGapData).reduce(
              (sum: number, data: any) => sum + data.notApplicableItems,
              0
            ),
            totalItems: Object.values(sampleGapData).reduce(
              (sum: number, data: any) => sum + data.totalItems,
              0
            ),
            frameworks: Object.entries(sampleGapData).map(
              ([name, data]: [string, any]) => ({
                name,
                compliant: data.compliantItems,
                nonCompliant: data.nonCompliantItems,
                notApplicable: data.notApplicableItems,
                total: data.totalItems,
                complianceRate: Math.round(
                  (data.compliantItems /
                    (data.totalItems - data.notApplicableItems)) *
                    100
                ),
              })
            ),
          });
        } else {
          setFrameworkData(
            sampleGapData[framework as keyof typeof sampleGapData]
          );
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching gap analysis data:", err);
        setError("Failed to load gap analysis data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [framework]);

  // Calculate overall compliance percentage
  const calculateComplianceRate = () => {
    if (!frameworkData) return 0;

    const applicableItems =
      frameworkData.totalItems - frameworkData.notApplicableItems;
    return Math.round((frameworkData.compliantItems / applicableItems) * 100);
  };

  // Render pie chart for compliance overview
  const renderPieChart = () => {
    const data = [
      {
        name: "Compliant",
        value: frameworkData.compliantItems,
        color: COLORS.compliant,
      },
      {
        name: "Non-Compliant",
        value: frameworkData.nonCompliantItems,
        color: COLORS.nonCompliant,
      },
      {
        name: "Not Applicable",
        value: frameworkData.notApplicableItems,
        color: COLORS.notApplicable,
      },
    ];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} items`, ""]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render bar chart for framework comparison
  const renderFrameworkComparisonChart = () => {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={frameworkData.frameworks}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} items`, ""]} />
          <Legend />
          <Bar
            dataKey="compliant"
            stackId="a"
            name="Compliant"
            fill={COLORS.compliant}
          />
          <Bar
            dataKey="nonCompliant"
            stackId="a"
            name="Non-Compliant"
            fill={COLORS.nonCompliant}
          />
          <Bar
            dataKey="notApplicable"
            stackId="a"
            name="Not Applicable"
            fill={COLORS.notApplicable}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render detailed requirements chart
  const renderRequirementsChart = () => {
    return (
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={frameworkData.requirements}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip formatter={(value) => [`${value} items`, ""]} />
          <Legend />
          <Bar
            dataKey="compliant"
            name="Compliant"
            stackId="a"
            fill={COLORS.compliant}
          />
          <Bar
            dataKey="nonCompliant"
            name="Non-Compliant"
            stackId="a"
            fill={COLORS.nonCompliant}
          />
          <Bar
            dataKey="notApplicable"
            name="Not Applicable"
            stackId="a"
            fill={COLORS.notApplicable}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render framework stats
  const renderFrameworkStats = () => {
    const complianceRate = calculateComplianceRate();
    let complianceStatus: "success" | "warning" | "error" = "success";

    if (complianceRate < 70) {
      complianceStatus = "error";
    } else if (complianceRate < 90) {
      complianceStatus = "warning";
    }

    return (
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compliance Rate
                </Typography>
                <Typography variant="h3" color={`${complianceStatus}.main`}>
                  {complianceRate}%
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={complianceRate}
                    color={complianceStatus}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Compliant Items
                </Typography>
                <Typography variant="h3" color="success.main">
                  {frameworkData.compliantItems}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  of {frameworkData.totalItems} total requirements
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Non-Compliant Items
                </Typography>
                <Typography variant="h3" color="error.main">
                  {frameworkData.nonCompliantItems}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  requiring remediation
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Not Applicable
                </Typography>
                <Typography variant="h3" color="text.secondary">
                  {frameworkData.notApplicableItems}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  items excluded from assessment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          Gap Analysis {framework !== "ALL" && `for ${framework}`}
        </Typography>
        {framework !== "ALL" && (
          <Box>
            <Button
              variant={displayMode === "overview" ? "contained" : "outlined"}
              size="small"
              onClick={() => setDisplayMode("overview")}
              sx={{ mr: 1 }}
            >
              Overview
            </Button>
            <Button
              variant={displayMode === "detailed" ? "contained" : "outlined"}
              size="small"
              onClick={() => setDisplayMode("detailed")}
            >
              Detailed
            </Button>
          </Box>
        )}
      </Box>

      {frameworkData && (
        <>
          {framework === "ALL" ? (
            <>
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Overall Compliance Status
                </Typography>
                {renderPieChart()}
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Compliance by Framework
                </Typography>
                {renderFrameworkComparisonChart()}
              </Paper>
            </>
          ) : (
            <>
              <Paper sx={{ p: 3, mb: 4 }}>
                {renderFrameworkStats()}

                {displayMode === "overview" ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Compliance Overview
                    </Typography>
                    {renderPieChart()}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Compliance by Requirement
                    </Typography>
                    {renderRequirementsChart()}
                  </Box>
                )}
              </Paper>

              {frameworkData.nonCompliantItems > 0 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Remediation Actions
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {frameworkData.nonCompliantItems} items require remediation
                    to achieve full compliance.
                  </Typography>
                  <Button variant="contained" color="primary">
                    Generate Remediation Plan
                  </Button>
                </Paper>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default GapAnalysisVisualization;
