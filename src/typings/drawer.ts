import { IStyle } from './render';
import { Feature, LineString, Point, Polygon } from '@turf/turf';
import { Props as TippyProps } from 'tippy.js';

export type ICursorType =
  | 'draw'
  | 'pointHover'
  | 'pointDrag'
  | 'lineHover'
  | 'lineDrag'
  | 'polygonHover'
  | 'polygonDrag';

export type ICursor = Record<ICursorType, string>;

export interface IDrawerOptionsData {
  point?: Feature<Point>[];
  line?: Feature<LineString>[];
  polygon?: Feature<Polygon>[];
}

export interface IPointHelper {
  draw: string;
  pointHover: string;
  pointDrag: string;
}

export interface ILineHelper extends IPointHelper {
  lineHover: string;
  lineDrag: string;
}

export type IPopupConfig = Partial<TippyProps>;

export interface IDrawerOptions {
  style: IStyle;
  cursor: ICursor;
  initData?: IDrawerOptionsData;
  editable: boolean;
  autoFocus: boolean;
  multiple: boolean;
  popup: false | IPopupConfig;
}

export interface IDistanceOptions {
  total: boolean;
  showOnDash: boolean;
  showOnNormal: boolean;
  showOnActive: boolean;
  format: (meters: number) => string;
}

export interface IAreaOptions {
  format: (squareMeters: number) => string;
  showOnNormal: boolean;
  showOnActive: boolean;
}
