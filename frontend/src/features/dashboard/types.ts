import { DashboardLayout, DashboardWidget, WidgetSize, WidgetType } from '../../services/dashboard/dashboardService';
import { Layout } from 'react-grid-layout';

/**
 * Extended Dashboard Widget interface with additional properties 
 * needed for the dashboard settings component
 */
export interface ExtendedDashboardWidget extends DashboardWidget {
  // Additional properties
  isHidden?: boolean;
}

/**
 * Extended Dashboard Layout interface with additional properties
 * needed for the dashboard settings component
 */
export interface ExtendedDashboardLayout extends DashboardLayout {
  // Additional properties
  isShared?: boolean;
  refreshInterval?: number;
  sharedWith?: string[];
}

/**
 * Hook result interface for useDashboard
 */
export interface UseDashboardResult {
  // Core dashboard data
  dashboard: DashboardLayout;
  isEditMode: boolean;
  loading: boolean;
  error: string;
  
  // Extended dashboard data
  dashboards?: ExtendedDashboardLayout[];
  currentDashboard?: ExtendedDashboardLayout;
  
  // Dashboard actions
  toggleEditMode: () => void;
  saveLayout: () => Promise<void>;
  loadDashboard: (id: string) => Promise<void>;
  updateDashboard: (dashboard: Record<string, unknown>) => Promise<boolean>;
  deleteDashboard: (dashboardId: string) => Promise<boolean>;
  cloneDashboard: (dashboardId: string, newName: string) => Promise<{ id: string }>;
  
  // Widget actions
  addNewWidget: (type: WidgetType, size?: WidgetSize, title?: string) => Promise<void>;
  removeWidget: (widgetId: string) => Promise<void>;
  updateWidgetPositions: (layouts: Layout[]) => Promise<void>;
}
