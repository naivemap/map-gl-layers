import EChartsLayerCore, { type ECOption } from '@naivemap/echarts-layer-core'
import { createMapboxLayerAdaptor, type CustomLayerLike } from '@naivemap/gl-layer-adaptor'
import type { CustomLayerInterface, Map } from 'mapbox-gl'

/**
 * @see https://www.naivemap.com/mapbox-gl-js-cookbook/recipes/echarts-layer.html
 */
export default class EChartsLayer implements CustomLayerInterface {
  id: string
  type: 'custom'
  renderingMode?: '2d' | '3d' | undefined
  private _core: EChartsLayerCore
  private _adaptor: CustomLayerLike<Map>

  constructor(id: string, ecOption: ECOption) {
    this.id = id
    this.type = 'custom'
    this.renderingMode = '2d'
    this._core = new EChartsLayerCore(ecOption)
    this._adaptor = createMapboxLayerAdaptor(this._core, {
      id,
      renderingMode: this.renderingMode
    })
  }

  onAdd(map: Map, gl: WebGLRenderingContext) {
    this._adaptor.onAdd(map, gl)
  }

  onRemove(map: Map, gl: WebGLRenderingContext) {
    this._adaptor.onRemove(map, gl)
  }

  setOption(option: ECOption, notMerge?: boolean) {
    this._core.setOption(option, notMerge)
  }

  render(gl: WebGLRenderingContext, args: unknown) {
    this._adaptor.render(gl, args)
  }
}