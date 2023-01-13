import { Scene } from '@antv/l7';
import { DrawEvent, DrawPoint } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [pointDrawer, setPointDrawer] = useState<DrawPoint | null>(null);

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
      const drawer = new DrawPoint(scene, {});
      setPointDrawer(drawer);
      drawer.enable();

      // 监听添加Point的事件
      drawer.on(DrawEvent.Add, (newPoint, pointList) => {
        console.log('add', newPoint, pointList);
      });

      // 监听编辑Point(拖拽结束)的事件
      drawer.on(DrawEvent.Edit, (editPoint, pointList) => {
        console.log('edit', editPoint, pointList);
      });

      // 删除 Point 的事件
      drawer.on(DrawEvent.Remove, (removePoint, pointList) => {
        console.log('remove', removePoint, pointList);
      });

      // Point数据发生变更时触发，等价于同时监听add和edit事件
      drawer.on(DrawEvent.Change, (pointList) => {
        console.log('change', pointList);
      });

      // 拖拽开始
      drawer.on(DrawEvent.DragStart, (editPoint, pointList) => {
        console.log('dragStart', editPoint, pointList);
      });

      // 拖拽中
      drawer.on(DrawEvent.Dragging, (editPoint, pointList) => {
        console.log('dragging', editPoint, pointList);
      });

      // 拖拽结束
      drawer.on(DrawEvent.DragEnd, (editPoint, pointList) => {
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
