import { IStyle } from './render';
import { Feature, LineString, Point, Polygon } from '@turf/turf';

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

export interface IDrawerOptions {
  style: IStyle;
  cursor: ICursor;
  initData?: IDrawerOptionsData;
  editable: boolean;
  autoFocus: boolean;
}

export interface IDistanceOptions {
  total: boolean;
  showOnDash: boolean;
  format: (meter: number) => string;
}
