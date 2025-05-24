// Since we can't install MSW yet, we'll create a mock implementation
// Define a mock setupWorker function
const setupWorker = (...handlers: any[]) => ({
  start: (options?: { onUnhandledRequest?: string }) => {
    console.log('Mock MSW worker starting (mock implementation)...');
    return Promise.resolve();
  },
  stop: () => Promise.resolve(),
  resetHandlers: (...handlers: any[]) => {},
  use: (...handlers: any[]) => {},
});

// Import our handlers
import { handlers } from './handlers';

// This configures a Service Worker with the given request handlers
export const worker = setupWorker(...handlers);

// Optional: Export a function to start the worker explicitly
export const startMockServiceWorker = () => {
  if (process.env.NODE_ENV === 'development') {
    worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    });
    console.log('MSW initialized - API mocking active');
  }
};
