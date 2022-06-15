---
title: 圆
order: 5
group:
  title: 绘制
  order: 1
  path: /draw
---

# 说明

`CircleDrawer` 用于在地图上绘制圆数据。

# 示例

```tsx | pure
import {CircleDrawer, DrawerEvent} from '@antv/l7-draw';

// 实例化
const drawer = new CircleDrawer(scene, {
  autoFocus: false,
  //  ....
});
// 开启绘制
drawer.enable();

// 监听绘制事件
drawer.on(DrawerEvent.change, (circleList) => {
  console.log(circleList);
});
```

# 配置

options 配置是 Drawer 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称         | 说明                                                                | 类型                                                   | 默认值 | 示例                                           |
| ------------ | ------------------------------------------------------------------- | ------------------------------------------------------ | ------ | ---------------------------------------------- |
| initData     | 设置 Drawer 的初始数据                                              | Feature&lt;Polygon&gt;[]                               | []     | [初始化数据示例](/example/circle/init-data)    |
| createByDrag | 是否支持拖拽创建                                                    | boolean                                                | false  | [通过拖拽创建](/example/circle/create-by-drag) |
| multiple     | 是否支持绘制多个 Polygon                                            | boolean                                                | true   | [关闭绘制多个](/example/circle/multiple)       |
| autoFocus    | 绘制 Polygon 后，新增的 Polygon 是否为激活态                        | boolean                                                | true   | [关闭自动激活示例](/example/circle/auto-focus) |
| editable     | 绘制的 Polygon 是否支持二次编辑（拖拽位移）                         | boolean                                                | true   | [禁用编辑示例](/example/circle/editable)       |
| distanceText | 距离文本相关配置，详情可见 [距离文本](/docs/common/distance)        | false or [IDistanceConfig](/docs/common/distance#配置) | -      | [展示距离和面积](/example/circle/area)         |
| areaText     | 面积文本相关配置，详情可见 [面积文本](/docs/common/area)            | false or [IAreaConfig](/docs/common/area#配置)         | -      | [展示距离和面积](/example/circle/area)         |
| style        | 绘制时不同状态下的样式，详情可见 [样式](/docs/style)                | IStyleItem                                             | -      | -                                              |
| history      | 回退、重做、历史记录等相关配置，详情可见 [回退/重做](/docs/history) | [History 配置](/docs/history)                          | -      | -                                              |

# 方法

| 名称    | 说明             | 类型                                      |
| ------- | ---------------- | ----------------------------------------- |
| enable  | 开启绘制         | () => void;                               |
| disable | 警用绘制         | () => void;                               |
| clear   | 清除数据         | (disable: boolean) => void;               |
| getData | 获取当前绘制数据 | () => Feature&lt;Polygon&gt;[];           |
| setData | 设置当前绘制数据 | (data: Feature&lt;Polygon&gt;[]) => void; |

# 事件

[监听事件示例](/example/circle/event)

| 名称                  | 说明                 | 类型                                                                                                               |
| --------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| DrawerEvent.init      | 初始化完成           | (drawer: CircleDrawer) => void                                                                                     |
| DrawerEvent.destroy   | 销毁完成             | (drawer: CircleDrawer) => void                                                                                     |
| DrawerEvent.enable    | 启用绘制/编辑的回调  | (drawer: CircleDrawer) => void                                                                                     |
| DrawerEvent.disable   | 禁用绘制/编辑的回调  | (drawer: CircleDrawer) => void                                                                                     |
| DrawerEvent.add       | 添加后的回调         | (newFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                                |
| DrawerEvent.edit      | 编辑(位移结束)的回调 | (editFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                               |
| DrawerEvent.addNode   | 添加结点             | (newNode: Feature&lt;Point&gt;,editFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void |
| DrawerEvent.change    | 添加和编辑的回调     | (featureList: Feature&lt;Polygon&gt;[]) => void                                                                    |
| DrawerEvent.dragStart | 开始拖拽的回调       | (dragFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                               |
| DrawerEvent.dragging  | 拖拽中的回调         | (dragFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                               |
| DrawerEvent.dragEnd   | 拖拽结束的回调       | (dragFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                               |
