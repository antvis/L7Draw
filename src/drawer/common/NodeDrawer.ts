import {BaseDrawer} from './BaseDrawer';
import {
  DeepPartial,
  IDrawerOptions,
  ILayerMouseEvent,
  ILngLat,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
} from '../../typings';
import {Scene} from '@antv/l7';
import {RenderEvent} from '../../constants';
import {debounceMoveFn, isSameFeature} from '../../utils';

export abstract class NodeDrawer<
  T extends IDrawerOptions,
> extends BaseDrawer<T> {
  get pointRender() {
    return this.render.point;
  }

  get dragPoint() {
    return (
      this.source.data.point.find((feature) => feature.properties.isDrag) ??
      null
    );
  }

  previousLngLat: ILngLat = {
    lng: 0,
    lat: 0,
  };

  constructor(scene: Scene, options?: DeepPartial<T>) {
    super(scene, options);

    this.pointRender?.on(RenderEvent.unClick, this.onPointUnClick);
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

  onPointUnClick(e: ILayerMouseEvent<IPointFeature>) {
    let feature = e.feature!;
    const { editable, autoFocus } = this.options;
    feature.properties.isHover = editable;
    feature.properties.isActive = editable && autoFocus;
    this.setPointData(
      (features) => [
        ...features.map((feature) => {
          feature.properties.isActive =
            feature.properties.isHover =
            feature.properties.isDrag =
              false;
          return feature;
        }),
        feature,
      ],
      true,
    );
  }

  onPointMouseMove({ feature: pointFeature }: ILayerMouseEvent<IPointFeature>) {
    if (this.options.editable && pointFeature && !this.dragPoint) {
      this.setPointData(
        (features) =>
          features.map((feature) => {
            feature.properties.isHover = isSameFeature(pointFeature, feature);
            return feature;
          }),
        false,
      );
      this.setCursor('pointHover');
    }
  }

  onPointMouseOut() {
    this.setCursor(this.isEnable ? 'draw' : null);
    this.setPointData(
      (features) =>
        features.map((feature) => {
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

    this.setPointData((features) =>
      features.map((feature) => {
        const isSame = isSameFeature(currentPoint, feature);
        feature.properties.isActive = isSame;
        feature.properties.isDrag = isSame;
        return feature;
      }),
    );
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.setCursor('pointDrag');
  }

  onPointDragging(e: ISceneMouseEvent) {
    if (this.dragPoint && this.options.editable) {
      this.setPointData(
        (data) =>
          data.map((feature) => {
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
      this.setPointData((data) =>
        data.map((feature) => {
          if (isSameFeature(this.dragPoint, feature)) {
            feature.properties.isDrag = false;
          }
          return feature;
        }),
      );
      this.scene.setMapStatus({
        dragEnable: true,
      });
      this.setCursor('pointHover');
    }
  }

  bindThis() {
    super.bindThis();
    this.onPointUnClick = this.onPointUnClick.bind(this);
    this.onPointMouseMove = debounceMoveFn(this.onPointMouseMove).bind(this);
    this.onPointMouseOut = debounceMoveFn(this.onPointMouseOut).bind(this);
    this.onPointMouseDown = this.onPointMouseDown.bind(this);
    this.onPointDragging = debounceMoveFn(this.onPointDragging).bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
  }
}
