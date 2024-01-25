---
title: 矩形
order: 4
group:
  title: 绘制
  order: 1
  path: /draw
---

# 绘制矩形 DrawRect

## 说明

`DrawRect` 用于在地图上绘制矩形数据。

<img src="https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*zvXVRKGy6joAAAAAAAAAAAAAARQnAQ" width="300" />

## 示例

```tsx | pure
import { DrawEvent, DrawRect } from '@antv/l7-draw';

// 实例化
const drawer = new DrawRect(scene, {
  autoActive: false,
  //  ....
});
// 开启绘制
drawer.enable();

// 监听绘制事件
drawer.on(DrawEvent.Change, (rectList) => {
  console.log(rectList);
});
```

## 配置

options 配置是 Draw 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称            | 说明                                                                                                                       | 类型                                                                           | 默认值      | 示例                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------- |
| initialData     | 设置 Draw 的初始数据，`GeoJSON` 类型中的 [Polygon](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6) 数组       | `Feature[]`                                                                    | `[]`        | [初始化数据示例](/example/rect/initial-data)            |
| trigger         | 选择绘制方式，可以通过 **点击** 或者 **拖拽** 的方式进行绘制                                                               | `'click' &#124; 'drag'`                                                        | `click`     | [通过拖拽创建](/example/circle/create-by-drag)          |
| distanceOptions | 距离文本相关配置                                                                                                           | `false` &#124; [Distance](/docs/super/distance#配置)                           | `false`     | [展示距离和面积](/example/rect/area)                    |
| areaOptions     | 面积文本相关配置                                                                                                           | `false` &#124; [Area](/docs/super/area#配置)                                   | `false`     | [展示距离和面积](/example/rect/area)                    |
| autoActive      | 绘制 Polygon 后，新增的 Polygon 是否为激活态                                                                               | `boolean`                                                                      | `true`      | [关闭自动激活示例](/example/rect/auto-active)           |
| editable        | 绘制的 Polygon 是否支持二次编辑（拖拽位移）                                                                                | `boolean`                                                                      | `true`      | [禁用编辑示例](/example/rect/editable)                  |
| multiple        | 单次 enable 时，Draw 是否支持绘制多个绘制物                                                                                | `boolean`                                                                      | `true`      | [禁止绘制多个](/example/rect/multiple#始终最多绘制一个) |
| maxCount        | 当前绘制实例支持绘制的最大元素个数                                                                                         | `number` &#124; `undefined`                                                    | `undefined` |
| bbox            | 绘制的 Feature 数据中是否携带对应空间范围(最小包围盒) bbox                                                                 | `boolean`                                                                      | `false`     | [bbox](/example/common/bbox)                            |
| style           | Polygon 在不同状态下的样式                                                                                                 | [Style](/docs/super/style#配置)                                                | -           | -                                                       |
| helper          | 绘制提示文案的配置，支持传入 `string &#124; Element &#124; DocumentFragment` 在提示框中进行渲染，传 `false` 为关闭提示绘制 | [Helper](#helper) &#124; `boolean`                                             | `true`      | [提示文案](/example/common/helper)                      |
| popup           | 绘制提示框配置，详细配置可见 [Tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/)，传 `false` 为关闭提示框          | [TippyProps](https://atomiks.github.io/tippyjs/v6/all-props/) &#124; `boolean` | `true`      | [提示文案](/example/common/helper)                      |
| keyboard        | 自定义快捷键瑟是否开启，以及对应的按键                                                                                     | [Keyboard](/docs/super/keyboard#配置)                                          | -           | -                                                       |
| history         | 保存历史绘制数据的相关配置，涉及到回退操作的最大操作次数                                                                   | [History](/docs/super/history#配置)                                            | -           | -                                                       |

### Helper

| 名称         | 说明                                         | 默认值                 |
| ------------ | -------------------------------------------- | ---------------------- |
| draw         | 绘制时的提示                                 | `'单击绘制首个节点'`   |
| drawFinish   | 绘制过程中，节点个数已经可以生成闭合面的提示 | `'单击结束绘制'`       |
| pointHover   | 光标悬停在点上的提示                         | `'可拖拽调整节点位置'` |
| pointDrag    | 拖拽点时的提示                               | `null`                 |
| lineHover    | 光标悬停在线上的提示                         | `'可拖拽调整矩形位置'` |
| lineDrag     | 拖拽线时的提示                               | `null`                 |
| polygonHover | 光标悬停在面上的提示                         | `'可拖拽调整矩形位置'` |
| polygonDrag  | 拖拽面时的提示                               | `null`                 |

## 方法

<embed src="../method.md"></embed>

## 事件

[监听事件示例](/example/rect/event)

<embed src="../event.md"></embed>
