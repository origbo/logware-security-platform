import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
// import { useGetComplianceTrendsQuery } from "../../services/complianceService";
// Creating a mock since this query isn't exported from complianceService
const useGetComplianceTrendsQuery = (period: string = "30days") => {
  // Generate 30 days of mock data
  const generateMockData = () => {
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random scores with an upward trend
      const awsBase = 65 + (i * 0.5) + (Math.random() * 5 - 2.5);
      const azureBase = 70 + (i * 0.4) + (Math.random() * 5 - 2.5);
      const gcpBase = 75 + (i * 0.3) + (Math.random() * 5 - 2.5);
      
      data.push({
        date: dateStr,
        aws: Math.min(100, Math.max(0, Math.round(awsBase))),
        azure: Math.min(100, Math.max(0, Math.round(azureBase))),
        gcp: Math.min(100, Math.max(0, Math.round(gcpBase))),
        overall: Math.min(100, Math.max(0, Math.round((awsBase + azureBase + gcpBase) / 3)))
      });
    }
    
    return data;
  };
  
  return {
    data: generateMockData(),
    isLoading: false,
    error: null,
    refetch: () => console.log(`Refetching trend data for period: ${period}`)
  };
};
import { CloudProvider } from "../../types/cloudSecurityTypes";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

/**
 * Trends Tab Component
 * Displays compliance trends over time across all cloud providers
 */
const TrendsTab: React.FC = () => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState<
    "week" | "month" | "quarter" | "year"
  >("month");

  // Fetch compliance trends data
  const { data, isLoading, isError, error } = useGetComplianceTrendsQuery({
    timeframe,
  });

  // Handle timeframe change
  const handleTimeframeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeframe: "week" | "month" | "quarter" | "year"
  ) => {
    if (newTimeframe !== null) {
      setTimeframe(newTimeframe);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading compliance trends data:{" "}
        {(error as any)?.data?.message || "Unknown error"}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No compliance trends data available.
      </Alert>
    );
  }

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: timeframe === "year" ? "numeric" : undefined,
    }).format(date);
  };

  // Prepare overall trends data
  const overallTrendsData = data.overallTrends.map((point: any) => ({
    ...point,
    date: formatDate(point.date),
  }));

  // Prepare provider trends data
  const providerTrendsData = data.providerTrends.map((point: any) => ({
    ...point,
    date: formatDate(point.date),
  }));

  // Prepare framework trends data
  const frameworkTrendsData = data.frameworkTrends.map((point: any) => ({
    ...point,
    date: formatDate(point.date),
  }));

  // Get color for provider line
  const getProviderColor = (provider: CloudProvider) => {
    switch (provider) {
      case CloudProvider.AWS:
        return "#FF9900"; // AWS orange
      case CloudProvider.AZURE:
        return "#0089D6"; // Azure blue
      case CloudProvider.GCP:
        return "#4285F4"; // GCP blue
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Box>
      {/* Timeframe selection */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Compliance Trends</Typography>

        <ToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={handleTimeframeChange}
          aria-label="timeframe"
          size="small"
        >
          <ToggleButton value="week" aria-label="week">
            Week
          </ToggleButton>
          <ToggleButton value="month" aria-label="month">
            Month
          </ToggleButton>
          <ToggleButton value="quarter" aria-label="quarter">
            Quarter
          </ToggleButton>
          <ToggleButton value="year" aria-label="year">
            Year
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Overall Compliance Trend */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Overall Compliance Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={overallTrendsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Compliance Score"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="complianceScore"
                    name="Compliance Score"
                    stroke={theme.palette.primary.main}
                    fill={alpha(theme.palette.primary.main, 0.2)}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Provider Compliance Trends */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Provider Compliance Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={providerTrendsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Compliance Score"]}
                  />
                  <Legend />
                  {Object.values(CloudProvider).map((provider) => (
                    <Line
                      key={provider}
                      type="monotone"
                      dataKey={`${provider}Score`}
                      name={`${provider.toUpperCase()}`}
                      stroke={getProviderColor(provider as CloudProvider)}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Framework Compliance Trends */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Framework Compliance Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={frameworkTrendsData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Compliance Score"]}
                  />
                  <Legend />
                  {data.frameworks.map((framework: any, index: number) => (
                    <Line
                      key={framework.id}
                      type="monotone"
                      dataKey={`framework${index}Score`}
                      name={framework.name}
                      stroke={
                        theme.palette.secondary[
                          `${index % 5 === 0 ? "main" : (index % 5) * 100}`
                        ]
                      }
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Compliance Statistics Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {/* AWS Change Card */}
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    AWS Compliance Change
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="h4"
                      color={
                        data.changes.aws >= 0 ? "success.main" : "error.main"
                      }
                    >
                      {data.changes.aws > 0 ? "+" : ""}
                      {data.changes.aws}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {`In the past ${timeframe}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Azure Change Card */}
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Azure Compliance Change
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="h4"
                      color={
                        data.changes.azure >= 0 ? "success.main" : "error.main"
                      }
                    >
                      {data.changes.azure > 0 ? "+" : ""}
                      {data.changes.azure}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {`In the past ${timeframe}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* GCP Change Card */}
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    GCP Compliance Change
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="h4"
                      color={
                        data.changes.gcp >= 0 ? "success.main" : "error.main"
                      }
                    >
                      {data.changes.gcp > 0 ? "+" : ""}
                      {data.changes.gcp}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {`In the past ${timeframe}`}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrendsTab;
