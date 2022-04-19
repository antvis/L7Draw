import { IDrawerOptions } from '../typings';
import { NodeDrawer } from './NodeDrawer';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends NodeDrawer<IPointDrawerOptions> {
  getDefaultOptions(): IPointDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  disable() {
    super.disable();
    this.setPointData(features =>
      features.map(feature => {
        feature.properties.isActive = feature.properties.isHover = feature.properties.isDrag = false;
        return feature;
      }),
    );
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
