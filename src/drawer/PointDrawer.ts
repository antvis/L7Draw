import { INodeDrawerOptions, NodeDrawer } from './NodeDrawer';

export interface IPointDrawerOptions extends INodeDrawerOptions {}

export class PointDrawer extends NodeDrawer<IPointDrawerOptions> {}
