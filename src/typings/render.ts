export interface IBaseStyle {
  color: string;
}

export interface IPointStyle extends IBaseStyle {
  size: number;
  innerSize: number;
  innerColor: string;
}

export interface ILineStyle extends IBaseStyle {
  size: number;
  dashed: boolean;
}

export interface IPolygonStyle extends IBaseStyle {}

export type IStyle = {
  point: IPointStyle;
  line: ILineStyle;
  polygon: IPolygonStyle;
};

export type IStyleType = keyof IStyle;
