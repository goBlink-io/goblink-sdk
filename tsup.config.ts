import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
  },
  {
    entry: { 'widget/index': 'src/widget/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    external: ['react', 'react-dom'],
  },
]);
