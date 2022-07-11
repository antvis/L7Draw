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
  ILineFeature,
  ILineProperties,
  IPointFeature,
  IPolygonFeature,
  ISceneMouseEvent,
  ITextFeature,
} from '../typings';
import {
  createLineFeature,
  createPointFeature,
  getDefaultPolygonProperties,
  getPosition,
  isSameFeature,
} from '../utils';

export interface ICircleDistanceOptions extends IDistanceOptions {
  showOnRadius: boolean;
}

export interface ICircleDrawerOptions
  extends IDragPolygonModeOptions<Feature<Polygon>> {
  circleSteps: number;
  distanceOptions: ICircleDistanceOptions;
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
    if (newOptions.distanceOptions) {
      newOptions.distanceOptions.showTotalDistance = true;
      if (newOptions.distanceOptions.showOnRadius === undefined) {
        newOptions.distanceOptions.showOnRadius = true;
      }
    }
    return {
      ...newOptions,
      showMidPoint: false,
      circleSteps: 60,
    };
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
        showTotalDistance: true,
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

  setData(data: Feature<Polygon>[]) {
    const result = data.map((feature) => {
      feature.properties = {
        ...getDefaultPolygonProperties(),
        ...feature.properties,
      };
      let nodes: [IPointFeature, IPointFeature] | undefined =
        feature.properties?.nodes;
      if (nodes?.length !== 2) {
        const [lng1, lat1] = center(feature).geometry.coordinates;
        const box = bbox(feature);
        const lng2 = box[2]!;
        const lat2 = (box[1] + box[3]) / 2;
        nodes = [
          createPointFeature([lng1, lat1]),
          createPointFeature([lng2, lat2]),
        ];
        feature.properties.nodes = nodes;
      }
      const startNode = nodes[0];
      const endNode = nodes[1];

      const isActive = !!feature.properties?.isActive;
      let line: ILineFeature | undefined = feature.properties.line;
      if (!line) {
        line = this.handleCreatePolygonLine(startNode, endNode, {
          isActive,
        });
        feature.properties.line = line;
      }
      return this.handleCreatePolygon([startNode, endNode], line, {
        ...feature.properties,
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
      this.setActivePolygon(this.editPolygon);
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
      this.setActivePolygon(dragPolygon, {
        isDrag: true,
      });
      this.emit(DrawEvent.Dragging, dragPolygon, this.getPolygonData());
    }
    return feature;
  }
}
