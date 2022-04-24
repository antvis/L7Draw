import {
  IDrawerOptions,
  IDrawerOptionsData,
  ILayerMouseEvent,
  IPointFeature,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import {NodeDrawer} from './NodeDrawer';
import {DEFAULT_POINT_STYLE, DrawerEvent} from '../constants';
import {cloneDeep} from 'lodash';
import {transformPointFeature} from '../utils';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends NodeDrawer<IPointDrawerOptions> {
  initData(data: IDrawerOptionsData): Partial<ISourceData> | undefined {
    if (data.point?.length) {
      return {
        point: data.point.map((feature) => transformPointFeature(feature)),
      };
    }
  }

  getDefaultOptions(): IPointDrawerOptions {
    const options: IPointDrawerOptions = this.getCommonOptions();
    options.style.point = cloneDeep(DEFAULT_POINT_STYLE);
    return options;
  }

  disable() {
    this.setPointData((features) =>
      features.map((feature) => {
        feature.properties.isActive =
          feature.properties.isHover =
          feature.properties.isDrag =
            false;
        return feature;
      }),
    );
    super.disable();
  }

  onPointUnClick(e: ILayerMouseEvent<IPointFeature>) {
    super.onPointUnClick(e);
    const newFeature = e.feature;
    this.emit(DrawerEvent.add, newFeature, this.getPointData());
    this.emit(DrawerEvent.change, this.getPointData());
  }

  onPointMouseDown(e: ILayerMouseEvent<IPointFeature>) {
    super.onPointMouseDown(e);
    if (this.dragPoint && this.options.editable) {
      this.emit(DrawerEvent.dragStart, this.dragPoint, this.getPointData());
    }
  }

  onPointDragging(e: ISceneMouseEvent) {
    super.onPointDragging(e);
    if (this.dragPoint && this.options.editable) {
      this.emit(DrawerEvent.dragging, this.dragPoint, this.getPointData());
    }
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    const dragPoint = this.dragPoint;
    super.onPointDragEnd(e);
    if (dragPoint && this.options.editable) {
      this.emit(DrawerEvent.dragEnd, dragPoint, this.getPointData());
      this.emit(DrawerEvent.edit, dragPoint, this.getPointData());
      this.emit(DrawerEvent.change, this.getPointData());
    }
  }

  clear(disable: boolean = false) {
    super.clear(disable);
    this.emit(DrawerEvent.change, this.getPointData());
  }

  bindThis() {
    super.bindThis();
    this.onPointUnClick = this.onPointUnClick.bind(this);
    this.onPointMouseDown = this.onPointMouseDown.bind(this);
    this.onPointDragging = this.onPointDragging.bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
  }

  bindEvent() {
    this.pointRender?.enableCreate();
    this.pointRender?.enableHover();
    this.pointRender?.enableDrag();
  }

  unbindEvent() {
    this.pointRender?.disableCreate();
    this.pointRender?.disableHover();
    this.pointRender?.disableDrag();
  }
}
