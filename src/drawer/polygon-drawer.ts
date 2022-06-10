import { IPolygonModeOptions, PolygonMode } from '../mode';
import { coordAll, Feature, Polygon } from '@turf/turf';
import {
  DeepPartial,
  IDashLineFeature,
  ILayerMouseEvent,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  ISceneMouseEvent,
} from '../typings';
import { Scene } from '@antv/l7';
import {
  createDashLine,
  createLineFeature,
  createPointFeature,
  getDefaultPolygonProperties,
  getPosition,
  isSameFeature,
} from '../utils';
import { first, last } from 'lodash';
import { DrawerEvent } from '../constant';

export type IPolygonDrawerOptions = IPolygonModeOptions<Feature<Polygon>>;

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
  setData(data: Feature<Polygon>[]) {
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
    this.source.setData({
      point: [],
      midPoint: [],
      dashLine: [],
      polygon: polygonFeatures,
      line: polygonFeatures.map((feature) => feature.properties.line),
    });
    this.setTextData(this.getAllTexts());


    if (this.editPolygon) {
      this.setEditPolygon(this.editPolygon);
    }
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
            getPosition(e),
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

  onLineDragging(e: ISceneMouseEvent) {
    const dragPolygon = this.dragPolygon;
    const feature = super.onLineDragging(e);
    if (feature && dragPolygon) {
      const lineNodes = feature.properties.nodes;
      this.syncPolygonNodes(
        dragPolygon,
        lineNodes.slice(0, lineNodes.length - 1),
      );
      this.emit(DrawerEvent.dragging, dragPolygon, this.getPolygonData());
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
    }
    return feature;
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    const drawPolygon = this.drawPolygon;
    const nodes = drawPolygon?.properties.nodes ?? [];
    if (!drawPolygon || !nodes.length) {
      return;
    }
    const mousePosition = getPosition(e);
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
