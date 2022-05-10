import tippy, { Instance, followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { Scene } from '@antv/l7';
import { getMapDom } from '../utils';
import { IPopupConfig } from '../typings';

export class Popup {
  container: Element;
  instance: Instance;
  text: string | null = null;

  constructor(scene: Scene, options: IPopupConfig = {}) {
    const container = getMapDom(scene)!;
    this.instance = tippy(container, {
      placement: 'bottom-start',
      followCursor: true,
      hideOnClick: false,
      arrow: false,
      trigger: 'manual',
      offset: [10, 10],
      plugins: [followCursor],
      ...options,
    });
    this.instance.hide();
    this.container = container;

    this.container.addEventListener('mouseenter', this.onMouseEnter);
    this.container.addEventListener('mouseleave', this.onMouseLeave);
  }

  onMouseEnter = (e: Event) => {
    if (this.text) {
      this.setText(this.text);
    }
  };

  onMouseLeave = (e: Event) => {
    if (this.text) {
      this.hide();
    }
  };

  show() {
    this.instance.show();
  }

  hide() {
    this.instance.hide();
  }

  setText(text: string | null) {
    this.text = text;
    this.instance.setContent(text ?? '');
    if (text) {
      this.show();
    } else {
      this.hide();
    }
  }

  destory() {
    this.instance.destroy();
    this.container.removeEventListener('mouseenter', this.onMouseEnter);
    this.container.removeEventListener('mouseleave', this.onMouseLeave);
  }
}
