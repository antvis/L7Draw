import {
  Feature,
  FeatureCollection,
  featureCollection,
  lineString,
} from '@turf/helpers';

import BaseRender from './base_render';
import Draw from '../modes/draw_feature';
import RenderFeature from './renderFeature';
import { isLineString, isPolygon } from '../util/typeguards';
import { IRenderStrategy } from './strategy';
import { bindAll, ILngLat, LineLayer, PolygonLayer, Popup } from '@antv/l7';
import { Singleton } from '../util/singleton';
import { getArea, getDistance } from '@/util/measurements';

const rf = new RenderFeature();

class CustomRenderPolygonStrategy extends Singleton implements IRenderStrategy {
  styleVariant = 'polygon';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];

    const fill = new PolygonLayer()
      .source(fe)
      .shape('fill')
      .color(style.color)
      .style({
        opacity: style.style.opacity,
      })
      .active(style.active);

    const feature = fe.features[0];

    let lineStrings: any = [];

    if (isPolygon(feature)) {
      const coords = feature.geometry.coordinates[0];

      lineStrings = featureCollection(
        coords
          .map((coord, index) => {
            if (!coords[index + 1]) return;
            return lineString([coord, coords[index + 1]]);
          })
          .filter(Boolean) as any,
      );
    }

    const lineStyle = styles['line'];

    const line = new LineLayer({ pickingBuffer: 3 })
      .source(lineStrings)
      .color(lineStyle.style.stroke)
      .size(lineStyle.style.strokeWidth)
      .style({
        opacity: lineStyle.style.strokeOpacity,
        lineType: lineStyle.style.lineType,
        dashArray: lineStyle.style.dashArray,
      })
      .active(lineStyle.active);

    line.setBlend('max');
    return [fill, line];
  }
}

class CustomRenderLineStrategy extends Singleton implements IRenderStrategy {
  styleVariant = 'line';

  execute(fe: FeatureCollection, styles: any) {
    const style = styles[this.styleVariant];
    const feature = fe.features[0];

    let lineStrings: any = [];
    if (isLineString(feature)) {
      const coords = feature.geometry.coordinates;

      lineStrings = featureCollection(
        coords
          .map((coord, index) => {
            if (!coords[index + 1]) return;
            return lineString([coord, coords[index + 1]]);
          })
          .filter(Boolean) as any,
      );
    }

    const line = new LineLayer({ pickingBuffer: 5 })
      .source(lineStrings)
      .color(style.style.stroke)
      .size(style.style.strokeWidth)
      .style({
        opacity: style.style.strokeOpacity,
        lineType: style.style.lineType,
        dashArray: style.style.dashArray,
      })
      .active(style.active);

    line.setBlend('max');

    return [line];
  }
}

rf.setStrategy(CustomRenderPolygonStrategy.getInstance(), 'Polygon');
rf.setStrategy(CustomRenderLineStrategy.getInstance(), 'LineString');

export default class DrawRulerLayer extends BaseRender {
  styleVariant = 'ruler';
  popup: Popup;
  currentFeature: Feature;

  constructor(draw: Draw) {
    super(draw);
    this.popup = new Popup({
      closeButton: false,
      anchor: 'left',
      closeOnClick: false,
    });
    this.draw.scene.addPopup(this.popup);

    bindAll(['onMouseEnter', 'onMouseOut'], this);
  }

  public update(fc: FeatureCollection) {
    if (fc.features.length === 0) {
      return;
    }

    this.removeLayers();

    const feature = fc.features[0];
    const style = this.draw.getStyle(this.styleVariant);
    this.drawLayers = rf.renderFeature(featureCollection([feature]), style);
    this.drawLayers.forEach(layer => {
      layer.on('mouseout', this.onMouseOut);
      layer.on('mouseenter', this.onMouseEnter);
    });

    this.addLayers();
  }

  public onMouseEnter(e: any) {
    const lngLat: ILngLat = e.lngLat || e.lnglat;
    const feature: Feature = e.feature;
    let popupContent: string = '';
    if (isLineString(feature)) {
      const coords = feature.geometry.coordinates;
      popupContent = getDistance(coords[0], coords[1]);
    }
    if (isPolygon(feature)) {
      popupContent = getArea(feature.geometry);
    }

    this.popup.open();
    this.popup.setLnglat(lngLat);
    this.popup.setText(popupContent || '');
  }
  public onMouseOut(e: any) {
    this.popup.close();
  }
}
