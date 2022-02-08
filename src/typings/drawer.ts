export interface IPointStyle {
  size: number;
  color: string;
  innerSize: number;
  innerColor: string;
}

export interface ILineStyle {
  size: number;
  color: string;
  dashed: boolean;
}

export interface IPolygonStyle {
  color: string;
}

export interface ITextStyle {}

export type IDrawerStyle = {
  point: IPointStyle;
  line: ILineStyle;
  polygon: IPolygonStyle;
};

export type IDrawerStyleType = keyof IDrawerStyle;

export type IDrawerCursorType = 'draw' | 'move';

export type IDrawerCursor = Record<IDrawerCursorType, string>;

export interface IDrawerOptions {
  style: IDrawerStyle;
  activeStyle: IDrawerStyle;
  cursor: IDrawerCursor;
}
