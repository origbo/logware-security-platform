/**
 * Type declarations for the history package used by react-router-dom v6
 */

declare module 'history' {
  export type Action = 'POP' | 'PUSH' | 'REPLACE';
  export type To = string | Partial<Path>;
  export type NavigationType = 'POP' | 'PUSH' | 'REPLACE';

  export interface Path {
    pathname: string;
    search: string;
    hash: string;
  }

  export interface Location extends Path {
    state: unknown;
    key: string;
  }

  export interface Update {
    action: Action;
    location: Location;
  }

  export interface Listener {
    (update: Update): void;
  }

  export interface Transition extends Update {
    retry(): void;
  }

  export interface Navigator {
    length: number;
    go(delta: number): void;
    push(to: To, state?: any): void;
    replace(to: To, state?: any): void;
  }

  export interface MemoryHistoryOptions {
    initialEntries?: string[];
    initialIndex?: number;
  }

  export interface BrowserHistoryOptions {
    window?: Window;
  }

  export interface HashHistoryOptions {
    window?: Window;
  }

  export interface History {
    readonly action: Action;
    readonly location: Location;
    createHref(to: To): string;
    push(to: To, state?: any): void;
    replace(to: To, state?: any): void;
    go(delta: number): void;
    back(): void;
    forward(): void;
    listen(listener: Listener): () => void;
    block(blocker: (tx: Transition) => void): () => void;
  }

  export function createBrowserHistory(options?: BrowserHistoryOptions): History;
  export function createHashHistory(options?: HashHistoryOptions): History;
  export function createMemoryHistory(options?: MemoryHistoryOptions): History;
  export function createPath(path: Partial<Path>): string;
  export function parsePath(path: string): Partial<Path>;
}
