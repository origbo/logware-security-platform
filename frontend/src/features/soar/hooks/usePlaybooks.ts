/**
 * usePlaybooks Hook
 *
 * Custom hook for working with playbooks in the SOAR module.
 * Combines Redux state and RTK Query for a complete playbook management solution.
 */

import { useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPlaybookById,
  selectAllPlaybooks,
  selectFilteredPlaybooks,
  selectPlaybooksLoading,
  selectPlaybooksError,
  selectPlaybookFilters,
  selectPlaybook,
  updateFilters,
  resetFilters,
} from "../slice/soarSlice";
import {
  useGetPlaybooksQuery,
  useGetPlaybookQuery,
  useCreatePlaybookMutation,
  useUpdatePlaybookMutation,
  useDeletePlaybookMutation,
  useExecutePlaybookMutation,
  useClonePlaybookMutation,
} from "../services/playbookService";
import {
  Playbook,
  PlaybookStep,
  PlaybookFilters,
  PlaybookStatus,
  TriggerType,
} from "../types/soarTypes";
import { RootState } from "../../../store/store";

interface UsePlaybooksHook {
  // Playbook data
  playbooks: Playbook[];
  filteredPlaybooks: Playbook[];
  selectedPlaybook: Playbook | null;
  playbookById: (id: string) => Playbook | undefined;

  // Loading and error states
  loading: boolean;
  error: string | null;

  // Filter operations
  filters: PlaybookFilters;
  setFilters: (filters: Partial<PlaybookFilters>) => void;
  clearFilters: () => void;

  // Selection operations
  selectPlaybook: (id: string | null) => void;

  // CRUD operations
  fetchPlaybooks: (filters?: PlaybookFilters) => void;
  fetchPlaybook: (id: string) => void;
  createPlaybook: (playbook: Partial<Playbook>) => Promise<Playbook>;
  updatePlaybook: (
    playbook: Partial<Playbook> & { id: string }
  ) => Promise<Playbook>;
  deletePlaybook: (id: string) => Promise<void>;

  // Playbook operations
  executePlaybook: (id: string, input?: Record<string, any>) => Promise<any>;
  clonePlaybook: (id: string, name: string) => Promise<Playbook>;

  // Step operations
  addStep: (
    playbookId: string,
    step: Partial<PlaybookStep>
  ) => Promise<Playbook>;
  updateStep: (
    playbookId: string,
    stepId: string,
    updates: Partial<PlaybookStep>
  ) => Promise<Playbook>;
  deleteStep: (playbookId: string, stepId: string) => Promise<Playbook>;
  connectSteps: (
    playbookId: string,
    sourceId: string,
    targetId: string
  ) => Promise<Playbook>;
  disconnectSteps: (
    playbookId: string,
    sourceId: string,
    targetId: string
  ) => Promise<Playbook>;

  // Status operations
  publishPlaybook: (id: string) => Promise<Playbook>;
  archivePlaybook: (id: string) => Promise<Playbook>;
  activatePlaybook: (id: string) => Promise<Playbook>;
}

/**
 * Hook for working with playbooks in the SOAR module
 */
