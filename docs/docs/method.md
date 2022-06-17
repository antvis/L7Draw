---
title: 方法
hide: true
---

| 名称             | 说明                                                                           | 类型                                     |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------------------- |
| getData          | 获取当期绘制数据                                                               | () => Feature&lt;Point&gt;[]             |
| setData          | 设置绘制数据，如果需要自动激活绘制物，只需要将其 properties.isActive 设为 true | (points: Feature&lt;Point&gt;[]) => void |
| clear            | 清空绘制数据                                                                   | (disable: boolean) => void               |
| enable           | 开启绘制                                                                       | () => void                               |
| disable          | 关闭绘制                                                                       | () => void                               |
| show             | 显示该 Drawer 下所有图层                                                       | () => void                               |
| hide             | 隐藏该 Drawer 下所有图层                                                       | () => void                               |
| getIsEnable      | 判断当前 Drawer 是否在绘制状态                                                 | () => boolean                            |
| saveHistory      | 保存当前绘制数据到历史记录中，下次回退将重置到此次保存的数据状态               | () => SourceData                         |
| revertHistory    | 回退至上一次保存的历史记录                                                     | () => SourceData or undefined            |
| redoHistory      | 重置到上一次回退                                                               | () => SourceData or undefined            |
| removeActiveItem | 删除当前激活状态的绘制项                                                       | () => Feature                            |
| removeItem       | 删除指定绘制物                                                                 | (item: Feature) => void                  |
| destroy          | 销毁当前 Drawer 实例                                                           | () => void                               |
