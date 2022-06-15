---
title: 样式
order: 1
group:
  title: 配置
  order: 2
  path: /common
---

# 说明

图层样式主要分为六个类型：

- point：点
- line：实现
- polygon：面
- midPoint：中点
- dashLine：虚线
- text：文本

同时每种类型最多包含三种状态：

- normal：普通状态
- hover：悬停状态
- active：激活/绘制状态

Drawer 内部将根据不同的绘制物的类型和状态映射到对应的样式并进行渲染。

# 配置

在使用 Drawer 进行绘制过程中时，可以覆盖内置的图层样式。开发者只需要填写对应需要覆盖的单个项，在 Drawer 内部会对开发者传入的 style 和内置的默认 style 进行深覆盖，其余无需覆盖的样式可以无需填写。可参考以下示例：

```tsx | pure
// 覆盖主题色示例

import { CircleDrawer } from '@antv/l7-draw';

const overwriteColor = '#541DAB';
const drawer = new CircleDrawer(scene, {
  style: {
    point: {
      normal: {
        color: overwriteColor,
      },
      hover: {
        color: overwriteColor,
      },
      active: {
        color: overwriteColor,
      },
    },
    line: {
      normal: {
        color: overwriteColor,
      },
      hover: {
        color: overwriteColor,
      },
      active: {
        color: overwriteColor,
      },
    },
    polygon: {
      normal: {
        color: overwriteColor,
      },
      hover: {
        color: overwriteColor,
      },
      active: {
        color: overwriteColor,
      },
    },
    dashLine: {
      normal: {
        color: overwriteColor,
      },
    },
    midPoint: {
      normal: {
        color: overwriteColor,
      },
    },
    text: {
      normal: {
        color: overwriteColor,
      },
      active: {
        color: overwriteColor,
      },
    },
  },
});
```

# 默认值

```json
{
  "point": {
    "normal": {
      "color": "#ED9D48",
      "shape": "circle",
      "size": 6,
      "borderColor": "#ffffff",
      "borderWidth": 2
    },
    "hover": {
      "color": "#ED9D48",
      "shape": "circle",
      "size": 8,
      "borderColor": "#ffffff",
      "borderWidth": 2
    },
    "active": {
      "color": "#ED9D48",
      "shape": "circle",
      "size": 8,
      "borderColor": "#ffffff",
      "borderWidth": 2
    },
    "style": {}
  },
  "line": {
    "normal": {
      "color": "#1990FF",
      "size": 2
    },
    "hover": {
      "color": "#1990FF",
      "size": 2
    },
    "active": {
      "color": "#ED9D48",
      "size": 2
    },
    "style": {}
  },
  "polygon": {
    "normal": {
      "color": "#1990FF"
    },
    "hover": {
      "color": "#1990FF"
    },
    "active": {
      "color": "#ED9D48"
    },
    "style": {
      "opacity": 0.15
    }
  },
  "midPoint": {
    "normal": {
      "shape": "circle",
      "size": 6,
      "color": "#ED9D48",
      "borderColor": "#ffffff",
      "borderWidth": 0
    }
  },
  "dashLine": {
    "normal": {
      "color": "#ED9D48",
      "size": 2
    },
    "style": {
      "lineType": "dash",
      "dashArray": [6, 6]
    }
  },
  "text": {
    "normal": {
      "color": "#1990FF",
      "size": 12,
      "borderColor": "#ffffff",
      "borderWidth": 0.5
    },
    "active": {
      "color": "#ED9D48",
      "size": 12,
      "borderColor": "#ffffff",
      "borderWidth": 0.5
    },
    "style": {
      "fontWeight": "800",
      "textOffset": [0, 14],
      "textAllowOverlap": true
    }
  }
}
```
