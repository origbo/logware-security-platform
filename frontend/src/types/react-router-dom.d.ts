/**
 * Type declarations for react-router-dom v6
 * This file resolves TypeScript errors related to react-router-dom imports and usage
 */

declare module 'react-router-dom' {
  import * as React from 'react';
  import type { Location, NavigationType, To } from 'history';

  // Expanded type definitions for react-router-dom v6
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
  
  // Components
  export const BrowserRouter: React.ComponentType<{
    basename?: string;
    children?: React.ReactNode;
    window?: Window;
  }>;
  
  export const Routes: React.ComponentType<{
    children?: React.ReactNode;
    location?: Location;
  }>;
  
  export const Route: React.ComponentType<PathRouteProps | IndexRouteProps>;
  
  export const Router: React.ComponentType<{
    basename?: string;
    children?: React.ReactNode;
    location: Location;
    navigationType?: NavigationType;
    navigator: Navigator;
    static?: boolean;
  }>;
  
  export const Navigate: React.ComponentType<{
    to: To;
    replace?: boolean;
    state?: any;
  }>;
  
  export const Outlet: React.ComponentType<{ context?: unknown }>;
  
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    replace?: boolean;
    state?: any;
    to: To;
    reloadDocument?: boolean;
    preventScrollReset?: boolean;
    relative?: 'route' | 'path';
  }
  
  export const Link: React.ComponentType<LinkProps>;
  
  export interface NavLinkProps extends LinkProps {
    caseSensitive?: boolean;
    className?: string | ((props: { isActive: boolean }) => string);
    end?: boolean;
    style?: React.CSSProperties | ((props: { isActive: boolean }) => React.CSSProperties);
  }
  
  export const NavLink: React.ComponentType<NavLinkProps>;
  
  // Custom hooks
  export function useNavigate(): NavigateFunction;
  export function useLocation(): Location;
  export function useParams<Params extends Record<string, string | undefined> = {}>(): Params;
  export function useRoutes(routes: RouteObject[], location?: Location): React.ReactElement | null;
  export function useSearchParams(defaultInit?: URLSearchParams | Record<string, string | string[]>): [URLSearchParams, (nextInit: URLSearchParams | Record<string, string | string[]>) => void];
  export function useMatch<ParamKey extends string = string>(pattern: string): {
    params: Record<ParamKey, string>;
    pathname: string;
    pattern: {
      path: string;
      caseSensitive?: boolean;
      end?: boolean;
    };
  } | null;
  
  // Router functions
  export function createBrowserRouter(routes: RouteObject[], options?: {
    basename?: string;
    window?: Window;
  }): any;
  
  export function createRoutesFromElements(children: React.ReactNode): RouteObject[];
  export function createMemoryRouter(routes: RouteObject[], options?: any): any;
  export function createHashRouter(routes: RouteObject[], options?: any): any;
}
