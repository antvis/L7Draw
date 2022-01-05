const LayerStyles = {
  boxSelect: {
    polygon: {
      shape: 'fill',
      color: '#black',
      style: {
        stroke: 'black',
        strokeWidth: 1,
        strokeOpacity: 1,
        lineType: 'dash',
        dashArray: [1, 1],
      },
      zIndex: 0,
    },
  },

  active: {
    point: {
      type: 'PointLayer',
      shape: 'circle',
      color: '#fbb03b',
      size: 5,
      style: {
        stroke: '#fff',
        strokeWidth: 2,
      },
      zIndex: 0,
    },
    line: {
      type: 'LineLayer',
      shape: 'line',
      color: '#fbb03b',
      size: 1,
      style: {
        opacity: 1,
        lineType: 'dash',
        dashArray: [2, 2],
      },
      zIndex: 0,
    },
    polygon: {
      shape: 'fill',
      color: '#fbb03b',
      style: {
        opacity: 0.1,
        stroke: '#fbb03b',
        strokeWidth: 1,
        strokeOpacity: 1,
        lineType: 'dash',
        dashArray: [2, 2],
      },
      zIndex: 0,
    },
  },
  normal: {
    polygon: {
      type: 'PolygonLayer',
      shape: 'fill',
      color: '#3bb2d0',
      style: {
        opacity: 0.1,
        stroke: '#3bb2d0',
        strokeWidth: 1,
        strokeOpacity: 1,
        lineType: 'solid',
        dashArray: [2, 2],
      },
      zIndex: 0,
    },
    line: {
      type: 'LineLayer',
      shape: 'line',
      size: 1,
      color: '#3bb2d0',
      style: {
        opacity: 1,
      },
      zIndex: 0,
    },
    point: {
      type: 'PointLayer',
      shape: 'circle',
      color: '#3bb2d0',
      size: 3,
      style: {
        stroke: '#fff',
        strokeWidth: 2,
      },
      zIndex: 0,
    },
  },
  normal_point: {
    type: 'PointLayer',
    shape: 'circle',
    color: '#3bb2d0',
    size: 3,
    style: {
      stroke: '#fff',
      strokeWidth: 2,
    },
    zIndex: 0,
  },
  mid_point: {
    point: {
      type: 'PointLayer',
      shape: 'circle',
      color: '#fbb03b',
      size: 3,
      style: {},
      zIndex: 0,
    },
  },

  ruler: {
    polygon: {
      type: 'PolygonLayer',
      shape: 'fill',
      active: { color: '#FB93FF' },
      color: '#883BF2',
      style: {
        opacity: 0.1,
        stroke: '#883BF2',
        strokeWidth: 1,
        strokeOpacity: 1,
        lineType: 'solid',
        dashArray: [2, 2],
      },
      zIndex: 0,
    },
    line: {
      type: 'LineLayer',
      shape: 'line',
      size: 1,
      color: '#883BF2',
      active: { color: '#FB93FF' },
      style: {
        stroke: '#883BF2',
        strokeWidth: 1,
        strokeOpacity: 1,
        lineType: 'solid',
      },
      zIndex: 0,
    },
    point: {
      type: 'PointLayer',
      shape: 'circle',
      color: '#883BF2',
      size: 3,
      style: {
        stroke: '#fff',
        strokeWidth: 2,
      },
      zIndex: 0,
    },
  },
};

export default LayerStyles;
