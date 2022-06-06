import { PointMode } from '../mode';
import {
  DeepPartial,
  IBaseModeOptions,
  ILayerMouseEvent,
  IPointFeature,
  IPointProperties,
  IRenderType,
  ISceneMouseEvent,
  SourceData,
} from '../typings';
import { Scene } from '@antv/l7';
import { getUuid, updateTargetFeature } from '../utils';
import { DEFAULT_POINT_STYLE, DrawerEvent, RenderEvent } from '../constant';
import { Feature, Point } from '@turf/turf';

export interface IPointDrawerOptions extends IBaseModeOptions<Feature<Point>> {}

export class PointDrawer extends PointMode<IPointDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<IPointDrawerOptions>) {
    super(scene, options);

    this.pointRender?.on(RenderEvent.create, this.onPointCreate.bind(this));
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

  getDefaultOptions(options: DeepPartial<IPointDrawerOptions>) {
    const defaultOptions = this.getCommonOptions();
    defaultOptions.style.point = DEFAULT_POINT_STYLE;
    return defaultOptions;
  }

  bindEnableEvent(): void {
    const { editable } = this.options;
    this.pointRender?.enableCreate();
    this.pointRender?.enableHover();
    if (editable) {
      this.pointRender?.enableDrag();
    }
  }

  unbindEnableEvent(): void {
    this.pointRender?.disableCreate();
    this.pointRender?.disableHover();
    this.pointRender?.disableDrag();
  }

  getRenderTypes(): IRenderType[] {
    return ['point'];
  }

  // @ts-ignore
  initData(data: Feature<Point>[]): Partial<SourceData> | undefined {
    return {
      point: data.map((item) => {
        item.properties = {
          ...(item.properties ?? {}),
          id: getUuid('point'),
          createTime: Date.now(),
        };
        return item as IPointFeature;
      }),
    };
  }

  getData() {
    return this.getPointData();
  }

  setData(data: IPointFeature[]) {
    return this.setPointData(data);
  }

  onPointCreate(e: ILayerMouseEvent<IPointFeature>) {
    const newFeature = super.onPointCreate(e);
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
}
