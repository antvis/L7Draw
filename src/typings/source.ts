import { IBaseFeature } from './feature';
import { IBaseStyle } from './render';

export interface ISourceOptions<T extends IBaseFeature, S extends IBaseStyle> {
  data?: T[];
  style: S;
}
