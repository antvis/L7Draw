export type IDrawerStyleType = 'point' | 'line' | 'polygon';

export type IDrawerStyle = Record<IDrawerStyleType, any>;

export type ICursorType = 'draw' | 'move';

export type IDrawerCursor = Record<ICursorType, string>;

export interface IDrawerOptions {
  style: IDrawerStyle;
  activeStyle: IDrawerStyle;
  cursor: IDrawerCursor;
}
