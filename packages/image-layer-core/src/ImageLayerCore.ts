import type { BufferInfo, ProgramInfo } from 'twgl.js'
import * as twgl from 'twgl.js'
import type { Coordinates, LayerController, LayerMap } from '@naivemap/gl-layer-adaptor'
import type { ArrugadoFlat } from './arrugator'
import { initArrugator } from './arrugator'
import { earcutPolygon, extractPolygonAsync, MaskProperty } from './mask'
import fs from './shaders/image.fragment.glsl'
import vs from './shaders/image.vertex.glsl'
import maskfs from './shaders/mask.fragment.glsl'
import maskvs from './shaders/mask.vertex.glsl'

/**
 * the options for ImageLayer
 */
export type ImageLayerOption = {
  url: string
  projection: string
  coordinates: Coordinates
  resampling?: 'linear' | 'nearest'
  opacity?: number
  crossOrigin?: string
  arrugatorStep?: number
  mask?: MaskProperty
}

export default class ImageLayerCore implements LayerController {
  private option: ImageLayerOption
  private map?: LayerMap
  private gl?: WebGLRenderingContext
  private loaded: boolean
  private arrugado: ArrugadoFlat
  private programInfo?: ProgramInfo
  private bufferInfo?: BufferInfo
  private texture?: WebGLTexture
  private maskProperty: Partial<MaskProperty>
  private maskProgramInfo?: ProgramInfo
  private maskBufferInfo?: BufferInfo

  constructor(option: ImageLayerOption) {
    this.option = option
    this.loaded = false
    this.maskProperty = Object.assign({ type: 'in' }, option.mask)
    const { projection, coordinates } = option
    this.arrugado = initArrugator(projection, coordinates, option.arrugatorStep)
  }

