/**
 * SOAR Slice - Playbooks
 *
 * Redux slice for managing playbooks in the SOAR module.
 * This handles local state for playbook editing, filtering, and selection.
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../../store/store";
import { Playbook, PlaybookFilters, PlaybooksState } from "../types/soarTypes";

// Initial state for the playbooks portion of the SOAR module
const initialState: PlaybooksState = {
  data: {},
  loading: false,
  error: null,
  selectedId: null,
  filters: {
    status: ["active", "draft"],
    searchTerm: "",
  },
};

const soarSlice = createSlice({
  name: "soar/playbooks",
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

    // Set selected playbook
    selectPlaybook: (state, action: PayloadAction<string | null>) => {
      state.selectedId = action.payload;
    },

    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<PlaybookFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    // Reset filters to default
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Set multiple playbooks at once (e.g., after fetching)
    setPlaybooks: (state, action: PayloadAction<Playbook[]>) => {
      state.data = action.payload.reduce(
        (acc, playbook) => {
          acc[playbook.id] = playbook;
          return acc;
        },
        { ...state.data }
      );
    },

    // Update a single playbook in the store
    updatePlaybook: (state, action: PayloadAction<Playbook>) => {
      const playbook = action.payload;
      state.data[playbook.id] = playbook;
    },

    // Remove a playbook from the store
    removePlaybook: (state, action: PayloadAction<string>) => {
      const playbookId = action.payload;
      delete state.data[playbookId];

      // If the removed playbook was selected, clear selection
      if (state.selectedId === playbookId) {
        state.selectedId = null;
      }
    },

    // Update a playbook step
    updatePlaybookStep: (
      state,
      action: PayloadAction<{
        playbookId: string;
        stepId: string;
        updates: Partial<any>;
      }>
    ) => {
      const { playbookId, stepId, updates } = action.payload;
      const playbook = state.data[playbookId];

      if (playbook) {
        const stepIndex = playbook.steps.findIndex(
          (step) => step.id === stepId
        );

        if (stepIndex !== -1) {
          playbook.steps[stepIndex] = {
            ...playbook.steps[stepIndex],
            ...updates,
          };
        }
      }
    },

    // Clear playbooks store
    clearPlaybooks: (state) => {
      state.data = {};
      state.selectedId = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setError,
  selectPlaybook,
  updateFilters,
  resetFilters,
  setPlaybooks,
  updatePlaybook,
  removePlaybook,
  updatePlaybookStep,
  clearPlaybooks,
} = soarSlice.actions;

// Export selectors
export const selectAllPlaybooks = (state: RootState) =>
  Object.values(state.soar.playbooks.data);

export const selectPlaybookById = (state: RootState, playbookId: string) =>
  state.soar.playbooks.data[playbookId];

export const selectSelectedPlaybook = (state: RootState) =>
  state.soar.playbooks.selectedId
    ? state.soar.playbooks.data[state.soar.playbooks.selectedId]
    : null;

export const selectPlaybooksLoading = (state: RootState) =>
  state.soar.playbooks.loading;

export const selectPlaybooksError = (state: RootState) =>
  state.soar.playbooks.error;

export const selectPlaybookFilters = (state: RootState) =>
  state.soar.playbooks.filters;

export const selectFilteredPlaybooks = (state: RootState) => {
  const allPlaybooks = selectAllPlaybooks(state);
  const filters = selectPlaybookFilters(state);

  return allPlaybooks.filter((playbook) => {
    // Filter by status
    if (
      filters.status &&
      filters.status.length > 0 &&
      !filters.status.includes(playbook.status)
    ) {
      return false;
    }

    // Filter by trigger type
    if (
      filters.triggerType &&
      filters.triggerType.length > 0 &&
      !filters.triggerType.includes(playbook.triggerType)
    ) {
      return false;
    }

    // Filter by owner
    if (
      filters.owner &&
      filters.owner.length > 0 &&
      !filters.owner.includes(playbook.owner)
    ) {
      return false;
    }

    // Filter by category
    if (
      filters.category &&
      filters.category.length > 0 &&
      !filters.category?.includes(playbook.category || "")
    ) {
      return false;
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      if (
        !playbook.tags ||
        !filters.tags.some((tag) => playbook.tags?.includes(tag))
      ) {
        return false;
      }
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      return (
        playbook.name.toLowerCase().includes(searchTerm) ||
        playbook.description.toLowerCase().includes(searchTerm)
      );
    }

    return true;
  });
};

export default soarSlice.reducer;
