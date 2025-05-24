/**
 * Type declarations for react-router-dom v6
 * These declarations are specifically designed to override the conflicting
 * @types/react-router-dom package (v5.3) when used with react-router-dom v6.6.0
 */

declare module "react-router-dom" {
  import * as React from "react";

  // Define core types
  export interface Location {
    pathname: string;
    search: string;
    hash: string;
    state: unknown;
    key: string;
  }

  export interface NavigateOptions {
    replace?: boolean;
    state?: unknown;
    preventScrollReset?: boolean;
    relative?: "route" | "path";
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
    handle?: unknown;
    loader?: unknown;
    action?: unknown;
    shouldRevalidate?: unknown;
  }

  export type To = string | { 
    pathname?: string; 
    search?: string; 
    hash?: string; 
    state?: unknown 
  };

  // Component types
  export interface BrowserRouterProps {
    basename?: string;
    children?: React.ReactNode;
  }

  export interface RoutesProps {
    children?: React.ReactNode;
    location?: Partial<Location>;
  }

  export interface RouteProps extends IndexRouteProps, PathRouteProps {}

  export interface IndexRouteProps {
    caseSensitive?: boolean;
    element?: React.ReactNode;
    index: true;
    path?: string;
  }

  export interface PathRouteProps {
    caseSensitive?: boolean;
    children?: React.ReactNode;
    element?: React.ReactNode;
    index?: false;
    path: string;
  }

  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    to: To;
    replace?: boolean;
    state?: unknown;
  }

  export const Route: React.ComponentType<RouteProps>;
  export const Navigate: React.ComponentType<{ 
    to: To; 
    replace?: boolean; 
    state?: unknown; 
  }>;
  export const Outlet: React.ComponentType<{ context?: unknown }>;
  export const Link: React.ComponentType<{
    to: To;
    replace?: boolean;
    state?: unknown;
    relative?: string;
    reloadDocument?: boolean;
    preventScrollReset?: boolean;
    onClick?: React.MouseEventHandler;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    [prop: string]: unknown;
  }>;
  export const NavLink: React.ComponentType<{
    to: To;
    end?: boolean;
    className?: string | ((props: { isActive: boolean }) => string);
    style?: React.CSSProperties | ((props: { isActive: boolean }) => React.CSSProperties);
    children?: React.ReactNode | ((props: { isActive: boolean }) => React.ReactNode);
    caseSensitive?: boolean;
    [prop: string]: unknown;
  }>;

  // Hooks
  export function useNavigate(): NavigateFunction;
  export function useLocation(): Location;
  export function useParams<T extends Record<string, string | undefined>>(): T;
  export function useMatch(pattern: string | PatternMatch): PathMatch<string> | null;
  export function useRoutes(routes: RouteObject[], basename?: string): React.ReactElement | null;
  export function useSearchParams(defaultInit?: URLSearchParamsInit): [URLSearchParams, SetURLSearchParams];
  export function useOutletContext<Context = unknown>(): Context;
  export function useInRouterContext(): boolean;
  export function useHref(to: To): string;
  export function useResolvedPath(to: To): Path;

  // Functions
  export function createBrowserRouter(routes: RouteObject[], options?: BrowserRouterOptions): Router;
  export function createRoutesFromElements(children: React.ReactNode): RouteObject[];
  export function generatePath(path: string, params?: Record<string, string | null | undefined>): string;
  export function matchPath<ParamKey extends string = string>(pattern: PathPattern | string, pathname: string): PathMatch<ParamKey> | null;
  export function matchRoutes(routes: RouteObject[], location: Partial<Location> | string, basename?: string): (RouteMatch[] | null);

  // Types
  export type RouteProps = PathRouteProps | IndexRouteProps;

  export interface PathRouteProps {
    caseSensitive?: boolean;
    children?: React.ReactNode;
    element?: React.ReactNode | null;
    index?: false;
    path: string;
  }

  export interface IndexRouteProps {
    caseSensitive?: boolean;
    element?: React.ReactNode | null;
    index: true;
    path?: string;
  }

  export interface RouteObject {
    caseSensitive?: boolean;
    children?: RouteObject[];
    element?: React.ReactNode | null;
    errorElement?: React.ReactNode | null;
    index?: boolean;
    path?: string;
    handle?: unknown;
    id?: string;
    loader?: LoaderFunction;
    action?: ActionFunction;
    shouldRevalidate?: ShouldRevalidateFunction;
  }

  export interface Location {
    hash: string;
    key?: string;
    pathname: string;
    search: string;
    state?: unknown;
  }

  export type To = string | Partial<Path>;

  export interface Path {
    pathname: string;
    search: string;
    hash: string;
  }

  export interface PathMatch<ParamKey extends string = string> {
    params: Record<ParamKey, string>;
    pathname: string;
    pattern: PathPattern;
  }

  export interface PathPattern {
    path: string;
    caseSensitive?: boolean;
    end?: boolean;
  }

  export type NavigateFunction = (to: To, options?: { replace?: boolean; state?: unknown; preventScrollReset?: boolean }) => void;

  export type LoaderFunction = (args: { params: Record<string, string | undefined>; request: Request; context?: unknown }) => Response | Promise<Response> | unknown;

  export type ActionFunction = (args: { params: Record<string, string | undefined>; request: Request; context?: unknown }) => Response | Promise<Response> | unknown;

  export type ShouldRevalidateFunction = (args: { currentUrl: URL; currentParams: Record<string, string>; nextUrl: URL; nextParams: Record<string, string>; formMethod?: string; formAction?: string; formEncType?: string; formData?: FormData; actionResult?: unknown; defaultShouldRevalidate: boolean }) => boolean;

  export interface RouteMatch {
    params: Record<string, string>;
    pathname: string;
    route: RouteObject;
  }

  export type URLSearchParamsInit = string | URLSearchParams | Record<string, string | string[]> | [string, string][];

  export type SetURLSearchParams = (nextInit: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit)) => void;

  export interface PatternMatch {
    path: string;
    caseSensitive?: boolean;
    end?: boolean;
  }

  export interface BrowserRouterOptions {
    basename?: string;
    window?: Window;
  }

  export interface Router {
    basename: string;
    navigator: Navigator;
    static: boolean;
  }

  export interface Navigator {
    createHref: (to: To) => string;
    go: (delta: number) => void;
    push: (to: To, state?: unknown) => void;
    replace: (to: To, state?: unknown) => void;
  }
}
