import typescript from 'rollup-plugin-typescript';
import babel from 'rollup-plugin-babel';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
  entry: './src/main.ts',
  sourceMap: true,
  output: {
    file: './dist/tree.js',
    format: 'cjs'
  },
  plugins: [
    typescript(),
    babel(),
    sourcemaps()
  ]
}