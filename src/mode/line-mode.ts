import {
  FeatureUpdater,
  IBaseModeOptions,
  IDashLineFeature,
  IDistanceOptions,
  ILayerMouseEvent,
  ILineFeature,
  ILineProperties,
  ILngLat,
  IMidPointFeature,
  IPointFeature,
  ISceneMouseEvent,
} from '../typings';
import {
  createLineFeature,
  createPointFeature,
  getLngLat,
  getUuid,
  isSameFeature,
  transLngLat2Position,
  updateTargetFeature,
} from '../utils';
import { center, coordAll, Feature, featureCollection } from '@turf/turf';
import { RenderEvent, SceneEvent } from '../constant';
import { LineRender } from '../render';
import { Position } from '@turf/turf';
import { IMidPointModeOptions, MidPointMode } from './mid-point-mode';

export interface ILineModeOptions<F extends Feature = Feature>
  extends IMidPointModeOptions<F> {
  showMidPoint: boolean;
  distanceText: false | IDistanceOptions;
}

export abstract class LineMode<
  T extends ILineModeOptions,
> extends MidPointMode<T> {
  /**
   * 获取line类型对应的render
   * @protected
   */
  protected get lineRender(): LineRender | undefined {
    return this.render.line;
  }

  /**
   * 获取正在被拖拽的线
   * @protected
   */
  protected get dragLine() {
    return this.getLineData().find((feature) => feature.properties.isDrag);
  }

  /**
   * 正在绘制的线
   * @protected
   */
  protected get drawLine() {
    return this.getLineData().find((feature) => feature.properties.isDraw);
  }

  /**
   * 当前高亮的结点
   * @protected
   */
  protected get editLine() {
    return this.getLineData().find((feature) => {
      const { isActive, isDraw } = feature.properties;
      return !isDraw && isActive;
    });
  }

  protected previousPosition: Position = [0, 0];

  bindSceneEvent() {
    this.scene.on(SceneEvent.mousemove, this.onSceneMouseMove.bind(this));
  }

  bindLineRenderEvent() {
    this.lineRender?.on(RenderEvent.unclick, this.onLineUnClick.bind(this));
    this.lineRender?.on(RenderEvent.mousemove, this.onLineMouseMove.bind(this));
    this.lineRender?.on(RenderEvent.mouseout, this.onLineMouseOut.bind(this));
    this.lineRender?.on(RenderEvent.dragstart, this.onLineDragStart.bind(this));
    this.lineRender?.on(RenderEvent.dragging, this.onLineDragging.bind(this));
    this.lineRender?.on(RenderEvent.dragend, this.onLineDragEnd.bind(this));
  }

  /**
   * 创建LineFeature
   * @param point
   */
  handleCreateLine(point: IPointFeature) {
    const newLine = createLineFeature([point], {
      isActive: true,
      isDraw: true,
    });
    this.setLineData((features) => {
      return updateTargetFeature<ILineFeature>({
        target: newLine,
        data: [...features, newLine],
        otherHandler: (feature) => {
          feature.properties.isActive = false;
        },
      });
    });
    this.setPointData([point]);
    return newLine;
  }

  /**
   * 同步当前编辑线中的结点
   * @param line
   * @param nodes
   */
  syncLineNodes(line: ILineFeature, nodes: IPointFeature[]) {
    line.properties.nodes = nodes;
    line.geometry.coordinates = coordAll(featureCollection(nodes));
    this.setLineData((features) => {
      return features.map((feature) => {
        if (isSameFeature(feature, line)) {
          return line;
        }
        return feature;
      });
    });
    this.setPointData(line.properties.nodes);
    return line;
  }

  setEditLine(line: ILineFeature, properties: Partial<ILineProperties> = {}) {
    this.setLineData((features) =>
      updateTargetFeature({
        target: line,
        data: features,
        targetHandler: (feature) => {
          feature.properties = {
            ...feature.properties,
            isDraw: false,
            isActive: true,
            isDrag: false,
            isHover: false,
            ...properties,
          };
        },
        otherHandler: (feature) => {
          feature.properties = {
            ...feature.properties,
            isDraw: false,
            isActive: false,
            isDrag: false,
          };
        },
      }),
    );
    this.setPointData(
      line.properties.nodes.map((feature) => {
        feature.properties = {
          ...feature.properties,
          isHover: false,
          isActive: false,
        };
        return feature;
      }),
    );
    this.setMidPointData(this.calcMidPoints(line));
    this.setDashLineData([]);
    return line;
  }

  handleLineHover(line: ILineFeature) {
    this.setCursor('lineHover');
    this.setLineData((features) =>
      updateTargetFeature({
        target: line,
        data: features,
        targetHandler: (feature) => {
          feature.properties.isHover = true;
        },
        otherHandler: (feature) => {
          feature.properties.isHover = false;
        },
      }),
    );
    return line;
  }

  handleLineUnHover(line: ILineFeature) {
    this.setCursor('draw');
    this.setLineData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
    return line;
  }

  handleLineDragStart(line: ILineFeature) {
    this.setEditLine(line, {
      isDrag: true,
    });
    this.scene.setMapStatus({
      dragEnable: false,
    });
    console.log(this.dragLine);
    this.setCursor('lineDrag');
    return line;
  }

  handleLineDragging(line: ILineFeature, { lng, lat }: ILngLat) {
    const nodes = line.properties.nodes;
    const [preLng, preLat] = this.previousPosition;
    nodes.forEach((node) => {
      const { coordinates } = node.geometry;
      node.geometry.coordinates = [
        coordinates[0] + lng - preLng,
        coordinates[1] + lat - preLat,
      ];
    });
    this.syncLineNodes(line, nodes);
    this.setEditLine(line, {
      isDrag: true,
    });
    this.setCursor('lineDrag');
    this.previousPosition = [lng, lat];
  }

  handleLineDragEnd(line: ILineFeature) {
    line.properties.isDrag = false;
    this.setLineData((features) => features);
  }

  // handle

  /**
   * 创建点之后，对应线段的处理
   * @param e
   */
  onPointCreate(e: ILayerMouseEvent): IPointFeature | undefined {
    if (this.editLine) {
      return;
    }
    const point = super.onPointCreate(e);
    const drawLine = this.drawLine;
    if (!point) {
      return;
    }
    if (drawLine) {
      this.syncLineNodes(drawLine, [...drawLine.properties.nodes, point]);
      this.setDashLineData([]);
    } else {
      this.handleCreateLine(point);
    }
    return point;
  }

  onPointDragStart(e: ILayerMouseEvent<IPointFeature>) {
    const editLine = this.editLine;
    if (!editLine) {
      return;
    }
    return super.onPointDragStart(e);
  }

  onPointDragging(e: ISceneMouseEvent): IPointFeature | undefined {
    const dragPoint = super.onPointDragging(e);
    const editLine = this.editLine;
    if (editLine) {
      this.syncLineNodes(editLine, editLine.properties.nodes);
      this.setEditLine(editLine);
    }
    return dragPoint;
  }

  onPointDragEnd(e: ISceneMouseEvent): IPointFeature | undefined {
    const editLine = this.editLine;
    if (editLine) {
      const dragPoint = super.onPointDragEnd(e);
      this.setPointData((features) => {
        return features.map((feature) => {
          feature.properties.isActive = false;
          return feature;
        });
      });
      return dragPoint;
    }
  }

  onLineUnClick(e: ILayerMouseEvent) {
    const editLine = this.editLine;
    if (!editLine) {
      return;
    }
    this.source.setData({
      point: [],
      line: this.getLineData().map((feature) => {
        feature.properties.isActive = false;
        return feature;
      }),
      midPoint: [],
    });
    return editLine;
  }

  onLineMouseMove(e: ILayerMouseEvent<ILineFeature>) {
    if (this.drawLine) {
      return;
    }
    return this.handleLineHover(e.feature!);
  }

  onLineMouseOut(e: ILayerMouseEvent<ILineFeature>) {
    if (this.drawLine) {
      return;
    }
    return this.handleLineUnHover(e.feature!);
  }

  onLineDragStart(e: ILayerMouseEvent<ILineFeature>) {
    if (!this.options.editable || this.drawLine) {
      return;
    }
    this.previousPosition = transLngLat2Position(getLngLat(e));
    return this.handleLineDragStart(e.feature!);
  }

  onLineDragging(e: ISceneMouseEvent) {
    const dragLine = this.dragLine;
    if (!dragLine) {
      return;
    }
    return this.handleLineDragging(dragLine, getLngLat(e));
  }

  onLineDragEnd(e: ISceneMouseEvent) {
    const dragLine = this.dragLine;
    if (!dragLine) {
      return;
    }
    return this.handleLineDragEnd(dragLine);
  }

  onSceneMouseMove(e: ISceneMouseEvent) {}

  /**
   * 获取线数据
   */
  getLineData() {
    return this.source.getRenderData<ILineFeature>('line');
  }

  /**
   * 设置线数据
   * @param data
   */
  setLineData(data: FeatureUpdater<ILineFeature>) {
    return this.source.setRenderData('line', data);
  }

  /**
   * 获取线数据
   */
  getDashLineData() {
    return this.source.getRenderData<IDashLineFeature>('dashLine');
  }

  onMidPointClick(
    e: ILayerMouseEvent<IMidPointFeature>,
  ): IPointFeature | undefined {
    const editLine = this.editLine;
    const feature = e.feature;
    if (!editLine || !feature) {
      return;
    }
    const nodes = editLine.properties.nodes;
    const { startId, endId } = feature.properties;
    const startIndex = nodes.findIndex(
      (feature) => feature.properties.id === startId,
    );
    const endIndex = nodes.findIndex(
      (feature) => feature.properties.id === endId,
    );
    if (startIndex > -1 && endIndex > -1) {
      const newNode = createPointFeature(feature.geometry.coordinates);
      nodes.splice(endIndex, 0, newNode);
      editLine.geometry.coordinates = coordAll(featureCollection(nodes));
      this.syncLineNodes(editLine, nodes);
      this.setEditLine(editLine);
      return newNode;
    }
  }

  /**
   * 设置线数据
   * @param data
   */
  setDashLineData(data: FeatureUpdater<IDashLineFeature>) {
    return this.source.setRenderData('dashLine', data);
  }

  enableLineRenderAction() {
    const { editable } = this.options;
    this.lineRender?.enableUnClick();
    this.lineRender?.enableHover();
    if (editable) {
      this.lineRender?.enableDrag();
    }
  }

  disableLineRenderAction() {
    this.lineRender?.disableUnClick();
    this.lineRender?.disableHover();
    this.lineRender?.disableDrag();
  }
}
