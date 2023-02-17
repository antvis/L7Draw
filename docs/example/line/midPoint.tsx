import { Scene } from '@antv/l7';
import { DrawLine } from '@antv/l7-draw';
import { GaodeMap } from '@antv/l7-maps';
import { cloneDeep } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { lineList } from './mock';

const id = String(Math.random());

const Demo: React.FC = () => {
  const [lineDrawer, setLineDrawer] = useState<DrawLine | null>(null);

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

    const line = cloneDeep(lineList);

    if (line[0].properties) {
      line[0].properties.isActive = true;
    }

    scene.on('loaded', () => {
      const drawer = new DrawLine(scene, {
        showMidPoint: false,
        initialData: line,
      });
      setLineDrawer(drawer);
      drawer.enable();
    });
  }, []);

  return (
    <div>
      <div id={id} style={{ height: 400, position: 'relative' }} />
    </div>
  );
};

export default Demo;
