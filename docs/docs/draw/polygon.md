---
title: 面
order: 3
group:
  title: 绘制
  order: 1
  path: /draw
---

# 绘制面 DrawPolygon

## 说明

`DrawPolygon` 用于在地图上绘制面数据。

<img src="https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*PEWMTJnCKcYAAAAAAAAAAAAAARQnAQ" width="300" />

## 示例

```tsx | pure
import { DrawEvent, DrawPolygon } from '@antv/l7-draw';

// 实例化
const drawer = new DrawPolygon(scene, {
  autoActive: false,
  //  ....
});
// 开启绘制
drawer.enable();

// 监听绘制事件
drawer.on(DrawEvent.Change, (polygonList) => {
  console.log(polygonList);
});
```

## 配置

options 配置是 Draw 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称            | 说明                                                                                                                 | 类型                                                 | 默认值  | 示例                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------- | ---------------------------------------------------------- |
| initialData     | 设置 Draw 的初始数据，`GeoJSON` 类型中的 [Polygon](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6) 数组 | `Feature[]`                                          | `[]`    | [初始化数据示例](/example/polygon/init-data)               |
| showMidPoint    | 是否展示线段中点                                                                                                     | `boolean`                                            | `true`  | [禁用中点](/example/polygon/mid-point)                     |
| distanceOptions | 距离文本相关配置                                                                                                     | `false` &#124; [Distance](/docs/super/distance#配置) | `false` | [展示距离和面积](/example/polygon/area)                    |
| areaOptions     | 面积文本相关配置                                                                                                     | `false` &#124; [Area](/docs/super/area#配置)         | `false` | [展示距离和面积](/example/polygon/area)                    |
| autoActive      | 绘制 Polygon 后，新增的 Polygon 是否为激活态                                                                         | `boolean`                                            | `true`  | [关闭自动激活示例](/example/polygon/auto-focus)            |
| editable        | 绘制的 Polygon 是否支持二次编辑（拖拽位移）                                                                          | `boolean`                                            | `true`  | [禁用编辑示例](/example/polygon/editable)                  |
| multiple        | 关闭后，Draw 中始终最多只能绘制一个 Polygon 绘制物                                                                   | `boolean`                                            | `true`  | [禁止绘制多个](/example/polygon/multiple#始终最多绘制一个) |
| style           | Polygon 在不同状态下的样式                                                                                           | [Style](/docs/super/style#配置)                      | -       | -                                                          |
| keyboard        | 自定义快捷键瑟是否开启，以及对应的按键                                                                               | [Keyboard](/docs/super/keyboard#配置)                | -       | -                                                          |
| history         | 保存历史绘制数据的相关配置，涉及到回退操作的最大操作次数                                                             | [History](/docs/super/history#配置)                  | -       | -                                                          |
| disableEditable | disable 禁用状态下是否支持编辑                                                                                       | `boolean`                                            | `false` | [禁用状态下可编辑](/example/polygon/disable-editable)      |

## 方法

<embed src="../method.md"></embed>

## 事件

[监听事件示例](/example/polygon/event)

<embed src="../event.md"></embed>
