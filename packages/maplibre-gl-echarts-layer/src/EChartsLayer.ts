import EChartsLayerCore, { type ECOption } from '@naivemap/echarts-layer-core'
import { createMapLibreLayerAdaptor, type CustomLayerLike } from '@naivemap/map-gl-layer-adaptor'
import type { CustomLayerInterface, Map } from 'maplibre-gl'

/**
 * A custom MapLibre GL JS layer that renders Apache ECharts visualizations.
 *
 * @remarks
 * This layer integrates ECharts by creating a dedicated canvas over the map,
 * allowing for rich data visualizations using ECharts' powerful charting capabilities.
 * It is optimized for `lines` and `scatter` series types to visualize flows,
 * trajectories, and point distributions.
 *
 * The layer automatically synchronizes the ECharts view with the map's panning and zooming.
 *
 * @example
 * ```ts
 * import EChartsLayer from '@naivemap/maplibre-gl-echarts-layer';
 *
 * // 1. Define a standard ECharts option object.
 * const option = {
 *   series: [{
 *     type: 'scatter',
 *     name: 'Cities',
 *     data: [
 *       // Data format: [longitude, latitude]
 *       [-74.0060, 40.7128],
 *       [-0.1278, 51.5074],
 *       [139.6917, 35.6895]
 *     ],
 *     symbolSize: 10,
 *   }]
 * };
 *
 * // 2. Create the layer instance
 * const layer = new EChartsLayer('echarts-layer', option);
 *
 * // 3. Add the layer to the map
 * map.addLayer(layer);
 * ```
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
    this._adaptor = createMapLibreLayerAdaptor(this._core, {
      id,
      renderingMode: this.renderingMode
    })
  }

  /**
   * @ignore
   */
  onAdd(map: Map, gl: WebGLRenderingContext) {
    this._adaptor.onAdd(map, gl)
  }

  /**
   * @ignore
   */
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

  /**
   * @ignore
   */
  render(gl: WebGLRenderingContext, args: unknown) {
    this._adaptor.render(gl, args)
  }
}
