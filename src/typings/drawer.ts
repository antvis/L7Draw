import { IStyle } from './render';

export type ICursorType =
  | 'draw'
  | 'pointHover'
  | 'pointDrag'
  | 'lineHover'
  | 'lineDrag'
  | 'polygonHover'
  | 'polygonDrag';

export type ICursor = Record<ICursorType, string>;

export interface IDrawerOptions {
  style: IStyle;
  cursor: ICursor;
  editable: boolean;
  autoFocus: boolean;
}
