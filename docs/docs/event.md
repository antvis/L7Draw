---
title: 事件
hide: true
---

| 名称                | 说明                                                   | 类型                                                                      |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| DrawEvent.init      | Draw 初始化完成的事件                                  | `function(drawer: Draw)`                                                  |
| DrawEvent.destroy   | Draw 完成销毁的事件                                    | `function(drawer: Draw)`                                                  |
| DrawEvent.enable    | 启用绘制的事件                                         | `function(drawer: Draw)`                                                  |
| DrawEvent.disable   | 禁用绘制的事件                                         | `function(drawer: Draw)`                                                  |
| DrawEvent.clear     | 清空数据的事件                                         | `function(drawer: Draw)`                                                  |
| DrawEvent.addNode   | 添加结点                                               | `(newNode: Feature,editFeature: Feature, featureList: Feature[]) => void` |
| DrawEvent.add       | 新增的事件                                             | `function(newFeature: Feature, featureList: Feature[])`                   |
| DrawEvent.edit      | 编辑(位移或顶点发生变更)的事件                         | `function(editFeature: Feature, featureList: Feature[])`                  |
| DrawEvent.remove    | 删除的事件                                             | `function(deleteFeature: Feature, featureList: Feature[])`                |
| DrawEvent.dragStart | 开始拖拽的事件                                         | `function(dragFeature: Feature, featureList: Feature[])`                  |
| DrawEvent.dragging  | 拖拽中的事件                                           | `function(dragFeature: Feature, featureList: Feature[])`                  |
| DrawEvent.dragEnd   | 拖拽结束的事件                                         | `function(dragFeature: Feature, featureList: Feature[])`                  |
| DrawEvent.change    | 绘制数据发生变更后的事件（包含以上绘制数据变动的事件） | `function(featureList: Feature[])`                                        |
