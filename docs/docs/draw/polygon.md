---
title: 面
order: 3
group:
  title: 绘制
  order: 1
  path: /draw
---

# 说明

`PolygonDrawer` 用于在地图上绘制面数据。

# 示例

```tsx | pure
import { DrawerEvent, PolygonDrawer } from '@antv/l7-draw';

// 实例化
const drawer = new PolygonDrawer(scene, {
  autoFocus: false,
  //  ....
});
// 开启绘制
drawer.enable();

// 监听绘制事件
drawer.on(DrawerEvent.change, (polygonList) => {
  console.log(polygonList);
});
```

# 配置

options 配置是 Drawer 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称         | 说明                                                                       | 类型                                                   | 默认值 | 示例                                            |
| ------------ | -------------------------------------------------------------------------- | ------------------------------------------------------ | ------ | ----------------------------------------------- |
| initData     | 设置 Drawer 的初始数据                                                     | Feature&lt;Polygon&gt;[]                               | []     | [初始化数据示例](/example/polygon/init-data)    |
| multiple     | 是否支持绘制多个 Polygon                                                   | boolean                                                | true   | [关闭绘制多个](/example/polygon/multiple)       |
| autoFocus    | 绘制 Polygon 后，新增的 Polygon 是否为激活态                               | boolean                                                | true   | [关闭自动激活示例](/example/polygon/auto-focus) |
| editable     | 绘制的 Polygon 是否支持二次编辑（拖拽位移）                                | boolean                                                | true   | [禁用编辑示例](/example/polygon/editable)       |
| showMidPoint | 不显示线段中点                                                             | boolean                                                | true   | [禁用中点](/example/polygon/mid-point)          |
| distanceText | 距离文本相关配置，详情可见 [距离文本](/docs/super/distance)               | false or [IDistanceConfig](/docs/super/distance#配置) | -      | [展示距离和面积](/example/polygon/area)         |
| areaText     | 面积文本相关配置，详情可见 [面积文本](/docs/super/area)                   | false or [IAreaConfig](/docs/super/area#配置)         | -      | [展示距离和面积](/example/polygon/area)         |
| style        | 绘制时不同状态下的样式，详情可见 [样式](/docs/super/style)                 | IStyleItem                                             | -      | -                                               |
| history      | 回退、重做、历史记录等相关配置，详情可见 [回退/重做](/docs/super/history) | [History 配置](/docs/super/history)                   | -      | -                                               |

# 方法

<embed src="../method.md"></embed>

# 事件

[监听事件示例](/example/polygon/event)

| 名称                  | 说明                 | 类型                                                                                                               |
| --------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| DrawerEvent.init      | 初始化完成           | (drawer: PolygonDrawer) => void                                                                                    |
| DrawerEvent.destroy   | 销毁完成             | (drawer: PolygonDrawer) => void                                                                                    |
| DrawerEvent.enable    | 启用绘制/编辑的回调  | (drawer: PolygonDrawer) => void                                                                                    |
| DrawerEvent.disable   | 禁用绘制/编辑的回调  | (drawer: PolygonDrawer) => void                                                                                    |
| DrawerEvent.add       | 添加后的回调         | (newFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                                |
| DrawerEvent.edit      | 编辑(位移结束)的回调 | (editFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                               |
| DrawerEvent.remove    | 删除后的回调         | (editFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                               |
| DrawerEvent.addNode   | 添加结点             | (newNode: Feature&lt;Point&gt;,editFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void |
| DrawerEvent.change    | 添加和编辑的回调     | (featureList: Feature&lt;Polygon&gt;[]) => void                                                                    |
| DrawerEvent.dragStart | 开始拖拽的回调       | (dragFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                               |
| DrawerEvent.dragging  | 拖拽中的回调         | (dragFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                               |
| DrawerEvent.dragEnd   | 拖拽结束的回调       | (dragFeature: Feature&lt;Polygon&gt;, featureList: Feature&lt;Polygon&gt;[]) => void                               |
