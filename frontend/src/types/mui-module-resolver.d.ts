/**
 * Material UI module declarations to fix ESM resolution issues
 */

// Material UI component declarations
declare module '@mui/material/styles' {
  export * from '@mui/material';
}

declare module '@mui/material/styles/createTheme' {
  export * from '@mui/material/styles';
}

declare module '@mui/system' {
  export * from '@mui/material';
}

declare module '@mui/system/RtlProvider' {
  import { FC, ReactNode } from 'react';
  interface RtlProviderProps {
    children: ReactNode;
    rtl?: boolean;
  }
  const RtlProvider: FC<RtlProviderProps>;
  export default RtlProvider;
}

declare module '@mui/system/createStyled' {
  export * from '@mui/system';
}

// Data Grid declarations
declare module '@mui/x-data-grid/esm/*' {
  export * from '@mui/x-data-grid';
}

// Update GridSelectionModel to GridRowSelectionModel to fix type errors
declare module '@mui/x-data-grid' {
  export type GridSelectionModel = GridRowSelectionModel;
  export type GridRowSelectionModel = any[];
}

// Date pickers declarations
declare module '@mui/x-date-pickers/*' {
  export * from '@mui/x-date-pickers';
}

declare module '@mui/x-date-pickers' {
  export const DatePicker: any;
  export const LocalizationProvider: any;
  export const AdapterDateFns: any;
}

// Fix for date-fns
declare module 'date-fns/*' {
  export * from 'date-fns';
}

// Add missing Material UI styled export
declare module '@mui/material/styles' {
  export const styled: any;
  export const useTheme: any;
  export const createTheme: any;
  export type Theme = any;
  export type PaletteMode = 'light' | 'dark';
}

// Add React declarations
declare module 'react' {
  // React core exports
  export const useState: any;
  export const useEffect: any;
  export const useContext: any;
  export const useReducer: any;
  export const useCallback: any;
  export const useMemo: any;
  export const useRef: any;
  export const useImperativeHandle: any;
  export const useLayoutEffect: any;
  export const useDebugValue: any;
  export const useId: any;
  
  // React component types
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
  
  // React core functions
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export function cloneElement(element: any, props?: any, ...children: any[]): any;
  export function createContext<T>(defaultValue: T): any;
  export function memo<T>(component: T): T;
  export function forwardRef<T, P>(render: (props: P, ref: any) => any): any;
  export function isValidElement(object: any): boolean;
  export const Children: any;
  export const Fragment: any;
  export const StrictMode: any;
  export const Suspense: any;
  export const Profiler: any;
  export const Component: any;
  export const PureComponent: any;
  
  export default {
    useState,
    useEffect,
    useContext,
    useReducer,
    useCallback,
    useMemo,
    useRef,
    createElement,
    cloneElement,
    createContext,
    memo,
    forwardRef,
    Fragment,
    StrictMode,
    Suspense,
    Profiler,
    Children,
    isValidElement,
    Component,
    PureComponent
  };
  
  // Add namespace support
  namespace React {
    export const useState: any;
    export const useEffect: any;
    export const useContext: any;
    export const useReducer: any;
    export const useCallback: any;
    export const useMemo: any;
    export const useRef: any;
    export const useImperativeHandle: any;
    export const useLayoutEffect: any;
    export const useDebugValue: any;
    export const useId: any;
    export const Fragment: any;
    export const StrictMode: any;
    export const Suspense: any;
    export const Profiler: any;
    export const Component: any;
    export const PureComponent: any;
    export const Children: any;
    
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
    
    export function createElement(type: any, props?: any, ...children: any[]): any;
    export function cloneElement(element: any, props?: any, ...children: any[]): any;
    export function createContext<T>(defaultValue: T): any;
    export function memo<T>(component: T): T;
    export function forwardRef<T, P>(render: (props: P, ref: any) => any): any;
    export function isValidElement(object: any): boolean;
  }
}

// Add React JSX declarations
declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
  export default { jsx, jsxs, Fragment };
}

// Add React Helmet Async declarations
declare module 'react-helmet-async' {
  export const Helmet: any;
  export const HelmetProvider: any;
  export default { Helmet, HelmetProvider };
}

