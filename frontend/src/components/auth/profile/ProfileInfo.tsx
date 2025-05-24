import React, { useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { Save as SaveIcon, Edit as EditIcon } from "@mui/icons-material";
import { User } from "../../../services/auth/authService";
import useAuth from "../../../hooks/auth/useAuth";

interface ProfileInfoProps {
  user: User | null;
}

/**
 * ProfileInfo component for displaying and editing user profile information
 */
const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  // @ts-ignore - Auth context properties
  const { refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formValues, setFormValues] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    position: user?.position || "",
    department: user?.department || "",
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });

    // Clear messages when editing
    setError(null);
    setSuccess(null);
  };

  // Toggle edit mode
  const handleToggleEdit = () => {
    if (isEditing) {
      // Cancel editing - reset form values
      setFormValues({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        position: user?.position || "",
        department: user?.department || "",
      });
    }

    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, this would call an API endpoint
      // to update the user profile information
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API call

      // Update the user data in the auth context
      // This would be done after a successful API call in a real implementation
      refreshUserData();

      setSuccess("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
      console.error("Error updating profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
        <Typography variant="h5" component="h2">
          Profile Information
        </Typography>

        <Button
          variant={isEditing ? "outlined" : "contained"}
          color={isEditing ? "secondary" : "primary"}
          startIcon={isEditing ? null : <EditIcon />}
          onClick={handleToggleEdit}
          disabled={isLoading}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formValues.firstName}
                onChange={handleChange}
                margin="normal"
                disabled={!isEditing || isLoading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formValues.lastName}
                onChange={handleChange}
                margin="normal"
                disabled={!isEditing || isLoading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                margin="normal"
                disabled={!isEditing || isLoading}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formValues.phone}
                onChange={handleChange}
                margin="normal"
                disabled={!isEditing || isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Job Position"
                name="position"
                value={formValues.position}
                onChange={handleChange}
                margin="normal"
                disabled={!isEditing || isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formValues.department}
                onChange={handleChange}
                margin="normal"
                disabled={!isEditing || isLoading}
              />
            </Grid>
          </Grid>
        </CardContent>

        {isEditing && (
          <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <SaveIcon />
                )
              }
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardActions>
        )}
      </Card>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" component="h2" gutterBottom>
        Account Information
      </Typography>

      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Username
              </Typography>
              <Typography variant="body1">{user?.username || "N/A"}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body1">{user?.id || "N/A"}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1">
                {user?.roles?.join(", ") || "No roles assigned"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Login
              </Typography>
              <Typography variant="body1">
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfileInfo;
