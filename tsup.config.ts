import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs'],
  minify: true,
  sourcemap: true,
  target: 'es2020',
});
