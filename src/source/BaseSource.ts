import EventEmitter from 'eventemitter3';
import { SourceEvent } from '../constants';
import { IBaseFeature, IBaseStyle, ISourceOptions } from '../typings';

export abstract class BaseSource<
  T extends IBaseFeature,
  S extends IBaseStyle,
> extends EventEmitter<SourceEvent> {
  data: T[];
  style: S;

  constructor({ data, style }: ISourceOptions<T, S>) {
    super();
    this.data = data ?? [];
    this.style = style;
  }

  abstract setData(data: T[]): T[];
}
