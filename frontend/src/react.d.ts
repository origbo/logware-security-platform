// Global React type declarations
// This should help TypeScript recognize React hooks and components

interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
  type: T;
  props: P;
  key: Key | null;
}

interface ReactNode {
  children?: ReactNode;
}

type Key = string | number;
type JSXElementConstructor<P> = (props: P) => ReactElement<P, any> | null;

declare namespace React {
  // React hooks
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useContext<T>(context: React.Context<T>): T;
  export function useReducer<R extends React.Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I & React.ReducerState<R>,
    initializer?: (arg: I & React.ReducerState<R>) => React.ReducerState<R>
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;
  export function useRef<T = any>(initialValue: T): { current: T };
  export function useImperativeHandle<T, R extends T>(ref: React.Ref<T> | undefined, init: () => R, deps?: ReadonlyArray<any>): void;
  export function useLayoutEffect(effect: React.EffectCallback, deps?: ReadonlyArray<any>): void;
  export function useDebugValue<T>(value: T, format?: (value: T) => any): void;
  export function useId(): string;

  // React components
  export const Fragment: React.FC;
  export const StrictMode: React.FC;
  export const Suspense: React.FC<{ fallback?: React.ReactNode }>;
  export const Profiler: React.FC<{ id: string; onRender: ProfilerOnRenderCallback }>;
  export class Component<P = {}, S = {}> {}
  export class PureComponent<P = {}, S = {}> {}

  // React functions
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export function cloneElement(element: any, props?: any, ...children: any[]): any;
  export function createContext<T>(defaultValue: T): React.Context<T>;
  export function memo<P extends object>(Component: React.FunctionComponent<P>): React.FunctionComponent<P>;
  export function forwardRef<T, P = {}>(render: React.ForwardRefRenderFunction<T, P>): React.ForwardRefExoticComponent<React.PropsWithoutRef<P> & React.RefAttributes<T>>;
  export function isValidElement(object: any): boolean;
  export const Children: {
    map<T, C>(children: C | C[], fn: (child: C, index: number) => T): T[];
    forEach<C>(children: C | C[], fn: (child: C, index: number) => void): void;
    count(children: any): number;
    only<C>(children: C): C;
    toArray<C>(children: C | C[]): C[];
  };

  // React types
  export type FC<P = {}> = FunctionComponent<P>;
  export interface FunctionComponent<P = {}> {
    (props: P & { children?: ReactNode }): ReactElement<any, any> | null;
  }
  export type ReactNode = ReactElement | string | number | boolean | null | undefined;
  export type ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> = {
    type: T;
    props: P;
    key: Key | null;
  };
  export type CSSProperties = any;
  export type RefObject<T> = { readonly current: T | null };
  export type Ref<T> = RefCallback<T> | RefObject<T> | null;
  export type RefCallback<T> = (instance: T | null) => void;
  export type MouseEvent<T = Element> = any;
  export type KeyboardEvent<T = Element> = any;
  export type TouchEvent<T = Element> = any;
  export type ChangeEvent<T = Element> = any;
  export type FormEvent<T = Element> = any;
  export type FocusEvent<T = Element> = any;
  export type DragEvent<T = Element> = any;
  export type SyntheticEvent<T = Element, E = Event> = any;
  export type HTMLAttributes<T> = any;
  export type Context<T> = any;
  export type EffectCallback = () => (void | (() => void));
  export type Dispatch<A> = (value: A) => void;
  export type Reducer<S, A> = (prevState: S, action: A) => S;
  export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
  export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
  export type ForwardRefRenderFunction<T, P = {}> = (props: P, ref: React.Ref<T>) => React.ReactElement | null;
  export interface ForwardRefExoticComponent<P> extends React.FunctionComponent<P> {
    readonly $$typeof: symbol;
  }
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };
  export type PropsWithoutRef<P> = P;
  export interface RefAttributes<T> {
    ref?: Ref<T>;
  }
  
  export type ProfilerOnRenderCallback = (
    id: string,
    phase: "mount" | "update",
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number,
    interactions: Set<any>
  ) => void;
}

declare module 'react' {
  export = React;
  export as namespace React;
}

// Fix for reduxjs/toolkit
declare module '@reduxjs/toolkit/dist/query/react' {
  export * from '@reduxjs/toolkit/query/react';
}

declare module '@reduxjs/toolkit/dist/*' {
  export * from '@reduxjs/toolkit';
}
