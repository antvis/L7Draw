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
