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
      nodes: points,
      line,
      isActive: true,
      isDraw: true,
    });
  }

  syncPolygonNodes(polygon: IPolygonFeature, nodes: IPointFeature[]) {
    polygon.properties.nodes = nodes;
    polygon.geometry.coordinates = [
      coordAll(envelope(featureCollection(nodes))),
    ];

    this.setPolygonData((features) => {
      return features.map((feature) => {
        if (isSameFeature(feature, polygon)) {
          return polygon;
        }
        return feature;
      });
    });

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
  }
}
