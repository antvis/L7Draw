import {
  DeepPartial,
  IAreaOptions,
  IDashLineFeature,
  IDrawerOptionsData,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  IRenderType,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import {
  calcAreaText,
  createPolygon,
  getLngLat,
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

export interface IPolygonDrawerOptions extends IBaseLineDrawerOptions {
  areaText: false | IAreaOptions;
}

export const defaultAreaOptions: IAreaOptions = {
  format: (squareMeters: number) => {
    return squareMeters > 1000000
      ? `${+(squareMeters / 1000000).toFixed(2)}km²`
      : `${+squareMeters.toFixed(2)}m²`;
  },
};

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
          .filter((feature) => feature.properties.nodes.length > 2)
          .map((feature) => {
            const isActive = isSameFeature(feature, activeFeature);
            const area = calcAreaText(feature, areaText);
            area.properties.isActive = isActive;
            return area;
          })
          .flat()
      : [];
  }

  initData(data: IDrawerOptionsData): Partial<ISourceData> | undefined {
    if (data.polygon?.length) {
      const sourceData: Partial<ISourceData> = {};
      const polygon = data.polygon.map((feature) =>
        transformPolygonFeature(feature),
      );
      const editPolygon = polygon.find(
        (feature) => feature.properties.isActive,
      );
      setTimeout(() => {
        if (editPolygon && this.options.editable && this.isEnable) {
          this.setEditPolygon(editPolygon);
        }
      }, 0);
      sourceData.polygon = polygon;
      sourceData.line = polygon.map((feature) => feature.properties.line);
      sourceData.text = [
        ...this.getDistanceTextList(
          sourceData.line,
          editPolygon?.properties.line ?? null,
        ),
        ...this.getAreaTextList(sourceData.polygon, editPolygon ?? null),
      ];
      return sourceData;
    }
  }

  getDefaultOptions(
    options: DeepPartial<IPolygonDrawerOptions>,
  ): IPolygonDrawerOptions {
    return {
      ...super.getDefaultOptions(options),
      areaText: options.areaText ? defaultAreaOptions : false,
    };
  }

  getRenderList(): IRenderType[] {
    return ['polygon', 'line', 'dashLine', 'text', 'midPoint', 'point'];
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
      const dashLine = [
        lineString(
          coordAll(featureCollection([currentFeature, firstNode])),
        ) as IDashLineFeature,
      ];
      newSourceData = {
        polygon: this.getPolygonData().map((feature) => {
          if (isSameFeature(feature, drawPolygon)) {
            return drawPolygon;
          }
          return feature;
        }),
        dashLine,
        text: [
          ...this.getDistanceTextList(this.getLineData(), this.drawLine),
          ...this.getDashLineDistanceTextList(dashLine),
          ...this.getAreaTextList(this.getPolygonData(), this.drawPolygon),
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
          ...this.getPolygonData().map((feature) => {
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
    const dragPoint = this.dragPoint;
    if (!editPolygon || !this.editLine || !dragPoint) {
      return;
    }
    super.onPointDragging(e);

    const firstNode = first(this.editLine.properties.nodes);
    const lastNode = last(this.editLine.properties.nodes);

    if (
      firstNode &&
      lastNode &&
      [firstNode, lastNode].find((node) => isSameFeature(dragPoint, node))
    ) {
      firstNode.geometry.coordinates = lastNode.geometry.coordinates =
        dragPoint.geometry.coordinates;
    }

    editPolygon.properties.nodes = this.editLine.properties.nodes;
    syncPolygonNodes(editPolygon);
    this.source.setData({
      polygon: this.getPolygonData(),
      text: [
        ...this.getDistanceTextList(this.getLineData(), this.editLine),
        ...this.getAreaTextList(this.getPolygonData(), this.editPolygon),
      ],
    });
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    if (this.dragPoint && this.options.editable) {
      this.setPointData((data) =>
        data.map((feature) => {
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
      this.emit(DrawerEvent.change, this.getPolygonData());
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
        this.drawPolygonFinish();
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
      this.setEditLine(null);
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
    this.setPolygonData([...otherPolygon, editPolygon]);
    this.setEditLine(editPolygon.properties.line);
    this.source.setData({
      text: [
        ...this.getDistanceTextList(
          this.getLineData(),
          editPolygon.properties.line,
        ),
        ...this.getAreaTextList(this.getPolygonData(), editPolygon),
      ],
    });
  }

  onMidPointClick(e: ILayerMouseEvent<IMidPointFeature>) {
    super.onMidPointClick(e);
    if (this.editPolygon) {
      const lineNodes = this.editPolygon.properties.line.properties.nodes;
      this.editPolygon.properties.nodes = lineNodes.slice(
        0,
        lineNodes.length - 1,
      );
      this.source.setData({
        text: [
          ...this.getDistanceTextList(
            this.getLineData(),
            this.editLine ?? null,
          ),
          ...this.getAreaTextList(this.getPolygonData(), this.editPolygon),
        ],
      });
    }
  }

  drawPolygonFinish() {
    const drawPolygon = this.drawPolygon;
    const drawLine = drawPolygon?.properties.line;
    if (drawPolygon && drawLine) {
      const firstPoint = cloneDeep(first(drawPolygon.properties.nodes))!;
      firstPoint.properties.id = getUuid('point');
      drawLine.properties.nodes.push(firstPoint);
      drawLine.properties.createTime = Date.now();
      drawLine.geometry.coordinates.push(firstPoint.geometry.coordinates);
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
      const { lng, lat } = getLngLat(e);
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
      text: [
        ...this.getDistanceTextList(this.getLineData(), this.drawLine),
        ...this.getDashLineDistanceTextList(dashLine),
        ...this.getAreaTextList(this.getPolygonData(), this.drawPolygon),
      ],
    });
  }

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
    syncPolygonNodes(dragPolygon);
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

  onPolygonUnClick(e: ILayerMouseEvent<IPolygonFeature>) {
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

    this.onPointUnClick = this.onPointUnClick.bind(this);
    this.onPointDragging = this.onPointDragging.bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
    this.onPointClick = this.onPointClick.bind(this);
    this.onMidPointClick = this.onMidPointClick.bind(this);
    this.onSceneMouseMove = this.onSceneMouseMove.bind(this);

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
