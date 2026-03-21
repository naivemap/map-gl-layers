import proj4 from 'proj4'
import type { Coordinates } from '@naivemap/gl-layer-adaptor'
import Arrugator from './Arrugator'

export type ArrugadoFlat = {
  pos: number[]
  uv: number[]
  trigs: number[]
}

export function initArrugator(fromProj: string, coordinates: Coordinates, step = 100): ArrugadoFlat {
  const origin = [-20037508.342789244, 20037508.342789244]
  const verts = [coordinates[0], coordinates[3], coordinates[1], coordinates[2]]
  const projector = proj4(fromProj, 'EPSG:3857').forward

  function forward(coors: [number, number]): [number, number] {
    const coor3857 = projector(coors)
    const x = Math.abs((coor3857[0] - origin[0]) / (20037508.342789244 * 2))
    const y = Math.abs((coor3857[1] - origin[1]) / (20037508.342789244 * 2))
    return [x, y]
  }

  const sourceUV: [number, number][] = [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1]
  ]
  const arrugator = new Arrugator(forward, verts, sourceUV, [
    [0, 1, 3],
    [0, 3, 2]
  ])

  if (step > 0) {
    arrugator.force()
    for (let i = 0; i < step; i++) {
      arrugator.step()
    }
  }

  const arrugado = arrugator.output()

  return {
    pos: arrugado.projected.flat() as number[],
    uv: arrugado.uv.flat() as number[],
    trigs: arrugado.trigs.flat() as number[]
  }
}