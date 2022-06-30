---
title: 面积
order: 3
group:
  title: 高级
  order: 2
  path: /super
---

## 说明

用于展示面真实的面积

<img src="https://gw.alipayobjects.com/mdn/rms_2591f5/afts/img/A*TlNrTrEYaoAAAAAAAAAAAAAAARQnAQ" width="300" />

## 示例

距离文本配置是在各个 Draw 的 areaConfig 字段来进行配置的

```tsx | pure
import { DrawPoint } from '@antv/l7-draw';

const drawer = new DrawPoint(scene, {
  areaConfig: {
    showWhen: ['normal', 'active'],
    format: (squareMeters: number) => {
      return squareMeters > 1000000
        ? `${+(squareMeters / 1000000).toFixed(2)}km²`
        : `${+squareMeters.toFixed(2)}m²`;
    },
  },
  // 传false表示不展示文本，默认也为false
  // areaConfig: false,
});
```

## 配置

| 名称     | 说明                                             | 类型                               | 默认值                          |
| -------- | ------------------------------------------------ | ---------------------------------- | ------------------------------- |
| showWhen | 在何种绘制状态下展示，目前支持普通态和激活态展示 | `('normal' &#124; 'active')[]`     | `['nornal', 'active']`          |
| format   | 格式化面积平方米的函数                           | `(squareMeters: number) => string` | [见示例中的 format 方法](#示例) |
