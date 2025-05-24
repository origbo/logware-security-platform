/**
 * useCases Hook
 *
 * Custom hook for working with security cases in the SOAR module.
 * Combines Redux state and RTK Query for a complete case management solution.
 */

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCaseById,
  selectAllCases,
  selectFilteredCases,
  selectCasesLoading,
  selectCasesError,
  selectCaseFilters,
  selectCase,
  updateFilters,
  resetFilters,
  updateCaseStatus,
  addArtifact,
  updateArtifact,
  removeArtifact,
  addTimelineEvent,
  updateTimelineEvent,
  removeTimelineEvent,
} from "../slice/casesSlice";
import {
  useGetCasesQuery,
  useGetCaseQuery,
  useCreateCaseMutation,
  useUpdateCaseMutation,
  useCloseCaseMutation,
  useReopenCaseMutation,
  useAddArtifactMutation,
  useUpdateArtifactMutation,
  useDeleteArtifactMutation,
  useAddTimelineEventMutation,
  useUpdateTimelineEventMutation,
  useDeleteTimelineEventMutation,
  useLinkPlaybookMutation,
  useExecuteCasePlaybookMutation,
} from "../services/caseService";
import {
  Case,
  CaseFilters,
  Artifact,
  TimelineEvent,
  CaseStatus,
  CaseSeverity,
  CasePriority,
} from "../types/soarTypes";
import { RootState } from "../../../store/store";

interface UseCasesHook {
  // Case data
  cases: Case[];
  filteredCases: Case[];
  selectedCase: Case | null;
  caseById: (id: string) => Case | undefined;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Filter operations
  filters: CaseFilters;
  setFilters: (filters: Partial<CaseFilters>) => void;
  clearFilters: () => void;

  // Selection operations
  selectCase: (id: string | null) => void;

  // CRUD operations
  fetchCases: (filters?: CaseFilters) => void;
  fetchCase: (id: string) => void;
  createCase: (caseData: Partial<Case>) => Promise<Case>;
  updateCase: (caseData: Partial<Case> & { id: string }) => Promise<Case>;

  // Status operations
  changeStatus: (id: string, status: CaseStatus) => void;
  closeCase: (id: string, resolution: string) => Promise<Case>;
  reopenCase: (id: string, reason: string) => Promise<Case>;

  // Artifact operations
  addArtifact: (
    caseId: string,
    artifact: Partial<Artifact>
  ) => Promise<Artifact>;
  updateArtifact: (
    caseId: string,
    artifactId: string,
    updates: Partial<Artifact>
  ) => Promise<Artifact>;
  removeArtifact: (caseId: string, artifactId: string) => Promise<void>;

  // Timeline operations
  addTimelineEvent: (
    event: Omit<TimelineEvent, "id" | "createdAt">
  ) => Promise<TimelineEvent>;
  updateTimelineEvent: (
    caseId: string,
    eventId: string,
    updates: Partial<TimelineEvent>
  ) => Promise<TimelineEvent>;
  removeTimelineEvent: (caseId: string, eventId: string) => Promise<void>;

  // Playbook operations
  linkPlaybook: (caseId: string, playbookId: string) => Promise<void>;
  executePlaybook: (
    caseId: string,
    playbookId: string,
    input?: Record<string, any>
  ) => Promise<void>;

  // Utility functions
  getStatusColor: (status: CaseStatus) => string;
  getSeverityColor: (severity: CaseSeverity) => string;
  getPriorityLabel: (priority: CasePriority) => string;
}

/**
 * Hook for working with security cases in the SOAR module
 */
