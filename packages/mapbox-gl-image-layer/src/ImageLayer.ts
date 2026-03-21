import ImageLayerCore, { type ImageLayerOption } from '@naivemap/image-layer-core'
import type { MaskProperty } from '@naivemap/image-layer-core'
import { clearTileClippingMask, createMapboxLayerAdaptor, type CustomLayerLike } from '@naivemap/gl-layer-adaptor'
import type { CustomLayerInterface, Map } from 'mapbox-gl'

export type { ImageLayerOption } from '@naivemap/image-layer-core'

/**
 * A custom Mapbox GL JS layer for rendering georeferenced images with arbitrary projections.
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
    this.adaptor = createMapboxLayerAdaptor(this.core, {
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
