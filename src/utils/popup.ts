import tippy, { Instance } from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { Scene } from '@antv/l7';
import { ISceneMouseEvent } from '../typings';

export class Popup {
  scene: Scene;

  instance: Instance;

  constructor(scene: Scene) {
    const container = scene.getContainer()!;
    this.scene = scene;
    this.instance = tippy(container, {
      placement: 'top',
    });
    this.instance.hide();
    scene.on('mousemove', this.onMouseMove);
  }

  onMouseMove = (e: ISceneMouseEvent) => {
    const { x, y } = e.pixel;
    this.setOffset([x, y]);
  };

  show() {
    this.instance.show();
  }

  hide() {
    this.instance.hide();
  }

  setText(text: string | null, offset?: [number, number]) {
    this.instance.setContent(text ?? '');
    if (offset) {
      this.setOffset(offset);
    }
    if (text) {
      this.show();
    } else {
      this.hide();
    }
  }

  setOffset(offset: [number, number]) {
    this.instance.setProps({
      offset,
    });
  }

  destroy() {
    this.scene.off('mousemove', this.onMouseMove);
  }
}

let popup: Popup | null = null;

export const getPopup = (scene: Scene) => {
  if (!popup) {
    popup = new Popup(scene);
  }
  return popup;
};
