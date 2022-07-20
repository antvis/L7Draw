import { IControlOption } from '@antv/l7';
import { DeepPartial, IBaseModeOptions } from '../typings';
import {
  IPointDrawerOptions,
  ILineDrawerOptions,
  IPolygonDrawerOptions,
  IRectDrawerOptions,
  ICircleDrawerOptions,
} from '../drawer';

export type DrawType = 'point' | 'line' | 'polygon' | 'rect' | 'circle';

export type BtnType = DrawType | 'clear';

export type DrawBtnConfig = {
  point?: boolean | DeepPartial<IPointDrawerOptions>;
  line?: boolean | DeepPartial<ILineDrawerOptions>;
  polygon?: boolean | DeepPartial<IPolygonDrawerOptions>;
  rect?: boolean | DeepPartial<IRectDrawerOptions>;
  circle?: boolean | DeepPartial<ICircleDrawerOptions>;
  clear?: boolean;
};

export interface IDrawControlProps extends IControlOption {
  drawConfig: DrawBtnConfig;
  commonDrawOptions?: DeepPartial<IBaseModeOptions>;
  defaultActiveType?: DrawType;
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  style?: string;
}
