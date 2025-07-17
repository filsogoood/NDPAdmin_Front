declare module 'react-simple-maps' {
  import { ComponentType, ReactNode } from 'react';

  export interface Geography {
    rsmKey: string;
    properties: any;
    geometry: any;
  }

  export interface GeographiesProps {
    geography: string;
    children: ({ geographies }: { geographies: Geography[] }) => ReactNode;
  }

  export interface Position {
    coordinates: [number, number];
    zoom: number;
  }

  export const ComposableMap: ComponentType<{
    projection?: string;
    projectionConfig?: any;
    style?: React.CSSProperties;
    children?: ReactNode;
  }>;

  export const Geographies: ComponentType<GeographiesProps>;

  export const Geography: ComponentType<{
    geography: Geography;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: any;
  }>;

  export const Marker: ComponentType<{
    coordinates: [number, number];
    style?: any;
    children?: ReactNode;
  }>;

  export const ZoomableGroup: ComponentType<{
    zoom?: number;
    center?: [number, number];
    onMoveEnd?: (position: Position) => void;
    children?: ReactNode;
  }>;
} 