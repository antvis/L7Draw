import { ILineDrawerOptions } from '../drawer/line-drawer';
import {
  HistoryConfig,
  IAdsorbOptions,
  IAreaOptions,
  IDistanceOptions,
  KeyBoardConfig,
  PopupOptions,
} from '../typings';
import { followCursor } from 'tippy.js';

export const DEFAULT_DISTANCE_OPTIONS: IDistanceOptions = {
  showTotalDistance: false,
  showDashDistance: true,
  showWhen: ['normal', 'active'],
  format: (meters) => {
    if (meters >= 1000) {
      return +(meters / 1000).toFixed(2) + 'km';
    } else {
      return +meters.toFixed(2) + 'm';
    }
  },
};

export const DEFAULT_AREA_OPTIONS: IAreaOptions = {
  showWhen: ['normal', 'active'],
  format: (squareMeters: number) => {
    return squareMeters > 1000000
      ? `${+(squareMeters / 1000000).toFixed(2)}km²`
      : `${+squareMeters.toFixed(2)}m²`;
  },
};

export const DEFAULT_HISTORY_CONFIG: HistoryConfig = {
  maxSize: 100,
};

export const DEFAULT_KEYBOARD_CONFIG: KeyBoardConfig = {
  remove: ['del', 'backspace'],
  revert: ['command+z', 'ctrl+z'],
  redo: ['command+shift+z', 'ctrl+shift+z'],
};

export const DEFAULT_POPUP_CONFIG: PopupOptions = {
  allowHTML: true,
  followCursor: true,
  placement: 'bottom-start',
  offset: [-10, 20],
  plugins: [followCursor],
  trigger: 'manual',
  hideOnClick: false,
  theme: 'light',
};

export const DEFAULT_ADSORB_CONFIG: IAdsorbOptions = {
  data: 'drawData',
  pointAdsorbPixel: 12,
  lineAdsorbPixel: 10,
};

export const DEFAULT_DRAG_OPTIONS: ILineDrawerOptions['dragOptions'] = {
  dotDuration: 100,
  dotDistance: 30,
};
