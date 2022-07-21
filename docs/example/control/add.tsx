import { Scene } from '@antv/l7';
import { DrawControl } from '@antv/l7-draw';
import { GaodeMapV2 } from '@antv/l7-maps';
import React, { useEffect, useState } from 'react';
import { Button } from 'antd';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [scene, setScene] = useState<Scene | null>(null);
  const [drawControl, setDrawControl] = useState<DrawControl | null>(null);

  useEffect(() => {
    const newScene = new Scene({
      id,
      map: new GaodeMapV2({
        center: [120.151634, 30.244831],
        pitch: 0,
        style: 'dark',
        zoom: 10,
      }),
    });
    newScene.on('loaded', () => {
      setScene(newScene);
    });
  }, []);

  /**
   * 添加 DrawControl
   */
  const onAdd = () => {
    if (!scene) {
      return;
    }
    // 实例化 DrawControl
    const newDrawControl = new DrawControl(scene, {});
    // 将 Control 添加至地图中
    scene.addControl(newDrawControl);
    setDrawControl(newDrawControl);
  };

  /**
   * 移除 DrawControl
   */
  const onRemove = () => {
    if (!scene || !drawControl) {
      return;
    }
    scene.removeControl(drawControl);
  };

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <Button style={{ marginRight: 6 }} onClick={onAdd}>
          添加 Control
        </Button>
        <Button onClick={onRemove}>移除 Control</Button>
      </div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