export function useCases(): UseCasesHook {
  const dispatch = useDispatch();

  // Local selectors
  const allCases = useSelector(selectAllCases);
  const filteredCases = useSelector(selectFilteredCases);
  const loading = useSelector(selectCasesLoading);
  const error = useSelector(selectCasesError);
  const filters = useSelector(selectCaseFilters);

  const selectedCaseId = useSelector(
    (state: RootState) => state.soar.cases.selectedId
  );
  const selectedCase = useSelector((state: RootState) =>
    selectedCaseId ? selectCaseById(state, selectedCaseId) : null
  );

  // API hooks
  const { refetch: refetchCases } = useGetCasesQuery(undefined, { skip: true });
  const { refetch: refetchCase } = useGetCaseQuery("", { skip: true });
  const [createCaseMutation] = useCreateCaseMutation();
  const [updateCaseMutation] = useUpdateCaseMutation();
  const [closeCaseMutation] = useCloseCaseMutation();
  const [reopenCaseMutation] = useReopenCaseMutation();
  const [addArtifactMutation] = useAddArtifactMutation();
  const [updateArtifactMutation] = useUpdateArtifactMutation();
  const [deleteArtifactMutation] = useDeleteArtifactMutation();
  const [addTimelineEventMutation] = useAddTimelineEventMutation();
  const [updateTimelineEventMutation] = useUpdateTimelineEventMutation();
  const [deleteTimelineEventMutation] = useDeleteTimelineEventMutation();
  const [linkPlaybookMutation] = useLinkPlaybookMutation();
  const [executeCasePlaybookMutation] = useExecuteCasePlaybookMutation();

  // Filter operations
  const setFilters = useCallback(
    (newFilters: Partial<CaseFilters>) => {
      dispatch(updateFilters(newFilters));
    },
    [dispatch]
  );

  const clearFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Selection operations
  const handleSelectCase = useCallback(
    (id: string | null) => {
      dispatch(selectCase(id));
    },
    [dispatch]
  );

  // Fetch operations
  const fetchCases = useCallback(
    async (customFilters?: CaseFilters) => {
      if (customFilters) {
        dispatch(updateFilters(customFilters));
      }
      await refetchCases();
    },
    [refetchCases, dispatch]
  );

  const fetchCase = useCallback(
    async (id: string) => {
      await refetchCase({ id });
    },
    [refetchCase]
  );

  // CRUD operations
  const createCase = useCallback(
    async (caseData: Partial<Case>) => {
      const result = await createCaseMutation(caseData as any).unwrap();
      return result;
    },
    [createCaseMutation]
  );

  const updateCase = useCallback(
    async (caseData: Partial<Case> & { id: string }) => {
      const result = await updateCaseMutation(caseData).unwrap();
      return result;
    },
    [updateCaseMutation]
  );

  // Status operations
  const changeStatus = useCallback(
    (id: string, status: CaseStatus) => {
      dispatch(updateCaseStatus({ caseId: id, status }));

      // Update on the server
      updateCaseMutation({ id, status });
    },
    [dispatch, updateCaseMutation]
  );

  const closeCase = useCallback(
    async (id: string, resolution: string) => {
      const result = await closeCaseMutation({ id, resolution }).unwrap();
      return result;
    },
    [closeCaseMutation]
  );

  const reopenCase = useCallback(
    async (id: string, reason: string) => {
      const result = await reopenCaseMutation({ id, reason }).unwrap();
      return result;
    },
    [reopenCaseMutation]
  );

  // Artifact operations
  const handleAddArtifact = useCallback(
    async (caseId: string, artifact: Partial<Artifact>) => {
      const result = await addArtifactMutation({
        caseId,
        ...artifact,
      } as any).unwrap();

      // Update local state
      dispatch(addArtifact({ caseId, artifact: result }));

      return result;
    },
    [addArtifactMutation, dispatch]
  );

  const handleUpdateArtifact = useCallback(
    async (caseId: string, artifactId: string, updates: Partial<Artifact>) => {
      const result = await updateArtifactMutation({
        caseId,
        id: artifactId,
        ...updates,
      }).unwrap();

      // Update local state
      dispatch(
        updateArtifact({
          caseId,
          artifactId,
          updates: result,
        })
      );

      return result;
    },
    [updateArtifactMutation, dispatch]
  );

  const handleRemoveArtifact = useCallback(
    async (caseId: string, artifactId: string) => {
      await deleteArtifactMutation({ caseId, id: artifactId }).unwrap();

      // Update local state
      dispatch(removeArtifact({ caseId, artifactId }));
    },
    [deleteArtifactMutation, dispatch]
  );

  // Timeline operations
  const handleAddTimelineEvent = useCallback(
    async (event: Omit<TimelineEvent, "id" | "createdAt">) => {
      const result = await addTimelineEventMutation(event as any).unwrap();

      // Update local state
      dispatch(
        addTimelineEvent({
          caseId: event.caseId,
          event: result,
        })
      );

      return result;
    },
    [addTimelineEventMutation, dispatch]
  );

  const handleUpdateTimelineEvent = useCallback(
    async (
      caseId: string,
      eventId: string,
      updates: Partial<TimelineEvent>
    ) => {
      const result = await updateTimelineEventMutation({
        caseId,
        id: eventId,
        ...updates,
      }).unwrap();

      // Update local state
      dispatch(
        updateTimelineEvent({
          caseId,
          eventId,
          updates: result,
        })
      );

      return result;
    },
    [updateTimelineEventMutation, dispatch]
  );

  const handleRemoveTimelineEvent = useCallback(
    async (caseId: string, eventId: string) => {
      await deleteTimelineEventMutation({ caseId, id: eventId }).unwrap();

      // Update local state
      dispatch(removeTimelineEvent({ caseId, eventId }));
    },
    [deleteTimelineEventMutation, dispatch]
  );

  // Playbook operations
  const handleLinkPlaybook = useCallback(
    async (caseId: string, playbookId: string) => {
      await linkPlaybookMutation({ caseId, playbookId }).unwrap();
    },
    [linkPlaybookMutation]
  );

  const handleExecutePlaybook = useCallback(
    async (caseId: string, playbookId: string, input?: Record<string, any>) => {
      await executeCasePlaybookMutation({ caseId, playbookId, input }).unwrap();
    },
    [executeCasePlaybookMutation]
  );

  // Helper to get case by ID
  const caseById = useCallback((id: string) => {
    return selectCaseById(store.getState() as RootState, id);
  }, []);

  // Utility functions
  const getStatusColor = useCallback((status: CaseStatus) => {
    switch (status) {
      case "open":
        return "#ff9800"; // Orange
      case "investigating":
        return "#2196f3"; // Blue
      case "containment":
        return "#673ab7"; // Deep Purple
      case "eradication":
        return "#e91e63"; // Pink
      case "recovery":
        return "#4caf50"; // Green
      case "closed":
        return "#757575"; // Grey
      default:
        return "#757575"; // Grey
    }
  }, []);

  const getSeverityColor = useCallback((severity: CaseSeverity) => {
    switch (severity) {
      case "critical":
        return "#f44336"; // Red
      case "high":
        return "#ff5722"; // Deep Orange
      case "medium":
        return "#ff9800"; // Orange
      case "low":
        return "#ffc107"; // Amber
      case "info":
        return "#2196f3"; // Blue
      default:
        return "#757575"; // Grey
    }
  }, []);

  const getPriorityLabel = useCallback((priority: CasePriority) => {
    switch (priority) {
      case "p0":
        return "Critical";
      case "p1":
        return "High";
      case "p2":
        return "Medium";
      case "p3":
        return "Low";
      case "p4":
        return "Planning";
      default:
        return "Unknown";
    }
  }, []);

  return {
    // Case data
    cases: allCases,
    filteredCases,
    selectedCase,
    caseById,

    // Loading and error states
    loading,
    error,

    // Filter operations
    filters,
    setFilters,
    clearFilters,

    // Selection operations
    selectCase: handleSelectCase,

    // CRUD operations
    fetchCases,
    fetchCase,
    createCase,
    updateCase,

    // Status operations
    changeStatus,
    closeCase,
    reopenCase,

    // Artifact operations
    addArtifact: handleAddArtifact,
    updateArtifact: handleUpdateArtifact,
    removeArtifact: handleRemoveArtifact,

    // Timeline operations
    addTimelineEvent: handleAddTimelineEvent,
    updateTimelineEvent: handleUpdateTimelineEvent,
    removeTimelineEvent: handleRemoveTimelineEvent,

    // Playbook operations
    linkPlaybook: handleLinkPlaybook,
    executePlaybook: handleExecutePlaybook,

    // Utility functions
    getStatusColor,
    getSeverityColor,
    getPriorityLabel,
  };
}
