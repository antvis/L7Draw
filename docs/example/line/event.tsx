import {Scene} from '@antv/l7';
import {DrawerEvent, LineDrawer} from '@antv/l7-draw';
import {GaodeMapV2} from '@antv/l7-maps';
import React, {useEffect, useState} from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [lineDrawer, setLineDrawer] = useState<LineDrawer | null>(null);

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
      const drawer = new LineDrawer(scene, {});
      setLineDrawer(drawer);
      drawer.enable();

      // 监听添加Point的事件
      drawer.on(DrawerEvent.add, (newPoint, lineList) => {
        console.log('add', newPoint, lineList);
      });

      // 监听编辑Point(拖拽结束)的事件
      drawer.on(DrawerEvent.edit, (editPoint, lineList) => {
        console.log('edit', editPoint, lineList);
      });

      // 监听添加结点的事件
      drawer.on(DrawerEvent.addNode, (node, editPoint, lineList) => {
        console.log('addNode', node, editPoint, lineList);
      });

      // Point数据发生变更时触发，等价于同时监听add和edit事件
      drawer.on(DrawerEvent.change, (lineList) => {
        console.log('change', lineList);
      });

      // 拖拽开始
      drawer.on(DrawerEvent.dragStart, (editPoint, lineList) => {
        console.log('dragStart', editPoint, lineList);
      });

      // 拖拽中
      drawer.on(DrawerEvent.dragging, (editPoint, lineList) => {
        console.log('dragging', editPoint, lineList);
      });

      // 拖拽结束
      drawer.on(DrawerEvent.dragEnd, (editPoint, lineList) => {
        console.log('dragEnd', editPoint, lineList);
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
