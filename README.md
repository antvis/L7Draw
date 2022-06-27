# L7Draw

> 基于 [L7](https://l7.antv.vision/zh) 封装的地理绘制库

[![npm Version](https://img.shields.io/npm/v/@antv/l7-draw.svg)](https://www.npmjs.com/package/@antv/l7-draw) [![npm Download](https://img.shields.io/npm/dm/@antv/l7-draw.svg)](https://www.npmjs.com/package/@antv/l7-draw) ![Status](https://badgen.net/github/status/antvis/l7-draw) [![Percentage of issues still open](http://isitmaintained.com/badge/open/antvis/l7-draw.svg)](http://isitmaintained.com/project/antvis/l7-draw 'Percentage of issues still open') [![Average time to resolve an issue](http://isitmaintained.com/badge/resolution/antvis/l7-draw.svg)](http://isitmaintained.com/project/antvis/l7-draw 'Average time to resolve an issue')

## 📚 文档

[文档](https://antv.vision/l7-draw-2.0-site/docs/draw/point)

[示例](https://antv.vision/l7-draw-2.0-site/example/point/start)

## 📦 安装

```bash
npm install @antv/l7-draw
```

## 🔨 使用

```tsx | pure
// ----js-----
import { GaodeMap, Scene } from '@antv/l7';
import { DrawEvent, DrawPoint } from '@antv/l7-draw';

const scene = new Scene({
  id: 'map',
  map: new GaodeMap({}),
});

scene.on('loaded', () => {
  // 实例化 Draw
  const draw = new DrawPoint(scene, {
    editable: false,
    // Draw 配置
  });

  // 调用 Draw 上的方法
  draw.enable();

  // 监听 Draw 的事件
  draw.on(DrawEvent.add, (newPoint) => {
    console.log(newPoint);
  });
});

// ----html----
<div id="map"></div>;
```

## ⌨️ 本地开发

```bash
# 安装依赖
npm install

# 运行页面
npm run start

# 打包
npm run build
```

## 🤝 如何贡献

如果您在使用的过程中碰到问题，可以先通过 [issues](https://github.com/antvis/l7-draw/issues) 看看有没有类似的 bug 或者建议。

## 📖 许可证

MIT@[AntV](https://github.com/antvis).
