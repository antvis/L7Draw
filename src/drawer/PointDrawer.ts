import { IDrawerOptions } from '../typings';
import { BasePointDrawer } from './BasePointDrawer';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends BasePointDrawer<IPointDrawerOptions> {
  getDefaultOptions(): IPointDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  bindEvent(): void {
    this.pointRender?.enableCreate();
    this.pointRender?.enableHover();
    this.pointRender?.enableEdit();
  }

  unbindEvent(): void {
    this.pointRender?.disableCreate();
    this.pointRender?.disableHover();
    this.pointRender?.disableEdit();
  }
}
