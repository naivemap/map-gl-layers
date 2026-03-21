import earcut, { flatten } from 'earcut'
import * as GeoJSON from 'geojson'

/**
 * the mask property of the image layer
 */
export interface MaskProperty {
  /**
   * the type of the mask, 'in' means the area inside the polygon will be masked, 'out' means the area outside the polygon will be masked, default is 'in'
   */
  type?: 'in' | 'out'
  /**
   * the GeoJSON data or URL of the GeoJSON data for the mask
   */
  data: GeoJSON.GeoJSON | string
}

export function extractPolygon(data: GeoJSON.GeoJSON) {
  if (Object.prototype.hasOwnProperty.call(data, 'type')) {
    const type = data.type
    if (type === 'Polygon' || type === 'MultiPolygon') {
      return data
    } else if (type === 'Feature' && (data.geometry.type === 'Polygon' || data.geometry.type === 'MultiPolygon')) {
      return data.geometry
    } else if (type === 'FeatureCollection') {
      const features = data.features.filter(
        (feature: GeoJSON.Feature) => feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon'
      )
      if (features.length === 1) {
        return features[0].geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
      } else if (features.length > 1) {
        const polygonCoords: GeoJSON.Position[][][] = []

        for (const feature of features) {
          const geometry = feature.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon
          if (geometry.type === 'MultiPolygon') {
            for (const coordinate of geometry.coordinates) {
              polygonCoords.push(coordinate)
            }
          } else {
            polygonCoords.push(geometry.coordinates)
          }
        }
        return {
          type: 'MultiPolygon',
          coordinates: polygonCoords
        } as GeoJSON.MultiPolygon
      } else {
        throw new Error('No valid Polygon or MultiPolygon features found')
      }
    } else {
      throw new Error('Invalid GeoJSON format, only support Polygon, MultiPolygon, Feature, FeatureCollection')
    }
  } else {
    throw new Error('Invalid GeoJSON format')
  }
}

export function extractPolygonAsync(data: GeoJSON.GeoJSON | string) {
  if (typeof data === 'string') {
    return fetch(data)
      .then((res) => res.json())
      .then((res) => extractPolygon(res))
  }

  return Promise.resolve(extractPolygon(data))
}

export function earcutPolygon(poly: GeoJSON.Polygon | GeoJSON.MultiPolygon) {
  let positions: number[] = []
  let triangles: number[] = []

  if (poly.type === 'MultiPolygon') {
    const polyCount = poly.coordinates.length
    let triangleStartIndex = 0
    for (let i = 0; i < polyCount; i++) {
      const coordinates = poly.coordinates[i]
      const flattened = flatten(coordinates)
      const { vertices, holes, dimensions } = flattened
      const triangle = earcut(vertices, holes, dimensions)
      const triangleNew = triangle.map((item) => item + triangleStartIndex)

      triangleStartIndex += vertices.length / 2

      for (let m = 0; m < vertices.length; m++) {
        positions.push(vertices[m])
      }
      for (let n = 0; n < triangleNew.length; n++) {
        triangles.push(triangleNew[n])
      }
    }
  } else {
    const flattened = flatten(poly.coordinates)
    const { vertices, holes, dimensions } = flattened
    positions = vertices
    triangles = earcut(vertices, holes, dimensions)
  }

  return {
    vertices: positions,
    indices: triangles
  }
}
