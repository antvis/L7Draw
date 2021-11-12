---
title: 绘制工具
order: 3
---

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

#### DrawRuler

测距工具

```javascript
import { DrawRuler } from '@antv/l7-draw';
const drawPoint = new DrawPolygon(scene);
drawPoint.enable();
```

### DrawBoxSelect 框选工具

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

#### draw.boxselect

框选结束时触发，返回开始和结束的顶点信息

```javascript
drawControl.on('draw.boxselect', e => {});
```
