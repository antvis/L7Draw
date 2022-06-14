import {
  IAreaOptions,
  IDistanceOptions,
  SourceHistoryConfig,
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
  format: (squareMeters: number) => {
    return squareMeters > 1000000
      ? `${+(squareMeters / 1000000).toFixed(2)}km²`
      : `${+squareMeters.toFixed(2)}m²`;
  },
  showOnNormal: true,
  showOnActive: true,
};

export const DEFAULT_HISTORY_CONFIG: SourceHistoryConfig = {
  revertKeys: ['command+z', 'ctrl+z'],
  redoKeys: ['command+shift+z', 'ctrl+shift+z'],
  maxSize: 100,
};
