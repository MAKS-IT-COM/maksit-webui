import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

const storybookDir = dirname(fileURLToPath(import.meta.url))
const srcDir = join(storybookDir, '..')

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  staticDirs: ['../public'],
  addons: [
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-vitest")
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  async viteFinal (config) {
    config.plugins = [...(config.plugins ?? []), tailwindcss()]
    config.esbuild = {
      ...config.esbuild,
      jsx: 'automatic',
      jsxImportSource: 'react',
    }
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias as Record<string, string> | undefined),
        '@webui/components': join(srcDir, 'packages/components/src'),
        '@webui/contracts': join(srcDir, 'packages/contracts/src'),
        '@webui/core': join(srcDir, 'packages/core/src'),
      },
    }
    return config
  },
}

export default config

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
