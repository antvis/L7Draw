import { BaseRender } from './BaseRender';
import { IPolygonFeature, IPolygonStyle } from '../typings';
import { ILayer, PolygonLayer } from '@antv/l7';
import { featureCollection } from '@turf/turf';

export class PolygonRender extends BaseRender<IPolygonFeature, IPolygonStyle> {
  initLayers(): ILayer[] {
    const { normal, hover, active, style } = this.style;
    const polygonLayer = new PolygonLayer({
      blend: 'normal',
    });

    polygonLayer
      .source(featureCollection([]))
      .color('isHover*isActive', (isHover: boolean, isActive: boolean) => {
        return isActive ? active.color : isHover ? hover.color : normal.color;
      })
      .style(style);

    return [polygonLayer];
  }
}
