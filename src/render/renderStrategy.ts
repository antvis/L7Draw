import { ILayer } from '@antv/l7';
import { FeatureCollection } from '@turf/helpers';

export interface IRenderStrategy {
  styleVariant: string;

  execute: (fe: FeatureCollection, styles: any) => ILayer[];
}

export class Singleton {
  private static instance: Singleton;

  public static getInstance<T>(): T {
    if (!this.instance) this.instance = new this();
    return this.instance as T;
  }
}
