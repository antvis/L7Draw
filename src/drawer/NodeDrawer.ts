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

export interface INodeDrawerOptions extends IDrawerOptions {}

export class NodeDrawer<
  T extends INodeDrawerOptions = INodeDrawerOptions
> extends BaseDrawer<T, IPointFeature> {
  renderType: IRenderType = 'point';

  get editPoint() {
    const pointFeatures = this.source.render.point?.data ?? null;
    return pointFeatures?.find(feature => feature.properties?.isDrag) ?? null;
  }

  set editPoint(dragFeature: IPointFeature | null) {
    this.setData(data =>
      data.map(feature => {
        if (feature.properties) {
          feature.properties.isDrag = dragFeature
            ? isSameFeature(feature, dragFeature)
            : false;
        }
        return feature;
      }),
    );
  }

  get normalLayer() {
    return this.source.render.point?.layers[0];
  }

  getRenderList(): IRenderType[] {
    return ['point'];
  }

  getDefaultOptions(): T {
    // @ts-ignore
    return this.getCommonOptions();
  }

  bindEditEvent() {
    this.normalLayer?.on('mousemove', this.onMouseMove);
    this.normalLayer?.on('mouseout', this.onMouseOut);
    this.normalLayer?.on('mousedown', this.onDragStart);
    this.scene.on('dragging', this.onDragging);
    this.scene.on('dragend', this.onDragEnd);
  }

  unbindEditEvent() {
    this.normalLayer?.off('mousemove', this.onMouseMove);
    this.normalLayer?.off('mouseout', this.onMouseOut);
    this.normalLayer?.off('mousedown', this.onDragStart);
    this.scene.off('dragging', this.onDragging);
    this.scene.off('dragend', this.onDragEnd);
  }

  bindEvent(): void {
    this.normalLayer?.on('unclick', this.onUnClick);
    this.bindEditEvent();
  }

  unbindEvent(): void {
    this.normalLayer?.off('unclick', this.onUnClick);
    this.unbindEditEvent();
  }

  onMouseMove(e: ILayerMouseEvent<IPointFeature>) {
    if (
      this.editPoint &&
      isSameFeature(this.editPoint, e.feature) &&
      this.options.editable
    ) {
      this.setCursor('pointDrag');
    } else {
      this.setCursor('pointHover');

      this.setData(data =>
        data.map(feature => {
          if (feature.properties) {
            feature.properties.isHover = isSameFeature(feature, e.feature);
          }
          return feature;
        }),
      );
    }
  }

  onMouseOut(e: ILayerMouseEvent<IPointFeature>) {
    this.setCursor(this.isEnable ? 'draw' : null);

    if (!this.editPoint) {
      this.setData(data =>
        data.map(feature => {
          if (feature.properties) {
            feature.properties.isHover = false;
          }
          return feature;
        }),
      );
    }
  }

  onDragStart(e: ILayerMouseEvent<IPointFeature>) {
    const currentFeature = e.feature ?? null;

    this.setData(
      data =>
        data.map(feature => {
          if (currentFeature) {
            if (feature.properties) {
              feature.properties.isActive = isSameFeature(
                currentFeature,
                feature,
              );
            }
          }
          return feature;
        }),
      true,
    );

    if (this.options.editable) {
      this.scene.setMapStatus({
        dragEnable: false,
      });
      this.editPoint = currentFeature;
      this.setCursor('pointDrag');
      this.emit(DrawerEvent.dragStart, currentFeature, this.getData());
    }

    this.emit(DrawerEvent.click, currentFeature, this.getData());
  }

  onDragging(e: ILayerMouseEvent<ISceneMouseEvent>) {
    if (this.editPoint && this.options.editable) {
      this.setData(data =>
        data.map(feature => {
          if (isSameFeature(this.editPoint, feature)) {
            const { lng, lat } = e.lngLat;
            if (feature.geometry) {
              feature.geometry.coordinates = [lng, lat];
            }
          }
          return feature;
        }),
      );
      this.emit(DrawerEvent.dragging, this.editPoint, this.getData());
      this.setCursor('pointDrag');
    }
  }

  onDragEnd(e: ILayerMouseEvent<ISceneMouseEvent>) {
    if (this.options.editable) {
      this.setData(
        data =>
          data.map(feature => {
            if (isSameFeature(this.editPoint, feature)) {
              const { lng, lat } = e.lngLat;
              if (feature.geometry) {
                feature.geometry.coordinates = [lng, lat];
              }
            }
            return feature;
          }),
        true,
      );
      this.scene.setMapStatus({
        dragEnable: true,
      });
      const editPoint = this.editPoint;
      this.editPoint = null;
      this.setCursor('pointHover');
      this.emit(DrawerEvent.dragEnd, editPoint, this.getData());
    }
  }

  onUnClick(e: ILayerMouseEvent<IPointFeature>) {
    const { lng, lat } = e.lngLat;
    const autoFocus = this.options.autoFocus;
    const newPoint = point([lng, lat], {
      id: getUuid('point'),
      isHover: autoFocus,
      isActive: autoFocus,
      isDrag: false,
    }) as IPointFeature;
    this.setData(data => {
      return [
        ...data.map(feature => {
          if (feature.properties) {
            feature.properties.isHover = false;
            feature.properties.isActive = false;
          }
          return feature;
        }),
        newPoint,
      ];
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

    this.editPoint = null;
    this.setData(data =>
      data.map(feature => {
        if (feature.properties) {
          feature.properties.isHover = false;
          feature.properties.isActive = false;
        }
        return feature;
      }),
    );
  }
}
