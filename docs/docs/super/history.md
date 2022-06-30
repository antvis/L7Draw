---
title: 历史记录
order: 5
group:
  title: 高级
  order: 2
  path: /super
---

## 说明

默认情况下，Draw 会自动在主要操作（创建、编辑、拖拽、新增点等）后的绘制数据，自动保存在历史记录栈中，用户可以通过快捷键或者调用方法的方式进行 **↩️ 回退** 和 **↪️ 重做** 操作，对应的就是将历史记录栈中的数据进行还原至 Draw 中。

回退和重做操作默认分别通过[快捷键](/docs/super/keyboard) `ctrl/command + z` 和 `ctrl/command + shift + z` 来触发，也可以通过调用 Draw 实例中的方法 `revertHistory` 和 `redoHistory`来手动触发回退/重做操作。

## 示例

```tsx | pure
import { DrawPoint } from '@antv/l7-draw';

const drawer = new DrawPoint(scene, {
  // 历史记录栈相关的配置
  history: {
    maxSize: 100,
  },
  // 传false表示不开启历史记录的保存，同时也会导致回退/重做功能失效
  // history: false,
});

// 手动调用回退方法
drawer.revertHistory();
```

## 配置

| 名称    | 说明                                                 | 类型     | 默认值 |
| ------- | ---------------------------------------------------- | -------- | ------ |
| maxSize | 保存历史记录的最大个数，超出时则把最早保存的记录剔除 | `number` | `100`  |
