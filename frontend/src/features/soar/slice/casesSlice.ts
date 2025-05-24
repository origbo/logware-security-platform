/**
 * SOAR Slice - Cases
 *
 * Redux slice for managing security cases in the SOAR module.
 * Handles case filtering, selection, and local state management.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";
import {
  Case,
  CaseFilters,
  CasesState,
  Artifact,
  TimelineEvent,
} from "../types/soarTypes";

// Initial state for the cases portion of the SOAR module
const initialState: CasesState = {
  data: {},
  loading: false,
  error: null,
  selectedId: null,
  filters: {
    status: ["open", "investigating"],
    severity: ["critical", "high"],
    searchTerm: "",
  },
};

const casesSlice = createSlice({
  name: "soar/cases",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Set selected case
    selectCase: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<CaseFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    // Reset filters to default
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Set multiple cases at once (e.g., after fetching)
    setCases: (state, action: PayloadAction<Case[]>) => {
      state.data = action.payload.reduce(
        (acc, caseItem) => {
          acc[caseItem.id] = caseItem;
          return acc;
        },
        { ...state.data }
      );
    },

    // Update a single case in the store
    updateCase: (state, action: PayloadAction<Case>) => {
      const caseItem = action.payload;
      state.data[caseItem.id] = caseItem;
    },

    // Remove a case from the store
    removeCase: (state, action: PayloadAction<string>) => {
      const caseId = action.payload;
      delete state.data[caseId];

      // If the removed case was selected, clear selection
      if (state.selectedId === caseId) {
        state.selectedId = null;
      }
    },

    // Add an artifact to a case
    addArtifact: (
      state,
      action: PayloadAction<{ caseId: string; artifact: Artifact }>
    ) => {
      const { caseId, artifact } = action.payload;
      const caseItem = state.data[caseId];

      if (caseItem) {
        caseItem.artifacts = [...caseItem.artifacts, artifact];
      }
    },

    // Update an artifact in a case
    updateArtifact: (
      state,
      action: PayloadAction<{
        caseId: string;
        artifactId: string;
        updates: Partial<Artifact>;
      }>
    ) => {
      const { caseId, artifactId, updates } = action.payload;
      const caseItem = state.data[caseId];

      if (caseItem) {
        const artifactIndex = caseItem.artifacts.findIndex(
          (a) => a.id === artifactId
        );

        if (artifactIndex !== -1) {
          caseItem.artifacts[artifactIndex] = {
            ...caseItem.artifacts[artifactIndex],
            ...updates,
          };
        }
      }
    },

    // Remove an artifact from a case
    removeArtifact: (
      state,
      action: PayloadAction<{ caseId: string; artifactId: string }>
    ) => {
      const { caseId, artifactId } = action.payload;
      const caseItem = state.data[caseId];

      if (caseItem) {
        caseItem.artifacts = caseItem.artifacts.filter(
          (a) => a.id !== artifactId
        );
      }
    },

    // Add a timeline event to a case
    addTimelineEvent: (
      state,
      action: PayloadAction<{ caseId: string; event: TimelineEvent }>
    ) => {
      const { caseId, event } = action.payload;
      const caseItem = state.data[caseId];

      if (caseItem) {
        caseItem.timeline = [...caseItem.timeline, event];

        // Sort timeline by createdAt
        caseItem.timeline.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    },

    // Update a timeline event
    updateTimelineEvent: (
      state,
      action: PayloadAction<{
        caseId: string;
        eventId: string;
        updates: Partial<TimelineEvent>;
      }>
    ) => {
      const { caseId, eventId, updates } = action.payload;
      const caseItem = state.data[caseId];

      if (caseItem) {
        const eventIndex = caseItem.timeline.findIndex((e) => e.id === eventId);

        if (eventIndex !== -1) {
          caseItem.timeline[eventIndex] = {
            ...caseItem.timeline[eventIndex],
            ...updates,
          };
        }
      }
    },

    // Remove a timeline event
    removeTimelineEvent: (
      state,
      action: PayloadAction<{ caseId: string; eventId: string }>
    ) => {
      const { caseId, eventId } = action.payload;
      const caseItem = state.data[caseId];

      if (caseItem) {
        caseItem.timeline = caseItem.timeline.filter((e) => e.id !== eventId);
      }
    },

    // Update case status
    updateCaseStatus: (
      state,
      action: PayloadAction<{ caseId: string; status: Case["status"] }>
    ) => {
      const { caseId, status } = action.payload;
      const caseItem = state.data[caseId];

      if (caseItem) {
        caseItem.status = status;

        // If closing the case, set closedAt
        if (status === "closed") {
          caseItem.closedAt = new Date().toISOString();
        } else if (caseItem.closedAt && status !== "closed") {
          // If reopening, remove closedAt
          caseItem.closedAt = undefined;
        }
      }
    },

    // Clear cases store
    clearCases: (state) => {
      state.data = {};
      state.selectedId = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  selectCase,
  updateFilters,
  resetFilters,
  setCases,
  updateCase,
  removeCase,
  addArtifact,
  updateArtifact,
  removeArtifact,
  addTimelineEvent,
  updateTimelineEvent,
  removeTimelineEvent,
  updateCaseStatus,
  clearCases,
} = casesSlice.actions;

// Export selectors
export const selectAllCases = (state: RootState) =>
  Object.values(state.soar.cases.data);

export const selectCaseById = (state: RootState, caseId: string) =>
  state.soar.cases.data[caseId];

export const selectSelectedCase = (state: RootState) =>
  state.soar.cases.selectedId
    ? state.soar.cases.data[state.soar.cases.selectedId]
    : null;

export const selectCasesLoading = (state: RootState) =>
  state.soar.cases.loading;

export const selectCasesError = (state: RootState) => state.soar.cases.error;

export const selectCaseFilters = (state: RootState) => state.soar.cases.filters;

export const selectFilteredCases = (state: RootState) => {
  const allCases = selectAllCases(state);
  const filters = selectCaseFilters(state);

  return allCases.filter((caseItem) => {
    // Filter by status
    if (
      filters.status &&
      filters.status.length > 0 &&
      !filters.status.includes(caseItem.status)
    ) {
      return false;
    }

    // Filter by severity
    if (
      filters.severity &&
      filters.severity.length > 0 &&
      !filters.severity.includes(caseItem.severity)
    ) {
      return false;
    }

    // Filter by priority
    if (
      filters.priority &&
      filters.priority.length > 0 &&
      !filters.priority.includes(caseItem.priority)
    ) {
      return false;
    }

    // Filter by assignee
    if (filters.assignedTo && filters.assignedTo.length > 0) {
      if (
        !caseItem.assignedTo ||
        !filters.assignedTo.includes(caseItem.assignedTo)
      ) {
        return false;
      }
    }

    // Filter by creator
    if (
      filters.createdBy &&
      filters.createdBy.length > 0 &&
      !filters.createdBy.includes(caseItem.createdBy)
    ) {
      return false;
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((tag) => caseItem.tags.includes(tag))) {
        return false;
      }
    }

    // Filter by date range
    if (filters.dateRange) {
      const caseDate = new Date(caseItem.createdAt).getTime();
      const startDate = new Date(filters.dateRange.start).getTime();
      const endDate = new Date(filters.dateRange.end).getTime();

      if (caseDate < startDate || caseDate > endDate) {
        return false;
      }
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      return (
        caseItem.title.toLowerCase().includes(searchTerm) ||
        caseItem.description.toLowerCase().includes(searchTerm) ||
        // Search in artifacts
        caseItem.artifacts.some(
          (artifact) =>
            artifact.value.toLowerCase().includes(searchTerm) ||
            (artifact.description &&
              artifact.description.toLowerCase().includes(searchTerm))
        )
      );
    }

    return true;
  });
};

export default casesSlice.reducer;
