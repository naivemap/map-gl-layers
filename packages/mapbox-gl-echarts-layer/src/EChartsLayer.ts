import EChartsLayerCore, { type ECOption } from '@naivemap/echarts-layer-core'
import { createMapboxLayerAdaptor, type CustomLayerLike } from '@naivemap/gl-layer-adaptor'
import type { CustomLayerInterface, Map } from 'mapbox-gl'

/**
 * A custom Mapbox GL JS layer that renders Apache ECharts visualizations.
 */
export default class EChartsLayer implements CustomLayerInterface {
  id: string
  /**
   * @ignore
   */
  type: 'custom'
  /**
   * @ignore
   */
  renderingMode?: '2d' | '3d' | undefined
  private _core: EChartsLayerCore
  private _adaptor: CustomLayerLike<Map>

  /**
   * @param id - A unique layer id
   * @param ecOption - The ECharts option object used to configure the visualization.
   * @see https://echarts.apache.org/en/option.html
   */
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

  /**
   * Updates the ECharts visualization with a new configuration.
   * This is the primary method for dynamically changing the displayed data or styles.
   *
   * @param option - The new ECharts option object to apply.
   * @param notMerge - If true, the new options will completely replace the existing ones.
   *                   If false or undefined, the new options will be merged with the old ones.
   *                   Defaults to `false`.
   * @see https://echarts.apache.org/en/api.html#echartsInstance.setOption
   */
  setOption(option: ECOption, notMerge?: boolean) {
    this._core.setOption(option, notMerge)
  }

  render(gl: WebGLRenderingContext, args: unknown) {
    this._adaptor.render(gl, args)
  }
}