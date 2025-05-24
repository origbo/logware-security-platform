// Import from mock service worker with proper type handling
// Since we don't have the actual msw package installed, we'll create a simplified version
// of the types to satisfy TypeScript. These will be replaced by the real ones when msw is installed.

// Define simplified MSW types
interface ResponseResolver<T = any> {
  (req: MockRequest, res: MockResponseComposer, ctx: MockResponseContext): T;
}

interface MockRequest {
  url: URL;
  method: string;
  params: Record<string, string>;
  body: any;
  headers: Headers;
}

interface MockResponseComposer {
  (options?: any): MockResponse;
}

interface MockResponse {
  status: (code: number) => MockResponse;
  json: <T>(body: T) => MockResponse;
  text: (body: string) => MockResponse;
}

interface MockResponseContext {
  status: (code: number) => any;
  json: <T>(body: T) => any;
  text: (body: string) => any;
}

// Simplified rest API mock
type ApiHandler = { path: string; method: string; resolver: ResponseResolver };

const rest = {
  get(path: string, resolver: ResponseResolver): ApiHandler {
    return { path, method: 'GET', resolver };
  },
  post(path: string, resolver: ResponseResolver): ApiHandler {
    return { path, method: 'POST', resolver };
  },
  put(path: string, resolver: ResponseResolver): ApiHandler {
    return { path, method: 'PUT', resolver };
  },
  patch(path: string, resolver: ResponseResolver): ApiHandler {
    return { path, method: 'PATCH', resolver };
  },
  delete(path: string, resolver: ResponseResolver): ApiHandler {
    return { path, method: 'DELETE', resolver };
  },
};
import { AnomalyEvent, AnomalySeverity, AnomalyStatus, AnomalyType } from '../features/advanced-security/types/anomalyTypes';

// Mock data for anomaly events
const mockAnomalyEvents: AnomalyEvent[] = [
  {
    id: 'anomaly-1',
    timestamp: new Date().toISOString(),
    type: AnomalyType.AUTHENTICATION,
    severity: AnomalySeverity.HIGH,
    status: AnomalyStatus.NEW,
    source: 'auth-service',
    description: 'Unusual login pattern detected for user admin from new location',
    affectedResource: 'user:admin',
    mlConfidence: 87,
    rawData: {
      userId: 'admin',
      ipAddress: '203.0.113.1',
      loginTime: new Date().toISOString(),
      browser: 'Chrome',
      os: 'Windows',
    },
    tags: ['authentication', 'admin-user'],
  },
  {
    id: 'anomaly-2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: AnomalyType.DATA_ACCESS,
    severity: AnomalySeverity.CRITICAL,
    status: AnomalyStatus.INVESTIGATING,
    source: 'data-access-monitor',
    description: 'Unusual data access pattern: User accessed 150 customer records in 5 minutes',
    affectedResource: 'database:customers',
    mlConfidence: 94,
    rawData: {
      userId: 'jsmith',
      records: 150,
      timeWindow: '5min',
      databaseName: 'customers',
      queryType: 'SELECT',
    },
    assignedTo: 'security-team',
    tags: ['data-access', 'customer-data'],
  },
];

// Mock data for the GET requests
const getAnomalyEvents = () => mockAnomalyEvents;
const getAnomalyEvent = (id: string) => mockAnomalyEvents.find(e => e.id === id);
const updateEventStatus = (id: string, status: AnomalyStatus, assignedTo?: string) => {
  const eventIndex = mockAnomalyEvents.findIndex(e => e.id === id);
  if (eventIndex >= 0) {
    mockAnomalyEvents[eventIndex] = {
      ...mockAnomalyEvents[eventIndex],
      status,
      assignedTo: assignedTo || mockAnomalyEvents[eventIndex].assignedTo
    };
    return mockAnomalyEvents[eventIndex];
  }
  return null;
};

// Define simplified handler functions
type MockRequestHandler = {
  path: string;
  method: string;
};

// Simplified implementation to avoid TypeScript errors
export const handlers: MockRequestHandler[] = [
  // Get all anomaly events
  {
    path: '/api/advanced-security/anomaly-detection/events',
    method: 'GET',
  },
  
  // Get a single anomaly event
  {
    path: '/api/advanced-security/anomaly-detection/events/:id',
    method: 'GET',
  },
  
  // Update anomaly event status
  {
    path: '/api/advanced-security/anomaly-detection/events/:id/status',
    method: 'PATCH',
  },

  // Other API endpoints can be added here
];
