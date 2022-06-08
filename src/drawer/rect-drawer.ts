import { IPolygonModeOptions, PolygonMode } from '../mode';
import {
  coordAll,
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
  SourceData,
} from '../typings';
import { Scene } from '@antv/l7';
import { IPolygonDrawerOptions } from './polygon-drawer';
import {
  createLineFeature,
  createPointFeature,
  createPolygonFeature,
  getDefaultLineProperties,
  getLngLat,
  isSameFeature,
  transLngLat2Position,
  updateTargetFeature,
} from '../utils';
import { first, isEqual, last } from 'lodash';

export interface IRectDrawerOptions
  extends IPolygonModeOptions<Feature<Polygon>> {}

export class RectDrawer extends PolygonMode<IRectDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<IPolygonDrawerOptions>) {
    super(scene, options);
    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
    this.bindPolygonRenderEvent();
  }

  getDefaultOptions(
    options: DeepPartial<IRectDrawerOptions>,
  ): IRectDrawerOptions {
    return {
      ...super.getDefaultOptions(options),
      showMidPoint: false,
    };
  }

  initData<F>(data: F[]): Partial<SourceData> | undefined {
    return undefined;
  }

  handleCreateRectLine(
    startNode: IPointFeature,
    endNode: IPointFeature,
    properties: Partial<ILineProperties> = {},
  ) {
    const positions = coordAll(
      envelope(featureCollection([startNode, endNode])),
    );
    const nodes = positions.map((position, index) => {
      if (index === 0) {
        return startNode;
      }
      if (index === 2) {
        return endNode;
      }
      return createPointFeature(position);
    });
    return createLineFeature(nodes, properties);
  }

  handleCreatePolygon(points: IPointFeature[], line: ILineFeature) {
    const lineNodes = line.properties.nodes;
    return createPolygonFeature(lineNodes.slice(0, lineNodes.length - 1), {
      isDraw: true,
      isActive: true,
      nodes: points,
      line,
    });
  }

  syncPolygonNodes(polygon: IPolygonFeature, nodes: IPointFeature[]) {
    const line = polygon.properties.line;
    const positions = coordAll(envelope(featureCollection(nodes)));

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

    let lineNodes = line.properties.nodes;

    const otherPositions = positions.filter(
      (position) =>
        !isEqual(position, nodes[0].geometry.coordinates) &&
        !isEqual(position, nodes[1].geometry.coordinates),
    );

    lineNodes.forEach((lineNode, index) => {
      if (index === 1) {
        lineNode.geometry.coordinates = otherPositions[0];
      }
      if (index === 3) {
        lineNode.geometry.coordinates = otherPositions[1];
      }
      if (index === 4) {
        lineNode.geometry.coordinates = [...nodes[0].geometry.coordinates];
      }
    });

    line.geometry.coordinates = positions;

    if (!polygon.properties.isDraw) {
    }

    return polygon;
  }

  setEditPolygon(
    polygon: IPolygonFeature,
    properties: Partial<IPolygonProperties> = {},
  ) {
    this.setLineData((features) => [...features, polygon.properties.line]);
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
    return polygon;
  }

  onPointCreate(e: ILayerMouseEvent): IPointFeature | undefined {
    if (
      (!this.options.multiple &&
        !this.drawPolygon &&
        this.getPolygonData().length >= 1) ||
      this.dragPoint
    ) {
      return;
    }
    const drawPolygon = this.drawPolygon;
    const position = transLngLat2Position(getLngLat(e));
    const feature = this.handleCreatePoint(position);
    if (drawPolygon) {
      setTimeout(() => {
        this.setEditPolygon(drawPolygon);
        console.log(this.getLineData());
      }, 0);
    } else {
      const endNode = createPointFeature(position);
      const line = this.handleCreateRectLine(feature, endNode, {
        isDraw: true,
        isActive: true,
      });
      const polygon = this.handleCreatePolygon([feature, endNode], line);
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
    this.setCursor('draw');
  }
}
