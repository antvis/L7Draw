---
title: 距离
order: 2
group:
  title: 高级
  order: 2
  path: /super
---

## 说明

用于展示线段真实的距离长度

<img src="https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*phM1SKhldcQAAAAAAAAAAAAAARQnAQ" width="300" />

## 示例

距离文本配置是在各个 Draw 的 distanceConfig 字段来进行配置的

```tsx | pure
import { DrawPoint } from '@antv/l7-draw';

const drawer = new DrawPoint(scene, {
  distanceConfig: {
    showTotalDistance: false,
    showDashDistance: true,
    showWhen: ['normal', 'active'],
    format: (meters) => {
      if (meters >= 1000) {
        return +(meters / 1000).toFixed(2) + 'km';
      } else {
        return +meters.toFixed(2) + 'm';
      }
    },
  },
  // 传false表示不展示文本，默认也为false
  // distanceConfig: false,
});
```

## 配置

| 名称              | 说明                                             | 类型                         | 默认值                    |
| ----------------- | ------------------------------------------------ | ---------------------------- |------------------------|
| showTotalDistance | 是否展示线段总长度，但是分段距离会不展示         | `boolean`                    | `false`                |
| showDashDistance  | 是否展示虚线的长度                               | `boolean`                    | `true`                 |
| showWhen          | 在何种绘制状态下展示，目前支持普通态和激活态展示 | `('normal' &#124; 'active')[]`   | `['nornal', 'active']` |
| format            | 格式化距离长度的函数                             | `(meters: number) => string` | [见示例中的 format 方法](#示例) |
