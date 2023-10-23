import { IControlOption } from '@antv/l7';
import { DeepPartial, IBaseModeOptions } from '../typings';
import {
  ICircleDrawerOptions,
  ILineDrawerOptions,
  IPointDrawerOptions,
  IPolygonDrawerOptions,
  IRectDrawerOptions,
} from '../drawer';

export type DrawType = 'point' | 'line' | 'polygon' | 'rect' | 'circle';

export type BtnType = DrawType | 'clear';

export type DrawBtnConfig = Record<
  // 当 key 为 BtnType 时，展示的是内置按钮，当 key 为 string 时，展示的是自定义按钮
  BtnType | string,
  | boolean
  | (DeepPartial<
      | IPointDrawerOptions
      | ILineDrawerOptions
      | IPolygonDrawerOptions
      | IRectDrawerOptions
      | ICircleDrawerOptions
    > & {
      order?: number;
    })
  | { button?: HTMLElement; order?: number }
>;

export interface IDrawControlProps extends IControlOption {
  drawConfig: DrawBtnConfig;
  commonDrawOptions?: DeepPartial<IBaseModeOptions>;
  defaultActiveType?: DrawType;
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  style?: string;
}
