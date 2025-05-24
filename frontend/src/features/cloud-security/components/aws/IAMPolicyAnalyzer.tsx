import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import {
  Warning as WarningIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  DeleteOutline as DeleteIcon,
  FileCopy as CopyIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
  Code as CodeIcon,
  History as HistoryIcon,
  Storage as StorageIcon,
  Group as GroupIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  useGetIAMPoliciesQuery,
  useGetIAMRolesQuery,
  useGetIAMUsersQuery,
  useAnalyzePolicyDocumentMutation,
} from "../../services/awsSecurityService";
// Mock implementation for CodeMirror since we can't install dependencies
// Replace with comment describing the missing imports
// import { json as jsonHighlight } from "@codemirror/lang-json";
// import CodeMirror from "@uiw/react-codemirror";

// Custom code editor component to replace CodeMirror
const SimpleCodeEditor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  height?: string;
}> = ({ value, onChange, height = "300px" }) => {
  const theme = useTheme();
  
  return (
    <TextField
      multiline
      fullWidth
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{
        fontFamily: "monospace",
        backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
        '.MuiInputBase-root': {
          height,
          fontFamily: "'Roboto Mono', monospace",
          fontSize: "0.875rem",
        }
      }}
    />
  );
};

interface IAMPolicyAnalyzerProps {
  accountId: string;
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
      id={`policy-tabpanel-${index}`}
      aria-labelledby={`policy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * IAM Policy Analyzer Component
 * Analyzes IAM policies for security issues and provides remediation guidance
 */
const IAMPolicyAnalyzer: React.FC<IAMPolicyAnalyzerProps> = ({ accountId }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [policyDocument, setPolicyDocument] = useState<string>(
    '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": ["s3:GetObject"],\n      "Resource": ["arn:aws:s3:::example-bucket/*"]\n    }\n  ]\n}'
  );
  const [policyError, setPolicyError] = useState<string | null>(null);

  // Fetch IAM policies
  const { data: policies, isLoading: isPoliciesLoading } =
    useGetIAMPoliciesQuery({ accountId });

  // Fetch IAM roles
  const { data: roles, isLoading: isRolesLoading } = useGetIAMRolesQuery({
    accountId,
  });

  // Fetch IAM users
  const { data: users, isLoading: isUsersLoading } = useGetIAMUsersQuery({
    accountId,
  });

  // Analyze policy document mutation
  const [
    analyzePolicyDocument,
    {
      data: analysisResult,
      isLoading: isAnalysisLoading,
      isError: isAnalysisError,
      error: analysisError,
    },
  ] = useAnalyzePolicyDocumentMutation();

  // Policy evaluation results
  const [evaluationResults, setEvaluationResults] = useState<any | null>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle policy selection
  const handlePolicySelection = (policy: any) => {
    setSelectedPolicy(policy);
    try {
      // Format and set the policy document
      const document = JSON.stringify(policy.Document || {}, null, 2);
      setPolicyDocument(document);
      setPolicyError(null);
    } catch (err) {
      setPolicyError("Failed to parse policy document");
    }
  };

  // Handle policy document change
  const handlePolicyDocumentChange = (value: string) => {
    setPolicyDocument(value);
    setPolicyError(null);
  };

  // Analyze policy for security issues
  const handleAnalyzePolicy = async () => {
    try {
      // Parse the policy document
      const policyObject = JSON.parse(policyDocument);

      // Make the analysis request
      await analyzePolicyDocument({
        accountId,
        policyDocument: policyObject,
      });

      // Simulate results (this would come from the API in a real implementation)
      setEvaluationResults({
        securityIssues: [
          {
            severity: "high",
            title: "Overly permissive IAM policy",
            description:
              "The policy contains wildcard (*) permissions which grant more access than necessary.",
            remediation:
              "Limit permissions to specific resources and actions required for the task.",
            affectedStatements: [0],
          },
          {
            severity: "medium",
            title: "Missing condition constraints",
            description:
              "Policy does not specify conditions to restrict access based on network source, time, or MFA.",
            remediation:
              "Add conditions to limit when and how the permissions can be used.",
            affectedStatements: [0],
          },
        ],
        bestPractices: [
          {
            title: "Use Least Privilege Principle",
            description: "Only grant the permissions needed to perform a task.",
            status: "warning",
          },
          {
            title: "MFA Requirement",
            description: "Require MFA for sensitive operations.",
            status: "warning",
          },
          {
            title: "Version Specified",
            description: "Policy includes the recommended version.",
            status: "pass",
          },
        ],
        serviceAccess: [
          { service: "S3", actions: ["GetObject"], status: "allowed" },
          {
            service: "S3",
            actions: ["PutObject", "DeleteObject"],
            status: "implicitly_denied",
          },
          { service: "EC2", actions: ["*"], status: "implicitly_denied" },
        ],
      });
    } catch (err) {
      setPolicyError("Invalid JSON format in policy document");
      setEvaluationResults(null);
    }
  };

  // Reset/clear the policy document
  const handleClearPolicy = () => {
    setPolicyDocument(
      '{\n  "Version": "2012-10-17",\n  "Statement": [\n  ]\n}'
    );
    setSelectedPolicy(null);
    setEvaluationResults(null);
    setPolicyError(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" component="h2">
          IAM Policy Analyzer
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left side - Policy Editor */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Policy Document
            </Typography>

            <Box
              sx={{
                borderRadius: 1,
                mb: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <TextField
                value={policyDocument}
                onChange={(e) => handlePolicyDocumentChange(e.target.value)}
                multiline
                fullWidth
                variant="outlined"
                rows={15}
                inputProps={{
                  style: { fontFamily: 'monospace' }
                }}
              />
            </Box>

            {policyError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {policyError}
              </Alert>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAnalyzePolicy}
                  disabled={isAnalysisLoading}
                  sx={{ mr: 1 }}
                >
                  {isAnalysisLoading ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Analyze Policy"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleClearPolicy}
                  disabled={isAnalysisLoading}
                >
                  Clear
                </Button>
              </Box>
              <Box>
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    onClick={() =>
                      navigator.clipboard.writeText(policyDocument)
                    }
                  >
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Upload policy">
                  <IconButton>
                    <UploadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>

          {/* Analysis Results */}
          {evaluationResults && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Results
              </Typography>

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="policy analysis tabs"
                sx={{ mb: 2 }}
              >
                <Tab label="Security Issues" />
                <Tab label="Best Practices" />
                <Tab label="Service Access" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                {evaluationResults.securityIssues.length > 0 ? (
                  <List>
                    {evaluationResults.securityIssues.map(
                      (issue: any, index: number) => (
                        <Paper key={index} sx={{ mb: 2, p: 2 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            {issue.severity === "high" && (
                              <WarningIcon color="error" sx={{ mr: 1 }} />
                            )}
                            {issue.severity === "medium" && (
                              <WarningIcon color="warning" sx={{ mr: 1 }} />
                            )}
                            {issue.severity === "low" && (
                              <WarningIcon color="info" sx={{ mr: 1 }} />
                            )}
                            <Typography variant="subtitle1">
                              {issue.title}
                              <Chip
                                label={issue.severity.toUpperCase()}
                                size="small"
                                color={
                                  issue.severity === "high"
                                    ? "error"
                                    : issue.severity === "medium"
                                    ? "warning"
                                    : "info"
                                }
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                          </Box>

                          <Typography variant="body2" sx={{ ml: 4, mb: 1 }}>
                            {issue.description}
                          </Typography>

                          <Divider sx={{ my: 1.5 }} />

                          <Typography
                            variant="subtitle2"
                            sx={{ ml: 4, mb: 0.5 }}
                          >
                            Remediation:
                          </Typography>
                          <Typography variant="body2" sx={{ ml: 4 }}>
                            {issue.remediation}
                          </Typography>
                        </Paper>
                      )
                    )}
                  </List>
                ) : (
                  <Alert severity="success">
                    No security issues found in this policy.
                  </Alert>
                )}
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Best Practice</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {evaluationResults.bestPractices.map(
                        (practice: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{practice.title}</TableCell>
                            <TableCell>{practice.description}</TableCell>
                            <TableCell align="center">
                              {practice.status === "pass" ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <WarningIcon color="warning" />
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={tabValue} index={2}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Service</TableCell>
                        <TableCell>Actions</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {evaluationResults.serviceAccess.map(
                        (access: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{access.service}</TableCell>
                            <TableCell>
                              {access.actions.map(
                                (action: string, i: number) => (
                                  <Chip
                                    key={i}
                                    label={action}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                )
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {access.status === "allowed" ? (
                                <Chip
                                  label="Allowed"
                                  color="success"
                                  size="small"
                                />
                              ) : (
                                <Chip
                                  label="Denied"
                                  color="default"
                                  size="small"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </Paper>
          )}
        </Grid>

        {/* Right side - Policies, Roles, Users */}
        <Grid item xs={12} md={5}>
          {/* IAM Policies */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <SecurityIcon sx={{ mr: 1.5 }} />
              <Typography variant="h6">IAM Policies</Typography>
            </Box>

            <Divider />

            {isPoliciesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : policies && policies.length > 0 ? (
              <List sx={{ maxHeight: 250, overflow: "auto" }}>
                {policies.map((policy: any, index: number) => (
                  <ListItem
                    key={index}
                    button
                    selected={
                      selectedPolicy && selectedPolicy.Arn === policy.Arn
                    }
                    onClick={() => handlePolicySelection(policy)}
                  >
                    <ListItemIcon>
                      <CodeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={policy.PolicyName}
                      secondary={policy.Description || "No description"}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  No IAM policies found in this account.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* IAM Roles */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <GroupIcon sx={{ mr: 1.5 }} />
              <Typography variant="h6">IAM Roles</Typography>
            </Box>

            <Divider />

            {isRolesLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : roles && roles.length > 0 ? (
              <List sx={{ maxHeight: 150, overflow: "auto" }}>
                {roles.map((role: any, index: number) => (
                  <ListItem key={index} button>
                    <ListItemIcon>
                      <GroupIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={role.RoleName}
                      secondary={`Created: ${new Date(
                        role.CreateDate
                      ).toLocaleDateString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  No IAM roles found in this account.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* IAM Users */}
          <Paper>
            <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
              <PersonIcon sx={{ mr: 1.5 }} />
              <Typography variant="h6">IAM Users</Typography>
            </Box>

            <Divider />

            {isUsersLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : users && users.length > 0 ? (
              <List sx={{ maxHeight: 150, overflow: "auto" }}>
                {users.map((user: any, index: number) => (
                  <ListItem key={index} button>
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={user.UserName}
                      secondary={`Last activity: ${
                        user.PasswordLastUsed
                          ? new Date(user.PasswordLastUsed).toLocaleDateString()
                          : "Never"
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  No IAM users found in this account.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default IAMPolicyAnalyzer;
