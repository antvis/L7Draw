import { BaseDrawer } from './BaseDrawer';
import {
  DeepPartial,
  IDrawerOptions,
  ILayerMouseEvent,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
} from '../typings';
import { DrawerEvent, RenderEvent } from '../constants';
import { Scene } from '@antv/l7';
import { debounceMoveFn, isSameFeature } from '../utils';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends BaseDrawer<
  IPointDrawerOptions,
  IPointFeature
> {
  constructor(scene: Scene, options?: DeepPartial<IPointDrawerOptions>) {
    super(scene, options);

    this.pointRender?.on(RenderEvent.unclick, this.onCreate);
    this.pointRender?.on(RenderEvent.mousemove, this.onMouseMove);
    this.pointRender?.on(RenderEvent.mouseout, this.onMouseOut);
    this.pointRender?.on(RenderEvent.mousedown, this.onMouseDown);
    this.pointRender?.on(RenderEvent.dragging, this.onDragging);
    this.pointRender?.on(RenderEvent.dragend, this.onDragEnd);
  }

  get pointRender() {
    return this.render.point;
  }

  get dragPoint() {
    return (
      this.source.data.point.find(feature => feature.properties.isDrag) ?? null
    );
  }

  getDefaultOptions(): IPointDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  getRenderList(): IRenderType[] {
    return ['point'];
  }

  setData(
    updater: IPointFeature[] | ((features: IPointFeature[]) => IPointFeature[]),
    store: boolean | undefined,
  ): void {
    const point =
      typeof updater === 'function' ? updater(this.getData()) : updater;
    this.source.setData(
      {
        point,
      },
      store,
    );
  }

  getData(): IPointFeature[] {
    return this.source.data.point;
  }

  onCreate = ({ feature }: ILayerMouseEvent<IPointFeature>) => {
    if (!feature) {
      return;
    }
    const { editable, autoFocus } = this.options;
    feature.properties.isHover = feature.properties.isActive =
      editable && autoFocus;
    this.setData(
      features => [
        ...features.map(feature => {
          feature.properties.isActive = feature.properties.isHover = feature.properties.isDrag = false;
          return feature;
        }),
        feature,
      ],
      true,
    );
    this.emit(DrawerEvent.add, feature, this.getData());
  };

  onMouseMove = debounceMoveFn(
    ({ feature: pointFeature }: ILayerMouseEvent<IPointFeature>) => {
      if (this.options.editable && pointFeature && !this.dragPoint) {
        this.setCursor('pointHover');
        this.setData(
          features =>
            features.map(feature => {
              feature.properties.isHover = isSameFeature(pointFeature, feature);
              return feature;
            }),
          false,
        );
      }
    },
  );

  onMouseOut = () => {
    this.setCursor(this.isEnable ? 'draw' : null);
    this.setData(
      features =>
        features.map(feature => {
          feature.properties.isHover = false;
          return feature;
        }),
      false,
    );
  };

  onMouseDown = (e: ILayerMouseEvent<IPointFeature>) => {
    const currentFeature = e.feature ?? null;
    if (!this.options.editable || !currentFeature) {
      return;
    }

    this.setData(
      features =>
        features.map(feature => {
          const isSame = isSameFeature(currentFeature, feature);
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
    this.emit(DrawerEvent.dragStart, currentFeature, this.getData());
  };

  onDragging = debounceMoveFn((e: ISceneMouseEvent) => {
    if (this.dragPoint && this.options.editable) {
      this.setData(
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
      this.emit(DrawerEvent.dragging, this.dragPoint, this.getData());
      this.setCursor('pointDrag');
    }
  });

  onDragEnd = (e: ISceneMouseEvent) => {
    if (this.options.editable && this.dragPoint) {
      const dragPoint = this.dragPoint;
      this.setData(
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
      this.emit(DrawerEvent.dragEnd, dragPoint, this.getData());
    }
  };

  bindEvent(): void {
    this.pointRender?.enableCreate();
    this.pointRender?.enableHover();
    this.pointRender?.enableEdit();
  }

  unbindEvent(): void {
    this.pointRender?.disableCreate();
    this.pointRender?.disableHover();
    this.pointRender?.disableEdit();
  }
}
