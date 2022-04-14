import { BaseDrawer } from './BaseDrawer';
import {
  IDrawerOptions,
  IBaseFeature,
  DeepPartial,
  ILayerMouseEvent,
  IPointFeature,
  ISceneMouseEvent,
  IRenderType,
} from '../typings';
import { Scene } from '@antv/l7';
import { DrawerEvent, RenderEvent } from '../constants';
import { debounceMoveFn, isSameFeature } from '../utils';

export abstract class BasePointDrawer<
  T extends IDrawerOptions
> extends BaseDrawer<T> {
  get pointRender() {
    return this.render.point;
  }

  get dragPoint() {
    return (
      this.source.data.point.find(feature => feature.properties.isDrag) ?? null
    );
  }

  constructor(scene: Scene, options?: DeepPartial<T>) {
    super(scene, options);

    this.pointRender?.on(RenderEvent.unClick, this.onPointCreate);
    this.pointRender?.on(RenderEvent.mousemove, this.onPointMouseMove);
    this.pointRender?.on(RenderEvent.mouseout, this.onPointMouseOut);
    this.pointRender?.on(RenderEvent.mousedown, this.onPointMouseDown);
    this.pointRender?.on(RenderEvent.dragging, this.onPointDragging);
    this.pointRender?.on(RenderEvent.dragend, this.onPointDragEnd);
  }

  getRenderList(): IRenderType[] {
    return ['point'];
  }

  getPointData() {
    return this.getTypeData<IPointFeature>('point');
  }

  setPointData(
    updater: IPointFeature[] | ((features: IPointFeature[]) => IPointFeature[]),
    store = true,
  ) {
    return this.setTypeData<IPointFeature>('point', updater, store);
  }

  onPointCreate(e: ILayerMouseEvent<IPointFeature>) {
    let feature = e.feature!;
    const { editable, autoFocus } = this.options;
    feature.properties.isHover = feature.properties.isActive =
      editable && autoFocus;
    this.setPointData(
      features => [
        ...features.map(feature => {
          feature.properties.isActive = feature.properties.isHover = feature.properties.isDrag = false;
          return feature;
        }),
        feature,
      ],
      true,
    );
  }

  onPointMouseMove({ feature: pointFeature }: ILayerMouseEvent<IPointFeature>) {
    if (this.options.editable && pointFeature && !this.dragPoint) {
      this.setCursor('pointHover');
      this.setPointData(
        features =>
          features.map(feature => {
            feature.properties.isHover = isSameFeature(pointFeature, feature);
            return feature;
          }),
        false,
      );
    }
  }

  onPointMouseOut() {
    this.setCursor(this.isEnable ? 'draw' : null);
    this.setPointData(
      features =>
        features.map(feature => {
          feature.properties.isHover = false;
          return feature;
        }),
      false,
    );
  }

  onPointMouseDown(e: ILayerMouseEvent<IPointFeature>) {
    const currentPoint = e.feature ?? null;
    if (!this.options.editable || !currentPoint) {
      return;
    }

    this.setPointData(
      features =>
        features.map(feature => {
          const isSame = isSameFeature(currentPoint, feature);
          feature.properties.isActive = isSame;
          feature.properties.isDrag = isSame;
          return feature;
        }),
      true,
    );
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.setCursor('pointDrag');
  }

  onPointDragging(e: ISceneMouseEvent) {
    if (this.dragPoint && this.options.editable) {
      this.setPointData(
        data =>
          data.map(feature => {
            if (isSameFeature(this.dragPoint, feature)) {
              const { lng, lat } = e.lngLat;
              feature.geometry.coordinates = [lng, lat];
            }
            return feature;
          }),
        false,
      );
      this.setCursor('pointDrag');
    }
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    if (this.dragPoint && this.options.editable) {
      this.setPointData(
        data =>
          data.map(feature => {
            if (isSameFeature(this.dragPoint, feature)) {
              const { lng, lat } = e.lngLat;
              feature.geometry.coordinates = [lng, lat];
              feature.properties.isDrag = false;
            }
            return feature;
          }),
        true,
      );
      this.scene.setMapStatus({
        dragEnable: true,
      });
      this.setCursor('pointHover');
    }
  }

  bindThis() {
    super.bindThis();
    this.onPointCreate = this.onPointCreate.bind(this);
    this.onPointMouseMove = debounceMoveFn(this.onPointMouseMove).bind(this);
    this.onPointMouseOut = this.onPointMouseOut.bind(this);
    this.onPointMouseDown = this.onPointMouseDown.bind(this);
    this.onPointDragging = debounceMoveFn(this.onPointDragging).bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
  }
}
