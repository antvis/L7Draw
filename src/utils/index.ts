import { v4 } from 'uuid';

export const getUuid = (prefix = '') => {
  return `${prefix}-${v4()}`;
};