  onAdd(map: LayerMap, gl?: WebGLRenderingContext) {
    if (!gl) {
      throw new Error('ImageLayerCore requires a WebGL rendering context during onAdd.')
    }

    this.map = map
    this.gl = gl
    this.programInfo = twgl.createProgramInfo(gl, [vs, fs])

    this.loadTexture(map, gl)
    this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
      a_pos: { numComponents: 2, data: this.arrugado.pos },
      a_uv: { numComponents: 2, data: this.arrugado.uv },
      indices: this.arrugado.trigs
    })

    if (this.maskProperty.data) {
      this.getMaskBufferInfo(gl, this.maskProperty.data).then((bufferInfo) => {
        this.maskProgramInfo = twgl.createProgramInfo(gl, [maskvs, maskfs])
        this.maskBufferInfo = bufferInfo
      })
    }
  }

  onRemove(_: LayerMap, gl?: WebGLRenderingContext) {
    if (!gl) {
      return
    }

    if (this.programInfo) {
      gl.deleteProgram(this.programInfo.program)
    }
    if (this.maskProgramInfo) {
      gl.deleteProgram(this.maskProgramInfo.program)
    }
    if (this.texture) {
      gl.deleteTexture(this.texture)
      this.texture = undefined
    }
  }

  render(frame: { gl: WebGLRenderingContext; matrix: number[] | Float32Array; prepareStencilMask?: () => void }): void {
    if (this.maskProperty.data && !this.maskBufferInfo) {
      return
    }

    const gl = frame.gl

    if (this.loaded && this.programInfo && this.bufferInfo) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

      if (this.maskProgramInfo && this.maskBufferInfo) {
        frame.prepareStencilMask?.()
        gl.useProgram(this.maskProgramInfo.program)
        gl.enable(gl.STENCIL_TEST)
        gl.stencilFunc(gl.ALWAYS, 1, 0xff)
        gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE)
        gl.stencilMask(0xff)
        gl.clear(gl.STENCIL_BUFFER_BIT)

        twgl.setUniforms(this.maskProgramInfo, { u_matrix: frame.matrix })
        twgl.setBuffersAndAttributes(gl, this.maskProgramInfo, this.maskBufferInfo)

        let elementType: number = gl.UNSIGNED_SHORT
        if (this.maskBufferInfo.numElements / 3 > 65535) {
          gl.getExtension('OES_element_index_uint')
          elementType = gl.UNSIGNED_INT
        }
        gl.drawElements(gl.TRIANGLES, this.maskBufferInfo.numElements, elementType, 0)
      }

      gl.useProgram(this.programInfo.program)

      if (this.maskProgramInfo?.program) {
        const ref = this.maskProperty.type === 'out' ? 0 : 1
        gl.stencilFunc(gl.EQUAL, ref, 0xff)
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
      }

      twgl.setUniforms(this.programInfo, {
        u_matrix: frame.matrix,
        u_opacity: this.option.opacity ?? 1,
        u_sampler: this.texture
      })
      twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
      gl.drawElements(gl.TRIANGLES, this.arrugado.trigs.length, gl.UNSIGNED_SHORT, 0)
    }
  }

  updateImage(option: Partial<Omit<ImageLayerOption, 'mask'>>) {
    if (!this.map || !this.gl) {
      return this
    }

    this.option.opacity = option.opacity ?? this.option.opacity
    this.option.crossOrigin = option.crossOrigin ?? this.option.crossOrigin
    if (option.projection || option.coordinates || option.arrugatorStep) {
      this.option.projection = option.projection ?? this.option.projection
      this.option.coordinates = option.coordinates ?? this.option.coordinates
      this.option.arrugatorStep = option.arrugatorStep ?? this.option.arrugatorStep
      this.arrugado = initArrugator(this.option.projection, this.option.coordinates, this.option.arrugatorStep)
      this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
        a_pos: { numComponents: 2, data: this.arrugado.pos },
        a_uv: { numComponents: 2, data: this.arrugado.uv },
        indices: this.arrugado.trigs
      })
    }
    if (option.url || option.resampling) {
      this.loaded = false
      this.option.url = option.url ?? this.option.url
      this.option.resampling = option.resampling ?? this.option.resampling
      this.loadTexture(this.map, this.gl)
    } else {
      this.map.triggerRepaint()
    }
    return this
  }

  updateMask(mask: Partial<MaskProperty>) {
    if (!this.map || !this.gl) {
      return this
    }

    this.maskProperty = Object.assign(this.maskProperty, mask)
    if (mask.data) {
      this.getMaskBufferInfo(this.gl, mask.data).then((bufferInfo) => {
        if (!this.maskProgramInfo) {
          this.maskProgramInfo = twgl.createProgramInfo(this.gl!, [maskvs, maskfs])
        }
        this.maskBufferInfo = bufferInfo
        this.map?.triggerRepaint()
      })
    } else if (Object.prototype.hasOwnProperty.call(mask, 'data') && mask.data === undefined) {
      this.maskBufferInfo = undefined
      this.map?.triggerRepaint()
    } else {
      this.map?.triggerRepaint()
    }
    return this
  }

  private loadTexture(map: LayerMap, gl: WebGLRenderingContext) {
    if (this.texture) {
      gl.deleteTexture(this.texture)
      this.texture = undefined
    }

    const filter = this.option.resampling === 'nearest' ? gl.NEAREST : gl.LINEAR

    twgl.createTexture(
      gl,
      {
        src: this.option.url,
        crossOrigin: this.option.crossOrigin,
        minMag: filter,
        flipY: 0,
        premultiplyAlpha: 1
      },
      (err, texture, source) => {
        if (err) {
          throw err
        }

        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE)
        const { width, height } = source as HTMLImageElement
        if (width > maxTextureSize || height > maxTextureSize) {
          throw new Error(`The texture size exceeds the maximum supported size: ${maxTextureSize}x${maxTextureSize}`)
        }
        this.texture = texture
        this.loaded = true
        map.triggerRepaint()
      }
    )
  }

  private getMaskBufferInfo(gl: WebGLRenderingContext, data: MaskProperty['data']) {
    return extractPolygonAsync(data).then((_poly) => {
      const { vertices, indices } = earcutPolygon(_poly)
      return twgl.createBufferInfoFromArrays(gl, {
        a_pos: { numComponents: 2, data: vertices },
        indices: indices.length / 3 > 65535 ? new Uint32Array(indices) : new Uint16Array(indices)
      })
    })
  }
}