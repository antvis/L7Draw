import { IDrawerCursor, IDrawerStyle } from '../typings';

export const DEFAULT_COLOR = '#1990FF';

export const DEFAULT_DRAWER_STYLE: IDrawerStyle = {
  point: {
    color: DEFAULT_COLOR,
    size: 6,
    innerColor: '#ffffff',
    innerSize: 3,
  },
  line: {
    color: DEFAULT_COLOR,
    size: 2,
    dashed: false,
  },
  polygon: {
    color: DEFAULT_COLOR,
  },
};

export const DEFAULT_CURSOR_MAP: IDrawerCursor = {
  draw: 'crosshair',
  move: 'move',
};
