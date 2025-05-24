// This file adds proper TypeScript declarations for React and other libraries
// to ensure they're recognized throughout the codebase

declare module 'react' {
  // Re-export everything from React
  export * from 'react';
  
  // Explicitly declare React hooks and other commonly used exports
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const useCallback: any;
  export const useMemo: any;
  export const useContext: any;
  export const useReducer: any;
  export const useLayoutEffect: any;
  export const useImperativeHandle: any;
  export const useDebugValue: any;
  export const useId: any;
  
  // React Components
  export const Fragment: any;
  export const Component: any;
  export const PureComponent: any;
  export const StrictMode: any;
  export const Suspense: any;
  export const Profiler: any;
  export const Children: any;
  
  // React functions
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export function cloneElement(element: any, props?: any, ...children: any[]): any;
  export function createContext<T>(defaultValue: T): any;
  export function memo<T>(component: T): T;
  export function forwardRef<T, P>(render: (props: P, ref: any) => any): any;
  export function isValidElement(object: any): boolean;
  
  // React types
  export type FC<P = {}> = any;
  export type FunctionComponent<P = {}> = FC<P>;
  export type ReactNode = any;
  export type ReactElement = any;
  export type CSSProperties = any;
  export type RefObject<T> = any;
  export type Ref<T> = any;
  export type RefCallback<T> = any;
  export type MouseEvent<T = Element> = any;
  export type KeyboardEvent<T = Element> = any;
  export type TouchEvent<T = Element> = any;
  export type ChangeEvent<T = Element> = any;
  export type FormEvent<T = Element> = any;
  export type FocusEvent<T = Element> = any;
  export type DragEvent<T = Element> = any;
  export type SyntheticEvent<T = Element, E = Event> = any;
  export type HTMLAttributes<T> = any;
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };
  
  // Make sure namespace React is recognized
  export as namespace React;
}

// Fix for @reduxjs/toolkit internal imports
declare module '@reduxjs/toolkit/dist/query/react' {
  export * from '@reduxjs/toolkit/query/react';
}

declare module '@reduxjs/toolkit/dist/*' {
  export * from '@reduxjs/toolkit';
}
