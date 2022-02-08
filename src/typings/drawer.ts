import { IStyle } from './render';

export type ICursorType = 'draw' | 'move';

export type ICursor = Record<ICursorType, string>;

export interface IDrawerOptions {
  style: IStyle;
  activeStyle: IStyle;
  cursor: ICursor;
}
