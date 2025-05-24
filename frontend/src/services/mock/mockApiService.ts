import { WidgetType } from "../dashboard/dashboardService";
import { getMockDataForWidget } from "./dashboardMockData";

/**
 * Mock API service for dashboard widgets
 * Simulates API calls with delayed responses using mock data
 */
class MockApiService {
  /**
   * Get widget data based on widget type
   * @param widgetType The type of widget to get data for
   * @returns Promise resolving to the mock data for the widget
   */
  async getWidgetData(widgetType: WidgetType): Promise<any> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get the mock data for the widget type
    const data = getMockDataForWidget(widgetType);

    // Simulate 5% chance of error for realistic error handling testing
    if (Math.random() < 0.05) {
      throw new Error("Simulated API error");
    }

    return data;
  }
}

// Export a singleton instance of the mock API service
export const mockApiService = new MockApiService();
