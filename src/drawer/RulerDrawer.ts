import { LineDrawer } from './LineDrawer';
import { ILineFeature, IMidPointFeature } from '../typings';

export class RulerDrawer extends LineDrawer {
  getMidPointList(lineFeature: ILineFeature): IMidPointFeature[] {
    return [];
  }

  bindThis() {
    super.bindThis();
    this.getMidPointList = this.getMidPointList.bind(this);
  }
}
