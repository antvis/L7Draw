import Tippy, { Instance as TippyInstance } from 'tippy.js';
import { Scene } from '@antv/l7';
import { getMapDom } from '../utils';
import { PopupOptions } from '../typings';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import { DEFAULT_POPUP_CONFIG, SceneEvent } from '../constant';
import { debounce } from 'lodash';

export class Popup {
  protected content = '';

  protected tippy: TippyInstance;

  protected scene: Scene;

  protected isMouseInner = false;

  constructor(scene: Scene, tippyProps: PopupOptions) {
    this.tippy = Tippy(getMapDom(scene)!, {
      ...DEFAULT_POPUP_CONFIG,
      ...tippyProps,
    });
    this.tippy.hide();
    this.scene = scene;
    scene.on(SceneEvent.Mousemove, this.onMouseMove);
    scene.on(SceneEvent.Mouseout, this.onMouseOut);
  }

  onMouseMove = debounce(
    () => {
      this.isMouseInner = true;
      this.checkTippyShow();
    },
    16,
    {
      maxWait: 16,
    },
  );

  onMouseOut = debounce(
    () => {
      this.isMouseInner = false;
      this.checkTippyShow();
    },
    16,
    {
      maxWait: 16,
    },
  );

  getContent() {
    return this.content;
  }

  setContent(content: string | null) {
    this.content = content ?? '';
    this.tippy.setContent(content ?? '');
    this.checkTippyShow();
  }

  checkTippyShow() {
    if (this.content && this.isMouseInner) {
      this.tippy.show();
    } else {
      this.tippy.hide();
    }
  }

  destroy() {
    this.scene.off(SceneEvent.Mousemove, this.onMouseMove);
    this.scene.off(SceneEvent.Mouseout, this.onMouseOut);
    this.tippy.destroy();
  }
}
