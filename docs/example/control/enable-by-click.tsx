import { Scene } from '@antv/l7';
import { DrawControl } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import React, { useEffect } from 'react';
import { pointList } from '../point/mock';
import { lineList } from '../line/mock';
import { polygonList } from '../polygon/mock';

const id = String(Math.random());

const Demo: React.FC = () => {
  // const [circleDrawer, setCircleDrawer] = useState<DrawCircle | null>(null);

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
      const customBtn = document.createElement('button');
      customBtn.classList.add('l7-draw-control__btn');
      customBtn.innerText = '✅';
      // 实例化 DrawControl
      const drawControl = new DrawControl(scene, {
        drawConfig: {
          point: {
            initialData: pointList,
          },
          line: {
            initialData: lineList,
          },
          polygon: {
            initialData: polygonList,
          },
        },
      });

      // 将 Control 添加至地图中
      scene.addControl(drawControl);
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
