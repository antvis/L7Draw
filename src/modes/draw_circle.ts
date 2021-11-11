import {
  bindAll,
  IInteractionTarget,
  ILayer,
  ILngLat,
  PointLayer,
  Scene,
} from '@antv/l7';
import {
  Feature,
  featureCollection,
  Geometries,
  Geometry,
  GeometryCollection,
  lineString,
  Properties,
} from '@turf/helpers';
import BaseRenderLayer from '../render/base_render';
import DrawRulerLayer from '../render/draw_ruler';
import { DrawEvent, DrawModes, unitsType } from '../util/constant';
import { createCircle, createPoint } from '../util/create_geometry';
import moveFeatures, { movePoint } from '../util/move_features';
import DrawFeature, { IDrawFeatureOption } from './draw_feature';
import { IMeasureable } from './IMeasureable';
export default class DrawCircle extends DrawFeature implements IMeasureable {
  protected startPoint: ILngLat;
  protected endPoint: ILngLat;
  protected pointFeatures: Feature[];
  protected centerLayer: ILayer;
  drawRulerLayer: BaseRenderLayer;

  constructor(scene: Scene, options: Partial<IDrawFeatureOption> = {}) {
    super(scene, options);
    bindAll(['onMeasure'], this);

    this.type = 'circle';
    this.on(DrawEvent.MODE_CHANGE, this.addDistanceLayerEvent);
    this.setDrawMode(DrawModes.DRAW_Circle);

    this.drawRulerLayer = new DrawRulerLayer(this);
    // this.enableMeasure();
  }

  onMeasure(feature: Feature<Geometry | GeometryCollection, Properties>): void {
    this.drawRulerLayer.update(featureCollection([feature]));
  }
  enableMeasure(): void {
    this.measureMode.on(DrawEvent.MEASURE, this.onMeasure);
  }
  disableMeasure(): void {
    this.measureMode.off(DrawEvent.MEASURE, this.onMeasure);
  }

  public drawFinish() {
    return null;
  }

  private addDistanceLayerEvent(mode: DrawModes[any]) {
    switch (mode) {
      case DrawModes.SIMPLE_SELECT:
        this.drawDistanceLayer.update(this.getDistanceLineString());
        this.drawDistanceLayer.show();
        break;
      case DrawModes.STATIC:
        this.drawDistanceLayer.hide();
        break;
    }
  }

  private getDistanceLineString() {
    return featureCollection([
      lineString([
        [this.startPoint.lng, this.startPoint.lat],
        [this.endPoint.lng, this.endPoint.lat],
      ]),
    ]);
  }

  public setCurrentFeature(feature: Feature) {
    this.currentFeature = feature as Feature;
    // @ts-ignore
    this.pointFeatures = feature.properties.pointFeatures;
    // @ts-ignore
    this.startPoint = feature.properties.startPoint;
    // @ts-ignore
    this.endPoint = feature.properties.endPoint;
    this.source.setFeatureActive(feature);
  }

  public removeLatestVertex() {
    return null;
  }

  protected getDefaultOptions(): Partial<IDrawFeatureOption> {
    return {
      ...super.getDefaultOptions(),
      title: '绘制圆',
    };
  }

  protected onDragStart(e: IInteractionTarget) {
    if (this.drawStatus !== 'Drawing') {
      this.drawLayer.emit('unclick', null);
    }
    this.startPoint = e.lngLat;
    this.setCursor('grabbing');
    this.initCenterLayer();
    this.centerLayer.setData([this.startPoint]);
  }

  protected onDragging(e: IInteractionTarget) {
    this.endPoint = e.lngLat;
    const feature = this.createFeature() as Feature<Geometries, Properties>;

    const properties = feature.properties as { pointFeatures: Feature[] };
    this.drawLayer.update(featureCollection([feature]));
    this.drawVertexLayer.update(featureCollection(properties.pointFeatures));
    this.drawDistanceLayer.update(this.getDistanceLineString());
  }

  protected onDragEnd() {
    const feature = this.createFeature(`${this.getUniqId()}`);
    const properties = feature.properties as { pointFeatures: Feature[] };
    this.drawLayer.update(featureCollection([feature]));
    this.drawVertexLayer.update(featureCollection(properties.pointFeatures));
    this.drawDistanceLayer.update(this.getDistanceLineString());

    this.emit(DrawEvent.CREATE, this.currentFeature);
    this.emit(DrawEvent.MODE_CHANGE, DrawModes.SIMPLE_SELECT);
    this.disable();
  }

  protected moveFeature(delta: ILngLat): void {
    const newFeature = moveFeatures([this.currentFeature as Feature], delta);
    const newPointFeture = moveFeatures(this.pointFeatures, delta);
    this.drawLayer.updateData(featureCollection(newFeature));
    this.drawVertexLayer.updateData(featureCollection(newPointFeture));
    this.drawDistanceLayer.update(this.getDistanceLineString());
    const newStartPoint = movePoint(
      [this.startPoint.lng, this.startPoint.lat],
      delta,
    );
    this.startPoint = {
      lat: newStartPoint[1],
      lng: newStartPoint[0],
    };
    const newEndPoint = movePoint(
      [this.endPoint.lng, this.endPoint.lat],
      delta,
    );
    const endPointObj = {
      lat: newEndPoint[1],
      lng: newEndPoint[0],
    };
    newFeature[0].properties = {
      ...newFeature[0].properties,
      startPoint: this.startPoint,
      endPoint: endPointObj,
      pointFeatures: newPointFeture,
    };
    this.centerLayer.setData([this.startPoint]);
    this.setCurrentFeature(newFeature[0]);
    const changeFeature = {
      ...newFeature[0],
    };
    this.emit(DrawEvent.CHANGE, changeFeature);
  }

  protected createFeature(id: string = '0'): Feature {
    const points = createPoint([this.endPoint]);
    const feature = createCircle(
      [this.startPoint.lng, this.startPoint.lat],
      [this.endPoint.lng, this.endPoint.lat],
      {
        pointFeatures: points.features,
        units: this.getOption('units'),
        steps: this.getOption('steps'),
        id,
      },
    );

    this.setCurrentFeature(feature as Feature);
    return feature;
  }

  protected editFeature(endPoint: ILngLat): void {
    this.endPoint = endPoint;
    const newFeature = this.createFeature();
    const properties = newFeature.properties as { pointFeatures: Feature[] };
    this.drawLayer.updateData(featureCollection([newFeature]));
    this.drawVertexLayer.updateData(
      featureCollection(properties.pointFeatures),
    );
    this.drawDistanceLayer.update(this.getDistanceLineString());

    this.emit(DrawEvent.CHANGE, featureCollection([newFeature]).features[0]);
  }

  protected showOtherLayer() {
    this.drawDistanceLayer.show();
    if (!this.centerLayer) {
      this.initCenterLayer();
    }
    this.centerLayer.setData([this.currentFeature?.properties?.startPoint]);
    this.centerLayer.show();
  }

  protected hideOtherLayer() {
    if (this.currentFeature) {
      this.centerLayer.hide();
      this.drawDistanceLayer.hide();
    }
  }

  protected initCenterLayer() {
    const centerStyle = this.getStyle('active').point;
    const layer = new PointLayer()
      .source([this.startPoint], {
        parser: {
          type: 'json',
          x: 'lng',
          y: 'lat',
        },
      })
      .shape('circle')
      .color(centerStyle.color)
      .size(centerStyle.size)
      .style(centerStyle.style);
    this.scene.addLayer(layer);

    this.centerLayer = layer;
  }
}
