---
title: 面积
order: 4
group:
  title: 高级
  order: 2
  path: /super
---

## 说明

用于展示面真实的面积

## 示例

距离文本配置是在各个 Drawer 的 areaText 字段来进行配置的

```tsx | pure
import { DrawPoint } from '@antv/l7-draw';

const drawer = new DrawPoint(scene, {
  areaText: {
    showOnNormal: true,
    showOnActive: true,
    format: (squareMeters: number) => {
      return squareMeters > 1000000
        ? `${+(squareMeters / 1000000).toFixed(2)}km²`
        : `${+squareMeters.toFixed(2)}m²`;
    },
  },
  // 传false表示不展示文本，默认也为false
  // areaText: false,
});
```

## 配置

| 名称         | 说明                   | 类型                             | 默认值              |
| ------------ | ---------------------- | -------------------------------- | ------------------- |
| showOnActive | 是否在编辑状态下展示   | boolean                          | true                |
| showOnNormal | 是否在非编辑状态下展示 | boolean                          | true                |
| format       | 格式化面积平方米的函数 | (squareMeters: number) => string | [见上述示例](#示例) |
