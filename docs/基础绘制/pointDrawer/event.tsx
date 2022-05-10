import React, { useEffect, useState } from 'react';
import { Scene } from '@antv/l7';
import { GaodeMapV2 } from '@antv/l7-maps';
import { DrawerEvent, PointDrawer } from '@antv/l7-draw';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<PointDrawer | null>(null);

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
      const drawer = new PointDrawer(scene, {});
      setPointDrawer(drawer);
      drawer.enable();

      // 监听添加Point的事件
      drawer.on(DrawerEvent.add, (newPoint, pointList) => {
        console.log('add', newPoint, pointList);
      });

      // 监听编辑Point(拖拽结束)的事件
      drawer.on(DrawerEvent.edit, (editPoint, pointList) => {
        console.log('edit', editPoint, pointList);
      });

      // Point数据发生变更时触发，等价于同时监听add和edit事件
      drawer.on(DrawerEvent.change, (pointList) => {
        console.log('change', pointList);
      });

      // 拖拽开始
      drawer.on(DrawerEvent.dragStart, (editPoint, pointList) => {
        console.log('dragStart', editPoint, pointList);
      });

      // 拖拽中
      drawer.on(DrawerEvent.dragging, (editPoint, pointList) => {
        console.log('dragging', editPoint, pointList);
      });

      // 拖拽结束
      drawer.on(DrawerEvent.dragEnd, (editPoint, pointList) => {
        console.log('dragEnd', editPoint, pointList);
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
