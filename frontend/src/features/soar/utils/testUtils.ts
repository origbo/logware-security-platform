import { configureStore } from "@reduxjs/toolkit";
import { render as rtlRender } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import { soarApi } from "../services/soarService";
import { anomalyApi } from "../services/anomalyService";
import soarReducer from "../slices/soarSlice";

/**
 * Test utility for rendering components with Redux and Router providers
 * This makes it easier to test components that rely on Redux state or routing
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        soar: soarReducer,
        [soarApi.reducerPath]: soarApi.reducer,
        [anomalyApi.reducerPath]: anomalyApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
          .concat(soarApi.middleware)
          .concat(anomalyApi.middleware),
      preloadedState,
    }),
    route = "/",
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      Provider,
      { store },
      React.createElement(MemoryRouter, { initialEntries: [route] }, children)
    );
  }

  return {
    store,
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Helper function to verify Redux state matches expected values
 * Used for testing data flow through Redux
 */
export function verifyReduxState(
  store: any,
  selector: Function,
  expectedValue: any
) {
  const state = store.getState();
  const actualValue = selector(state);
  expect(actualValue).toEqual(expectedValue);
  return actualValue;
}

/**
 * Test data creators for SOAR module testing
 */
export const createTestPlaybook = (overrides = {}) => ({
  id: "test-playbook-1",
  name: "Test Playbook",
  description: "Test playbook for integration testing",
  status: "active",
  triggerType: "manual",
  createdAt: "2025-05-19T10:00:00Z",
  updatedAt: "2025-05-19T10:00:00Z",
  owner: "admin",
  steps: [],
  successCount: 0,
  failureCount: 0,
  ...overrides,
});

export const createTestExecution = (overrides = {}) => ({
  id: "test-exec-1",
  type: "playbook",
  name: "Test Execution",
  status: "running",
  startTime: "2025-05-19T10:05:00Z",
  triggeredBy: {
    type: "user",
    id: "user-1",
    name: "Admin User",
  },
  steps: [],
  ...overrides,
});

export const createTestRule = (overrides = {}) => ({
  id: "test-rule-1",
  name: "Test Rule",
  description: "Test automation rule",
  isEnabled: true,
  trigger: {
    type: "alert",
    config: {},
  },
  conditions: [],
  actions: [],
  runOrder: 1,
  createdAt: "2025-05-19T10:00:00Z",
  updatedAt: "2025-05-19T10:00:00Z",
  createdBy: "admin",
  executionStats: {
    totalExecutions: 0,
    successCount: 0,
    failureCount: 0,
    avgDuration: 0,
  },
  ...overrides,
});

export const mockApiResponse = (data: any) => {
  return {
    data,
    isLoading: false,
    isSuccess: true,
    isError: false,
    error: null,
  };
};

export const mockApiError = (error: string) => {
  return {
    data: undefined,
    isLoading: false,
    isSuccess: false,
    isError: true,
    error,
  };
};

export const mockApiLoading = () => {
  return {
    data: undefined,
    isLoading: true,
    isSuccess: false,
    isError: false,
    error: null,
  };
};
