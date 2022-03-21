import {
  IDrawerOptions,
  ILayerMouseEvent,
  ILineFeature,
  IRenderType,
} from '../typings';
import { BaseDrawer } from './common/BaseDrawer';

export interface ILineDrawerOptions extends IDrawerOptions {}

export class LineDrawer extends BaseDrawer<ILineDrawerOptions, ILineFeature> {

  getData(): ILineFeature[] {
    return [];
  }

  getDefaultOptions(): ILineDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  getRenderList(): IRenderType[] {
    return ['line', 'point', 'midPoint'];
  }

  onUnClick(e: ILayerMouseEvent) {
    console.log(e);
  }

  bindEvent() {
    // this.lineLayer?.on('unclick', this.onUnClick);
  }

  unbindEvent() {
    // this.lineLayer?.off('unclick', this.onUnClick);
  }

  bindThis() {
    super.bindThis();
    this.onUnClick = this.onUnClick.bind(this);
  }

  setData(
    updater: ILineFeature[] | ((_: ILineFeature[]) => ILineFeature[]),
    store = false,
  ) {}
}
