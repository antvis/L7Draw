// import { Feature, LineString, Point, Polygon } from '@turf/turf';
// import EventEmitter from 'eventemitter3';
// import { SourceEvent } from '../constants';
// import { IStyle, IStyleType } from '../typings';
//
// export interface ISourceData {
//   point: Feature<Point>[];
//   line: Feature<LineString>[];
//   polygon: Feature<Polygon>[];
// }
//
// export interface ISourceOptions {
//   data: ISourceData;
//   style: IStyle;
// }
//
// export class Source extends EventEmitter<SourceEvent> {
//   data: ISourceData = {
//     point: [],
//     line: [],
//     polygon: [],
//   };
//
//   constructor(options?: Partial<ISourceOptions>) {
//     super();
//   }
//
//   setData<T extends IStyleType>(data: Record<T, ISourceData[T]>) {}
// }
export * from './BaseSource';
