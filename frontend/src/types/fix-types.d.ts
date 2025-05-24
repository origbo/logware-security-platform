/**
 * This file contains type fixes for the Logware Security Platform
 * It addresses specific TypeScript errors and module resolution issues
 */

// Fix JSX element types and React runtime
declare namespace JSX {
  interface Element extends React.ReactElement<any, any> {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Fix for common prop type issues
declare namespace React {
  interface PropsWithChildren {
    children?: React.ReactNode;
  }
  
  interface FunctionComponent<P = {}> {
    (props: P & { children?: React.ReactNode }): React.ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
  }
}

// Fix Redux Toolkit query errors
declare module '@reduxjs/toolkit/query/react' {
  export * from '@reduxjs/toolkit/dist/query/react';
}

// Utility Types to help with common TypeScript patterns
interface Dictionary<T> {
  [key: string]: T;
}

type Nullable<T> = T | null;
type Optional<T> = T | undefined;

// Fix ESM import issues with Material UI
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

// Fix common third-party module imports
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

// Fix for socket.io-client
declare module 'socket.io-client' {
  export * from 'socket.io-client';
  const io: any;
  export default io;
}
