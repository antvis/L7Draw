---
title: 点
order: 1
group:
  title: 绘制
  order: 1
  path: /draw
---

# 绘制点 DrawPoint

## 说明

`DrawPoint` 用于在地图上绘制点数据。

<img src="https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*dGjSSLNam8gAAAAAAAAAAAAAARQnAQ" width="300" />

## 示例

```tsx | pure
import { DrawEvent, DrawPoint } from '@antv/l7-draw';

// 实例化
const drawer = new DrawPoint(scene, {
  autoActive: false,
  // Draw 的配置 options
});
// 开启绘制
drawer.enable();

// 监听绘制事件
drawer.on(DrawEvent.Change, (pointList) => {
  console.log(pointList);
});
```

## 配置

options 配置是 Draw 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称            | 说明                                                                                                               | 类型                                  | 默认值  | 示例                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| initialData     | 设置 Draw 的初始数据，`GeoJSON` 类型中的 [Point](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.2) 数组 | `Feature[]`                           | `[]`    | [初始化数据示例](/example/point/init-data)                                   |
| autoActive      | 新创建的 Point 是否展示为激活态                                                                                    | `boolean`                             | `true`  | [关闭自动激活示例](/example/point/auto-focus)                                |
| editable        | 绘制的 Point 是否支持二次编辑（拖拽位移）                                                                          | `boolean`                             | `true`  | [禁用编辑示例](/example/point/editable)                                      |
| multiple        | Draw 中是否最多支持绘制多个 Point                                                                                  | `boolean`                             | `true`  | [禁止绘制多个](/example/point/multiple#始终最多绘制一个)                     |
| style           | Point 在不同状态下的样式                                                                                           | [Style](/docs/super/style#配置)       | -       | [使用图片示例](/example/point/image), [自定义样式示例](/example/point/style) |
| keyboard        | 自定义快捷键瑟是否开启，以及对应的按键                                                                             | [Keyboard](/docs/super/keyboard#配置) | -       | -                                                                            |
| history         | 保存历史绘制数据的相关配置，涉及到回退操作的最大操作次数                                                           | [History](/docs/super/history#配置)   | -       | -                                                                            |
| disableEditable | 未开启绘制的状态下，是否支持编辑操作                                                                               | `boolean`                             | `false` | [禁用状态下可编辑](/example/point/disable-editable)                          |

## 方法

<embed src="../method.md"></embed>

## 事件

[监听事件示例](/example/point/event)

<embed src="../pointEvent.md"></embed>
