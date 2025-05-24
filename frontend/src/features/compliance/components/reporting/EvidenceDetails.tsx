/**
 * Evidence Details Component
 *
 * Displays detailed information about a specific evidence item
 * and provides actions like approval, rejection, etc.
 */
import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Stack,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Description as DocumentIcon,
  Image as ImageIcon,
  Code as CodeIcon,
  Assessment as ReportIcon,
  Notes as NotesIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  DeleteForever as DeleteIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

// Import types
import {
  EvidenceItem,
  EvidenceStatus,
  EvidenceType,
} from "../../types/evidenceTypes";

// Props interface
interface EvidenceDetailsProps {
  evidence: EvidenceItem | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (id: string, notes: string) => Promise<void>;
  onReject?: (id: string, reason: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onRenew?: (id: string) => Promise<void>;
}

// Format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get file icon
const getFileIcon = (type: string, format: string) => {
  if (type === EvidenceType.DOCUMENT) return <DocumentIcon fontSize="large" />;
  if (type === EvidenceType.SCREENSHOT) return <ImageIcon fontSize="large" />;
  if (type === EvidenceType.REPORT) return <ReportIcon fontSize="large" />;
  if (type === EvidenceType.CONFIG) return <CodeIcon fontSize="large" />;
  if (format === "pdf" || format === "word" || format === "text")
    return <DocumentIcon fontSize="large" />;
  if (format === "image" || format.startsWith("image/"))
    return <ImageIcon fontSize="large" />;
  if (format === "excel" || format === "report")
    return <ReportIcon fontSize="large" />;
  if (format === "json" || format === "xml" || format === "config")
    return <CodeIcon fontSize="large" />;
  return <NotesIcon fontSize="large" />;
};

// Format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "N/A";

