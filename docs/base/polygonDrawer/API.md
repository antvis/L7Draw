---
title: API 文档
order: 9
group:
  path: /PolygonDrawer
  title: PolygonDrawer 绘制面
  order: 4
---

# 构造器配置

以下所有配置项均非必传，未传的情况下各个参数将会自动使用默认值

```tsx | pure
import { PolygonDrawer } from '@antv/l7-draw';

const drawer = new PolygonDrawer(scene, {
  autoFocus: false,
  //  ....
});
```

| 名称             | 说明                                                                    | 类型                                           | 默认值                                                       | 示例                                                   |
| ---------------- | ----------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| initData.polygon | 设置 Polygon 的初始数据                                                 | Feature&lt;Polygon&gt;[]                       | []                                                           | [初始化数据示例](/基础绘制/PolygonDrawer/init-data)    |
| autoFocus        | 绘制 Polygon 后，新增面是否为编辑态                                     | boolean                                        | true                                                         | [关闭自动激活示例](/基础绘制/PolygonDrawer/auto-focus) |
| multiple      | 单次编辑是否支持绘制多个                                   | boolean                                        | true                                                   | -                                       |
| editable         | 绘制的 Polygon 是否支持二次编辑（拖拽位移）                             | boolean                                        | true                                                         | [禁用编辑示例](/基础绘制/PolygonDrawer/editable)       |
| showMidPoint     | 展示中点                                                                | boolean                                        | true                                                         | [禁用中点示例](/基础绘制/PolygonDrawer/mid-point)      |
| distanceText     | 展示距离文本                                                            | false 或 [IDistanceOptions](#idistanceoptions) |                                                              | [展示距离和面积示例](/基础绘制/PolygonDrawer/area)     |
| areaText         | 展示面积文本                                                            | false 或 [IAreaOptions](#iareaoptions)         |                                                              | [展示距离和面积示例](/基础绘制/PolygonDrawer/area)     |
| style            | 绘制时 Polygon 不同状态下的样式，可以参考 [Style 配置](/基础绘制/style) | IStyleItem                                     | [Polygon Style 默认配置](/基础绘制/style#polygon-style-配置) | -                                                      |

## IDistanceOptions

| 名称         | 说明                                                 | 类型                       | 默认值 |
| ------------ | ---------------------------------------------------- | -------------------------- | ------ |
| total        | true 为展示完整 Polygon 的距离，false 为展示分段距离 | boolean                    | false  |
| showOnDash   | 绘制时的虚线是否展示距离                             | boolean                    | true   |
| showOnNormal | 常规态下是否展示距离                                 | boolean                    | true   |
| showOnActive | 编辑态下是否展示距离                                 | boolean                    | true   |
| format       | 格式化距离的方法，默认区分 km 和 m 并保留两位小数    | (meters: number) => string | -      |

## IAreaOptions

| 名称         | 说明                                                | 类型                             | 默认值 |
| ------------ | --------------------------------------------------- | -------------------------------- | ------ |
| format       | 格式化面积的方法，默认区分 km² 和 m² 并保留两位小数 | (squareMeters: number) => string | -      |
| showOnNormal | 常规态下是否展示面积                                | boolean                          | true   |
| showOnActive | 编辑态下是否展示面积                                | boolean                          | true   |

# 方法

| 名称           | 说明               | 传参                                        |
| -------------- | ------------------ |-------------------------------------------|
| enable         | 开启绘制           | -                                         |
| disable        | 警用绘制           | -                                         |
| clear          | 清除数据           | (disable: boolean) => void;               |
| getPolygonData | 获取当前绘制面数据 | () => IPolygonFeature[];                  |
| setData        | 设置当前绘制面数据 | (data: Feature&lt;Polygon&gt;[]) => void; |

# 事件

```tsx | pure
import { PolygonDrawer, DrawerEvent } from '@antv/l7-draw';

const drawer = new PolygonDrawer(scene, {});

drawer.on(DrawerEvent.init, (drawer) => {
  // ....
});
```

| 名称                  | 说明                     | 回调函数                          |
| --------------------- | ------------------------ | --------------------------------- |
| DrawerEvent.init      | 初始化完成               | (drawer) => void                  |
| DrawerEvent.destroy   | 销毁完成                 | (drawer) => void                  |
| DrawerEvent.enable    | 启用绘制/编辑的回调      | (drawer) => void                  |
| DrawerEvent.disable   | 禁用绘制/编辑的回调      | (drawer) => void                  |
| DrawerEvent.add       | 添加面后的回调           | (newFeature, featureList) => void |
| DrawerEvent.edit      | 编辑面(位移面结束)的回调 | (newFeature, featureList) => void |
| DrawerEvent.change    | 添加面和编辑面的回调     | (featureList) => void             |
| DrawerEvent.dragStart | 开始拖拽的回调           | (newFeature, featureList) => void |
| DrawerEvent.dragging  | 拖拽中的回调             | (newFeature, featureList) => void |
| DrawerEvent.dragEnd   | 拖拽结束的回调           | (newFeature, featureList) => void |
