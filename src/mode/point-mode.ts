import { Position } from '@turf/turf';
import { RenderEvent } from '../constant';
import { PointRender } from '../render';
import {
  FeatureUpdater,
  IBaseModeOptions,
  ILayerMouseEvent,
  ILngLat,
  IPointFeature,
  ISceneMouseEvent,
} from '../typings';
import {
  createPointFeature,
  getLngLat,
  transLngLat2Position,
  updateTargetFeature,
} from '../utils';
import { BaseMode } from './base-mode';

export abstract class PointMode<
  T extends IBaseModeOptions,
> extends BaseMode<T> {
  /**
   * 获取point类型对应的render
   * @protected
   */
  protected get pointRender(): PointRender | undefined {
    return this.render.point;
  }

  /**
   * 获取正在被拖拽的结点
   * @protected
   */
  protected get dragPoint() {
    return this.getPointData().find((feature) => feature.properties.isDrag);
  }

  /**
   * 当前高亮的结点
   * @protected
   */
  protected get editPoint() {
    return this.getPointData().find((feature) => {
      return feature.properties.isActive;
    });
  }

  /**
   * 获取点数据
   */
  getPointData() {
    return this.source.getRenderData<IPointFeature>('point');
  }

  /**
   * 设置点数据
   * @param data
   */
  setPointData(data: FeatureUpdater<IPointFeature>) {
    return this.source.setRenderData('point', data);
  }

  /**
   * 绑定点Render相关事件
   */
  bindPointRenderEvent() {
    this.pointRender?.on(RenderEvent.unclick, this.onPointCreate.bind(this));
    this.pointRender?.on(
      RenderEvent.mousemove,
      this.onPointMouseMove.bind(this),
    );
    this.pointRender?.on(RenderEvent.mouseout, this.onPointMouseOut.bind(this));
    this.pointRender?.on(
      RenderEvent.dragstart,
      this.onPointDragStart.bind(this),
    );
    this.pointRender?.on(RenderEvent.dragging, this.onPointDragging.bind(this));
    this.pointRender?.on(RenderEvent.dragend, this.onPointDragEnd.bind(this));
  }

  /**
   * 创建点Feature
   * @param position
   */
  handleCreatePoint(position: Position): IPointFeature {
    const { autoFocus, editable } = this.options;
    const newFeature = createPointFeature(position);
    this.setPointData((oldData) => {
      return updateTargetFeature<IPointFeature>({
        target: newFeature,
        data: [...oldData, newFeature],
        targetHandler: (item) => {
          item.properties = {
            ...item.properties,
            isHover: editable,
            isActive: autoFocus && editable,
          };
        },
        otherHandler: (item) => {
          item.properties = {
            ...item.properties,
            isHover: false,
            isActive: false,
            isDrag: false,
          };
        },
      });
    });
    return newFeature;
  }

  handlePointHover(point: IPointFeature) {
    this.setCursor('pointHover');
    this.setPointData((features) => {
      return updateTargetFeature<IPointFeature>({
        target: point,
        data: features,
        targetHandler: (item) => {
          item.properties.isHover = true;
        },
        otherHandler: (item) => {
          item.properties.isHover = false;
        },
      });
    });
    return point;
  }

  handlePointUnHover(point: IPointFeature) {
    this.resetCursor();
    this.setPointData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
    return point;
  }

  handlePointDragStart(point: IPointFeature) {
    this.setPointData((features) => {
      return updateTargetFeature<IPointFeature>({
        target: point,
        data: features,
        targetHandler: (item) => {
          item.properties = {
            ...item.properties,
            isDrag: true,
            isActive: true,
          };
        },
        otherHandler: (item) => {
          item.properties = {
            ...item.properties,
            isDrag: false,
            isActive: false,
          };
        },
      });
    });
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.setCursor('pointDrag');
    return point;
  }

  handlePointDragging(point: IPointFeature, lngLat: ILngLat) {
    this.setPointData((features) => {
      return updateTargetFeature<IPointFeature>({
        target: point,
        data: features,
        targetHandler: (item) => {
          item.geometry.coordinates = transLngLat2Position(lngLat);
        },
      });
    });
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.setCursor('pointDrag');
    return point;
  }

  handlePointDragEnd(point: IPointFeature) {
    this.setPointData((features) => {
      return updateTargetFeature<IPointFeature>({
        target: point,
        data: features,
        targetHandler: (item) => {
          item.properties.isDrag = false;
        },
      });
    });
    this.scene.setMapStatus({
      dragEnable: true,
    });
    this.setCursor('pointHover');
    return point;
  }

  /**
   * 创建点回调
   * @param e
   */
  onPointCreate(e: ILayerMouseEvent): IPointFeature | undefined {
    return this.handleCreatePoint(transLngLat2Position(getLngLat(e)));
  }

  onPointMouseMove(e: ILayerMouseEvent<IPointFeature>) {
    return this.handlePointHover(e.feature!);
  }

  onPointMouseOut(e: ILayerMouseEvent<IPointFeature>) {
    return this.handlePointUnHover(e.feature!);
  }

  /**
   * 开始拖拽点回调
   * @param e
   */
  onPointDragStart(e: ILayerMouseEvent<IPointFeature>) {
    if (!this.options.editable) {
      return;
    }
    return this.handlePointDragStart(e.feature!);
  }

  /**
   * 拖拽中点回调
   * @param e
   */
  onPointDragging(e: ISceneMouseEvent) {
    const dragPoint = this.dragPoint;
    if (!this.options.editable || !dragPoint) {
      return;
    }
    return this.handlePointDragging(dragPoint, getLngLat(e));
  }

  /**
   * 拖拽结束点回调
   * @param e
   */
  onPointDragEnd(e: ISceneMouseEvent) {
    const dragPoint = this.dragPoint;
    if (!this.options.editable || !dragPoint) {
      return;
    }
    return this.handlePointDragEnd(dragPoint);
  }

  enablePointRenderAction() {
    const { editable } = this.options;
    if (this.isEnable) {
      this.pointRender?.enableCreate();
    }
    this.pointRender?.enableClick();
    if (editable) {
      this.pointRender?.enableHover();
      this.pointRender?.enableDrag();
    }
  }

  disablePointRenderAction() {
    this.pointRender?.disableCreate();
    if (this.options.disableEditable) {
      return;
    }
    this.pointRender?.disableHover();
    this.pointRender?.disableDrag();
    this.pointRender?.disableClick();
  }
}
