export type IPointHelperOptions = {
  draw: string;
  pointHover: string;
  pointDrag: string;
};

export type ILineHelperOptions = IPointHelperOptions & {
  lineHover: string;
  lineDrag: string;
  midPointHover: string;
  drawFinish: string;
};

export type IPolygonHelperOptions = ILineHelperOptions & {
  polygonHover: string;
  polygonDrag: string;
};

// export type IDragHelperOptions = {
//   dragStart: string;
//   dragEnd: string;
// };

// export type IRectHelperOptions = IPolygonHelperOptions & IDragHelperOptions;
//
// export type ICircleHelperOptions = IPolygonHelperOptions & IDragHelperOptions;
