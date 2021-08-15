import { bindAll, IInteractionTarget, ILayer, ILngLat, Scene } from '@antv/l7';
import {
  Feature,
  featureCollection,
  Geometries,
  Geometry,
  GeometryCollection,
  Position,
  Properties,
} from '@turf/helpers';

import DrawMidVertex from '../render/draw_mid_vertex';
import BaseRenderLayer from '../render/base_render';
import DrawRulerLayer from '../render/draw_ruler';
import { DrawEvent, DrawModes, unitsType } from '../util/constant';
import { createPoint, createPolygon } from '../util/create_geometry';
import moveFeatures from '../util/move_features';
import DrawFeature, { IDrawFeatureOption } from './draw_feature';
import { IMeasureable } from './IMeasureable';
export interface IDrawRectOption extends IDrawFeatureOption {
  units: unitsType;
  steps: number;
}
export default class DrawPolygon extends DrawFeature implements IMeasureable {
  protected startPoint: ILngLat;
  protected endPoint: ILngLat;
  protected points: ILngLat[] = [];
  protected pointFeatures: Feature[];
  protected drawMidVertexLayer: DrawMidVertex;

  drawRulerLayer: BaseRenderLayer;

  constructor(scene: Scene, options: Partial<IDrawRectOption> = {}) {
    super(scene, options);
    bindAll(['onMouseMove', 'onDblClick', 'onMeasure'], this);

    this.type = 'polygon';
    this.setDrawMode(DrawModes.DRAW_POLYGON);
    // 编辑态中心点图层
    this.drawMidVertexLayer = new DrawMidVertex(this);
    this.on(DrawEvent.MODE_CHANGE, this.addMidLayerEvent);
    this.on(DrawEvent.MODE_CHANGE, this.addDistanceLayerEvent);

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
    return featureCollection([]);
  }

  public enable() {
    super.enable();
    this.scene.on('mousemove', this.onMouseMove);
    this.scene.on('dblclick', this.onDblClick);
    // 关闭双击放大
  }

  public disable() {
    super.disable();
    this.scene.off('mousemove', this.onMouseMove);
    this.scene.off('dblclick', this.onDblClick);
  }

  public drawFinish(e?: any) {
    // debugger
    // this.points = this.points.reverse();
    const feature = this.createFeature([...this.points]);
    const properties = feature.properties as { pointFeatures: Feature[] };
    this.drawLayer.update(featureCollection([feature]));
    this.drawVertexLayer.update(featureCollection(properties.pointFeatures));
    // @ts-ignore
    this.emit(DrawEvent.CREATE, this.currentFeature);
    this.emit(DrawEvent.MODE_CHANGE, DrawModes.SIMPLE_SELECT);
    this.points = [];
    this.disable();
  }

  // 编辑时增加一个顶点
  public addVertex(vertex: Feature<Geometries, Properties>) {
    // @ts-ignore
    const id = vertex.properties.id;

    const coord = vertex?.geometry?.coordinates as Position;
    const [lng, lat] = coord;
    const feature = this.currentFeature as Feature<Geometries, Properties>;
    const type = feature?.geometry?.type;
    const points = [];
    if (type === 'Polygon') {
      const coords = feature?.geometry?.coordinates as Position[][];
      // 面的中心点数据上反的 ？
      coords[0].splice(id + 1, 0, coord);
      for (let i = 0; i < coords[0].length - 1; i++) {
        points.push({
          lng: coords[0][i][0],
          lat: coords[0][i][1],
        });
      }
    } else {
      // Line
      const coords = feature?.geometry?.coordinates as Position[];
      coords.splice(id + 1, 0, coord);
      for (const coor of coords) {
        points.push({
          lng: coor[0],
          lat: coor[1],
        });
      }
    }
    const pointfeatures = createPoint(points);
    this.pointFeatures = pointfeatures.features;
    this.drawLayer.updateData(featureCollection([feature]));
    this.drawVertexLayer.updateData(pointfeatures);
    this.drawMidVertexLayer.updateData(featureCollection(this.pointFeatures));
    // @ts-ignore
    feature.properties.pointFeatures = pointfeatures.features;
    this.setCurrentFeature(feature);
    this.emit(DrawEvent.ADD_POINT, { lng, lat }, points);
  }
  // 移除最后一个点

