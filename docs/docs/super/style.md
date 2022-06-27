---
title: 样式
order: 1
group:
  title: 高级
  order: 2
  path: /super
---

## 说明

在 Draw 的构造器中支持传递 `style` 参数，对绘制过程中的图层样式进行自定义，当前 Draw 已经内置了一套 [默认样式配置](#默认值)，开发者可以通过 `style` 配置，基于默认样式配置进行深覆盖。

_后期 Draw 会内置几套绘制主题，以适应不同底图样式下的绘制呈现效果。_

## 示例

在使用 Draw 进行绘制过程中时，可以覆盖内置的图层样式。开发者只需要填写对应需要覆盖的单个项，在 Draw 内部会对开发者传入的 style 和内置的默认 style 进行深覆盖，其余无需覆盖的样式可以无需填写。

```tsx | pure
// 覆盖主题色示例

import { DrawPoint } from '@antv/l7-draw';

const overwriteColor = '#541DAB';

const drawer = new DrawPoint(scene, {
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
      // 使用回调函数，取到原生 L7 Layer 实例，进行操作
      callback: (layers) => {
        layers.forEach((layer) => {
          layer.style({
            opacity: 0.3,
          });
        });
      },

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
  },
});
```

## 配置

绘制样式的描述对象主要分为以下六个类型：

- [point](#point)：结点，即作为 `DrawPoint` 中点的样式，也作为其他几类 Draw 中结点的样式。
- [line](#line)：实线，即作为 `DrawLine` 中线的样式，也作为其他几类面 Draw 中边框的样式。
- [polygon](#polygon)：多边形/面。
- [midPoint](#midpoint)：线段中点，点击即可新增顶点。
- [dashLine](#dashline)：虚线，一般在绘制过程中呈现。
- [text](#text)：文本，一般用于表示距离和面积文案。

每个样式类型最多包含三种状态，Draw 内部将根据各个类型的样式类型和其状态配置并进行渲染图层：

- normal：普通状态，即默认/失焦状态。
- hover：悬停状态，默认配置下，只有 point 结点类型中的 `hover` 态样式与 `normal` 态样式不同。
- active：激活状态，同时包含绘制状态和编辑状态。

除了以上三种状态以外，每个样式类型还暴露了 L7 Layer 原生的构造器参数 [options](https://l7.antv.vision/zh/docs/api/base#options-%E9%85%8D%E7%BD%AE%E9%A1%B9) 和 [style](https://l7.antv.vision/zh/docs/api/base#style) 配置参数。

并且还提供了 `callback` 回调方法，直接让开发者获取到 L7 的 Layer 的实例数组，并基于 L7 原生的图层操作方式自定义图层，详细的参数配置以 [L7 官网](https://l7.antv.vision/zh/docs/api/base#options-%E9%85%8D%E7%BD%AE%E9%A1%B9)为准。

```ts
import { ILayer, ILayerConfig } from '@antv/l7';

// 每个样式描述对象的基础类型
export interface IBaseStyle {
  options: Partial<ILayerConfig>;
  style: any;
  callback: (layers: ILayer[]) => void;
}

// .....各个样式对象的类型定义

// 整个 style 配置的类型定义
export interface IStyle {
  point: IPointStyle;
  line: ILineStyle;
  polygon: IPolygonStyle;
  midPoint: IMidPointStyle;
  dashLine: IDashLineStyle;
  text: ITextStyle;
}
```

### point

```ts
export interface IPointStyleItem {
  color: string; // 填充色
  shape: string; // 形状
  size: number; // 大小
  borderWidth: number; // 边框宽度
  borderColor: string; // 边框颜色
}

export interface IPointStyle extends IBaseStyle {
  normal: IPointStyleItem;
  hover: IPointStyleItem;
  active: IPointStyleItem;
}
```

### line

```ts
export interface ILineStyleItem {
  color: string; // 填充色
  size: number; // 大小
}

export interface ILineStyle extends IBaseStyle {
  normal: ILineStyleItem;
  hover: ILineStyleItem;
  active: ILineStyleItem;
}
```

### polygon

```ts
export interface IPolygonItem {
  color: string; // 填充色
}

export interface IPointStyle extends IBaseStyle {
  normal: IPolygonItem;
  hover: IPolygonItem;
  active: IPolygonItem;
}
```

### midPoint

```ts
// 和 point 中的 IPointStyleItem 相同
export interface IPointStyleItem {
  color: string; // 填充色
  shape: string; // 形状
  size: number; // 大小
  borderWidth: number; // 边框宽度
  borderColor: string; // 边框颜色
}

export interface IMidPointStyle extends IBaseStyle {
  normal: IPointStyleItem;
}
```

### dashLine

```ts
// 和 line 中的 ILineStyleItem 相同
export interface ILineStyleItem {
  color: string; // 填充色
  size: number; // 大小
}

export interface IDashLineStyle extends IBaseStyle {
  normal: ILineStyleItem;
}
```

### text

```ts
// 文本的 shape 只能是 'text'
export interface ITextStyleItem extends Omit<IPointStyleItem, 'shape'> {}

export interface ITextStyle extends IBaseStyle {
  normal: IPointStyleItem;
  active: IPointStyleItem;
}
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
