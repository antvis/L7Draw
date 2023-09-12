import { Feature, LineString, Point, Position } from '@turf/turf';
import { Content, Props as TippyProps } from 'tippy.js';
import { HistoryConfig } from './source';
import { IStyle } from './style';
import { ILineFeature, IPointFeature, IPolygonFeature } from './feature';

/**
 * 鼠标指针类型
 */
export type ICursorType =
  | 'draw'
  | 'pointHover'
  | 'pointDrag'
  | 'lineHover'
  | 'lineDrag'
  | 'polygonHover'
  | 'polygonDrag';

/**
 * 鼠标指针类型键值对
 */
export type ICursor = Record<ICursorType, string>;

export type KeyBoardConfig = Partial<{
  remove: string[] | false;
  revert: string[] | false;
  redo: string[] | false;
}>;

/**
 * 基础Drawer配置
 */
export interface IBaseModeOptions<F extends Feature = Feature> {
  style: IStyle;
  cursor: ICursor;
  initialData?: F[];
  editable: boolean;
  autoActive: boolean;
  multiple: boolean;
  helper: any | boolean;
  maxCount: number;
  popup: PopupOptions | boolean;
  history: HistoryConfig | false;
  keyboard: KeyBoardConfig | false;
}

/**
 * 距离文案配置
 */
export interface IDistanceOptions {
  showTotalDistance: boolean;
  showDashDistance: boolean;
  showWhen: ('normal' | 'active')[];
  format: (meters: number) => string;
}

/**
 * 面积文案配置
 */
export interface IAreaOptions {
  format: (squareMeters: number) => string;
  showWhen: ('normal' | 'active')[];
}

export type PopupOptions = Partial<TippyProps>;

export type PopupContent = Content | null | undefined;

export type AdsorbTargetFeature =
  | Feature
  | IPointFeature
  | ILineFeature
  | IPolygonFeature;

export interface IAdsorbOptions {
  data:
    | 'drawData'
    | 'allDrawData'
    | AdsorbTargetFeature[]
    | ((position: Position) => AdsorbTargetFeature[]);
  pointAdsorbPixel: number;
  lineAdsorbPixel: number;
}

export type AdsorbResult = {
  points: Feature<Point>[];
  lines: Feature<LineString>[];
};
