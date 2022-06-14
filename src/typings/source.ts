import { PointRender } from '../render';
import {
  IDashLineFeature,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  ITextFeature,
} from './feature';
// import { PointRender, LineRender, PolygonRender, TextRender } from '../render';

/**
 * Source数据类型
 */
export interface SourceData {
  point: IPointFeature[];
  line: ILineFeature[];
  polygon: IPolygonFeature[];
  midPoint: IMidPointFeature[];
  dashLine: IDashLineFeature[];
  text: ITextFeature[];
}

export type SourceHistoryConfig = {
  revertKeys: string[];
  redoKeys: string[];
  maxSize: number;
};

export type SourceHistoryOptions = false | SourceHistoryConfig;

/**
 * Render key => value 映射关系
 */
export type RenderMap = Partial<{
  point: PointRender;
  line: any;
  polygon: any;
  midPoint: any;
  dashLine: any;
  text: any;
  // point?: PointRender;
  // line?: LineRender;
  // polygon?: PolygonRender;
  // midPoint?: PointRender;
  // dashLine?: LineRender;
  // text?: TextRender;
}>;

/**
 * Source构造器中传输的配置
 */
export interface SourceOptions {
  data?: Partial<SourceData>;
  render: RenderMap;
  history: SourceHistoryOptions;
}
