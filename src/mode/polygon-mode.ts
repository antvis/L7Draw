import {
  area,
  booleanClockwise,
  coordAll,
  Feature,
  featureCollection,
  lineString,
} from '@turf/turf';
import {
  DeepPartial,
  FeatureUpdater,
  IAreaOptions,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  IPolygonProperties,
  ISceneMouseEvent,
  ITextFeature,
} from '../typings';
import { ILineModeOptions, LineMode } from './line-mode';
import { PolygonRender } from '../render';
import { DEFAULT_AREA_OPTIONS, RenderEvent } from '../constant';
import {
  createDashLine,
  createPointFeature,
  createPolygonFeature,
  getLngLat,
  isSameFeature,
  transLngLat2Position,
  updateTargetFeature,
} from '../utils';
import { first, isEqual, last } from 'lodash';
import { calcAreaText } from '../utils/calc';

export interface IPolygonModeOptions<F extends Feature = Feature>
  extends ILineModeOptions<F> {
  areaText: false | IAreaOptions;
}

export abstract class PolygonMode<
  T extends IPolygonModeOptions,
> extends LineMode<T> {
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

  getDefaultOptions(options: DeepPartial<T>): T {
    const newOptions: T = {
      ...super.getDefaultOptions(options),
      areaText: false,
    };
    if (options.areaText) {
      newOptions.areaText = {
        ...DEFAULT_AREA_OPTIONS,
        ...options.areaText,
      };
    }
    return newOptions;
  }

  getAreaTexts(): ITextFeature[] {
    const { areaText } = this.options;
    if (!areaText) {
      return [];
    }
    const textList: ITextFeature[] = [];
    const polygonData = this.getPolygonData().filter(
      (feature) => feature.properties.nodes.length >= 3,
    );

    polygonData.forEach((feature) => {
      textList.push(
        calcAreaText(
          feature,
          {
            format: areaText.format,
          },
          {
            isActive: feature.properties.isActive,
          },
        ),
      );
    });

    return textList;
  }

  getAllTexts(): ITextFeature[] {
    return [...super.getAllTexts(), ...this.getAreaTexts()];
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

  handleCreatePolygon(point: IPointFeature, line: ILineFeature) {
    const newPolygon = createPolygonFeature([point], {
      nodes: [point],
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
    this.setPolygonData((features) => {
      return features.map((feature) => {
        feature.properties.isActive = false;
        return feature;
      });
    });
    this.handleLineUnClick(polygon.properties.line);
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
    this.setCursor('draw');
    this.setPolygonData((features) =>
      features.map((feature) => {
        feature.properties.isHover = false;
        return feature;
      }),
    );
  }

  handlePolygonDragStart(polygon: IPolygonFeature) {
    this.setEditPolygon(polygon, {
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
      RenderEvent.unclick,
      this.onPolygonUnClick.bind(this),
    );
    this.polygonRender?.on(
      RenderEvent.mousemove,
      this.onPolygonHover.bind(this),
    );
    this.polygonRender?.on(
      RenderEvent.mouseout,
      this.onPolygonUnHover.bind(this),
    );
    this.polygonRender?.on(
      RenderEvent.dragstart,
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

  setEditPolygon(
    polygon: IPolygonFeature,
    properties: Partial<IPolygonProperties> = {},
  ) {
    this.setEditLine(polygon.properties.line, properties);
    this.setPointData(polygon.properties.nodes);
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
    return polygon;
  }

  onLineDragStart(e: ILayerMouseEvent<ILineFeature>) {
    const line = super.onLineDragStart(e);
    const polygon = this.getPolygonData().find((feature) =>
      isSameFeature(feature.properties.line, line),
    );
    if (polygon) {
      this.setEditPolygon(polygon, {
        isDrag: true,
      });
    }
    return line;
  }

  onLineUnClick(e: ILayerMouseEvent) {
    return this.editLine;
  }

  onLineDragging(e: ISceneMouseEvent) {
    const dragPolygon = this.dragPolygon;
    const feature = super.onLineDragging(e);
    if (feature && dragPolygon) {
      const lineNodes = feature.properties.nodes;
      this.syncPolygonNodes(
        dragPolygon,
        lineNodes.slice(0, lineNodes.length - 1),
      );
    }
    return feature;
  }

  onLineDragEnd(e: ISceneMouseEvent) {
    const feature = super.onLineDragEnd(e);
    const dragPolygon = this.dragPolygon;
    if (feature && dragPolygon) {
      dragPolygon.properties.isDrag = false;
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
    return this.handlePolygonHover(e.feature!);
  }

  onPolygonUnHover(e: ILayerMouseEvent<IPolygonFeature>) {
    if (this.drawPolygon) {
      return;
    }
    return this.handlePolygonUnHover();
  }

  onPolygonDragStart(e: ILayerMouseEvent<IPolygonFeature>) {
    if (!this.options.editable || this.drawPolygon) {
      return;
    }
    this.previousPosition = transLngLat2Position(getLngLat(e));
    return this.handlePolygonDragStart(e.feature!);
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
      this.setEditPolygon(editPolygon);
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
}
