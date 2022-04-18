import {
  DeepPartial,
  IDashLineFeature,
  IDrawerOptions,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import { Scene } from '@antv/l7';
import { NodeDrawer } from './NodeDrawer';
import {
  calcMidPointList,
  debounceMoveFn,
  getUuid,
  isSameFeature,
  lineString,
} from '../utils';
import { coordAll, featureCollection, point, Position } from '@turf/turf';
import { last } from 'lodash';
import { RenderEvent } from '../constants';

export interface ILineDrawerOptions extends IDrawerOptions {}

export class LineDrawer extends NodeDrawer<ILineDrawerOptions> {
  constructor(scene: Scene, options?: DeepPartial<ILineDrawerOptions>) {
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
  }

  get editLine() {
    return this.source.data.line.find(feature => {
      const { isActive, isDraw } = feature.properties;
      return isActive && !isDraw;
    });
  }

  get dragLine() {
    return this.source.data.line.find(feature => {
      return feature.properties.isDrag;
    });
  }

  get drawLine() {
    return (
      this.source.data.line.find(feature => feature.properties.isDraw) ?? null
    );
  }

  get lineRender() {
    return this.render.line;
  }

  get midPointRender() {
    return this.render.midPoint;
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
    return calcMidPointList(lineFeature);
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

  getDefaultOptions(): ILineDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  getRenderList(): IRenderType[] {
    return ['line', 'dashLine', 'midPoint', 'point'];
  }

  onPointCreate(e: ILayerMouseEvent<IPointFeature>) {
    if (this.editLine) {
      return;
    }

    super.onPointCreate(e);

    const feature = e.feature!;
    let newSourceData: Partial<ISourceData> = {};
    if (this.drawLine) {
      const drawLine = this.drawLine;
      drawLine.geometry.coordinates.push(feature.geometry.coordinates);
      drawLine.properties.nodes.push(feature);
      newSourceData = {
        line: this.getLineData().map(feature => {
          if (isSameFeature(feature, drawLine)) {
            return drawLine;
          }
          return feature;
        }),
        dashLine: [],
      };
    } else {
      const newLine = lineString(coordAll(feature), {
        id: getUuid('line'),
        nodes: [feature],
        isHover: false,
        isActive: true,
        isDrag: false,
        isDraw: true,
      }) as ILineFeature;

      newSourceData = {
        point: newLine.properties.nodes,
        line: [
          ...this.getLineData().map(feature => {
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
      const isLastPoint = isSameFeature(
        e.feature,
        last(this.drawLine.properties.nodes),
      );
      if (isLastPoint) {
        this.drawFinish();
      } else {
        this.onPointCreate(e);
      }
    }
  }

  drawFinish() {
    const drawLine = this.drawLine;
    if (drawLine) {
      const { editable, autoFocus } = this.options;
      const isActive = editable && autoFocus;
      this.setEditLine(isActive ? drawLine : null);
    }
  }

  setEditLine(editLine: ILineFeature | null) {
    if (editLine) {
      this.printEditLineData(editLine);
      this.bindEditEvent();
    } else {
      this.source.setData({
        point: [],
        line: this.getLineData().map(feature => {
          feature.properties = {
            ...feature.properties,
            isDraw: false,
            isActive: false,
            isHover: false,
          };
          return feature;
        }),
        dashLine: [],
        midPoint: [],
      });
      this.unbindEditEvent();
    }
  }

  printEditLineData(editLine: ILineFeature) {
    this.source.setData({
      point: editLine.properties.nodes.map(feature => {
        feature.properties = {
          ...feature.properties,
          isHover: false,
          isActive: false,
        };
        return feature;
      }),
      line: this.getLineData().map(feature => {
        const isActive = isSameFeature(feature, editLine);
        feature.properties = {
          ...feature.properties,
          isDraw: false,
          isActive,
          isHover: false,
        };
        return feature;
      }),
      dashLine: [],
      midPoint: this.getMidPointList(editLine),
    });
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    if (this.drawLine?.properties.nodes.length) {
      const lastNode = last(this.drawLine.properties.nodes)!;
      const { lng, lat } = e.lnglat;
      const newDashLine = lineString([
        ...coordAll(lastNode),
        [lng, lat],
      ]) as IDashLineFeature;
      this.setDashLineData([newDashLine]);
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
      line: this.getLineData().map(feature => {
        if (isSameFeature(feature, editLine)) {
          return editLine;
        }
        return feature;
      }),
      midPoint: this.getMidPointList(editLine),
    });
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
    }
  }

  onMidPointMouseMove(e: ILayerMouseEvent<IMidPointFeature>) {
    this.setCursor('pointHover');
  }

  onMidPointMouseOut(e: ILayerMouseEvent<IMidPointFeature>) {
    this.setCursor(null);
  }

  onLineMouseMove(e: ILayerMouseEvent<ILineFeature>) {
    if (this.dragLine) {
      return;
    }
    this.setCursor('lineHover');
    this.setLineData(features =>
      features.map(feature => {
        feature.properties.isHover = isSameFeature(e.feature, feature);
        return feature;
      }),
    );
  }

  onLineMouseOut(e: ILayerMouseEvent<ILineFeature>) {
    if (this.dragLine) {
      return;
    }
    this.setCursor(this.drawLine ? 'draw' : null);
    this.setLineData(features =>
      features.map(feature => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
  }

  onLineMouseDown(e: ILayerMouseEvent<ILineFeature>) {
    const currentLine = e.feature ?? null;
    if (!currentLine || !this.options.editable || this.dragPoint) {
      return;
    }

    this.previousLngLat = e.lngLat;
    this.setLineData(features =>
      features.map(feature => {
        const isSame = isSameFeature(currentLine, feature);
        feature.properties.isActive = feature.properties.isDrag = isSame;
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
    nodes.forEach(node => {
      const [lng, lat] = node.geometry.coordinates;
      node.geometry.coordinates = [lng + diffLng, lat + diffLat];
      pointList.push(node.geometry.coordinates);
    });
    dragLine.geometry.coordinates = pointList;
    this.previousLngLat = e.lngLat;
    this.setEditLine(dragLine);
  }

  onLineDragEnd(e: ILayerMouseEvent<ILineFeature>) {
    const dragLine = this.dragLine;
    if (!dragLine || !this.options.editable || this.dragPoint) {
      return;
    }
    this.setLineData(features =>
      features.map(feature => {
        feature.properties.isDrag = false;
        return feature;
      }),
    );
    this.scene.setMapStatus({
      dragEnable: true,
    });
  }

  onMidPointClick(e: ILayerMouseEvent<IMidPointFeature>) {
    const feature = e.feature!;
    const editLine = this.editLine!;
    const nodes = editLine.properties.nodes;
    const { startId, endId } = feature.properties;
    const startIndex = nodes.findIndex(
      feature => feature.properties.id === startId,
    );
    const endIndex = nodes.findIndex(
      feature => feature.properties.id === endId,
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
      this.printEditLineData(editLine);
    }
  }

  bindEvent() {
    this.pointRender?.enableCreate();
    this.pointRender?.enableClick();
    if (this.options.editable) {
      this.lineRender?.enableHover();
    }
    this.scene?.on('mousemove', this.onSceneMouseMove);
  }

  unbindEvent() {
    this.pointRender?.disableCreate();
    this.pointRender?.disableClick();
    if (this.options.editable) {
      this.lineRender?.disableHover();
    }
    this.scene?.off('mousemove', this.onSceneMouseMove);
  }

  bindEditEvent() {
    this.pointRender?.enableDrag();
    this.pointRender?.enableHover();
    this.midPointRender?.enableClick();
    this.midPointRender?.enableHover();
    this.lineRender?.enableDrag();
  }

  unbindEditEvent() {
    this.pointRender?.disableHover();
    this.pointRender?.disableDrag();
    this.midPointRender?.disableClick();
    this.midPointRender?.disableHover();
    this.lineRender?.disableDrag();
  }

  bindThis() {
    super.bindThis();
    this.onPointCreate = this.onPointCreate.bind(this);
    this.onPointDragging = debounceMoveFn(this.onPointDragging).bind(this);
    this.onSceneMouseMove = debounceMoveFn(this.onSceneMouseMove).bind(this);
    this.onPointClick = this.onPointClick.bind(this);
    this.onMidPointClick = this.onMidPointClick.bind(this);
    this.onMidPointMouseMove = debounceMoveFn(this.onMidPointMouseMove).bind(
      this,
    );
    this.onMidPointMouseOut = this.onMidPointMouseOut.bind(this);
    this.onLineMouseMove = debounceMoveFn(this.onLineMouseMove).bind(this);
    this.onLineMouseOut = this.onLineMouseOut.bind(this);
    this.onLineMouseDown = this.onLineMouseDown.bind(this);
    this.onLineDragging = debounceMoveFn(this.onLineDragging).bind(this);
    this.onLineDragEnd = this.onLineDragEnd.bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
  }
}
