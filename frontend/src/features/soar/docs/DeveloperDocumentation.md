# SOAR Module Developer Documentation

## Overview

The Security Orchestration, Automation, and Response (SOAR) module provides a comprehensive solution for security operations, including:

- Automation of security playbooks and response actions
- Anomaly detection with ML-based behavioral analytics
- Incident response and case management
- Threat hunting capabilities
- Collaborative incident response

This documentation is intended for developers who are maintaining or extending the SOAR module.

## Architecture

The SOAR module follows a modular architecture with the following components:

### Core Components

1. **Dashboard**: The main entry point for SOAR activities (`SOARDashboard.tsx`)
2. **Automation Components**:
   - Automation Rules Manager (`AutomationRulesManager.tsx`)
   - Playbook Orchestrator (`PlaybookOrchestrator.tsx`)
   - Response Actions Library (`ResponseActionsLibrary.tsx`)
   - Automation Execution Dashboard (`AutomationExecutionDashboard.tsx`)
3. **Anomaly Detection Components**:
   - User Behavior Analytics (`UserBehaviorAnalytics.tsx`)
   - Network Traffic Analysis (`NetworkTrafficAnalysis.tsx`)
   - Explainable AI (`ExplainableAI.tsx`)
4. **Collaboration Components**: 
   - Collaborative Response Hub (`CollaborativeResponseHub.tsx`)
5. **Threat Hunting Dashboard**: 
   - Threat Hunting Components (`ThreatHuntingDashboard.tsx`)

### State Management

The SOAR module uses Redux for state management with the following structure:

```
State
├── soar (soarSlice.ts)
│   ├── UI State (active tabs, filters)
│   ├── Data Cache (incidents, hunts, etc.)
│   └── Loading/Error States
└── API Services
    ├── soarApi (soarService.ts)
    └── anomalyApi (anomalyService.ts)
```

## Data Flow

1. Components use RTK Query hooks from `soarService.ts` and `anomalyService.ts` to fetch data
2. The custom `useSOARData` hook optimizes data fetching, caching, and error handling
3. Data is displayed through the UI components, often using the virtualized data components for performance

## Key Files

### Core Configuration

- `apiConfig.ts`: Environment-specific API configurations
- `soarTypes.ts`: TypeScript interfaces and types for SOAR components
- `anomalyTypes.ts`: Types for anomaly detection features

### State Management

- `soarSlice.ts`: Redux slice for SOAR state
- `soarService.ts`: RTK Query service for SOAR API endpoints
- `anomalyService.ts`: RTK Query service for Anomaly Detection API endpoints

### Utilities

- `errorHandler.ts`: Centralized error handling
- `testUtils.tsx`: Testing utilities
- `useSOARData.ts`: Custom hook for optimized data fetching

### UI Components

- Common components are in `components/common/`
- Feature-specific components are in their respective folders

## Adding New Features

### Adding a New Component

1. Create a new component in the appropriate feature folder
2. Use the `useSOARData` hook for data fetching
3. Implement error handling with `errorHandler.ts`
4. For large datasets, use `VirtualizedDataGrid` or `VirtualizedDataTable`
5. Add the component to the appropriate container or route

### Adding a New API Endpoint

1. Add the endpoint to the appropriate API service (`soarService.ts` or `anomalyService.ts`)
2. Create any necessary TypeScript interfaces in the types files
3. Optionally add Redux state in `soarSlice.ts` if the data needs to be globally available

### Adding a New Route

1. Define the route in `soarRoutes.tsx`
2. Ensure the component has proper authentication with `ProtectedRoute`

## Performance Optimization

The SOAR module includes several performance optimizations:

1. **Virtualized Components**: `VirtualizedDataTable` and `VirtualizedDataGrid` render only visible rows/cells
2. **Optimized Data Fetching**: `useSOARData` hook provides caching, debounced refreshing, and error handling
3. **Selective Re-rendering**: Components use React.memo and dependency arrays to prevent unnecessary rerenders
4. **Code Splitting**: Lazy loading of routes and components

## Testing

### Component Testing

Use `@testing-library/react` to test components. The `testUtils.tsx` file provides utilities for testing components with Redux and Router providers.

Example:

```tsx
import { renderWithProviders } from '../utils/testUtils';
import MyComponent from './MyComponent';

test('renders correctly', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText('Expected Text')).toBeInTheDocument();
});
```

### Integration Testing

Integration tests are in the `tests` directory and test the interaction between components and data flow.

Example: `SOARDashboard.test.tsx`

### Mock Data

Mock data helpers are available in `testUtils.tsx`:

- `createTestPlaybook()`
- `createTestRule()`
- `createTestExecution()`

## Error Handling

The error handling system in `errorHandler.ts` provides consistent error management:

1. `processError()`: Categorizes and formats errors
2. `createErrorNotification()`: Creates user-friendly notifications
3. `logError()`: Logs errors appropriately based on environment
4. `handleError()`: Comprehensive error handling in one call

## Best Practices

1. **TypeScript**: Use strong typing for all components and functions
2. **Component Structure**: Use container/presentational pattern where appropriate
3. **Error Handling**: Always handle potential errors using the error utilities
4. **Performance**: Use virtualization for lists with more than 100 items
5. **Testing**: Write tests for all new components and features
6. **Documentation**: Document complex logic with JSDoc comments

## Troubleshooting

### Common Issues

1. **API Connection Issues**: Check `apiConfig.ts` for correct API endpoints
2. **Type Errors**: Ensure types match between frontend and API responses
3. **Performance Problems**: Check for unnecessary renders or unoptimized data fetching
4. **Missing Dependencies**: Verify all packages are installed and compatible

### Debugging Tools

1. Redux DevTools for state inspection
2. React Developer Tools for component debugging
3. Network tab in browser devtools for API requests

## API Documentation

See the `API.md` file for detailed API endpoint documentation.
