import ImageLayerCore, { type ImageLayerOption } from '@naivemap/image-layer-core'
import type { MaskProperty } from '@naivemap/image-layer-core'
import { clearTileClippingMask, createMapboxLayerAdaptor, type CustomLayerLike } from '@naivemap/gl-layer-adaptor'
import type { CustomLayerInterface, Map } from 'mapbox-gl'

export type { ImageLayerOption } from '@naivemap/image-layer-core'

/**
 * @see https://www.naivemap.com/mapbox-gl-js-cookbook/recipes/image-layer.html
 */
export default class ImageLayer implements CustomLayerInterface {
  id: string
  type: 'custom' = 'custom' as const
  renderingMode?: '2d' | '3d' | undefined = '2d'
  private core: ImageLayerCore
  private adaptor: CustomLayerLike<Map>

  constructor(id: string, option: ImageLayerOption) {
    this.id = id
    this.core = new ImageLayerCore(option)
    this.adaptor = createMapboxLayerAdaptor(this.core, {
      id,
      renderingMode: this.renderingMode,
      prepareStencilMask: (map: Map) => clearTileClippingMask(map as any)
    })
  }

  onAdd(map: Map, gl: WebGLRenderingContext) {
    this.adaptor.onAdd(map, gl)
  }

  onRemove(map: Map, gl: WebGLRenderingContext) {
    this.adaptor.onRemove(map, gl)
  }

  render(gl: WebGLRenderingContext, args: unknown): void {
    this.adaptor.render(gl, args)
  }

  updateImage(option: Partial<Omit<ImageLayerOption, 'mask'>>) {
    return this.core.updateImage(option)
  }

  updateMask(mask: Partial<MaskProperty>) {
    return this.core.updateMask(mask)
  }
}