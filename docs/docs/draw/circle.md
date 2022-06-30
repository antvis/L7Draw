---
title: 圆
order: 5
group:
  title: 绘制
  order: 1
  path: /draw
---

# 绘制圆形 DrawCircle

## 说明

`DrawCircle` 用于在地图上绘制圆数据。

<img src="https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*yTQwS6d0RngAAAAAAAAAAAAAARQnAQ" width="300" />

## 示例

```tsx | pure
import { DrawCircle, DrawEvent } from '@antv/l7-draw';

// 实例化
const drawer = new DrawCircle(scene, {
  autoActive: false,
  //  ....
});
// 开启绘制
drawer.enable();

// 监听绘制事件
drawer.on(DrawEvent.Change, (circleList) => {
  console.log(circleList);
});
```

## 配置

options 配置是 Draw 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称            | 说明                                                                                                                 | 类型                                                 | 默认值  | 示例                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------- | --------------------------------------------------------- |
| initialData     | 设置 Draw 的初始数据，`GeoJSON` 类型中的 [Polygon](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6) 数组 | `Feature[]`                                          | `[]`    | [初始化数据示例](/example/circle/init-data)               |
| createByDrag    | 是否支持拖拽创建                                                                                                     | `boolean`                                            | `false` | [通过拖拽创建](/example/circle/create-by-drag)            |
| distanceOptions | 距离文本相关配置                                                                                                     | `false` &#124; [Distance](/docs/super/distance#配置) | `false` | [展示距离和面积](/example/circle/area)                    |
| areaOptions     | 面积文本相关配置                                                                                                     | `false` &#124; [Area](/docs/super/area#配置)         | `false` | [展示距离和面积](/example/circle/area)                    |
| autoActive      | 绘制 Polygon 后，新增的 Polygon 是否为激活态                                                                         | `boolean`                                            | `true`  | [关闭自动激活示例](/example/circle/auto-focus)            |
| editable        | 绘制的 Polygon 是否支持二次编辑（拖拽位移）                                                                          | `boolean`                                            | `true`  | [禁用编辑示例](/example/circle/editable)                  |
| multiple        | Draw 是否支持绘制多个绘制物                                                                                          | `boolean`                                            | `true`  | [禁止绘制多个](/example/circle/multiple#始终最多绘制一个) |
| style           | Polygon 在不同状态下的样式                                                                                           | [Style](/docs/super/style#配置)                      | -       | -                                                         |
| keyboard        | 自定义快捷键瑟是否开启，以及对应的按键                                                                               | [Keyboard](/docs/super/keyboard#配置)                | -       | -                                                         |
| history         | 保存历史绘制数据的相关配置，涉及到回退操作的最大操作次数                                                             | [History](/docs/super/history#配置)                  | -       | -                                                         |
| disableEditable | disable 禁用状态下是否支持编辑                                                                                       | `boolean`                                            | `false` | [禁用状态下可编辑](/example/circle/disable-editable)      |

## 方法

<embed src="../method.md"></embed>

## 事件

[监听事件示例](/example/circle/event)

<embed src="../event.md"></embed>
