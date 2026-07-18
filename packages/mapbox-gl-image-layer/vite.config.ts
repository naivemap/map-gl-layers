import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createViteLibConfig } from '../../config/create-vite-lib-config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createViteLibConfig({
  entry: resolve(__dirname, 'src/index.ts'),
  name: 'ImageLayer',
  external: ['mapbox-gl', 'proj4'],
  globals: {
    'mapbox-gl': 'mapboxgl',
    proj4: 'proj4'
  }
})