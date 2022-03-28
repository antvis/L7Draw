import {
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
} from './render';
import { PointRender, LineRender, PolygonRender } from '../render';

export interface ISourceData {
  point: IPointFeature[];
  line: ILineFeature[];
  polygon: IPolygonFeature[];
  midPoint: IMidPointFeature[];
  dashLine: ILineFeature[];
}

export type IRenderMap = {
  point?: PointRender;
  line?: LineRender;
  polygon?: PolygonRender;
  midPoint?: PointRender;
  dashLine?: LineRender;
};

export interface ISourceOptions {
  data?: Partial<ISourceData>;
  render: IRenderMap;
}

export interface ISourceDataHistory {
  data: ISourceData;
  time: number;
}