// Add React Router Dom declarations
declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const HashRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Link: any;
  export const NavLink: any;
  export const Navigate: any;
  export const Outlet: any;
  export const RouterProvider: any;
  export const createBrowserRouter: any;
  export const createHashRouter: any;
  export const createRoutesFromElements: any;
  export const defer: any;
  export const isRouteErrorResponse: any;

  // Hooks
  export const useNavigate: any;
  export const useLocation: any;
  export const useParams: any;
  export const useSearchParams: any;
  export const useMatch: any;
  export const useMatches: any;
  export const useHref: any;
  export const useResolvedPath: any;
  export const useNavigation: any;
  export const useRouteError: any;
  export const useOutletContext: any;
  export const useActionData: any;
  export const useLoaderData: any;
  export const useAsyncValue: any;
  export const useAsyncError: any;
  export const useInRouterContext: any;
  export const useRoutes: any;
  export const useBlocker: any;
  export const useBeforeUnload: any;
  export const usePrompt: any;
  export const useSubmit: any;
  export const useFetcher: any;
  export const useFetchers: any;
  export const useFormAction: any;
  export const useScrollRestoration: any;
  
  // Types
  export type Location = any;
  export type NavigateFunction = any;
  export type NavigateOptions = any;
  export type Navigation = any;
  export type Path = any;
  export type Params = any;
  export type RouteObject = any;
  export type RouteMatch = any;
  export type PathMatch = any;
  export type SearchParams = any;
  export type SetURLSearchParams = any;
  export type LoaderFunction = any;
  export type ActionFunction = any;
  export type Router = any;
  export type RouterState = any;
  export type To = any;
  export type LinkProps = any;
  export type NavLinkProps = any;
  export type OutletProps = any;
  export type RouteProps = any;
  export type RoutesProps = any;
  export type NavigateProps = any;

  // Utils
  export function generatePath(path: string, params?: any): string;
  export function matchPath(pattern: any, pathname: string): any;
  export function matchRoutes(routes: any[], location: any): any[];
  export function resolvePath(to: any, fromPathname?: string): any;
  export function renderMatches(matches: any[]): any;
  export function redirect(url: string): any;
  export function json(data: any, init?: any): any;
}

// Fix missing ThemeProvider
declare module '@mui/material' {
  // Core components
  export const ThemeProvider: any;
  export const CssBaseline: any;
  export const Box: any;
  export const Typography: any;
  export const Container: any;
  export const Grid: any;
  export const Paper: any;
  export const Card: any;
  export const CardHeader: any;
  export const CardContent: any;
  export const CardActions: any;
  export const CardMedia: any;
  export const CardActionArea: any;
  export const Divider: any;
  export const Stack: any;
  
  // Navigation
  export const AppBar: any;
  export const Toolbar: any;
  export const Drawer: any;
  export const Menu: any;
  export const MenuItem: any;
  export const Tabs: any;
  export const Tab: any;
  export const Breadcrumbs: any;
  export const Link: any;
  export const List: any;
  export const ListItem: any;
  export const ListItemIcon: any;
  export const ListItemText: any;
  export const ListItemAvatar: any;
  export const ListItemSecondaryAction: any;
  export const ListItemButton: any;
  export const Stepper: any;
  export const Step: any;
  export const StepLabel: any;
  export const StepContent: any;
  
  // Inputs
  export const Button: any;
  export const IconButton: any;
  export const ButtonGroup: any;
  export const ToggleButton: any;
  export const ToggleButtonGroup: any;
  export const Fab: any;
  export const TextField: any;
  export const Select: any;
  export const FormControl: any;
  export const FormControlLabel: any;
  export const FormGroup: any;
  export const FormHelperText: any;
  export const InputLabel: any;
  export const InputAdornment: any;
  export const OutlinedInput: any;
  export const Checkbox: any;
  export const Radio: any;
  export const RadioGroup: any;
  export const Switch: any;
  export const Slider: any;
  export const Autocomplete: any;
  
  // Feedback
  export const Alert: any;
  export const AlertTitle: any;
  export const Backdrop: any;
  export const Badge: any;
  export const Chip: any;
  export const CircularProgress: any;
  export const Dialog: any;
  export const DialogTitle: any;
  export const DialogContent: any;
  export const DialogContentText: any;
  export const DialogActions: any;
  export const LinearProgress: any;
  export const Skeleton: any;
  export const Snackbar: any;
  export const SnackbarContent: any;
  export const Tooltip: any;
  
  // Data Display
  export const Avatar: any;
  export const AvatarGroup: any;
  export const Table: any;
  export const TableBody: any;
  export const TableCell: any;
  export const tableCellClasses: any;
  export const TableContainer: any;
  export const TableHead: any;
  export const TableRow: any;
  export const TablePagination: any;
  export const TableSortLabel: any;
  export const Collapse: any;
  export const Fade: any;
  export const Grow: any;
  export const Zoom: any;
  
