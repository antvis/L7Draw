import {
  HistoryConfig,
  IAreaOptions,
  IDistanceOptions,
  KeyBoardConfig,
} from '../typings';

export const DEFAULT_DISTANCE_OPTIONS: IDistanceOptions = {
  total: false,
  showOnDash: true,
  showOnActive: true,
  showOnNormal: true,
  format: (meters) => {
    if (meters >= 1000) {
      return +(meters / 1000).toFixed(2) + 'km';
    } else {
      return +meters.toFixed(2) + 'm';
    }
  },
};

export const DEFAULT_AREA_OPTIONS: IAreaOptions = {
  showOnNormal: true,
  showOnActive: true,
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
