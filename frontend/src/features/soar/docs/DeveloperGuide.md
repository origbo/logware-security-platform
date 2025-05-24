# SOAR Module Developer Guide

## Overview

This guide outlines the architecture, API endpoints, and integration points for the SOAR (Security Orchestration, Automation, and Response) module. It is intended for developers who need to extend or integrate with the SOAR functionality.

## Architecture

The SOAR module follows a modular architecture with clear separation of concerns:

```
soar/
├── components/         # UI components
│   ├── automation/     # Automation-related components
│   ├── anomaly/        # Anomaly detection components
│   ├── hunting/        # Threat hunting components
│   ├── collaboration/  # Collaboration components
│   └── common/         # Shared components
├── containers/         # Redux-connected containers
├── services/           # API services with RTK Query
├── slices/             # Redux state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── config/             # Configuration settings
```

### Key Technologies

- **React** for UI components
- **Redux** with Redux Toolkit for state management
- **RTK Query** for API data fetching and caching
- **Material-UI** for component styling
- **TypeScript** for type safety

## State Management

### Redux Store Structure

The SOAR module state is organized as follows:

```typescript
interface SoarState {
  // UI State
  activeSoarTab: number;
  activeAutomationTab: number;
  activeAnomalyTab: number;
  activeCollaborationTab: number;
  
  // Filters and Search State
  incidentFilters: { /* filter properties */ };
  huntFilters: { /* filter properties */ };
  executionFilters: { /* filter properties */ };
  
  // Active Sessions
  activeCollaborationSession: string | null;
  activeIncidentId: string | null;
  
  // Cached Data
  cachedIncidents: Incident[];
  cachedHunts: ThreatHunt[];
  // ... other cached data
  
  // Loading and Error States
  isInitialized: boolean;
  isLoading: { /* loading indicators by feature */ };
  errors: { /* error messages by feature */ };
}
```

### Accessing State

To access SOAR state in your components:

```typescript
import { useSelector } from 'react-redux';
import { selectActiveSoarTab, selectCachedIncidents } from '../features/soar';

function MyComponent() {
  // Access specific pieces of state using selectors
  const activeTab = useSelector(selectActiveSoarTab);
  const incidents = useSelector(selectCachedIncidents);

  // Component implementation
}
```

### Dispatching Actions

To modify SOAR state:

```typescript
import { useDispatch } from 'react-redux';
import { setActiveSoarTab, updateCachedIncident } from '../features/soar';

function MyComponent() {
  const dispatch = useDispatch();

  // Change active tab
  const handleTabChange = (newTab: number) => {
    dispatch(setActiveSoarTab(newTab));
  };

  // Update an incident
  const handleIncidentUpdate = (incident: Incident) => {
    dispatch(updateCachedIncident(incident));
  };
}
```

## API Endpoints

The SOAR module uses RTK Query services to interact with backend APIs. The main services are:

- `soarApi`: For core SOAR functionality
- `anomalyApi`: For anomaly detection features

### Using API Hooks

```typescript
import { 
  useGetPlaybooksQuery, 
  useCreatePlaybookMutation, 
  useExecutePlaybookMutation 
} from '../features/soar';

function MyComponent() {
  // Query data
  const { data: playbooks, isLoading, error } = useGetPlaybooksQuery();
  
  // Mutation hooks
  const [createPlaybook, { isLoading: isCreating }] = useCreatePlaybookMutation();
  const [executePlaybook] = useExecutePlaybookMutation();
  
  // Example handlers
  const handleCreate = async (playbookData) => {
    try {
      const result = await createPlaybook(playbookData).unwrap();
      console.log('Created playbook:', result);
    } catch (error) {
      console.error('Failed to create playbook:', error);
    }
  };
  
  const handleExecute = (playbookId) => {
    executePlaybook({ id: playbookId });
  };
}
```

### Available API Endpoints

#### Playbooks

- `getPlaybooks`: Get all playbooks
- `getPlaybookById`: Get a specific playbook
- `createPlaybook`: Create a new playbook
- `updatePlaybook`: Update an existing playbook
- `deletePlaybook`: Delete a playbook
- `executePlaybook`: Execute a playbook

#### Automation Rules

- `getRules`: Get all automation rules
- `getRuleById`: Get a specific rule
- `createRule`: Create a new rule
- `updateRule`: Update an existing rule
- `deleteRule`: Delete a rule
- `toggleRuleStatus`: Enable/disable a rule
- `testRule`: Test a rule with sample data

#### Executions

- `getActiveExecutions`: Get currently running executions
- `getExecutionHistory`: Get historical executions
- `getExecutionById`: Get details of a specific execution
- `abortExecution`: Abort a running execution

#### Response Actions

- `getActions`: Get available response actions
- `getActionById`: Get a specific action
- `createAction`: Create a custom action
- `updateAction`: Update an action
- `deleteAction`: Delete a custom action
- `testAction`: Test an action with parameters

#### Threat Hunting

- `getHunts`: Get all threat hunts
- `getHuntById`: Get a specific hunt
- `createHunt`: Create a new hunt
- `updateHunt`: Update an existing hunt
- `executeHunt`: Run a threat hunt
- `getHuntResults`: Get hunt results

#### Collaboration

- `getCollaborationSessions`: Get active collaboration sessions
- `getSessionById`: Get a specific session
- `createSession`: Create a new session
- `updateSession`: Update session details
- `closeSession`: End a session
- `joinSession`: Join an active session
- `leaveSession`: Leave a session

## Extending the SOAR Module

### Adding a New Component

1. Create the component in the appropriate subdirectory
2. Connect to Redux state using selectors if needed
3. Use API hooks for data fetching
4. Export the component in the index.ts file

