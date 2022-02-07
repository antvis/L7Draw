import { DeepPartial } from '../typings';

interface IDrawerOptions {
  style: {};
  size: number;
}

export default abstract class BaseDrawer {
  constructor(options: DeepPartial<IDrawerOptions>) {}
}
