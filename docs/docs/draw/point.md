---
title: 点
order: 1
group:
  title: 绘制
  order: 1
  path: /draw
---

# 说明

`PointDrawer` 用于在地图上绘制点数据。

# 示例

```tsx | pure
import { DrawerEvent, PointDrawer } from '@antv/l7-draw';

// 实例化
const drawer = new PointDrawer(scene, {
  autoFocus: false,
  //  ....
});
// 开启绘制
drawer.enable();

// 监听绘制事件
drawer.on(DrawerEvent.change, (pointList) => {
  console.log(pointList);
});
```

# 配置

options 配置是 Drawer 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称      | 说明                                                                       | 类型                                 | 默认值 | 示例                                                                         |
| --------- | -------------------------------------------------------------------------- | ------------------------------------ | ------ | ---------------------------------------------------------------------------- |
| initData  | 设置 Drawer 的初始数据                                                     | Feature&lt;Point&gt;[]               | []     | [初始化数据示例](/example/point/init-data)                                   |
| multiple  | 是否支持绘制多个 Point                                                     | boolean                              | true   | [关闭绘制多个](/example/point/multiple)                                      |
| autoFocus | 绘制 Point 后，新增的 Point 是否为激活态                                   | boolean                              | true   | [关闭自动激活示例](/example/point/auto-focus)                                |
| editable  | 绘制的 Point 是否支持二次编辑（拖拽位移）                                  | boolean                              | true   | [禁用编辑示例](/example/point/editable)                                      |
| style     | 绘制时不同状态下的样式，详情可见 [样式](/docs/super/style)                 | IStyleItem                           | -      | [使用图片示例](/example/point/image), [自定义样式示例](/example/point/style) |
| history   | 回退、重做、历史记录等相关配置，详情可见 [回退/重做](/docs/super/history) | [History 配置](/docs/super/history) | -      | -                                                                            |

# 方法

<embed src="../method.md"></embed>

# 事件

[监听事件示例](/example/point/event)

| 名称                  | 说明                 | 类型                                                                             |
| --------------------- | -------------------- | -------------------------------------------------------------------------------- |
| DrawerEvent.init      | 初始化完成           | (drawer: PointDrawer) => void                                                    |
| DrawerEvent.destroy   | 销毁完成             | (drawer: PointDrawer) => void                                                    |
| DrawerEvent.enable    | 启用绘制/编辑的回调  | (drawer: PointDrawer) => void                                                    |
| DrawerEvent.disable   | 禁用绘制/编辑的回调  | (drawer: PointDrawer) => void                                                    |
| DrawerEvent.add       | 添加后的回调         | (newFeature: Feature&lt;Point&gt;, featureList: Feature&lt;Point&gt;[]) => void  |
| DrawerEvent.edit      | 编辑(位移结束)的回调 | (editFeature: Feature&lt;Point&gt;, featureList: Feature&lt;Point&gt;[]) => void |
| DrawerEvent.remove    | 删除后的回调         | (editFeature: Feature&lt;Point&gt;, featureList: Feature&lt;Point&gt;[]) => void |
| DrawerEvent.change    | 添加和编辑的回调     | (featureList: Feature&lt;Point&gt;[]) => void                                    |
| DrawerEvent.dragStart | 开始拖拽的回调       | (dragFeature: Feature&lt;Point&gt;, featureList: Feature&lt;Point&gt;[]) => void |
| DrawerEvent.dragging  | 拖拽中的回调         | (dragFeature: Feature&lt;Point&gt;, featureList: Feature&lt;Point&gt;[]) => void |
| DrawerEvent.dragEnd   | 拖拽结束的回调       | (dragFeature: Feature&lt;Point&gt;, featureList: Feature&lt;Point&gt;[]) => void |
