import {
  BasePolygonDrawer,
  IBasePolygonDrawerOptions,
} from './common/BasePolygonDrawer';
import { Scene } from '@antv/l7';
import {
  DeepPartial,
  IDrawerOptionsData,
  ILayerMouseEvent,
  ILineFeature,
  ILineProperties,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import {
  bbox,
  coordAll,
  envelope,
  Feature,
  featureCollection,
  lineString,
  point,
  Polygon,
  polygon,
  Position,
} from '@turf/turf';
import {
  createPointFeature,
  getLngLat,
  getUuid,
  isSameFeature,
} from '../utils';
import { isEqual } from 'lodash';
import { DrawerEvent } from '../constants';

export interface IRectDrawerOptions extends IBasePolygonDrawerOptions {
  createByDrag: boolean;
  createByClick: boolean;
}

export class RectDrawer extends BasePolygonDrawer<IRectDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<IRectDrawerOptions>) {
    super(scene, options);
  }

  setData(data: Feature<Polygon>[]) {
    this.source.setData(
      this.initData({
        polygon: data,
      }) ?? {},
    );
  }

  getDefaultOptions(
    options: DeepPartial<IRectDrawerOptions>,
  ): IRectDrawerOptions {
    return {
      ...super.getDefaultOptions(options),
      showMidPoint: false,
      createByDrag: true,
      createByClick: true,
      autoFocus: false,
    };
  }

  initData(data: IDrawerOptionsData): Partial<ISourceData> | undefined {
    let { polygon } = data;
    if (polygon?.length) {
      const result = polygon.map((feature) => {
        const [lng1, lat1, lng2, lat2] = bbox(feature);
        return this.initRectPolygon([lng1, lat1], [lng2, lat2], {
          isActive: !!feature.properties?.isActive,
        });
      });
      const activeFeature = result.find(
        (feature) => feature.properties.isActive,
      );
      setTimeout(() => {
        if (activeFeature && this.options.editable && this.isEnable) {
          this.setEditPolygon(activeFeature);
        }
      }, 0);
      return {
        polygon: result,
        line: result.map((feature) => feature.properties.line),
      };
    }
    return {};
  }

  getMidPointList(lineFeature: ILineFeature): IMidPointFeature[] {
    return [];
  }

  syncPolygonNodes(feature: IPolygonFeature) {
    const { line, nodes } = feature.properties;
    const positions = coordAll(envelope(featureCollection(nodes)));
    feature.geometry.coordinates = [positions];

    line.geometry.coordinates = positions;
    line.properties.nodes = positions.map((position) => {
      const targetNode = nodes.find((node) =>
        isEqual(node.geometry.coordinates, position),
      );
      return targetNode ?? point(position);
    });

    if (feature.properties.isDraw) {
      line.properties.isActive = false;
    } else if (feature.properties.isActive) {
      line.properties.isActive = true;
    }
  }

  initRectPolygon(
    [lng1, lat1]: Position,
    [lng2, lat2]: Position,
    properties: any = {},
  ) {
    const node1 = createPointFeature({ lng: lng1, lat: lat1 });
    const node2 = createPointFeature({ lng: lng2, lat: lat2 });
    Object.assign(node1.properties, properties);
    Object.assign(node2.properties, properties);
    const positions = coordAll(envelope(featureCollection([node1, node2])));
    const lineProperties: ILineProperties = {
      id: getUuid('line'),
      isDraw: false,
      isActive: false,
      isHover: false,
      isDrag: false,
      createTime: Date.now(),
      nodes: [node1, node2],
      ...properties,
    };
    const line = lineString(positions, lineProperties) as ILineFeature;
    return polygon([positions], {
      id: getUuid('polygon'),
      isHover: false,
      isDrag: false,
      isDraw: false,
      isActive: false,
      nodes: [node1, node2],
      line,
      ...properties,
    });
  }

  createDrawRect(e: ISceneMouseEvent | ILayerMouseEvent) {
    if (this.editPolygon) {
      return;
    }
    const { lng, lat } = getLngLat(e);
    const newFeature = this.initRectPolygon([lng, lat], [lng, lat], {
      isActive: true,
      isDraw: true,
    });
    const point = newFeature.properties.nodes;

    this.source.setData({
      point,
      polygon: [
        ...this.getPolygonData().map((feature) => {
          feature.properties.isActive = false;
          return feature;
        }),
        newFeature,
      ],
    });
  }

  moveDrawRect(e: ISceneMouseEvent) {
    const drawPolygon = this.drawPolygon;
    if (drawPolygon) {
      const lastNode = drawPolygon.properties.nodes[1]!;
      const { lng, lat } = getLngLat(e);
      lastNode.geometry.coordinates = [lng, lat];
      this.syncPolygonNodes(drawPolygon);
      const normalPolygonList = this.getPolygonData().filter(
        (feature) => !isSameFeature(feature, drawPolygon),
      );

      this.source.setData({
        point: drawPolygon.properties.nodes,
        polygon: this.getPolygonData().map((feature) => {
          if (isSameFeature(feature, this.drawPolygon)) {
            return drawPolygon;
          }
          return feature;
        }),
        dashLine: [drawPolygon.properties.line],
        text: [
          ...this.getDashLineDistanceTextList([drawPolygon.properties.line]),
          ...this.getDistanceTextList(
            normalPolygonList.map((feature) => feature.properties.line),
            null,
          ),
          ...this.getAreaTextList(this.getPolygonData(), this.drawPolygon),
        ],
      });
    }
  }

  drawPolygonFinish() {
    const drawPolygon = this.drawPolygon;
    const [firstNode, lastNode] = this.drawPolygon?.properties.nodes ?? [];
    if (
      drawPolygon &&
      !isEqual(firstNode?.geometry.coordinates, lastNode?.geometry.coordinates)
    ) {
      drawPolygon.properties.isDraw = false;
      this.syncPolygonNodes(drawPolygon);
      const { editable, autoFocus } = this.options;
      const isActive = editable && autoFocus;
      this.setLineData(
        this.getPolygonData().map((feature) => feature.properties.line),
      );
      this.setEditPolygon(isActive ? drawPolygon : null);
      this.scene.setMapStatus({
        dragEnable: true,
      });
      this.emit(DrawerEvent.add, drawPolygon, this.getPolygonData());
      this.emit(DrawerEvent.change, this.getPolygonData());
    }
  }

  onSceneDragStart(e: ISceneMouseEvent) {
    if (this.editPolygon || !this.options.createByDrag) {
      return;
    }
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.createDrawRect(e);
  }

  onSceneDragging(e: ISceneMouseEvent) {
    this.moveDrawRect(e);
  }

  onSceneDragEnd(e: ISceneMouseEvent) {
    this.drawPolygonFinish();
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    this.moveDrawRect(e);
  }

  onPointUnClick(e: ILayerMouseEvent<IPointFeature>) {
    if (this.editPolygon || !this.options.createByClick) {
      return;
    }
    this.createDrawRect(e);
  }

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {
    if (this.drawPolygon) {
      this.drawPolygonFinish();
    }
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    super.onPointDragEnd(e);
    if (this.editPolygon) {
      this.emit(DrawerEvent.edit, this.editPolygon, this.getPointData());
      this.emit(DrawerEvent.change, this.getPolygonData());
    }
  }

  onPointDragging(e: ISceneMouseEvent) {
    const dragPoint = this.dragPoint;
    const editPolygon = this.editPolygon;
    if (dragPoint && editPolygon) {
      const { lng, lat } = getLngLat(e);
      dragPoint.geometry.coordinates = [lng, lat];
      editPolygon.properties.nodes = editPolygon.properties.nodes.map(
        (node) => {
          if (isSameFeature(node, dragPoint)) {
            return dragPoint;
          }
          return node;
        },
      );
      this.syncPolygonNodes(editPolygon);
      this.setEditPolygon(editPolygon);
    }
  }

  enable() {
    super.enable();
    this.scene.setMapStatus({
      dragEnable: false,
    });
    this.scene.on('dragstart', this.onSceneDragStart);
    this.scene.on('dragging', this.onSceneDragging);
    this.scene.on('dragend', this.onSceneDragEnd);
    this.scene.on('mousemove', this.onSceneMouseMove);
  }

  disable() {
    super.disable();
    if (this.editPolygon) {
      this.setEditPolygon(null);
    }
    this.scene.off('dragstart', this.onSceneDragStart);
    this.scene.off('dragging', this.onSceneDragging);
    this.scene.off('dragend', this.onSceneDragEnd);
    this.scene.off('mousemove', this.onSceneMouseMove);
  }

  bindThis() {
    super.bindThis();
    this.onSceneDragStart = this.onSceneDragStart.bind(this);
    this.onSceneDragging = this.onSceneDragging.bind(this);
    this.onSceneDragEnd = this.onSceneDragEnd.bind(this);
    this.onSceneMouseMove = this.onSceneMouseMove.bind(this);
    this.onPointUnClick = this.onPointUnClick.bind(this);
    this.onPointClick = this.onPointClick.bind(this);
    this.onPointDragEnd = this.onPointDragEnd.bind(this);
  }
}
