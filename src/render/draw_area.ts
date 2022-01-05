import { Feature, FeatureCollection, featureCollection } from '@turf/helpers';

import BaseRender from './base_render';
import RenderFeature from './renderFeature';
import { isPolygon } from '../util/typeguards';
import { getArea } from '../util/measurements';
import { Polygon } from '@turf/turf';
import centerOfMass from '@turf/center-of-mass';

const rf = RenderFeature.defaultRenderer();

export default class DrawAreaLayer extends BaseRender {
  public showArea = true;
  /**
   * 是否单独画指示面积
   */
  public update(fc: FeatureCollection) {
    if (!fc.features.every(isPolygon))
      throw new Error(
        'All features must be LineString in order to calculate distance.',
      );

    this.removeLayers();

    const areaFeatures = fc.features.map((feature: Feature<Polygon>) => {
      return centerOfMass(feature, {
        properties: {
          value: getArea(feature.geometry),
        },
      });
    });

    const style = this.draw.getStyle('active');
    this.drawLayers = rf.renderFeature(
      featureCollection(areaFeatures as any[]),
      style,
    );

    if (this.showArea) {
      this.drawLayers.push(...rf.renderFeature(fc, style));
    }

    this.addLayers();
  }
}
