import { defineConfig } from 'tsdown';

export default defineConfig({
  dts: false,
  exports: true,
  format: 'esm',
  target: 'node18',
  platform: 'node',
});
