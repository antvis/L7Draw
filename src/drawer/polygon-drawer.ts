import { IPolygonModeOptions, PolygonMode } from '../mode';
import { booleanEqual, Feature, Polygon, Position } from '@turf/turf';
import {
  DeepPartial,
  IBaseFeature,
  IDashLineFeature,
  ILayerMouseEvent,
  ILineFeature,
  IPointFeature,
  IPolygonFeature,
  IRenderType,
  ISceneMouseEvent,
  SourceData,
} from '../typings';
import { Scene } from '@antv/l7';
import {
  createDashLine,
  createPointFeature,
  getDefaultLineProperties,
  getDefaultPolygonProperties,
  getLngLat,
  isSameFeature,
  transLngLat2Position,
} from '../utils';
import { first, last } from 'lodash';
import { DrawerEvent } from '../constant';
import { coordAll, LineString } from '_@turf_turf@6.5.0@@turf/turf';

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

  getRenderTypes(): IRenderType[] {
    return ['polygon', 'line', 'dashLine', 'midPoint', 'point', 'text'];
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
      polygon: polygonFeatures,
      text: this.getAllTexts(),
    };
  }

  setData(data: Feature[]): IBaseFeature[] {
    return this.getPolygonData();
  }

  getData(): IBaseFeature[] {
    return [];
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

  bindEnableEvent(): void {
    this.enablePointRenderAction();
    this.enableLineRenderAction();
    this.enableMidPointRenderAction();
    this.enablePolygonRenderAction();
  }

  unbindEnableEvent(): void {
    this.disablePointRenderAction();
    this.disableLineRenderAction();
    this.disableMidPointRenderAction();
    this.disablePolygonRenderAction();
  }

  bindThis() {
    super.bindThis();

    this.bindPointRenderEvent = this.bindPointRenderEvent.bind(this);
    this.bindSceneEvent = this.bindSceneEvent.bind(this);
    this.bindLineRenderEvent = this.bindLineRenderEvent.bind(this);
    this.bindMidPointRenderEvent = this.bindMidPointRenderEvent.bind(this);
    this.bindPolygonRenderEvent = this.bindPolygonRenderEvent.bind(this);
  }
}
