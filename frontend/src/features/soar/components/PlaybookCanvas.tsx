import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ArrowForward as ArrowIcon,
  DragIndicator as DragIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { Playbook, PlaybookStep } from "../../../services/api/soarApiService";

interface PlaybookCanvasProps {
  playbook: Playbook;
  zoom: number;
  selectedStepId: string | undefined;
  onSelectStep: (step: PlaybookStep | null) => void;
  onUpdateStep: (step: PlaybookStep) => void;
  onDeleteStep: (stepId: string) => void;
  onConnectSteps: (sourceId: string, targetId: string) => void;
  onDisconnectSteps: (sourceId: string, targetId: string) => void;
}

// Determines the color for different step types
const getStepColor = (type: string, theme: any) => {
  switch (type) {
    case "action":
      return theme.palette.primary.main;
    case "condition":
      return theme.palette.warning.main;
    case "notification":
      return theme.palette.info.main;
    case "integration":
      return theme.palette.secondary.main;
    case "wait":
      return theme.palette.success.main;
    default:
      return theme.palette.grey[500];
  }
};

// Determines the icon for different step types
const getStepIcon = (type: string) => {
  switch (type) {
    case "action":
      return <SettingsIcon />;
    case "condition":
      return <ArrowIcon />;
    case "notification":
      return <ArrowIcon />;
    case "integration":
      return <ArrowIcon />;
    case "wait":
      return <ArrowIcon />;
    default:
      return <SettingsIcon />;
  }
};

/**
 * PlaybookCanvas Component
 *
 * Visual canvas for creating and editing playbooks with drag-and-drop functionality
 */
