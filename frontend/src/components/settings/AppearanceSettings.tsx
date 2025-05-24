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
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  Radio,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Slider,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import SaveIcon from "@mui/icons-material/Save";
import ReplayIcon from "@mui/icons-material/Replay";
import AddIcon from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";

const AppearanceSettings: React.FC = () => {
  // Theme settings
  const [themeMode, setThemeMode] = useState("dark");
  const [primaryColor, setPrimaryColor] = useState("#1976d2");
  const [secondaryColor, setSecondaryColor] = useState("#9c27b0");
  const [customColors, setCustomColors] = useState([
    { name: "Success", value: "#4caf50" },
    { name: "Error", value: "#f44336" },
    { name: "Warning", value: "#ff9800" },
    { name: "Info", value: "#2196f3" },
  ]);

  // Layout settings
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [contentMaxWidth, setContentMaxWidth] = useState("xl");
  const [denseLayout, setDenseLayout] = useState(false);
  const [headerPosition, setHeaderPosition] = useState("fixed");

  // Typography settings
  const [fontFamily, setFontFamily] = useState("Roboto");
  const [fontSize, setFontSize] = useState(14);
  const [bodyFontSize, setBodyFontSize] = useState(14);
  const [headingScale, setHeadingScale] = useState(1.2);

  // Dashboard settings
  const [dashboardGridDensity, setDashboardGridDensity] = useState("medium");
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [chartAnimations, setChartAnimations] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [borderRadius, setBorderRadius] = useState(4);

  // Branding settings
  const [logoUrl, setLogoUrl] = useState("/assets/logo-dark.png");
  const [lightLogoUrl, setLightLogoUrl] = useState("/assets/logo-light.png");
  const [faviconUrl, setFaviconUrl] = useState("/favicon.ico");
  const [organizationName, setOrganizationName] = useState("Logware Security");
  const [applicationName, setApplicationName] = useState("Security Platform");

  // Dialog states
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [colorValue, setColorValue] = useState("");
  const [colorName, setColorName] = useState("");
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);

  // Success message
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Available theme colors
  const themeColors = [
    { name: "Blue", primary: "#1976d2", secondary: "#9c27b0" },
    { name: "Indigo", primary: "#3f51b5", secondary: "#f50057" },
    { name: "Purple", primary: "#673ab7", secondary: "#ff9100" },
    { name: "Teal", primary: "#009688", secondary: "#f44336" },
    { name: "Green", primary: "#4caf50", secondary: "#ff5722" },
    { name: "Orange", primary: "#ff9800", secondary: "#2196f3" },
    { name: "Red", primary: "#f44336", secondary: "#2196f3" },
    { name: "Dark Blue", primary: "#0d47a1", secondary: "#e91e63" },
  ];

  // Available fonts
  const fontOptions = [
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Raleway",
    "Source Sans Pro",
    "Ubuntu",
    "Noto Sans",
  ];

  // Handle theme mode change
  const handleThemeModeChange = (mode: string) => {
    setThemeMode(mode);
  };

  // Handle color preset selection
  const handleColorPreset = (preset: {
    primary: string;
    secondary: string;
  }) => {
    setPrimaryColor(preset.primary);
    setSecondaryColor(preset.secondary);
  };

  // Handle opening the color dialog
  const handleOpenColorDialog = (
    type: string,
    value: string,
    name?: string
  ) => {
    setSelectedColor(type);
    setColorValue(value);
    setColorName(name || "");
    setColorDialogOpen(true);
  };

  // Handle updating custom color
  const handleUpdateColor = () => {
    if (selectedColor === "primary") {
      setPrimaryColor(colorValue);
    } else if (selectedColor === "secondary") {
      setSecondaryColor(colorValue);
    } else if (selectedColor === "custom") {
      setCustomColors(
        customColors.map((color) =>
          color.name === colorName ? { ...color, value: colorValue } : color
        )
      );
    } else if (selectedColor === "new") {
      setCustomColors([
        ...customColors,
        { name: colorName, value: colorValue },
      ]);
    }

    setColorDialogOpen(false);
  };

  // Handle adding a new custom color
  const handleAddCustomColor = () => {
    setSelectedColor("new");
    setColorValue("#000000");
    setColorName("");
    setColorDialogOpen(true);
  };

  // Handle deleting a custom color
  const handleDeleteCustomColor = (name: string) => {
    setCustomColors(customColors.filter((color) => color.name !== name));
  };

  // Handle resetting to defaults
  const handleResetDefaults = () => {
    setThemeMode("dark");
    setPrimaryColor("#1976d2");
    setSecondaryColor("#9c27b0");
    setSidebarCollapsed(false);
    setSidebarWidth(240);
    setContentMaxWidth("xl");
    setDenseLayout(false);
    setHeaderPosition("fixed");
    setFontFamily("Roboto");
    setFontSize(14);
    setBodyFontSize(14);
    setHeadingScale(1.2);
    setDashboardGridDensity("medium");
    setAnimationsEnabled(true);
    setChartAnimations(true);
    setShowTooltips(true);
    setBorderRadius(4);

    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle saving settings
  const handleSave = () => {
    // In a real app, this would save to backend
    console.log("Saving appearance settings:", {
      themeMode,
      primaryColor,
      secondaryColor,
      customColors,
      sidebarCollapsed,
      sidebarWidth,
      contentMaxWidth,
      denseLayout,
      headerPosition,
      fontFamily,
      fontSize,
      bodyFontSize,
      headingScale,
      dashboardGridDensity,
      animationsEnabled,
      chartAnimations,
      showTooltips,
      borderRadius,
      logoUrl,
      lightLogoUrl,
      faviconUrl,
      organizationName,
      applicationName,
    });

    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Color box component
  const ColorBox = ({
    color,
    onClick,
  }: {
    color: string;
    onClick: () => void;
  }) => (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1,
        bgcolor: color,
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 0 0 2px " + alpha(color, 0.5),
        },
      }}
      onClick={onClick}
    />
  );

  return (
    <Box>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Appearance settings saved successfully!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Theme Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Typography variant="subtitle2" gutterBottom>
                Theme Mode
              </Typography>
              <RadioGroup
                row
                value={themeMode}
                onChange={(e) => handleThemeModeChange(e.target.value)}
                sx={{ mb: 3 }}
              >
                <FormControlLabel
                  value="light"
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Brightness7Icon sx={{ mr: 0.5 }} fontSize="small" />
                      Light
                    </Box>
                  }
                />
                <FormControlLabel
                  value="dark"
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Brightness4Icon sx={{ mr: 0.5 }} fontSize="small" />
                      Dark
                    </Box>
                  }
                />
                <FormControlLabel
                  value="system"
                  control={<Radio color="primary" />}
                  label="System"
                />
              </RadioGroup>

              <Typography variant="subtitle2" gutterBottom>
                Color Presets
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {themeColors.map((theme) => (
                  <Box
                    key={theme.name}
                    sx={{
                      p: 0.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                    onClick={() => handleColorPreset(theme)}
                  >
                    <Box sx={{ display: "flex", mb: 0.5 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: theme.primary,
                          borderTopLeftRadius: 4,
                          borderBottomLeftRadius: 4,
                        }}
                      />
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          bgcolor: theme.secondary,
                          borderTopRightRadius: 4,
                          borderBottomRightRadius: 4,
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: 10 }}>
                      {theme.name}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Primary Color
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ColorBox
                  color={primaryColor}
                  onClick={() => handleOpenColorDialog("primary", primaryColor)}
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {primaryColor}
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Secondary Color
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ColorBox
                  color={secondaryColor}
                  onClick={() =>
                    handleOpenColorDialog("secondary", secondaryColor)
                  }
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {secondaryColor}
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Custom Colors
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                {customColors.map((color) => (
                  <Box
                    key={color.name}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <ColorBox
                      color={color.value}
                      onClick={() =>
                        handleOpenColorDialog("custom", color.value, color.name)
                      }
                    />
                    <Typography variant="caption">{color.name}</Typography>
                  </Box>
                ))}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      width: 36,
                      height: 36,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                    onClick={handleAddCustomColor}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="caption">Add</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Layout Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Layout Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={sidebarCollapsed}
                    onChange={(e) => setSidebarCollapsed(e.target.checked)}
                    color="primary"
                  />
                }
                label="Collapsed Sidebar by Default"
                sx={{ mb: 2, display: "block" }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Sidebar Width: {sidebarWidth}px
              </Typography>
              <Slider
                value={sidebarWidth}
                onChange={(_, value) => setSidebarWidth(value as number)}
                min={180}
                max={320}
                step={10}
                marks={[
                  { value: 180, label: "180px" },
                  { value: 240, label: "240px" },
                  { value: 320, label: "320px" },
                ]}
                sx={{ mb: 3 }}
              />

              <FormControl
                fullWidth
                margin="normal"
                size="small"
                sx={{ mb: 2 }}
              >
                <InputLabel id="content-width-label">
                  Content Max Width
                </InputLabel>
                <Select
                  labelId="content-width-label"
                  value={contentMaxWidth}
                  onChange={(e) => setContentMaxWidth(e.target.value)}
                  label="Content Max Width"
                >
                  <MenuItem value="sm">Small (600px)</MenuItem>
                  <MenuItem value="md">Medium (900px)</MenuItem>
                  <MenuItem value="lg">Large (1200px)</MenuItem>
                  <MenuItem value="xl">Extra Large (1536px)</MenuItem>
                  <MenuItem value="false">Full Width</MenuItem>
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                margin="normal"
                size="small"
                sx={{ mb: 2 }}
              >
                <InputLabel id="header-position-label">
                  Header Position
                </InputLabel>
                <Select
                  labelId="header-position-label"
                  value={headerPosition}
                  onChange={(e) => setHeaderPosition(e.target.value)}
                  label="Header Position"
                >
                  <MenuItem value="fixed">Fixed</MenuItem>
                  <MenuItem value="absolute">Absolute</MenuItem>
                  <MenuItem value="relative">Relative</MenuItem>
                  <MenuItem value="sticky">Sticky</MenuItem>
                  <MenuItem value="static">Static</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={denseLayout}
                    onChange={(e) => setDenseLayout(e.target.checked)}
                    color="primary"
                  />
                }
                label="Dense Layout (Compact UI Elements)"
                sx={{ mb: 2, display: "block" }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Component Border Radius: {borderRadius}px
              </Typography>
              <Slider
                value={borderRadius}
                onChange={(_, value) => setBorderRadius(value as number)}
                min={0}
                max={16}
                step={1}
                marks={[
                  { value: 0, label: "0px" },
                  { value: 4, label: "4px" },
                  { value: 8, label: "8px" },
                  { value: 16, label: "16px" },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Typography Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <FormatSizeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Typography Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <FormControl
                fullWidth
                margin="normal"
                size="small"
                sx={{ mb: 2 }}
              >
                <InputLabel id="font-family-label">Font Family</InputLabel>
                <Select
                  labelId="font-family-label"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  label="Font Family"
                >
                  {fontOptions.map((font) => (
                    <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                      {font}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="subtitle2" gutterBottom>
                Base Font Size: {fontSize}px
              </Typography>
              <Slider
                value={fontSize}
                onChange={(_, value) => setFontSize(value as number)}
                min={12}
                max={18}
                step={1}
                marks={[
                  { value: 12, label: "12px" },
                  { value: 14, label: "14px" },
                  { value: 16, label: "16px" },
                  { value: 18, label: "18px" },
                ]}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Body Font Size: {bodyFontSize}px
              </Typography>
              <Slider
                value={bodyFontSize}
                onChange={(_, value) => setBodyFontSize(value as number)}
                min={12}
                max={18}
                step={1}
                marks={[
                  { value: 12, label: "12px" },
                  { value: 14, label: "14px" },
                  { value: 16, label: "16px" },
                  { value: 18, label: "18px" },
                ]}
                sx={{ mb: 3 }}
              />

              <Typography variant="subtitle2" gutterBottom>
                Heading Scale: {headingScale}
              </Typography>
              <Slider
                value={headingScale}
                onChange={(_, value) => setHeadingScale(value as number)}
                min={1.0}
                max={1.5}
                step={0.05}
                marks={[
                  { value: 1.0, label: "1.0x" },
                  { value: 1.2, label: "1.2x" },
                  { value: 1.5, label: "1.5x" },
                ]}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Dashboard Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dashboard Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <FormControl
                fullWidth
                margin="normal"
                size="small"
                sx={{ mb: 2 }}
              >
                <InputLabel id="grid-density-label">
                  Dashboard Grid Density
                </InputLabel>
                <Select
                  labelId="grid-density-label"
                  value={dashboardGridDensity}
                  onChange={(e) => setDashboardGridDensity(e.target.value)}
                  label="Dashboard Grid Density"
                >
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="comfortable">Comfortable</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={animationsEnabled}
                    onChange={(e) => setAnimationsEnabled(e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable UI Animations"
                sx={{ mb: 1, display: "block" }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={chartAnimations}
                    onChange={(e) => setChartAnimations(e.target.checked)}
                    color="primary"
                    disabled={!animationsEnabled}
                  />
                }
                label="Enable Chart Animations"
                sx={{ mb: 1, display: "block" }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={showTooltips}
                    onChange={(e) => setShowTooltips(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show Interactive Tooltips"
                sx={{ display: "block" }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Branding Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Branding Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Organization Name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />

                  <TextField
                    fullWidth
                    label="Application Name"
                    value={applicationName}
                    onChange={(e) => setApplicationName(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Application Logo
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        component="img"
                        src={themeMode === "dark" ? lightLogoUrl : logoUrl}
                        alt="Logo"
                        sx={{
                          maxHeight: 40,
                          maxWidth: 180,
                          mr: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          p: 1,
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UploadIcon />}
                        onClick={() => setLogoDialogOpen(true)}
                      >
                        Change Logo
                      </Button>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Favicon
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        component="img"
                        src={faviconUrl}
                        alt="Favicon"
                        sx={{
                          height: 32,
                          width: 32,
                          mr: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          p: 0.5,
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UploadIcon />}
                      >
                        Change Favicon
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ReplayIcon />}
              onClick={handleResetDefaults}
            >
              Reset to Defaults
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Color Dialog */}
      <Dialog open={colorDialogOpen} onClose={() => setColorDialogOpen(false)}>
        <DialogTitle>
          {selectedColor === "primary" && "Edit Primary Color"}
          {selectedColor === "secondary" && "Edit Secondary Color"}
          {selectedColor === "custom" && `Edit ${colorName} Color`}
          {selectedColor === "new" && "Add Custom Color"}
        </DialogTitle>
        <DialogContent>
          {selectedColor === "new" && (
            <TextField
              fullWidth
              label="Color Name"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              margin="normal"
              variant="outlined"
              size="small"
            />
          )}
          <TextField
            fullWidth
            label="Color Value (Hex)"
            value={colorValue}
            onChange={(e) => setColorValue(e.target.value)}
            margin="normal"
            variant="outlined"
            size="small"
            placeholder="#000000"
          />
          <Box
            sx={{
              width: "100%",
              height: 40,
              borderRadius: 1,
              bgcolor: colorValue,
              mt: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateColor}
            color="primary"
            disabled={selectedColor === "new" && (!colorName || !colorValue)}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logo Upload Dialog */}
      <Dialog open={logoDialogOpen} onClose={() => setLogoDialogOpen(false)}>
        <DialogTitle>Upload Logo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Upload your organization logo. Recommended size: 180x40px.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Dark Mode Logo
              </Typography>
              <TextField
                fullWidth
                label="Logo URL"
                value={lightLogoUrl}
                onChange={(e) => setLightLogoUrl(e.target.value)}
                margin="normal"
                variant="outlined"
                size="small"
                placeholder="/assets/logo-light.png"
              />
              <Button
                variant="outlined"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{ mt: 1 }}
              >
                Upload
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>
                Light Mode Logo
              </Typography>
              <TextField
                fullWidth
                label="Logo URL"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                margin="normal"
                variant="outlined"
                size="small"
                placeholder="/assets/logo-dark.png"
              />
              <Button
                variant="outlined"
                fullWidth
                startIcon={<UploadIcon />}
                sx={{ mt: 1 }}
              >
                Upload
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setLogoDialogOpen(false)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppearanceSettings;
