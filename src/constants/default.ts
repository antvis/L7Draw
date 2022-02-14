import { ICursor, IRenderType, IStyle } from '../typings';
import { LineRender, PointRender, PolygonRender } from '../render';

export const DEFAULT_COLOR = '#1990FF';

export const DEFAULT_DRAWER_STYLE: IStyle = {
  point: {
    normal: {
      color: DEFAULT_COLOR,
      shape: 'circle',
      size: 4,
      borderColor: '#ffffff',
      borderWidth: 2,
    },
    active: {
      color: DEFAULT_COLOR,
      shape: 'circle',
      size: 6,
      borderColor: '#ffffff',
      borderWidth: 2,
    },
  },
  line: {
    normal: {
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
