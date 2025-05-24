import React from "react";
import {
  Box,
  Collapse,
  Typography,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarningIcon,
  Info as InfoIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import { LogEntry, LogLevel } from "../services/LogViewerService";

interface LogEntryItemProps {
  log: LogEntry;
  expanded: boolean;
  onToggleExpand: () => void;
  levelColor: string;
}

/**
 * LogEntryItem Component
 *
 * Displays a single log entry with expandable details
 */
const LogEntryItem: React.FC<LogEntryItemProps> = ({
  log,
  expanded,
  onToggleExpand,
  levelColor,
}) => {
  const theme = useTheme();

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  // Get level icon
  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case LogLevel.ERROR:
        return <ErrorIcon fontSize="small" color="error" />;
      case LogLevel.WARNING:
        return <WarningIcon fontSize="small" color="warning" />;
      case LogLevel.INFO:
        return <InfoIcon fontSize="small" color="info" />;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        return <CodeIcon fontSize="small" color="success" />;
      default:
        return null;
    }
  };

  // Copy log entry to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Could show a snackbar notification here
        console.log("Log copied to clipboard");
      })
      .catch((err) => {
        console.error("Error copying to clipboard:", err);
      });
  };

  // Format JSON for display
  const formatJson = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch (err) {
      return JSON.stringify(String(obj));
    }
  };

  return (
    <Box
      sx={{
        borderLeft: `4px solid ${levelColor}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: expanded
          ? alpha(levelColor, 0.05)
          : theme.palette.mode === "dark"
          ? "background.paper"
          : "background.default",
        "&:hover": {
          bgcolor: alpha(levelColor, 0.05),
        },
        transition: theme.transitions.create(["background-color"]),
      }}
    >
      {/* Log Entry Header */}
      <Box
        sx={{
          px: 1.5,
          py: 0.75,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={onToggleExpand}
      >
        {/* Level indicator and timestamp */}
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 220 }}>
          <Box sx={{ mr: 1 }}>{getLevelIcon(log.level)}</Box>
          <Typography
            variant="caption"
            sx={{
              fontFamily: "monospace",
              fontWeight: "medium",
              color: "text.secondary",
            }}
          >
            {formatTimestamp(log.timestamp)}
          </Typography>
        </Box>

        {/* Source Chip */}
        <Chip
          label={log.source}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.7rem",
            mr: 1,
            textTransform: "uppercase",
          }}
        />

        {/* Log message */}
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {log.message}
        </Typography>

        {/* Actions */}
        <Box sx={{ ml: 1, display: "flex" }}>
          <Tooltip title="Copy log entry">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(JSON.stringify(log, null, 2));
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={expanded ? "Collapse" : "Expand"}>
            <IconButton
              size="small"
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: theme.transitions.create("transform"),
              }}
            >
              <ExpandMoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Expanded Details */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          {/* Metadata */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mb: 1.5,
              pt: 1,
            }}
          >
            {log.userId && (
              <Chip
                label={`User: ${log.userId}`}
                size="small"
                sx={{ height: 24 }}
              />
            )}
            {log.correlationId && (
              <Chip
                label={`Correlation ID: ${log.correlationId}`}
                size="small"
                sx={{ height: 24 }}
              />
            )}
            {log.ipAddress && (
              <Chip
                label={`IP: ${log.ipAddress}`}
                size="small"
                sx={{ height: 24 }}
              />
            )}
            {log.tags &&
              log.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" sx={{ height: 24 }} />
              ))}
          </Box>

          {/* Full Message */}
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="subtitle2" gutterBottom>
              Message
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{
                fontFamily: "monospace",
                wordBreak: "break-word",
              }}
            >
              {log.message}
            </Typography>
          </Box>

          {/* Details (if any) */}
          {log.details && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Details
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  maxHeight: 300,
                  overflow: "auto",
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(0,0,0,0.03)",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {formatJson(log.details)}
                </pre>
              </Paper>
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default LogEntryItem;
