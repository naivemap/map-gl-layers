import {
  init,
  registerCoordinateSystem,
  getCoordinateSystemDimensions,
  ComposeOption,
  EffectScatterSeriesOption,
  LegendComponentOption,
  LinesSeriesOption,
  ScatterSeriesOption,
  TitleComponentOption,
  TooltipComponentOption
} from 'echarts'
import type { LayerController, LayerMap, LngLatTuple } from '@naivemap/gl-layer-adaptor'

/**
 * the options for the EChartsLayer. It is the same as the options of ECharts, but only supports a subset of them. For more details, please refer to the ECharts documentation.
 * @see https://echarts.apache.org/en/option.html
 */
export type ECOption = ComposeOption<
  | TitleComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | LinesSeriesOption
  | ScatterSeriesOption
  | EffectScatterSeriesOption
>

const COORDINATE_SYSTEM_NAME = 'gl-layer-echarts'

class CoordinateSystem {
  id: string
  dimensions = ['x', 'y']
  private _map: LayerMap
  private _mapOffset = [0, 0]

  constructor(id: string, map: LayerMap) {
    this.id = id
    this._map = map
  }

  create(ecModel: any) {
    ecModel.eachSeries((seriesModel: any) => {
      if (seriesModel.get('coordinateSystem') === this.id) {
        seriesModel.coordinateSystem = new CoordinateSystem(this.id, this._map)
      }
    })
  }

  dataToPoint(data: LngLatTuple) {
    const px = this._map.project(data)
    const mapOffset = this._mapOffset

    return [px.x - mapOffset[0], px.y - mapOffset[1]]
  }

  pointToData(pt: [number, number]) {
    const mapOffset = this._mapOffset
    const data = this._map.unproject([pt[0] + mapOffset[0], pt[1] + mapOffset[1]])
    return [data.lng, data.lat]
  }
}

export default class EChartsLayerCore implements LayerController {
  private _container!: HTMLDivElement
  private _map!: LayerMap
  private _ec: echarts.ECharts | undefined
  private _coordSystemName: string
  private _ecOption: ECOption

  constructor(ecOption: ECOption) {
    this._coordSystemName = COORDINATE_SYSTEM_NAME + '-' + Math.random().toString(16).substring(2)
    this._ecOption = ecOption
  }

  onAdd(map: LayerMap) {
    this._map = map
    this._createLayerContainer()
    if (!getCoordinateSystemDimensions(this._coordSystemName)) {
      const coordinateSystem = new CoordinateSystem(this._coordSystemName, this._map)
      registerCoordinateSystem(this._coordSystemName, coordinateSystem as any)
    }
  }

  onRemove() {
    this._ec?.dispose()
    this._removeLayerContainer()
  }

  setOption(option: ECOption, notMerge?: boolean) {
    this._ecOption = option
    this._ec?.setOption(option, notMerge)
  }

  render() {
    if (!this._container) {
      this._createLayerContainer()
    }
    if (!this._ec) {
      this._ec = init(this._container)
      this._prepareECharts()
      this._ec.setOption(this._ecOption)
      return
    }

    if (this._map.isMoving()) {
      this._ec.clear()
      return
    }

    this._ec.resize({
      width: this._map.getCanvas().width,
      height: this._map.getCanvas().height
    })
    this._prepareECharts()
    this._ec.setOption(this._ecOption)
  }

  private _prepareECharts() {
    const series = this._ecOption.series as any[]
    if (!series) {
      return
    }

    for (let i = series.length - 1; i >= 0; i--) {
      series[i].coordinateSystem = this._coordSystemName
    }
  }

  private _createLayerContainer() {
    const mapContainer = this._map.getCanvasContainer()
    this._container = document.createElement('div')
    this._container.style.width = this._map.getCanvas().style.width
    this._container.style.height = this._map.getCanvas().style.height
    mapContainer.appendChild(this._container)
  }

  private _removeLayerContainer() {
    if (this._container) {
      this._container.parentNode?.removeChild(this._container)
    }
  }
}