export function usePlaybooks(): UsePlaybooksHook {
  const dispatch = useDispatch();

  // Local selectors
  const allPlaybooks = useSelector(selectAllPlaybooks);
  const filteredPlaybooks = useSelector(selectFilteredPlaybooks);
  const loading = useSelector(selectPlaybooksLoading);
  const error = useSelector(selectPlaybooksError);
  const filters = useSelector(selectPlaybookFilters);

  const selectedPlaybookId = useSelector(
    (state: RootState) => state.soar.playbooks.selectedId
  );
  const selectedPlaybook = useSelector((state: RootState) =>
    selectedPlaybookId ? selectPlaybookById(state, selectedPlaybookId) : null
  );

  // API hooks
  const { refetch: refetchPlaybooks } = useGetPlaybooksQuery(undefined, {
    skip: true,
  });
  const { refetch: refetchPlaybook } = useGetPlaybookQuery("", { skip: true });
  const [createPlaybookMutation] = useCreatePlaybookMutation();
  const [updatePlaybookMutation] = useUpdatePlaybookMutation();
  const [deletePlaybookMutation] = useDeletePlaybookMutation();
  const [executePlaybookMutation] = useExecutePlaybookMutation();
  const [clonePlaybookMutation] = useClonePlaybookMutation();

  // Filter operations
  const setFilters = useCallback(
    (newFilters: Partial<PlaybookFilters>) => {
      dispatch(updateFilters(newFilters));
    },
    [dispatch]
  );

  const clearFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  // Selection operations
  const handleSelectPlaybook = useCallback(
    (id: string | null) => {
      dispatch(selectPlaybook(id));
    },
    [dispatch]
  );

  // Fetch operations
  const fetchPlaybooks = useCallback(
    async (customFilters?: PlaybookFilters) => {
      if (customFilters) {
        dispatch(updateFilters(customFilters));
      }
      await refetchPlaybooks();
    },
    [refetchPlaybooks, dispatch]
  );

  const fetchPlaybook = useCallback(
    async (id: string) => {
      await refetchPlaybook({ id });
    },
    [refetchPlaybook]
  );

  // CRUD operations
  const createPlaybook = useCallback(
    async (playbook: Partial<Playbook>) => {
      const result = await createPlaybookMutation(playbook as any).unwrap();
      return result;
    },
    [createPlaybookMutation]
  );

  const updatePlaybook = useCallback(
    async (playbook: Partial<Playbook> & { id: string }) => {
      const result = await updatePlaybookMutation(playbook).unwrap();
      return result;
    },
    [updatePlaybookMutation]
  );

  const deletePlaybook = useCallback(
    async (id: string) => {
      await deletePlaybookMutation(id).unwrap();
    },
    [deletePlaybookMutation]
  );

  // Playbook operations
  const executePlaybook = useCallback(
    async (id: string, input?: Record<string, any>) => {
      const result = await executePlaybookMutation({
        playbookId: id,
        input,
      }).unwrap();
      return result;
    },
    [executePlaybookMutation]
  );

  const clonePlaybook = useCallback(
    async (id: string, name: string) => {
      const result = await clonePlaybookMutation({ id, name }).unwrap();
      return result;
    },
    [clonePlaybookMutation]
  );

  // Step operations
  const addStep = useCallback(
    async (playbookId: string, step: Partial<PlaybookStep>) => {
      const playbook = selectPlaybookById(
        store.getState() as RootState,
        playbookId
      );
      if (!playbook) throw new Error("Playbook not found");

      const updatedPlaybook = {
        ...playbook,
        steps: [...playbook.steps, step as PlaybookStep],
      };

      return await updatePlaybookMutation({
        id: playbookId,
        steps: updatedPlaybook.steps,
      }).unwrap();
    },
    [updatePlaybookMutation]
  );

  const updateStep = useCallback(
    async (
      playbookId: string,
      stepId: string,
      updates: Partial<PlaybookStep>
    ) => {
      const playbook = selectPlaybookById(
        store.getState() as RootState,
        playbookId
      );
      if (!playbook) throw new Error("Playbook not found");

      const stepIndex = playbook.steps.findIndex((s) => s.id === stepId);
      if (stepIndex === -1) throw new Error("Step not found");

      const updatedSteps = [...playbook.steps];
      updatedSteps[stepIndex] = {
        ...updatedSteps[stepIndex],
        ...updates,
      };

      return await updatePlaybookMutation({
        id: playbookId,
        steps: updatedSteps,
      }).unwrap();
    },
    [updatePlaybookMutation]
  );

  const deleteStep = useCallback(
    async (playbookId: string, stepId: string) => {
      const playbook = selectPlaybookById(
        store.getState() as RootState,
        playbookId
      );
      if (!playbook) throw new Error("Playbook not found");

      // Remove the step
      const updatedSteps = playbook.steps.filter((s) => s.id !== stepId);

      // Remove references to this step from other steps
      updatedSteps.forEach((step) => {
        if (step.nextSteps.includes(stepId)) {
          step.nextSteps = step.nextSteps.filter((id) => id !== stepId);
        }
      });

      return await updatePlaybookMutation({
        id: playbookId,
        steps: updatedSteps,
      }).unwrap();
    },
    [updatePlaybookMutation]
  );

  const connectSteps = useCallback(
    async (playbookId: string, sourceId: string, targetId: string) => {
      const playbook = selectPlaybookById(
        store.getState() as RootState,
        playbookId
      );
      if (!playbook) throw new Error("Playbook not found");

      const sourceIndex = playbook.steps.findIndex((s) => s.id === sourceId);
      if (sourceIndex === -1) throw new Error("Source step not found");

      // Check if connection already exists
      if (playbook.steps[sourceIndex].nextSteps.includes(targetId)) {
        return playbook;
      }

      const updatedSteps = [...playbook.steps];
      updatedSteps[sourceIndex] = {
        ...updatedSteps[sourceIndex],
        nextSteps: [...updatedSteps[sourceIndex].nextSteps, targetId],
      };

      return await updatePlaybookMutation({
        id: playbookId,
        steps: updatedSteps,
      }).unwrap();
    },
    [updatePlaybookMutation]
  );

  const disconnectSteps = useCallback(
    async (playbookId: string, sourceId: string, targetId: string) => {
      const playbook = selectPlaybookById(
        store.getState() as RootState,
        playbookId
      );
      if (!playbook) throw new Error("Playbook not found");

      const sourceIndex = playbook.steps.findIndex((s) => s.id === sourceId);
      if (sourceIndex === -1) throw new Error("Source step not found");

      const updatedSteps = [...playbook.steps];
      updatedSteps[sourceIndex] = {
        ...updatedSteps[sourceIndex],
        nextSteps: updatedSteps[sourceIndex].nextSteps.filter(
          (id) => id !== targetId
        ),
      };

      return await updatePlaybookMutation({
        id: playbookId,
        steps: updatedSteps,
      }).unwrap();
    },
    [updatePlaybookMutation]
  );

  // Status operations
  const publishPlaybook = useCallback(
    async (id: string) => {
      return await updatePlaybookMutation({
        id,
        status: "active" as PlaybookStatus,
      }).unwrap();
    },
    [updatePlaybookMutation]
  );

  const archivePlaybook = useCallback(
    async (id: string) => {
      return await updatePlaybookMutation({
        id,
        status: "archived" as PlaybookStatus,
      }).unwrap();
    },
    [updatePlaybookMutation]
  );

  const activatePlaybook = useCallback(
    async (id: string) => {
      return await updatePlaybookMutation({
        id,
        status: "active" as PlaybookStatus,
      }).unwrap();
    },
    [updatePlaybookMutation]
  );

  // Helper to get playbook by ID
  const playbookById = useCallback((id: string) => {
    return selectPlaybookById(store.getState() as RootState, id);
  }, []);

  return {
    // Playbook data
    playbooks: allPlaybooks,
    filteredPlaybooks,
    selectedPlaybook,
    playbookById,

    // Loading and error states
    loading,
    error,

    // Filter operations
    filters,
    setFilters,
    clearFilters,

    // Selection operations
    selectPlaybook: handleSelectPlaybook,

    // CRUD operations
    fetchPlaybooks,
    fetchPlaybook,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,

    // Playbook operations
    executePlaybook,
    clonePlaybook,

    // Step operations
    addStep,
    updateStep,
    deleteStep,
    connectSteps,
    disconnectSteps,

    // Status operations
    publishPlaybook,
    archivePlaybook,
    activatePlaybook,
  };
}