  // Utility
  export const useTheme: any;
  export const useMediaQuery: any;
  export const alpha: any;
  export type SelectChangeEvent<T = unknown> = any;
  export type SxProps = any;
  export type SnackbarOrigin = {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  export type PaletteMode = 'light' | 'dark';
  export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button' | 'overline' | 'inherit';
    component?: React.ElementType;
    align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
    color?: string;
  }
}

// Add missing JSX declarations to fix JSX errors
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Fix missing module declarations for various MUI icon imports
declare module '@mui/icons-material/*' {
  const Icon: any;
  export default Icon;
}

// Add notistack declarations
declare module 'notistack' {
  export const SnackbarProvider: any;
  export const useSnackbar: any;
  export const enqueueSnackbar: any;
  export const closeSnackbar: any;
  export const SnackbarContent: any;
  export const MaterialDesignContent: any;

  export type VariantType = 'default' | 'error' | 'success' | 'warning' | 'info';
  export type CloseReason = 'timeout' | 'clickaway' | 'maxsnack' | 'instructed';
  export type SnackbarKey = string | number;
  export type SnackbarMessage = string | React.ReactNode;
  export type SnackbarAction = React.ReactNode | ((key: SnackbarKey) => React.ReactNode);
  export type TransitionCloseHandler = (event: React.SyntheticEvent<any> | null, reason: CloseReason, key: SnackbarKey) => void;
  export type TransitionEnterHandler = (node: HTMLElement, isAppearing: boolean, key: SnackbarKey) => void;
  export type TransitionExitHandler = (node: HTMLElement, key: SnackbarKey) => void;
  export type SnackbarClassKey = 'root' | 'anchorOriginTopCenter' | 'anchorOriginBottomCenter' | 'anchorOriginTopRight' | 'anchorOriginBottomRight' | 'anchorOriginTopLeft' | 'anchorOriginBottomLeft';
}

// Add react-redux declarations
declare module 'react-redux' {
  // Hooks
  export function useSelector<TState = any, TSelected = any>(selector: (state: TState) => TSelected, equalityFn?: (left: TSelected, right: TSelected) => boolean): TSelected;
  export function useDispatch<TDispatch = any>(): TDispatch;
  export function useStore<TState = any>(): { getState: () => TState, dispatch: any };

  // Components
  export const Provider: any;
  export const connect: any;
  export const batch: any;

  // HOCs
  export function shallowEqual(objA: any, objB: any): boolean;

  // Types
  export type Dispatch<A = any> = (action: A) => any;
  export type AnyAction = { type: any, [key: string]: any };
  export type Action<T = any> = { type: T };
  export type ActionCreator<A = any> = (...args: any[]) => A;
  export type Reducer<S = any, A = any> = (state: S | undefined, action: A) => S;
  export type Store<S = any, A = any> = { dispatch: Dispatch<A>, getState: () => S, subscribe: any, replaceReducer: any };
}

// Add redux-toolkit declarations
declare module '@reduxjs/toolkit' {
  export function createSlice(options: any): any;
  export function createAsyncThunk<Returned, ThunkArg>(typePrefix: string, payloadCreator: (arg: ThunkArg, thunkAPI: any) => Promise<Returned>, options?: any): any;
  export function configureStore(options: any): any;
  export function combineReducers(reducers: any): any;
  export function createReducer(initialState: any, builder: any): any;
  export function createAction(type: string, prepareAction?: any): any;
  export function createEntityAdapter<T = any>(options?: any): any;
  export function createSelector(...args: any[]): any;
  export function getDefaultMiddleware(options?: any): any[];
  export function isAllOf(...matchers: any[]): any;
  export function isAnyOf(...matchers: any[]): any;

  export const current: any;
  export const nanoid: any;
  export const unwrapResult: any;
  
  export namespace createEntityAdapter {
    export function getInitialState(additionalState?: any): any;
    export function getSelectors(selectState?: any): any;
  }
}

