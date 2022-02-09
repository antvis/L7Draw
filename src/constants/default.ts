import { ICursor, IStyle } from '../typings';

export const DEFAULT_COLOR = '#1990FF';

export const DEFAULT_DRAWER_STYLE: IStyle = {
  point: {
    normal: {
      color: DEFAULT_COLOR,
      size: 6,
      innerColor: '#ffffff',
      innerSize: 3,
    },
    active: {
      color: DEFAULT_COLOR,
      size: 6,
      innerColor: '#ffffff',
      innerSize: 3,
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
};
