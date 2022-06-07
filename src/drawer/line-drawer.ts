import {
  DeepPartial,
  IBaseModeOptions,
  ILayerMouseEvent,
  ILineFeature,
  IPointFeature,
  IRenderType,
  ISceneMouseEvent,
  SourceData,
} from '../typings';
import { Feature, LineString, Point } from '@turf/turf';
import { Scene } from '@antv/l7';
import { RenderEvent } from '../constant';
import { ILineModeOptions, LineMode } from '../mode';
import {
  createDashLine,
  getLngLat,
  getUuid,
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
  initData(lines: Feature<LineString>[]): Partial<SourceData> | undefined {
    return {};
  }

  getData(): ILineFeature[] {
    return this.getLineData();
  }

  setData(data: ILineFeature[]): ILineFeature[] {
    return this.setLineData(data);
  }

  getDefaultOptions(
    options: DeepPartial<ILineDrawerOptions>,
  ): ILineDrawerOptions {
    return {
      ...this.getCommonOptions(),
      showMidPoint: true,
      distanceText: false,
    };
  }

  getRenderTypes(): IRenderType[] {
    return ['line', 'dashLine', 'point', 'midPoint'];
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
