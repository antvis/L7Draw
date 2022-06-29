---
title: 方法
hide: true
---

| 名称             | 说明                                                                                               | 类型                                |
| ---------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------- |
| enable           | 开启绘制                                                                                           | `() => void`                        |
| disable          | 关闭绘制                                                                                           | `() => void`                        |
| getData          | 获取当期绘制数据                                                                                   | `() => Feature[]`                   |
| setData          | 覆盖并设置绘制数据，如果需要自动激活绘制物，只需要设置其 `feature.properties.isActive = true` 即可 | `(features: Feature[]) => void`     |
| clear            | 清空绘制数据                                                                                       | `(disable: boolean) => void`        |
| show             | 显示该 Draw 下所有的绘制物                                                                         | `() => void`                        |
| hide             | 隐藏该 Draw 下所有的绘制物                                                                         | `() => void`                        |
| getEnabled       | 判断当前 Draw 是否在绘制状态                                                                       | `() => boolean`                     |
| saveHistory      | 保存当前绘制状态到历史记录中，下次回退将重置到此次保存的绘制状态                                   | `() => SourceData`                  |
| revertHistory    | 回退至上一次保存的绘制状态                                                                         | `() => SourceData &#124; undefined` |
| redoHistory      | 重置到上一次回退                                                                                   | `() => SourceData &#124; undefined` |
| removeActiveItem | 删除当前激活状态的绘制物                                                                           | `() => Feature`                     |
| removeItem       | 删除指定绘制物                                                                                     | `(feature: Feature) => void`        |
| destroy          | 销毁当前 Draw 实例                                                                                 | `() => void`                        |
