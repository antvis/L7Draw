import { IInteractionTarget, IPopup, Scene, ILngLat, bindAll } from '@antv/l7';
import { Feature, FeatureCollection } from '@turf/helpers';
import { EventEmitter } from 'eventemitter3';
// tslint:disable-next-line:no-submodule-imports
import merge from 'lodash/merge';
import DrawSource from '../source';
import { DrawModes } from '../util/constant';
import LayerStyles from '../util/layerstyle';
import { IDrawFeatureOption } from './draw_feature';

export interface IDrawOption {
  data: FeatureCollection;
  title: string;
  style: any;
  enableCustomDraw: boolean;
  customDraw?: () => Promise<any>;
  rewriteCursor?: Record<string, string>;
  checkDrawable?: (lngLat: ILngLat, context: DrawMode) => boolean;
}

export type DrawStatus =
  | 'Drawing'
  | 'DrawSelected'
  | 'DrawEdit'
  | 'DrawFinish'
  | 'EditFinish'
  | 'DrawDelete';

let DrawFeatureId = 0;

abstract class DrawMode extends EventEmitter {
  public source: DrawSource;
  public scene: Scene;
  public type: string;
  public title: string;
  public isEnable: boolean = false;

  protected options: {
    [key: string]: any;
  } = {
    style: LayerStyles,
  };
  public drawStatus: DrawStatus = 'Drawing';
  protected currentFeature: Feature | null;
  protected currentVertex: Feature | null;
  protected popup: IPopup;
  protected drawMode: DrawModes[keyof DrawModes];
  protected drawable = true;
  constructor(scene: Scene, options: Partial<IDrawOption> = {}) {
    super();
    const { data } = options;
    this.scene = scene;
    this.source = new DrawSource(data);

    this.options = merge(this.options, this.getDefaultOptions(), options);
    this.title = this.getOption('title');

    bindAll(['onDragStart', 'onDragging', 'onDragEnd', 'onClick'], this);
    if (this.getOption('checkDrawable')) {
      scene.on('mousemove', ({ lnglat }) => {
        const checkDrawable = this.getOption('checkDrawable');
        if (this.drawStatus === 'Drawing' && checkDrawable) {
          if (checkDrawable(lnglat, this)) {
            this.setCursor(this.getOption('cursor'));
            this.drawable = true;
          } else {
            this.setCursor('not-allowed');
            this.drawable = false;
          }
        }
      });
    }
  }

  public getDrawMode(): DrawModes[keyof DrawModes] {
    return this.drawMode;
  }

  public enable() {
    this.scene.setMapStatus({
      dragEnable: false,
    });
    if (this.isEnable) {
      return;
    }
    this.drawStatus = 'Drawing';
    // @ts-ignore
    this.scene.on('dragstart', this.onDragStart);
    this.scene.on('dragging', this.onDragging);
    this.scene.on('dragend', this.onDragEnd);
    this.scene.on('click', this.onClick);
    this.setCursor(this.getOption('cursor'));
    this.isEnable = true;
  }

  // 重置绘制组件
  public resetDraw() {}

  public disable() {
    if (!this.isEnable) {
      return;
    }
    this.scene.off('dragstart', this.onDragStart);
    this.scene.off('dragging', this.onDragging);
    this.scene.off('dragend', this.onDragEnd);
    this.scene.off('click', this.onClick);
    this.resetCursor();
    // @ts-ignore
    this.scene.setMapStatus({
      dragEnable: true,
    });
    this.isEnable = false;
    this.drawStatus = 'DrawFinish';
  }
  public setCurrentFeature(feature: Feature) {
    this.currentFeature = feature;
    this.source.setFeatureActive(feature);
  }

  public setCurrentVertex(feature: Feature) {
    this.currentVertex = feature;
  }
  public deleteCurrentFeature() {
    throw new Error('子类未实现该方法');
  }

  public getCurrentVertex(): Feature {
    return this.currentVertex as Feature;
  }
  public getCurrentFeature(): Feature {
    return this.currentFeature as Feature;
  }

  public getOption(key: string) {
    return this.options[key];
  }

  public setOption(key: string, value: any) {
    return (this.options[key] = value);
  }

  public getStyle(id: string) {
    return this.getOption('style')[id];
  }

  public getUniqId() {
    return DrawFeatureId++;
  }

  public setCursor(cursor: string) {
    const container = this.scene.getMapCanvasContainer();
    if (container) {
      const rewriteCursor = this.getOption('rewriteCursor') ?? {};
      container.style.cursor = rewriteCursor[cursor] ?? cursor;
    }
  }
  public resetCursor() {
    const container = this.scene.getMapCanvasContainer();
    if (container) {
      container.removeAttribute('style');
    }
  }

  public getCursor() {
    const container = this.scene.getMapCanvasContainer();
    if (container) {
      return container.style.cursor ?? '';
    }
  }

  public destroy() {
    DrawFeatureId = 0;
    this.removeAllListeners();
    this.disable();
  }

  public getDrawable() {
    return this.drawable;
  }

  protected setDrawMode(mode: DrawModes[keyof DrawModes]) {
    this.drawMode = mode;
  }

  protected getDefaultOptions(): Partial<IDrawFeatureOption> {
    return {};
  }

  protected abstract onDragStart(e: IInteractionTarget): void;

  protected abstract onDragging(e: IInteractionTarget): void;

  protected abstract onDragEnd(e: IInteractionTarget): void;

  protected onClick(e: IInteractionTarget): any {
    return null;
  }
}

export default DrawMode;
