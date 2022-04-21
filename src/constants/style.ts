import {IPointStyle, IPointStyleItem, IStyle} from '../typings';

export const NORMAL_COLOR = '#1990FF';

export const ACTIVE_COLOR = '#ED9D48';

export const DEFAULT_POINT_NORMAL_STYLE: IPointStyleItem = {
  color: NORMAL_COLOR,
  shape: 'circle',
  size: 6,
  borderColor: '#ffffff',
  borderWidth: 2,
};

export const DEFAULT_NODE_NORMAL_STYLE: IPointStyleItem = {
  color: ACTIVE_COLOR,
  shape: 'circle',
  size: 6,
  borderColor: '#ffffff',
  borderWidth: 2,
};

export const DEFAULT_MID_POINT_STYLE: IPointStyleItem = {
  shape: 'circle',
  size: 6,
  color: ACTIVE_COLOR,
  borderColor: '#ffffff',
  borderWidth: 0,
};

export const DEFAULT_POINT_STYLE: IPointStyle = {
  normal: DEFAULT_POINT_NORMAL_STYLE,
  hover: {
    ...DEFAULT_POINT_NORMAL_STYLE,
    size: 8,
  },
  active: {
    ...DEFAULT_POINT_NORMAL_STYLE,
    size: 8,
    color: ACTIVE_COLOR,
  },
};

export const DEFAULT_NODE_STYLE: IPointStyle = {
  normal: DEFAULT_NODE_NORMAL_STYLE,
  hover: {
    ...DEFAULT_NODE_NORMAL_STYLE,
    size: 8,
  },
  active: {
    ...DEFAULT_NODE_NORMAL_STYLE,
    size: 8,
  },
};

export const DEFAULT_DRAWER_STYLE: IStyle = {
  point: DEFAULT_NODE_STYLE,
  line: {
    normal: {
      color: NORMAL_COLOR,
      size: 2,
    },
    hover: {
      color: NORMAL_COLOR,
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
      color: NORMAL_COLOR,
    },
    hover: {
      color: NORMAL_COLOR,
    },
    active: {
      color: NORMAL_COLOR,
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
  text: {
    normal: {
      color: ACTIVE_COLOR,
      size: 14,
      borderColor: '#ffffff',
      borderWidth: 1,
    },
  },
};
