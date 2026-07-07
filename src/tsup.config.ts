import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      ignoreDeprecations: '6.0',
    },
  },
  tsconfig: 'tsconfig.json',
  clean: true,
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    'lucide-react',
    '@tanstack/react-table',
    'react-virtualized',
    'axios',
    '@microsoft/signalr',
    'zod',
  ],
})
