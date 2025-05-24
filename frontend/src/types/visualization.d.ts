/**
 * Type declarations for visualization components and charts
 * Used by the AdvancedDashboard and related visualization components
 */

declare module "react-grid-layout" {
  import * as React from "react";

  export interface ReactGridLayoutProps {
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    autoSize?: boolean;
    cols?: number;
    draggableCancel?: string;
    draggableHandle?: string;
    verticalCompact?: boolean;
    compactType?: 'vertical' | 'horizontal' | null;
    layout?: Layout[];
    margin?: [number, number];
    containerPadding?: [number, number] | null;
    rowHeight?: number;
    maxRows?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    preventCollision?: boolean;
    useCSSTransforms?: boolean;
    transformScale?: number;
    onLayoutChange?: (layout: Layout[]) => void;
    onDragStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
    onDrag?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
    onDragStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
    onResizeStart?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
    onResize?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
    onResizeStop?: (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, event: MouseEvent, element: HTMLElement) => void;
  }

  export interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    minW?: number;
    maxW?: number;
    minH?: number;
    maxH?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    static?: boolean;
  }

  export default class ReactGridLayout extends React.Component<ReactGridLayoutProps> {}
}

declare module 'recharts' {
  import * as React from 'react';

  export interface AreaChartProps {
    width?: number;
    height?: number;
    data?: any[];
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    children?: React.ReactNode;
    layout?: 'horizontal' | 'vertical';
    stackOffset?: 'expand' | 'none' | 'wiggle' | 'silhouette';
    syncId?: string;
    [key: string]: any;
  }

  export interface BarChartProps extends AreaChartProps {}
  export interface LineChartProps extends AreaChartProps {}
  export interface PieChartProps extends Omit<AreaChartProps, 'layout' | 'stackOffset'> {}

  export interface XAxisProps {
    dataKey?: string;
    xAxisId?: string | number;
    width?: number;
    height?: number;
    orientation?: 'bottom' | 'top';
    type?: 'number' | 'category';
    allowDecimals?: boolean;
    allowDataOverflow?: boolean;
    domain?: [number | string, number | string];
    tickCount?: number;
    interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface YAxisProps extends Omit<XAxisProps, 'orientation'> {
    orientation?: 'left' | 'right';
  }

  export interface CartesianGridProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    horizontal?: boolean;
    vertical?: boolean;
    horizontalPoints?: number[];
    verticalPoints?: number[];
    [key: string]: any;
  }

  export interface TooltipProps {
    content?: React.ReactNode | ((props: any) => React.ReactNode);
    cursor?: boolean | React.ReactNode;
    offset?: number;
    wrapperStyle?: React.CSSProperties;
    contentStyle?: React.CSSProperties;
    itemStyle?: React.CSSProperties;
    labelStyle?: React.CSSProperties;
    formatter?: (value: any, name: string, props: any) => React.ReactNode;
    labelFormatter?: (label: string) => React.ReactNode;
    [key: string]: any;
  }

  export interface LegendProps {
    content?: React.ReactNode | ((props: any) => React.ReactNode);
    width?: number;
    height?: number;
    layout?: 'horizontal' | 'vertical';
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    iconSize?: number;
    iconType?: 'line' | 'square' | 'rect' | 'circle' | 'cross' | 'diamond' | 'star' | 'triangle' | 'wye';
    payload?: Array<{
      value: string;
      type: string;
      color?: string;
      id?: string;
    }>;
    [key: string]: any;
  }

  export interface AreaProps {
    dataKey: string;
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    stroke?: string;
    fill?: string;
    activeDot?: boolean | React.ReactNode;
    [key: string]: any;
  }

  export interface BarProps {
    dataKey: string;
    fill?: string;
    stroke?: string;
    [key: string]: any;
  }

  export interface LineProps {
    dataKey: string;
    type?: 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';
    stroke?: string;
    activeDot?: boolean | React.ReactNode;
    dot?: boolean | React.ReactNode;
    [key: string]: any;
  }

  export interface PieProps {
    dataKey: string;
    cx?: number | string;
    cy?: number | string;
    innerRadius?: number | string;
    outerRadius?: number | string;
    startAngle?: number;
    endAngle?: number;
    [key: string]: any;
  }

  export interface ResponsiveContainerProps {
    aspect?: number;
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    maxHeight?: string | number;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export class AreaChart extends React.Component<AreaChartProps> {}
  export class BarChart extends React.Component<BarChartProps> {}
  export class LineChart extends React.Component<LineChartProps> {}
  export class PieChart extends React.Component<PieChartProps> {}
  export class XAxis extends React.Component<XAxisProps> {}
  export class YAxis extends React.Component<YAxisProps> {}
  export class CartesianGrid extends React.Component<CartesianGridProps> {}
  export class Tooltip extends React.Component<TooltipProps> {}
  export class Legend extends React.Component<LegendProps> {}
  export class Area extends React.Component<AreaProps> {}
  export class Bar extends React.Component<BarProps> {}
  export class Line extends React.Component<LineProps> {}
  export class Pie extends React.Component<PieProps> {}
  export class ResponsiveContainer extends React.Component<ResponsiveContainerProps> {}
}
