import { IStyle } from './render';
import { ISourceData } from './source';

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
  data?: Partial<ISourceData>;
  editable: boolean;
  autoFocus: boolean;
}
