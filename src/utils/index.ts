import { v4 } from 'uuid';
import { IBaseFeature } from '../typings';

export const getUuid = (prefix = '') => {
  return `${prefix}-${v4()}`;
};

export const isSameFeature = (
  feature1?: IBaseFeature | null,
  feature2?: IBaseFeature | null,
) => {
  return !!(
    feature1 &&
    feature2 &&
    feature1.properties?.id === feature2.properties?.id
  );
};

export * from './cursor';
