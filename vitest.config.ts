import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.spec.ts', '**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        'playground/',
        'tests/',
      ],
    },
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@hocuspocus/server': path.resolve(__dirname, './packages/server/src'),
      '@hocuspocus/provider': path.resolve(__dirname, './packages/provider/src'),
      '@hocuspocus/common': path.resolve(__dirname, './packages/common/src'),
    },
  },
});
