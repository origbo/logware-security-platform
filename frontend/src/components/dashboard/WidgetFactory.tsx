import React, { useState, useEffect } from "react";
import { Box, Typography, Skeleton, Chip } from "@mui/material";
import {
  DashboardWidget,
  WidgetType,
} from "../../services/dashboard/dashboardService";
import { ExtendedDashboardWidget } from "../../features/dashboard/types";
import useWidgetRealTimeData from "../../hooks/websocket/useWidgetRealTimeData";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { mockApiService } from "../../services/mock/mockApiService";

// Import widget components
import AlertsSummaryWidget from "./widgets/AlertsSummaryWidget";
import SystemHealthWidget from "./widgets/SystemHealthWidget";
import ActivityTimelineWidget from "./widgets/ActivityTimelineWidget";
import LogsOverviewWidget from "./widgets/LogsOverviewWidget";
import ComplianceStatusWidget from "./widgets/ComplianceStatusWidget";
import QuickActionsWidget from "./widgets/QuickActionsWidget";
import ThreatMapWidget from "./widgets/ThreatMapWidget";
import NetworkStatusWidget from "./widgets/NetworkStatusWidget";
import CustomChartWidget from "./widgets/CustomChartWidget";

// Import new widget components
import GDPRComplianceWidget from "./widgets/GDPRComplianceWidget";
import SecurityScoreWidget from "./widgets/SecurityScoreWidget";
import PlaybookStatusWidget from "./widgets/PlaybookStatusWidget";
import CloudSecurityWidget from "./widgets/CloudSecurityWidget";
import ThreatIntelSummaryWidget from "./widgets/ThreatIntelSummaryWidget";
import RecentCasesWidget from "./widgets/RecentCasesWidget";

// Import real-time enabled widgets
import AlertsSummaryWidgetWithRealTime from "./widgets/AlertsSummaryWidgetWithRealTime";
import SystemHealthWidgetWithRealTime from "./widgets/SystemHealthWidgetWithRealTime";
import NetworkStatusWidgetWithRealTime from "./widgets/NetworkStatusWidgetWithRealTime";

interface WidgetFactoryProps {
  widget: ExtendedDashboardWidget;
}

/**
 * Widget Factory Component
 * Renders the appropriate widget component based on the widget type
 * Also handles loading widget data and error states
 * Supports both WebSocket real-time updates and API polling fallbacks
 */
export const WidgetFactory: React.FC<WidgetFactoryProps> = ({ widget }) => {
  // Get user settings from Redux
  const { enableRealTimeUpdates } = useSelector(
    (state: RootState) => state.ui.settings
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Local state for widget data
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isUsingRealTime, setIsUsingRealTime] = useState(false);

  // Fetch data using our mock API service
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (isUsingRealTime) return;

      try {
        setLoading(true);
        const widgetData = await mockApiService.getWidgetData(widget.type);

        if (isMounted) {
          setData(widgetData);
          setError(false);
          setLoading(false);
        }
      } catch (err) {
        console.error(`Error fetching data for widget ${widget.id}:`, err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchData();

    // Set up polling for regular updates if not using real-time
    const interval = !isUsingRealTime ? setInterval(fetchData, 30000) : null;

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [widget.id, widget.type, isUsingRealTime]);

  // Set up WebSocket real-time data hook if enabled
  const {
    realTimeData,
    isConnected: isWebSocketConnected,
    error: webSocketError,
  } = useWidgetRealTimeData(
    widget.id,
    widget.type,
    data // Use fetched data as initial data
  );

  // Determine which data source to use
  const finalData = realTimeData || data;
  const isLoading = loading && !finalData;
  const isError = (!finalData && error) || (isUsingRealTime && webSocketError);

  // Update real-time status
  useEffect(() => {
    setIsUsingRealTime(isWebSocketConnected && realTimeData !== undefined);
  }, [isWebSocketConnected, realTimeData]);

  // Loading state
  if (isLoading) {
    return <WidgetSkeleton type={widget.type} />;
  }

  // Error state
  if (isError) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          textAlign: "center",
          color: "error.main",
        }}
      >
        <Typography variant="subtitle1" gutterBottom>
          Failed to load widget data
        </Typography>
        <Typography variant="body2">
          Check your connection and try refreshing the dashboard.
        </Typography>
      </Box>
    );
  }

  // Determine if we should use WebSocket-enabled version of the widget
  const shouldUseRealTimeWidget =
    isUsingRealTime && enableRealTimeUpdates !== false;

  // Render the appropriate widget based on type
  switch (widget.type) {
    case WidgetType.ALERTS_SUMMARY:
      // Use real-time version if WebSocket is connected
      return shouldUseRealTimeWidget ? (
        <AlertsSummaryWidgetWithRealTime widget={widget} />
      ) : (
        <AlertsSummaryWidget data={finalData} widget={widget} />
      );

    case WidgetType.SYSTEM_HEALTH:
      // Use real-time version if WebSocket is connected
      return shouldUseRealTimeWidget ? (
        <SystemHealthWidgetWithRealTime widget={widget} />
      ) : (
        <SystemHealthWidget data={finalData} widget={widget} />
      );

    case WidgetType.ACTIVITY_TIMELINE:
      return <ActivityTimelineWidget data={finalData} widget={widget} />;

    case WidgetType.LOGS_OVERVIEW:
      return <LogsOverviewWidget data={finalData} widget={widget} />;

    case WidgetType.COMPLIANCE_STATUS:
      return <ComplianceStatusWidget data={finalData} widget={widget} />;

    case WidgetType.QUICK_ACTIONS:
      return <QuickActionsWidget data={finalData} widget={widget} />;

    case WidgetType.THREAT_MAP:
      return <ThreatMapWidget data={finalData} widget={widget} />;

    case WidgetType.NETWORK_STATUS:
      // Use real-time version if WebSocket is connected
      return shouldUseRealTimeWidget ? (
        <NetworkStatusWidgetWithRealTime widget={widget} />
      ) : (
        <NetworkStatusWidget data={finalData} widget={widget} />
      );

    case WidgetType.CUSTOM_CHART:
      return <CustomChartWidget data={finalData} widget={widget} />;

    // New widget types
    case WidgetType.GDPR_COMPLIANCE:
      return <GDPRComplianceWidget data={finalData} widget={widget} />;

    case WidgetType.SECURITY_SCORE:
      return <SecurityScoreWidget data={finalData} widget={widget} />;

    case WidgetType.PLAYBOOK_STATUS:
      return <PlaybookStatusWidget data={finalData} widget={widget} />;

    case WidgetType.CLOUD_SECURITY:
      return <CloudSecurityWidget data={finalData} widget={widget} />;

    case WidgetType.THREAT_INTEL_SUMMARY:
      return <ThreatIntelSummaryWidget data={finalData} widget={widget} />;

    case WidgetType.RECENT_CASES:
      return <RecentCasesWidget data={finalData} widget={widget} />;

    default:
      return (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1">
            Unknown Widget Type: {widget.type}
          </Typography>
        </Box>
      );
  }
};

