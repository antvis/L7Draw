---
title: API
order: 3
---

### 参数

```javascript
const control = new DrawControl(scene, option);
```

#### scene

scene 对象

#### options

control 配置项

| name     | Type                                          | Default    | Description                     |
| -------- | --------------------------------------------- | ---------- | ------------------------------- |
| position | `bottomright、topright、 bottomleft’ topleft` | `topright` | 组件位置                        |
| layout   | `horizontal、 vertical`                       | `vertical` | 组件布局 支持水平和垂直两种布局 |
| controls | `controlOptions`                              |            | 设置 UI 组件添加哪些绘制工具    |
| style    |                                               |            | 地图绘制样式                    |

**controlOptions**
UI 组件配置项

- point `boolean | drawOption` 绘制点工具配置
- line `boolean | drawOption` 绘制线工具配置
- polygon `boolean | drawOption` 绘制面工具配置
- circle `boolean | drawOption` 绘制圆工具配置
- rect `boolean | drawOption` 绘制矩形工具配置
- delete `boolean | drawOption` 添加删除工具
- ruler `boolean` 测距工具

默认配置

```js
  {
    point: true,
    line: true,
    polygon: true,
    rect: true,
    circle: true,
    delete: true
  }
```

### 添加到地图

```javascript
scene.addControl(control);
```

### 从地图中移除

```javascript
scene.removeControl(control);
```

### Draw Type

可以不依赖 Draw UI 组件，独立的使用每一个 Draw

#### DrawCircle

绘制圆形

```javascript
import { DrawCircle } from '@antv/l7-draw';
const drawCircle = new DrawCircle(scene);
drawCircle.enable();
```

#### DrawRect

绘制四边形

```javascript
import { DrawRect } from '@antv/l7-draw';
const drawRect = new DrawRect(scene);
drawRect.enable();
```

#### DrawLine

绘制路径

```javascript
import { DrawLine } from '@antv/l7-draw';
const drawLine = new DrawLine(scene);
drawLine.enable();
```

#### DrawPoint

绘制点

```javascript
import { DrawPoint } from '@antv/l7-draw';
const drawPoint = new DrawPoint(scene);
drawPoint.enable();
```

#### DrawPolygon

绘制多边形

```javascript
import { DrawPolygon } from '@antv/l7-draw';
const drawPoint = new DrawPolygon(scene);
drawPoint.enable();
```

### 配置项 DrawOption

- editEnable `boolean` 是否允许编辑
- selectEnable `boolean` 是否允许选中
- data `geojson` 传入数据
- showFeature `boolean` 绘制完成是否显绘制结果
- showDistance `boolean` 是否显示绘制距离 默认关闭

### 属性

#### drawStatus

绘制状态的状态

### 方法

#### enable

开始编辑，绘制完成之后会自动结束。

#### disable

结束编辑

#### removeLatestVertex

移除最新绘制的点
目前绘制线和面支持

#### resetDraw

重置绘制 Draw,清除已有绘制，并重新绘制

### 事件

### draw.modechange

绘制状态变化事件

- static 显示太
- simple_select 选中太
- direct_select 编辑态

#### draw.create

绘制完成时触发该事件

#### draw.delete

图形删除时触发该事件

#### draw.update

图形更新时触发该事件，图形的平移，顶点的编辑
