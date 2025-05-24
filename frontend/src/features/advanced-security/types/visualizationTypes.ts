/**
 * Advanced Visualization Types
 *
 * Type definitions for advanced security data visualization components
 */

export enum VisualizationType {
  ATTACK_GRAPH = "ATTACK_GRAPH",
  THREAT_MAP = "THREAT_MAP",
  ANOMALY_NETWORK = "ANOMALY_NETWORK",
  TIMELINE = "TIMELINE",
  HEATMAP = "HEATMAP",
  RADAR_CHART = "RADAR_CHART",
  SUNBURST = "SUNBURST",
  FORCE_DIRECTED = "FORCE_DIRECTED",
  TREE_MAP = "TREE_MAP",
  SANKEY_DIAGRAM = "SANKEY_DIAGRAM",
}

export enum ChartColorTheme {
  DEFAULT = "DEFAULT",
  RED_ALERT = "RED_ALERT",
  BLUE_SCALE = "BLUE_SCALE",
  SEVERITY = "SEVERITY",
  RISK_BASED = "RISK_BASED",
  CUSTOM = "CUSTOM",
}

export enum InteractionMode {
  VIEW_ONLY = "VIEW_ONLY",
  PAN_ZOOM = "PAN_ZOOM",
  INTERACTIVE = "INTERACTIVE",
  EDIT = "EDIT",
  SIMULATION = "SIMULATION",
}

export interface VisualizationNode {
  id: string;
  label: string;
  type: string;
  size?: number;
  color?: string;
  icon?: string;
  data?: Record<string, any>;
  highlight?: boolean;
  x?: number;
  y?: number;
}

export interface VisualizationEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  width?: number;
  color?: string;
  dashed?: boolean;
  arrowhead?: boolean;
  bidirectional?: boolean;
  data?: Record<string, any>;
  highlight?: boolean;
}

export interface VisualizationConfig {
  id: string;
  name: string;
  type: VisualizationType;
  description?: string;
  colorTheme: ChartColorTheme;
  layout?: "force" | "hierarchical" | "circular" | "grid" | "radial" | "custom";
  interactionMode: InteractionMode;
  showLegend: boolean;
  showTooltips: boolean;
  showLabels: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  animations?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any[]>;
  customParams?: Record<string, any>;
  width?: number;
  height?: number;
  savedAt?: string;
  createdBy?: string;
}

export interface MapCoordinate {
  lat: number;
  lng: number;
  label?: string;
}

export interface GeoVisualizationData {
  points: {
    id: string;
    coordinate: MapCoordinate;
    weight: number;
    type: string;
    label?: string;
    tooltip?: string;
    color?: string;
    data?: Record<string, any>;
  }[];
  connections: {
    id: string;
    source: string;
    target: string;
    weight: number;
    color?: string;
    animated?: boolean;
    type?: string;
    data?: Record<string, any>;
  }[];
  regions: {
    id: string;
    coordinates: MapCoordinate[];
    color?: string;
    label?: string;
    value?: number;
    data?: Record<string, any>;
  }[];
}

export interface TimelineItem {
  id: string;
  title: string;
  content?: string;
  start: string; // ISO date string
  end?: string; // ISO date string
  type?: string;
  group?: string;
  subgroup?: string;
  className?: string;
  style?: string;
  selectable?: boolean;
  selected?: boolean;
  editable?: boolean;
  data?: Record<string, any>;
}

export interface TimelineGroup {
  id: string;
  content: string;
  visible: boolean;
  className?: string;
  style?: string;
  subgroups?: {
    id: string;
    content: string;
    className?: string;
    style?: string;
  }[];
  nestedGroups?: string[];
}

export interface TimelineVisualizationData {
  items: TimelineItem[];
  groups?: TimelineGroup[];
  options?: {
    minHeight?: string;
    maxHeight?: string;
    orientation?: "top" | "bottom";
    zoomKey?: "ctrlKey" | "altKey" | "metaKey";
    showCurrentTime?: boolean;
    showMajorLabels?: boolean;
    showMinorLabels?: boolean;
    stack?: boolean;
    stackSubgroups?: boolean;
    verticalScroll?: boolean;
    horizontalScroll?: boolean;
    zoomable?: boolean;
    moveable?: boolean;
    selectable?: boolean;
    editable?: boolean;
    tooltipOnItemClick?: boolean;
  };
}

export interface HeatmapDataPoint {
  x: string | number;
  y: string | number;
  value: number;
  label?: string;
  tooltip?: string;
}

export interface HeatmapVisualizationData {
  data: HeatmapDataPoint[];
  xAxis: {
    label: string;
    categories?: string[];
  };
  yAxis: {
    label: string;
    categories?: string[];
  };
  options?: {
    colorRange?: [string, string];
    showValues?: boolean;
    cellBorders?: boolean;
    cellRadius?: number;
  };
}

