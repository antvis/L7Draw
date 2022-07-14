---
title: 快捷操作
order: 4
group:
  title: 高级
  order: 2
  path: /super
---

## 说明

为了方便用户快速编辑绘制物，Draw 中内置了一系列快捷键。

- ↩️ 回退：回退至上一次历史记录，默认使用 `command/ctrl + z`。
- ↪️ 重做：撤销上一次回退，默认使用 `command/ctrl + shift + z`。
- ❌ 删除：删除当前激活的绘制物，默认使用 `delete` 或 `backspace`。

用户可以选择关闭部分快捷键功能，或者自定义快捷键的按键。

除此之外，`L7Draw` 还提供了一些通过鼠标触发的快捷操作：

- ⭕ 删除结点：删除当前节点，仅支持在 `DrawLine` 和 `DrawPolygon` 中使用，默认在 `鼠标右键单击节点` 时触发。

## 示例

```tsx | pure
import { DrawPoint } from '@antv/l7-draw';

const drawer = new DrawPoint(scene, {
  keyboard: {
    revert: ['command + z', 'ctrl + z'], // 覆盖默认回退快捷键按键
    remove: false, // false表示关闭当前删除快捷键功能
  },
});

// 当前快捷键对应的回调方法，开发中可以手动调用

// 回退
drawer.revertHistory();

// 重做
drawer.redoHistory();

// 删除当前激活的绘制物
drawer.removeActiveFeature();
```

## 配置

| 名称   | 说明                 | 类型                      | 默认值                                        |
| ------ | -------------------- | ------------------------- | --------------------------------------------- |
| revert | 回退至上一次历史记录 | `string[]` &#124; `false` | `['command + z', 'ctrl + z']`                 |
| redo   | 撤销上一次回退       | `string[]` &#124; `false` | `['command + shift + z', 'ctrl + shift + z']` |
| remove | 删除当前激活的绘制物 | `string[]` &#124; `false` | `['del', 'backspace']`                        |
