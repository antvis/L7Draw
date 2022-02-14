import { point } from '@turf/turf';
import {
  IDrawerOptions,
  ILayerMouseEvent,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
} from '../typings';
import { BaseDrawer } from './BaseDrawer';
import { getUuid, isSameFeature } from '../utils';
import { DrawerEvent } from '../constants';
import { debounce } from 'lodash';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends BaseDrawer<IPointDrawerOptions> {
  dragPoint?: IPointFeature | null;

  get layer() {
    return this.render.point?.mainLayer;
  }

  getRenderList() {
    const renderList: IRenderType[] = ['point'];
    return renderList;
  }

  getDefaultOptions(): IPointDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  bindEvent(): void {
    this.layer?.on('unclick', this.onUnClick);
    this.layer?.on('mousemove', this.onMouseMove);
    this.layer?.on('mouseout', this.onMouseOut);
    if (this.options.editable) {
      this.layer?.on('mousedown', this.onDragStart);
      this.scene.on('dragging', this.onDragging);
      this.scene?.on('dragend', this.onDragEnd);
    }
  }

  unbindEvent(): void {
    this.layer?.off('unclick', this.onUnClick);
    this.layer?.off('mousemove', this.onMouseMove);
    this.layer?.off('mouseout', this.onMouseOut);
    if (this.options.editable) {
      this.layer?.off('mousedown', this.onDragStart);
      this.scene.off('dragging', this.onDragging);
      this.scene?.off('dragend', this.onDragEnd);
    }
  }

  onMouseMove(e: ILayerMouseEvent<IPointFeature>) {
    if (this.dragPoint) {
      return;
    }
    this.setCursor('pointer');
  }

  onMouseOut(e: ILayerMouseEvent<IPointFeature>) {
    this.setCursor('draw');
  }

  onDragStart(e: ILayerMouseEvent<IPointFeature>) {
    const currentFeature = e.feature;
    this.source.setData({
      point: [
        ...this.getData().map((feature) => {
          if (currentFeature) {
            feature.properties.isActive = isSameFeature(
              currentFeature,
              feature,
            );
          }
          return feature;
        }),
      ],
    });
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.dragPoint = currentFeature;
    this.setCursor('move');
  }

  onDragging(e: ILayerMouseEvent<ISceneMouseEvent>) {
    if (this.dragPoint) {
      this.source.setData({
        point: [
          ...this.getData().map((feature) => {
            if (isSameFeature(this.dragPoint, feature)) {
              const { lng, lat } = e.lngLat;
              feature.geometry.coordinates = [lng, lat];
            }
            return feature;
          }),
        ],
      });
      this.setCursor('move');
    }
  }

  onDragEnd(e: ILayerMouseEvent<ISceneMouseEvent>) {
    this.scene.setMapStatus({
      dragEnable: true,
    });
    const editPoint = this.dragPoint;
    this.dragPoint = null;
    this.setCursor('pointer');
    this.emit(DrawerEvent.edit, editPoint, this.getData());
  }

  onUnClick(e: ILayerMouseEvent<IPointFeature>) {
    const { lng, lat } = e.lngLat;
    const newPoint: IPointFeature = point([lng, lat], {
      id: getUuid('point'),
      isActive: true,
    });
    this.source.setData({
      point: [
        ...this.getData().map((feature) => {
          feature.properties.isActive = false;
          return feature;
        }),
        newPoint,
      ],
    });
    this.emit(DrawerEvent.add, newPoint, this.getData());
  }

  getData() {
    return this.source.data.point;
  }

  bindThis() {
    super.bindThis();
    this.onUnClick = this.onUnClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragging = debounce(this.onDragging, 16, { maxWait: 16 }).bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }
}
