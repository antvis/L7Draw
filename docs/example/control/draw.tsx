import { Scene } from '@antv/l7';
import { DrawControl } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import React, { useEffect } from 'react';

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
      // 实例化 DrawControl
      const drawControl = new DrawControl(scene, {
        defaultActiveType: 'point',
        drawConfig: {
          // 支持设置展示的绘制按钮，并传入绘制类实例化时的 options
          point: {
            autoActive: false,
            editable: false,
            style: {
              point: {
                normal: {
                  color: '#6F17FF',
                },
              },
            },
          },
          clear: true,
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
