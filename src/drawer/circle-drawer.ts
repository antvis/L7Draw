import { Scene } from '@antv/l7';
import {
  bbox,
  center,
  circle,
  coordAll,
  distance,
  Feature,
  Polygon,
} from '@turf/turf';
import { DrawEvent } from '../constant';
import { DragPolygonMode, IDragPolygonModeOptions } from '../mode';
import {
  DeepPartial,
  IDistanceOptions,
  ILineProperties,
  IPointFeature,
  IPolygonFeature,
  ISceneMouseEvent,
  ITextFeature,
} from '../typings';
import {
  createLineFeature,
  createPointFeature,
  getPosition,
  isSameFeature,
} from '../utils';

export interface ICircleDistanceOptions extends IDistanceOptions {
  showOnRadius: boolean;
}

export interface ICircleDrawerOptions
  extends IDragPolygonModeOptions<Feature<Polygon>> {
  circleSteps: number;
  distanceText: ICircleDistanceOptions;
}

export class CircleDrawer extends DragPolygonMode<ICircleDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<ICircleDrawerOptions>) {
    super(scene, options);
    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
    this.bindPolygonRenderEvent();
  }

  getDefaultOptions(
    options: DeepPartial<ICircleDrawerOptions>,
  ): ICircleDrawerOptions {
    const newOptions = super.getDefaultOptions(options);
    if (newOptions.distanceText) {
      newOptions.distanceText.total = true;
      if (newOptions.distanceText.showOnRadius === undefined) {
        newOptions.distanceText.showOnRadius = true;
      }
    }
    return {
      ...newOptions,
      showMidPoint: false,
      circleSteps: 60,
    };
  }

  getDistanceTexts(): ITextFeature[] {
    const { distanceText } = this.options;
    if (!distanceText) {
      return [];
    }
    const textList: ITextFeature[] = [];
    const { showOnNormal, showOnActive, showOnDash, format, total } =
      distanceText;

    textList.push(
      ...this.getDashLineDistanceTexts(this.getDashLineData(), {
        total: true,
        format,
        showOnDash,
      }),
      ...this.getLineDistanceTexts(this.getLineData(), {
        total,
        format,
        showOnActive,
        showOnNormal,
      }),
    );

    return textList;
  }

  // @ts-ignore
  setData(data: Feature<Polygon>[]) {
    const result = data.map((feature) => {
      const [lng1, lat1] = center(feature).geometry.coordinates;
      const box = bbox(feature);
      const lng2 = box[2]!;
      const lat2 = (box[1] + box[3]) / 2;
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

  onLineDragging(e: ISceneMouseEvent) {
    const dragPolygon = this.dragPolygon;
    const [preLng, preLat] = this.previousPosition;
    const feature = super.onLineDragging(e);
    if (dragPolygon) {
      const [curLng, curLat] = getPosition(e);
      const nodes = dragPolygon.properties.nodes;
      nodes.forEach((node) => {
        const [lng, lat] = node.geometry.coordinates;
        node.geometry.coordinates = [
          lng + curLng - preLng,
          lat + curLat - preLat,
        ];
      });
      this.syncPolygonNodes(dragPolygon, dragPolygon.properties.nodes);
      this.setEditPolygon(dragPolygon, {
        isDrag: true,
      });
      this.emit(DrawEvent.dragging, dragPolygon, this.getPolygonData());
    }
    return feature;
  }
}
