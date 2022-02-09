import {
  ILineFeature,
  IPointFeature,
  IPolygonFeature,
  IRenderType,
  IStyle,
} from './render';

export interface ISourceData {
  point: IPointFeature[];
  line: ILineFeature[];
  polygon: IPolygonFeature[];
}

export type ISourceRenderOptions = Partial<Record<IRenderType, boolean>>;

export interface ISourceOptions {
  data?: Partial<ISourceData>;
  style: IStyle;
  render: ISourceRenderOptions;
}
