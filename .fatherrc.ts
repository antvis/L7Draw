import commonjs from '@rollup/plugin-commonjs';
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
  extraRollupPlugins: [
    commonjs({
      namedExports: {
        eventemitter3: ['EventEmitter'],
      },
    }),
  ],
};
