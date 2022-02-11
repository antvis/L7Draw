import { point } from '@turf/turf';
import { IDrawerOptions, IPointFeature, ISceneMouseEvent } from '../typings';
import { BaseDrawer } from './BaseDrawer';
import { getUuid } from '../utils';
import { DrawerEvent } from '../constants';

export interface IPointDrawerOptions extends IDrawerOptions {}

export class PointDrawer extends BaseDrawer<IPointDrawerOptions> {
  getDefaultOptions(): IPointDrawerOptions {
    return {
      ...this.getCommonOptions(),
    };
  }

  onClick(e: ISceneMouseEvent) {
    const { lng, lat } = e.lnglat;
    const newPoint: IPointFeature = point([lng, lat], {
      id: getUuid('point'),
      isActive: true,
    });
    this.source.setData({
      point: [
        ...this.source.data.point.map((feature) => {
          feature.properties.isActive = false;
          return feature;
        }),
        newPoint,
      ],
    });
    this.emit(DrawerEvent.add, newPoint, this.getData());
  }

  getData() {
    return this.source.data.point;
  }
}
