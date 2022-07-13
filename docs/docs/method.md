---
title: 方法
hide: true
---

| 名称                | 说明                                                                                                                      | 类型                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| enable              | 开启绘制，参数 `allowCreate` 用于控制 `enable` 之后是否支持新增绘制物，传 `false` 表示只允许编辑不允许新增，默认为 `true` | `(allowCreate: boolean = true) => void`                                 |
| disable             | 关闭绘制                                                                                                                  | `() => void`                                                            |
| getData             | 获取当期绘制数据                                                                                                          | `() => Feature[]`                                                       |
| setData             | 覆盖并设置绘制数据                                                                                                        | `(features: Feature[]) => void`                                         |
| clear               | 清空绘制数据                                                                                                              | `(disable: boolean) => void`                                            |
| show                | 显示该 Draw 下所有的绘制物                                                                                                | `() => void`                                                            |
| hide                | 隐藏该 Draw 下所有的绘制物                                                                                                | `() => void`                                                            |
| setActiveFeature    | 将目标 Feature 设为激活态，可传目标 `Feature` 本身或其 `id`，传 `null` 或 `undefined` 则取消激活态                        | `(feature: Feature &#124; string &#124; null &#124; undefined) => void` |
| resetFeatures       | 清除当前正在绘制的绘制物，同时将激活的绘制物置为普通态                                                                    | `() => void`                                                            |
| removeActiveFeature | 删除当前激活状态的绘制物                                                                                                  | `() => void`                                                            |
| removeFeature       | 删除目标 Feature ，将目标 Feature 设为激活态，可传目标 Feature 本身或其 `properties` 中 `id` 字段                         | `(feature: Feature &#124; string) => void`                              |
| isEnable            | 判断当前 Draw 是否在绘制状态                                                                                              | `() => boolean`                                                         |
| setHelper           | 设置当前绘制提示文案，建议通过配置进行自定义而非手动调用该方法                                                            | `(content: string &#124; Element &#124; DocumentFragment) => boolean`   |
| revertHistory       | 回退至上一次保存的绘制状态                                                                                                | `() => SourceData &#124; undefined`                                     |
| redoHistory         | 重置到上一次回退                                                                                                          | `() => SourceData &#124; undefined`                                     |
| destroy             | 销毁当前 Draw 实例                                                                                                        | `() => void`                                                            |
