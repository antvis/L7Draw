import { PointMode } from '../mode';
import {
  DeepPartial,
  IBaseModeOptions,
  ILayerMouseEvent,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
  SourceData,
} from '../typings';
import { Scene } from '@antv/l7';
import { getDefaultPointProperties } from '../utils';
import { DEFAULT_POINT_STYLE, DrawerEvent } from '../constant';
import { Feature, Point } from '@turf/turf';

export type IPointDrawerOptions = IBaseModeOptions<Feature<Point>>;

export class PointDrawer extends PointMode<IPointDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<IPointDrawerOptions>) {
    super(scene, options);

    this.bindPointRenderEvent();
  }

  getDefaultOptions(options: DeepPartial<IPointDrawerOptions>) {
    const defaultOptions = this.getCommonOptions(options);
    defaultOptions.style.point = DEFAULT_POINT_STYLE;
    return defaultOptions;
  }

  bindEnableEvent(): void {
    this.enablePointRenderAction();
  }

  unbindEnableEvent(): void {
    this.disablePointRenderAction();
  }

  getRenderTypes(): IRenderType[] {
    return ['point'];
  }

  // @ts-ignore
  setData(points: Feature<Point>[]) {
    this.setPointData(
      points.map((point) => {
        point.properties = {
          ...getDefaultPointProperties(),
          ...(point.properties ?? {}),
        };
        return point as IPointFeature;
      }),
    );
  }

  getData() {
    return this.getPointData();
  }

  onPointCreate(e: ILayerMouseEvent<IPointFeature>): IPointFeature | undefined {
    if (this.getPointData().length >= 1 && !this.options.multiple) {
      this.setPointData((features) => {
        return features.map((feature) => {
          feature.properties = {
            ...feature.properties,
            isHover: false,
            isActive: false,
          };
          return feature;
        });
      });
      return;
    }
    const newFeature = super.onPointCreate(e);
    if (!newFeature) {
      return;
    }
    this.emit(DrawerEvent.add, newFeature, this.getData());
    return newFeature;
  }

  onPointDragStart(e: ILayerMouseEvent<IPointFeature>) {
    const dragPoint = super.onPointDragStart(e);
    this.emit(DrawerEvent.dragStart, dragPoint, this.getData());
    return dragPoint;
  }

  onPointDragging(e: ISceneMouseEvent) {
    const dragPoint = super.onPointDragging(e);
    if (dragPoint && this.options.editable) {
      this.emit(DrawerEvent.dragging, dragPoint, this.getData());
    }
    return dragPoint;
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    const dragPoint = super.onPointDragEnd(e);
    if (dragPoint && this.options.editable) {
      this.emit(DrawerEvent.dragEnd, dragPoint, this.getData());
      this.emit(DrawerEvent.edit, dragPoint, this.getData());
    }
    return dragPoint;
  }

  bindThis() {
    super.bindThis();
    this.bindPointRenderEvent = this.bindPointRenderEvent.bind(this);
  }
}
