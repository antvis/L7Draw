import { IPolygonModeOptions, PolygonMode } from '../mode';
import { coordAll, Feature, Polygon } from '@turf/turf';
import {
  DeepPartial,
  IDashLineFeature,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  IRenderType,
  ISceneMouseEvent,
} from '../typings';
import { Scene } from '@antv/l7';
import {
  createDashLine,
  createLineFeature,
  createPointFeature,
  getDefaultPolygonProperties,
  getLngLat,
  isSameFeature,
  transLngLat2Position,
} from '../utils';
import { first, last } from 'lodash';
import { DrawerEvent } from '../constant';

export interface IPolygonDrawerOptions
  extends IPolygonModeOptions<Feature<Polygon>> {}

export class PolygonDrawer extends PolygonMode<IPolygonDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<IPolygonDrawerOptions>) {
    super(scene, options);
    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
    this.bindPolygonRenderEvent();
  }

  // @ts-ignore
  initData(data: Feature<Polygon>[]) {
    const polygonFeatures = data.map((polygon) => {
      polygon.properties = {
        ...getDefaultPolygonProperties(),
        ...(polygon.properties ?? {}),
      };
      if (!polygon.properties.nodes?.length) {
        let positions = coordAll(polygon);
        positions = positions.slice(0, positions.length - 1);
        polygon.properties.nodes = positions.map((position) => {
          return createPointFeature(position);
        });
      }
      if (!polygon.properties.line) {
        const nodes = polygon.properties.nodes as IPointFeature[];
        polygon.properties.line = createLineFeature([
          ...nodes,
          createPointFeature(first(nodes)!.geometry.coordinates),
        ]);
      }
      return polygon as IPolygonFeature;
    });
    const editPolygon = polygonFeatures.find(
      (feature) => feature.properties.isActive,
    );
    if (editPolygon) {
      setTimeout(() => {
        this.setEditPolygon(editPolygon);
      }, 0);
    }
    return {
      point: [],
      midPoint: [],
      dashLine: [],
      polygon: polygonFeatures,
      line: polygonFeatures.map((feature) => feature.properties.line),
      text: this.getAllTexts(),
    };
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
    const feature = super.onPointCreate(e);
    const drawPolygon = this.drawPolygon;
    const drawLine = this.drawLine;
    if (feature) {
      if (drawPolygon) {
        this.syncPolygonNodes(drawPolygon, [
          ...drawPolygon.properties.nodes,
          feature,
        ]);
        this.setDashLineData([
          createDashLine([
            transLngLat2Position(getLngLat(e)),
            drawPolygon.properties.nodes[0].geometry.coordinates,
          ]),
        ]);
      } else if (drawLine) {
        this.handleCreatePolygon([feature], drawLine);
      }
    }
    return feature;
  }

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {
    const drawPolygon = this.drawPolygon;
    const feature = e.feature!;

    if (!drawPolygon) {
      return;
    }

    const nodes = drawPolygon.properties.nodes;
    if (
      nodes.length >= 3 &&
      (isSameFeature(first(nodes), feature) ||
        isSameFeature(last(nodes), feature))
    ) {
      setTimeout(() => {
        drawPolygon.properties.isDraw = false;
        this.syncPolygonNodes(drawPolygon, nodes);
        this.setEditPolygon(drawPolygon);
        const { autoFocus, editable } = this.options;
        if (!autoFocus || !editable) {
          this.handlePolygonUnClick(drawPolygon);
        }
        this.emit(DrawerEvent.add, drawPolygon, this.getPolygonData());
        this.emit(DrawerEvent.change, this.getPolygonData());
      }, 0);
    } else {
      const [lng, lat] = feature.geometry.coordinates;
      e.lngLat = {
        lng,
        lat,
      };
      this.onPointCreate(e);
    }
  }

  onPointDragging(e: ISceneMouseEvent): IPointFeature | undefined {
    const feature = super.onPointDragging(e);
    const editPolygon = this.editPolygon;
    if (feature && editPolygon) {
      const { nodes, line } = editPolygon.properties;
      const lineNodes = line.properties.nodes;
      const firstLineNode = first(lineNodes)!;
      const lastLineNode = last(lineNodes)!;
      if (
        isSameFeature(firstLineNode, feature) ||
        isSameFeature(lastLineNode, feature)
      ) {
        firstLineNode.geometry.coordinates = lastLineNode.geometry.coordinates =
          feature.geometry.coordinates;
      }
      this.syncPolygonNodes(editPolygon, nodes);
      this.setEditPolygon(editPolygon);
    }
    return feature;
  }

  onPointDragEnd(e: ISceneMouseEvent): IPointFeature | undefined {
    const editPolygon = this.editPolygon;
    const feature = super.onPointDragEnd(e);
    if (feature && editPolygon) {
      this.emit(DrawerEvent.edit, editPolygon, this.getPolygonData());
      this.emit(DrawerEvent.change, this.getPolygonData());
    }
    return feature;
  }

  onLineDragStart(e: ILayerMouseEvent<ILineFeature>) {
    const editPolygon = this.editPolygon;
    const feature = super.onLineDragStart(e);
    if (feature && editPolygon) {
      this.emit(DrawerEvent.dragStart, editPolygon, this.getPolygonData());
    }
    return feature;
  }

  onPolygonDragStart(e: ILayerMouseEvent<IPolygonFeature>) {
    const feature = super.onPolygonDragStart(e);
    if (feature) {
      this.emit(DrawerEvent.dragStart, feature, this.getPolygonData());
    }
    return feature;
  }

  onLineDragging(e: ISceneMouseEvent) {
    const feature = super.onLineDragging(e);
    const dragPolygon = this.dragPolygon;
    if (feature && dragPolygon) {
      this.emit(DrawerEvent.dragging, dragPolygon, this.getPolygonData());
    }
    return feature;
  }

  onLineDragEnd(e: ISceneMouseEvent) {
    const dragPolygon = this.dragPolygon;
    const feature = super.onLineDragEnd(e);
    if (feature && dragPolygon) {
      this.emit(DrawerEvent.dragEnd, dragPolygon, this.getPolygonData());
      this.emit(DrawerEvent.edit, dragPolygon, this.getPolygonData());
      this.emit(DrawerEvent.change, this.getPolygonData());
    }
    return feature;
  }

  onMidPointClick(
    e: ILayerMouseEvent<IMidPointFeature>,
  ): IPointFeature | undefined {
    const feature = super.onMidPointClick(e);
    const editPolygon = this.editPolygon;
    if (feature && editPolygon) {
      this.emit(DrawerEvent.edit, editPolygon, this.getPolygonData());
      this.emit(DrawerEvent.change, this.getPolygonData());
    }
    return feature;
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    const drawPolygon = this.drawPolygon;
    const nodes = drawPolygon?.properties.nodes ?? [];
    if (!drawPolygon || !nodes.length) {
      return;
    }
    const mousePosition = transLngLat2Position(getLngLat(e));
    const dashLineData: IDashLineFeature[] = [];
    dashLineData.push(
      createDashLine([mousePosition, first(nodes)!.geometry.coordinates]),
    );
    if (nodes.length > 1) {
      dashLineData.push(
        createDashLine([mousePosition, last(nodes)!.geometry.coordinates]),
      );
    }
    this.setDashLineData(dashLineData);
    this.setTextData(this.getAllTexts());
  }
}
