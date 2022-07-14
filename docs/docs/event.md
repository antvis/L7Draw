---
title: 事件
hide: true
---

| 事件名                                   | 说明                                                   | 类型                                                                         |
| ---------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| DrawEvent.Init &#124; 'init'             | Draw 初始化完成的事件                                  | `function(drawer: Draw)`                                                     |
| DrawEvent.Destroy &#124; 'destroy'       | Draw 完成销毁的事件                                    | `function(drawer: Draw)`                                                     |
| DrawEvent.Enable &#124; 'enable'         | 启用绘制的事件                                         | `function(drawer: Draw)`                                                     |
| DrawEvent.Disable &#124; 'disable'       | 禁用绘制的事件                                         | `function(drawer: Draw)`                                                     |
| DrawEvent.Clear &#124; 'clear'           | 清空数据的事件                                         | `function(drawer: Draw)`                                                     |
| DrawEvent.AddNode &#124; 'addNode'       | 添加结点                                               | `(newNode: Feature,editFeature: Feature, featureList: Feature[]) => void`    |
| DrawEvent.RemoveNode &#124; 'removeNode' | 删除结点                                               | `(removeNode: Feature,editFeature: Feature, featureList: Feature[]) => void` |
| DrawEvent.Add &#124; 'add'               | 新增的事件                                             | `function(newFeature: Feature, featureList: Feature[])`                      |
| DrawEvent.Edit &#124; 'edit'             | 编辑(位移或顶点发生变更)的事件                         | `function(editFeature: Feature, featureList: Feature[])`                     |
| DrawEvent.Remove &#124; 'remove'         | 删除的事件                                             | `function(deleteFeature: Feature, featureList: Feature[])`                   |
| DrawEvent.DragStart &#124; 'dragStart'   | 开始拖拽的事件                                         | `function(dragFeature: Feature, featureList: Feature[])`                     |
| DrawEvent.Dragging &#124; 'dragging'     | 拖拽中的事件                                           | `function(dragFeature: Feature, featureList: Feature[])`                     |
| DrawEvent.DragEnd &#124; 'dragEnd'       | 拖拽结束的事件                                         | `function(dragFeature: Feature, featureList: Feature[])`                     |
| DrawEvent.Change &#124; 'change'         | 绘制数据发生变更后的事件（包含以上绘制数据变动的事件） | `function(featureList: Feature[])`                                           |
