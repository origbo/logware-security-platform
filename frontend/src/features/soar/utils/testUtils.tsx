import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { ThemeProvider } from "@mui/material/styles";
import { soarReducer } from "../slices/soarSlice";
import { soarApi } from "../services/soarService";
import { theme } from "../../../theme";

// Helper function to create a test store
export function setupStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      soar: soarReducer,
      [soarApi.reducerPath]: soarApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(soarApi.middleware),
    preloadedState,
  });
}

// Type inference for the store
export type AppStore = ReturnType<typeof setupStore>;
export type RootState = ReturnType<AppStore["getState"]>;

// Test render function with providers
export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState),
    route = "/",
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Generate test playbook data
export function createTestPlaybook(overrides = {}) {
  return {
    id: "playbook-1",
    name: "Malware Containment",
    description: "Automatically contain malware incidents",
    status: "active",
    version: "1.0.0",
    createdAt: "2023-05-18T14:23:12Z",
    updatedAt: "2023-05-18T14:25:45Z",
    author: "System",
    steps: [
      {
        id: "step-1",
        name: "Isolate Affected Endpoint",
        type: "action",
        status: "completed",
        parameters: {
          actionType: "isolate",
          target: "endpoint",
        },
      },
      {
        id: "step-2",
        name: "Scan For Malware",
        type: "action",
        status: "pending",
        parameters: {
          actionType: "scan",
          scanType: "malware",
          target: "endpoint",
        },
      },
    ],
    ...overrides,
  };
}

// Generate test rule data
export function createTestRule(overrides = {}) {
  return {
    id: "rule-1",
    name: "Malware Detection Rule",
    description: "Triggers on detection of malware",
    isEnabled: true,
    priority: "high",
    createdAt: "2023-05-18T14:23:12Z",
    updatedAt: "2023-05-18T14:25:45Z",
    author: "System",
    trigger: {
      type: "alert",
      condition: {
        field: "alertType",
        operator: "equals",
        value: "malware",
      },
    },
    actions: [
      {
        id: "action-1",
        type: "runPlaybook",
        playbook: "playbook-1",
      },
    ],
    ...overrides,
  };
}

// Generate test execution data
export function createTestExecution(overrides = {}) {
  return {
    id: "execution-1",
    name: "Malware Containment",
    type: "playbook",
    status: "completed",
    startTime: "2023-05-18T14:23:12Z",
    endTime: "2023-05-18T14:25:45Z",
    duration: 153,
    triggeredBy: {
      type: "rule",
      id: "rule-1",
      name: "Malware Detection Rule",
    },
    relatedEntities: [
      {
        type: "host",
        id: "host-001",
        name: "win-desktop-01",
      },
    ],
    steps: [
      {
        id: "exec-step-1",
        name: "Isolate Affected Endpoint",
        status: "completed",
        startTime: "2023-05-18T14:23:15Z",
        endTime: "2023-05-18T14:23:30Z",
      },
      {
        id: "exec-step-2",
        name: "Scan For Malware",
        status: "completed",
        startTime: "2023-05-18T14:23:32Z",
        endTime: "2023-05-18T14:25:40Z",
      },
    ],
    ...overrides,
  };
}

// Mock response data generator (useful for MSW handlers)
export function createMockResponse(data: any, status = 200, delay = 0) {
  return {
    status,
    delay,
    data,
  };
}
