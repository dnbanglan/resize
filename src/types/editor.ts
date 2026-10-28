export type ToolType = 
  | 'select' 
  | 'crop' 
  | 'text' 
  | 'image' 
  | 'draw' 
  | 'rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'star' 
  | 'line' 
  | 'arrow';

export type ExportFormat = 'png' | 'jpg' | 'webp';

export interface CanvasDimensions {
  width: number;
  height: number;
  name: string;
}

export interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  selected?: boolean;
}

export interface ImageFilters {
  brightness: number; // -1 to 1 (default 0)
  contrast: number;   // -1 to 1 (default 0)
  saturation: number; // -1 to 1 (default 0)
  blur: number;       // 0 to 1 (default 0)
  hue: number;        // -1 to 1 (default 0)
  vintage: boolean;
  sepia: boolean;
  grayscale: boolean;
  invert: boolean;
}

export interface TextProperties {
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  stroke: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  lineHeight: number;
  charSpacing: number;
}

export interface ShapeProperties {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  rx?: number;
  ry?: number;
}

export interface ObjectTransform {
  left: number;
  top: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
}

export interface ProjectState {
  version: string;
  updatedAt: string;
  canvasDimensions: CanvasDimensions;
  backgroundColor: string;
  json: string;
}

export interface ExportSettings {
  fileName: string;
  format: ExportFormat;
  quality: number; // 0.1 to 1
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  transparentBackground: boolean;
  backgroundColor: string;
}
