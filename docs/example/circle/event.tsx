import { Scene } from '@antv/l7';
import { DrawCircle, DrawEvent } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [circleDrawer, setCircleDrawer] = useState<DrawCircle | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMap({
        center: [120.151634, 30.244831],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new DrawCircle(scene, {});
      setCircleDrawer(drawer);
      drawer.enable();

      // 监听添加Polygon的事件
      drawer.on(DrawEvent.Add, (newPolygon, polygonList) => {
        console.log('add', newPolygon, polygonList);
      });

      // 监听编辑Polygon(拖拽结束)的事件
      drawer.on(DrawEvent.Edit, (editPolygon, polygonList) => {
        console.log('edit', editPolygon, polygonList);
      });

      // 监听删除 Polygon 的事件
      drawer.on(DrawEvent.Remove, (removePolygon, polygonList) => {
        console.log('remove', removePolygon, polygonList);
      });

      // Polygon数据发生变更时触发，等价于同时监听add和edit事件
      drawer.on(DrawEvent.Change, (polygonList) => {
        console.log('change', polygonList);
      });

      // 拖拽开始
      drawer.on(DrawEvent.DragStart, (editPolygon, polygonList) => {
        console.log('dragStart', editPolygon, polygonList);
      });

      // 拖拽中
      drawer.on(DrawEvent.Dragging, (editPolygon, polygonList) => {
        console.log('dragging', editPolygon, polygonList);
      });

      // 拖拽结束
      drawer.on(DrawEvent.DragEnd, (editPolygon, polygonList) => {
        console.log('dragEnd', editPolygon, polygonList);
      });
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
