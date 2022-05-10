import { LineDrawer } from './LineDrawer';
import { ILineFeature, IMidPointFeature } from '../typings';
import { IBaseLineDrawerOptions } from './common/BaseLineDrawer';

export interface IRulerDrawerOptions extends IBaseLineDrawerOptions {}

export class RulerDrawer extends LineDrawer {}
