---
title: 事件
hide: true
---

| 名称                | 说明                           | 类型                                                       |
| ------------------- | ------------------------------ | ---------------------------------------------------------- |
| DrawEvent.init      | Draw 初始化完成的回调          | `function(drawer: Draw)`                                   |
| DrawEvent.destroy   | Draw 完成销毁的回调            | `function(drawer: Draw)`                                   |
| DrawEvent.enable    | 启用绘制的回调                 | `function(drawer: Draw)`                                   |
| DrawEvent.disable   | 禁用绘制的回调                 | `function(drawer: Draw)`                                   |
| DrawEvent.clear     | 清空数据的回调                 | `function(drawer: Draw)`                                   |
| DrawEvent.add       | 新增的回调                     | `function(newFeature: Feature, featureList: Feature[])`    |
| DrawEvent.edit      | 编辑(位移或顶点发生变更)的回调 | `function(editFeature: Feature, featureList: Feature[])`   |
| DrawEvent.remove    | 删除的回调                     | `function(deleteFeature: Feature, featureList: Feature[])` |
| DrawEvent.dragStart | 开始拖拽的回调                 | `function(dragFeature: Feature, featureList: Feature[])`   |
| DrawEvent.dragging  | 拖拽中的回调                   | `function(dragFeature: Feature, featureList: Feature[])`   |
| DrawEvent.dragEnd   | 拖拽结束的回调                 | `function(dragFeature: Feature, featureList: Feature[])`   |
| DrawEvent.change    | 绘制数据发生变更后的回调       | `function(featureList: Feature[])`                         |
