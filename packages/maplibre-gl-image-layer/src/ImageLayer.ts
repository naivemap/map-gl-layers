import ImageLayerCore, { type ImageLayerOption } from '@naivemap/image-layer-core'
import type { MaskProperty } from '@naivemap/image-layer-core'
import { clearTileClippingMask, createMapLibreLayerAdaptor, type CustomLayerLike } from '@naivemap/map-gl-layer-adaptor'
import type { CustomLayerInterface, Map } from 'maplibre-gl'

export type { ImageLayerOption } from '@naivemap/image-layer-core'

/**
 * A custom MapLibre GL JS layer for rendering georeferenced images with arbitrary projections.
 *
 * @remarks
 * This layer uses `proj4js` to transform image coordinates from any source projection
 * into the map's coordinate system. It triangulates the image corners to correctly
 * warp and display it on the map canvas. This is ideal for overlaying historical maps,
 * floor plans, or other non-standard raster data.
 *
 * @example
 * ```ts
 * import ImageLayer from '@naivemap/maplibre-gl-image-layer';
 * import proj4 from 'proj4';
 *
 * // 1. Define the source projection if it's not standard
 * proj4.defs('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +units=m +no_defs');
 *
 * // 2. Create the layer instance
 * const layer = new ImageLayer('image-layer', {
 *   url: 'https://example.com/my-image.png',
 *   coordinates: [
 *     [100000, 6700000], // Top-left corner in source projection
 *     [110000, 6700000], // Top-right
 *     [110000, 6600000], // Bottom-right
 *     [100000, 6600000]  // Bottom-left
 *   ],
 *   projection: 'EPSG:2154'
 * });
 *
 * // 3. Add the layer to the map
 * map.addLayer(layer);
 * ```
 */
export default class ImageLayer implements CustomLayerInterface {
  id: string
  /**
   * @ignore
   */
  type: 'custom' = 'custom' as const
  /**
   * @ignore
   */
  renderingMode?: '2d' | '3d' | undefined = '2d'
  private core: ImageLayerCore
  private adaptor: CustomLayerLike<Map>

  /**
   * @param id - A unique layer id
   * @param option - ImageLayer options
   */
  constructor(id: string, option: ImageLayerOption) {
    this.id = id
    this.core = new ImageLayerCore(option)
    this.adaptor = createMapLibreLayerAdaptor(this.core, {
      id,
      renderingMode: this.renderingMode,
      prepareStencilMask: (map: Map) => clearTileClippingMask(map as any)
    })
  }

  /**
   * @ignore
   */
  onAdd(map: Map, gl: WebGLRenderingContext) {
    this.adaptor.onAdd(map, gl)
  }

  /**
   * @ignore
   */
  onRemove(map: Map, gl: WebGLRenderingContext) {
    this.adaptor.onRemove(map, gl)
  }

  /**
   * @ignore
   */
  render(gl: WebGLRenderingContext, args: unknown): void {
    this.adaptor.render(gl, args)
  }

  /**
   * Updates the URL, the projection, the coordinates, the opacity or the resampling of the image.
   * @param {Object} option Options object.
   */
  updateImage(option: Partial<Omit<ImageLayerOption, 'mask'>>) {
    return this.core.updateImage(option)
  }

  /**
   * Updates the mask property of the image layer.
   * @param mask
   */
  updateMask(mask: Partial<MaskProperty>) {
    return this.core.updateMask(mask)
  }
}
