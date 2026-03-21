import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

type CreateViteLibConfigOptions = {
  entry: string
  name: string
  external?: string[]
  globals?: Record<string, string>
}

export function createViteLibConfig(options: CreateViteLibConfigOptions) {
  return defineConfig({
    build: {
      lib: {
        entry: options.entry,
        name: options.name,
        formats: ['es', 'cjs'],
        fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs')
      },
      rollupOptions: {
        external: options.external ?? [],
        output: {
          globals: options.globals ?? {}
        }
      }
    },
    plugins: [dts({ insertTypesEntry: true, rollupTypes: false })]
  })
}