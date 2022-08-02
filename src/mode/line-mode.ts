import { coordAll, Feature, featureCollection, Position } from '@turf/turf';
import {
  DEFAULT_ADSORB_CONFIG,
  DEFAULT_DISTANCE_OPTIONS,
  RenderEvent,
} from '../constant';
import { LineRender } from '../render';
import {
  DeepPartial,
  FeatureUpdater,
  IAdsorbOptions,
  IDashLineFeature,
  IDistanceOptions,
  ILayerMouseEvent,
  ILineFeature,
  ILineHelperOptions,
  ILineProperties,
  ILngLat,
  IMidPointFeature,
  IPointFeature,
  ISceneMouseEvent,
  ITextFeature,
} from '../typings';
import {
  calcDistanceTextsByLine,
  createLineFeature,
  createPointFeature,
  getAdsorbFeature,
  getAdsorbLine,
  getAdsorbPoint,
  getLngLat,
  getPosition,
  isSameFeature,
  resetEventLngLat,
  transLngLat2Position,
  updateTargetFeature,
} from '../utils';
import { IMidPointModeOptions, MidPointMode } from './mid-point-mode';
import { DEFAULT_LINE_HELPER_CONFIG } from '../constant/helper';
import { cloneDeep, isEqual } from 'lodash';

