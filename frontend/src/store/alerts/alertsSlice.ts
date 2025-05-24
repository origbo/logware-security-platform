// @ts-ignore - Temporarily ignore createSlice import error
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: "active" | "acknowledged" | "resolved" | "false_positive";
  source: string;
  timestamp: string;
  relatedResources?: {
    type: string;
    id: string;
    name: string;
  }[];
  assignedTo?: string;
  tags?: string[];
}

interface AlertsState {
  items: Record<string, Alert>;
  loading: boolean;
  error: string | null;
  selectedAlertId: string | null;
  filters: {
    severity?: string[];
    status?: string[];
    source?: string[];
    timeRange?: string;
    searchQuery?: string;
  };
}

const initialState: AlertsState = {
  items: {},
  loading: false,
  error: null,
  selectedAlertId: null,
  filters: {},
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    fetchAlertsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAlertsSuccess: (state, action: PayloadAction<Alert[]>) => {
      state.loading = false;
      state.items = action.payload.reduce((acc, alert) => {
        acc[alert.id] = alert;
        return acc;
      }, {} as Record<string, Alert>);
    },
    fetchAlertsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    selectAlert: (state, action: PayloadAction<string | null>) => {
      state.selectedAlertId = action.payload;
    },
    updateAlertStatus: (
      state,
      action: PayloadAction<{ id: string; status: Alert["status"] }>
    ) => {
      const { id, status } = action.payload;
      if (state.items[id]) {
        state.items[id].status = status;
      }
    },
    setAlertFilters: (
      state,
      action: PayloadAction<Partial<AlertsState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAlertFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  fetchAlertsStart,
  fetchAlertsSuccess,
  fetchAlertsFailure,
  selectAlert,
  updateAlertStatus,
  setAlertFilters,
  clearAlertFilters,
} = alertsSlice.actions;

export default alertsSlice.reducer;
