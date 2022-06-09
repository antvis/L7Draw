---
title: 点
order: 2
group:
  title: 绘制
  order: 1
  path: /draw
---

# 使用示例

```tsx | pure
import { PointDrawer, DrawerEvent } from '@antv/l7-draw';

const drawer = new PointDrawer(scene, {
  autoFocus: false,
  //  ....
});

drawer.enable();

drawer.on(DrawerEvent.add, (newPoint) => {
  console.log(newPoint);
});
```

# 配置

options 配置是 Drawer 实例化的时候，作为第二个参数传入，所有的 options 配置均不是必传项。

| 名称      | 说明                                                              | 类型                   | 默认值 | 示例                                                                         |
| --------- | ----------------------------------------------------------------- | ---------------------- | ------ | ---------------------------------------------------------------------------- |
| initData  | 设置 Point 的初始数据                                             | Feature&lt;Point&gt;[] | []     | [初始化数据示例](/example/point/init-data)                                   |
| multiple  | 是否支持绘制多个 Point                                            | boolean                | true   | [关闭绘制多个](/example/point/multiple)                                      |
| autoFocus | 绘制 Point 后，新增点是否为编辑态                                 | boolean                | true   | [关闭自动激活示例](/example/point/auto-focus)                                |
| editable  | 绘制的 Point 是否支持二次编辑（拖拽位移）                         | boolean                | true   | [禁用编辑示例](/example/point/editable)                                      |
| style     | 绘制时 Point 不同状态下的样式，可以参考 [Style 配置](/docs/style) | IStyleItem             | -      | [使用图片示例](/example/point/image), [自定义样式示例](/example/point/style) |

# 方法

| 名称    | 说明               | 类型                                    |
| ------- | ------------------ | --------------------------------------- |
| enable  | 开启绘制           | () => void;                             |
| disable | 警用绘制           | () => void;                             |
| clear   | 清除数据           | (disable: boolean) => void;             |
| getData | 获取当前绘制点数据 | () => IPointFeature[];                  |
| setData | 设置当前绘制点数据 | (data: Feature&lt;Point&gt;[]) => void; |

# 事件

| 名称                  | 说明                     | 回调函数                          |
| --------------------- | ------------------------ | --------------------------------- |
| DrawerEvent.init      | 初始化完成               | (drawer) => void                  |
| DrawerEvent.destroy   | 销毁完成                 | (drawer) => void                  |
| DrawerEvent.enable    | 启用绘制/编辑的回调      | (drawer) => void                  |
| DrawerEvent.disable   | 禁用绘制/编辑的回调      | (drawer) => void                  |
| DrawerEvent.add       | 添加点后的回调           | (newFeature, featureList) => void |
| DrawerEvent.edit      | 编辑点(位移点结束)的回调 | (newFeature, featureList) => void |
| DrawerEvent.change    | 添加点和编辑点的回调     | (featureList) => void             |
| DrawerEvent.dragStart | 开始拖拽的回调           | (newFeature, featureList) => void |
| DrawerEvent.dragging  | 拖拽中的回调             | (newFeature, featureList) => void |
| DrawerEvent.dragEnd   | 拖拽结束的回调           | (newFeature, featureList) => void |
