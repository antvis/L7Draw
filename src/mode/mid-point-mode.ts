import { Feature } from '@turf/turf';
import {
  FeatureUpdater,
  IBaseModeOptions,
  ILayerMouseEvent,
  ILineFeature,
  IMidPointFeature,
  IPointFeature,
} from '../typings';
import { PointMode } from './point-mode';
import { MidPointRender } from '../render';
import { center, featureCollection } from '@turf/turf';
import { getUuid } from '../utils';
import { RenderEvent } from '../constant';

export interface IMidPointModeOptions<F extends Feature = Feature>
  extends IBaseModeOptions<F> {
  showMidPoint: boolean;
}

export abstract class MidPointMode<
  T extends IMidPointModeOptions,
> extends PointMode<T> {
  /**
   * 获取midPoint类型对应的render
   * @protected
   */
  protected get midPointRender(): MidPointRender | undefined {
    return this.render.midPoint;
  }

  bindMidPointRenderEvent() {
    this.midPointRender?.on(RenderEvent.click, this.onMidPointClick.bind(this));
    this.midPointRender?.on(
      RenderEvent.mousemove,
      this.onMidPointHover.bind(this),
    );
    this.midPointRender?.on(
      RenderEvent.mouseout,
      this.onMidPointUnHover.bind(this),
    );
  }

  /**
   * 获取中点数据
   */
  getMidPointData() {
    return this.source.getRenderData<IMidPointFeature>('midPoint');
  }

  /**
   * 设置中点数据
   * @param data
   */
  setMidPointData(data: FeatureUpdater<IMidPointFeature>) {
    return this.source.setRenderData('midPoint', data);
  }

  /**
   * 计算并返回传入线段的中点数组
   * @param line
   */
  getMidPointsByLine(line: ILineFeature): IMidPointFeature[] {
    const nodes = line.properties.nodes;
    if (!this.options.showMidPoint || nodes.length < 2) {
      return [];
    }
    const midPoints: IMidPointFeature[] = [];
    for (let index = 0; index < nodes.length - 1; index++) {
      const newMidPoint = center(
        featureCollection([nodes[index], nodes[index + 1]]),
        {
          properties: {
            id: getUuid('midPoint'),
            startId: nodes[index].properties?.id ?? '',
            endId: nodes[index + 1].properties?.id ?? '',
          },
        },
      ) as IMidPointFeature;
      midPoints.push(newMidPoint);
    }
    return midPoints;
  }

  abstract onMidPointClick(
    e: ILayerMouseEvent<IMidPointFeature>,
  ): IPointFeature | undefined;

  onMidPointHover(e: ILayerMouseEvent<IMidPointFeature>) {
    this.setCursor('pointHover');
  }

  onMidPointUnHover(e: ILayerMouseEvent<IMidPointFeature>) {
    this.setCursor('draw');
  }

  enableMidPointRenderAction() {
    this.midPointRender?.enableClick();
    this.midPointRender?.enableHover();
  }

  disableMidPointRenderAction() {
    this.midPointRender?.disableClick();
    this.midPointRender?.disableHover();
  }
}
