import { ILineDrawerOptions, LineDrawer } from './LineDrawer';
import {
  IDashLineFeature,
  ILayerMouseEvent,
  IPointFeature,
  IPolygonFeature,
  IRenderType,
  ISceneMouseEvent,
  ISourceData,
} from '../typings';
import {
  createPolygon,
  debounceMoveFn,
  getUuid,
  isSameFeature,
  syncPolygonNodes,
} from '../utils';
import { first, last } from 'lodash';
import { coordAll, featureCollection, lineString } from '@turf/turf';
import { DrawerEvent } from '../constants';

export interface IPolygonDrawerOptions extends ILineDrawerOptions {}

export class PolygonDrawer extends LineDrawer<IPolygonDrawerOptions> {
  get editPolygon() {
    return this.source.data.polygon.find((feature) => {
      const { isActive, isDraw } = feature.properties;
      return isActive && !isDraw;
    });
  }

  get dragPolygon() {
    return this.source.data.polygon.find((feature) => {
      return feature.properties.isDrag;
    });
  }

  get drawPolygon() {
    return (
      this.source.data.polygon.find((feature) => feature.properties.isDraw) ??
      null
    );
  }

  get polygonRender() {
    return this.render.polygon;
  }

  getPolygonData() {
    return this.getTypeData<IPolygonFeature>('polygon');
  }

  setPolygonData(
    updater:
      | IPolygonFeature[]
      | ((features: IPolygonFeature[]) => IPolygonFeature[]),
    store = true,
  ) {
    return this.setTypeData<IPolygonFeature>('polygon', updater, store);
  }

  getRenderList(): IRenderType[] {
    return ['polygon', 'line', 'dashLine', 'midPoint', 'point'];
  }

  onPointUnClick(e: ILayerMouseEvent<IPointFeature>) {
    if (
      this.editPolygon ||
      (this.scene.getPickedLayer() !== -1 && !this.drawPolygon)
    ) {
      return;
    }
    super.onPointUnClick(e);
    const feature = e.feature!;
    let newSourceData: Partial<ISourceData> = {};
    const drawPolygon = this.drawPolygon;
    if (drawPolygon) {
      drawPolygon.properties.nodes.push(feature);
      syncPolygonNodes(drawPolygon);
      newSourceData = {
        polygon: this.getPolygonData().map((feature) => {
          if (isSameFeature(feature, drawPolygon)) {
            return drawPolygon;
          }
          return feature;
        }),
      };
    } else {
      const newPolygon = createPolygon(feature.geometry.coordinates, {
        id: getUuid('polygon'),
        nodes: [feature],
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
    if (!editPolygon || !this.editLine) {
      return;
    }
    super.onPointDragging(e);
    editPolygon.properties.nodes = this.editLine.properties.nodes;
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
      const drawLine = this.drawLine!;
      if (isFirstNode || isLastNode) {
        const firstPoint = first(this.drawPolygon.properties.nodes)!;
        drawLine.properties.nodes.push(firstPoint);
        drawLine.geometry.coordinates.push(firstPoint.geometry.coordinates);
        this.drawFinish();
      } else if (this.options.allowOverlap) {
        this.onPointUnClick(e);
      }
    }
  }

  setEditPolygon(editPolygon: IPolygonFeature | null) {
    this.setEditLine(editPolygon?.properties.line ?? null);
    if (editPolygon) {
      this.printEditPolygon(editPolygon);
      this.bindEditEvent();
    } else {
      this.setPolygonData((features) =>
        features.map((feature) => {
          feature.properties = {
            ...feature.properties,
            isDrag: false,
            isDraw: false,
            isActive: false,
            isHover: false,
          };
          return feature;
        }),
      );
      this.setEditLine(null);
    }
  }

  printEditPolygon(editPolygon: IPolygonFeature) {
    const otherPolygon = this.getPolygonData()
      .filter((feature) => !isSameFeature(feature, editPolygon))
      .map((feature) => {
        feature.properties.isActive = false;
        return feature;
      });
    Object.assign(editPolygon.properties, {
      isDraw: false,
      isActive: true,
      isHover: false,
    });
    this.setPolygonData([...otherPolygon, editPolygon]);
    this.setEditLine(editPolygon.properties.line);
  }

  drawFinish() {
    const drawPolygon = this.drawPolygon;
    if (drawPolygon) {
      const { editable, autoFocus } = this.options;
      const isActive = editable && autoFocus;
      this.setEditPolygon(isActive ? drawPolygon : null);
      this.emit(DrawerEvent.add, drawPolygon, this.getPolygonData());
      this.emit(DrawerEvent.change, this.getPolygonData());
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
      const { lng, lat } = e.lnglat;
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
    });
  }

  bindThis() {
    super.bindThis();
    this.onSceneMouseMove = debounceMoveFn(this.onSceneMouseMove).bind(this);
    this.onPointClick = this.onPointClick.bind(this);
    this.onPointUnClick = this.onPointUnClick.bind(this);
  }
}
