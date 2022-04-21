import { IDrawerOptions } from '../typings';
import { NodeDrawer } from './NodeDrawer';
import { DEFAULT_POINT_STYLE } from '../constants';
import { cloneDeep } from 'lodash';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends NodeDrawer<IPointDrawerOptions> {
  getDefaultOptions(): IPointDrawerOptions {
    const options: IPointDrawerOptions = this.getCommonOptions();
    options.style.point = cloneDeep(DEFAULT_POINT_STYLE);
    return options;
  }

  disable() {
    super.disable();
    this.setPointData((features) =>
      features.map((feature) => {
        feature.properties.isActive =
          feature.properties.isHover =
          feature.properties.isDrag =
            false;
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
