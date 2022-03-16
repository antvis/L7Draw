import { IStyle } from './render';

export type ICursorType = 'draw' | 'move' | 'pointer';

export type ICursor = Record<ICursorType, string>;

export interface IDrawerOptions {
  style: IStyle;
  cursor: ICursor;
  editable: boolean;
}
