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
import {getDefaultPointProperties, getUuid} from '../utils';
import { DEFAULT_POINT_STYLE, DrawerEvent } from '../constant';
import { Feature, Point } from '@turf/turf';

export interface IPointDrawerOptions extends IBaseModeOptions<Feature<Point>> {}

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
  initData(points: Feature<Point>[]): Partial<SourceData> {
    return {
      point: points.map((point) => {
        point.properties = {
          ...getDefaultPointProperties(),
          ...(point.properties ?? {}),
        };
        return point as IPointFeature;
      }),
    };
  }

  getData() {
    return this.getPointData();
  }

  setData(data: Feature<Point>[]) {
    this.source.setData(this.initData(data) ?? {});
    return this.getPointData();
  }

  onPointCreate(e: ILayerMouseEvent<IPointFeature>): IPointFeature | undefined {
    const newFeature = super.onPointCreate(e);
    if (!newFeature) {
      return;
    }
    this.emit(DrawerEvent.add, newFeature, this.getData());
    this.emit(DrawerEvent.change, this.getData());
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
      this.emit(DrawerEvent.change, this.getData());
    }
    return dragPoint;
  }

  bindThis() {
    super.bindThis();
    this.bindPointRenderEvent = this.bindPointRenderEvent.bind(this);
  }
}
