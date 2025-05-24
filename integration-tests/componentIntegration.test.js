/**
 * Component Integration Tests
 * 
 * These tests verify that different components of the Logware Security Platform 
 * work together correctly.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';

// Import components to test
import { IntegrationManager } from '../frontend/src/integrations/IntegrationManager';
import { DocumentationSystem } from '../docs/DocumentationSystem';
import { TrainingSystem } from '../training/TrainingSystem';
import { TestRunner } from '../frontend/src/testing/TestRunner';

// Mock store setup
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

describe('Component Integration Tests', () => {
  let store;

  beforeEach(() => {
    // Initial state with user authentication and permissions
    store = mockStore({
      auth: {
        isAuthenticated: true,
        user: {
          id: 'user-1',
          role: 'administrator',
          permissions: ['manage_integrations', 'access_training', 'run_tests']
        }
      },
      integrations: {
        items: [
          { id: 'integration-1', name: 'SIEM Connector', status: 'connected' },
          { id: 'integration-2', name: 'Threat Intel', status: 'pending' }
        ],
        loading: false,
        error: null
      },
      training: {
        courses: [
          { id: 'course-1', title: 'Security Fundamentals', status: 'published' }
        ],
        userProgress: {
          'course-1': { completed: false, progress: 30 }
        }
      },
      documentation: {
        sections: [
          { id: 'section-1', title: 'Getting Started' },
          { id: 'section-2', title: 'Advanced Features' }
        ],
        currentSection: 'section-1'
      },
      testing: {
        tests: [
          { id: 'test-1', name: 'User Authentication', status: 'passed' },
          { id: 'test-2', name: 'API Integration', status: 'failed' }
        ],
        running: false
      }
    });
  });

  test('Integration Manager connects with Training System', async () => {
    // Render both components with shared store
    const { rerender } = render(
      <Provider store={store}>
        <MemoryRouter>
          <IntegrationManager />
        </MemoryRouter>
      </Provider>
    );

    // Check if Integration Manager renders correctly
    expect(screen.getByText('SIEM Connector')).toBeInTheDocument();
    
    // Test interaction that would trigger an integration-related action
    const connectButton = screen.getByText('Configure');
    fireEvent.click(connectButton);
    
    // Verify UI updates appropriately
    expect(screen.getByText('Configure Integration')).toBeInTheDocument();
    
    // Now render Training System which should use the same integration data
    rerender(
      <Provider store={store}>
        <MemoryRouter>
          <TrainingSystem />
        </MemoryRouter>
      </Provider>
    );
    
    // Training system should be able to access integration status
    await waitFor(() => {
      expect(screen.getByText('Logware Security Training')).toBeInTheDocument();
    });
  });

  test('Documentation System integrates with Training System', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div>
            <DocumentationSystem />
            <TrainingSystem />
          </div>
        </MemoryRouter>
      </Provider>
    );

    // Verify both components render and can interact
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    
    // Click on a documentation section that should affect training recommendations
    fireEvent.click(screen.getByText('Advanced Features'));
    
    // Verify that the training system updates accordingly
    await waitFor(() => {
      // In a real implementation, this would check for recommended courses based on documentation section
      expect(screen.getByText('Security Fundamentals')).toBeInTheDocument();
    });
  });

  test('Test Runner can verify Integration Manager functionality', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <div>
            <TestRunner />
            <IntegrationManager />
          </div>
        </MemoryRouter>
      </Provider>
    );

    // Find and run integration tests in the Test Runner
    const runTestsButton = screen.getByText('Run Selected Tests');
    fireEvent.click(runTestsButton);
    
    await waitFor(() => {
      // Verify Test Runner updates with results for integration tests
      expect(screen.getByText('API Integration')).toBeInTheDocument();
      expect(screen.getByText('failed')).toBeInTheDocument();
    });
    
    // Verify Integration Manager reflects test results
    expect(screen.getByText('Threat Intel')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});
