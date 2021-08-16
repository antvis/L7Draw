import turfDistance from '@turf/distance';
import turfArea from '@turf/area';
import { Coord, Point, Polygon } from '@turf/helpers';

export const getDistance = (x: Coord | Point, y: Coord | Point) => {
  return turfDistance(x, y, { units: 'kilometers' }).toFixed(2) + 'km';
};

export const getArea = (polygon: Polygon) => {
  return turfArea(polygon).toFixed(2) + 'km^2';
};
