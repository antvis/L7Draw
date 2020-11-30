import commonjs from '@rollup/plugin-commonjs';
import url from 'rollup-plugin-url';
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
  extraRollupPlugins: [
    url({
      limit: 10 * 1024, // inline files < 10k, copy files > 10k
      // include: ["**/*.svg"], // defaults to .svg, .png, .jpg and .gif files
      emitFiles: true, // defaults to true
    }),
    commonjs({
      namedExports: {
        eventemitter3: ['EventEmitter'],
      },
    }),
  ],
};
