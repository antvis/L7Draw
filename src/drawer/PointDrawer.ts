import { point } from '@turf/turf';
import {
  IDrawerOptions,
  ILayerMouseEvent,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
} from '../typings';
import { BaseDrawer } from './common/BaseDrawer';
import { getUuid, isSameFeature } from '../utils';
import { DrawerEvent } from '../constants';
import { debounce } from 'lodash';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends BaseDrawer<
  IPointDrawerOptions,
  IPointFeature
> {
  dragPoint?: IPointFeature | null;

  get layer() {
    return this.render.point?.mainLayer;
  }

  getRenderList(): IRenderType[] {
    return ['point'];
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
      this.setCursor('move');
    } else {
      this.setCursor('pointer');

      this.setData((data) =>
        data.map((feature) => {
          feature.properties.isHover = isSameFeature(feature, e.feature);
          return feature;
        }),
      );
    }
  }

  onMouseOut(e: ILayerMouseEvent<IPointFeature>) {
    this.setCursor('draw');

    if (!this.dragPoint) {
      this.setData((data) =>
        data.map((feature) => {
          feature.properties.isHover = false;
          return feature;
        }),
      );
    }
  }

  onDragStart(e: ILayerMouseEvent<IPointFeature>) {
    const currentFeature = e.feature;

    this.setData(
      (data) =>
        data.map((feature) => {
          if (currentFeature) {
            feature.properties.isActive = isSameFeature(
              currentFeature,
              feature,
            );
          }
          return feature;
        }),
      true,
    );
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.dragPoint = currentFeature;
    this.setCursor('move');
  }

  onDragging(e: ILayerMouseEvent<ISceneMouseEvent>) {
    if (this.dragPoint) {
      this.setData((data) =>
        data.map((feature) => {
          if (isSameFeature(this.dragPoint, feature)) {
            const { lng, lat } = e.lngLat;
            feature.geometry.coordinates = [lng, lat];
          }
          return feature;
        }),
      );
      this.emit(DrawerEvent.dragging, this.dragPoint, this.getData());
      this.setCursor('move');
    }
  }

  onDragEnd(e: ILayerMouseEvent<ISceneMouseEvent>) {
    this.setData(
      (data) =>
        data.map((feature) => {
          if (isSameFeature(this.dragPoint, feature)) {
            const { lng, lat } = e.lngLat;
            feature.geometry.coordinates = [lng, lat];
          }
          return feature;
        }),
      true,
    );
    this.scene.setMapStatus({
      dragEnable: true,
    });
    const editPoint = this.dragPoint;
    this.dragPoint = null;
    this.setCursor('pointer');
    this.emit(DrawerEvent.dragEnd, editPoint, this.getData());
  }

  onUnClick(e: ILayerMouseEvent<IPointFeature>) {
    const { lng, lat } = e.lngLat;
    const newPoint: IPointFeature = point([lng, lat], {
      id: getUuid('point'),
      isHover: true,
      isActive: true,
    });
    this.setData((data) => {
      const newData = data.map((feature) => {
        feature.properties.isActive = false;
        feature.properties.isHover = false;
        return feature;
      });
      newData.push(newPoint);
      return newData;
    }, true);
    this.emit(DrawerEvent.add, newPoint, this.getData());
  }

  getData() {
    return this.source.data.point;
  }

  setData(
    updater: IPointFeature[] | ((data: IPointFeature[]) => IPointFeature[]),
    store: boolean = false,
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

  bindThis() {
    super.bindThis();

    this.onUnClick = this.onUnClick.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onMouseMove = debounce(this.onMouseMove, 16, { maxWait: 16 }).bind(
      this,
    );
    this.onDragging = debounce(this.onDragging, 16, { maxWait: 16 }).bind(this);
  }

  // 在基础disable的技术上，把所有点的状态取消
  disable() {
    super.disable();

    this.dragPoint = null;
    this.setData((data) =>
      data.map((feature) => {
        feature.properties.isHover = false;
        feature.properties.isActive = false;
        return feature;
      }),
    );
  }
}
