---
title: 样式
order: 1
group:
  title: 高级
  order: 2
  path: /super
---

## 说明

图层样式主要分为六个类型：

- point：顶点
- line：实线
- polygon：面
- midPoint：线段中点，点击即可新增顶点
- dashLine：虚线
- text：文本

同时每种类型最多包含三种状态：

- normal：普通状态
- hover：悬停状态
- active：激活/绘制状态

Drawer 内部将根据不同的绘制物的类型和状态映射到对应的样式并进行渲染。

除了三种状态以外，每种 style 类型还暴露了 L7 Layer 原生的构造器参数 [options](https://l7.antv.vision/zh/docs/api/base#options-%E9%85%8D%E7%BD%AE%E9%A1%B9) 和 [style](https://l7.antv.vision/zh/docs/api/base#style) 配置参数，同时开发者还可以使用 callback 回调方法，直接获取到 L7 Layer 的实例进行操作，详细的参数配置以[L7 官网](https://l7.antv.vision/zh/docs/api/base#options-%E9%85%8D%E7%BD%AE%E9%A1%B9)为准。

```tsx | pure
import { DrawCircle } from '@antv/l7-draw';
const drawer = new DrawCircle(scene, {
  style: {
    point: {
      // options会被传入L7 Layer的构造器参数中
      options: {
        zIndex: 10,
      },
      // style配置将被原生L7 Layer的style方法调用
      style: {
        opacity: 0.5,
      },
      callback: (layers) => {
        layers.forEach((layer) => {
          layer.style({
            opacity: 0.3,
          });
        });
      },

      // 其他配置
      normal: {
        color: '#ff0000',
      },
    },
  },
});
```

## 配置

在使用 Drawer 进行绘制过程中时，可以覆盖内置的图层样式。开发者只需要填写对应需要覆盖的单个项，在 Drawer 内部会对开发者传入的 style 和内置的默认 style 进行深覆盖，其余无需覆盖的样式可以无需填写。

```tsx | pure
// 覆盖主题色示例

import { DrawCircle } from '@antv/l7-draw';

const overwriteColor = '#541DAB';
const drawer = new DrawCircle(scene, {
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

## 默认值

```json
{
  "point": {
    "options": {
      "blend": "normal"
    },
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
    "options": {
      "blend": "normal"
    },
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
    "options": {
      "blend": "normal"
    },
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
    "options": {
      "blend": "normal"
    },
    "normal": {
      "shape": "circle",
      "size": 6,
      "color": "#ED9D48",
      "borderColor": "#ffffff",
      "borderWidth": 0
    }
  },
  "dashLine": {
    "options": {
      "blend": "normal"
    },
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
    "options": {
      "blend": "normal"
    },
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
