export default {
  esm: 'babel',
  cjs: 'babel',
  umd: {
    name: 'L7.Draw',
    file: 'l7-draw',
    sourcemap: true,
    globals: {
      '@antv/l7': 'L7',
    },
  },
  lessInBabelMode: true,
};
