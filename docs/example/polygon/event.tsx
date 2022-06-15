import { Scene } from '@antv/l7';
import { DrawerEvent, PolygonDrawer } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [polygonDrawer, setPolygonDrawer] = useState<PolygonDrawer | null>(
    null,
  );

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
      const drawer = new PolygonDrawer(scene, {});
      setPolygonDrawer(drawer);
      drawer.enable();

      // 监听添加Polygon的事件
      drawer.on(DrawerEvent.add, (newPolygon, polygonList) => {
        console.log('add', newPolygon, polygonList);
      });

      // 监听编辑Polygon(拖拽结束)的事件
      drawer.on(DrawerEvent.edit, (editPolygon, polygonList) => {
        console.log('edit', editPolygon, polygonList);
      });

      // 监听添加结点的事件
      drawer.on(DrawerEvent.addNode, (node, editPoint, polygonList) => {
        console.log('addNode', node, editPoint, polygonList);
      });

      // Polygon数据发生变更时触发，等价于同时监听add和edit事件
      drawer.on(DrawerEvent.change, (polygonList) => {
        console.log('change', polygonList);
      });

      // 拖拽开始
      drawer.on(DrawerEvent.dragStart, (editPolygon, polygonList) => {
        console.log('dragStart', editPolygon, polygonList);
      });

      // 拖拽中
      drawer.on(DrawerEvent.dragging, (editPolygon, polygonList) => {
        console.log('dragging', editPolygon, polygonList);
      });

      // 拖拽结束
      drawer.on(DrawerEvent.dragEnd, (editPolygon, polygonList) => {
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
