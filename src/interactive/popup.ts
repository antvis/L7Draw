import Tippy, { Instance as TippyInstance } from 'tippy.js';
import { Scene } from '@antv/l7';
import { getMapDom } from '../utils';
import { PopupOptions } from '../typings';
import 'tippy.js/dist/tippy.css';
import { DEFAULT_POPUP_CONFIG } from '../constant';

export class Popup {
  content: string | null;

  tippy: TippyInstance;

  constructor(scene: Scene, tippyProps: PopupOptions) {
    this.tippy = Tippy(getMapDom(scene)!, {
      ...DEFAULT_POPUP_CONFIG,
      ...tippyProps,
    });
  }

  get isShow() {
    return this.tippy.state.isShown;
  }
}