const PlaybookCanvas: React.FC<PlaybookCanvasProps> = ({
  playbook,
  zoom,
  selectedStepId,
  onSelectStep,
  onUpdateStep,
  onDeleteStep,
  onConnectSteps,
  onDisconnectSteps,
}) => {
  const theme = useTheme();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedStep, setDraggedStep] = useState<string | null>(null);
  const [draggedPosition, setDraggedPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [connectionEnd, setConnectionEnd] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [stepRefs, setStepRefs] = useState<Map<string, HTMLDivElement>>(
    new Map()
  );

  // Register step references
  const registerStepRef = (id: string, ref: HTMLDivElement | null) => {
    if (ref) {
      setStepRefs((prev) => {
        const newRefs = new Map(prev);
        newRefs.set(id, ref);
        return newRefs;
      });
    }
  };

  // Handle step selection
  const handleSelectStep = (step: PlaybookStep) => {
    if (selectedStepId === step.id) {
      onSelectStep(null);
    } else {
      onSelectStep(step);
    }
  };

  // Handle drag over canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Handle drop on canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      // Get drop position relative to canvas
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const x = (e.clientX - canvasRect.left) / zoom;
      const y = (e.clientY - canvasRect.top) / zoom;

      // Check if this is a new step from toolbox
      const jsonData = e.dataTransfer.getData("application/json");
      if (jsonData) {
        const stepTemplate = JSON.parse(jsonData);
        const newStepPosition = { x, y };
        onUpdateStep({
          ...stepTemplate,
          id: `step-${Date.now()}`,
          position: newStepPosition,
          nextSteps: [],
        });
        return;
      }

      // Check if this is an existing step being moved
      if (draggedStep) {
        const step = playbook.steps.find((s) => s.id === draggedStep);
        if (step) {
          onUpdateStep({
            ...step,
            position: x,
          });
        }
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    } finally {
      setDraggedStep(null);
      setDraggedPosition(null);
    }
  };

  // Start dragging a step
  const handleStepDragStart = (e: React.DragEvent, step: PlaybookStep) => {
    setDraggedStep(step.id);

    // Set drag image
    const dragImage = document.createElement("div");
    dragImage.style.width = "100px";
    dragImage.style.height = "40px";
    dragImage.style.backgroundColor = "transparent";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 20);

    // Clean up
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  // Start connection from a step
  const handleConnectionStart = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConnectionStart(stepId);

    // Get initial position
    const stepEl = stepRefs.get(stepId);
    if (stepEl) {
      const rect = stepEl.getBoundingClientRect();
      setConnectionEnd({
        x: e.clientX,
        y: e.clientY,
      });
    }

    // Add event listeners for mouse move and up
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Handle mouse move during connection drawing
  const handleMouseMove = (e: MouseEvent) => {
    if (connectionStart) {
      setConnectionEnd({
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  // Handle mouse up to complete connection
  const handleMouseUp = (e: MouseEvent) => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (connectionStart && connectionEnd) {
      // Check if mouse is over a step
      for (const [id, ref] of stepRefs.entries()) {
        if (id !== connectionStart) {
          const rect = ref.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            // Create connection
            onConnectSteps(connectionStart, id);
            break;
          }
        }
      }
    }

    setConnectionStart(null);
    setConnectionEnd(null);
  };

  // Render connection lines between steps
  const renderConnections = () => {
    const connections: JSX.Element[] = [];

    playbook.steps.forEach((step) => {
      if (step.nextSteps && step.nextSteps.length > 0) {
        const sourceRef = stepRefs.get(step.id);

        step.nextSteps.forEach((targetId) => {
          const targetRef = stepRefs.get(targetId);

          if (sourceRef && targetRef) {
            const sourceRect = sourceRef.getBoundingClientRect();
            const targetRect = targetRef.getBoundingClientRect();

            // Calculate center points
            const sourceX = sourceRect.left + sourceRect.width / 2;
            const sourceY = sourceRect.top + sourceRect.height / 2;
            const targetX = targetRect.left + targetRect.width / 2;
            const targetY = targetRect.top + targetRect.height / 2;

            // Calculate control points for curved line
            const controlPointX = (sourceX + targetX) / 2;
            const controlPointY = (sourceY + targetY) / 2;

            const canvasRect = canvasRef.current?.getBoundingClientRect();
            if (canvasRect) {
              // Adjust positions relative to canvas
              const adjustedSourceX = sourceX - canvasRect.left;
              const adjustedSourceY = sourceY - canvasRect.top;
              const adjustedTargetX = targetX - canvasRect.left;
              const adjustedTargetY = targetY - canvasRect.top;
              const adjustedControlX = controlPointX - canvasRect.left;
              const adjustedControlY = controlPointY - canvasRect.top;

              connections.push(
                <svg
                  key={`${step.id}-${targetId}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                >
                  <path
                    d={`M ${adjustedSourceX} ${adjustedSourceY} Q ${adjustedControlX} ${adjustedControlY} ${adjustedTargetX} ${adjustedTargetY}`}
                    fill="none"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    strokeDasharray="4"
                  />
                  {/* Arrow head */}
                  <circle
                    cx={adjustedTargetX}
                    cy={adjustedTargetY}
                    r={4}
                    fill={theme.palette.primary.main}
                  />
                </svg>
              );
            }
          }
        });
      }
    });

    // Render active connection being drawn
    if (connectionStart && connectionEnd) {
      const sourceRef = stepRefs.get(connectionStart);

      if (sourceRef && canvasRef.current) {
        const sourceRect = sourceRef.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();

        // Calculate source center point
        const sourceX =
          sourceRect.left + sourceRect.width / 2 - canvasRect.left;
        const sourceY = sourceRect.top + sourceRect.height / 2 - canvasRect.top;

        // Calculate end point relative to canvas
        const endX = connectionEnd.x - canvasRect.left;
        const endY = connectionEnd.y - canvasRect.top;

        connections.push(
          <svg
            key="active-connection"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <path
              d={`M ${sourceX} ${sourceY} L ${endX} ${endY}`}
              fill="none"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              strokeDasharray="4"
            />
          </svg>
        );
      }
    }

    return connections;
  };

  return (
    <Box
      ref={canvasRef}
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "auto",
        transition: "transform 0.2s ease",
        transform: `scale(${zoom})`,
        transformOrigin: "0 0",
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Render step blocks */}
      {playbook.steps.map((step) => (
        <Paper
          key={step.id}
          ref={(ref) => registerStepRef(step.id, ref)}
          sx={{
            position: "absolute",
            left: `${
              typeof step.position === "number" ? step.position : 100
            }px`,
            top: "100px",
            width: 200,
            display: "flex",
            flexDirection: "column",
            borderRadius: 1,
            border: "2px solid",
            borderColor:
              selectedStepId === step.id
                ? getStepColor(step.type, theme)
                : "transparent",
            boxShadow: 3,
            cursor: "move",
            zIndex: selectedStepId === step.id ? 10 : 1,
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          draggable
          onDragStart={(e) => handleStepDragStart(e, step)}
          onClick={() => handleSelectStep(step)}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: getStepColor(step.type, theme),
              color: "#fff",
              p: 1,
              display: "flex",
              alignItems: "center",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            <Box sx={{ mr: 1 }}>{getStepIcon(step.type)}</Box>
            <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
              {step.name}
            </Typography>
            <IconButton
              size="small"
              sx={{ color: "#fff", p: 0.5 }}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStep(step.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ p: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 1 }}
            >
              {step.description || "No description"}
            </Typography>

            <Chip
              label={step.type}
              size="small"
              sx={{
                textTransform: "capitalize",
                bgcolor: alpha(getStepColor(step.type, theme), 0.1),
                color: getStepColor(step.type, theme),
                fontWeight: "medium",
              }}
            />
          </Box>

          {/* Connection points */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tooltip title="Draw connection to another step">
              <IconButton
                size="small"
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: "#fff",
                  "&:hover": {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
                onMouseDown={(e) => handleConnectionStart(step.id, e)}
              >
                <ArrowIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      ))}

      {/* Render connections */}
      {renderConnections()}
    </Box>
  );
};

export default PlaybookCanvas;
