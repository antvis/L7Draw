import { Scene } from '@antv/l7';
import { coordAll, Feature, featureCollection, Polygon } from '@turf/turf';
import { first, last } from 'lodash-es';
import { DrawEvent, RenderEvent } from '../constant';
import { IPolygonModeOptions, PolygonMode } from '../mode';
import {
  DeepPartial,
  IDashLineFeature,
  ILayerMouseEvent,
  IMidPointFeature,
  IPointFeature,
  IPolygonFeature,
  ISceneMouseEvent,
} from '../typings';
import {
  createDashLine,
  createLineFeature,
  createPointFeature,
  getDefaultPolygonProperties,
  getPosition,
  isSameFeature,
} from '../utils';

export interface IPolygonDrawerOptions
  extends IPolygonModeOptions<Feature<Polygon>> {
  liveUpdate: boolean;
}

export class PolygonDrawer extends PolygonMode<IPolygonDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<IPolygonDrawerOptions>) {
    super(scene, options);

    this.sceneRender.on(RenderEvent.DblClick, this.drawPolygonFinish);
    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
    this.bindPolygonRenderEvent();
  }

  getDefaultOptions(
    options: DeepPartial<IPolygonDrawerOptions>,
  ): IPolygonDrawerOptions {
    return {
      ...super.getDefaultOptions(options),
      liveUpdate: false,
    };
  }

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
      this.setActivePolygon(this.editPolygon);
    }
  }

  onPointCreate(e: ILayerMouseEvent): IPointFeature | undefined {
    if (!this.addable || this.dragPoint) {
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
        const nodeLength = drawPolygon.properties.nodes.length;
        if (nodeLength > 1) {
          this.setHelper('drawFinish');
        }
      } else if (drawLine) {
        this.handleCreatePolygon([feature], drawLine);
        this.setHelper('drawContinue');
      }
      this.emit(DrawEvent.AddNode, feature, drawPolygon, this.getPolygonData());
    }
    return feature;
  }

  drawPolygonFinish = () => {
    const drawPolygon = this.drawPolygon;
    const nodes = drawPolygon?.properties.nodes ?? [];
    if (!drawPolygon || nodes.length < 3) {
      return;
    }
    drawPolygon.properties.isDraw = false;
    this.syncPolygonNodes(drawPolygon, nodes);
    this.setActivePolygon(drawPolygon);
    const { autoActive, editable } = this.options;
    if (!autoActive || !editable) {
      this.handlePolygonUnClick(drawPolygon);
    }
    if (editable) {
      this.setHelper(autoActive ? 'pointHover' : 'polygonHover');
    } else {
      this.setHelper(this.addable ? 'draw' : null);
    }
    this.emit(DrawEvent.Add, drawPolygon, this.getPolygonData());
  };

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
      requestAnimationFrame(() => {
        this.drawPolygonFinish();
      });
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
    const feature = this.dragPoint;
    const editPolygon = this.editPolygon;
    if (feature && editPolygon) {
      const { line } = editPolygon.properties;
      line.properties.nodes = line.properties.nodes.map((node) => {
        return isSameFeature(node, feature) ? feature : node;
      });
      const lineNodes = line.properties.nodes;
      const nodes = lineNodes.slice(0, lineNodes.length - 1);
      const firstLineNode = first(lineNodes)!;
      const lastLineNode = last(lineNodes)!;
      const isSame =
        isSameFeature(firstLineNode, feature) ||
        isSameFeature(lastLineNode, feature);
      if (isSame) {
        firstLineNode.geometry.coordinates = lastLineNode.geometry.coordinates =
          getPosition(e);
      }
      if (this.options.adsorbOptions && isSame) {
        const adsorbPosition = this.resetAdsorbLngLat(e);
        if (adsorbPosition) {
          firstLineNode.geometry.coordinates =
            lastLineNode.geometry.coordinates = adsorbPosition;
        }
      }
      super.onPointDragging(e);
      this.syncPolygonNodes(editPolygon, nodes);
      this.setActivePolygon(editPolygon);
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
      this.emit(DrawEvent.Dragging, dragPolygon, this.getPolygonData());
    }
    return feature;
  }

  onMidPointClick(
    e: ILayerMouseEvent<IMidPointFeature>,
  ): IPointFeature | undefined {
    const feature = super.onMidPointClick(e);
    const editPolygon = this.editPolygon;
    if (feature && editPolygon) {
      this.emit(DrawEvent.Edit, editPolygon, this.getPolygonData());
      this.emit(DrawEvent.AddNode, feature, editPolygon, this.getPolygonData());
    }
    return feature;
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    const drawPolygon = this.drawPolygon;
    const nodes = drawPolygon?.properties.nodes ?? [];
    if (!drawPolygon || !nodes.length) {
      return;
    }
    if (this.options.adsorbOptions) {
      this.resetAdsorbLngLat(e);
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
    if (this.options.liveUpdate && nodes.length >= 2) {
      const nodePositions = coordAll(featureCollection(nodes));
      drawPolygon.geometry.coordinates = [
        [...nodePositions, mousePosition, nodePositions[0]],
      ];
      this.setPolygonData(this.getPolygonData());
    }
    this.setDashLineData(dashLineData);
    this.setTextData(this.getAllTexts());
  }

  removeNode(node: Feature | string, feature: Feature | string) {
    const targetFeature = this.getTargetFeature(feature) as
      | IPolygonFeature
      | undefined;
    const targetNode = this.getTargetFeature(
      node,
      targetFeature?.properties.nodes ?? [],
    );
    if (targetFeature && targetNode) {
      const nodes = targetFeature?.properties.nodes ?? [];
      if (nodes.length < 4) {
        return;
      }
      this.syncPolygonNodes(
        targetFeature,
        nodes.filter((node) => !isSameFeature(targetNode, node)),
      );
      this.emit(
        DrawEvent.RemoveNode,
        targetNode,
        targetFeature,
        this.getLineData(),
      );
      this.emit(DrawEvent.Edit, targetFeature, this.getPolygonData());
    }
  }

  onPointContextMenu(e: ILayerMouseEvent<IPointFeature>) {
    const editPolygon = this.editPolygon;
    let deleteNode = e.feature!;
    const nodes = editPolygon?.properties.nodes ?? [];
    if (!editPolygon || nodes.length < 4) {
      return;
    }
    if (!nodes.find((node) => isSameFeature(node, deleteNode))) {
      deleteNode = nodes[0];
    }
    this.removeNode(deleteNode, editPolygon);
    return deleteNode;
  }

  bindPointRenderEvent() {
    super.bindPointRenderEvent();
    this.pointRender?.on(
      RenderEvent.Contextmenu,
      this.onPointContextMenu.bind(this),
    );
  }

  enablePointRenderAction() {
    super.enablePointRenderAction();
    if (this.options.editable) {
      this.pointRender?.enableContextMenu();
    }
  }

  disablePointRenderAction() {
    super.disablePointRenderAction();
    this.pointRender?.disableContextMenu();
  }
}
