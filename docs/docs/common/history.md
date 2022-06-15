---
title: 回退/重做
order: 2
group:
  title: 通用配置
  order: 2
  path: /common
---

# 说明

在使用 Drawer 绘制时，**默认支持进行回退和重做操作**，默认分别通过快捷键 `ctrl/command + z` 和 `ctrl/command + shift + z` 来触发，也可以通过调用 Drawer 实例中的方法 `revertHistory` 和 `redoHistory`来手动触发回退/重做操作。

用户在进行绘制的过程中，Drawer 内部会自动将主要操作（创建、编辑、拖拽、新增点等）后的绘制数据备份在历史记录中，回退/重做的操作就是基于查询历史记录中对应数据实现的。

# 示例

回退/重做的配置是在各个 Drawer 的 history 字段来进行配置的

```tsx | pure
import { PointDrawer } from '@antv/l7-draw';

const drawer = new PointDrawer(scene, {
  history: {
    maxSize: 100,
    revertKeys: ['command+z', 'ctrl+z'],
    redoKeys: ['command+shift+z', 'ctrl+shift+z'],
  },
  // 传false表示关闭重做和回退操作
  // history: false,
});

// 手动调用回退方法
drawer.revertHistory();
```

# 配置

| 名称       | 说明                                                                                                       | 类型     | 默认值                              |
| ---------- | ---------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------- |
| maxSize    | 保存历史记录的最大个数，超出时则把最早的记录剔除                                                           | number   | 100                                 |
| revertKeys | 回退操作对应的快捷键，其中每组快捷键的具体配置方法可以参照 [Mousetrap 文档](https://craig.is/killing/mice) | string[] | ['command+z', 'ctrl+z']             |
| redoKeys   | 重做操作对应的快捷键，其中每组快捷键的具体配置方法可以参照 [Mousetrap 文档](https://craig.is/killing/mice) | string[] | ['command+shift+z', 'ctrl+shift+z'] |

# 方法

| 名称               | 说明                                                     | 类型       |
| ------------------ | -------------------------------------------------------- | ---------- |
| revertHistory      | 回退至上一次保存的历史记录                               | () => void |
| redoHistoryHistory | 返回至上一次回退前的历史记录                             | () => void |
| saveHistory        | 保存当前绘制数据至历史记录，一般情况下无需开发者手动调用 | () => void |
