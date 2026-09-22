///////////////////////////////////////////////////////////////////////////////
// 🛑 CRITICAL: SYSTEM-GENERATED FILE - DO NOT MODIFY DIRECTLY
//
// ANY MANUAL CHANGES MADE TO THIS FILE WILL BE WIPED ON THE NEXT 'tilt up'.
// TO MODIFY THIS CONFIGURATION:
// 1. Edit the source generator in: .tilt/topologies/
// 2. Or update service.json
//
// Generation Source: Vite.Vite.backend()
// Service: menu-api
// Type: Backend (Vitest)
///////////////////////////////////////////////////////////////////////////////

import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {

    },
  },
  test: {
    coverage: {
      all: true,
      exclude: [
        'node_modules/**',
        'dist/**',
        'docs/**',
        'src/tests/**',
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/test-*.ts',
        'prisma/**',
        '**/*.config.{ts,js}',
        '**/coverage/**',
      ],
      include: ['src/**/*.{ts,js}'],
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    deps: {
      inline: [],
    },
    environment: 'node',
    exclude: ['node_modules', 'dist', 'docs/node_modules', '**/tests/e2e/**'],
    globals: true,
    include: ['src/**/*.{spec,test}.{ts,js}'],
  },
});