  public removeLatestVertex() {
    if (this.points.length < 2) {
      // 当Point小于两个点时，直接重置绘制
      this.resetDraw();
      return;
    }
    this.points.pop();
    //
    while (
      this.points.length !== 0 &&
      //@ts-ignore
      this.points[this.points.length - 1]?.type === 'custom'
    ) {
      this.points.pop();
    }
    const feature = this.createFeature(this.points);
    this.drawLayer.update(featureCollection([feature]));
    const pointfeatures = this.points.length ? [this.points[0]] : [];
    if (this.points.length > 1) {
      pointfeatures.push(this.points[this.points.length - 1]);
    }
    this.drawVertexLayer.update(
      featureCollection(createPoint(pointfeatures).features),
    );
    this.onDraw();
  }

  public resetDraw() {
    this.points = [];
    this.drawLayer.destroy();
    this.drawVertexLayer.destroy();
    this.drawMidVertexLayer.destroy();
    this.normalLayer.destroy();
    this.disable();
    this.enable();
    this.drawStatus = 'Drawing';
  }

  protected getDefaultOptions(): Partial<IDrawFeatureOption> {
    return {
      ...super.getDefaultOptions(),
      title: '绘制多边形',
    };
  }
  protected onDragStart(e: IInteractionTarget) {
    return null;
  }
  protected onDragging(e: IInteractionTarget) {
    return null;
  }

  protected onDragEnd() {
    return null;
  }

  private isEqualsPrePoint(lngLat: ILngLat): boolean {
    let pointLen = this.points.length;
    if (pointLen == 0) {
      return false;
    }
    let p = this.points[pointLen - 1];
    if (p.lat === lngLat.lat && p.lng === lngLat.lng) {
      return true;
    }
    return false;
  }

  protected async onClick(e: any) {
    if (!this.getDrawable()) {
      return;
    }
    if (this.drawStatus !== 'Drawing') {
      this.drawLayer.emit('unclick', null);
    }
    const lngLat = e.lngLat || e.lnglat;

    if (this.isEqualsPrePoint(lngLat)) {
      return;
    }
    const customDraw = this.getOption('customDraw');
    this.endPoint = lngLat;
    if (
      this.getOption('enableCustomDraw') &&
      customDraw &&
      this.points.length > 0
    ) {
      const customPoint = await customDraw(
        this.points[this.points.length - 1],
        this.endPoint,
      );
      for (let i = 0; i < customPoint.length - 1; i++) {
        this.points.push({
          ...customPoint[i],
          type: 'custom',
        });
      }
      this.points.push(lngLat);
    } else {
      this.points.push(lngLat);
    }

    // 更新Feature
    const feature = this.createFeature(this.points);
    const pointfeatures = createPoint([this.points[0], this.endPoint]);
    this.drawLayer.update(featureCollection([feature]));
    this.drawVertexLayer.update(featureCollection(pointfeatures.features));
    this.onDraw();
    this.emit(DrawEvent.ADD_POINT, lngLat, this.points);
  }

  // 鼠标移动时需要绘制最后一个顶点到到鼠标的连线
  protected onMouseMove(e: any) {
    const lngLat = e.lngLat || e.lnglat;
    if (this.points.length === 0) {
      return;
    }
    const tmpPoints = this.points.slice();
    tmpPoints.push(lngLat);
    const feature = this.createFeature(tmpPoints);
    this.drawLayer.update(featureCollection([feature]));
  }

  protected onDblClick(e: any) {
    const lngLat = e.lngLat || e.lnglat;
    if (this.points.length < 2) {
      return;
    }
    if (!this.isEqualsPrePoint(lngLat)) {
      this.points.push(lngLat);
    }
    this.drawFinish();
  }

