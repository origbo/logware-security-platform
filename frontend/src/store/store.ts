import { configureStore, combineReducers } from "@reduxjs/toolkit";
// @ts-ignore - Temporarily ignore setupListeners import error
import { setupListeners } from "@reduxjs/toolkit/query";

// Import reducers
import authReducer from "../features/auth/slice/authSlice";
// Import or create mock reducers for development
// Using createReducer from RTK to create empty reducers temporarily
import { createReducer } from "@reduxjs/toolkit";
import preferencesReducer from "../features/preferences/preferencesSlice";

// Import SOAR reducers
import playbooksReducer from "../features/soar/slice/soarSlice";
import casesReducer from "../features/soar/slice/casesSlice";

// Import APIs
import { api } from "../services/api";
import { mfaApi } from "../services/auth/mfaService";
import { userPreferencesApi } from "../services/api/userPreferencesService";
import { errorAnalyticsApi } from "../services/analytics/errorAnalyticsService";

// Import SOAR APIs
import { playbookApi } from "../features/soar/services/playbookService";
import { caseApi } from "../features/soar/services/caseService";

// Mock reducers for missing slices
const uiReducer = createReducer({}, () => {});
const alertsReducer = createReducer({}, () => {});
const logsReducer = createReducer({}, () => {});
const complianceReducer = createReducer({}, () => {});
const vulnerabilitiesReducer = createReducer({}, () => {});
const dashboardReducer = createReducer({}, () => {});
const networkReducer = createReducer({}, () => {});
const reportsReducer = createReducer({}, () => {});
const userManagementReducer = createReducer({}, () => {});
const integrationsReducer = createReducer({}, () => {});

// Create root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  alerts: alertsReducer,
  logs: logsReducer,
  compliance: complianceReducer,
  vulnerabilities: vulnerabilitiesReducer,
  dashboard: dashboardReducer,
  network: networkReducer,
  reports: reportsReducer,
  userManagement: userManagementReducer,
  integrations: integrationsReducer,
  preferences: preferencesReducer,
  // SOAR module
  soar: combineReducers({
    playbooks: playbooksReducer,
    cases: casesReducer,
  }),
  // API reducers
  [api.reducerPath]: api.reducer,
  [mfaApi.reducerPath]: mfaApi.reducer,
  [userPreferencesApi.reducerPath]: userPreferencesApi.reducer,
  [errorAnalyticsApi.reducerPath]: errorAnalyticsApi.reducer,
  [playbookApi.reducerPath]: playbookApi.reducer,
  [caseApi.reducerPath]: caseApi.reducer,
});

// Create Redux store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types as they may contain non-serializable data
        ignoredActions: [
          "auth/login/fulfilled",
          "auth/refreshToken/fulfilled",
          "auth/verify2FA/fulfilled",
          "preferences/setAllPreferences",
          "preferences/setDashboardLayout",
          "soar/playbooks/updatePlaybook",
          "soar/playbooks/updatePlaybookStep",
          "soar/cases/addTimelineEvent",
          "soar/cases/updateTimelineEvent",
          "soar/cases/addArtifact",
        ],
      },
    }).concat(
      api.middleware,
      mfaApi.middleware,
      userPreferencesApi.middleware,
      errorAnalyticsApi.middleware,
      playbookApi.middleware,
      caseApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production",
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
