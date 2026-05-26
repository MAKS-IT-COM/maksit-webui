import path from 'node:path'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = dirname

export default defineConfig({
  plugins: [tailwindcss()],
  optimizeDeps: {
    include: [
      'react/jsx-dev-runtime',
      'mockdate',
      'msw-storybook-addon',
      'react-router-dom',
      'storybook/test',
      'lucide-react',
      'lodash/debounce',
    ],
  },
  resolve: {
    alias: {
      '@webui/components': path.join(srcDir, 'packages/components/src'),
      '@webui/contracts': path.join(srcDir, 'packages/contracts/src'),
      '@webui/core': path.join(srcDir, 'packages/core/src'),
    },
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            reportsDirectory: './coverage/storybook',
            include: ['packages/components/src/**/*.{ts,tsx}'],
          },
        },
      },
    ],
  },
})
