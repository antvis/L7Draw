import {
  BasePolygonDrawer,
  IBasePolygonDrawerOptions,
} from './common/BasePolygonDrawer';
// import { Scene } from '@antv/l7';
import {
  // DeepPartial,
  IDashLineFeature,
  IDrawerOptionsData,
  ILayerMouseEvent,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import {
  createPolygon,
  getLngLat,
  getUuid,
  isSameFeature,
  transformPolygonFeature,
} from '../utils';
import { cloneDeep, first, isEqual, last } from 'lodash';
import {
  booleanClockwise,
  coordAll,
  Feature,
  featureCollection,
  lineString,
  Polygon,
} from '@turf/turf';
import { DrawerEvent } from '../constants';

export interface IPolygonDrawerOptions extends IBasePolygonDrawerOptions {}

export class PolygonDrawer extends BasePolygonDrawer<IPolygonDrawerOptions> {
  // constructor(scene: Scene, options: DeepPartial<IPolygonDrawerOptions>) {
  //   super(scene, options);
  // }

  setData(data: Feature<Polygon>[]) {
    this.source.setData(
      this.initData({
        polygon: data,
      }) ?? {},
    );
  }

  syncPolygonNodes(feature: IPolygonFeature): void {
    const nodes = feature.properties.nodes;
    const positions = coordAll(featureCollection(nodes));
    const firstPosition = first(positions);
    if (!isEqual(firstPosition, last(positions))) {
      positions.push(firstPosition!);
    }
    if (!feature.properties.isDraw) {
      const lineFeature = feature.properties.line;
      const firstNode = cloneDeep(first(nodes))!;
      firstNode.properties.id = getUuid('point');
      lineFeature.properties.nodes = [...nodes, firstNode];
      lineFeature.geometry.coordinates = lineFeature.properties.nodes.map(
        (feature) => feature.geometry.coordinates,
      );
    }
    feature.geometry.coordinates[0] = booleanClockwise(lineString(positions))
      ? positions
      : positions.reverse();
  }

  initData(data: IDrawerOptionsData): Partial<ISourceData> | undefined {
    if (data.polygon?.length) {
      const sourceData: Partial<ISourceData> = {};
      const polygon = data.polygon.map((feature) =>
        transformPolygonFeature(feature),
      );
      const editPolygon = polygon.find(
        (feature) => feature.properties.isActive,
      );
      setTimeout(() => {
        if (editPolygon && this.options.editable && this.isEnable) {
          this.setEditPolygon(editPolygon);
        }
      }, 0);
      sourceData.polygon = polygon;
      sourceData.line = polygon.map((feature) => feature.properties.line);
      sourceData.text = [
        ...this.getDistanceTextList(
          sourceData.line,
          editPolygon?.properties.line ?? null,
        ),
        ...this.getAreaTextList(sourceData.polygon, editPolygon ?? null),
      ];

      return sourceData;
    }
  }

  onPointUnClick(e: ILayerMouseEvent<IPointFeature>) {
    if (
      this.editPolygon ||
      (this.scene.getPickedLayer() !== -1 && !this.drawPolygon)
    ) {
      return;
    }
    super.onPointUnClick(e);
    const currentFeature = e.feature!;
    const drawPolygon = this.drawPolygon;
    let newSourceData: Partial<ISourceData> = {};
    if (drawPolygon) {
      drawPolygon.properties.nodes.push(currentFeature);
      this.syncPolygonNodes(drawPolygon);
      const firstNode = first(drawPolygon.properties.nodes)!;
      const dashLine = [
        lineString(
          coordAll(featureCollection([currentFeature, firstNode])),
        ) as IDashLineFeature,
      ];
      newSourceData = {
        polygon: this.getPolygonData().map((feature) => {
          if (isSameFeature(feature, drawPolygon)) {
            return drawPolygon;
          }
          return feature;
        }),
        dashLine,
        text: [
          ...this.getDistanceTextList(this.getLineData(), this.drawLine),
          ...this.getDashLineDistanceTextList(dashLine),
          ...this.getAreaTextList(this.getPolygonData(), this.drawPolygon),
        ],
      };
    } else {
      const newPolygon = createPolygon(currentFeature.geometry.coordinates, {
        id: getUuid('polygon'),
        nodes: [currentFeature],
        isHover: false,
        isActive: true,
        isDrag: false,
        isDraw: true,
        line: this.drawLine!,
      });

      newSourceData = {
        polygon: [
          ...this.getPolygonData().map((feature) => {
            feature.properties.isActive = false;
            return feature;
          }),
          newPolygon,
        ],
      };
    }
    this.source.setData(newSourceData);
  }

  onPointDragging(e: ISceneMouseEvent) {
    const editPolygon = this.editPolygon;
    const dragPoint = this.dragPoint;
    if (!editPolygon || !this.editLine || !dragPoint) {
      return;
    }
    super.onPointDragging(e);
    this.syncPolygonNodes(editPolygon);
    this.source.setData({
      point: editPolygon.properties.nodes,
      polygon: this.getPolygonData(),
      midPoint: this.getMidPointList(editPolygon.properties.line),
      text: [
        ...this.getDistanceTextList(this.getLineData(), this.editLine),
        ...this.getAreaTextList(this.getPolygonData(), this.editPolygon),
      ],
    });
  }

  onPointDragEnd(e: ISceneMouseEvent) {
    if (this.dragPoint && this.options.editable) {
      this.setPointData((data) =>
        data.map((feature) => {
          if (isSameFeature(this.dragPoint, feature)) {
            feature.properties.isActive = feature.properties.isDrag = false;
          }
          return feature;
        }),
      );
      this.scene.setMapStatus({
        dragEnable: true,
      });
      this.setCursor('pointHover');
      this.emit(DrawerEvent.edit, this.editPolygon, this.getPolygonData());
      this.emit(DrawerEvent.change, this.getPolygonData());
    }
  }

  onMidPointClick(e: ILayerMouseEvent<IMidPointFeature>) {
    super.onMidPointClick(e);
    if (this.editPolygon) {
      const lineNodes = this.editPolygon.properties.line.properties.nodes;
      this.editPolygon.properties.nodes = lineNodes.slice(
        0,
        lineNodes.length - 1,
      );
      this.source.setData({
        text: [
          ...this.getDistanceTextList(
            this.getLineData(),
            this.editLine ?? null,
          ),
          ...this.getAreaTextList(this.getPolygonData(), this.editPolygon),
        ],
      });
    }
  }

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {
    const feature = e.feature;
    if (this.drawPolygon && feature && this.drawLine) {
      const isFirstNode = isSameFeature(
        feature,
        first(this.drawPolygon.properties.nodes),
      );
      const isLastNode = isSameFeature(
        feature,
        last(this.drawPolygon.properties.nodes),
      );
      if (isFirstNode || isLastNode) {
        this.drawPolygonFinish();
      } else if (this.options.allowOverlap) {
        this.onPointUnClick(e);
      }
    }
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    if (!this.drawPolygon) {
      return;
    }
    const dashLine: IDashLineFeature[] = [];
    const nodes = this.drawPolygon.properties.nodes;
    const nodesLength = nodes.length;
    if (nodesLength) {
      const { lng, lat } = getLngLat(e);
      const lastNode = last(nodes) as IPointFeature;
      dashLine.push(
        lineString([...coordAll(lastNode), [lng, lat]]) as IDashLineFeature,
      );
      if (nodesLength > 1) {
        const firstNode = first(nodes) as IPointFeature;
        dashLine.push(
          lineString([...coordAll(firstNode), [lng, lat]]) as IDashLineFeature,
        );
      }
    }

    this.source.setData({
      dashLine,
      text: [
        ...this.getDistanceTextList(this.getLineData(), this.drawLine),
        ...this.getDashLineDistanceTextList(dashLine),
        ...this.getAreaTextList(this.getPolygonData(), this.drawPolygon),
      ],
    });
  }

  drawPolygonFinish() {
    const drawPolygon = this.drawPolygon;
    const drawLine = drawPolygon?.properties.line;
    if (drawPolygon && drawLine && drawPolygon.properties.nodes.length > 2) {
      const firstPoint = cloneDeep(first(drawPolygon.properties.nodes))!;
      firstPoint.properties.id = getUuid('point');
      drawLine.properties.nodes.push(firstPoint);
      drawLine.properties.createTime = Date.now();
      drawLine.geometry.coordinates.push(firstPoint.geometry.coordinates);
      const { editable, autoFocus, multiple } = this.options;
      const isActive = editable && autoFocus;
      this.setEditPolygon(isActive ? drawPolygon : null);
      this.emit(DrawerEvent.add, drawPolygon, this.getPolygonData());
      this.emit(DrawerEvent.change, this.getPolygonData());
      if (!multiple) {
        this.disable();
      }
    }
  }

  bindThis() {
    super.bindThis();

    this.onPointUnClick = this.onPointUnClick.bind(this);
    this.onPointDragging = this.onPointDragging.bind(this);
    this.onPolygonDragEnd = this.onPolygonDragEnd.bind(this);
    this.onPointClick = this.onPointClick.bind(this);
    this.onMidPointClick = this.onMidPointClick.bind(this);
    this.onSceneMouseMove = this.onSceneMouseMove.bind(this);
  }
}
