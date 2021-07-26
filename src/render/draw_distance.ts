import {
  Feature,
  FeatureCollection,
  LineString,
  featureCollection,
} from '@turf/helpers';

import turfDistance from '@turf/distance';
import { DrawEvent, DrawModes } from '../util/constant';
import BaseRender from './base_render';
import midPoint from '@turf/midpoint';
import { renderFeature } from './renderFeature';

const isLineString = (feature: Feature): feature is Feature<LineString> => {
  return feature.geometry.type === 'LineString';
};

export default class DrawDistanceLayer extends BaseRender {
  public update(fc: FeatureCollection) {
    if (!fc.features.every(isLineString))
      throw new Error(
        'All features must be LineString in order to calculate distance.',
      );

    this.removeLayers();

    const distanceFeatures = fc.features.map(feature => {
      const x = feature.geometry.coordinates[0];
      const y = feature.geometry.coordinates[1];

      const distance =
        turfDistance(x, y, { units: 'kilometers' }).toFixed(2) + 'km';

      const mid = midPoint(x, y);

      //@ts-ignore
      mid.properties.value = distance;
      return mid;
    });

    const style = this.draw.getStyle('active');
    this.drawLayers = renderFeature(
      featureCollection(distanceFeatures as any[]),
      style,
    ).concat(renderFeature(fc, style));

    this.addLayers();
  }
}
