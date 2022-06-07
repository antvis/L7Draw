---
title: API 文档
order: 9
group:
  path: /LineDrawer
  title: LineDrawer 绘制线
  order: 3
---

# 构造器配置

以下所有配置项均非必传，未传的情况下各个参数将会自动使用默认值

```tsx | pure
import { LineDrawer } from '@antv/l7-draw';

const drawer = new LineDrawer(scene, {
  autoFocus: false,
  //  ....
});
```

| 名称          | 说明                                                                 | 类型                                           | 默认值                                                 | 示例                                                |
| ------------- | -------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| initData.line | 设置 Line 的初始数据                                                 | Feature&lt;LineString&gt;[]                    | []                                                     | [初始化数据示例](/基础绘制/LineDrawer/init-data)    |
| autoFocus     | 绘制 Line 后，新增线是否为编辑态                                     | boolean                                        | true                                                   | [关闭自动激活示例](/基础绘制/LineDrawer/auto-focus) |
| editable      | 绘制的 Line 是否支持二次编辑（拖拽位移）                             | boolean                                        | true                                                   | [禁用编辑示例](/基础绘制/LineDrawer/editable)       |
| showMidPoint  | 展示中点                                                             | boolean                                        | true                                                   | [禁用中点示例](/基础绘制/LineDrawer/mid-point)      |
| distanceText  | 展示距离文本                                                         | false 或 [IDistanceOptions](#idistanceoptions) |                                                        | [展示距离示例](/基础绘制/LineDrawer/distance)       |
| style         | 绘制时 Line 不同状态下的样式，可以参考 [Style 配置](/基础绘制/style) | IStyleItem                                     | [Line Style 默认配置](/基础绘制/style#line-style-配置) | -                                                   |

## IDistanceOptions

| 名称         | 说明                                              | 类型                             | 默认值 |
| ------------ | ------------------------------------------------- | -------------------------------- | ------ |
| total        | true 为展示完整 Line 的距离，false 为展示分段距离 | boolean                          | false  |
| showOnDash   | 绘制时的虚线是否展示距离                          | boolean                          | true   |
| showOnNormal | 常规态下是否展示距离                              | boolean                          | true   |
| showOnActive | 编辑态下是否展示距离                              | boolean                          | true   |
| format       | 格式化距离的方法，默认区分 km 和 m 并保留两位小数 | (squaremeters: number) => string | -      |

# 方法

| 名称        | 说明               | 传参                                           |
| ----------- | ------------------ |----------------------------------------------|
| enable      | 开启绘制           | -                                            |
| disable     | 警用绘制           | -                                            |
| clear       | 清除数据           | (disable: boolean) => void;                  |
| getLineData | 获取当前绘制线数据 | () => ILineFeature[];                        |
| setData     | 设置当前绘制线数据 | (data: Feature&lt;LineString&gt;[]) => void; |

# 事件

```tsx | pure
import { LineDrawer, DrawerEvent } from '@antv/l7-draw';

const drawer = new LineDrawer(scene, {});

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
| DrawerEvent.add       | 添加线后的回调           | (newFeature, featureList) => void |
| DrawerEvent.edit      | 编辑线(位移线结束)的回调 | (newFeature, featureList) => void |
| DrawerEvent.change    | 添加线和编辑线的回调     | (featureList) => void             |
| DrawerEvent.dragStart | 开始拖拽的回调           | (newFeature, featureList) => void |
| DrawerEvent.dragging  | 拖拽中的回调             | (newFeature, featureList) => void |
| DrawerEvent.dragEnd   | 拖拽结束的回调           | (newFeature, featureList) => void |
