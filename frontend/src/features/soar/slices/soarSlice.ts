import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Incident,
  ThreatHunt,
  ThreatHuntResult,
  CollaborationSession,
  CollaborationMessage,
  TaskItem,
} from "../types/soarTypes";
// Use a more generic approach for importing RootState to avoid circular references
type RootState = {
  soar: SoarState;
  [key: string]: any;
};

interface SoarState {
  // UI State
  activeSoarTab: number;
  activeAutomationTab: number;
  activeAnomalyTab: number;
  activeCollaborationTab: number;

  // Filters
  incidentFilters: {
    status: string;
    severity: string;
    assignee: string;
    dateRange: string;
    searchTerm: string;
  };
  huntFilters: {
    category: string;
    status: string;
    dataSource: string;
    searchTerm: string;
  };
  executionFilters: {
    status: string;
    type: string;
    dateRange: string;
    searchTerm: string;
  };

  // Active Session
  activeCollaborationSession: string | null;
  activeIncidentId: string | null;

  // Cached Data (for offline or performance optimization)
  cachedIncidents: Incident[];
  cachedHunts: ThreatHunt[];
  cachedHuntResults: ThreatHuntResult[];
  cachedMessages: CollaborationMessage[];
  cachedTasks: TaskItem[];

  // Drafts (for user input that hasn't been saved)
  draftPlaybookId: string | null;
  draftHuntId: string | null;
  draftRuleId: string | null;

  // Loading and Error States
  isInitialized: boolean;
  isLoading: {
    incidents: boolean;
    hunts: boolean;
    automations: boolean;
    collaboration: boolean;
  };
  errors: {
    incidents: string | null;
    hunts: string | null;
    automations: string | null;
    collaboration: string | null;
  };
}

const initialState: SoarState = {
  // UI State
  activeSoarTab: 0,
  activeAutomationTab: 0,
  activeAnomalyTab: 0,
  activeCollaborationTab: 0,

  // Filters
  incidentFilters: {
    status: "all",
    severity: "all",
    assignee: "all",
    dateRange: "30d",
    searchTerm: "",
  },
  huntFilters: {
    category: "all",
    status: "all",
    dataSource: "all",
    searchTerm: "",
  },
  executionFilters: {
    status: "all",
    type: "all",
    dateRange: "7d",
    searchTerm: "",
  },

  // Active Session
  activeCollaborationSession: null,
  activeIncidentId: null,

  // Cached Data
  cachedIncidents: [],
  cachedHunts: [],
  cachedHuntResults: [],
  cachedMessages: [],
  cachedTasks: [],

  // Drafts
  draftPlaybookId: null,
  draftHuntId: null,
  draftRuleId: null,

  // Loading and Error States
  isInitialized: false,
  isLoading: {
    incidents: false,
    hunts: false,
    automations: false,
    collaboration: false,
  },
  errors: {
    incidents: null,
    hunts: null,
    automations: null,
    collaboration: null,
  },
};