export interface RadarDataSet {
  label: string;
  values: number[];
  backgroundColor?: string;
  borderColor?: string;
  pointBackgroundColor?: string;
  hidden?: boolean;
}

export interface RadarChartVisualizationData {
  labels: string[];
  datasets: RadarDataSet[];
  options?: {
    scale?: {
      min?: number;
      max?: number;
      ticks?: {
        stepSize?: number;
        showLabels?: boolean;
      };
    };
    showLegend?: boolean;
    showLabels?: boolean;
    fill?: boolean;
  };
}

export interface ForceDirectedGraphData {
  nodes: VisualizationNode[];
  edges: VisualizationEdge[];
  options?: {
    physics?: {
      enabled: boolean;
      stabilization: boolean;
      solver:
        | "barnesHut"
        | "forceAtlas2Based"
        | "repulsion"
        | "hierarchicalRepulsion";
    };
    groups?: Record<
      string,
      {
        shape?: string;
        color?: string;
        icon?: string;
        size?: number;
      }
    >;
    nodes?: {
      shape?: string;
      size?: number;
      font?: {
        size?: number;
        color?: string;
      };
    };
    edges?: {
      width?: number;
      color?: string;
      arrows?: {
        to?: boolean;
        from?: boolean;
      };
    };
    interaction?: {
      dragNodes?: boolean;
      dragView?: boolean;
      zoomView?: boolean;
      selectable?: boolean;
      selectConnectedEdges?: boolean;
      multiselect?: boolean;
    };
  };
}

export interface SunburstChartDataPoint {
  id: string;
  parent: string;
  name: string;
  value?: number;
  color?: string;
  dataAttributes?: Record<string, any>;
}

export interface SunburstChartVisualizationData {
  data: SunburstChartDataPoint[];
  options?: {
    levels?: number;
    levelsToShow?: number;
    rootName?: string;
    showLabels?: boolean;
    showValues?: boolean;
    valueFormat?: string;
    colorMode?: "gradient" | "category" | "sequential" | "custom";
    colorRange?: string[];
    drilldownEnabled?: boolean;
  };
}

export interface TreeMapDataPoint {
  id: string;
  name: string;
  parent?: string;
  value: number;
  color?: string;
  dataAttributes?: Record<string, any>;
}

export interface TreeMapVisualizationData {
  data: TreeMapDataPoint[];
  options?: {
    colorMode?: "gradient" | "category" | "sequential" | "custom";
    colorRange?: string[];
    showLabels?: boolean;
    showValues?: boolean;
    valueFormat?: string;
    border?: boolean;
    borderColor?: string;
    borderWidth?: number;
    drilldownEnabled?: boolean;
  };
}

export interface SankeyNode {
  id: string;
  name: string;
  color?: string;
  dataAttributes?: Record<string, any>;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
  dataAttributes?: Record<string, any>;
}

export interface SankeyDiagramVisualizationData {
  nodes: SankeyNode[];
  links: SankeyLink[];
  options?: {
    nodeWidth?: number;
    nodePadding?: number;
    showNodeLabels?: boolean;
    showLinkLabels?: boolean;
    showValues?: boolean;
    valueFormat?: string;
    linkOpacity?: number;
    colorMode?: "source" | "target" | "gradient" | "custom";
  };
}

export interface VisualizationDataResponse {
  type: VisualizationType;
  config: VisualizationConfig;
  data:
    | ForceDirectedGraphData
    | GeoVisualizationData
    | TimelineVisualizationData
    | HeatmapVisualizationData
    | RadarChartVisualizationData
    | SunburstChartVisualizationData
    | TreeMapVisualizationData
    | SankeyDiagramVisualizationData;
}

export interface VisualizationSearchParams {
  type?: VisualizationType[];
  creator?: string;
  startDate?: string;
  endDate?: string;
  query?: string;
  limit?: number;
  offset?: number;
}

export interface VisualizationInteractionEvent {
  type:
    | "nodeClick"
    | "edgeClick"
    | "nodeHover"
    | "edgeHover"
    | "backgroundClick"
    | "selectionChanged"
    | "zoomChange"
    | "timeChange";
  data: any;
  timestamp: number;
}

export interface VisualizationSaveRequest {
  config: VisualizationConfig;
  screenshot?: string; // Base64 encoded image
  thumbnail?: string; // Base64 encoded image
}

export interface VisualizationExportOptions {
  format: "png" | "svg" | "pdf" | "json" | "csv";
  width?: number;
  height?: number;
  filename?: string;
  includeMetadata?: boolean;
  quality?: number; // For PNG: 0-1
}