  if (bytes < 1024) return bytes + " bytes";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

/**
 * Evidence Details Component
 */
const EvidenceDetails: React.FC<EvidenceDetailsProps> = ({
  evidence,
  open,
  onClose,
  onApprove,
  onReject,
  onDelete,
  onRenew,
}) => {
  const theme = useTheme();

  // Action states
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // File preview state
  const [filePreviewOpen, setFilePreviewOpen] = useState(false);

  // Calculate expiry status
  const isExpired = evidence?.expiresAt
    ? new Date(evidence.expiresAt) < new Date()
    : false;
  const daysUntilExpiry = evidence?.expiresAt
    ? Math.ceil(
        (new Date(evidence.expiresAt).getTime() - new Date().getTime()) /
          (1000 * 3600 * 24)
      )
    : null;

  // Handle approve action
  const handleApprove = async () => {
    if (!evidence || !onApprove) return;

    try {
      setLoading(true);
      setError(null);

      await onApprove(evidence.id, actionNotes);

      setActionSuccess("Evidence has been approved successfully.");
      setApproving(false);
      setActionNotes("");
    } catch (err) {
      console.error("Error approving evidence:", err);
      setError("Failed to approve evidence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (!evidence || !onReject) return;

    try {
      setLoading(true);
      setError(null);

      await onReject(evidence.id, rejectionReason);

      setActionSuccess("Evidence has been rejected.");
      setRejecting(false);
      setRejectionReason("");
    } catch (err) {
      console.error("Error rejecting evidence:", err);
      setError("Failed to reject evidence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete action
  const handleDelete = async () => {
    if (!evidence || !onDelete) return;

    try {
      setLoading(true);
      setError(null);

      await onDelete(evidence.id);

      setActionSuccess("Evidence has been deleted.");
      setDeleting(false);
      onClose();
    } catch (err) {
      console.error("Error deleting evidence:", err);
      setError("Failed to delete evidence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle renew action
  const handleRenew = async () => {
    if (!evidence || !onRenew) return;

    try {
      setLoading(true);
      setError(null);

      await onRenew(evidence.id);

      setActionSuccess("Evidence has been renewed successfully.");
    } catch (err) {
      console.error("Error renewing evidence:", err);
      setError("Failed to renew evidence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle close action
  const handleClose = () => {
    // Reset states
    setApproving(false);
    setRejecting(false);
    setDeleting(false);
    setActionNotes("");
    setRejectionReason("");
    setError(null);
    setActionSuccess(null);
    setFilePreviewOpen(false);

    // Close dialog
    onClose();
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    if (isExpired) return "error";

    switch (status) {
      case EvidenceStatus.APPROVED:
        return "success";
      case EvidenceStatus.PENDING:
        return "warning";
      case EvidenceStatus.REJECTED:
        return "error";
      case EvidenceStatus.EXPIRED:
        return "error";
      default:
        return "default";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    if (isExpired) return "EXPIRED";
    return status.toUpperCase();
  };

  if (!evidence) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6">Evidence Details</Typography>
              <Chip
                label={getStatusText(evidence.status as string)}
                color={getStatusColor(evidence.status as string) as any}
                size="small"
              />
            </Stack>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 0 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {actionSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {actionSuccess}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {evidence.name}
            </Typography>
            {evidence.description && (
              <Typography variant="body1" color="textSecondary" paragraph>
                {evidence.description}
              </Typography>
            )}
          </Box>

          <Grid container spacing={3}>
            {/* Main Evidence Info */}
            <Grid item xs={12} md={7}>
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Framework
                    </Typography>
                    <Typography variant="body1">
                      {evidence.framework}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Requirement
                    </Typography>
                    <Typography variant="body1">
                      {evidence.requirement}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Type
                    </Typography>
                    <Typography variant="body1">{evidence.type}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Format
                    </Typography>
                    <Typography variant="body1">{evidence.format}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Uploaded By
                    </Typography>
                    <Typography variant="body1">
                      {evidence.uploadedBy}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Uploaded At
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(evidence.uploadedAt)}
                    </Typography>
                  </Grid>
                  {evidence.expiresAt && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Expires At
                      </Typography>
                      <Typography
                        variant="body1"
                        color={
                          isExpired
                            ? "error"
                            : daysUntilExpiry && daysUntilExpiry < 30
                            ? "warning.main"
                            : "textPrimary"
                        }
                      >
                        {formatDate(evidence.expiresAt)}
                        {!isExpired && daysUntilExpiry && (
                          <Typography
                            component="span"
                            variant="caption"
                            sx={{ ml: 1 }}
                          >
                            ({daysUntilExpiry} days remaining)
                          </Typography>
                        )}
                      </Typography>
                    </Grid>
                  )}
                  {evidence.verifiedBy && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Verified By
                      </Typography>
                      <Typography variant="body1">
                        {evidence.verifiedBy}
                      </Typography>
                    </Grid>
                  )}
                  {evidence.verifiedAt && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Verified At
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(evidence.verifiedAt)}
                      </Typography>
                    </Grid>
                  )}
                  {evidence.rejectionReason && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="error">
                        Rejection Reason
                      </Typography>
                      <Typography variant="body1">
                        {evidence.rejectionReason}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {evidence.tags && evidence.tags.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    gutterBottom
                  >
                    Tags
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {evidence.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>

            {/* File Preview */}
            <Grid item xs={12} md={5}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    pb: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: theme.palette.primary.light + "20",
                      borderRadius: "50%",
                      color: theme.palette.primary.main,
                      mb: 2,
                    }}
                  >
                    {getFileIcon(
                      evidence.type as string,
                      evidence.format as string
                    )}
                  </Box>
                  <Typography variant="body1" align="center" gutterBottom>
                    {evidence.fileName || "File"}
                  </Typography>
                  {evidence.fileSize && (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      align="center"
                    >
                      {formatFileSize(evidence.fileSize)}
                    </Typography>
                  )}
                </CardContent>
                <Divider />
                <Box sx={{ display: "flex", p: 1, justifyContent: "center" }}>
                  <Button
                    startIcon={<ViewIcon />}
                    onClick={() => setFilePreviewOpen(true)}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  <Button startIcon={<DownloadIcon />}>Download</Button>
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Evidence History
            </Typography>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Stack spacing={2}>
                {evidence.verifiedAt && (
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Avatar
                      sx={{
                        bgcolor: "success.light",
                        width: 32,
                        height: 32,
                        mr: 2,
                      }}
                    >
                      <CheckCircle fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2">
                        <strong>{evidence.verifiedBy}</strong> approved this
                        evidence
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatDate(evidence.verifiedAt)}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <Avatar
                    sx={{
                      bgcolor: "primary.light",
                      width: 32,
                      height: 32,
                      mr: 2,
                    }}
                  >
                    <UploadIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography variant="body2">
                      <strong>{evidence.uploadedBy}</strong> uploaded this
                      evidence
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(evidence.uploadedAt)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
          <Box>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={() => setDeleting(true)}
              disabled={loading}
            >
              Delete
            </Button>
          </Box>
          <Box>
            {evidence.status === EvidenceStatus.PENDING && (
              <>
                <Button
                  startIcon={<RejectIcon />}
                  color="warning"
                  onClick={() => setRejecting(true)}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  Reject
                </Button>
                <Button
                  startIcon={<ApproveIcon />}
                  color="success"
                  variant="contained"
                  onClick={() => setApproving(true)}
                  disabled={loading}
                >
                  Approve
                </Button>
              </>
            )}
            {evidence.status === EvidenceStatus.APPROVED && isExpired && (
              <Button
                startIcon={<RefreshIcon />}
                color="primary"
                variant="contained"
                onClick={handleRenew}
                disabled={loading}
              >
                Renew Evidence
              </Button>
            )}
            {evidence.status === EvidenceStatus.REJECTED && (
              <Button
                startIcon={<EditIcon />}
                color="primary"
                variant="contained"
                disabled={loading}
              >
                Edit & Resubmit
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Approve confirmation dialog */}
      <Dialog
        open={approving}
        onClose={() => setApproving(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Approve Evidence</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to approve this evidence?
          </Typography>
          <TextField
            label="Notes (Optional)"
            multiline
            rows={3}
            fullWidth
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproving(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            color="success"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Approving..." : "Approve"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject confirmation dialog */}
      <Dialog
        open={rejecting}
        onClose={() => setRejecting(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Evidence</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Please provide a reason for rejecting this evidence.
          </Typography>
          <TextField
            label="Rejection Reason"
            multiline
            rows={3}
            fullWidth
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            error={rejecting && rejectionReason.trim() === ""}
            helperText={
              rejecting && rejectionReason.trim() === ""
                ? "Rejection reason is required"
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejecting(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            color="warning"
            variant="contained"
            disabled={loading || rejectionReason.trim() === ""}
          >
            {loading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleting}
        onClose={() => setDeleting(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Evidence</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="error" paragraph>
            Warning: This action cannot be undone.
          </Typography>
          <Typography variant="body1">
            Are you sure you want to delete this evidence?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File preview dialog */}
      <Dialog
        open={filePreviewOpen}
        onClose={() => setFilePreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { height: "90vh" } }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {evidence.fileName || "File Preview"}
            </Typography>
            <IconButton onClick={() => setFilePreviewOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            height: "calc(100% - 64px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* This would be replaced with actual file preview based on file type */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1" paragraph>
              File preview not available in this demo.
            </Typography>
            <Button variant="contained" startIcon={<DownloadIcon />}>
              Download File
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EvidenceDetails;