Example:

```typescript
// features/soar/components/custom/MyNewComponent.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectActiveIncidentId, useGetIncidentByIdQuery } from '../../features/soar';

const MyNewComponent: React.FC = () => {
  const activeIncidentId = useSelector(selectActiveIncidentId);
  const { data: incident, isLoading } = useGetIncidentByIdQuery(activeIncidentId, {
    skip: !activeIncidentId
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (!incident) return <div>No incident selected</div>;
  
  return (
    <div>
      <h2>{incident.title}</h2>
      {/* Component implementation */}
    </div>
  );
};

export default MyNewComponent;
```

### Adding a New API Endpoint

1. Extend the appropriate API service in the services directory
2. Add the endpoint definition with return type and parameters
3. Use the generated hook in your components

Example:

```typescript
// Extend soarApi with a new endpoint
const enhancedSoarApi = soarApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomMetrics: builder.query<CustomMetrics, string>({
      query: (timeframe) => `/metrics/custom?timeframe=${timeframe}`,
      providesTags: ['Metrics']
    }),
    updateMetricSettings: builder.mutation<void, MetricSettings>({
      query: (settings) => ({
        url: '/metrics/settings',
        method: 'PUT',
        body: settings
      }),
      invalidatesTags: ['Metrics']
    })
  })
});

export const { 
  useGetCustomMetricsQuery, 
  useUpdateMetricSettingsMutation 
} = enhancedSoarApi;
```

### Adding New State

1. Extend the appropriate slice in the slices directory
2. Add initial state, reducers, and selectors
3. Export the new actions and selectors

Example:

```typescript
// Add state to soarSlice.ts
interface SoarState {
  // Existing state
  customSettings: {
    theme: 'light' | 'dark' | 'system';
    refreshInterval: number;
    notifications: boolean;
  };
}

const initialState: SoarState = {
  // Existing initial state
  customSettings: {
    theme: 'system',
    refreshInterval: 60,
    notifications: true
  }
};

// Add reducers
const soarSlice = createSlice({
  name: 'soar',
  initialState,
  reducers: {
    // Existing reducers
    updateCustomSettings: (state, action: PayloadAction<Partial<SoarState['customSettings']>>) => {
      state.customSettings = { ...state.customSettings, ...action.payload };
    }
  }
});

// Export actions and selectors
export const { updateCustomSettings } = soarSlice.actions;
export const selectCustomSettings = (state: RootState) => state.soar.customSettings;
```

## Performance Considerations

- Use virtualization for large datasets (e.g., with the VirtualizedDataTable component)
- Implement pagination for API requests with large result sets
- Memoize expensive calculations with `useMemo` and `useCallback`
- Use the `skip` option in RTK Query hooks to prevent unnecessary requests
- Consider code-splitting for large components

## Error Handling

The SOAR module includes a standardized error handling approach:

- API errors are captured in the Redux state
- Use the FeedbackSnackbar component for consistent error presentation
- Check error states before rendering components:

```typescript
const { data, isLoading, error } = useGetPlaybooksQuery();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

## Testing

The SOAR module includes testing utilities to facilitate component and integration testing:

- Use `renderWithProviders` from `testUtils.ts` for testing components with Redux
- Use mock data creators (`createTestPlaybook`, etc.) for consistent test data
- Verify Redux state with `verifyReduxState` helper

Example:

```typescript
import { renderWithProviders, createTestPlaybook, verifyReduxState } from '../utils/testUtils';
import { selectPlaybooks } from '../slices/soarSlice';
import PlaybookList from './PlaybookList';

test('renders playbook list correctly', () => {
  const mockPlaybooks = [createTestPlaybook(), createTestPlaybook({ id: 'test-2', name: 'Test 2' })];
  
  const { getByText, store } = renderWithProviders(<PlaybookList />, {
    preloadedState: {
      soar: {
        playbooks: {
          data: {
            'test-playbook-1': mockPlaybooks[0],
            'test-2': mockPlaybooks[1]
          }
        }
      }
    }
  });
  
  // Verify component rendering
  expect(getByText('Test Playbook')).toBeInTheDocument();
  expect(getByText('Test 2')).toBeInTheDocument();
  
  // Verify state
  verifyReduxState(store, selectPlaybooks, {
    'test-playbook-1': mockPlaybooks[0],
    'test-2': mockPlaybooks[1]
  });
});
```

## Configuration

The SOAR module uses a centralized configuration approach in the `config` directory:

- `apiConfig.ts`: API endpoints and request configuration
- Environment-specific settings using environment variables

To customize API endpoints, modify the appropriate configuration object:

```typescript
import { SOAR_API_ENDPOINTS } from '../features/soar/config/apiConfig';

// Override endpoint for development
SOAR_API_ENDPOINTS.PLAYBOOKS = 'http://localhost:3001/api/custom-playbooks';
```

## Troubleshooting

### Common Development Issues

1. **"Cannot find module" errors**:
   - Check import paths
   - Ensure the file exists in the specified location
   - Verify exports from index files

2. **Type errors**:
   - Check that types are correctly defined in the types directory
   - Ensure you're using the correct interfaces for parameters
   - Verify that API responses match expected types

3. **Redux state not updating**:
   - Confirm that actions are being dispatched correctly
   - Check that reducers properly handle the action
   - Verify that component is connected to Redux with useSelector

4. **API requests failing**:
   - Check network tab in browser dev tools
   - Verify endpoint URLs in apiConfig.ts
   - Ensure authentication tokens are being included

For further assistance, contact the SOAR module maintainers.
