import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Psychology as PsychologyIcon,
  InsightsOutlined as InsightsIcon,
  LightbulbOutlined as LightbulbIcon,
  WarningOutlined as WarningIcon,
  FactCheckOutlined as FactCheckIcon,
  HelpOutline as HelpIcon,
  TrendingUp as TrendingUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { useExplainAnomalyQuery } from "../../services/anomalyService";
import { Anomaly } from "../../types/anomalyTypes";

interface ExplainableAIProps {
  anomaly: Anomaly;
}

const ExplainableAI: React.FC<ExplainableAIProps> = ({ anomaly }) => {
  const theme = useTheme();
  const [expandedFactors, setExpandedFactors] = useState<boolean>(false);

  // Fetch explanation data for the anomaly
  const {
    data: explanation,
    isLoading,
    error,
  } = useExplainAnomalyQuery(anomaly.id);

  // Toggle expanded factors
  const toggleFactors = () => {
    setExpandedFactors(!expandedFactors);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 3,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Generating explanation with AI...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        Error loading explanation: {JSON.stringify(error)}
      </Alert>
    );
  }

  if (!explanation) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No explanation available for this anomaly.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Primary Explanation */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <PsychologyIcon
            sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 32 }}
          />
          <Box>
            <Typography variant="h6" gutterBottom>
              AI Explanation
            </Typography>
            <Typography variant="body1">{explanation.explanation}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Key Factors */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <InsightsIcon sx={{ mr: 1 }} /> Key Detection Factors
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Factor</TableCell>
              <TableCell>Contribution</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {explanation.factors
              .slice(0, expandedFactors ? undefined : 5)
              .map((factor, index) => (
                <TableRow key={index} hover>
                  <TableCell width="25%">
                    <Typography variant="body2" fontWeight="medium">
                      {factor.factor}
                    </Typography>
                  </TableCell>
                  <TableCell width="20%">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ width: "70%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={factor.weight * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: theme.palette.primary.main,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        {Math.round(factor.weight * 100)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {factor.description}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {explanation.factors.length > 5 && (
          <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
            <Button
              size="small"
              onClick={toggleFactors}
              endIcon={
                <KeyboardArrowDownIcon
                  sx={{
                    transform: expandedFactors
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              }
            >
              {expandedFactors
                ? "Show Less"
                : `Show ${explanation.factors.length - 5} More Factors`}
            </Button>
          </Box>
        )}
      </TableContainer>

      {/* Similar Incidents */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <FactCheckIcon sx={{ mr: 1 }} /> Similar Incidents
      </Typography>
      {explanation.similarIncidents &&
      explanation.similarIncidents.length > 0 ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {explanation.similarIncidents.map((incident, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {incident.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mr: 1 }}
                    >
                      Similarity:
                    </Typography>
                    <Rating
                      value={incident.similarity * 5}
                      precision={0.5}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {Math.round(incident.similarity * 100)}%
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Button size="small" variant="text">
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mb: 3 }}>
          No similar incidents found.
        </Alert>
      )}

      {/* Recommendations */}
      {explanation.visualData && (
        <>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center" }}
          >
            <TrendingUpIcon sx={{ mr: 1 }} /> Visual Insights
          </Typography>
          <Paper
            sx={{
              height: 300,
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: alpha("#000", 0.02),
              border: "1px dashed #ccc",
            }}
          >
            <Typography color="textSecondary">
              Visualization of Anomaly Data
            </Typography>
          </Paper>
        </>
      )}

      {/* Explainability Trust Factors */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <LightbulbIcon sx={{ mr: 1 }} /> Understanding The Explanation
      </Typography>
      <Paper
        sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), mb: 3 }}
      >
        <List dense disablePadding>
          <ListItem>
            <ListItemIcon>
              <Tooltip title="Model Transparency">
                <HelpIcon color="info" />
              </Tooltip>
            </ListItemIcon>
            <ListItemText
              primary="Model Type and Approach"
              secondary="This explanation is generated by an interpretable ML model that analyzes anomalous patterns in behavior."
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <Tooltip title="Confidence Level">
                <HelpIcon color="info" />
              </Tooltip>
            </ListItemIcon>
            <ListItemText
              primary="Confidence Factors"
              secondary="The confidence score is based on the strength and number of anomalous patterns detected."
            />
          </ListItem>
          <Divider component="li" />
          <ListItem>
            <ListItemIcon>
              <Tooltip title="Limitations">
                <WarningIcon color="warning" />
              </Tooltip>
            </ListItemIcon>
            <ListItemText
              primary="Explanation Limitations"
              secondary="This AI explanation provides likely reasons for detection, but human review is recommended for final decisions."
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default ExplainableAI;
