import {
  Feature,
  FeatureCollection,
  LineString,
  featureCollection,
  Polygon,
} from '@turf/helpers';

import BaseRender from './base_render';
import RenderFeature from './renderFeature';
import { isPolygon } from '../util/typeguards';
import { area, centerOfMass, Point } from '@turf/turf';

const rf = RenderFeature.defaultRenderer();

export default class DrawAreaLayer extends BaseRender {
  /**
   * 是否单独画指示线段
   */
  public showLine = true;

  public formatArea = (area: number) => {
    if (area < Math.pow(10, 4)) {
      return area.toFixed(2) + 'm²';
    }
    return (area / Math.pow(10, 4)).toFixed(2) + 'km²';
  };

  public update(fc: FeatureCollection) {
    if (!fc.features.every(isPolygon)) {
      throw new Error(
        'All features must be Polygon in order to calculate area.',
      );
    }

    this.removeLayers();
    const style = this.draw.getStyle('active');

    const areaFeatureList = fc.features.map(
      (polygonFeature: Feature<Polygon>) => {
        const centerPoint = centerOfMass(polygonFeature);
        const polygonArea = area(polygonFeature);

        centerPoint.properties = {
          ...centerPoint.properties,
          value: this.formatArea(polygonArea),
        };

        return centerPoint;
      },
    );

    this.drawLayers = rf.renderFeature(
      featureCollection(areaFeatureList as Feature<Point>[]),
      style,
    );

    if (this.showLine) {
      this.drawLayers.push(...rf.renderFeature(fc, style));
    }

    this.addLayers();
  }
}
