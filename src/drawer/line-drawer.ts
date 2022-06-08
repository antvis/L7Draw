import {
  DeepPartial,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
  SourceData,
} from '../typings';
import { coordAll, Feature, LineString, Point } from '@turf/turf';
import { Scene } from '@antv/l7';
import { DrawerEvent, RenderEvent } from '../constant';
import { ILineModeOptions, LineMode } from '../mode';
import {
  createDashLine,
  createPointFeature,
  getDefaultLineProperties,
  getLngLat,
  isSameFeature,
  transLngLat2Position,
} from '../utils';
import { last } from 'lodash';

export interface ILineDrawerOptions extends ILineModeOptions<Feature<Point>> {}

export class LineDrawer extends LineMode<ILineDrawerOptions> {
  constructor(scene: Scene, options: DeepPartial<ILineDrawerOptions>) {
    super(scene, options);

    this.bindPointRenderEvent();
    this.bindSceneEvent();
    this.bindMidPointRenderEvent();
    this.bindLineRenderEvent();
    this.pointRender?.on(RenderEvent.click, this.onPointClick.bind(this));
  }

  // @ts-ignore
  initData(lines: Feature<LineString>[]): Partial<SourceData> {
    const lineFeatures = lines.map((line) => {
      line.properties = {
        ...getDefaultLineProperties(),
        ...(line.properties ?? {}),
      };
      if (!line.properties.nodes?.length) {
        line.properties.nodes = coordAll(line).map((position) => {
          console.log(position);
          return createPointFeature(position);
        });
      }
      return line as ILineFeature;
    });
    const editLine = lineFeatures.find(
      (feature) => feature.properties.isActive,
    );
    if (editLine) {
      setTimeout(() => {
        this.setEditLine(editLine);
      }, 0);
    }
    return {
      line: lineFeatures,
      text: this.getAllDistanceTexts(),
    };
  }

  getData(): ILineFeature[] {
    return this.getLineData();
  }

  setData(data: Feature<LineString>[]) {
    this.source.setData(this.initData(data) ?? {});
    return this.getLineData();
  }

  getRenderTypes(): IRenderType[] {
    return ['line', 'dashLine', 'midPoint', 'point', 'text'];
  }

  onPointClick(e: ILayerMouseEvent<IPointFeature>) {
    const drawLine = this.drawLine;
    const nodes = drawLine?.properties.nodes ?? [];
    if (!drawLine || nodes.length <= 1) {
      return;
    }
    const feature = e.feature!;
    if (isSameFeature(feature, last(nodes))) {
      setTimeout(() => {
        this.setEditLine(drawLine);
        const { autoFocus, editable } = this.options;
        if (!autoFocus || !editable) {
          this.handleLineUnClick(drawLine);
        }
        this.emit(DrawerEvent.add, drawLine, this.getLineData());
        this.emit(DrawerEvent.change, this.getLineData());
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

  onPointCreate(e: ILayerMouseEvent) {
    if (
      !this.options.multiple &&
      !this.drawLine &&
      this.getLineData().length >= 1
    ) {
      return;
    }
    return super.onPointCreate(e);
  }

  onPointDragEnd(e: ISceneMouseEvent): IPointFeature | undefined {
    const editLine = this.editLine;
    const feature = super.onPointDragEnd(e);
    if (editLine && feature) {
      this.emit(DrawerEvent.edit, editLine, this.getLineData());
      this.emit(DrawerEvent.change, this.getLineData());
    }
    return feature;
  }

  onLineDragStart(e: ILayerMouseEvent<ILineFeature>) {
    const feature = super.onLineDragStart(e);
    if (feature) {
      this.emit(DrawerEvent.dragStart, feature, this.getLineData());
    }
    return feature;
  }

  onLineDragging(e: ISceneMouseEvent) {
    const feature = super.onLineDragging(e);
    if (feature) {
      this.emit(DrawerEvent.dragging, feature, this.getLineData());
    }
    return feature;
  }

  onLineDragEnd(e: ISceneMouseEvent): ILineFeature | undefined {
    const feature = super.onLineDragEnd(e);
    if (feature) {
      this.emit(DrawerEvent.dragEnd, feature, this.getLineData());
      this.emit(DrawerEvent.edit, feature, this.getLineData());
      this.emit(DrawerEvent.change, this.getLineData());
    }
    return feature;
  }

  onMidPointClick(
    e: ILayerMouseEvent<IMidPointFeature>,
  ): IPointFeature | undefined {
    const editLine = this.editLine;
    const feature = super.onMidPointClick(e);
    if (editLine && feature) {
      this.emit(DrawerEvent.edit, editLine, this.getLineData());
      this.emit(DrawerEvent.change, this.getLineData());
    }
    return feature;
  }

  onSceneMouseMove(e: ISceneMouseEvent) {
    const drawLine = this.drawLine;
    if (!drawLine) {
      return;
    }
    const lastNode = last(drawLine.properties.nodes)!;
    this.setDashLineData([
      createDashLine([
        transLngLat2Position(getLngLat(e)),
        lastNode.geometry.coordinates,
      ]),
    ]);
    this.setTextData(this.getAllDistanceTexts());
  }

  bindEnableEvent(): void {
    this.enablePointRenderAction();
    this.enableLineRenderAction();
    this.enableMidPointRenderAction();
  }

  unbindEnableEvent(): void {
    this.disablePointRenderAction();
    this.disableLineRenderAction();
    this.disableMidPointRenderAction();
  }

  bindThis() {
    super.bindThis();
    this.bindPointRenderEvent = this.bindPointRenderEvent.bind(this);
    this.bindSceneEvent = this.bindSceneEvent.bind(this);
    this.bindLineRenderEvent = this.bindLineRenderEvent.bind(this);
    this.bindMidPointRenderEvent = this.bindMidPointRenderEvent.bind(this);
  }
}
