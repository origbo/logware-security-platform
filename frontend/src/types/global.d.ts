// Global type declarations for the Logware Security Platform
// This file helps TypeScript recognize necessary globals and modules

// React module augmentation
import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare global {
  // Make React available globally
  const React: typeof React;
  const ReactDOM: typeof ReactDOM;
  
  // Other global interfaces and types
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  }
}

// Augment existing modules
declare module 'react' {
  // Ensure namespace is recognized
  export = React;
  export as namespace React;
}

declare module 'react-dom' {
  export = ReactDOM;
  export as namespace ReactDOM;
}

// Override the problematic @types/react-router-dom package
// This completely replaces the type definitions with ones compatible with v6.x
declare module 'react-router-dom' {
  import * as React from 'react';
  
  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: any;
    key: string;
  }

  export interface NavigateOptions {
    replace?: boolean;
    state?: any;
    preventScrollReset?: boolean;
    relative?: 'route' | 'path';
  }

  export interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
    (delta: number): void;
  }

  export interface RouteObject {
    path?: string;
    index?: boolean;
    children?: RouteObject[];
    caseSensitive?: boolean;
    id?: string;
    element?: React.ReactNode;
    errorElement?: React.ReactNode;
    handle?: any;
    loader?: any;
    action?: any;
    shouldRevalidate?: any;
  }

  export interface PathRouteProps {
    caseSensitive?: boolean;
    children?: React.ReactNode;
    element?: React.ReactNode;
    errorElement?: React.ReactNode;
    index?: boolean;
    path?: string;
  }
  
  export interface IndexRouteProps {
    caseSensitive?: boolean;
    children?: never;
    element?: React.ReactNode;
    errorElement?: React.ReactNode;
    index: true;
    path?: string;
  }
  
  export type To = string | { pathname?: string; search?: string; hash?: string; state?: any };
  
  // Components
  export const BrowserRouter: React.ComponentType<any>;
  export const Routes: React.ComponentType<any>;
  export const Route: React.ComponentType<any>;
  export const Router: React.ComponentType<any>;
  export const Navigate: React.ComponentType<any>;
  export const Outlet: React.ComponentType<any>;
  export const Link: React.ComponentType<any>;
  export const NavLink: React.ComponentType<any>;
  
  // Hooks
  export function useNavigate(): NavigateFunction;
  export function useLocation(): Location;
  export function useParams<Params extends Record<string, string | undefined> = {}>(): Params;
  export function useRoutes(routes: RouteObject[], location?: any): React.ReactElement | null;
  export function useSearchParams(defaultInit?: any): [URLSearchParams, (nextInit: any) => void];
  export function useMatch(pattern: string): any | null;
  
  // Router functions
  export function createBrowserRouter(routes: RouteObject[], options?: any): any;
  export function createRoutesFromElements(children: React.ReactNode): RouteObject[];
  export function createMemoryRouter(routes: RouteObject[], options?: any): any;
  export function createHashRouter(routes: RouteObject[], options?: any): any;
  
  // Additional type exports
  export type NavigationType = 'POP' | 'PUSH' | 'REPLACE';
}

// Explicitly disable the @types/react-router-dom to avoid conflicts
declare module '@types/react-router-dom' {
  // Empty declaration to prevent conflicts
}

// Redux Toolkit internal module reference
declare module '@reduxjs/toolkit/dist/query/react' {
  export * from '@reduxjs/toolkit/query/react';
}

declare module '@reduxjs/toolkit/dist/*' {
  export * from '@reduxjs/toolkit';
}

// Add any other module declarations needed
