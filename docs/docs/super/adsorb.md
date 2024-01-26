---
title: 吸附能力
order: 6
group:
  title: 高级
  order: 2
  path: /super
---

## 说明

在 `DrawLine` 和 `DrawPolygon` 中，在**绘制和拖拽结点**的过程中，当结点位置距离目标吸附物的点或线指定像素值内时，会将当前操作结点自动吸附到吸附物的点或线上，若开启吸附时会自动计算各个 `Feature` 的 `bbox` 用于吸附的计算性能提升。

<img src="https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*yOxpRKJaS_YAAAAAAAAAAAAAARQnAQ" width="300"/>

## 示例

```tsx | pure
import { DrawPolygon } from '@antv/l7-draw';

const adsorbPolygon = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [120.1519775390625, 30.263663574301724],
        [120.13240814208984, 30.228963070192805],
        [120.15695571899413, 30.252691235553513],
        [120.1519775390625, 30.263663574301724],
      ],
    ],
  },
};

const drawer = new DrawPolygon(scene, {
  adsorbOptions: {
    // 指定吸附围栏
    data: [adsorbPolygon],
    // data: () => [adsorbPolygon]  // 通过函数获取吸附物
    // data: 'drawData'   // 开启时的默认吸附物, 吸附物为当前绘制的图形
  },
  // adsorbOptions: false // 默认，关闭吸附
});
```

## 配置

| 名称             | 说明                                                                                                                                        | 类型                                                                        | 默认值       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------ |
| data             | 吸附对象，传入 `'drawData'` 表示吸附物为已有的绘制物，传入 `'allDrawData'` 表示吸附物为所有 Draw 实例的绘制物，也可以传入绘制物的 `GeoJSON` | `'drawData'` &#124; `'allDrawData'`&#124;`Feature[]`&#124;`() => Feature[]` | `'drawData'` |
| pointAdsorbPixel | 被吸附物上点吸附的像素值，当值 ≤ 0 时不吸附点                                                                                               | `number`                                                                    | `12`         |
| lineAdsorbPixel  | 被吸附物上线吸附的像素值，当值 ≤ 0 时不吸附线                                                                                               | `number`                                                                    | `10`         |
