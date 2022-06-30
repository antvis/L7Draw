---
title: 事件
hide: true
---

| 名称                | 说明                                                   | 类型                                                                      |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| DrawEvent.Init      | Draw 初始化完成的事件                                  | `function(drawer: Draw)`                                                  |
| DrawEvent.Destroy   | Draw 完成销毁的事件                                    | `function(drawer: Draw)`                                                  |
| DrawEvent.Enable    | 启用绘制的事件                                         | `function(drawer: Draw)`                                                  |
| DrawEvent.Disable   | 禁用绘制的事件                                         | `function(drawer: Draw)`                                                  |
| DrawEvent.Clear     | 清空数据的事件                                         | `function(drawer: Draw)`                                                  |
| DrawEvent.AddNode   | 添加结点                                               | `(newNode: Feature,editFeature: Feature, featureList: Feature[]) => void` |
| DrawEvent.Add       | 新增的事件                                             | `function(newFeature: Feature, featureList: Feature[])`                   |
| DrawEvent.Edit      | 编辑(位移或顶点发生变更)的事件                         | `function(editFeature: Feature, featureList: Feature[])`                  |
| DrawEvent.Remove    | 删除的事件                                             | `function(deleteFeature: Feature, featureList: Feature[])`                |
| DrawEvent.DragStart | 开始拖拽的事件                                         | `function(dragFeature: Feature, featureList: Feature[])`                  |
| DrawEvent.Dragging  | 拖拽中的事件                                           | `function(dragFeature: Feature, featureList: Feature[])`                  |
| DrawEvent.DragEnd   | 拖拽结束的事件                                         | `function(dragFeature: Feature, featureList: Feature[])`                  |
| DrawEvent.Change    | 绘制数据发生变更后的事件（包含以上绘制数据变动的事件） | `function(featureList: Feature[])`                                        |
