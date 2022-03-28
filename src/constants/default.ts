import {
  ICursor,
  IMidPointStyleItem,
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
  size: 5,
  borderColor: '#ffffff',
  borderWidth: 1,
};

export const DEFAULT_POINT_HOVER_STYLE: IPointStyleItem = {
  ...DEFAULT_POINT_NORMAL_STYLE,
  size: 7,
  borderWidth: 2,
};

export const DEFAULT_POINT_ACTIVE_STYLE: IPointStyleItem = {
  ...DEFAULT_POINT_HOVER_STYLE,
  color: ACTIVE_COLOR,
};

export const DEFAULT_MID_POINT_STYLE: IMidPointStyleItem = {
  shape: 'circle',
  size: 2,
  color: '#ff0000',
  borderColor: ACTIVE_COLOR,
  borderWidth: 1,
};

export const DEFAULT_NODE_STYLE: IPointStyle = {
  normal: {
    ...DEFAULT_POINT_NORMAL_STYLE,
    color: ACTIVE_COLOR,
  },
  hover: {
    ...DEFAULT_POINT_HOVER_STYLE,
    color: ACTIVE_COLOR,
  },
  active: DEFAULT_POINT_ACTIVE_STYLE,
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
    dash: false,
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
    hover: DEFAULT_MID_POINT_STYLE,
    active: DEFAULT_MID_POINT_STYLE,
  },
  dashLine: {
    normal: {
      color: ACTIVE_COLOR,
      size: 2,
    },
    hover: {
      color: ACTIVE_COLOR,
      size: 2,
    },
    active: {
      color: ACTIVE_COLOR,
      size: 2,
    },
    dash: true,
  },
};

export const DEFAULT_CURSOR_MAP: ICursor = {
  draw: 'crosshair',
  move: 'move',
  pointer: 'pointer',
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
