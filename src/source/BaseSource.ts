// import EventEmitter from 'eventemitter3';
// import { SourceEvent } from '../constants';
// import { IBaseFeature, IBaseStyle, ISourceOptions } from '../typings';
//
// export abstract class BaseSource<
//   T extends IBaseFeature,
//   S extends IBaseStyle,
// > extends EventEmitter<SourceEvent> {
//   protected data: T[] = [];
//   protected style: S;
//
//   constructor({ data, style }: ISourceOptions<T, S>) {
//     super();
//     this.style = style;
//     this.setData(data ?? []);
//   }
//
//   abstract setData(data: T[]): T[];
// }
