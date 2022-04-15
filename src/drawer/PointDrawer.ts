import { IDrawerOptions } from '../typings';
import { NodeDrawer } from './NodeDrawer';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends NodeDrawer<IPointDrawerOptions> {
  getDefaultOptions(): IPointDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  bindEvent(): void {
    this.pointRender?.enableCreate();
    this.pointRender?.enableHover();
    this.pointRender?.enableDrag();
  }

  unbindEvent(): void {
    this.pointRender?.disableCreate();
    this.pointRender?.disableHover();
    this.pointRender?.disableDrag();
  }
}
