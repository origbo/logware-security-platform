import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import dashboardWebSocketService, {
  WidgetUpdateMessage,
} from "../../services/websocket/dashboardWebSocketService";
import { WidgetType } from "../../services/dashboard/dashboardService";
import { Subscription } from "rxjs";

/**
 * Hook for consuming real-time widget data updates from WebSocket connection
 *
 * @param widgetId - The ID of the widget to subscribe to
 * @param widgetType - The type of the widget
 * @param initialData - Optional initial data for the widget before real-time updates
 * @returns Object with realTimeData and isConnected status
 */
const useWidgetRealTimeData = <T>(
  widgetId: string,
  widgetType: WidgetType,
  initialData?: T
) => {
  // Get auth token from Redux store
  const token = useSelector((state: RootState) => state.auth.token);

  // State for real-time data and connection status
  const [realTimeData, setRealTimeData] = useState<T | undefined>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Subscription | null = null;

    // Function to initialize WebSocket connection
    const initializeWebSocket = () => {
      if (!token) {
        setError("Authentication token not available");
        return;
      }

      try {
        // Connect to WebSocket server
        dashboardWebSocketService.connect(token);

        // Subscribe to widget updates
        dashboardWebSocketService.subscribeToWidget(widgetId, widgetType);

        // Set up subscription to widget update events
        subscription = dashboardWebSocketService.getWidgetUpdates().subscribe({
          next: (message: WidgetUpdateMessage) => {
            // Only update state if the message is for this widget
            if (message.widgetId === widgetId) {
              setRealTimeData(message.data as T);
              setIsConnected(true);
              setError(null);
            }
          },
          error: (err) => {
            console.error("WebSocket subscription error:", err);
            setError("Error in WebSocket connection");
            setIsConnected(false);
          },
        });

        setIsConnected(true);
      } catch (err) {
        console.error("Failed to initialize WebSocket:", err);
        setError("Failed to connect to WebSocket server");
        setIsConnected(false);
      }
    };

    // Initialize WebSocket connection
    initializeWebSocket();

    // Clean up subscription when component unmounts
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      // Unsubscribe from this widget's updates
      dashboardWebSocketService.unsubscribeFromWidget(widgetId);
    };
  }, [token, widgetId, widgetType]);

  return { realTimeData, isConnected, error };
};

export default useWidgetRealTimeData;
