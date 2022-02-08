import { IDrawerCursor, IDrawerStyle } from '../typings';

export const DEFAULT_DRAWER_STYLE: IDrawerStyle = {
  point: {},
  line: {},
  polygon: {},
};

export const DEFAULT_CURSOR_MAP: IDrawerCursor = {
  draw: 'crosshair',
  move: 'move',
};
