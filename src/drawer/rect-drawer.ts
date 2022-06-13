import { Scene } from '@antv/l7';
import {
  bbox,
  coordAll,
  envelope,
  Feature,
  featureCollection,
  Polygon,
  Position,
} from '@turf/turf';
import { cloneDeep, isEqual } from 'lodash';
import { DrawerEvent } from '../constant';
import { DragPolygonMode, IDragPolygonModeOptions } from '../mode';
import {
  DeepPartial,
  ILineProperties,
  IPointFeature,
  IPolygonFeature,
  ISceneMouseEvent,
} from '../typings';
import { createLineFeature, createPointFeature, isSameFeature } from '../utils';
import { IPolygonDrawerOptions } from './polygon-drawer';

export type IRectDrawerOptions = IDragPolygonModeOptions<Feature<Polygon>>;

export class RectDrawer extends DragPolygonMode<IRectDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<IPolygonDrawerOptions>) {
    super(scene, options);
    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
    this.bindPolygonRenderEvent();
  }

  // @ts-ignore
  setData(data: Feature<Polygon>[]) {
    const result = data.map((feature) => {
      const [lng1, lat1, lng2, lat2] = bbox(feature);
      const startNode = createPointFeature([lng1, lat1]);
      const endNode = createPointFeature([lng2, lat2]);
      const isActive = !!feature.properties?.isActive;
      const line = this.handleCreatePolygonLine(startNode, endNode, {
        isActive,
      });
      return this.handleCreatePolygon([startNode, endNode], line, {
        isActive,
      });
    });

    this.source.setData({
      point: [],
      midPoint: [],
      dashLine: [],
      polygon: result,
      line: result.map((feature) => feature.properties.line),
    });
    this.setTextData(this.getAllTexts());

    if (this.editPolygon) {
      this.setEditPolygon(this.editPolygon);
    }
  }

  handleCreatePolygonLine(
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

    const lineNodes = line.properties.nodes;

    const otherPositions = positions.filter(
      (position) =>
        !isEqual(position, nodes[0].geometry.coordinates) &&
        !isEqual(position, nodes[1].geometry.coordinates),
    );

    lineNodes.forEach((lineNode, index) => {
      let position: Position = [0, 0];
      switch (index) {
        case 0:
          position = nodes[0].geometry.coordinates;
          break;
        case 1:
          position = otherPositions[0];
          break;
        case 2:
          position = nodes[1].geometry.coordinates;
          break;
        case 3:
          position = otherPositions[1];
          break;
        case 4:
          position = cloneDeep(nodes[0].geometry.coordinates);
          break;
      }
      lineNode.geometry.coordinates = position;
    });

    line.geometry.coordinates = positions;

    return polygon;
  }

  onLineDragging(e: ISceneMouseEvent) {
    const feature = super.onLineDragging(e);
    const dragPolygon = this.dragPolygon;
    if (feature && dragPolygon) {
      const lineNodes = dragPolygon.properties.line.properties.nodes;
      this.syncPolygonNodes(dragPolygon, [lineNodes[0], lineNodes[2]]);
      this.setEditPolygon(dragPolygon, {
        isDrag: true,
      });
      this.emit(DrawerEvent.dragging, dragPolygon, this.getPolygonData());
    }
    return feature;
  }
}
