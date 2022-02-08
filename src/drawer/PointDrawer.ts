import { IDrawerOptions, ISceneMouseEvent } from '../typings';
import { BaseDrawer } from './BaseDrawer';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends BaseDrawer<IPointDrawerOptions> {
  getDefaultOptions(): IPointDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  onClick(e: ISceneMouseEvent) {
    const { lng, lat } = e.lnglat;
  }
}
