import { ILineDrawerOptions, LineDrawer } from './LineDrawer';
import {
  DeepPartial,
  IDashLineFeature,
  IDrawerOptionsData,
  ILayerMouseEvent,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  IRenderType,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import {
  createPolygon,
  debounceMoveFn,
  getUuid,
  isSameFeature,
  syncPolygonNodes,
  transformPolygonFeature,
} from '../utils';
import { cloneDeep, first, last } from 'lodash';
import { coordAll, featureCollection, lineString } from '@turf/turf';
import { DrawerEvent, RenderEvent } from '../constants';
import { Scene } from '@antv/l7';
import {
  BaseLineDrawer,
  IBaseLineDrawerOptions,
} from './common/BaseLineDrawer';

export interface IPolygonDrawerOptions extends IBaseLineDrawerOptions {}

export class PolygonDrawer extends BaseLineDrawer<IPolygonDrawerOptions> {
  constructor(scene: Scene, options?: DeepPartial<IPolygonDrawerOptions>) {
    super(scene, options);

    this.polygonRender?.on(RenderEvent.mousemove, this.onPolygonMouseMove);
    this.polygonRender?.on(RenderEvent.mouseout, this.onPolygonMouseOut);
    this.polygonRender?.on(RenderEvent.mousedown, this.onPolygonMouseDown);
    this.polygonRender?.on(RenderEvent.dragging, this.onPolygonDragging);
    this.polygonRender?.on(RenderEvent.dragend, this.onPolygonDragEnd);
    this.polygonRender?.on(RenderEvent.unClick, this.onPolygonUnClick);
  }

  get editPolygon() {
    return this.source.data.polygon.find(feature => {
      const { isActive, isDraw } = feature.properties;
      return isActive && !isDraw;
    });
  }

  get dragPolygon() {
    return this.source.data.polygon.find(feature => {
      return feature.properties.isDrag;
    });
  }

  get drawPolygon() {
    return (
      this.source.data.polygon.find(feature => feature.properties.isDraw) ??
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

  initData(data: IDrawerOptionsData): Partial<ISourceData> | undefined {
    if (data.polygon?.length) {
      const sourceData: Partial<ISourceData> = {};
      const polygon = data.polygon.map(feature =>
        transformPolygonFeature(feature),
      );
      const editPolygon = polygon.find(feature => feature.properties.isActive);
      if (editPolygon && this.options.editable && this.isEnable) {
        setTimeout(() => {
          this.setEditPolygon(editPolygon);
        }, 0);
      }
      sourceData.polygon = polygon;
      return sourceData;
    }
  }

  getRenderList(): IRenderType[] {
    return ['polygon', 'line', 'dashLine', 'midPoint', 'point'];
  }

  onPointUnClick(e: ILayerMouseEvent<IPointFeature>) {
    if (
      this.editPolygon ||
      (this.scene.getPickedLayer() !== -1 && !this.drawPolygon)
    ) {
      return;
    }
    super.onPointUnClick(e);
    const currentFeature = e.feature!;
    const drawPolygon = this.drawPolygon;
    let newSourceData: Partial<ISourceData> = {};
    if (drawPolygon) {
      drawPolygon.properties.nodes.push(currentFeature);
      syncPolygonNodes(drawPolygon);
      const firstNode = first(drawPolygon.properties.nodes)!;
      newSourceData = {
        polygon: this.getPolygonData().map(feature => {
          if (isSameFeature(feature, drawPolygon)) {
            return drawPolygon;
          }
          return feature;
        }),
        dashLine: [
          lineString(
            coordAll(featureCollection([currentFeature, firstNode])),
          ) as IDashLineFeature,
        ],
      };
    } else {
      const newPolygon = createPolygon(currentFeature.geometry.coordinates, {
        id: getUuid('polygon'),
        nodes: [currentFeature],
        isHover: false,
        isActive: true,
        isDrag: false,
        isDraw: true,
        line: this.drawLine!,
      });

      newSourceData = {
        polygon: [
          ...this.getPolygonData().map(feature => {
            feature.properties.isActive = false;
            return feature;
          }),
          newPolygon,
        ],
      };
    }
    this.source.setData(newSourceData);
  }

  onPointDragging(e: ISceneMouseEvent) {
    const editPolygon = this.editPolygon;
    if (!editPolygon || !this.editLine) {
      return;
    }
    // TODO: 当拖拽初始点时，会出Bug
    super.onPointDragging(e);
    editPolygon.properties.nodes = this.editLine.properties.nodes;
    syncPolygonNodes(editPolygon);
    this.setPolygonData(features =>
      features.map(feature => {
        if (isSameFeature(feature, editPolygon)) {
          return editPolygon;
        }
        return feature;
      }),
    );
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    if (this.dragPoint && this.options.editable) {
      this.setPointData(data =>
        data.map(feature => {
          if (isSameFeature(this.dragPoint, feature)) {
            feature.properties.isActive = feature.properties.isDrag = false;
          }
          return feature;
        }),
      );
      this.scene.setMapStatus({
        dragEnable: true,
      });
      this.setCursor('pointHover');
      this.emit(DrawerEvent.edit, this.editPolygon, this.getPolygonData());
    }
  }

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {
    const feature = e.feature;
    if (this.drawPolygon && feature && this.drawLine) {
      const isFirstNode = isSameFeature(
        feature,
        first(this.drawPolygon.properties.nodes),
      );
      const isLastNode = isSameFeature(
        feature,
        last(this.drawPolygon.properties.nodes),
      );
      const drawLine = this.drawLine!;
      if (isFirstNode || isLastNode) {
        const firstPoint = cloneDeep(first(this.drawPolygon.properties.nodes))!;
        firstPoint.properties.id = getUuid('point');
        drawLine.properties.nodes.push(firstPoint);
        drawLine.geometry.coordinates.push(firstPoint.geometry.coordinates);
        this.drawLineFinish();
      } else if (this.options.allowOverlap) {
        this.onPointUnClick(e);
      }
    }
  }

  setEditPolygon(editPolygon: IPolygonFeature | null) {
    if (editPolygon) {
      this.setEditLine(editPolygon.properties.line);
      this.printEditPolygon(editPolygon);
      this.bindEditEvent();
    } else {
      this.setPolygonData(features =>
        features.map(feature => {
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
      this.setEditLine(null);
    }
  }

  printEditPolygon(editPolygon: IPolygonFeature) {
    const otherPolygon = this.getPolygonData()
      .filter(feature => !isSameFeature(feature, editPolygon))
      .map(feature => {
        feature.properties.isActive = false;
        return feature;
      });
    Object.assign(editPolygon.properties, {
      isDraw: false,
      isActive: true,
      isHover: false,
    });
    this.setPolygonData([...otherPolygon, editPolygon]);
    this.setEditLine(editPolygon.properties.line);
  }

  onMidPointClick(e: ILayerMouseEvent<IMidPointFeature>) {
    super.onMidPointClick(e);
    console.log(this.editLine);
    // const editPolygon = this.editPolygon;
    // if (editPolygon && this.editLine) {
    //   editPolygon.properties.nodes = this.editLine.properties.nodes;
    //   syncPolygonNodes(editPolygon);
    //   this.setPolygonData(features =>
    //     features.map(feature => {
    //       if (isSameFeature(feature, editPolygon)) {
    //         return editPolygon;
    //       }
    //       return feature;
    //     }),
    //   );
    // }
  }

  drawLineFinish() {
    const drawPolygon = this.drawPolygon;
    if (drawPolygon) {
      const { editable, autoFocus } = this.options;
      const isActive = editable && autoFocus;
      this.setEditPolygon(isActive ? drawPolygon : null);
      this.emit(DrawerEvent.add, drawPolygon, this.getPolygonData());
      this.emit(DrawerEvent.change, this.getPolygonData());
    }
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    if (!this.drawPolygon) {
      return;
    }
    const dashLine: IDashLineFeature[] = [];
    const nodes = this.drawPolygon.properties.nodes;
    const nodesLength = nodes.length;
    if (nodesLength) {
      const { lng, lat } = e.lnglat;
      const lastNode = last(nodes) as IPointFeature;
      dashLine.push(
        lineString([...coordAll(lastNode), [lng, lat]]) as IDashLineFeature,
      );
      if (nodesLength > 1) {
        const firstNode = first(nodes) as IPointFeature;
        dashLine.push(
          lineString([...coordAll(firstNode), [lng, lat]]) as IDashLineFeature,
        );
      }
    }
    this.source.setData({
      dashLine,
    });
  }

  onLineUnClick(e: ILayerMouseEvent) {}

  onPolygonMouseMove(e: ILayerMouseEvent<IPolygonFeature>) {
    this.onLineMouseMove({
      ...e,
      feature: e.feature?.properties.line,
    });
    if (this.dragPolygon || this.drawPolygon) {
      return;
    }
    this.setCursor('polygonHover');
    this.setPolygonData(features =>
      features.map(feature => {
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
    this.setPolygonData(features =>
      features.map(feature => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
  }
  onPolygonMouseDown(e: ILayerMouseEvent<IPolygonFeature>) {}

  onPolygonDragging(e: ILayerMouseEvent<IPolygonFeature>) {}

  onPolygonDragEnd(e: ILayerMouseEvent<IPolygonFeature>) {}

  onPolygonUnClick(e: ILayerMouseEvent<IPolygonFeature>) {
    if (this.editPolygon) {
      this.setEditPolygon(null);
    }
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
    this.onPointUnClick = this.onPointUnClick.bind(this);
    this.onPointDragging = debounceMoveFn(this.onPointDragging).bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
    this.onPointClick = this.onPointClick.bind(this);
    this.onMidPointClick = this.onMidPointClick.bind(this);
    this.onSceneMouseMove = debounceMoveFn(this.onSceneMouseMove).bind(this);
    this.onLineUnClick = this.onLineUnClick.bind(this);
    this.onPolygonMouseMove = debounceMoveFn(this.onPolygonMouseMove).bind(
      this,
    );
    this.onPolygonMouseOut = this.onPolygonMouseOut.bind(this);
    this.onPolygonMouseDown = this.onPolygonMouseDown.bind(this);
    this.onPolygonDragging = debounceMoveFn(this.onPolygonDragging).bind(this);
    this.onPolygonDragEnd = this.onPolygonDragEnd.bind(this);
    this.onPolygonUnClick = this.onPolygonUnClick.bind(this);
  }
}
