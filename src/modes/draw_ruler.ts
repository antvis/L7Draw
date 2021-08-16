import { ILngLat, Popup, Scene } from '@antv/l7';
import { Feature, featureCollection } from '@turf/helpers';
import { DrawEvent, DrawModes, unitsType } from '../util/constant';
import {
  createLine,
  createPoint,
  createPolygon,
} from '../util/create_geometry';
import { getDistance } from '../util/measurements';
import { IDrawFeatureOption } from './draw_feature';
import DrawRulerLayer from '../render/draw_ruler';
import DrawPolygon from './draw_polygon';

export interface IDrawRectOption extends IDrawFeatureOption {
  units: unitsType;
  steps: number;
}
export default class DrawRuler extends DrawPolygon {
  protected infoPopup: Popup;
  protected isAreaClosed: boolean = false; // 当闭合时测量面积，否则测量距离

  constructor(scene: Scene, options: Partial<IDrawRectOption> = {}) {
    super(scene, options);

    this.setDrawMode(DrawModes.RULER);
    this.type = 'line';

    this.infoPopup = new Popup({
      anchor: 'left',
      closeButton: false,
      closeOnClick: false,
    });

    this.drawRulerLayer = new DrawRulerLayer(this);

    this.scene.addPopup(this.infoPopup);

    // 覆盖图层原有的style
    this.drawLayer.styleVariant = 'ruler';
    this.drawVertexLayer.styleVariant = 'ruler';
    this.drawMidVertexLayer.styleVariant = 'ruler';
    this.drawDistanceLayer.styleVariant = 'ruler';

    this.enableMeasure();
  }

  public enable() {
    this.drawRulerLayer.destroy();
    this.drawMidVertexLayer.destroy();
    this.drawDistanceLayer.destroy();
    this.drawLayer.destroy();
    this.drawVertexLayer.destroy();

    super.enable();
  }

  public resetDraw() {
    super.resetDraw();
  }

  protected getDefaultOptions(): Partial<IDrawFeatureOption> {
    return {
      ...super.getDefaultOptions(),
      editEnable: false,
      title: '测距',
    };
  }

  public drawFinish(e?: any) {
    // 点击第一个点时候区域闭合
    if (e) {
      const coords = e.feature?.geometry?.coordinates || [];
      if (this.isEqualsFirstPoint({ lng: coords[0], lat: coords[1] })) {
        this.isAreaClosed = true;
      }
    }

    // this.points = this.points.reverse();
    const feature = this.createFeature([...this.points]);
    const properties = feature.properties as { pointFeatures: Feature[] };
    this.drawLayer.update(featureCollection([feature]));
    this.drawVertexLayer.update(featureCollection(properties.pointFeatures));
    // @ts-ignore
    this.emit(DrawEvent.CREATE, this.currentFeature);
    this.emit(DrawEvent.MODE_CHANGE, DrawModes.SIMPLE_SELECT);
    this.points = [];

    this.isAreaClosed = false;

    this.infoPopup.close();
    this.disable();
  }

  protected onMouseMove(e: any) {
    this.infoPopup.open();
    super.onMouseMove(e);
    const lngLat: ILngLat = e.lngLat || e.lnglat;
    this.updatePopup(lngLat);
  }

  private isEqualsFirstPoint(lngLat: ILngLat): boolean {
    let pointLen = this.points.length;

    if (pointLen <= 1) {
      return false;
    }
    let p = this.points[0];
    if (p.lat === lngLat.lat && p.lng === lngLat.lng) {
      return true;
    }
    return false;
  }

  protected updatePopup(lngLat: ILngLat) {
    this.infoPopup.setLnglat(lngLat);

    if (this.points.length === 0) {
      return this.infoPopup.setText('请点击对应位置增加节点');
    } else {
      // 取最后一个点到鼠标的距离

      const point = this.points[this.points.length - 1];

      const distance = getDistance(
        [lngLat.lng, lngLat.lat],
        [point.lng, point.lat],
      );
      let hint: string;

      if (this.points.length === 1) {
        hint = '点击连续测距';
      } else if (this.points.length === 2) {
        hint = '双击结束线段绘制';
      } else {
        hint = '按起始点闭合线段';
      }
      this.infoPopup.setText(distance + hint);
    }
  }

  protected moveFeature(delta: ILngLat): Feature {
    return this.currentFeature as Feature;
  }
  // 构造线Feature
  protected createFeature(
    points: ILngLat[],
    id?: string,
    active: boolean = true,
  ): Feature {
    if (this.isAreaClosed) {
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
    } else {
      const pointfeatures = createPoint(points);
      this.pointFeatures = pointfeatures.features;
      const feature = createLine(points, {
        id: id || this.getUniqId(),
        type: 'line',
        active,
        pointFeatures: this.pointFeatures,
      });
      this.setCurrentFeature(feature as Feature);

      return feature;
    }
  }
}
