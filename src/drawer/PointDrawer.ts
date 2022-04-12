import { BaseDrawer } from './BaseDrawer';
import {
  DeepPartial,
  IDrawerOptions,
  IPointFeature,
  IRenderType,
} from '../typings';
import { DrawerEvent, RenderEvent } from '../constants';
import { Scene } from '_@antv_l7@2.8.8@@antv/l7';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends BaseDrawer<
  IPointDrawerOptions,
  IPointFeature
> {
  constructor(scene: Scene, options?: DeepPartial<IPointDrawerOptions>) {
    super(scene, options);

    this.pointRender?.on(RenderEvent.add, this.onCreate);
  }

  get pointRender() {
    return this.render.point;
  }

  getDefaultOptions(): IPointDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  getRenderList(): IRenderType[] {
    return ['point'];
  }

  setData(
    updater: IPointFeature[] | ((_: IPointFeature[]) => IPointFeature[]),
    store: boolean | undefined,
  ): void {
    const point =
      typeof updater === 'function' ? updater(this.getData()) : updater;
    this.source.setData(
      {
        point,
      },
      store,
    );
  }

  getData(): IPointFeature[] {
    return this.source.data.point;
  }

  onCreate = (pointFeature: IPointFeature) => {
    pointFeature.properties.isHover = pointFeature.properties.isActive = this.options.autoFocus;
    this.setData(
      data => [
        ...data.map(feature => {
          feature.properties.isActive = feature.properties.isHover = feature.properties.isDrag = false;
          return feature;
        }),
        pointFeature,
      ],
      true,
    );
    this.emit(DrawerEvent.add, pointFeature, this.getData());
  };

  bindEvent(): void {
    this.pointRender?.enableCreate();
    this.pointRender?.enableHover();
  }

  unbindEvent(): void {
    this.pointRender?.disableCreate();
    this.pointRender?.disableHover();
  }
}