// Add axios declarations
declare module 'axios' {
  export interface AxiosRequestConfig {
    url?: string;
    method?: 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch';
    baseURL?: string;
    transformRequest?: any;
    transformResponse?: any;
    headers?: any;
    params?: any;
    paramsSerializer?: (params: any) => string;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
    adapter?: any;
    auth?: any;
    responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
    responseEncoding?: string;
    xsrfCookieName?: string;
    xsrfHeaderName?: string;
    onUploadProgress?: (progressEvent: any) => void;
    onDownloadProgress?: (progressEvent: any) => void;
    maxContentLength?: number;
    validateStatus?: (status: number) => boolean;
    maxRedirects?: number;
    socketPath?: string | null;
    httpAgent?: any;
    httpsAgent?: any;
    proxy?: any;
    cancelToken?: any;
    decompress?: boolean;
  }

  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
  }

  export interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
    toJSON: () => object;
  }

  export interface Axios {
    defaults: AxiosRequestConfig;
    interceptors: any;
    request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  }

  export interface AxiosStatic extends Axios {
    create(config?: AxiosRequestConfig): Axios;
    Cancel: any;
    CancelToken: any;
    isCancel(value: any): boolean;
    all<T>(values: (T | Promise<T>)[]): Promise<T[]>;
    spread<T, R>(callback: (...args: T[]) => R): (array: T[]) => R;
    isAxiosError(payload: any): payload is AxiosError;
  }

  const axios: AxiosStatic;
  export default axios;
}

// Add formik declarations
declare module 'formik' {
  export const Formik: any;
  export const Form: any;
  export const Field: any;
  export const ErrorMessage: any;
  export const FieldArray: any;
  export const useFormik: any;
  export const useField: any;
  export const useFormikContext: any;
  export const FormikProvider: any;
  export const FormikConsumer: any;
  export const connect: any;
  export const yupToFormErrors: any;
  export const validateYupSchema: any;
}

declare module '@mui/icons-material' {
  export const Dashboard: any;
  export const Security: any;
  export const Cloud: any;
  export const CloudCircle: any;
  export const Storage: any;
  export const Language: any;
  export const Description: any;
  export const AccountCircle: any;
  export const Settings: any;
  export const Notifications: any;
  export const Menu: any;
  export const Close: any;
  export const Home: any;
  export const NavigateNext: any;
  export const Add: any;
  export const Delete: any;
  export const Edit: any;
  export const Visibility: any;
  export const VisibilityOff: any;
  export const Check: any;
  export const Error: any;
  export const Warning: any;
  export const Info: any;
  export const ArrowBack: any;
  export const ArrowForward: any;
  export const ChevronLeft: any;
  export const ChevronRight: any;
  export const ExpandMore: any;
  export const ExpandLess: any;
  export const KeyboardArrowDown: any;
  export const KeyboardArrowUp: any;
  export const Search: any;
  export const Refresh: any;
  export const MoreVert: any;
  export const FilterList: any;
  export const Sort: any;
  export const Print: any;
  export const Download: any;
  export const Upload: any;
  export const Share: any;
  export const Star: any;
  export const StarBorder: any;
  export const Favorite: any;
  export const FavoriteBorder: any;
  export const Person: any;
  export const Group: any;
  export const Lock: any;
  export const LockOpen: any;
  export const Help: any;
  export const HelpOutline: any;
  export const Info: any;
  export const InfoOutline: any;
  export const Report: any;
  export const ReportProblem: any;
  export const Flag: any;
  export const AddCircle: any;
  export const AddCircleOutline: any;
  export const RemoveCircle: any;
  export const RemoveCircleOutline: any;
  export const Check: any;
  export const CheckCircle: any;
  export const CheckCircleOutline: any;
  export const Cancel: any;
  export const CancelOutlined: any;
  export const Block: any;
  export const ErrorOutline: any;
  export const PrivacyTip: any;
  export const CreditCard: any;
  export const HealthAndSafety: any;
  export const AccountTree: any;
  export const DateRange: any;
  export const Checklist: any;
  export const PlayArrow: any;
  export const History: any;
  export const Tune: any;
  export const Save: any;
  export const Timeline: any;
  export const Assessment: any;
  export const Dns: any;
  export const HelpCenter: any;
  export const Analytics: any;
  export const Insights: any;
  export const BarChart: any;
  export const PieChart: any;
  export const LineChart: any;
  export const BubbleChart: any;
  export const ViewList: any;
  export const ViewModule: any;
  export const ViewQuilt: any;
  export const Code: any;
  export const GitHub: any;
  export const Web: any;
  export const Terminal: any;
  export const DesktopWindows: any;
  export const Laptop: any;
  export const Phone: any;
  export const Tablet: any;
  export const Cached: any;
  export const CalendarToday: any;
  export const Event: any;
  export const DataUsage: any;
  export const Send: any;
  export const CallMade: any;
  export const CallReceived: any;
  export const Sync: any;
  export const Loop: any;
  export const Computer: any;
  export const NetworkCheck: any;
  export const DeveloperBoard: any;
}
