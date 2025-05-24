/**
 * Store Type Helpers
 *
 * This file provides type declarations to help avoid circular dependencies
 * when importing types from the Redux store.
 */

import { store } from "../app/store";

// Export store types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Type helper for useSelector
export type AppSelector<T> = (state: RootState) => T;

// Type helper for useDispatch
export interface DispatchFunc {
  <T>(action: T): T;
}

// Re-export for convenience
export { store };
