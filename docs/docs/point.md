---
title: 绘制点
order: 1
---

# 构造器配置

以下所有配置项均非必传，未传的情况下各个参数将会自动使用默认值

```tsx | pure
import { PointDrawer } from '@antv/l7-draw';

const drawer = new PointDrawer(scene, {
  autoFocus: false,
  //  ....
});
```

| 名称           | 说明                                                                  | 类型                                                                   | 默认值                                                   | 示例                                                                                       |
| -------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| initData.point | 设置 Point 的初始数据                                                 | Feature&lt;Point&gt;[]                                                 | []                                                       | [初始化数据示例](/example/point/init-data)                                          |
| autoFocus      | 绘制 Point 后，新增点是否为编辑态                                     | boolean                                                                | true                                                     | [关闭自动激活示例](/example/point/auto-focus)                                       |
| editable       | 绘制的 Point 是否支持二次编辑（拖拽位移）                             | boolean                                                                | true                                                     | [禁用编辑示例](/example/point/editable)                                             |
| popup          | 提示文本框的配置，底层使用 tippy.js                                   | false or [TippyProps](https://atomiks.github.io/tippyjs/v6/all-props/) | false                                                    | [提示文案](/example/point/helper)                                                   |
| style          | 绘制时 Point 不同状态下的样式，可以参考 [Style 配置](/基础绘制/style) | IStyleItem                                                             | [Point Style 默认配置](/基础绘制/style#point-style-配置) | [使用图片示例](/example/point/image), [自定义样式示例](/example/point/style) |

# 方法

| 名称      | 说明               | 传参                        |
|---------| ------------------ | --------------------------- |
| enable  | 开启绘制           | -                           |
| disable | 警用绘制           | -                           |
| clear   | 清除数据           | (disable: boolean) => void; |
| getData | 获取当前绘制点数据 | () => IPointFeature[];      |

# 事件

```tsx | pure
import { PointDrawer, DrawerEvent } from '@antv/l7-draw';

const drawer = new PointDrawer(scene, {});

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
| DrawerEvent.add       | 添加点后的回调           | (newFeature, featureList) => void |
| DrawerEvent.edit      | 编辑点(位移点结束)的回调 | (newFeature, featureList) => void |
| DrawerEvent.change    | 添加点和编辑点的回调     | (featureList) => void             |
| DrawerEvent.dragStart | 开始拖拽的回调           | (newFeature, featureList) => void |
| DrawerEvent.dragging  | 拖拽中的回调             | (newFeature, featureList) => void |
| DrawerEvent.dragEnd   | 拖拽结束的回调           | (newFeature, featureList) => void |
