import { Scene } from '@antv/l7';
import { DrawEvent, DrawLine } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [lineDrawer, setLineDrawer] = useState<DrawLine | null>(null);

  useEffect(() => {
    const scene = new Scene({
      id,
      map: new GaodeMapV2({
        center: [120.151634, 30.244831],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    scene.on('loaded', () => {
      const drawer = new DrawLine(scene, {});
      setLineDrawer(drawer);
      drawer.enable();

      // 监听添加LineString的事件
      drawer.on(DrawEvent.Add, (newLine, lineList) => {
        console.log('add', newLine, lineList);
      });

      // 监听编辑LineString(拖拽结束)的事件
      drawer.on(DrawEvent.Edit, (editLine, lineList) => {
        console.log('edit', editLine, lineList);
      });

      // 监听删除 LineString 的事件
      drawer.on(DrawEvent.Remove, (removePolygon, polygonList) => {
        console.log('remove', removePolygon, polygonList);
      });

      // 监听添加结点的事件
      drawer.on(DrawEvent.AddNode, (node, editLine, lineList) => {
        console.log('addNode', node, editLine, lineList);
      });

      // LineString数据发生变更时触发，等价于同时监听add和edit事件
      drawer.on(DrawEvent.Change, (lineList) => {
        console.log('change', lineList);
      });

      // 拖拽开始
      drawer.on(DrawEvent.DragStart, (editLine, lineList) => {
        console.log('dragStart', editLine, lineList);
      });

      // 拖拽中
      drawer.on(DrawEvent.Dragging, (editLine, lineList) => {
        console.log('dragging', editLine, lineList);
      });

      // 拖拽结束
      drawer.on(DrawEvent.DragEnd, (editLine, lineList) => {
        console.log('dragEnd', editLine, lineList);
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
