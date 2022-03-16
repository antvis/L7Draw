import {
  ICursor,
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
      dashed: false,
    },
    hover: {
      color: DEFAULT_COLOR,
      size: 2,
      dashed: false,
    },
    active: {
      color: DEFAULT_COLOR,
      size: 2,
      dashed: false,
    },
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
};
