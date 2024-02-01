import { Feature, MultiPoint, Point } from '@turf/turf';

export const pointList: Feature<Point>[] = [
  {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [120.103666, 30.262449],
    },
  },
  {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [120.12, 30.262449],
    },
  },
];

export const multiPointList: Feature<MultiPoint>[] = [
  {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPoint',
      coordinates: [
        [119.99837899999996, 30.155454000000002],
        [119.99837899999996, 30.328756999999992],
        [120.282943, 30.328756999999992],
        [120.282943, 30.155454000000002],
      ],
    },
  },
];
