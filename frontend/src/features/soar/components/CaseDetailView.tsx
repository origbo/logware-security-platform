/**
 * CaseDetailView Component
 *
 * Main component for viewing and managing the details of a security case.
 * Integrates the header and tab components for a comprehensive case management experience.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Typography,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// Import case components
import CaseDetailHeader from "./case/CaseDetailHeader";
import CaseDetailsTab from "./case/CaseDetailsTab";
import CaseArtifactsTab from "./case/CaseArtifactsTab";
import CaseTimelineTab from "./case/CaseTimelineTab";

// Import custom hooks
import { useCases } from "../hooks/useCases";

// Import types
import {
  SecurityCase,
  CaseStatus,
  Artifact,
  TimelineEvent,
} from "../types/soarTypes";

/**
 * TabPanel Component
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`case-tabpanel-${index}`}
      aria-labelledby={`case-tab-${index}`}
      style={{ height: "calc(100% - 48px)", overflow: "auto" }}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

/**
 * CaseDetailView Component
 */
const CaseDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    caseById,
    updateCase,
    deleteCase,
    addArtifact,
    deleteArtifact,
    addTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    loading,
    error,
  } = useCases();

  // State for the case data
  const [caseData, setCaseData] = useState<SecurityCase | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Load case data
  useEffect(() => {
    if (id) {
      const securityCase = caseById(id);
      if (securityCase) {
        setCaseData(securityCase);
      }
    }
  }, [id, caseById]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Toggle edit mode
  const handleEditModeToggle = () => {
    setEditMode((prev) => !prev);
  };

  // Update case
  const handleCaseUpdate = (updatedCase: SecurityCase) => {
    setCaseData(updatedCase);
    updateCase(updatedCase);
  };

  // Change case status
  const handleCaseStatusChange = (status: CaseStatus) => {
    if (!caseData) return;

    const updatedCase: SecurityCase = {
      ...caseData,
      status,
      updatedAt: new Date().toISOString(),
    };

    // If moving to resolved, add resolved date
    if (status === "resolved" && caseData.status !== "resolved") {
      updatedCase.resolvedAt = new Date().toISOString();
    }

    // If moving to closed, add closed date
    if (status === "closed" && caseData.status !== "closed") {
      updatedCase.closedAt = new Date().toISOString();
    }

    setCaseData(updatedCase);
    updateCase(updatedCase);
  };

  // Delete case
  const handleCaseDelete = () => {
    if (!caseData) return;

    deleteCase(caseData.id);
    navigate("/soar/cases");
  };

  // Add artifact
  const handleAddArtifact = (artifactData: Omit<Artifact, "id">) => {
    if (!caseData) return;

    const newArtifact: Artifact = {
      ...artifactData,
      id: uuidv4(),
    };

    addArtifact(caseData.id, newArtifact);

    // Update local state
    setCaseData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        artifacts: [...(prev.artifacts || []), newArtifact],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Delete artifact
  const handleDeleteArtifact = (artifactId: string) => {
    if (!caseData) return;

    deleteArtifact(caseData.id, artifactId);

    // Update local state
    setCaseData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        artifacts: prev.artifacts?.filter((a) => a.id !== artifactId) || [],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Add timeline event
  const handleAddTimelineEvent = (eventData: Omit<TimelineEvent, "id">) => {
    if (!caseData) return;

    const newEvent: TimelineEvent = {
      ...eventData,
      id: uuidv4(),
    };

    addTimelineEvent(caseData.id, newEvent);

    // Update local state
    setCaseData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        timelineEvents: [...(prev.timelineEvents || []), newEvent],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Update timeline event
  const handleUpdateTimelineEvent = (
    eventId: string,
    eventData: Partial<TimelineEvent>
  ) => {
    if (!caseData) return;

    updateTimelineEvent(caseData.id, eventId, eventData);

    // Update local state
    setCaseData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        timelineEvents:
          prev.timelineEvents?.map((e) =>
            e.id === eventId ? { ...e, ...eventData } : e
          ) || [],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Delete timeline event
  const handleDeleteTimelineEvent = (eventId: string) => {
    if (!caseData) return;

    deleteTimelineEvent(caseData.id, eventId);

    // Update local state
    setCaseData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        timelineEvents:
          prev.timelineEvents?.filter((e) => e.id !== eventId) || [],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error || !caseData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || `Case with ID ${id} not found`}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/soar/cases")}>
          Back to Cases
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Case Header */}
      <CaseDetailHeader
        caseData={caseData}
        editMode={editMode}
        onEditModeToggle={handleEditModeToggle}
        onCaseUpdate={handleCaseUpdate}
        onCaseStatusChange={handleCaseStatusChange}
        onCaseDelete={handleCaseDelete}
      />

      {/* Tabs */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Details" />
          <Tab label="Timeline" />
          <Tab label="Artifacts" />
          <Tab label="Playbooks" />
          <Tab label="Related Alerts" />
          <Tab label="Notes" />
        </Tabs>

        {/* Tab Content */}
        <TabPanel value={activeTab} index={0}>
          <CaseDetailsTab
            caseData={caseData}
            editMode={editMode}
            onCaseUpdate={handleCaseUpdate}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <CaseTimelineTab
            caseData={caseData}
            onAddTimelineEvent={handleAddTimelineEvent}
            onUpdateTimelineEvent={handleUpdateTimelineEvent}
            onDeleteTimelineEvent={handleDeleteTimelineEvent}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <CaseArtifactsTab
            caseData={caseData}
            onAddArtifact={handleAddArtifact}
            onDeleteArtifact={handleDeleteArtifact}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary" gutterBottom>
              Playbooks associated with this case will appear here.
            </Typography>
            <Button
              variant="contained"
              onClick={() =>
                navigate(`/soar/playbooks/run?caseId=${caseData.id}`)
              }
              sx={{ mt: 2 }}
            >
              Run Playbook
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              Related alerts will appear here once the alert integration module
              is implemented.
            </Typography>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={5}>
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              Case notes and comments will appear here.
            </Typography>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default CaseDetailView;