/**
 * Widget Skeleton Component
 * Renders a loading skeleton appropriate for each widget type
 */
const WidgetSkeleton: React.FC<{ type: WidgetType }> = ({ type }) => {
  switch (type) {
    case WidgetType.ACTIVITY_TIMELINE:
      return (
        <Box sx={{ p: 1 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="rectangular" height={24} sx={{ my: 1 }} />
          <Skeleton variant="rectangular" height={24} sx={{ my: 1 }} />
          <Skeleton variant="rectangular" height={24} sx={{ my: 1 }} />
          <Skeleton variant="rectangular" height={24} sx={{ my: 1 }} />
          <Skeleton variant="text" width="40%" height={24} />
        </Box>
      );

    case WidgetType.ALERTS_SUMMARY:
    case WidgetType.SYSTEM_HEALTH:
    case WidgetType.COMPLIANCE_STATUS:
    case WidgetType.GDPR_COMPLIANCE:
    case WidgetType.SECURITY_SCORE:
      return (
        <Box sx={{ p: 1 }}>
          <Box sx={{ display: "flex", mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ ml: 1, flexGrow: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>
          <Skeleton variant="rectangular" height={100} />
        </Box>
      );

    case WidgetType.THREAT_MAP:
    case WidgetType.NETWORK_STATUS:
    case WidgetType.CLOUD_SECURITY:
      return (
        <Box sx={{ p: 1 }}>
          <Skeleton variant="rectangular" height={180} />
        </Box>
      );

    case WidgetType.QUICK_ACTIONS:
      return (
        <Box sx={{ p: 1 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={30} />
            <Skeleton variant="rectangular" width={80} height={30} />
            <Skeleton variant="rectangular" width={80} height={30} />
            <Skeleton variant="rectangular" width={80} height={30} />
          </Box>
        </Box>
      );

    case WidgetType.PLAYBOOK_STATUS:
    case WidgetType.THREAT_INTEL_SUMMARY:
    case WidgetType.RECENT_CASES:
      return (
        <Box sx={{ p: 1 }}>
          <Skeleton variant="text" width="70%" height={28} />
          <Box sx={{ display: "flex", justifyContent: "space-between", my: 2 }}>
            <Skeleton variant="rectangular" width="32%" height={50} />
            <Skeleton variant="rectangular" width="32%" height={50} />
            <Skeleton variant="rectangular" width="32%" height={50} />
          </Box>
          <Skeleton variant="rectangular" height={100} />
        </Box>
      );

    default:
      return (
        <Box sx={{ p: 1 }}>
          <Skeleton variant="text" width="80%" height={40} />
          <Skeleton variant="rectangular" height={120} sx={{ my: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
        </Box>
      );
  }
};

export default WidgetFactory;
