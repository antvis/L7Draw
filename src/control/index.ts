import { Control, DOM, Scene } from '@antv/l7';
import { BaseMode } from '../mode';
import { Container } from 'inversify';
import { BtnType, DrawType, IDrawControlProps } from './types';
import {
  DrawBtnActiveClassName,
  DrawBtnClassName,
  DrawControlClassName,
  DrawIconMap,
  DrawInstanceMap,
  DrawTypeAttrName,
} from './constant';
import { getParentByClassName } from '../typings';
import './iconfont.js';
import './index.less';
import { ControlEvent, DrawEvent } from '../constant';
import { debounce, fromPairs, toPairs } from 'lodash';

export class DrawControl extends Control {
  public controlOption: IDrawControlProps;
  protected scene: Scene;
  protected drawMap: Partial<Record<DrawType, BaseMode>> = {};
  protected btnMap: Partial<Record<BtnType, HTMLElement>> = {};
  protected activeType: DrawType | null = null;

  constructor(scene: Scene, options: Partial<IDrawControlProps> = {}) {
    super(options);
    this.scene = scene;
    this.controlOption = {
      ...this.getDefault(),
      ...(options || {}),
    };
    this.onBtnClick = this.onBtnClick.bind(this);
  }

  getActiveType() {
    return this.activeType;
  }

  // @ts-ignore
  getDefault(): IDrawControlProps {
    return {
      ...super.getDefault(),
      className: '',
      buttonClassName: '',
      activeButtonClassName: '',
      style: '',
      position: 'topleft',
      commonDrawOptions: {},
      drawConfig: {
        point: true,
        line: true,
        polygon: true,
        rect: true,
        circle: true,
        clear: true,
      },
    };
  }

  public addTo(container: Container) {
    super.addTo(container);
    this.init();
    return this;
  }

  onAdd(): HTMLElement {
    const { className, style } = this.controlOption;
    const container = DOM.create(
      'div',
      `${DrawControlClassName} ${className}`,
    ) as HTMLDivElement;
    if (style) {
      container.setAttribute('style', style);
    }
    return container;
  }

  onRemove() {
    Object.values(this.drawMap).forEach((draw) => {
      draw.clear(true);
    });
  }

  init() {
    const btnList: HTMLButtonElement[] = [];

    (Object.entries(this.controlOption.drawConfig) as [BtnType, any][]).forEach(
      ([btnType, options]) => {
        if (options) {
          const newBtn = this.initBtn(btnType);
          newBtn.addEventListener('click', this.onBtnClick);
          btnList.push(newBtn);
          this.btnMap[btnType] = newBtn;

          // @ts-ignore;
          const Draw = DrawInstanceMap[btnType];
          if (Draw && this.scene) {
            const draw = new Draw(this.scene, {
              ...this.controlOption.commonDrawOptions,
              ...(typeof options === 'boolean' ? {} : options),
            });
            draw.on(DrawEvent.Change, this.emitDataChange);
            this.drawMap[btnType as DrawType] = draw;
          }
        }
      },
    );
    this.container.append(...btnList);

    if (this.controlOption.defaultActiveType) {
      this.onDrawClick(this.controlOption.defaultActiveType);
    }
  }

  getDrawData() {
    return fromPairs(
      toPairs(this.drawMap).map(([drawType, draw]) => {
        return [drawType, draw.getData()];
      }),
    );
  }

  getTypeDraw(type: DrawType) {
    return this.drawMap[type] ?? null;
  }

  emitDataChange = debounce(() => {
    this.emit(ControlEvent.DataChange, this.getDrawData());
  }, 16);

  /**
   * 按钮的点击事件
   * @param e
   */
  onBtnClick(e: Event) {
    const btn = getParentByClassName(e.target as Element, DrawBtnClassName);
    if (!btn) {
      return;
    }
    const btnType = btn.getAttribute(DrawTypeAttrName) as BtnType;
    if (btnType === 'clear') {
      this.clearDrawData();
    } else {
      this.onDrawClick(btnType);
    }
  }

  /**
   * 设置当前激活的绘制类型
   * @param type
   */
  setActiveType(type: DrawType | null) {
    let newActiveType: DrawType | null = null;
    const oldActiveType = this.activeType;
    if (oldActiveType) {
      const targetBtn = this.btnMap[oldActiveType];
      if (targetBtn) {
        DOM.removeClass(targetBtn, DrawBtnActiveClassName);
        const { activeButtonClassName } = this.controlOption;
        if (activeButtonClassName) {
          DOM.removeClass(targetBtn, activeButtonClassName);
        }
      }
      this.drawMap[oldActiveType]?.disable();
      newActiveType = null;
    }
    if (oldActiveType !== type && type) {
      this.drawMap[type]?.enable();
      const targetBtn = this.btnMap[type];
      targetBtn &&
        DOM.addClass(
          targetBtn,
          `${DrawBtnActiveClassName} ${this.controlOption.activeButtonClassName}`,
        );
      newActiveType = type;
    }
    this.activeType = newActiveType;
    this.emit(ControlEvent.DrawChange, newActiveType);
  }

  /**
   * 绘制按钮点击的回调
   * @param type
   */
  onDrawClick(type: DrawType | null) {
    this.setActiveType(type);
  }

  /**
   * 清空绘制数据
   */
  clearDrawData() {
    Object.values(this.drawMap).forEach((draw) => {
      draw?.clear();
    });
  }

  /**
   * 创建按钮
   * @param type
   * @returns
   */
  initBtn(type: BtnType) {
    const btn = DOM.create(
      'button',
      `${DrawBtnClassName} ${this.controlOption.buttonClassName}`,
    ) as HTMLButtonElement;
    btn.innerHTML = `<svg class="l7-draw-icon" aria-hidden="true">
      <use xlink:href="${DrawIconMap[type]}"></use>
    </svg>`;
    btn.setAttribute(DrawTypeAttrName, type);
    return btn;
  }
}
