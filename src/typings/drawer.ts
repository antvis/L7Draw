import { Feature } from '@turf/turf';
import { HistoryConfig } from './source';
import { IStyle } from './style';

/**
 * 鼠标指针类型
 */
export type ICursorType =
  | 'draw'
  | 'pointHover'
  | 'pointDrag'
  | 'lineHover'
  | 'lineDrag'
  | 'polygonHover'
  | 'polygonDrag';

/**
 * 鼠标指针类型键值对
 */
export type ICursor = Record<ICursorType, string>;

export type KeyBoardConfig = Partial<{
  remove: string[] | false;
  revert: string[] | false;
  redo: string[] | false;
}>;

/**
 * 基础Drawer配置
 */
export interface IBaseModeOptions<F extends Feature = Feature> {
  style: IStyle;
  cursor: ICursor;
  initData?: F[];
  editable: boolean;
  autoFocus: boolean;
  multiple: boolean;
  history: HistoryConfig | false;
  keyboard: KeyBoardConfig | false;
}

/**
 * 距离文案配置
 */
export interface IDistanceOptions {
  total: boolean;
  showOnDash: boolean;
  showOnNormal: boolean;
  showOnActive: boolean;
  format: (meters: number) => string;
}

/**
 * 面积文案配置
 */
export interface IAreaOptions {
  format: (squareMeters: number) => string;
  showOnNormal: boolean;
  showOnActive: boolean;
}
