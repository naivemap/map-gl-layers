export type LngLatTuple = [number, number]
export type Coordinates = [LngLatTuple, LngLatTuple, LngLatTuple, LngLatTuple]
export type ProjectionMatrix = number[] | Float32Array

export interface ProjectedPoint {
  x: number
  y: number
}

export interface GeoPoint {
  lng: number
  lat: number
}

export interface LayerMap {
  project(lngLat: LngLatTuple): ProjectedPoint
  unproject(point: [number, number]): GeoPoint
  getCanvas(): HTMLCanvasElement
  getCanvasContainer(): HTMLElement
  isMoving(): boolean
  triggerRepaint(): void
}

export interface LayerRenderFrame<M extends LayerMap = LayerMap> {
  map: M
  gl: WebGLRenderingContext
  matrix: ProjectionMatrix
  rawArgs: unknown
  prepareStencilMask?: () => void
}

export interface LayerController<M extends LayerMap = LayerMap> {
  onAdd(map: M, gl?: WebGLRenderingContext): void
  onRemove(map: M, gl?: WebGLRenderingContext): void
  render(frame: LayerRenderFrame<M>): void
}

export interface CustomLayerAdaptorOptions<M extends LayerMap = LayerMap> {
  id: string
  renderingMode?: '2d' | '3d'
  resolveMatrix?: (args: unknown) => ProjectionMatrix
  prepareStencilMask?: (map: M) => void
}

export interface CustomLayerLike<M extends LayerMap = LayerMap> {
  id: string
  type: 'custom'
  renderingMode?: '2d' | '3d'
  onAdd(map: M, gl: WebGLRenderingContext): void
  onRemove(map: M, gl: WebGLRenderingContext): void
  render(gl: WebGLRenderingContext, args: unknown): void
}

type ProjectionArgs = {
  defaultProjectionData?: {
    mainMatrix?: ProjectionMatrix
  }
}

export function resolveLayerMatrix(args: unknown): ProjectionMatrix {
  if (Array.isArray(args)) {
    return args
  }

  const projectionArgs = args as ProjectionArgs | undefined
  const matrix = projectionArgs?.defaultProjectionData?.mainMatrix
  if (matrix) {
    return matrix
  }

  throw new Error('Unable to resolve projection matrix from render arguments.')
}

export function clearTileClippingMask(map: { painter?: any } | undefined) {
  const painter = map?.painter
  if (!painter || painter.terrain) {
    return
  }

  painter.currentStencilSource = undefined
  painter._tileClippingMaskIDs = {}
}

export function createCustomLayerAdaptor<M extends LayerMap>(
  controller: LayerController<M>,
  options: CustomLayerAdaptorOptions<M>
): CustomLayerLike<M> {
  let currentMap: M | undefined

  return {
    id: options.id,
    type: 'custom',
    renderingMode: options.renderingMode ?? '2d',
    onAdd(map, gl) {
      currentMap = map
      controller.onAdd(map, gl)
    },
    onRemove(map, gl) {
      controller.onRemove(map, gl)
      currentMap = undefined
    },
    render(gl, args) {
      if (!currentMap) {
        throw new Error('Layer adaptor render invoked before onAdd.')
      }

      controller.render({
        map: currentMap,
        gl,
        matrix: (options.resolveMatrix ?? resolveLayerMatrix)(args),
        rawArgs: args,
        prepareStencilMask: options.prepareStencilMask ? () => options.prepareStencilMask!(currentMap!) : undefined
      })
    }
  }
}

export const createMapLibreLayerAdaptor = createCustomLayerAdaptor
export const createMapboxLayerAdaptor = createCustomLayerAdaptor