import {
  DeepPartial,
  IDashLineFeature,
  IDistanceOptions,
  IDrawerOptions,
  IDrawerOptionsData,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
  ISourceData,
  ITextFeature,
} from '../../typings';
import { Scene } from '@antv/l7';
import { NodeDrawer } from './NodeDrawer';
import {
  calcMidPointList,

  getUuid,
  isSameFeature,
  createLineString,
  transformLineFeature,
  calcDistanceText,
} from '../../utils';
import {
  coordAll,
  featureCollection,
  point,
  Position,
  lineString,
} from '@turf/turf';
import { last } from 'lodash';
import { RenderEvent } from '../../constants';

export interface IBaseLineDrawerOptions extends IDrawerOptions {
  allowOverlap: boolean;
  showMidPoint: boolean;
  distanceText: false | IDistanceOptions;
}

export const defaultDistanceOptions: IDistanceOptions = {
  total: false,
  showOnDash: true,
  format: (meters) => {
    if (meters >= 1000) {
      return +(meters / 1000).toFixed(2) + 'km';
    } else {
      return +meters.toFixed(2) + 'm';
    }
  },
};

export abstract class BaseLineDrawer<
  T extends IBaseLineDrawerOptions = IBaseLineDrawerOptions,
> extends NodeDrawer<T> {
  constructor(scene: Scene, options?: DeepPartial<T>) {
    super(scene, options);

    this.pointRender?.on(RenderEvent.click, this.onPointClick);
    this.midPointRender?.on(RenderEvent.click, this.onMidPointClick);
    this.midPointRender?.on(RenderEvent.mousemove, this.onMidPointMouseMove);
    this.midPointRender?.on(RenderEvent.mouseout, this.onMidPointMouseOut);
    this.lineRender?.on(RenderEvent.mousemove, this.onLineMouseMove);
    this.lineRender?.on(RenderEvent.mouseout, this.onLineMouseOut);
    this.lineRender?.on(RenderEvent.mousedown, this.onLineMouseDown);
    this.lineRender?.on(RenderEvent.dragging, this.onLineDragging);
    this.lineRender?.on(RenderEvent.dragend, this.onLineDragEnd);
    this.lineRender?.on(RenderEvent.unClick, this.onLineUnClick);
  }

  get editLine() {
    return this.source.data.line.find((feature) => {
      const { isActive, isDraw } = feature.properties;
      return isActive && !isDraw;
    });
  }

  get dragLine() {
    return this.source.data.line.find((feature) => {
      return feature.properties.isDrag;
    });
  }

  get drawLine() {
    return (
      this.source.data.line.find((feature) => feature.properties.isDraw) ?? null
    );
  }

  get lineRender() {
    return this.render.line;
  }

  get midPointRender() {
    return this.render.midPoint;
  }

  initData(data: IDrawerOptionsData): Partial<ISourceData> | undefined {
    if (data.line?.length) {
      const sourceData: Partial<ISourceData> = {};
      const line = data.line.map((feature) => transformLineFeature(feature));
      const editLine = line.find((feature) => feature.properties.isActive);
      sourceData.line = line;
      sourceData.text = this.getDistanceTextList(line, editLine ?? null);
      setTimeout(() => {
        if (editLine && this.options.editable && this.isEnable) {
          this.setEditLine(editLine);
        }
      }, 0);
      return sourceData;
    }
  }

  getLineData() {
    return this.getTypeData<ILineFeature>('line');
  }

  setLineData(
    updater: ILineFeature[] | ((features: ILineFeature[]) => ILineFeature[]),
    store = true,
  ) {
    return this.setTypeData<ILineFeature>('line', updater, store);
  }

  getMidPointList(lineFeature: ILineFeature) {
    return this.options.showMidPoint ? calcMidPointList(lineFeature) : [];
  }

  getDistanceTextList(
    features: (ILineFeature | IDashLineFeature)[],
    activeFeature: ILineFeature | IDashLineFeature | null,
  ) {
    const { distanceText } = this.options;
    return distanceText
      ? features
          .map((feature) => {
            const isActive = isSameFeature(feature, activeFeature);
            return calcDistanceText(feature, distanceText).map((feature) => {
              feature.properties.isActive = isActive;
              return feature;
            });
          })
          .flat()
      : [];
  }

  getDashLineDistanceTextList(features: (ILineFeature | IDashLineFeature)[]) {
    return this.options.distanceText && this.options.distanceText.showOnDash
      ? this.getDistanceTextList(features, null).map((feature) => {
          feature.properties.isActive = true;
          return feature;
        })
      : [];
  }

  getDashLineData() {
    return this.getTypeData<IDashLineFeature>('dashLine');
  }

  setDashLineData(
    updater:
      | IDashLineFeature[]
      | ((features: IDashLineFeature[]) => IDashLineFeature[]),
    store = true,
  ) {
    return this.setTypeData<IDashLineFeature>('dashLine', updater, store);
  }

  getDefaultOptions(options: DeepPartial<T>): T {
    return {
      ...this.getCommonOptions(),
      allowOverlap: false,
      distanceText: options.distanceText ? defaultDistanceOptions : false,
      showMidPoint: true,
    } as T;
  }

  getRenderList(): IRenderType[] {
    return ['line', 'dashLine', 'text', 'midPoint', 'point'];
  }

  onPointUnClick(e: ILayerMouseEvent<IPointFeature>) {
    if (
      this.editLine ||
      (this.scene.getPickedLayer() !== -1 && !this.drawLine)
    ) {
      return;
    }
    super.onPointUnClick(e);
    const feature = e.feature!;
    let newSourceData: Partial<ISourceData> = {};
    if (this.drawLine) {
      const drawLine = this.drawLine;
      drawLine.geometry.coordinates.push(feature.geometry.coordinates);
      drawLine.properties.nodes.push(feature);
      newSourceData = {
        line: this.getLineData().map((feature) => {
          if (isSameFeature(feature, drawLine)) {
            return drawLine;
          }
          return feature;
        }),
        text: this.getDistanceTextList(this.getLineData(), this.drawLine),
        dashLine: [],
      };
    } else {
      const newLine = createLineString(feature.geometry.coordinates, {
        id: getUuid('line'),
        nodes: [feature],
        isHover: false,
        isActive: true,
        isDrag: false,
        isDraw: true,
      });

      newSourceData = {
        point: newLine.properties.nodes,
        line: [
          ...this.getLineData().map((feature) => {
            feature.properties.isActive = false;
            return feature;
          }),
          newLine,
        ],
        dashLine: [],
      };
    }
    this.source.setData(newSourceData, true);
  }

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {
    if (this.drawLine) {
      const isLastNode = isSameFeature(
        e.feature,
        last(this.drawLine.properties.nodes),
      );
      if (isLastNode && this.drawLine.properties.nodes.length > 1) {
        this.drawLineFinish();
      } else if (this.options.allowOverlap && e.feature) {
        e.feature.id = getUuid('point');
        this.onPointUnClick(e);
      }
    }
  }

  drawLineFinish() {
    const drawLine = this.drawLine;
    if (drawLine) {
      const { editable, autoFocus } = this.options;
      const isActive = editable && autoFocus;
      drawLine.properties.createTime = Date.now();
      this.setEditLine(isActive ? drawLine : null);
    }
  }

  setEditLine(editLine: ILineFeature | null) {
    if (editLine) {
      this.printEditLine(editLine);
      this.bindEditEvent();
    } else {
      this.source.setData({
        point: [],
        line: this.getLineData().map((feature) => {
          feature.properties = {
            ...feature.properties,
            isDrag: false,
            isDraw: false,
            isActive: false,
            isHover: false,
          };
          return feature;
        }),
        text: this.getDistanceTextList(this.getLineData(), null),
        dashLine: [],
        midPoint: [],
      });
      this.unbindEditEvent();
    }
  }

  printEditLine(editLine: ILineFeature) {
    const otherLines = this.getLineData()
      .filter((feature) => !isSameFeature(feature, editLine))
      .map((feature) => {
        feature.properties.isActive = false;
        return feature;
      });
    Object.assign(editLine.properties, {
      isDraw: false,
      isActive: true,
      isHover: false,
    });

    const point = editLine.properties.nodes.map((feature) => {
      feature.properties = {
        ...feature.properties,
        isHover: false,
        isActive: false,
      };
      return feature;
    });

    this.source.setData({
      point,
      line: [...otherLines, editLine],
      dashLine: [],
      midPoint: this.getMidPointList(editLine),
      text: this.getDistanceTextList(this.getLineData(), editLine),
    });
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    // 当前在绘制线路中，且含有nodes节点，则需要最后一个节点和鼠标之间用虚线连接
    if (this.drawLine?.properties.nodes.length) {
      const lastNode = last(this.drawLine.properties.nodes)!;
      const { lng, lat } = e.lnglat;
      const newDashLine = lineString([
        ...coordAll(lastNode),
        [lng, lat],
      ]) as IDashLineFeature;
      this.setDashLineData([newDashLine]);

      let text: ITextFeature[] = [];
      text.push(...this.getDistanceTextList(this.getLineData(), this.drawLine));

      if (this.options.distanceText && this.options.distanceText.showOnDash) {
        text.push(...this.getDashLineDistanceTextList([newDashLine]));
      }

      this.source.setData({
        dashLine: [newDashLine],
        text,
      });
    }
  }

  onPointDragging(e: ISceneMouseEvent) {
    const editLine = this.editLine;
    if (!editLine) {
      return;
    }
    super.onPointDragging(e);
    editLine.properties.nodes = this.getPointData();
    editLine.geometry.coordinates = coordAll(
      featureCollection(editLine.properties.nodes),
    );
    this.source.setData({
      line: this.getLineData().map((feature) => {
        if (isSameFeature(feature, editLine)) {
          return editLine;
        }
        return feature;
      }),
      midPoint: this.getMidPointList(editLine),
      text: this.getDistanceTextList(this.getLineData(), editLine),
    });
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    if (!this.dragPoint || !this.options.editable) {
      return;
    }
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
  }

  onMidPointMouseMove(e: ILayerMouseEvent<IMidPointFeature>) {
    this.setCursor('pointHover');
  }

  onMidPointMouseOut(e: ILayerMouseEvent<IMidPointFeature>) {
    this.setMouseOutCursor();
  }

  onLineMouseMove(e: ILayerMouseEvent<ILineFeature>) {
    if (this.dragLine || this.drawLine) {
      return;
    }
    this.setCursor('lineHover');
    this.setLineData((features) =>
      features.map((feature) => {
        feature.properties.isHover = isSameFeature(e.feature, feature);
        return feature;
      }),
    );
  }

  onLineMouseOut(e: ILayerMouseEvent<ILineFeature>) {
    if (this.dragLine || this.drawLine) {
      return;
    }
    this.setMouseOutCursor();
    this.setLineData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
  }

  onLineMouseDown(e: ILayerMouseEvent<ILineFeature>) {
    const currentLine = e.feature;
    if (!currentLine || !this.options.editable || this.drawLine) {
      return;
    }

    this.previousLngLat = e.lngLat;
    this.setEditLine(currentLine);
    this.setLineData((features) =>
      features.map((feature) => {
        feature.properties.isDrag = isSameFeature(e.feature, feature);
        return feature;
      }),
    );
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.setCursor('lineDrag');
  }

  onLineDragging(e: ILayerMouseEvent<ILineFeature>) {
    const dragLine = this.dragLine;
    if (!dragLine || !this.options.editable || this.dragPoint) {
      return;
    }
    const { lng: newLng, lat: newLat } = e.lngLat;
    const { lng: oldLng, lat: oldLat } = this.previousLngLat;
    const diffLng = newLng - oldLng;
    const diffLat = newLat - oldLat;
    const nodes = dragLine.properties.nodes;
    const pointList: Position[] = [];
    nodes.forEach((node) => {
      const [lng, lat] = node.geometry.coordinates;
      node.geometry.coordinates = [lng + diffLng, lat + diffLat];
      pointList.push(node.geometry.coordinates);
    });
    dragLine.geometry.coordinates = pointList;
    this.previousLngLat = e.lngLat;
    this.setEditLine(dragLine);
    this.setCursor('lineDrag');
  }

  onLineDragEnd(e: ILayerMouseEvent<ILineFeature>) {
    const dragLine = this.dragLine;
    if (!dragLine || !this.options.editable || this.dragPoint) {
      return;
    }
    this.setLineData((features) =>
      features.map((feature) => {
        feature.properties.isDrag = false;
        return feature;
      }),
    );
    this.scene.setMapStatus({
      dragEnable: true,
    });
    this.setCursor('lineHover');
  }

  onLineUnClick(e: ILayerMouseEvent<ILineFeature>) {
    if (this.editLine) {
      this.setEditLine(null);
    }
  }

  onMidPointClick(e: ILayerMouseEvent<IMidPointFeature>) {
    const feature = e.feature!;
    if (!feature) {
      return;
    }
    const editLine = this.editLine!;
    const nodes = editLine.properties.nodes;
    const { startId, endId } = feature.properties;
    const startIndex = nodes.findIndex(
      (feature) => feature.properties.id === startId,
    );
    const endIndex = nodes.findIndex(
      (feature) => feature.properties.id === endId,
    );
    if (startIndex > -1 && endIndex > -1) {
      const newNode = point(feature.geometry.coordinates, {
        id: getUuid('point'),
        isHover: false,
        isActive: false,
        isDrag: false,
      }) as IPointFeature;
      nodes.splice(endIndex, 0, newNode);
      editLine.geometry.coordinates = coordAll(featureCollection(nodes));
      // TODO: 当允许创建重复点时，添加点会出现问题
      this.printEditLine(editLine);
    }
  }

  onSceneDblClick(e: ISceneMouseEvent) {
    this.drawLineFinish();
  }

  setMouseOutCursor() {
    this.setCursor('draw');
  }

  bindEvent() {
    this.pointRender?.enableCreate();
    this.pointRender?.enableClick();
    this.lineRender?.enableUnClick();
    this.scene?.on('mousemove', this.onSceneMouseMove);
    this.scene?.on('dblclick', this.onSceneDblClick);
    if (this.options.editable) {
      this.lineRender?.enableHover();
      this.lineRender?.enableDrag();
    }
  }

  unbindEvent() {
    this.pointRender?.disableCreate();
    this.pointRender?.disableClick();
    this.lineRender?.disableUnClick();
    this.scene?.off('mousemove', this.onSceneMouseMove);
    this.scene?.off('dblclick', this.onSceneDblClick);
    if (this.options.editable) {
      this.lineRender?.disableHover();
      this.lineRender?.disableDrag();
    }
  }

  bindEditEvent() {
    this.pointRender?.enableDrag();
    this.pointRender?.enableHover();
    this.midPointRender?.enableClick();
    this.midPointRender?.enableHover();
  }

  unbindEditEvent() {
    this.pointRender?.disableHover();
    this.pointRender?.disableDrag();
    this.midPointRender?.disableClick();
    this.midPointRender?.disableHover();
  }

  bindThis() {
    super.bindThis();
    this.onPointUnClick = this.onPointUnClick.bind(this);
    this.onPointDragging = this.onPointDragging.bind(this);
    this.onSceneMouseMove = this.onSceneMouseMove.bind(this);
    this.onPointClick = this.onPointClick.bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
    this.onMidPointClick = this.onMidPointClick.bind(this);
    this.onMidPointMouseMove = this.onMidPointMouseMove.bind(
      this,
    );
    this.onMidPointMouseOut = this.onMidPointMouseOut.bind(
      this,
    );
    this.onLineMouseMove = this.onLineMouseMove.bind(this);
    this.onLineMouseOut = this.onLineMouseOut.bind(this);
    this.onLineMouseDown = this.onLineMouseDown.bind(this);
    this.onLineDragging = this.onLineDragging.bind(this);
    this.onLineDragEnd = this.onLineDragEnd.bind(this);
    this.onLineUnClick = this.onLineUnClick.bind(this);
    this.onSceneDblClick = this.onSceneDblClick.bind(this);
  }
}
