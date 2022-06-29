---
title: 线
order: 2
group:
  title: 绘制
  order: 1
  path: /draw
---

# 绘制线 DrawLine

## 说明

`DrawLine` 用于在地图上绘制线数据。

<img src="https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*QHhySoSASjsAAAAAAAAAAAAAARQnAQ" width="300" />

## 示例

```tsx | pure
import { DrawEvent, DrawLine } from '@antv/l7-draw';

// 实例化
const drawer = new DrawLine(scene, {
  autoActive: false,
  //  ....
});
// 开启绘制
drawer.enable();

// 监听绘制事件
drawer.on(DrawEvent.change, (lineList) => {
  console.log(lineList);
});
```

## 配置 Ï

options 配置是 Draw 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称            | 说明                                                                                                                    | 类型                                                 | 默认值  | 示例                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------- | ----------------------------------------------------------------- |
| initialData     | 设置 Draw 的初始数据，`GeoJSON` 类型中的 [LineString](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.4) 数组 | `Feature[]`                                          | `[]`    | [初始化数据示例](/example/line/init-data)                         |
| showMidPoint    | 是否展示线段中点                                                                                                        | `boolean`                                            | `true`  | [禁用中点](/example/line/mid-point)                               |
| distanceConfig    | 距离文本相关配置                                                                                                        | `false` &#124; [Distance](/docs/super/distance#配置) | `false` | [展示距离](/example/line/distance)                                |
| autoActive      | 新创建的 LineString 是否展示为激活态                                                                                    | `boolean`                                            | `true`  | [关闭自动激活示例](/example/line/auto-focus)                      |
| editable        | 绘制的 LineString 是否支持二次编辑（拖拽位移）                                                                          | `boolean`                                            | `true`  | [禁用编辑示例](/example/line/editable)                            |
| style           | LineString 在不同状态下的样式                                                                                           | [Style](/docs/super/style#配置)                      | -       | -                                                                 |
| keyboard        | 自定义快捷键瑟是否开启，以及对应的按键                                                                                  | [Keyboard](/docs/super/keyboard#配置)                | -       | -                                                                 |
| history         | 保存历史绘制数据的相关配置，涉及到回退操作的最大操作次数                                                                | [History](/docs/super/history#配置)                  | -       | -                                                                 |
| multiple        | Draw 中是否最多支持绘制多个 LineString                                                                                  | `boolean`                                            | `true`  | [关闭绘制多个 1](/example/line/multiple#始终最多绘制一个)         |
| addMultiple     | 每次调用 `enable` 时，Draw 中是否支持绘制多个 LineString                                                                | `boolean`                                            | `true`  | [关闭绘制多个 2](/example/line/multiple#单次-enable-最多绘制一个) |
| disableEditable | 未开启绘制的状态下，是否支持编辑操作                                                                                    | `boolean`                                            | `false` | [禁用状态下可编辑](/example/line/disable-editable)                |

## 方法

<embed src="../method.md"></embed>

## 事件

[监听事件示例](/example/line/event)

<embed src="../event.md"></embed>
