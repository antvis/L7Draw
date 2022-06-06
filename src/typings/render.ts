import { IBaseStyle } from './style';

export type IRenderType =
  | 'point'
  | 'line'
  | 'polygon'
  | 'midPoint'
  | 'dashLine'
  | 'text';

export interface IRenderOptions<S extends IBaseStyle> {
  style: S;
}
