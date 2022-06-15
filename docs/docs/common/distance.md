---
title: 距离
order: 3
group:
  title: 配置
  order: 2
  path: /common
---

# 说明

用于展示线段真实的距离长度

# 示例

距离文本配置是在各个 Drawer 的 distanceText 字段来进行配置的

```tsx | pure
import { PointDrawer } from '@antv/l7-draw';

const drawer = new PointDrawer(scene, {
  distanceText: {
    total: false,
    showOnDash: true,
    showOnActive: true,
    showOnNormal: true,
    format: (meters) => {
      if (meters >= 1000) {
        return +(meters / 1000).toFixed(2) + 'km';
      } else {
        return +meters.toFixed(2) + 'm';
      }
    },
  },
  // 传false表示不展示文本，默认也为false
  // distanceText: false,
});
```

# 配置

| 名称         | 说明                                     | 类型                       | 默认值              |
| ------------ | ---------------------------------------- | -------------------------- | ------------------- |
| total        | 是否展示线段总长度，但是分段距离会不展示 | boolean                    | false               |
| showOnDash   | 是否展示虚线的长度                       | boolean                    | true                |
| showOnActive | 是否在编辑状态下展示                     | boolean                    | true                |
| showOnNormal | 是否在非编辑状态下展示                   | boolean                    | true                |
| format       | 格式化距离长度的函数                     | (meters: number) => string | [见上述示例](#示例) |
