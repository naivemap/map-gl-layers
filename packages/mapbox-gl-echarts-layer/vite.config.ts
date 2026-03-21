import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createViteLibConfig } from '../../config/create-vite-lib-config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createViteLibConfig({
  entry: resolve(__dirname, 'src/index.ts'),
  name: 'MapboxEChartsLayer',
  external: ['mapbox-gl', '@naivemap/echarts-layer-core', '@naivemap/map-gl-layer-adaptor'],
  globals: {
    'mapbox-gl': 'mapboxgl'
  }
})