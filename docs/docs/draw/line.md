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
drawer.on(DrawEvent.Change, (lineList) => {
  console.log(lineList);
});
```

## 配置

options 配置是 Draw 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称            | 说明                                                                                                                       | 类型                                                                           | 默认值      | 示例                                                    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------- |
| initialData     | 设置 Draw 的初始数据，`GeoJSON` 类型中的 [LineString](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.4) 数组    | `Feature[]`                                                                    | `[]`        | [初始化数据示例](/example/line/initial-data)            |
| showMidPoint    | 是否展示线段中点                                                                                                           | `boolean`                                                                      | `true`      | [禁用中点](/example/line/mid-point)                     |
| distanceOptions | 距离文本相关配置                                                                                                           | `false` &#124; [Distance](/docs/super/distance#配置)                           | `false`     | [展示距离](/example/line/distance)                      |
| adsorbOptions   | 吸附相关配置                                                                                                               | `false` &#124; [Adsorb](/docs/super/adsorb#配置)                               | `false`     | [吸附能力](/example/line/adsorb)                        |
| autoActive      | 新创建的 LineString 是否展示为激活态                                                                                       | `boolean`                                                                      | `true`      | [关闭自动激活示例](/example/line/auto-active)           |
| editable        | 绘制的 LineString 是否支持二次编辑（拖拽位移）                                                                             | `boolean`                                                                      | `true`      | [禁用编辑示例](/example/line/editable)                  |
| multiple        | 单次 enable 时，Draw 是否支持绘制多个绘制物                                                                                | `boolean`                                                                      | `true`      | [禁止绘制多个](/example/line/multiple#始终最多绘制一个) |
| maxCount        | 当前绘制实例支持绘制的最大元素个数                                                                                         | `number` &#124; `undefined`                                                    | `undefined` |
| style           | LineString 在不同状态下的样式                                                                                              | [Style](/docs/super/style#配置)                                                | -           | -                                                       |
| helper          | 绘制提示文案的配置，支持传入 `string &#124; Element &#124; DocumentFragment` 在提示框中进行渲染，传 `false` 为关闭提示绘制 | [Helper](#helper) &#124; `boolean`                                             | `true`      | [提示文案](/example/common/helper)                      |
| popup           | 绘制提示框配置，详细配置可见 [Tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/)，传 `false` 为关闭提示框          | [TippyProps](https://atomiks.github.io/tippyjs/v6/all-props/) &#124; `boolean` | `true`      | [提示文案](/example/common/helper)                      |
| keyboard        | 自定义快捷键瑟是否开启，以及对应的按键                                                                                     | [Keyboard](/docs/super/keyboard#配置)                                          | -           | -                                                       |
| history         | 保存历史绘制数据的相关配置，涉及到回退操作的最大操作次数                                                                   | [History](/docs/super/history#配置)                                            | -           | -                                                       |

### Helper

| 名称          | 说明                   | 默认值                         |
| ------------- | ---------------------- | ------------------------------ |
| draw          | 绘制时的提示           | `'单击绘制首个节点'`           |
| drawFinish    | 绘制过程中的提示       | `'单击继续绘制，双击结束绘制'` |
| pointHover    | 光标悬停在点上的提示   | `'可拖拽调整节点位置'`         |
| pointDrag     | 拖拽点时的提示         | `null`                         |
| lineHover     | 光标悬停在线上的提示   | `'可拖拽调整线位置'`           |
| lineDrag      | 拖拽线时的提示         | `null`                         |
| midPointHover | 光标悬停在中点上的提示 | `'单击在该位置新增节点'`       |

## 方法

<embed src="../method.md"></embed>

## 事件

[监听事件示例](/example/line/event)

<embed src="../event.md"></embed>
