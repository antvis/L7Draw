import { Scene } from '@antv/l7';
import { DrawControl, ControlEvent } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import React, { useEffect } from 'react';

const id = String(Math.random());

const Demo: React.FC = () => {
  // const [circleDrawer, setCircleDrawer] = useState<DrawCircle | null>(null);

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
      // 实例化 DrawControl
      const drawControl = new DrawControl(scene, {
        defaultActiveType: 'point',
      });

      // 将 Control 添加至地图中
      scene.addControl(drawControl);

      drawControl.on(ControlEvent.DrawChange, (newType) => {
        console.log('当前激活的绘制发生更改', newType);
      });

      drawControl.on(ControlEvent.DataChange, (newData) => {
        console.log('当前绘制数据发生更改', newData);
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
