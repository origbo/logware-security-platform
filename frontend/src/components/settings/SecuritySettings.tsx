import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SecurityIcon from "@mui/icons-material/Security";

const SecuritySettings: React.FC = () => {
  // State for security settings
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [mfaMethod, setMfaMethod] = useState("app");
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 12,
    requireLowercase: true,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true,
    expireDays: 90,
    preventReuse: 5,
  });
  const [ipAllowlist, setIpAllowlist] = useState<string[]>([
    "192.168.1.0/24",
    "10.0.0.0/16",
    "74.125.0.0/16",
  ]);

  // Dialog states
  const [addIpDialogOpen, setAddIpDialogOpen] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState("");
  const [ipError, setIpError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // API Token states
  const [apiTokens, setApiTokens] = useState([
    {
      name: "Dashboard Integration",
      created: "2025-04-01",
      lastUsed: "2025-05-14",
      expires: "2025-07-01",
    },
    {
      name: "SIEM Connector",
      created: "2025-03-15",
      lastUsed: "2025-05-13",
      expires: "2025-06-15",
    },
  ]);
  const [apiTokenDialogOpen, setApiTokenDialogOpen] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");

  // Enable/disable API key visibility
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);

  // Handle IP allowlist changes
  const handleAddIpAddress = () => {
    // Simple IP validation (could be improved for CIDR notation)
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:3[0-2]|[1-2][0-9]|[0-9]))?$/;

    if (!ipRegex.test(newIpAddress)) {
      setIpError(
        "Please enter a valid IP address or CIDR range (e.g., 192.168.1.0/24)"
      );
      return;
    }

    if (ipAllowlist.includes(newIpAddress)) {
      setIpError("This IP address is already in the list");
      return;
    }

    setIpAllowlist([...ipAllowlist, newIpAddress]);
    setNewIpAddress("");
    setIpError("");
    setAddIpDialogOpen(false);
  };

  const handleRemoveIpAddress = (ip: string) => {
    setIpAllowlist(ipAllowlist.filter((item) => item !== ip));
  };

  // Handle API token generation
  const handleCreateApiToken = () => {
    if (!newTokenName.trim()) {
      return;
    }

    // In a real app, this would call an API to generate a token
    const tokenValue =
      "lw_" +
      Array.from(
        { length: 40 },
        () => "0123456789abcdef"[Math.floor(Math.random() * 16)]
      ).join("");

    // Add new token to list
    const today = new Date().toISOString().split("T")[0];
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);

    setApiTokens([
      ...apiTokens,
      {
        name: newTokenName,
        created: today,
        lastUsed: "Never",
        expires: expDate.toISOString().split("T")[0],
      },
    ]);

    // Show the token value so user can copy it
    setApiKeyValue(tokenValue);
    setShowApiKeyDialog(true);
    setApiTokenDialogOpen(false);
    setNewTokenName("");
  };

  const handleDeleteToken = (index: number) => {
    setApiTokens(apiTokens.filter((_, i) => i !== index));
  };

  // Handle save button click
  const handleSave = () => {
    // In a real app, this would save to backend
    console.log("Saving security settings:", {
      mfaEnabled,
      mfaMethod,
      sessionTimeout,
      passwordPolicy,
      ipAllowlist,
      apiTokens,
    });

    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Security settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Authentication Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Authentication Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mfaEnabled}
                      onChange={(e) => setMfaEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Require Multi-Factor Authentication (MFA)"
                />

                {mfaEnabled && (
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel id="mfa-method-label">MFA Method</InputLabel>
                    <Select
                      labelId="mfa-method-label"
                      value={mfaMethod}
                      onChange={(e) => setMfaMethod(e.target.value)}
                      label="MFA Method"
                    >
                      <MenuItem value="app">Authenticator App</MenuItem>
                      <MenuItem value="sms">SMS</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="hardware">Hardware Key</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Session Settings
                </Typography>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  margin="normal"
                  size="small"
                  variant="outlined"
                  InputProps={{ inputProps: { min: 5, max: 1440 } }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Policy */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Password Policy
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Minimum Length"
                    type="number"
                    value={passwordPolicy.minLength}
                    onChange={(e) =>
                      setPasswordPolicy({
                        ...passwordPolicy,
                        minLength: Number(e.target.value),
                      })
                    }
                    margin="normal"
                    size="small"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 8, max: 64 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password Expiry (days)"
                    type="number"
                    value={passwordPolicy.expireDays}
                    onChange={(e) =>
                      setPasswordPolicy({
                        ...passwordPolicy,
                        expireDays: Number(e.target.value),
                      })
                    }
                    margin="normal"
                    size="small"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0, max: 365 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prevent Password Reuse (count)"
                    type="number"
                    value={passwordPolicy.preventReuse}
                    onChange={(e) =>
                      setPasswordPolicy({
                        ...passwordPolicy,
                        preventReuse: Number(e.target.value),
                      })
                    }
                    margin="normal"
                    size="small"
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0, max: 24 } }}
                    helperText="How many previous passwords are checked"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Password Requirements
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={passwordPolicy.requireLowercase}
                        onChange={(e) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            requireLowercase: e.target.checked,
                          })
                        }
                        color="primary"
                        size="small"
                      />
                    }
                    label="Lowercase Letters"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={passwordPolicy.requireUppercase}
                        onChange={(e) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            requireUppercase: e.target.checked,
                          })
                        }
                        color="primary"
                        size="small"
                      />
                    }
                    label="Uppercase Letters"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={passwordPolicy.requireNumber}
                        onChange={(e) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            requireNumber: e.target.checked,
                          })
                        }
                        color="primary"
                        size="small"
                      />
                    }
                    label="Numbers"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={passwordPolicy.requireSpecial}
                        onChange={(e) =>
                          setPasswordPolicy({
                            ...passwordPolicy,
                            requireSpecial: e.target.checked,
                          })
                        }
                        color="primary"
                        size="small"
                      />
                    }
                    label="Special Characters"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* IP Allowlist */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6">IP Allowlist</Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => setAddIpDialogOpen(true)}
                >
                  Add IP
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <List dense>
                {ipAllowlist.map((ip, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={ip}
                      secondary={
                        ip.includes("/24")
                          ? "256 addresses"
                          : ip.includes("/16")
                          ? "65,536 addresses"
                          : "Single address"
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveIpAddress(ip)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {ipAllowlist.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No IP addresses in allowlist"
                      secondary="All IP addresses will be allowed"
                    />
                  </ListItem>
                )}
              </List>

              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 2, display: "block" }}
              >
                IP allowlist restricts application access to specified IP
                addresses or ranges. If empty, access is allowed from any IP
                address.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* API Tokens */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6">API Tokens</Typography>
                <Button
                  startIcon={<AddIcon />}
                  size="small"
                  onClick={() => setApiTokenDialogOpen(true)}
                >
                  Generate Token
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <List dense>
                {apiTokens.map((token, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={token.name}
                      secondary={
                        <>
                          <Typography variant="caption" component="span">
                            Created: {token.created} | Last used:{" "}
                            {token.lastUsed}
                          </Typography>
                          <br />
                          <Typography variant="caption" component="span">
                            Expires: {token.expires}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteToken(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {apiTokens.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No API tokens"
                      secondary="Generate tokens to access the API"
                    />
                  </ListItem>
                )}
              </List>

              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 2, display: "block" }}
              >
                API tokens are used to authenticate with the API
                programmatically. Tokens are valid for 1 year by default.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Add IP Dialog */}
      <Dialog open={addIpDialogOpen} onClose={() => setAddIpDialogOpen(false)}>
        <DialogTitle>Add IP Address</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="IP Address or CIDR Range"
            fullWidth
            variant="outlined"
            value={newIpAddress}
            onChange={(e) => setNewIpAddress(e.target.value)}
            placeholder="e.g., 192.168.1.0/24"
            error={!!ipError}
            helperText={ipError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddIpDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddIpAddress} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create API Token Dialog */}
      <Dialog
        open={apiTokenDialogOpen}
        onClose={() => setApiTokenDialogOpen(false)}
      >
        <DialogTitle>Generate API Token</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Token Name"
            fullWidth
            variant="outlined"
            value={newTokenName}
            onChange={(e) => setNewTokenName(e.target.value)}
            placeholder="e.g., SIEM Integration"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiTokenDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateApiToken}
            color="primary"
            disabled={!newTokenName.trim()}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Show API Key Dialog */}
      <Dialog
        open={showApiKeyDialog}
        onClose={() => setShowApiKeyDialog(false)}
        maxWidth="md"
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
          <SecurityIcon color="primary" sx={{ mr: 1 }} />
          API Token Generated
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="error" paragraph>
            Warning: This token will only be shown once. Please copy it and
            store it in a secure location.
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            value={apiKeyValue}
            type={showApiKey ? "text" : "password"}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton
                  onClick={() => setShowApiKey(!showApiKey)}
                  edge="end"
                >
                  {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Typography variant="caption" color="textSecondary">
            This token will expire in 1 year. You can revoke access at any time
            by deleting the token.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(apiKeyValue);
              setShowApiKeyDialog(false);
            }}
            color="primary"
          >
            Copy & Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings;
