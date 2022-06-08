import {
  DeepPartial,
  FeatureUpdater,
  IDashLineFeature,
  IDistanceOptions,
  ILayerMouseEvent,
  ILineFeature,
  ILineProperties,
  ILngLat,
  IMidPointFeature,
  IPointFeature,
  ISceneMouseEvent,
  ITextFeature,
} from '../typings';
import {
  createLineFeature,
  createPointFeature,
  getLngLat,
  isSameFeature,
  transLngLat2Position,
  updateTargetFeature,
} from '../utils';
import { coordAll, Feature, featureCollection } from '@turf/turf';
import { DEFAULT_DISTANCE_OPTIONS, RenderEvent, SceneEvent } from '../constant';
import { LineRender } from '../render';
import { Position } from '@turf/turf';
import { IMidPointModeOptions, MidPointMode } from './mid-point-mode';
import { ILineDrawerOptions } from '../drawer';
import { calcDistanceTextsByLine } from '../utils/calc';

export interface ILineModeOptions<F extends Feature = Feature>
  extends IMidPointModeOptions<F> {
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

  getDefaultOptions(options: DeepPartial<T>): T {
    const newOptions: T = {
      ...this.getCommonOptions(options),
      showMidPoint: true,
      distanceText: false,
    };
    if (options.distanceText) {
      newOptions.distanceText = {
        ...DEFAULT_DISTANCE_OPTIONS,
        ...newOptions.distanceText,
      };
    }
    return newOptions;
  }

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

  getAllDistanceTexts(): ITextFeature[] {
    const { distanceText } = this.options;
    if (!distanceText) {
      return [];
    }
    const textList: ITextFeature[] = [];
    const { showOnNormal, showOnActive, showOnDash, format, total } =
      distanceText;
    const lines = this.getLineData();
    if (showOnDash) {
      const dashLines = this.getDashLineData();
      textList.push(
        ...dashLines
          .map((dashLine) =>
            calcDistanceTextsByLine(
              dashLine,
              { total: false, format },
              { isActive: true, type: 'dash' },
            ),
          )
          .flat(),
      );
    }

    if (showOnActive) {
      const activeLines = lines.filter(
        (line) => line.properties.isActive && line.properties.nodes.length > 1,
      );

      textList.push(
        ...activeLines
          .map((line) =>
            calcDistanceTextsByLine(
              line,
              { total, format },
              { isActive: true },
            ),
          )
          .flat(),
      );
    }

    if (showOnNormal) {
      const normalLines = lines.filter(
        (line) => !line.properties.isActive && line.properties.nodes.length > 1,
      );

      textList.push(
        ...normalLines
          .map((line) => calcDistanceTextsByLine(line, { total, format }))
          .flat(),
      );
    }

    return textList;
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
    this.setTextData(this.getAllDistanceTexts());
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
    this.setTextData(this.getAllDistanceTexts());
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
    this.setMidPointData(this.getMidPointsByLine(line));
    this.setDashLineData([]);
    this.setTextData(this.getAllDistanceTexts());
    return line;
  }

  handleLineUnClick(link: ILineFeature) {
    this.source.setData({
      point: [],
      line: this.getLineData().map((feature) => {
        feature.properties.isActive = false;
        return feature;
      }),
      midPoint: [],
      text: this.getAllDistanceTexts(),
    });
    return link;
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
    return line;
  }

  handleLineDragEnd(line: ILineFeature) {
    line.properties.isDrag = false;
    this.setLineData((features) => features);
    return line;
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
    if (editLine && dragPoint) {
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
    return this.handleLineUnClick(editLine);
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

  getTextData() {
    return this.source.getRenderData<ITextFeature>('text');
  }

  setTextData(data: FeatureUpdater<ITextFeature>) {
    return this.source.setRenderData('text', data);
  }

  /**
   * 获取线数据
   */
  getDashLineData() {
    return this.source.getRenderData<IDashLineFeature>('dashLine');
  }

  /**
   * 设置线数据
   * @param data
   */
  setDashLineData(data: FeatureUpdater<IDashLineFeature>) {
    return this.source.setRenderData('dashLine', data);
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

  enableLineRenderAction() {
    const { editable } = this.options;
    this.lineRender?.enableUnClick();
    if (editable) {
      this.lineRender?.enableHover();
      this.lineRender?.enableDrag();
    }
  }

  disableLineRenderAction() {
    this.lineRender?.disableUnClick();
    this.lineRender?.disableHover();
    this.lineRender?.disableDrag();
  }
}
