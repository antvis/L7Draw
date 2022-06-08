import { IDistanceOptions } from '../typings';

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
