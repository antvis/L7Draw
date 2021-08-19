import {
  Feature,
  FeatureCollection,
  LineString,
  featureCollection,
  Geometries,
} from '@turf/helpers';

import BaseRender from './base_render';
import midPoint from '@turf/midpoint';
import RenderFeature from './renderFeature';
import { isLineString } from '../util/typeguards';
import { getDistance } from '../util/measurements';

const rf = RenderFeature.defaultRenderer();

export default class DrawDistanceLayer extends BaseRender {
  /**
   * 是否单独画指示线段
   */
  showLine: true;

  public update(fc: FeatureCollection) {
    if (!fc.features.every(isLineString))
      throw new Error(
        'All features must be LineString in order to calculate distance.',
      );

    this.removeLayers();

    const distanceFeatures = fc.features.map((feature: Feature<LineString>) => {
      const x = feature?.geometry?.coordinates[0];
      const y = feature?.geometry?.coordinates[1];

      const distance = getDistance(x, y);

      const mid = midPoint(x, y);

      //@ts-ignore
      mid.properties.value = distance;

      return mid;
    });

    const style = this.draw.getStyle('active');
    this.drawLayers = rf.renderFeature(
      featureCollection(distanceFeatures as any[]),
      style,
    );

    if (this.showLine) {
      this.drawLayers.push(...rf.renderFeature(fc, style));
    }

    this.addLayers();
  }
}
