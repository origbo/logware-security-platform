/**
 * Type declarations for third-party libraries used in the Logware Security Platform
 */

// Recharts library
declare module 'recharts' {
  import * as React from 'react';

  // Common chart props
  interface CommonProps {
    width?: number;
    height?: number;
    data?: any[];
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  }

  // LineChart component
  export interface LineChartProps extends CommonProps {
    children?: React.ReactNode;
  }
  
  export class LineChart extends React.Component<LineChartProps> {}
  
  // BarChart component
  export interface BarChartProps extends CommonProps {
    children?: React.ReactNode;
  }
  
  export class BarChart extends React.Component<BarChartProps> {}
  
  // PieChart component
  export interface PieChartProps extends CommonProps {
    children?: React.ReactNode;
  }
  
  export class PieChart extends React.Component<PieChartProps> {}
  
  // AreaChart component
  export interface AreaChartProps extends CommonProps {
    children?: React.ReactNode;
  }
  
  export class AreaChart extends React.Component<AreaChartProps> {}

  // Chart components
  export class Line extends React.Component<any> {}
  export class Bar extends React.Component<any> {}
  export class Area extends React.Component<any> {}
  export class Pie extends React.Component<any> {}
  export class Cell extends React.Component<any> {}
  export class XAxis extends React.Component<any> {}
  export class YAxis extends React.Component<any> {}
  export class CartesianGrid extends React.Component<any> {}
  export class Tooltip extends React.Component<any> {}
  export class Legend extends React.Component<any> {}
  export class ResponsiveContainer extends React.Component<any> {}
}

// date-fns library
declare module 'date-fns' {
  export function format(date: Date | number, format: string, options?: object): string;
  export function parse(dateString: string, format: string, baseDate: Date, options?: object): Date;
  export function addDays(date: Date | number, amount: number): Date;
  export function subDays(date: Date | number, amount: number): Date;
  export function addMonths(date: Date | number, amount: number): Date;
  export function subMonths(date: Date | number, amount: number): Date;
  export function isAfter(date: Date | number, dateToCompare: Date | number): boolean;
  export function isBefore(date: Date | number, dateToCompare: Date | number): boolean;
  export function isEqual(date: Date | number, dateToCompare: Date | number): boolean;
  export function differenceInDays(dateLeft: Date | number, dateRight: Date | number): number;
  export function differenceInHours(dateLeft: Date | number, dateRight: Date | number): number;
  export function formatDistance(date: Date | number, baseDate: Date | number, options?: object): string;
}

// React Redux hooks
declare module 'react-redux' {
  import { Store, Action, AnyAction } from 'redux';
  
  export function useSelector<TState = any, TSelected = any>(
    selector: (state: TState) => TSelected,
    equalityFn?: (left: TSelected, right: TSelected) => boolean
  ): TSelected;
  
  export function useDispatch<TDispatch = any>(): TDispatch;
  
  export function useStore<S = any, A extends Action = AnyAction>(): Store<S, A>;
  
  export interface ProviderProps<A extends Action = AnyAction> {
    store: Store<any, A>;
    children: React.ReactNode;
  }
  
  export const Provider: React.ComponentType<ProviderProps>;
}

// Define process for development environments
interface Process {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
    [key: string]: string | undefined;
  };
}

declare global {
  var process: Process;
}

// Redux Toolkit
declare module '@reduxjs/toolkit' {
  export * from '@reduxjs/toolkit/dist/redux-toolkit.cjs.development';
}

declare module '@reduxjs/toolkit/query/react' {
  export * from '@reduxjs/toolkit/dist/query/react';
}

// Fix for RTK setupListeners
declare module '@reduxjs/toolkit/dist/query/core/setupListeners' {
  export default function setupListeners(dispatch: any, options?: any): () => void;
}
