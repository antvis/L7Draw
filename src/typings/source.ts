import {
  IDashLineFeature,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  ITextFeature,
} from './feature';
import { PointRender, LineRender, PolygonRender } from '../render';
import { TextRender } from '../render/TextRender';

export interface ISourceData {
  point: IPointFeature[];
  line: ILineFeature[];
  polygon: IPolygonFeature[];
  midPoint: IMidPointFeature[];
  dashLine: IDashLineFeature[];
  text: ITextFeature[];
}

export type IRenderMap = {
  point?: PointRender;
  line?: LineRender;
  polygon?: PolygonRender;
  midPoint?: PointRender;
  dashLine?: LineRender;
  text?: TextRender;
};

export interface ISourceOptions {
  data?: Partial<ISourceData>;
  render: IRenderMap;
}

export interface ISourceDataHistory {
  data: ISourceData;
  time: number;
}
