/**
 * Evidence Upload Component
 *
 * Handles uploading new evidence files with metadata
 */
import React, { useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Autocomplete,
  FormHelperText,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  useTheme,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Description as FileIcon,
  Image as ImageIcon,
  Assessment as ReportIcon,
  Code as CodeIcon,
  Notes as NotesIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { styled } from "@mui/material/styles";

// Import types
import {
  EvidenceType,
  EvidenceFormat,
  EvidenceStatus,
} from "../../types/evidenceTypes";

// Props interface
interface EvidenceUploadProps {
  open: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
  framework?: string;
  requirement?: string;
}

// Input component for file upload
const UploadInput = styled("input")({
  display: "none",
});

// File icon mapping
const getFileIcon = (format: string) => {
  if (format === "pdf" || format === "word" || format === "text")
    return <FileIcon />;
  if (format === "image" || format.startsWith("image/")) return <ImageIcon />;
  if (format === "excel" || format === "report") return <ReportIcon />;
  if (format === "json" || format === "xml" || format === "config")
    return <CodeIcon />;
  return <NotesIcon />;
};

// Sample framework requirements
const frameworkRequirements: Record<string, string[]> = {
  GDPR: [
    "Article 5 - Principles",
    "Article 6 - Lawfulness of processing",
    "Article 7 - Conditions for consent",
    "Article 12-14 - Information obligations",
    "Article 15 - Right of access",
    "Article 16 - Right to rectification",
    "Article 17 - Right to erasure",
    "Article 18 - Right to restriction",
    "Article 20 - Right to data portability",
    "Article 25 - Privacy by design",
    "Article 28 - Processor",
    "Article 30 - Records of processing",
    "Article 32 - Security of processing",
    "Article 35 - DPIA",
    "Article 37-39 - DPO",
  ],
  "PCI-DSS": [
    "Requirement 1.1 - Firewall standards",
    "Requirement 1.2 - Firewall configuration",
    "Requirement 2.1 - Default settings",
    "Requirement 2.2 - System hardening",
    "Requirement 3.1 - Data retention",
    "Requirement 3.4 - PAN storage",
    "Requirement 4.1 - Transmission encryption",
    "Requirement 5.1 - Anti-virus",
    "Requirement 6.1 - Security patching",
    "Requirement 6.5 - Secure development",
    "Requirement 7.1 - Access control",
    "Requirement 8.1 - User identification",
    "Requirement 9.1 - Physical access",
    "Requirement 10.1 - Audit trails",
    "Requirement 11.2 - Vulnerability scans",
    "Requirement 12.1 - Security policy",
  ],
  HIPAA: [
    "§ 164.308(a)(1) - Security Management",
    "§ 164.308(a)(2) - Assigned Security Responsibility",
    "§ 164.308(a)(3) - Workforce Security",
    "§ 164.308(a)(4) - Information Access Management",
    "§ 164.308(a)(5) - Security Awareness Training",
    "§ 164.310(a)(1) - Facility Access Controls",
    "§ 164.310(b) - Workstation Use",
    "§ 164.310(c) - Workstation Security",
    "§ 164.310(d)(1) - Device and Media Controls",
    "§ 164.312(a)(1) - Access Control",
    "§ 164.312(b) - Audit Controls",
    "§ 164.312(c)(1) - Integrity",
    "§ 164.312(d) - Person or Entity Authentication",
    "§ 164.312(e)(1) - Transmission Security",
    "§ 164.314(a)(1) - Business Associate Contracts",
  ],
  "ISO 27001": [
    "Clause 4.1 - Understanding the organization",
    "Clause 4.2 - Stakeholder needs",
    "Clause 5.1 - Leadership and commitment",
    "Clause 6.1.2 - Risk assessment",
    "Clause 6.1.3 - Risk treatment",
    "Clause 7.2 - Competence",
    "Clause 7.3 - Awareness",
    "Clause 7.5 - Documented information",
    "Clause 8.1 - Operational planning",
    "Clause 9.1 - Monitoring and measurement",
    "Clause 9.2 - Internal audit",
    "Clause 9.3 - Management review",
    "Clause 10.1 - Nonconformity and corrective action",
    "A.5 - Information security policies",
    "A.6 - Organization of information security",
    "A.7 - Human resource security",
    "A.8 - Asset management",
    "A.9 - Access control",
    "A.10 - Cryptography",
    "A.11 - Physical security",
    "A.12 - Operations security",
    "A.13 - Communications security",
    "A.14 - System acquisition and development",
    "A.15 - Supplier relationships",
    "A.16 - Information security incident management",
    "A.17 - Business continuity",
    "A.18 - Compliance",
  ],
};

// Common evidence tags
const commonTags = [
  "policy",
  "procedure",
  "training",
  "record",
  "report",
  "assessment",
  "configuration",
  "scan",
  "vulnerability",
  "security",
  "audit",
  "access",
  "network",
  "documentation",
  "control",
  "compliance",
  "incident",
  "backup",
  "risk",
  "monitoring",
  "review",
  "encryption",
  "authentication",
  "authorization",
  "user",
  "system",
  "privacy",
  "dpa",
];

/**
 * Evidence Upload Dialog
 */
const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  open,
  onClose,
  onUpload,
  framework,
  requirement,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected file state
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Form state
  const [evidenceName, setEvidenceName] = useState("");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState<string>(
    EvidenceType.DOCUMENT
  );
  const [selectedFramework, setSelectedFramework] = useState(framework || "");
  const [selectedRequirement, setSelectedRequirement] = useState(
    requirement || ""
  );
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile) {
      // Set the file
      setFile(selectedFile);

      // Generate a name from the file if not already set
      if (!evidenceName) {
        const nameFromFile = selectedFile.name
          .replace(/\.[^/.]+$/, "") // Remove extension
          .split("_")
          .join(" ") // Replace underscores with spaces
          .split("-")
          .join(" ") // Replace hyphens with spaces
          .replace(/\b\w/g, (l) => l.toUpperCase()); // Capitalize first letter of each word

        setEvidenceName(nameFromFile);
      }

      // Determine file type based on file extension
      const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "";
      if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension)) {
        setEvidenceType(EvidenceType.SCREENSHOT);
        // Create a preview for images
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else if (["pdf", "doc", "docx"].includes(extension)) {
        setEvidenceType(EvidenceType.DOCUMENT);
        setFilePreview(null);
      } else if (["xls", "xlsx", "csv"].includes(extension)) {
        setEvidenceType(EvidenceType.REPORT);
        setFilePreview(null);
      } else if (["log", "txt"].includes(extension)) {
        setEvidenceType(EvidenceType.LOG);
        setFilePreview(null);
      } else if (["json", "xml", "yaml", "yml", "conf"].includes(extension)) {
        setEvidenceType(EvidenceType.CONFIG);
        setFilePreview(null);
      }
    }
  };

  // Prompt file selection
  const promptFileSelection = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const newErrors: Record<string, string> = {};

    if (!file) newErrors.file = "File is required";
    if (!evidenceName.trim()) newErrors.name = "Name is required";
    if (!selectedFramework) newErrors.framework = "Framework is required";
    if (!selectedRequirement) newErrors.requirement = "Requirement is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create form data
    const formData = new FormData();
    formData.append("file", file as File);
    formData.append("name", evidenceName);
    formData.append("description", evidenceDescription);
    formData.append("type", evidenceType);
    formData.append("framework", selectedFramework);
    formData.append("requirement", selectedRequirement);

    if (expiryDate) {
      formData.append("expiryDate", expiryDate.toISOString());
    }

    if (tags.length > 0) {
      formData.append("tags", JSON.stringify(tags));
    }

    // Upload evidence
    try {
      setUploading(true);
      setUploadError(null);

      // In a real application, you would call the API here
      // For now, we'll simulate an API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Call onUpload callback
      await onUpload(formData);

      // Close dialog
      onClose();
    } catch (err) {
      console.error("Error uploading evidence:", err);
      setUploadError("Failed to upload evidence. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Clean up on close
  const handleClose = () => {
    // Reset form state
    setFile(null);
    setFilePreview(null);
    setEvidenceName("");
    setEvidenceDescription("");
    setEvidenceType(EvidenceType.DOCUMENT);
    setSelectedFramework(framework || "");
    setSelectedRequirement(requirement || "");
    setExpiryDate(null);
    setTags([]);
    setErrors({});
    setUploadError(null);

    // Call onClose callback
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">Upload Evidence</Typography>
          <Button
            onClick={handleClose}
            sx={{ minWidth: "auto", p: 1 }}
            color="inherit"
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        {uploadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* File Upload Section */}
          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                backgroundColor: theme.palette.background.default,
                borderStyle: "dashed",
                borderColor: errors.file
                  ? theme.palette.error.main
                  : theme.palette.divider,
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
                height: file ? "auto" : 200,
              }}
              onClick={promptFileSelection}
            >
              <UploadInput
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.log,.xml,.json,.yml,.yaml,.conf"
              />

              {file ? (
                <Box sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 1,
                      boxShadow: 1,
                    }}
                  >
                    <Box sx={{ mr: 2, color: theme.palette.primary.main }}>
                      {getFileIcon(file.type)}
                    </Box>
                    <Box sx={{ flexGrow: 1, textAlign: "left" }}>
                      <Typography variant="body2" noWrap>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {(file.size / 1024).toFixed(1)} KB •{" "}
                        {file.type || "Unknown type"}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFilePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      Replace
                    </Button>
                  </Box>

                  {filePreview && (
                    <Box sx={{ mt: 2, maxHeight: 200, overflow: "hidden" }}>
                      <img
                        src={filePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 200,
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <>
                  <UploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Drag and drop a file here, or click to select
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Supported file types: PDF, DOC, XLSX, PNG, JPG, TXT, LOG,
                    XML, JSON, YAML
                  </Typography>
                </>
              )}
            </Paper>
            {errors.file && (
              <FormHelperText error>{errors.file}</FormHelperText>
            )}
          </Grid>

          {/* Metadata Section */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Evidence Name"
              value={evidenceName}
              onChange={(e) => setEvidenceName(e.target.value)}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Description"
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Evidence Type</InputLabel>
              <Select
                value={evidenceType}
                label="Evidence Type"
                onChange={(e) => setEvidenceType(e.target.value)}
              >
                <MenuItem value={EvidenceType.DOCUMENT}>Document</MenuItem>
                <MenuItem value={EvidenceType.SCREENSHOT}>Screenshot</MenuItem>
                <MenuItem value={EvidenceType.LOG}>Log</MenuItem>
                <MenuItem value={EvidenceType.CONFIG}>Configuration</MenuItem>
                <MenuItem value={EvidenceType.REPORT}>Report</MenuItem>
                <MenuItem value={EvidenceType.ATTESTATION}>
                  Attestation
                </MenuItem>
                <MenuItem value={EvidenceType.OTHER}>Other</MenuItem>
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expiry Date (Optional)"
                value={expiryDate}
                onChange={(date) => setExpiryDate(date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              required
              error={!!errors.framework}
            >
              <InputLabel>Compliance Framework</InputLabel>
              <Select
                value={selectedFramework}
                label="Compliance Framework"
                onChange={(e) => {
                  setSelectedFramework(e.target.value);
                  setSelectedRequirement(""); // Reset requirement when framework changes
                }}
              >
                <MenuItem value="">Select Framework</MenuItem>
                <MenuItem value="GDPR">GDPR</MenuItem>
                <MenuItem value="PCI-DSS">PCI-DSS</MenuItem>
                <MenuItem value="HIPAA">HIPAA</MenuItem>
                <MenuItem value="ISO 27001">ISO 27001</MenuItem>
                <MenuItem value="ALL">ALL Frameworks</MenuItem>
              </Select>
              {errors.framework && (
                <FormHelperText>{errors.framework}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              required
              error={!!errors.requirement}
              disabled={!selectedFramework}
            >
              <InputLabel>Compliance Requirement</InputLabel>
              <Select
                value={selectedRequirement}
                label="Compliance Requirement"
                onChange={(e) => setSelectedRequirement(e.target.value)}
              >
                <MenuItem value="">Select Requirement</MenuItem>
                {selectedFramework &&
                  frameworkRequirements[selectedFramework]?.map((req) => (
                    <MenuItem key={req} value={req}>
                      {req}
                    </MenuItem>
                  ))}
                {selectedFramework === "ALL" && (
                  <MenuItem value="Various">Various Requirements</MenuItem>
                )}
              </Select>
              {errors.requirement && (
                <FormHelperText>{errors.requirement}</FormHelperText>
              )}
            </FormControl>

            <Autocomplete
              multiple
              freeSolo
              options={commonTags}
              value={tags}
              onChange={(_, newValue) => setTags(newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    size="small"
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags"
                  helperText="Press enter to add new tags"
                />
              )}
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="inherit" disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={uploading}
          startIcon={
            uploading ? <CircularProgress size={20} /> : <UploadIcon />
          }
        >
          {uploading ? "Uploading..." : "Upload Evidence"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EvidenceUpload;
