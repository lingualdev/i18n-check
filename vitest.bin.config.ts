// vitest.config.ts
import { defineConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default defineConfig({
  ...baseConfig,
  test: {
    exclude: ['node_modules', 'dist'],
  },
});
