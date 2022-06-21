import { Scene } from '@antv/l7';
import { Feature } from '@turf/turf';
import { first, last } from 'lodash';
import { DrawEvent, RenderEvent } from '../constant';
import {
  DeepPartial,
  ILayerMouseEvent,
  ILineFeature,
  ILineProperties,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  IPolygonProperties,
  ISceneMouseEvent,
} from '../typings';
import {
  createPointFeature,
  createPolygonFeature,
  getLngLat,
  getPosition,
  isSameFeature,
  updateTargetFeature,
} from '../utils';
import { IPolygonModeOptions, PolygonMode } from './polygon-mode';

export interface IDragPolygonModeOptions<F extends Feature = Feature>
  extends IPolygonModeOptions<F> {
  createByDrag: boolean;
}

export abstract class DragPolygonMode<
  T extends IDragPolygonModeOptions,
> extends PolygonMode<T> {
  constructor(scene: Scene, options: DeepPartial<T>) {
    super(scene, options);

    this.onSceneDragStart = this.onSceneDragStart.bind(this);
    this.onSceneDragEnd = this.onSceneDragEnd.bind(this);
  }

  get drawLine() {
    return this.drawPolygon?.properties.line;
  }

  getDefaultOptions(options: DeepPartial<T>): T {
    const newOptions = {
      ...super.getDefaultOptions(options),
      showMidPoint: false,
      createByDrag: false,
      autoFocus: false,
    };
    if (options.createByDrag) {
      newOptions.autoFocus = false;
    }
    return newOptions;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getMidPointsByLine(line: ILineFeature): IMidPointFeature[] {
    return [];
  }

  abstract handleCreatePolygonLine(
    startNode: IPointFeature,
    endNode: IPointFeature,
    properties: Partial<ILineProperties>,
  ): ILineFeature;

  handleCreatePolygon(
    points: IPointFeature[],
    line: ILineFeature,
    properties: Partial<IPolygonProperties> = {},
  ) {
    const lineNodes = line.properties.nodes;
    return createPolygonFeature(lineNodes.slice(0, lineNodes.length - 1), {
      nodes: points,
      line,
      ...properties,
    });
  }

  handleFirstNodeCreate(firstNode: IPointFeature) {
    const lastNode = createPointFeature(firstNode.geometry.coordinates);
    const line = this.handleCreatePolygonLine(firstNode, lastNode, {
      isDraw: true,
      isActive: true,
    });
    const polygon = this.handleCreatePolygon([firstNode, lastNode], line, {
      isDraw: true,
      isActive: true,
    });
    this.setPolygonData((features) =>
      updateTargetFeature({
        target: polygon,
        data: [...features, polygon],
        targetHandler: (feature) => {
          feature.properties = {
            ...feature.properties,
            isDraw: true,
            isActive: true,
          };
        },
      }),
    );
    this.emit(
      DrawEvent.addNode,
      firstNode,
      this.drawPolygon,
      this.getPolygonData(),
    );
    return firstNode;
  }

  handleLastNodeCreate(lastNode: IPointFeature) {
    const { autoFocus, editable } = this.options;
    const drawPolygon = this.drawPolygon;
    if (!drawPolygon) {
      return lastNode;
    }
    this.setLineData((features) => [...features, drawPolygon.properties.line]);
    this.setEditPolygon(drawPolygon);
    if (!(autoFocus && editable)) {
      this.handlePolygonUnClick(drawPolygon);
    }
    this.emit(DrawEvent.add, drawPolygon, this.getPolygonData());

    this.emit(
      DrawEvent.addNode,
      drawPolygon.properties.nodes[1],
      this.drawPolygon,
      this.getPolygonData(),
    );
    return lastNode;
  }

  onPointCreate(e: ILayerMouseEvent): IPointFeature | undefined {
    const { createByDrag } = this.options;
    if (!this.addable || this.dragPoint || this.editLine || createByDrag) {
      return;
    }
    const drawPolygon = this.drawPolygon;
    const position = getPosition(e);
    const feature = this.handleCreatePoint(position);
    if (drawPolygon) {
      requestAnimationFrame(() => {
        this.handleLastNodeCreate(feature);
      });
    } else {
      this.handleFirstNodeCreate(feature);
    }
    return feature;
  }

  setEditPolygon(
    polygon: IPolygonFeature,
    properties: Partial<IPolygonProperties> = {},
  ) {
    this.setEditLine(polygon.properties.line, properties);
    this.setPolygonData((features) => {
      return updateTargetFeature({
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
      });
    });
    this.setPointData(polygon.properties.nodes);
    this.setDashLineData([]);
    const texts = this.getAllTexts();
    this.setTextData(texts);
    return polygon;
  }

  onPointDragging(e: ISceneMouseEvent) {
    const dragPoint = this.dragPoint;
    if (!dragPoint) {
      return;
    }
    const feature = this.handlePointDragging(dragPoint, getLngLat(e));
    const editPolygon = this.editPolygon;
    if (feature && editPolygon) {
      this.syncPolygonNodes(
        editPolygon,
        editPolygon.properties.nodes.map((node) => {
          if (isSameFeature(node, feature)) {
            return feature;
          }
          return node;
        }),
      );
      this.setEditPolygon(editPolygon);
    }
    return feature;
  }

  onSceneDragStart(e: ISceneMouseEvent) {
    const { createByDrag } = this.options;

    if (!createByDrag || !this.addable || this.dragPoint || this.editLine) {
      return;
    }
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.handleFirstNodeCreate(this.handleCreatePoint(getPosition(e)));
  }

  onSceneDragEnd(e: ISceneMouseEvent) {
    const { createByDrag } = this.options;
    if (
      !createByDrag ||
      !this.addable ||
      this.dragPoint ||
      this.editLine ||
      !this.drawPolygon
    ) {
      return;
    }
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.handleLastNodeCreate(this.handleCreatePoint(getPosition(e)));
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    const drawPolygon = this.drawPolygon;
    if (!drawPolygon) {
      return;
    }
    const { nodes } = drawPolygon.properties;
    const firstNode = first(nodes)!;
    const lastNode = last(nodes)!;
    lastNode.geometry.coordinates = getPosition(e);
    this.syncPolygonNodes(drawPolygon, [firstNode, lastNode]);
    this.setDashLineData([drawPolygon.properties.line]);
    this.setTextData(this.getAllTexts());
    this.resetCursor();
  }

  bindSceneDragEvent() {
    this.unbindSceneDragEvent();
    this.sceneRender.on(RenderEvent.dragstart, this.onSceneDragStart);
    this.sceneRender.on(RenderEvent.dragend, this.onSceneDragEnd);

    this.scene.setMapStatus({
      dragEnable: false,
    });
  }

  unbindSceneDragEvent() {
    this.sceneRender.off(RenderEvent.dragstart, this.onSceneDragStart);
    this.sceneRender.off(RenderEvent.dragend, this.onSceneDragEnd);
    this.scene.setMapStatus({
      dragEnable: true,
    });
  }

  bindEnableEvent() {
    super.bindEnableEvent();
    if (this.options.createByDrag) {
      this.bindSceneDragEvent();
    }
  }

  unbindEnableEvent() {
    super.unbindEnableEvent();
    if (this.options.createByDrag) {
      this.unbindSceneDragEvent();
    }
  }

  bindThis() {
    super.bindThis();
    this.onSceneDragStart = this.onSceneDragStart.bind(this);
    this.onSceneDragEnd = this.onSceneDragEnd.bind(this);
  }
}
