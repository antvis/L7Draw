---
title: 控件
order: 7
---

# 绘制控件 DrawControl

## 说明

`DrawControl` 基于 L7 的 Control，用于在地图上展示绘制控件，可以通过控件操控不同类型绘制的开关以及清空等操作。

<img src="https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*uP8AQJ-uBVEAAAAAAAAAAAAAARQnAQ" width="200"/>

## 示例

```tsx | pure
import { DrawControl } from '@antv/l7-draw';

// 实例化 DrawControl 实例
const drawControl = new DrawControl(scene, {
  // DrawControl 参数
  defaultActiveType: 'point',
});

// 将 Control 添加至地图中
scene.addControl(drawControl);
```

## 配置

options 配置是 Draw 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称                  | 说明                              | 类型                                | 默认值                                                                                                                  | 示例                                      |
| --------------------- | --------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| drawConfig            | 绘制按钮及绘制参数配置            | [DrawBtnConfig](#drawbtnconfig)     | { <br />point: true,<br />line: true,<br />polygon: true,<br />rect: true,<br />circle: true,<br />clear: true,<br /> } | [配置展示按钮](/example/control/draw)     |
| commonDrawOptions     | 各个绘制类实例化时候的通用配置    | 详情见各个绘制类的配置              | `{}`                                                                                                                    | [通用 Draw 配置](/example/control/common) |
| defaultActiveType     | 默认激活的绘制类型                | [DrawType](#drawtype) `&#124; null` | `null`                                                                                                                  | [快速开始](/example/control/start)        |
| className             | 控件 `DOM` 的 `class`             | `string`                            | `''`                                                                                                                    | -                                         |
| style                 | 控件 `DOM` 的 `style`             | `string`                            | `''`                                                                                                                    | -                                         |
| buttonClassName       | 控件中按钮 `DOM` 的 `class`       | `string`                            | `''`                                                                                                                    | -                                         |
| activeButtonClassName | 控件中按钮激活时 `DOM` 的 `class` | `string`                            | `''`                                                                                                                    | -                                         |

### DrawBtnConfig

```ts
type DrawBtnConfig = {
  point?: boolean | DeepPartial<IPointDrawerOptions>;
  line?: boolean | DeepPartial<ILineDrawerOptions>;
  polygon?: boolean | DeepPartial<IPolygonDrawerOptions>;
  rect?: boolean | DeepPartial<IRectDrawerOptions>;
  circle?: boolean | DeepPartial<ICircleDrawerOptions>;
  clear?: boolean;
};
```

### DrawType

```ts
type DrawType = 'point' | 'line' | 'polygon' | 'rect' | 'circle';
```

## 方法

| 名称          | 说明                                                             | 类型                                   |
| ------------- | ---------------------------------------------------------------- | -------------------------------------- |
| getActiveType | 获取当前激活的绘制类型                                           | `() => DrawType &#124; null`           |
| setActiveType | 设置当前激活的绘制类型，若当前传入的绘制类型已经激活则会取消激活 | `(DrawType &#124; null) => void`       |
| getDrawData   | 获取绘制数据                                                     | `() => Record<DrawType, Feature[]>`    |
| getTypeDraw   | 获取参数类型对应的 `Draw`                                        | `(type: DrawType) => Draw &#124; null` |
| clearDrawData | 清除绘制数据                                                     | `() => void`                           |

## 事件

[监听事件示例](/example/control/event)

| 名称                                        | 说明                     | 类型                                               |
| ------------------------------------------- | ------------------------ | -------------------------------------------------- |
| ControlEvent.DrawChange &#124; 'drawChange' | 当激活绘制变化时触发     | `(type: DrawType &#124; null) => void;`            |
| ControlEvent.DataChange &#124; 'dataChange' | 当绘制数据发生更改时触发 | `(drawData: Record<DrawType, Feature[]>) => void;` |
| ControlEvent.DrawSelect &#124; 'drawselect' | 当前选中元素发生更改 | `(drawType: DrawType, feature: Feature &#124; null) => void;` |
