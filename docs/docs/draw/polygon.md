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

| 名称            | 说明                                                                                                                       | 类型                                                                           | 默认值  | 示例                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------- | ---------------------------------------------------------- |
| initialData     | 设置 Draw 的初始数据，`GeoJSON` 类型中的 [Polygon](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6) 数组       | `Feature[]`                                                                    | `[]`    | [初始化数据示例](/example/polygon/initial-data)            |
| showMidPoint    | 是否展示线段中点                                                                                                           | `boolean`                                                                      | `true`  | [禁用中点](/example/polygon/mid-point)                     |
| distanceOptions | 距离文本相关配置                                                                                                           | `false` &#124; [Distance](/docs/super/distance#配置)                           | `false` | [展示距离和面积](/example/polygon/area)                    |
| areaOptions     | 面积文本相关配置                                                                                                           | `false` &#124; [Area](/docs/super/area#配置)                                   | `false` | [展示距离和面积](/example/polygon/area)                    |
| adsorbOptions   | 吸附相关配置                                                                                                               | `false` &#124; [Adsorb](/docs/super/adsorb#配置)                               | `false` | [吸附能力](/example/polygon/adsorb)              |
| liveUpdate      | 在绘制面过程中，面是否跟随鼠标动态更新                                                                                     | `boolean`                                                                      | `false` | -                                                          |
| autoActive      | 绘制 Polygon 后，新增的 Polygon 是否为激活态                                                                               | `boolean`                                                                      | `true`  | [关闭自动激活示例](/example/polygon/auto-active)           |
| editable        | 绘制的 Polygon 是否支持二次编辑（拖拽位移）                                                                                | `boolean`                                                                      | `true`  | [禁用编辑示例](/example/polygon/editable)                  |
| multiple        | Draw 是否支持绘制多个绘制物                                                                                                | `boolean`                                                                      | `true`  | [禁止绘制多个](/example/polygon/multiple#始终最多绘制一个) |
| style           | Polygon 在不同状态下的样式                                                                                                 | [Style](/docs/super/style#配置)                                                | -       | [自定义紫色样式](/example/polygon/style)                   |
| helper          | 绘制提示文案的配置，支持传入 `string &#124; Element &#124; DocumentFragment` 在提示框中进行渲染，传 `false` 为关闭提示绘制 | [Helper](#helper) &#124; `boolean`                                             | `true`  | [提示文案](/example/common/helper)                         |
| popup           | 绘制提示框配置，详细配置可见 [Tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/)，传 `false` 为关闭提示框          | [TippyProps](https://atomiks.github.io/tippyjs/v6/all-props/) &#124; `boolean` | `true`  | [提示文案](/example/common/helper)                         |
| keyboard        | 自定义快捷键瑟是否开启，以及对应的按键                                                                                     | [Keyboard](/docs/super/keyboard#配置)                                          | -       | -                                                          |
| history         | 保存历史绘制数据的相关配置，涉及到回退操作的最大操作次数                                                                   | [History](/docs/super/history#配置)                                            | -       | -                                                          |

### Helper

| 名称          | 说明                                         | 默认值                         |
| ------------- | -------------------------------------------- | ------------------------------ |
| draw          | 绘制时的提示                                 | `'单击绘制首个节点'`           |
| drawContinue  | 绘制过程中，节点个数还无法生成闭合面的提示   | `'单击继续绘制'`               |
| drawFinish    | 绘制过程中，节点个数已经可以生成闭合面的提示 | `'单击继续绘制，双击结束绘制'` |
| pointHover    | 光标悬停在点上的提示                         | `'可拖拽调整节点位置'`         |
| pointDrag     | 拖拽点时的提示                               | `null`                         |
| lineHover     | 光标悬停在线上的提示                         | `'可拖拽调整面位置'`           |
| lineDrag      | 拖拽线时的提示                               | `null`                         |
| polygonHover  | 光标悬停在面上的提示                         | `'可拖拽调整面位置'`           |
| polygonDrag   | 拖拽面时的提示                               | `null`                         |
| midPointHover | 光标悬停在中点上的提示                       | `'单击在该位置新增节点'`       |

## 方法

<embed src="../method.md"></embed>

## 事件

[监听事件示例](/example/polygon/event)

<embed src="../event.md"></embed>
