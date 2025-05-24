import { configureStore, combineReducers } from "@reduxjs/toolkit";
// @ts-ignore - setupListeners import issue
import setupListeners from "@reduxjs/toolkit/dist/query/core/setupListeners";
import { soarApi } from "../features/soar/services/soarService";
import { anomalyApi } from "../features/soar/services/anomalyService";
import soarReducer from "../features/soar/slices/soarSlice";

const rootReducer = combineReducers({
  // API services
  [soarApi.reducerPath]: soarApi.reducer,
  [anomalyApi.reducerPath]: anomalyApi.reducer,

  // Feature slices
  soar: soarReducer,
  // Add other feature reducers here
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(soarApi.middleware)
      .concat(anomalyApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Enable refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
