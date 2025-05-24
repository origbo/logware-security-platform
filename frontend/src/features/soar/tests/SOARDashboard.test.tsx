import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { rest, setupServer } from "../../../mocks/msw-mock";
import {
  renderWithProviders,
  createTestPlaybook,
  createTestRule,
  createTestExecution,
} from "../utils/testUtils";
import SOARDashboardContainer from "../containers/SOARDashboardContainer";
import { SOAR_API_ENDPOINTS } from "../config/apiConfig";

// Mock server setup to intercept API requests
const server = setupServer(
  // Mock playbooks endpoint
  rest.get(`${SOAR_API_ENDPOINTS.BASE}`, (req: any, res: any, ctx: any) => {
    return res(
      ctx.json([
        createTestPlaybook(),
        createTestPlaybook({
          id: "playbook-2",
          name: "Phishing Response",
          description: "Handle phishing attempts",
        }),
      ])
    );
  }),

  // Mock rules endpoint
  rest.get(`${SOAR_API_ENDPOINTS.RULES}`, (req: any, res: any, ctx: any) => {
    return res(
      ctx.json([
        createTestRule(),
        createTestRule({
          id: "rule-2",
          name: "Suspicious Login Alert",
          isEnabled: true,
        }),
      ])
    );
  }),

  // Mock active executions endpoint
  rest.get(
    `${SOAR_API_ENDPOINTS.EXECUTIONS}`,
    (req: any, res: any, ctx: any) => {
      return res(
        ctx.json([
          createTestExecution({
            id: "exec-1",
            name: "Malware Containment",
            status: "running",
          }),
        ])
      );
    }
  )

  // Add more mock endpoints as needed
);

// Setup MSW before tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("SOAR Dashboard Integration Tests", () => {
  test("renders dashboard overview with active incident count", async () => {
    renderWithProviders(<SOARDashboardContainer />);

    // Check that the dashboard loads successfully
    expect(screen.getByText(/SOAR Platform/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Security Metrics/i)).toBeInTheDocument();
    });
  });

  test("switches between tabs correctly", async () => {
    renderWithProviders(<SOARDashboardContainer />);

    // Dashboard should be the default tab
    expect(screen.getByText(/SOAR Platform/i)).toBeInTheDocument();

    // Click on Automation tab
    fireEvent.click(screen.getByText(/Automation/i));

    // Should show Automation content
    await waitFor(() => {
      expect(screen.getByText(/Security Automation/i)).toBeInTheDocument();
    });

    // Click on Anomaly Detection tab
    fireEvent.click(screen.getByText(/Anomaly Detection/i));

    // Should show Anomaly Detection content
    await waitFor(() => {
      expect(screen.getByText(/Anomaly Detection/i)).toBeInTheDocument();
    });
  });

  test("automation tab shows correct content and handles subtabs", async () => {
    renderWithProviders(<SOARDashboardContainer />);

    // Navigate to Automation tab
    fireEvent.click(screen.getByText(/Automation/i));

    // Wait for tab content to load
    await waitFor(() => {
      expect(screen.getByText(/Security Automation/i)).toBeInTheDocument();
    });

    // Check initial subtab (Rules Manager)
    expect(screen.getByText(/Rules Manager/i)).toBeInTheDocument();

    // Click on Playbook Orchestrator subtab
    fireEvent.click(screen.getByText(/Playbook Orchestrator/i));

    // Should show Playbook content
    await waitFor(() => {
      expect(screen.getByText(/Playbook Orchestrator/i)).toBeInTheDocument();
    });
  });

  test("handles API errors correctly", async () => {
    // Override default handlers to simulate an error
    server.use(
      rest.get(`${SOAR_API_ENDPOINTS.BASE}`, (req: any, res: any, ctx: any) => {
        return res(
          ctx.status(500),
          ctx.json({ message: "Internal server error" })
        );
      })
    );

    renderWithProviders(<SOARDashboardContainer />);

    // Navigate to Automation tab
    fireEvent.click(screen.getByText(/Automation/i));

    // Click on Playbook Orchestrator subtab
    fireEvent.click(screen.getByText(/Playbook Orchestrator/i));

    // Should show error state
    await waitFor(() => {
      expect(screen.getByText(/Error loading playbooks/i)).toBeInTheDocument();
    });
  });

  test("executions dashboard shows active executions", async () => {
    renderWithProviders(<SOARDashboardContainer />);

    // Navigate to Automation tab
    fireEvent.click(screen.getByText(/Automation/i));

    // Click on Execution Dashboard subtab
    fireEvent.click(screen.getByText(/Execution Dashboard/i));

    // Should show active executions
    await waitFor(() => {
      expect(screen.getByText(/Malware Containment/i)).toBeInTheDocument();
      expect(screen.getByText(/running/i)).toBeInTheDocument();
    });
  });
});
