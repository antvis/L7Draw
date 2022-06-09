import { IPolygonModeOptions, PolygonMode } from '../mode';
import {
  bbox,
  center,
  circle,
  coordAll,
  distance,
  envelope,
  Feature,
  featureCollection,
  Polygon,
} from '@turf/turf';
import {
  DeepPartial,
  ILayerMouseEvent,
  ILineFeature,
  ILineProperties,
  IPointFeature,
  IPolygonFeature,
  IPolygonProperties,
  ISceneMouseEvent,
} from '../typings';
import { Scene } from '@antv/l7';
import { IPolygonDrawerOptions } from './polygon-drawer';
import {
  createLineFeature,
  createPointFeature,
  createPolygonFeature,
  getLngLat,
  isSameFeature,
  transLngLat2Position,
  updateTargetFeature,
} from '../utils';
import { first, isEqual, last } from 'lodash';
import { DrawerEvent } from '../constant';

export interface ICircleDrawerOptions
  extends IPolygonModeOptions<Feature<Polygon>> {
  circleSteps: number;
}

export class CircleDrawer extends PolygonMode<ICircleDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<IPolygonDrawerOptions>) {
    super(scene, options);
    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
    this.bindPolygonRenderEvent();
  }

  get drawLine() {
    return this.drawPolygon?.properties.line;
  }

  getDefaultOptions(
    options: DeepPartial<ICircleDrawerOptions>,
  ): ICircleDrawerOptions {
    return {
      ...super.getDefaultOptions(options),
      showMidPoint: false,
      circleSteps: 60,
    };
  }

  // @ts-ignore
  initData(data: Feature<Polygon>[]) {
    const result = data.map((feature) => {
      const [lng1, lat1] = center(feature).geometry.coordinates;
      const box = bbox(feature);
      const lng2 = box[2]!;
      const lat2 = (box[1] + box[3]) / 2;
      const startNode = createPointFeature([lng1, lat1]);
      const endNode = createPointFeature([lng2, lat2]);
      const isActive = !!feature.properties?.isActive;
      const line = this.handleCreateCircleLine(startNode, endNode, {
        isActive,
      });
      return this.handleCreatePolygon([startNode, endNode], line, {
        isActive,
      });
    });
    const editPolygon = result.find((feature) => feature.properties.isActive);
    if (editPolygon) {
      setTimeout(() => {
        this.setEditPolygon(editPolygon);
      }, 0);
    }
    return {
      point: [],
      midPoint: [],
      dashLine: [],
      polygon: result,
      line: result.map((feature) => feature.properties.line),
      text: this.getAllTexts(),
    };
  }

  handleCreateCircleLine(
    startNode: IPointFeature,
    endNode: IPointFeature,
    properties: Partial<ILineProperties> = {},
  ) {
    const dis = distance(startNode, endNode, {
      units: 'meters',
    });
    const positions = coordAll(
      circle(startNode, dis, {
        units: 'meters',
      }),
    );
    const nodes = positions.map((position) => {
      return createPointFeature(position);
    });
    return createLineFeature(nodes, properties);
  }

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

  syncPolygonNodes(polygon: IPolygonFeature, nodes: IPointFeature[]) {
    const line = polygon.properties.line;
    const startNode = nodes[0]!;
    const endNode = nodes[1]!;
    const dis = distance(startNode, endNode, {
      units: 'meters',
    });
    const positions = coordAll(
      circle(startNode, dis, {
        units: 'meters',
      }),
    );

    polygon.properties.nodes = nodes;
    polygon.geometry.coordinates = [positions];

    this.setPolygonData((features) => {
      return features.map((feature) => {
        if (isSameFeature(feature, polygon)) {
          return polygon;
        }
        return feature;
      });
    });

    this.setPointData(polygon.properties.isDraw ? [nodes[0]] : nodes);

    line.properties.nodes.forEach((lineNode, index) => {
      lineNode.geometry.coordinates = positions[index];
    });

    line.geometry.coordinates = positions;

    return polygon;
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

  onPointCreate(e: ILayerMouseEvent): IPointFeature | undefined {
    if (
      (!this.options.multiple &&
        this.getPolygonData().length >= 1 &&
        !this.drawPolygon) ||
      this.dragPoint ||
      this.editLine
    ) {
      return;
    }
    const { autoFocus, editable } = this.options;
    const drawPolygon = this.drawPolygon;
    const position = transLngLat2Position(getLngLat(e));
    const feature = this.handleCreatePoint(position);
    if (drawPolygon) {
      setTimeout(() => {
        this.setLineData((features) => [
          ...features,
          drawPolygon.properties.line,
        ]);
        this.setEditPolygon(drawPolygon);
        if (!(autoFocus && editable)) {
          this.handlePolygonUnClick(drawPolygon);
        }
        this.emit(DrawerEvent.add, drawPolygon, this.getPolygonData());
        this.emit(DrawerEvent.change, this.getPolygonData());
      }, 0);
    } else {
      const endNode = createPointFeature(position);
      const line = this.handleCreateCircleLine(feature, endNode, {
        isDraw: true,
        isActive: true,
      });
      const polygon = this.handleCreatePolygon([feature, endNode], line, {
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
          otherHandler: (feature) => {
            feature.properties.isActive = false;
          },
        }),
      );
    }
    return feature;
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

  onLineDragging(e: ISceneMouseEvent) {
    const feature = super.onLineDragging(e);
    const dragPolygon = this.dragPolygon;
    if (feature && dragPolygon) {
      this.syncPolygonNodes(dragPolygon, dragPolygon.properties.nodes);
      this.setEditPolygon(dragPolygon, {
        isDrag: true,
      });
      this.emit(DrawerEvent.dragging, dragPolygon, this.getPolygonData());
    }
    return feature;
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    const drawPolygon = this.drawPolygon;
    if (!drawPolygon) {
      return;
    }
    const { nodes } = drawPolygon.properties;
    const firstNode = first(nodes)!;
    const lastNode = last(nodes)!;
    lastNode.geometry.coordinates = transLngLat2Position(getLngLat(e));
    this.syncPolygonNodes(drawPolygon, [firstNode, lastNode]);
    this.setDashLineData([drawPolygon.properties.line]);
    this.setTextData(this.getAllTexts());
    this.setCursor('draw');
  }
}
