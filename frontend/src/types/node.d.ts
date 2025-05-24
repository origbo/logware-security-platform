/**
 * Node.js type declarations for browser environment
 */

interface Process {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  };
}

declare var process: Process;
