import { ILayerConfig } from '@antv/l7';
import {
  IPointStyle,
  IPointStyleItem,
  IStyle,
  ITextStyleItem,
} from '../typings';

export const NORMAL_COLOR = '#1990FF';

export const ACTIVE_COLOR = '#ED9D48';

export const DEFAULT_COMMON_OPTIONS: Partial<ILayerConfig> = {
  blend: 'normal',
  pickingBuffer: 5,
};

export const DEFAULT_POINT_NORMAL_STYLE: IPointStyleItem = {
  color: NORMAL_COLOR,
  shape: 'circle',
  size: 6,
};

export const DEFAULT_NODE_NORMAL_STYLE: IPointStyleItem = {
  color: ACTIVE_COLOR,
  shape: 'circle',
  size: 6,
};

export const DEFAULT_MID_POINT_STYLE: IPointStyleItem = {
  shape: 'circle',
  size: 6,
  color: ACTIVE_COLOR,
};

export const DEFAULT_POINT_STYLE: IPointStyle = {
  options: DEFAULT_COMMON_OPTIONS,
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
  style: {
    stroke: '#ffffff',
    strokeWidth: 2,
  },
};

export const DEFAULT_NODE_STYLE: IPointStyle = {
  options: DEFAULT_COMMON_OPTIONS,
  normal: DEFAULT_NODE_NORMAL_STYLE,
  hover: {
    ...DEFAULT_NODE_NORMAL_STYLE,
    size: 8,
  },
  active: {
    ...DEFAULT_NODE_NORMAL_STYLE,
    size: 8,
  },
  style: {
    stroke: '#ffffff',
    strokeWidth: 2,
  },
};

export const DEFAULT_TEXT_NORMAL_STYLE: ITextStyleItem = {
  color: NORMAL_COLOR,
  size: 12,
};

export const DEFAULT_STYLE: IStyle = {
  point: DEFAULT_NODE_STYLE,
  line: {
    options: DEFAULT_COMMON_OPTIONS,
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
    options: DEFAULT_COMMON_OPTIONS,
    normal: {
      color: NORMAL_COLOR,
    },
    hover: {
      color: NORMAL_COLOR,
    },
    active: {
      color: ACTIVE_COLOR,
    },
    style: {
      opacity: 0.15,
    },
  },
  midPoint: {
    options: DEFAULT_COMMON_OPTIONS,
    normal: DEFAULT_MID_POINT_STYLE,
  },
  dashLine: {
    options: DEFAULT_COMMON_OPTIONS,
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
    options: DEFAULT_COMMON_OPTIONS,
    normal: DEFAULT_TEXT_NORMAL_STYLE,
    active: {
      ...DEFAULT_TEXT_NORMAL_STYLE,
      color: ACTIVE_COLOR,
    },
    style: {
      fontWeight: '800',
      textOffset: [0, DEFAULT_TEXT_NORMAL_STYLE.size + 6],
      textAllowOverlap: true,
      stroke: '#ffffff',
      strokeWidth: 2,
    },
  },
};