  protected moveFeature(delta: ILngLat): void {
    const newFeature = moveFeatures([this.currentFeature as Feature], delta);
    const newPointFeture = moveFeatures(this.pointFeatures, delta);
    this.drawLayer.updateData(featureCollection(newFeature));
    this.drawVertexLayer.updateData(featureCollection(newPointFeture));
    newFeature[0].properties = {
      ...newFeature[0].properties,
      pointFeatures: newPointFeture,
    };
    this.setCurrentFeature(newFeature[0]);
  }
  protected createFeature(
    points: ILngLat[],
    id?: string,
    active: boolean = true,
  ): Feature {
    const pointfeatures = createPoint(points);
    this.pointFeatures = pointfeatures.features;
    const feature = createPolygon(points, {
      id: id || this.getUniqId(),
      type: 'polygon',
      active,
      pointFeatures: this.pointFeatures,
    });
    this.setCurrentFeature(feature as Feature);
    return feature;
  }

  protected editFeature(vertex: ILngLat) {
    const selectVertexed = this.currentVertex as Feature<
      Geometries,
      Properties
    >;
    if (!selectVertexed) {
      return;
    } else {
      // @ts-ignore
      const id = selectVertexed.properties.id * 1;
      // @ts-ignore
      selectVertexed.geometry.coordinates = [vertex.lng, vertex.lat];
      // @ts-ignore
      this.pointFeatures[id].geometry.coordinates = [vertex.lng, vertex.lat];
      this.drawVertexLayer.updateData(featureCollection(this.pointFeatures));
      this.drawMidVertexLayer.updateData(featureCollection(this.pointFeatures));
      this.editPolygonVertex(id, vertex);
      this.drawLayer.updateData(
        featureCollection([this.currentFeature as Feature]),
      );
      const feature = this.currentFeature as Feature;
      feature.properties = {
        ...this.currentFeature?.properties,
        pointFeatures: this.pointFeatures,
      };
      this.setCurrentFeature(feature);
    }
  }

  // 顶点事件监听
  protected onDraw() {
    this.drawVertexLayer.on('mousemove', (e: any) => {
      this.setCursor('pointer');
    });
    this.drawVertexLayer.on('mouseout', () => {
      this.setCursor(this.getOption('cursor'));
    });
    this.drawVertexLayer.on('click', e => {
      this.resetCursor();
      this.drawFinish(e);
    });
  }

  protected showOtherLayer() {
    // if (this.editMode.isEnable) {
    //   this.drawMidVertexLayer.update(featureCollection(this.pointFeatures));
    //   this.drawMidVertexLayer.show();
    // }
    return null;
  }

  protected hideOtherLayer() {
    return null;
  }

  protected addMidLayerEvent(mode: DrawModes[any]) {
    switch (mode) {
      case DrawModes.DIRECT_SELECT: // 选中态
        this.drawMidVertexLayer.update(featureCollection(this.pointFeatures));
        this.drawMidVertexLayer.show();
        break;
      case DrawModes.STATIC: // 绘制态
        this.drawMidVertexLayer.hide();
        break;
    }
  }
  protected initData(): boolean {
    const features: Feature[] = [];
    this.source.data.features.forEach(feature => {
      if (feature.geometry.type === 'Polygon') {
        const points = (feature.geometry.coordinates[0] as Position[]).map(
          coord => {
            return {
              lng: coord[0],
              lat: coord[1],
            };
          },
        );
        features.push(
          this.createFeature(points.slice(1), feature?.properties?.id, false),
        );
      }
    });
    this.source.data.features = features;
    return true;
  }

  private editPolygonVertex(id: number, vertex: ILngLat) {
    const feature = this.currentFeature as Feature<Geometries, Properties>;
    const type = feature?.geometry?.type;
    if (type === 'Polygon') {
      const coords = feature?.geometry?.coordinates as Position[][];
      coords[0][id] = [vertex.lng, vertex.lat];
      if (-id === 0) {
        coords[0][coords[0].length - 1] = [vertex.lng, vertex.lat];
      }
    } else {
      const coords = feature?.geometry?.coordinates as Position[];
      coords[id] = [vertex.lng, vertex.lat];
    }
    this.setCurrentFeature(feature);
    this.drawLayer.updateData(
      featureCollection([this.currentFeature as Feature]),
    );
  }
}
/**
 * draw 端点响应事件
 * select Polyon 响应事件
 * edit 端点 中心点响应事件
 */