export const soarSlice = createSlice({
  name: "soar",
  initialState,
  reducers: {
    // UI State Actions
    setActiveSoarTab: (state, action: PayloadAction<number>) => {
      state.activeSoarTab = action.payload;
    },
    setActiveAutomationTab: (state, action: PayloadAction<number>) => {
      state.activeAutomationTab = action.payload;
    },
    setActiveAnomalyTab: (state, action: PayloadAction<number>) => {
      state.activeAnomalyTab = action.payload;
    },
    setActiveCollaborationTab: (state, action: PayloadAction<number>) => {
      state.activeCollaborationTab = action.payload;
    },

    // Filter Actions
    setIncidentFilters: (
      state,
      action: PayloadAction<Partial<SoarState["incidentFilters"]>>
    ) => {
      state.incidentFilters = { ...state.incidentFilters, ...action.payload };
    },
    resetIncidentFilters: (state) => {
      state.incidentFilters = initialState.incidentFilters;
    },
    setHuntFilters: (
      state,
      action: PayloadAction<Partial<SoarState["huntFilters"]>>
    ) => {
      state.huntFilters = { ...state.huntFilters, ...action.payload };
    },
    resetHuntFilters: (state) => {
      state.huntFilters = initialState.huntFilters;
    },
    setExecutionFilters: (
      state,
      action: PayloadAction<Partial<SoarState["executionFilters"]>>
    ) => {
      state.executionFilters = { ...state.executionFilters, ...action.payload };
    },
    resetExecutionFilters: (state) => {
      state.executionFilters = initialState.executionFilters;
    },

    // Active Session Actions
    setActiveCollaborationSession: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.activeCollaborationSession = action.payload;
    },
    setActiveIncidentId: (state, action: PayloadAction<string | null>) => {
      state.activeIncidentId = action.payload;
    },

    // Cache Actions
    cacheIncidents: (state, action: PayloadAction<Incident[]>) => {
      state.cachedIncidents = action.payload;
    },
    updateCachedIncident: (state, action: PayloadAction<Incident>) => {
      const index = state.cachedIncidents.findIndex(
        (incident) => incident.id === action.payload.id
      );
      if (index !== -1) {
        state.cachedIncidents[index] = action.payload;
      } else {
        state.cachedIncidents.push(action.payload);
      }
    },
    cacheHunts: (state, action: PayloadAction<ThreatHunt[]>) => {
      state.cachedHunts = action.payload;
    },
    cacheHuntResults: (state, action: PayloadAction<ThreatHuntResult[]>) => {
      state.cachedHuntResults = action.payload;
    },
    cacheMessages: (state, action: PayloadAction<CollaborationMessage[]>) => {
      state.cachedMessages = action.payload;
    },
    addCachedMessage: (state, action: PayloadAction<CollaborationMessage>) => {
      state.cachedMessages.push(action.payload);
    },
    cacheTasks: (state, action: PayloadAction<TaskItem[]>) => {
      state.cachedTasks = action.payload;
    },
    updateCachedTask: (state, action: PayloadAction<TaskItem>) => {
      const index = state.cachedTasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.cachedTasks[index] = action.payload;
      } else {
        state.cachedTasks.push(action.payload);
      }
    },

    // Draft Actions
    setDraftPlaybookId: (state, action: PayloadAction<string | null>) => {
      state.draftPlaybookId = action.payload;
    },
    setDraftHuntId: (state, action: PayloadAction<string | null>) => {
      state.draftHuntId = action.payload;
    },
    setDraftRuleId: (state, action: PayloadAction<string | null>) => {
      state.draftRuleId = action.payload;
    },

    // Loading and Error Actions
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setLoading: (
      state,
      action: PayloadAction<{
        type: keyof SoarState["isLoading"];
        value: boolean;
      }>
    ) => {
      state.isLoading[action.payload.type] = action.payload.value;
    },
    setError: (
      state,
      action: PayloadAction<{
        type: keyof SoarState["errors"];
        value: string | null;
      }>
    ) => {
      state.errors[action.payload.type] = action.payload.value;
    },
    clearErrors: (state) => {
      state.errors = initialState.errors;
    },
  },
});

// Export actions
export const {
  // UI State Actions
  setActiveSoarTab,
  setActiveAutomationTab,
  setActiveAnomalyTab,
  setActiveCollaborationTab,

  // Filter Actions
  setIncidentFilters,
  resetIncidentFilters,
  setHuntFilters,
  resetHuntFilters,
  setExecutionFilters,
  resetExecutionFilters,

  // Active Session Actions
  setActiveCollaborationSession,
  setActiveIncidentId,

  // Cache Actions
  cacheIncidents,
  updateCachedIncident,
  cacheHunts,
  cacheHuntResults,
  cacheMessages,
  addCachedMessage,
  cacheTasks,
  updateCachedTask,

  // Draft Actions
  setDraftPlaybookId,
  setDraftHuntId,
  setDraftRuleId,

  // Loading and Error Actions
  setInitialized,
  setLoading,
  setError,
  clearErrors,
} = soarSlice.actions;

// Export selectors
export const selectActiveSoarTab = (state: RootState) =>
  state.soar.activeSoarTab;
export const selectActiveAutomationTab = (state: RootState) =>
  state.soar.activeAutomationTab;
export const selectActiveAnomalyTab = (state: RootState) =>
  state.soar.activeAnomalyTab;
export const selectActiveCollaborationTab = (state: RootState) =>
  state.soar.activeCollaborationTab;

export const selectIncidentFilters = (state: RootState) =>
  state.soar.incidentFilters;
export const selectHuntFilters = (state: RootState) => state.soar.huntFilters;
export const selectExecutionFilters = (state: RootState) =>
  state.soar.executionFilters;

export const selectActiveCollaborationSession = (state: RootState) =>
  state.soar.activeCollaborationSession;
export const selectActiveIncidentId = (state: RootState) =>
  state.soar.activeIncidentId;

export const selectCachedIncidents = (state: RootState) =>
  state.soar.cachedIncidents;
export const selectCachedHunts = (state: RootState) => state.soar.cachedHunts;
export const selectCachedHuntResults = (state: RootState) =>
  state.soar.cachedHuntResults;
export const selectCachedMessages = (state: RootState) =>
  state.soar.cachedMessages;
export const selectCachedTasks = (state: RootState) => state.soar.cachedTasks;

export const selectDraftPlaybookId = (state: RootState) =>
  state.soar.draftPlaybookId;
export const selectDraftHuntId = (state: RootState) => state.soar.draftHuntId;
export const selectDraftRuleId = (state: RootState) => state.soar.draftRuleId;

export const selectIsInitialized = (state: RootState) =>
  state.soar.isInitialized;
export const selectIsLoading = (state: RootState) => state.soar.isLoading;
export const selectErrors = (state: RootState) => state.soar.errors;

export default soarSlice.reducer;
