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

距离文本配置是在各个 Draw 的 areaOptions 字段来进行配置的

```tsx | pure
import { DrawPoint } from '@antv/l7-draw';

const drawer = new DrawPoint(scene, {
  areaOptions: {
    format: (squareMeters: number, polygonFeature: Feature<Polygon>) => {
      return squareMeters > 1000000
        ? `${+(squareMeters / 1000000).toFixed(2)}km²`
        : `${+squareMeters.toFixed(2)}m²`;
    },
  },
  // 传false表示不展示文本，默认也为false
  // areaOptions: false,
});
```

## 配置

| 名称   | 说明                   | 类型                                                                 | 默认值                          |
| ------ | ---------------------- | -------------------------------------------------------------------- | ------------------------------- |
| format | 格式化面积平方米的函数 | `(squareMeters: number, polygonFeature: Feature<Polygon>) => string` | [见示例中的 format 方法](#示例) |
