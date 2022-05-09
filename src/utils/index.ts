import { v4 } from 'uuid';
import {
  IAreaOptions,
  IBaseFeature,
  IDistanceOptions,
  ILineFeature,
  ILineProperties,
  ILngLat,
  IMidPointFeature,
  IPointFeature,
  IPointProperties,
  IPolygonFeature,
  IPolygonProperties,
  ITextFeature,
} from '../typings';
import {
  booleanClockwise,
  center,
  coordAll,
  distance,
  Feature,
  featureCollection,
  lineString,
  LineString,
  point,
  Point,
  Polygon,
  Position,
  Properties,
  rhumbBearing,
  transformTranslate,
  length,
  along,
  centerOfMass,
  area,
} from '@turf/turf';
import { debounce, first, isEqual, last } from 'lodash';

export const getUuid = (() => {
  let count = 1;
  // @ts-ignore
  const isDev = process.env.NODE_ENV === 'development';
  return (prefix = '') => {
    return `${prefix}-${isDev ? count++ : v4()}`;
  };
})();

export const isSameFeature = (
  feature1?: IBaseFeature | null,
  feature2?: IBaseFeature | null,
) => {
  return !!(
    feature1 &&
    feature2 &&
    feature1.properties?.id === feature2.properties?.id
  );
};

export const createLineString = (
  position: Position,
  properties: ILineProperties,
) => {
  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'LineString',
      coordinates: [position],
    },
  } as ILineFeature;
};

export const createPolygon = (
  position: Position,
  properties: IPolygonProperties,
) => {
  return {
    type: 'Feature',
    properties,
    geometry: {
      type: 'Polygon',
      coordinates: [[position, position]],
    },
  } as IPolygonFeature;
};

/**
 * 将polygonFeatures
 * @param feature
 */
export const syncPolygonNodes = (feature: IPolygonFeature) => {
  const nodes = feature.properties.nodes;
  const positions = coordAll(featureCollection(nodes));
  if (!feature.properties.isDraw) {
    const firstPosition = first(positions);
    if (!isEqual(firstPosition, last(positions))) {
      positions.push(firstPosition!);
    }
    const lineFeature = feature.properties.line;
    const lineNodes = lineFeature.properties.nodes;
    const firstLineNode = first(lineNodes);
    const lastLineNode = last(lineNodes);
    if (firstLineNode && lastLineNode && firstPosition) {
      firstLineNode.geometry.coordinates = lastLineNode.geometry.coordinates =
        firstPosition;
    }
    lineFeature.geometry.coordinates = coordAll(featureCollection(lineNodes));
  }

  feature.geometry.coordinates[0] = booleanClockwise(lineString(positions))
    ? positions
    : positions.reverse();
};

export const moveFeature = <F extends IBaseFeature>(
  feature: F,
  startLngLat: ILngLat,
  endLngLat: ILngLat,
) => {
  const { lng: lng1, lat: lat1 } = startLngLat;
  const { lng: lng2, lat: lat2 } = endLngLat;

  const startPoint = point([lng1, lat1]);
  const endPoint = point([lng2, lat2]);

  const between = distance(startPoint, endPoint, {
    units: 'meters',
  });

  const angle = rhumbBearing(startPoint, endPoint);

  // @ts-ignore
  return transformTranslate(feature, between, angle, {
    units: 'meters',
  }) as F;
};

export const moveFeatureList = <F extends IBaseFeature>(
  features: F[],
  startLngLat: ILngLat,
  endLngLat: ILngLat,
) => {
  return features.map((feature) =>
    moveFeature(feature, startLngLat, endLngLat),
  );
};

export const calcMidPointList = (feature: ILineFeature) => {
  const { nodes } = feature.properties;
  const midPointList: IMidPointFeature[] = [];
  for (let index = 0; index < nodes.length - 1; index++) {
    const newMidPoint = center(
      featureCollection([nodes[index], nodes[index + 1]]),
      {
        properties: {
          id: getUuid('midPoint'),
          startId: nodes[index].properties?.id ?? '',
          endId: nodes[index + 1].properties?.id ?? '',
        },
      },
    ) as IMidPointFeature;
    midPointList.push(newMidPoint);
  }
  return midPointList;
};

export const getLineCenterPoint = (feature: Feature<LineString>) => {
  const dis = length(feature, {
    units: 'meters',
  });
  return along(feature, dis / 2, {
    units: 'meters',
  });
};

export const calcDistanceText = (
  feature: Feature<LineString>,
  options: IDistanceOptions,
) => {
  const { format, total } = options;
  const textList: ITextFeature[] = [];
  if (total) {
    const text = getLineCenterPoint(feature) as ITextFeature;
    text.properties = {
      ...text.properties,
      text: format(
        length(feature, {
          units: 'meters',
        }),
      ),
    };
    textList.push(text);
  } else if (feature.geometry) {
    const { coordinates } = feature.geometry;
    for (let index = 0; index < coordinates.length - 1; index++) {
      const currentPoint = point(coordinates[index]);
      const nextPoint = point(coordinates[index + 1]);
      const meters = distance(currentPoint, nextPoint, {
        units: 'meters',
      });

      const text = center(featureCollection([currentPoint, nextPoint]), {
        properties: {
          text: format(meters),
        },
      }) as ITextFeature;
      textList.push(text);
    }
  }
  return textList;
};

export const calcAreaText = (
  feature: Feature<Polygon>,
  options: IAreaOptions,
) => {
  const { format } = options;
  return centerOfMass(feature, {
    // @ts-ignore
    text: format(area(feature)),
  }) as ITextFeature;
};

export const transformPointFeature = (
  feature: Feature<Point>,
  useDefault = false,
) => {
  const defaultProperties: IPointProperties = {
    id: getUuid('point'),
    isHover: false,
    isActive: false,
    isDrag: false,
    createTime: Date.now(),
  };
  feature.properties = useDefault
    ? defaultProperties
    : Object.assign(defaultProperties, feature.properties);
  return feature as IPointFeature;
};

export const transformLineFeature = (
  feature: Feature<LineString>,
  useDefault = false,
) => {
  const defaultProperties: ILineProperties = {
    id: getUuid('line'),
    isActive: false,
    isDrag: false,
    isDraw: false,
    isHover: false,
    nodes: [],
    createTime: Date.now(),
  };
  if (!feature.properties?.nodes?.length && feature.geometry) {
    defaultProperties.nodes = feature.geometry.coordinates.map(
      (position: Position) => {
        return transformPointFeature(point(position));
      },
    );
  }
  feature.properties = useDefault
    ? defaultProperties
    : Object.assign(defaultProperties, feature.properties);
  return feature as ILineFeature;
};

export const transformPolygonFeature = (
  feature: Feature<Polygon>,
  useDefault = false,
) => {
  // @ts-ignore
  const defaultProperties: IPolygonProperties = {
    id: getUuid('polygon'),
    isHover: false,
    isActive: false,
    isDrag: false,
    isDraw: false,
    createTime: Date.now(),
  };
  if (!feature.properties?.line) {
    defaultProperties.line = transformLineFeature(
      lineString(coordAll(feature)),
    );
    defaultProperties.line.properties.isActive = !!feature.properties?.isActive;
  }
  if (!feature.properties?.nodes?.length) {
    defaultProperties.nodes = defaultProperties.line.properties.nodes ?? [];
  }
  feature.properties = useDefault
    ? defaultProperties
    : Object.assign(defaultProperties, feature.properties);
  return feature as IPolygonFeature;
};
