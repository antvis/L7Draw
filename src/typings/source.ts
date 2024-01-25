import { Scene } from '@antv/l7';
import {
  DashLineRender,
  LineRender,
  MidPointRender,
  PointRender,
  PolygonRender,
  TextRender,
} from '../render';
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

export type HistoryConfig = {
  maxSize: number;
};

/**
 * Render key => value 映射关系
 */
export type RenderMap = Partial<{
  point: PointRender;
  line: LineRender;
  polygon: PolygonRender;
  midPoint: MidPointRender;
  dashLine: DashLineRender;
  text: TextRender;
}>;

/**
 * Source构造器中传输的配置
 */
export interface SourceOptions {
  data?: Partial<SourceData>;
  render: RenderMap;
  history?: HistoryConfig;
  scene: Scene;
  bbox: boolean;
}
