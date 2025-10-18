// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // (optional) use Jest-like globals like `describe`, `test`, etc.
    environment: 'node', // 'node' or 'jsdom' depending on your project
    // setupFiles: ['./vitest.setup.ts'], // optional setup file
    exclude: ['src/bin', 'node_modules', 'dist'], // exclude specific test paths
  },
});
