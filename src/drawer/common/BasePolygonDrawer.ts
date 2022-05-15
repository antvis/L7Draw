import {
  DeepPartial,
  IAreaOptions,
  ILayerMouseEvent,
  ILineFeature,
  IPointFeature,
  IPolygonFeature,
  IRenderType,
  ISceneMouseEvent,
} from '../../typings';
import { calcAreaText, isSameFeature } from '../../utils';
import { DrawerEvent, RenderEvent } from '../../constants';
import { Scene } from '@antv/l7';
import { BaseLineDrawer, IBaseLineDrawerOptions } from './BaseLineDrawer';

export interface IBasePolygonDrawerOptions extends IBaseLineDrawerOptions {
  areaText: false | IAreaOptions;
}

export const defaultAreaOptions: IAreaOptions = {
  format: (squareMeters: number) => {
    return squareMeters > 1000000
      ? `${+(squareMeters / 1000000).toFixed(2)}km²`
      : `${+squareMeters.toFixed(2)}m²`;
  },
  showOnNormal: true,
  showOnActive: true,
};

export abstract class BasePolygonDrawer<
  T extends IBasePolygonDrawerOptions,
> extends BaseLineDrawer<T> {
  constructor(scene: Scene, options?: DeepPartial<T>) {
    super(scene, options);
    this.polygonRender?.on(RenderEvent.mousemove, this.onPolygonMouseMove);
    this.polygonRender?.on(RenderEvent.mouseout, this.onPolygonMouseOut);
    this.polygonRender?.on(RenderEvent.mousedown, this.onPolygonMouseDown);
    this.polygonRender?.on(RenderEvent.dragging, this.onPolygonDragging);
    this.polygonRender?.on(RenderEvent.dragend, this.onPolygonDragEnd);
    this.polygonRender?.on(RenderEvent.unClick, this.onPolygonUnClick);
  }

  get editPolygon() {
    return (
      this.source.data.polygon.find((feature) => {
        const { isActive, isDraw } = feature.properties;
        return isActive && !isDraw;
      }) ?? null
    );
  }

  get dragPolygon() {
    return (
      this.source.data.polygon.find((feature) => {
        return feature.properties.isDrag;
      }) ?? null
    );
  }

  get drawPolygon() {
    return (
      this.source.data.polygon.find((feature) => feature.properties.isDraw) ??
      null
    );
  }

  get polygonRender() {
    return this.render.polygon;
  }

  getPolygonData() {
    return this.getTypeData<IPolygonFeature>('polygon');
  }

  setPolygonData(
    updater:
      | IPolygonFeature[]
      | ((features: IPolygonFeature[]) => IPolygonFeature[]),
    store = true,
  ) {
    return this.setTypeData<IPolygonFeature>('polygon', updater, store);
  }

  getAreaTextList(
    features: IPolygonFeature[],
    activeFeature: IPolygonFeature | null,
  ) {
    const { areaText } = this.options;
    return areaText
      ? features
          .filter((feature) => {
            return feature.geometry.coordinates?.[0]?.length > 2;
          })
          .map((feature) => {
            const isActive = isSameFeature(feature, activeFeature);
            return calcAreaText(feature, areaText, { isActive });
          })
          .flat()
          .filter((feature) =>
            feature.properties.isActive
              ? areaText.showOnActive
              : areaText.showOnNormal,
          )
      : [];
  }

  getDefaultOptions(options: DeepPartial<T>): T {
    return {
      ...super.getDefaultOptions(options),
      // @ts-ignore
      areaText: options.areaText
        ? {
            ...defaultAreaOptions,
            ...options.areaText,
          }
        : false,
    };
  }

  // 将polygon Nodes同步至polygon中各个信息的方法
  abstract syncPolygonNodes(feature: IPolygonFeature): void;

  getRenderList(): IRenderType[] {
    return ['polygon', 'line', 'dashLine', 'text', 'midPoint', 'point'];
  }

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {}

  setEditPolygon(editPolygon: IPolygonFeature | null) {
    if (editPolygon) {
      this.printEditPolygon(editPolygon);
      this.bindEditEvent();
    } else {
      this.setEditLine(null);
      this.setPolygonData((features) =>
        features.map((feature) => {
          feature.properties = {
            ...feature.properties,
            isDrag: false,
            isDraw: false,
            isActive: false,
            isHover: false,
          };
          return feature;
        }),
      );
      this.source.setData({
        text: [
          ...this.getDistanceTextList(this.getLineData(), null),
          ...this.getAreaTextList(this.getPolygonData(), null),
        ],
      });
    }
  }

  printEditPolygon(editPolygon: IPolygonFeature) {
    const otherPolygon = this.getPolygonData()
      .filter((feature) => !isSameFeature(feature, editPolygon))
      .map((feature) => {
        feature.properties.isActive = false;
        return feature;
      });
    Object.assign(editPolygon.properties, {
      isDraw: false,
      isActive: true,
      isHover: false,
    });
    this.setEditLine(editPolygon.properties.line);
    this.source.setData({
      point: editPolygon.properties.nodes,
      polygon: [...otherPolygon, editPolygon],
      text: [
        ...this.getDistanceTextList(
          this.getLineData(),
          editPolygon.properties.line,
        ),
        ...this.getAreaTextList(this.getPolygonData(), editPolygon),
      ],
    });
  }

  abstract drawPolygonFinish(): void;

  onLineUnClick(e: ILayerMouseEvent) {}

  onLineMouseDown(e: ILayerMouseEvent<ILineFeature>) {
    const targetPolygon = this.getPolygonData().find((feature) =>
      isSameFeature(feature.properties.line, e.feature),
    );
    if (targetPolygon) {
      this.onPolygonMouseDown({
        ...e,
        feature: targetPolygon,
      });
    }
  }

  onLineDragging(e: ILayerMouseEvent<ILineFeature>) {
    const targetPolygon = this.getPolygonData().find((feature) =>
      isSameFeature(feature.properties.line, e.feature),
    );
    if (targetPolygon) {
      this.onPolygonDragging({
        ...e,
        feature: targetPolygon,
      });
    }
  }

  onLineDragEnd(e: ILayerMouseEvent<ILineFeature>) {
    const targetPolygon = this.getPolygonData().find((feature) =>
      isSameFeature(feature.properties.line, e.feature),
    );
    if (targetPolygon) {
      this.onPolygonDragEnd({
        ...e,
        feature: targetPolygon,
      });
    }
  }

  onPolygonMouseMove(e: ILayerMouseEvent<IPolygonFeature>) {
    this.onLineMouseMove({
      ...e,
      feature: e.feature?.properties.line,
    });
    if (this.dragPolygon || this.drawPolygon) {
      return;
    }
    this.setCursor('polygonHover');
    this.setPolygonData((features) =>
      features.map((feature) => {
        feature.properties.isHover = isSameFeature(e.feature, feature);
        return feature;
      }),
    );
  }

  onPolygonMouseOut(e: ILayerMouseEvent<IPolygonFeature>) {
    this.onLineMouseOut({
      ...e,
      feature: e.feature?.properties.line,
    });
    if (this.dragPolygon || this.drawPolygon) {
      return;
    }
    this.setPolygonData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
  }

  onPolygonMouseDown(e: ILayerMouseEvent<IPolygonFeature>) {
    const currentPolygon = e.feature;
    if (!currentPolygon || !this.options.editable || this.drawPolygon) {
      return;
    }

    this.previousLngLat = e.lngLat;
    this.setEditPolygon(currentPolygon);
    this.setPolygonData((features) =>
      features.map((feature) => {
        feature.properties.isDrag = isSameFeature(e.feature, feature);
        return feature;
      }),
    );
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.setCursor('polygonDrag');
    this.emit(DrawerEvent.dragStart, currentPolygon, this.getPolygonData());
  }

  onPolygonDragging(e: ILayerMouseEvent<IPolygonFeature>) {
    const dragPolygon = this.dragPolygon;
    if (!dragPolygon || !this.options.editable || this.dragPoint) {
      return;
    }
    const { lng: newLng, lat: newLat } = e.lngLat;
    const { lng: oldLng, lat: oldLat } = this.previousLngLat;
    const diffLng = newLng - oldLng;
    const diffLat = newLat - oldLat;
    dragPolygon.properties.nodes.forEach((node) => {
      const [lng, lat] = node.geometry.coordinates;
      node.geometry.coordinates = [lng + diffLng, lat + diffLat];
    });
    this.syncPolygonNodes(dragPolygon);
    this.previousLngLat = e.lngLat;
    this.setEditPolygon(dragPolygon);
    this.setCursor('polygonDrag');
    this.emit(DrawerEvent.dragging, dragPolygon, this.getPolygonData());
  }

  onPolygonDragEnd(e: ILayerMouseEvent<IPolygonFeature>) {
    const dragPolygon = this.dragPolygon;
    if (!dragPolygon || !this.options.editable || this.dragPoint) {
      return;
    }
    this.setPolygonData((features) =>
      features.map((feature) => {
        feature.properties.isDrag = false;
        return feature;
      }),
    );
    this.scene.setMapStatus({
      dragEnable: true,
    });
    this.setCursor('polygonHover');
    this.emit(DrawerEvent.dragEnd, dragPolygon, this.getPolygonData());
    this.emit(DrawerEvent.edit, dragPolygon, this.getPolygonData());
    this.emit(DrawerEvent.change, this.getPolygonData());
  }

  onPolygonUnClick() {
    if (this.editPolygon) {
      this.setEditPolygon(null);
    }
  }

  onSceneDblClick(e: ISceneMouseEvent) {
    this.drawPolygonFinish();
  }

  bindEvent() {
    super.bindEvent();

    this.polygonRender?.enableUnClick();
    if (this.options.editable) {
      this.polygonRender?.enableHover();
      this.polygonRender?.enableDrag();
    }
  }

  unbindEvent() {
    super.unbindEvent();

    this.polygonRender?.disableUnClick();
    if (this.options.editable) {
      this.polygonRender?.disableHover();
      this.polygonRender?.disableDrag();
    }
  }

  bindThis() {
    super.bindThis();

    this.onPointDragging = this.onPointDragging.bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
    this.onPointClick = this.onPointClick.bind(this);

    this.onLineUnClick = this.onLineUnClick.bind(this);
    this.onLineMouseDown = this.onLineMouseDown.bind(this);
    this.onLineDragging = this.onLineDragging.bind(this);
    this.onLineDragEnd = this.onLineDragEnd.bind(this);

    this.onPolygonMouseMove = this.onPolygonMouseMove.bind(this);
    this.onPolygonMouseOut = this.onPolygonMouseOut.bind(this);
    this.onPolygonMouseDown = this.onPolygonMouseDown.bind(this);
    this.onPolygonDragging = this.onPolygonDragging.bind(this);
    this.onPolygonDragEnd = this.onPolygonDragEnd.bind(this);
    this.onPolygonUnClick = this.onPolygonUnClick.bind(this);
    this.onSceneDblClick = this.onSceneDblClick.bind(this);
  }
}
