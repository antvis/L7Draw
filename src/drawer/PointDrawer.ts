import {
  DeepPartial,
  IDrawerOptions,
  IDrawerOptionsData,
  ILayerMouseEvent,
  IPointFeature,
  IPointHelper,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import { NodeDrawer } from './common/NodeDrawer';
import { DEFAULT_POINT_STYLE, DrawerEvent } from '../constants';
import { cloneDeep } from 'lodash';
import { transformPointFeature } from '../utils';
import { DEFAULT_POINT_HELPER } from '../constants/helper';
import { Feature, Point } from '@turf/turf';

export interface IPointDrawerOptions extends IDrawerOptions {
  helper: IPointHelper;
}

export class PointDrawer extends NodeDrawer<IPointDrawerOptions> {
  get helper() {
    return this.options.helper;
  }

  initData(data: IDrawerOptionsData): Partial<ISourceData> | undefined {
    if (data.point?.length) {
      return {
        point: data.point.map((feature) => transformPointFeature(feature)),
      };
    }
  }

  setData(data: Feature<Point>[]) {
    this.source.setData(
      this.initData({
        point: data,
      }) ?? {},
    );
  }

  setPopupText(key: keyof IPointHelper) {
    this.popup?.setText(this.helper[key]);
  }

  getDefaultOptions(
    options: DeepPartial<IPointDrawerOptions>,
  ): IPointDrawerOptions {
    const newOptions: IPointDrawerOptions = {
      ...this.getCommonOptions(),
      helper: DEFAULT_POINT_HELPER,
    };
    newOptions.style.point = cloneDeep(DEFAULT_POINT_STYLE);
    return newOptions;
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
    const { editable, multiple } = this.options;
    super.onPointUnClick(e);
    if (editable) {
      this.setPopupText('pointHover');
    }
    const newFeature = e.feature;
    this.emit(DrawerEvent.add, newFeature, this.getPointData());
    this.emit(DrawerEvent.change, this.getPointData());
    if (!multiple) {
      this.disable();
    }
  }

  onPointMouseMove(e: ILayerMouseEvent<IPointFeature>) {
    super.onPointMouseMove(e);
    if (this.options.editable && !this.dragPoint) {
      this.setPopupText('pointHover');
    }
  }

  onPointMouseOut() {
    super.onPointMouseOut();
    this.setPopupText('draw');
  }

  onPointMouseDown(e: ILayerMouseEvent<IPointFeature>) {
    super.onPointMouseDown(e);
    if (this.dragPoint && this.options.editable) {
      this.setPopupText('pointDrag');
      this.emit(DrawerEvent.dragStart, this.dragPoint, this.getPointData());
    }
  }

  onPointDragging(e: ISceneMouseEvent) {
    super.onPointDragging(e);
    if (this.dragPoint && this.options.editable) {
      this.setPopupText('pointDrag');
      this.emit(DrawerEvent.dragging, this.dragPoint, this.getPointData());
    }
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    const dragPoint = this.dragPoint;
    super.onPointDragEnd(e);
    if (dragPoint && this.options.editable) {
      this.setPopupText('pointHover');
      this.emit(DrawerEvent.dragEnd, dragPoint, this.getPointData());
      this.emit(DrawerEvent.edit, dragPoint, this.getPointData());
      this.emit(DrawerEvent.change, this.getPointData());
    }
  }

  enable() {
    this.setPopupText('draw');
    super.enable();
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
    this.onPointMouseMove = this.onPointMouseMove.bind(this);
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