export interface ILineModeOptions<F extends Feature = Feature>
  extends IMidPointModeOptions<F> {
  distanceOptions: false | IDistanceOptions;
  helper: ILineHelperOptions | boolean;
  adsorbOptions: IAdsorbOptions | false;
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

  getDragLine() {
    return this.dragLine;
  }

  getDrawLine() {
    return this.drawLine;
  }

  getEditLine() {
    return this.editLine;
  }

  getDefaultOptions(options: DeepPartial<T>): T {
    const newOptions: T = {
      ...this.getCommonOptions(options),
      showMidPoint: true,
      distanceOptions: false,
      helper: cloneDeep(DEFAULT_LINE_HELPER_CONFIG),
    };
    if (options.distanceOptions) {
      newOptions.distanceOptions = {
        ...DEFAULT_DISTANCE_OPTIONS,
        ...newOptions.distanceOptions,
      };
    }
    if (options.adsorbOptions) {
      newOptions.adsorbOptions = {
        ...DEFAULT_ADSORB_CONFIG,
        ...newOptions.adsorbOptions,
      };
    }
    return newOptions;
  }

  /**
   * 获取 position 经过吸附作用后的 position，若无吸附效果则返回原始数据
   * @param position
   */
  getAdsorbPosition(position: Position): Position | null {
    const { adsorbOptions } = this.options;
    if (typeof adsorbOptions === 'boolean') {
      return position;
    }
    const scene = this.scene;
    const { data, pointAdsorbPixel, lineAdsorbPixel } = adsorbOptions;
    let adsorbPosition: Position | null = null;
    const { points, lines } = getAdsorbFeature(data, this, position);
    if (points.length && pointAdsorbPixel > 0) {
      adsorbPosition = getAdsorbPoint(position, points, adsorbOptions, scene);
    }

    if (!adsorbPosition && lines.length && lineAdsorbPixel > 0) {
      adsorbPosition = getAdsorbLine(position, lines, adsorbOptions, scene);
    }

    return adsorbPosition;
  }

  bindSceneEvent() {
    this.sceneRender.on(
      RenderEvent.Mousemove,
      this.onSceneMouseMove.bind(this),
    );
  }

  bindPointRenderEvent() {
    super.bindPointRenderEvent();
    this.pointRender?.on(RenderEvent.Click, this.onPointClick.bind(this));
  }

  bindLineRenderEvent() {
    this.lineRender?.on(RenderEvent.UnClick, this.onLineUnClick.bind(this));
    this.lineRender?.on(RenderEvent.Mousemove, this.onLineMouseMove.bind(this));
    this.lineRender?.on(RenderEvent.Mouseout, this.onLineMouseOut.bind(this));
    this.lineRender?.on(RenderEvent.Dragstart, this.onLineDragStart.bind(this));
    this.lineRender?.on(RenderEvent.Dragging, this.onLineDragging.bind(this));
    this.lineRender?.on(RenderEvent.Dragend, this.onLineDragEnd.bind(this));
  }

  getDashLineDistanceTexts(
    dashLines: IDashLineFeature[],
    {
      showTotalDistance,
      format,
      showDashDistance,
    }: Pick<
      IDistanceOptions,
      'showTotalDistance' | 'format' | 'showDashDistance'
    >,
  ): ITextFeature[] {
    return showDashDistance
      ? dashLines
          .map((dashLine) => {
            return calcDistanceTextsByLine(
              dashLine,
              { showTotalDistance, format },
              { isActive: true, type: 'dash' },
            );
          })
          .flat()
      : [];
  }

  getLineDistanceTexts(
    lines: ILineFeature[],
    {
      showTotalDistance,
      format,
      showWhen,
    }: Pick<IDistanceOptions, 'showTotalDistance' | 'format' | 'showWhen'>,
  ) {
    const textList: ITextFeature[] = [];
    if (showWhen.includes('active')) {
      const activeLines = lines.filter(
        (line) => line.properties.isActive && line.properties.nodes.length > 1,
      );

      textList.push(
        ...activeLines
          .map((line) =>
            calcDistanceTextsByLine(
              line,
              { showTotalDistance, format },
              { isActive: true },
            ),
          )
          .flat(),
      );
    }

    if (showWhen.includes('normal')) {
      const normalLines = lines.filter(
        (line) => !line.properties.isActive && line.properties.nodes.length > 1,
      );

      textList.push(
        ...normalLines
          .map((line) =>
            calcDistanceTextsByLine(line, {
              showTotalDistance,
              format,
            }),
          )
          .flat(),
      );
    }

    return textList;
  }

  getDistanceTexts(): ITextFeature[] {
    const { distanceOptions } = this.options;
    if (!distanceOptions) {
      return [];
    }
    const textList: ITextFeature[] = [];
    const { showWhen, showDashDistance, format, showTotalDistance } =
      distanceOptions;

    textList.push(
      ...this.getDashLineDistanceTexts(this.getDashLineData(), {
        showTotalDistance: false,
        format,
        showDashDistance,
      }),
      ...this.getLineDistanceTexts(this.getLineData(), {
        showTotalDistance,
        format,
        showWhen,
      }),
    );

    return textList;
  }

  getAllTexts() {
    return this.getDistanceTexts();
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
    this.setTextData(this.getAllTexts());
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
    if (isSameFeature(this.editLine, line)) {
      this.setMidPointData(this.getMidPointsByLine(line));
    }
    this.setPointData(line.properties.nodes);
    this.setTextData(this.getAllTexts());
    return line;
  }

  setActiveLine(line: ILineFeature, properties: Partial<ILineProperties> = {}) {
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
    this.setTextData(this.getAllTexts());
    return line;
  }

  clearActiveLine() {
    this.source.setData({
      point: [],
      line: this.getLineData().map((feature) => {
        feature.properties = {
          ...feature.properties,
          isActive: false,
          isHover: false,
        };
        return feature;
      }),
      midPoint: [],
      text: this.getAllTexts(),
    });
  }

  handleLineUnClick(link: ILineFeature) {
    this.clearActiveLine();
    return link;
  }

  handleLineHover(line: ILineFeature) {
    if (this.drawLine) {
      return;
    }
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
    if (this.drawLine) {
      return;
    }
    this.resetCursor();
    this.setLineData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
    return line;
  }

  handleLineDragStart(line: ILineFeature) {
    this.setActiveLine(line, {
      isDrag: true,
      isActive: true,
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
    this.setActiveLine(line, {
      isDrag: true,
    });
    this.setCursor('lineDrag');
    this.previousPosition = [lng, lat];
    return line;
  }

  handleLineDragEnd(line: ILineFeature) {
    line.properties.isDrag = false;
    this.setLineData((features) => features);
    this.scene.setMapStatus({
      dragEnable: true,
    });
    return line;
  }

  resetAdsorbLngLat(e: ILayerMouseEvent | ISceneMouseEvent) {
    if (!this.options.adsorbOptions) {
      return;
    }
    const adsorbPosition = this.getAdsorbPosition(
      transLngLat2Position(getLngLat(e)),
    );
    if (adsorbPosition) {
      resetEventLngLat(e, adsorbPosition);
    }
    return adsorbPosition;
  }

  /**
   * 创建点之后，对应线段的处理
   * @param e
   */
  onPointCreate(e: ILayerMouseEvent): IPointFeature | undefined {
    if (this.editLine) {
      return;
    }
    this.resetAdsorbLngLat(e);
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
    this.setHelper('pointDrag');
    return super.onPointDragStart(e);
  }

  onPointDragging(e: ISceneMouseEvent): IPointFeature | undefined {
    const dragPoint = super.onPointDragging(e);
    if (dragPoint) {
      const adsorbPosition = this.resetAdsorbLngLat(e);
      if (adsorbPosition) {
        dragPoint.geometry.coordinates = cloneDeep(adsorbPosition);
      }
    }
    const editLine = this.editLine;
    if (editLine && dragPoint) {
      this.syncLineNodes(
        editLine,
        editLine.properties.nodes.map((node) => {
          if (isSameFeature(dragPoint, node)) {
            return dragPoint;
          }
          return node;
        }),
      );
      this.setActiveLine(editLine);
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
      this.setHelper('pointHover');
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
    if (!this.dragLine && !this.drawLine && this.options.editable) {
      this.setHelper('lineHover');
    }
    return this.handleLineHover(e.feature!);
  }

  onLineMouseOut(e: ILayerMouseEvent<ILineFeature>) {
    if (this.drawLine) {
      return;
    }
    if (!this.dragLine && !this.drawLine) {
      this.setHelper(this.addable ? 'draw' : null);
    }
    return this.handleLineUnHover(e.feature!);
  }

  onLineDragStart(e: ILayerMouseEvent<ILineFeature>) {
    if (!this.options.editable || this.drawLine) {
      return;
    }
    this.previousPosition = getPosition(e);
    this.setHelper('lineDrag');
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
    this.setHelper('lineHover');
    return this.handleLineDragEnd(dragLine);
  }

  onPointMouseMove(e: ILayerMouseEvent<IPointFeature>) {
    const feature = super.onPointMouseMove(e);
    if (!this.dragLine && !this.drawLine && !this.dragPoint) {
      this.setHelper('pointHover');
    }
    return feature;
  }

  onPointMouseOut(e: ILayerMouseEvent<IPointFeature>) {
    const feature = super.onPointMouseOut(e);
    if (!this.dragLine && !this.drawLine && !this.dragPoint) {
      this.setHelper(this.addable ? 'draw' : null);
    }
    return feature;
  }

  onMidPointHover(e: ILayerMouseEvent<IMidPointFeature>) {
    super.onMidPointHover(e);
    this.setHelper('midPointHover');
  }

  onMidPointUnHover(e: ILayerMouseEvent<IMidPointFeature>) {
    super.onMidPointUnHover(e);
    this.setHelper(null);
  }

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {}

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
    if (!editLine || !feature || this.dragPoint) {
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
      const newNode = createPointFeature(feature.geometry.coordinates, {
        isDrag: true,
        isHover: true,
      });
      this.setHelper('pointDrag');
      nodes.splice(endIndex, 0, newNode);
      editLine.geometry.coordinates = coordAll(featureCollection(nodes));
      this.syncLineNodes(editLine, nodes);
      this.setActiveLine(editLine);
      return newNode;
    }
  }

  enableSceneRenderAction() {
    this.sceneRender.enableDrag();
    this.sceneRender.enableMouseMove();
    this.sceneRender.enableDblClick();
  }

  disableSceneRenderAction() {
    this.sceneRender.disableDrag();
    this.sceneRender.disableMouseMove();
    this.sceneRender.disableDblClick();
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
