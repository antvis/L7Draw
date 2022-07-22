import { Point, Scene } from '@antv/l7';
import { Position,polygon,lineString, point, booleanPointInPolygon,nearestPointOnLine,distance } from '@turf/turf';
import { ILayerMouseEvent, ILngLat, IPolygonFeature, ISceneMouseEvent } from '../typings';

// @ts-ignore
export const isDev = process.env.NODE_ENV === 'development';

/**
 * 获取完全覆盖地图区域的DOM，会根据地图类型返回不同的结果
 * @param scene
 */
export const getMapDom = (scene: Scene): HTMLDivElement | null => {
  const container = scene.getContainer();
  return (
    container?.querySelector('.l7-marker-container') ??
    container?.querySelector('.amap-maps') ??
    null
  );
};

/**
 * 磨平L7 Scene 鼠标事件返回的经纬度差异
 * @param e
 */
export const getLngLat = (e: ISceneMouseEvent | ILayerMouseEvent) => {
  // @ts-ignore
  return e.lngLat || e.lnglat;
};

export const getPosition: (
  e: ISceneMouseEvent | ILayerMouseEvent,
) => Position = (e) => {
  const { lng, lat } = getLngLat(e);
  return [lng, lat];
};

export const getPiex = (e: ISceneMouseEvent | ILayerMouseEvent) => {
  // @ts-ignore
  return e.pixel || e.pixel;
};
export const getPiexPosition: (
  e: ISceneMouseEvent | ILayerMouseEvent,
) => Position = (e) => {
  const { x,y } = getPiex(e);
  return [x, y];
};

//根据已有的Features,鼠标的屏幕坐标、地理坐标 获取范围内的吸附点
export const getSnap: ( pixeP:Position,trueP:Position,snapFeatures:IPolygonFeature[],scene:Scene)=>Position=(pixeP,tureP,snapFeatures,scene)=> {
  const x=pixeP[0],y=pixeP[1]
  const n=20
  const area:Position[]=[[x-n,y+n],[x+n,y+n],[x+n,y-n],[x-n,y-n],[x-n,y+n]].map(item=>{
      const p:Point=[item[0],item[1]]
      const lnglat=scene.containerToLngLat(p)
    return transLngLat2Position(lnglat)
   })

  const bounds=polygon([area])
 
 
  let position:Position=tureP, minDistance = Infinity
  snapFeatures.forEach(item => {
      if (item.geometry.type === 'Polygon') {
          item.geometry.coordinates.forEach(coor => {
              let Points = []
              let line = lineString(coor)
              for (let i = 0; i < coor.length - 1; i++) {
                  Points.push(coor[i])
              }
             Points = Points.filter(p => {
              return booleanPointInPolygon(point(p),bounds)
             })
             // console.log(Points)
              if (Points.length > 0) {
                  Points.forEach(p => {
                      const from = point(tureP);
                      const to = point(p);
                      const dis = distance(from, to)
                      if (dis < minDistance) {
                          minDistance = dis
                          position = p
                          //console.log('吸附已执行')
                      }
                  })
              } else {
                  //求点到直线的最短距离的对应点
                  let snapped = nearestPointOnLine(line, point(tureP),)
                  //console.log(snapped.properties.dist*1000)
                  if (booleanPointInPolygon(snapped.geometry.coordinates,bounds)) {
                      position = snapped.geometry.coordinates
                      //console.log('吸附已执行')
                  }

              }
          })
      }

  })
  //console.log('吸附坐标',position)
  return position
  
}

/**
 * 将lnglat转换为position格式
 * @param lng
 * @param lat
 */
export const transLngLat2Position: (lngLat: ILngLat) => Position = ({
  lng,
  lat,
}) => [lng, lat];
