import { Scene } from '@antv/l7';
import { coordAll, Feature, LineString } from '@turf/turf';
import { last } from 'lodash-es';
import { DrawEvent, RenderEvent } from '../constant';
import { ILineModeOptions, LineMode } from '../mode';
import {
  DeepPartial,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
} from '../typings';
import {
  createDashLine,
  createPointFeature,
  getDefaultLineProperties,
  getPosition,
  isSameFeature,
} from '../utils';

export type ILineDrawerOptions = ILineModeOptions<Feature<LineString>>;

export class LineDrawer extends LineMode<ILineDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<ILineDrawerOptions>) {
    super(scene, options);

    this.sceneRender.on(RenderEvent.DblClick, this.drawLineFinish);
    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
  }

  protected get dragItem() {
    return this.dragLine;
  }

  protected get editItem() {
    return this.editLine;
  }

  setData(lines: Feature<LineString>[]) {
    const lineFeatures = lines.map((line) => {
      line.properties = {
        ...getDefaultLineProperties(),
        ...(line.properties ?? {}),
      };
      if (!line.properties.nodes?.length) {
        line.properties.nodes = coordAll(line).map((position) => {
          return createPointFeature(position);
        });
      }
      return line as ILineFeature;
    });
    this.source.setData({
      point: [],
      midPoint: [],
      dashLine: [],
      line: lineFeatures,
    });
    this.setTextData(this.getAllTexts());

    if (this.editLine) {
      this.setActiveLine(this.editLine);
    }
  }

  getData(): ILineFeature[] {
    return this.getLineData();
  }

  getRenderTypes(): IRenderType[] {
    return ['line', 'dashLine', 'midPoint', 'point', 'text'];
  }

  bindPointRenderEvent() {
    super.bindPointRenderEvent();
    this.pointRender?.on(
      RenderEvent.Contextmenu,
      this.onPointContextMenu.bind(this),
    );
  }

  drawLineFinish = () => {
    const drawLine = this.drawLine;
    const nodes = drawLine?.properties.nodes ?? [];
    if (!drawLine || nodes?.length <= 1) {
      return;
    }
    this.setActiveLine(drawLine);
    const { autoActive, editable } = this.options;
    if (!autoActive || !editable) {
      this.handleLineUnClick(drawLine);
    }
    if (editable && autoActive) {
      this.setHelper('pointHover');
    } else {
      this.setHelper(this.addable ? 'draw' : null);
    }
    this.emit(DrawEvent.Add, drawLine, this.getLineData());
  };

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {
    const drawLine = this.drawLine;
    const nodes = drawLine?.properties.nodes ?? [];
    const feature = e.feature!;
    if (isSameFeature(feature, last(nodes))) {
      requestAnimationFrame(() => {
        this.drawLineFinish();
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

  removeNode(node: Feature | string, feature: Feature | string) {
    const targetFeature = this.getTargetFeature(feature) as
      | ILineFeature
      | undefined;
    const targetNode = this.getTargetFeature(
      node,
      targetFeature?.properties.nodes ?? [],
    );
    if (targetFeature && targetNode) {
      const nodes = targetFeature?.properties.nodes ?? [];
      if (nodes.length < 3) {
        return;
      }
      this.syncLineNodes(
        targetFeature,
        nodes.filter((node) => !isSameFeature(targetNode, node)),
      );
      this.emit(
        DrawEvent.RemoveNode,
        targetNode,
        targetFeature,
        this.getLineData(),
      );
      this.emit(DrawEvent.Edit, targetFeature, this.getLineData());
    }
  }

  onPointContextMenu(e: ILayerMouseEvent<IPointFeature>) {
    const editLine = this.editLine;
    const deleteNode = e.feature!;
    const nodes = editLine?.properties.nodes ?? [];
    if (!editLine || nodes.length < 3) {
      return;
    }
    this.removeNode(deleteNode, editLine);
    return deleteNode;
  }

  onPointCreate(e: ILayerMouseEvent) {
    if (!this.addable) {
      return;
    }
    const feature = super.onPointCreate(e);
    if (feature) {
      this.setHelper('drawFinish');
      this.emit(DrawEvent.AddNode, feature, this.drawLine, this.getLineData());
    }
    return feature;
  }

  onPointDragEnd(e: ISceneMouseEvent): IPointFeature | undefined {
    const editLine = this.editLine;
    const feature = super.onPointDragEnd(e);
    if (editLine && feature) {
      this.emit(DrawEvent.Edit, editLine, this.getLineData());
    }
    return feature;
  }

  onLineDragStart(e: ILayerMouseEvent<ILineFeature>) {
    const feature = super.onLineDragStart(e);
    if (feature) {
      this.emit(DrawEvent.DragStart, feature, this.getLineData());
    }
    return feature;
  }

  onLineDragging(e: ISceneMouseEvent) {
    const feature = super.onLineDragging(e);
    if (feature) {
      this.emit(DrawEvent.Dragging, feature, this.getLineData());
    }
    return feature;
  }

  onLineDragEnd(e: ISceneMouseEvent): ILineFeature | undefined {
    const feature = super.onLineDragEnd(e);
    if (feature) {
      this.emit(DrawEvent.DragEnd, feature, this.getLineData());
      this.emit(DrawEvent.Edit, feature, this.getLineData());
    }
    return feature;
  }

  onMidPointClick(
    e: ILayerMouseEvent<IMidPointFeature>,
  ): IPointFeature | undefined {
    const editLine = this.editLine;
    const feature = super.onMidPointClick(e);
    if (editLine && feature) {
      this.emit(DrawEvent.Edit, editLine, this.getLineData());
      this.emit(DrawEvent.AddNode, feature, editLine, this.getLineData());
    }
    return feature;
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    const drawLine = this.drawLine;
    if (!drawLine) {
      return;
    }
    const lastNode = last(drawLine.properties.nodes)!;
    let mousePosition = getPosition(e);
    if (this.options.adsorbOptions) {
      mousePosition = this.getAdsorbPosition(mousePosition) ?? mousePosition;
    }
    this.setDashLineData([
      createDashLine([mousePosition, lastNode.geometry.coordinates]),
    ]);
    this.setTextData(this.getAllTexts());
  }

  setActiveFeature(target: Feature | string | null | undefined) {
    const targetFeature = this.getTargetFeature(target);
    if (targetFeature) {
      this.setActiveLine(targetFeature as ILineFeature);
    } else {
      this.clearActiveLine();
    }
  }

  resetFeatures() {
    let features = this.getLineData();
    if (this.drawLine) {
      features = features.filter((feature) => !feature.properties.isDraw);
      this.source.setData({
        point: [],
        dashLine: [],
        midPoint: [],
      });
      this.setTextData((features) => {
        return features.filter((feature) => {
          return !feature.properties.isActive;
        });
      });
    }
    if (this.editLine) {
      this.handleLineUnClick(this.editLine);
    }
    this.setLineData(
      features.map((feature) => {
        feature.properties = {
          ...feature.properties,
          isDrag: false,
          isActive: false,
          isHover: false,
        };
        return feature;
      }),
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

  bindEnableEvent(): void {
    super.bindEnableEvent();
    this.enableSceneRenderAction();
    this.enablePointRenderAction();
    this.enableLineRenderAction();
    this.enableMidPointRenderAction();
    this.sceneRender.enableDblClick();
  }

  unbindEnableEvent(): void {
    super.unbindEnableEvent();
    this.disableSceneRenderAction();
    this.disablePointRenderAction();
    this.disableLineRenderAction();
    this.disableMidPointRenderAction();
    this.sceneRender.disableDblClick();
  }

  bindThis() {
    super.bindThis();
    this.bindPointRenderEvent = this.bindPointRenderEvent.bind(this);
    this.bindSceneEvent = this.bindSceneEvent.bind(this);
    this.bindLineRenderEvent = this.bindLineRenderEvent.bind(this);
    this.bindMidPointRenderEvent = this.bindMidPointRenderEvent.bind(this);
  }
}
