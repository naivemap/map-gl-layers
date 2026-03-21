import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createViteLibConfig } from '../../config/create-vite-lib-config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createViteLibConfig({
  entry: resolve(__dirname, 'src/index.ts'),
  name: 'ImageLayerCore',
  external: ['proj4', '@naivemap/map-gl-layer-adaptor'],
  globals: {
    proj4: 'proj4'
  }
})