import { Scene } from '@antv/l7';
import { CircleDrawer, DrawerEvent } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [circleDrawer, setCircleDrawer] = useState<CircleDrawer | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMapV2({
        center: [120.13858795166014, 30.247204606534158],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new CircleDrawer(scene, {});
      setCircleDrawer(drawer);
      drawer.enable();

      // 监听添加Polygon的事件
      drawer.on(DrawerEvent.add, (newPolygon, PolygonList) => {
        console.log('add', newPolygon, PolygonList);
      });

      // 监听编辑Polygon(拖拽结束)的事件
      drawer.on(DrawerEvent.edit, (editPolygon, PolygonList) => {
        console.log('edit', editPolygon, PolygonList);
      });

      // Polygon数据发生变更时触发，等价于同时监听add和edit事件
      drawer.on(DrawerEvent.change, (PolygonList) => {
        console.log('change', PolygonList);
      });

      // 拖拽开始
      drawer.on(DrawerEvent.dragStart, (editPolygon, PolygonList) => {
        console.log('dragStart', editPolygon, PolygonList);
      });

      // 拖拽中
      drawer.on(DrawerEvent.dragging, (editPolygon, PolygonList) => {
        console.log('dragging', editPolygon, PolygonList);
      });

      // 拖拽结束
      drawer.on(DrawerEvent.dragEnd, (editPolygon, PolygonList) => {
        console.log('dragEnd', editPolygon, PolygonList);
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
