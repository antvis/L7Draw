import { ILineFeature, IPointFeature, IPolygonFeature } from './render';
import { PointRender, LineRender, PolygonRender } from '../render';

export interface ISourceData {
  point: IPointFeature[];
  line: ILineFeature[];
  polygon: IPolygonFeature[];
}

export type IRenderMap = {
  point?: PointRender;
  line?: LineRender;
  polygon?: PolygonRender;
};

export interface ISourceOptions {
  data?: Partial<ISourceData>;
  render: IRenderMap;
}

export interface ISourceDataHistory {
  data: ISourceData;
  time: number;
}
