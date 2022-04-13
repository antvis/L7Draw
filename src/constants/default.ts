import {
  ICursor,
  IPointStyle,
  IPointStyleItem,
  IRenderType,
  IStyle,
} from '../typings';
import { LineRender, PointRender, PolygonRender } from '../render';

export const DEFAULT_COLOR = '#1990FF';

export const ACTIVE_COLOR = '#ED9D48';

export const DEFAULT_POINT_NORMAL_STYLE: IPointStyleItem = {
  color: DEFAULT_COLOR,
  shape: 'circle',
  size: 6,
  borderColor: '#ffffff',
  borderWidth: 2,
};

export const DEFAULT_POINT_HOVER_STYLE: IPointStyleItem = {
  ...DEFAULT_POINT_NORMAL_STYLE,
  size: 8,
};

export const DEFAULT_POINT_ACTIVE_STYLE: IPointStyleItem = {
  ...DEFAULT_POINT_HOVER_STYLE,
  color: ACTIVE_COLOR,
};

export const DEFAULT_MID_POINT_STYLE: IPointStyleItem = {
  shape: 'circle',
  size: 6,
  color: ACTIVE_COLOR,
  borderColor: '#ffffff',
  borderWidth: 0,
};

export const DEFAULT_NODE_STYLE: IPointStyle = {
  normal: {
    ...DEFAULT_POINT_NORMAL_STYLE,
    color: ACTIVE_COLOR,
  },
  hover: {
    ...DEFAULT_POINT_NORMAL_STYLE,
    color: ACTIVE_COLOR,
  },
  active: {
    ...DEFAULT_POINT_NORMAL_STYLE,
    color: ACTIVE_COLOR,
  },
};

export const DEFAULT_DRAWER_STYLE: IStyle = {
  point: {
    normal: DEFAULT_POINT_NORMAL_STYLE,
    hover: DEFAULT_POINT_HOVER_STYLE,
    active: DEFAULT_POINT_ACTIVE_STYLE,
  },
  line: {
    normal: {
      color: DEFAULT_COLOR,
      size: 2,
    },
    hover: {
      color: DEFAULT_COLOR,
      size: 2,
    },
    active: {
      color: ACTIVE_COLOR,
      size: 2,
    },
    style: {},
  },
  polygon: {
    normal: {
      color: DEFAULT_COLOR,
    },
    hover: {
      color: DEFAULT_COLOR,
    },
    active: {
      color: DEFAULT_COLOR,
    },
  },
  midPoint: {
    normal: DEFAULT_MID_POINT_STYLE,
  },
  dashLine: {
    normal: {
      color: ACTIVE_COLOR,
      size: 2,
    },
    style: {
      lineType: 'dash',
      dashArray: [6, 6],
    },
  },
};

export const DEFAULT_CURSOR_MAP: ICursor = {
  draw: 'crosshair',
  pointHover: 'pointer',
  pointDrag: 'move',
  lineHover: 'pointer',
  lineDrag: 'move',
  polygonHover: 'pointer',
  polygonDrag: 'move',
};

export const RENDER_TYPE_MAP: Record<
  IRenderType,
  typeof PolygonRender | typeof LineRender | typeof PointRender
> = {
  point: PointRender,
  line: LineRender,
  polygon: PolygonRender,
  midPoint: PointRender,
  dashLine: LineRender,
};
