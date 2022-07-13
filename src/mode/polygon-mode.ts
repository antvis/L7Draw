import {
  booleanClockwise,
  coordAll,
  Feature,
  featureCollection,
  lineString,
} from '@turf/turf';
import { cloneDeep, first, isEqual, last } from 'lodash';
import { DEFAULT_AREA_OPTIONS, DrawEvent, RenderEvent } from '../constant';
import { PolygonRender } from '../render';
import {
  DeepPartial,
  FeatureUpdater,
  IAreaOptions,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  IPolygonHelperOptions,
  IPolygonProperties,
  IRenderType,
  ISceneMouseEvent,
  ITextFeature,
} from '../typings';
import {
  calcAreaText,
  createPointFeature,
  createPolygonFeature,
  getPosition,
  isSameFeature,
  updateTargetFeature,
} from '../utils';
import { ILineModeOptions, LineMode } from './line-mode';
import { DEFAULT_POLYGON_HELPER_CONFIG } from '../constant/helper';

export interface IPolygonModeOptions<F extends Feature = Feature>
  extends ILineModeOptions<F> {
  areaOptions: false | IAreaOptions;
  helper: IPolygonHelperOptions | boolean;
}

export abstract class PolygonMode<
  T extends IPolygonModeOptions,
> extends LineMode<T> {
  protected get dragItem() {
    return this.dragPolygon;
  }

  protected get editItem() {
    return this.editPolygon;
  }

  /**
   * 获取polygon类型对应的render
   * @protected
   */
  protected get polygonRender(): PolygonRender | undefined {
    return this.render.polygon;
  }

  /**
   * 获取正在被拖拽的线
   * @protected
   */
  protected get dragPolygon() {
    return this.getPolygonData().find((feature) => feature.properties.isDrag);
  }

  /**
   * 正在绘制的线
   * @protected
   */
  protected get drawPolygon() {
    return this.getPolygonData().find((feature) => feature.properties.isDraw);
  }

  /**
   * 当前高亮的结点
   * @protected
   */
  protected get editPolygon() {
    return this.getPolygonData().find((feature) => {
      const { isActive, isDraw } = feature.properties;
      return !isDraw && isActive;
    });
  }

  getRenderTypes(): IRenderType[] {
    return ['polygon', 'line', 'dashLine', 'midPoint', 'point', 'text'];
  }

  getData(): IPolygonFeature[] {
    return this.getPolygonData();
  }

  getDefaultOptions(options: DeepPartial<T>): T {
    const newOptions: T = {
      ...super.getDefaultOptions(options),
      areaOptions: false,
      helper: cloneDeep(DEFAULT_POLYGON_HELPER_CONFIG),
    };
    if (options.areaOptions) {
      newOptions.areaOptions = {
        ...DEFAULT_AREA_OPTIONS,
        ...options.areaOptions,
      };
    }
    return newOptions;
  }

  getAreaTexts(polygons: IPolygonFeature[]): ITextFeature[] {
    const { areaOptions } = this.options;
    if (!areaOptions) {
      return [];
    }
    const { format, showWhen } = areaOptions;
    const textList: ITextFeature[] = [];
    const polygonData = polygons.filter(
      (feature) => feature.geometry.coordinates[0].length >= 4,
    );

    if (showWhen.includes('active')) {
      polygonData
        .filter((feature) => feature.properties.isActive)
        .forEach((feature) => {
          textList.push(
            calcAreaText(
              feature,
              {
                format,
              },
              {
                isActive: true,
              },
            ),
          );
        });
    }

    if (showWhen.includes('normal')) {
      polygonData
        .filter((feature) => !feature.properties.isActive)
        .forEach((feature) => {
          textList.push(
            calcAreaText(
              feature,
              {
                format,
              },
              {
                isActive: false,
              },
            ),
          );
        });
    }

    return textList;
  }

  getAllTexts(): ITextFeature[] {
    return [
      ...super.getAllTexts(),
      ...this.getAreaTexts(this.getPolygonData()),
    ];
  }

  /**
   * 获取线数据
   */
  getPolygonData() {
    return this.source.getRenderData<IPolygonFeature>('polygon');
  }

  /**
   * 设置线数据
   * @param data
   */
  setPolygonData(data: FeatureUpdater<IPolygonFeature>) {
    return this.source.setRenderData('polygon', data);
  }

  handleCreatePolygon(points: IPointFeature[], line: ILineFeature) {
    const newPolygon = createPolygonFeature(points, {
      nodes: points,
      line,
      isActive: true,
      isDraw: true,
    });
    this.setPolygonData((features) =>
      updateTargetFeature({
        target: newPolygon,
        data: [...features, newPolygon],
        otherHandler: (feature) => {
          feature.properties.isActive = false;
        },
      }),
    );
    return newPolygon;
  }

  handlePolygonUnClick(polygon: IPolygonFeature) {
    this.clearActivePolygon();
    return polygon;
  }

  handlePolygonHover(polygon: IPolygonFeature) {
    this.setCursor('polygonHover');
    this.setPolygonData((features) =>
      updateTargetFeature({
        target: polygon,
        data: features,
        targetHandler: (feature) => {
          feature.properties.isHover = true;
        },
        otherHandler: (feature) => {
          feature.properties.isHover = false;
        },
      }),
    );
    return polygon;
  }

  handlePolygonUnHover() {
    this.resetCursor();
    this.setPolygonData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
  }

  handlePolygonDragStart(polygon: IPolygonFeature) {
    this.setActivePolygon(polygon, {
      isDrag: true,
    });
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.setCursor('polygonDrag');
    return polygon;
  }

  bindPolygonRenderEvent() {
    this.polygonRender?.on(
      RenderEvent.UnClick,
      this.onPolygonUnClick.bind(this),
    );
    this.polygonRender?.on(
      RenderEvent.Mousemove,
      this.onPolygonHover.bind(this),
    );
    this.polygonRender?.on(
      RenderEvent.Mouseout,
      this.onPolygonUnHover.bind(this),
    );
    this.polygonRender?.on(
      RenderEvent.Dragstart,
      this.onPolygonDragStart.bind(this),
    );
    // this.polygonRender?.on(
    //   RenderEvent.dragging,
    //   this.onPolygonDragging.bind(this),
    // );
    // this.polygonRender?.on(
    //   RenderEvent.dragend,
    //   this.onPolygonDragEnd.bind(this),
    // );
  }

  syncPolygonNodes(polygon: IPolygonFeature, nodes: IPointFeature[]) {
    const positions = coordAll(featureCollection([...nodes, first(nodes)!]));
    const { isDraw, line } = polygon.properties;
    polygon.properties.nodes = nodes;
    polygon.geometry.coordinates = [
      booleanClockwise(lineString(positions)) ? positions : positions.reverse(),
    ];
    this.setPolygonData((features) => {
      return features.map((feature) => {
        if (isSameFeature(feature, polygon)) {
          return polygon;
        }
        return feature;
      });
    });
    if (!isDraw) {
      const lineNodes = line.properties.nodes;
      const firstNode = first(lineNodes)!;
      const lastNode = last(lineNodes)!;
      if (
        !isEqual(firstNode.geometry.coordinates, lastNode.geometry.coordinates)
      ) {
        lineNodes.push(createPointFeature(firstNode.geometry.coordinates));
        this.syncLineNodes(line, lineNodes);
      }
    }
    return polygon;
  }

  setActivePolygon(
    polygon: IPolygonFeature,
    properties: Partial<IPolygonProperties> = {},
  ) {
    this.setActiveLine(polygon.properties.line, properties);
    this.setPolygonData((features) =>
      updateTargetFeature({
        target: polygon,
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
    this.setTextData(this.getAllTexts());
    return polygon;
  }

  clearActivePolygon() {
    this.setPolygonData((features) => {
      return features.map((feature) => {
        feature.properties = {
          ...feature.properties,
          isActive: false,
          isHover: false,
        };
        return feature;
      });
    });
    this.clearActiveLine();
  }

  onLineDragStart(e: ILayerMouseEvent<ILineFeature>) {
    const line = super.onLineDragStart(e);
    const polygon = this.getPolygonData().find((feature) =>
      isSameFeature(feature.properties.line, line),
    );
    if (polygon) {
      this.setActivePolygon(polygon, {
        isDrag: true,
      });
      this.emit(DrawEvent.DragStart, polygon, this.getPolygonData());
    }
    return line;
  }

  onLineUnClick(e: ILayerMouseEvent) {
    return this.editLine;
  }

  onLineDragEnd(e: ISceneMouseEvent) {
    const feature = super.onLineDragEnd(e);
    const dragPolygon = this.dragPolygon;
    if (feature && dragPolygon) {
      dragPolygon.properties.isDrag = false;
      this.emit(DrawEvent.DragEnd, dragPolygon, this.getPolygonData());
      this.emit(DrawEvent.Edit, dragPolygon, this.getPolygonData());
    }
    return feature;
  }

  onPolygonUnClick(e: ILayerMouseEvent) {
    const editPolygon = this.editPolygon;
    if (!editPolygon) {
      return;
    }
    return this.handlePolygonUnClick(editPolygon);
  }

  onPolygonHover(e: ILayerMouseEvent<IPolygonFeature>) {
    if (this.drawPolygon) {
      return;
    }
    if (!this.dragPolygon) {
      this.setHelper('polygonHover');
    }
    return this.handlePolygonHover(e.feature!);
  }

  onPolygonUnHover(e: ILayerMouseEvent<IPolygonFeature>) {
    if (this.drawPolygon) {
      return;
    }
    this.setHelper(this.addable ? 'draw' : null);
    return this.handlePolygonUnHover();
  }

  onPolygonDragStart(e: ILayerMouseEvent<IPolygonFeature>) {
    if (!this.options.editable || this.drawPolygon) {
      return;
    }
    const polygon = e.feature!;
    this.previousPosition = getPosition(e);
    this.setHelper('polygonDrag');
    this.emit(DrawEvent.DragStart, polygon, this.getPolygonData());
    return this.handlePolygonDragStart(polygon);
  }

  onMidPointClick(
    e: ILayerMouseEvent<IMidPointFeature>,
  ): IPointFeature | undefined {
    const editPolygon = this.editPolygon;
    const feature = super.onMidPointClick(e);
    if (feature && editPolygon) {
      const lineNodes = editPolygon.properties.line.properties.nodes;
      this.syncPolygonNodes(
        editPolygon,
        lineNodes.slice(0, lineNodes.length - 1),
      );
      this.setActivePolygon(editPolygon);
    }
    return feature;
  }

  onPointDragEnd(e: ISceneMouseEvent): IPointFeature | undefined {
    const editPolygon = this.editPolygon;
    const feature = super.onPointDragEnd(e);
    if (feature && editPolygon) {
      this.emit(DrawEvent.Edit, editPolygon, this.getPolygonData());
    }
    return feature;
  }

  enablePolygonRenderAction() {
    const { editable } = this.options;
    this.polygonRender?.enableUnClick();
    if (editable) {
      this.polygonRender?.enableHover();
      this.polygonRender?.enableDrag();
    }
  }

  disablePolygonRenderAction() {
    this.polygonRender?.disableUnClick();
    this.polygonRender?.disableHover();
    this.polygonRender?.disableDrag();
  }

  bindEnableEvent(): void {
    super.bindEnableEvent();
    this.enableSceneRenderAction();
    this.enablePointRenderAction();
    this.enableLineRenderAction();
    this.enableMidPointRenderAction();
    this.enablePolygonRenderAction();
  }

  unbindEnableEvent(): void {
    super.unbindEnableEvent();
    this.disableSceneRenderAction();
    this.disablePointRenderAction();
    this.disableLineRenderAction();
    this.disableMidPointRenderAction();
    this.disablePolygonRenderAction();
  }

  bindThis() {
    super.bindThis();

    this.bindPointRenderEvent = this.bindPointRenderEvent.bind(this);
    this.bindSceneEvent = this.bindSceneEvent.bind(this);
    this.bindLineRenderEvent = this.bindLineRenderEvent.bind(this);
    this.bindMidPointRenderEvent = this.bindMidPointRenderEvent.bind(this);
    this.bindPolygonRenderEvent = this.bindPolygonRenderEvent.bind(this);
  }

  setActiveFeature(target: Feature | string | null | undefined) {
    const targetFeature = this.getTargetFeature(target);
    if (targetFeature) {
      this.setActivePolygon(targetFeature as IPolygonFeature);
    } else {
      this.clearActivePolygon();
    }
  }

  clearDrawAndActiveFeature() {
    let features = this.getPolygonData();
    if (this.drawPolygon) {
      features = features.filter((feature) => !feature.properties.isDraw);
      this.source.setData({
        point: [],
        dashLine: [],
        midPoint: [],
      });
      this.setLineData((features) => {
        return features.filter((feature) => {
          return !feature.properties.isDraw;
        });
      });
      this.setTextData((features) => {
        return features.filter((feature) => {
          return !feature.properties.isActive;
        });
      });
    }
    if (this.editPolygon) {
      this.handlePolygonUnClick(this.editPolygon);
    }
    this.setPolygonData(
      features.map((feature) => {
        feature.properties = {
          ...feature.properties,
          isDrag: false,
          isActive: false,
          isHover: false,
        };
        return feature;
      }),
    );
  }
}
