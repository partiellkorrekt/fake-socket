import multiInput from 'rollup-plugin-multi-input'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import autoExternal from 'rollup-plugin-auto-external'

export default {
  input: ['src/server.ts', 'src/client.ts'],
  plugins: [
    multiInput(),
    commonjs(),
    autoExternal({
      dependencies: false
    }),
    resolve(),
    typescript(),
    terser()
  ],
  output: {
    dir: 'dist',
    format: 'cjs',
    exports: 'auto'
  }
}
