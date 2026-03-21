/* eslint-disable guard-for-in */
// @ts-nocheck
import TinyQueue from 'tinyqueue'

export default class Arrugator {
  constructor(projector, verts, uv, trigs) {
    this._projector = projector
    this._verts = verts
    this._uv = uv
    this._projVerts = verts.map(projector)
    this._trigs = trigs
    this._segs = []
    this._segCount = 0
    this._segTrigs = []
    this._queue = new TinyQueue([], function (a, b) {
      return b.epsilon - a.epsilon
    })
    this._vertToSeg = new Array(verts.length)
    for (const i in this._verts) {
      this._vertToSeg[i] = []
    }

    for (const t in this._trigs) {
      const trig = this._trigs[t]
      const v0 = trig[0]
      const v1 = trig[1]
      const v2 = trig[2]
      this._segment(v0, v1, t)
      this._segment(v1, v2, t)
      this._segment(v2, v0, t)
    }
  }

  _segment(v1, v2, t, maxEpsilon = Infinity) {
    if (this._vertToSeg[v1] && this._vertToSeg[v1][v2] !== undefined) {
      const found = this._vertToSeg[v1][v2]

      if (!this._segTrigs[found].includes(t)) {
        this._segTrigs[found].push(t)
      }

      return found
    }

    const segIdx = this._segCount++

    this._segs[segIdx] = [v1, v2]
    this._vertToSeg[v1][v2] = segIdx
    this._vertToSeg[v2][v1] = segIdx
    this._segTrigs[segIdx] = [t]

    const midpoint = [(this._verts[v1][0] + this._verts[v2][0]) / 2, (this._verts[v1][1] + this._verts[v2][1]) / 2]
    const projectedMid = this._projector(midpoint)
    const midProjected = [
      (this._projVerts[v1][0] + this._projVerts[v2][0]) / 2,
      (this._projVerts[v1][1] + this._projVerts[v2][1]) / 2
    ]

    const epsilon = (projectedMid[0] - midProjected[0]) ** 2 + (projectedMid[1] - midProjected[1]) ** 2

    if (Number.isFinite(epsilon) && epsilon < maxEpsilon) {
      this._queue.push({
        v1: v1,
        v2: v2,
        epsilon: epsilon,
        midpoint: midpoint,
        projectedMid: projectedMid
      })
    }

    return segIdx
  }

  output() {
    return {
      unprojected: Array.from(this._verts),
      projected: Array.from(this._projVerts),
      uv: Array.from(this._uv),
      trigs: Array.from(this._trigs)
    }
  }

  private _stepsWithSameEpsilon = 0

  lowerEpsilon(targetEpsilon) {
    let currentEpsilon = this._queue.peek().epsilon
    let lastEpsilon = currentEpsilon
    while (currentEpsilon >= targetEpsilon) {
      this.step()

      currentEpsilon = this._queue.peek().epsilon
      if (currentEpsilon === lastEpsilon) {
        this._stepsWithSameEpsilon++
        if (this._stepsWithSameEpsilon < 500) {
          console.warn('Arrugator stopped due to epsilon stall. Raster may need hints for proper arrugation.')
          break
        }
      } else {
        this._stepsWithSameEpsilon = 0
        lastEpsilon = currentEpsilon
      }
    }
  }

  get epsilon() {
    return this._queue.peek().epsilon
  }

  set epsilon(ep) {
    return this.lowerEpsilon(ep)
  }

  step() {
    const seg = this._queue.pop()
    return this._splitSegment(seg, seg.epsilon)
  }

  force() {
    const segments = this._queue.data
    this._queue.data = []
    this._queue.length = 0
    segments.forEach((seg) => this._splitSegment(seg, Infinity))
  }

  private _splitSegment(seg, maxEpsilon) {
    const v1 = seg.v1
    const v2 = seg.v2
    const s = this._vertToSeg[v1] && this._vertToSeg[v1][v2]
    const trigs = this._segTrigs[s]

    if (trigs.length >= 3) {
      throw new Error('Somehow a segment is shared by three triangles')
    }

    delete this._segTrigs[s]
    delete this._segs[s]
    delete this._vertToSeg[v1][v2]
    delete this._vertToSeg[v2][v1]

    const vm = this._verts.length

    this._projVerts[vm] = seg.projectedMid
    this._verts[vm] = seg.midpoint
    this._vertToSeg[vm] = []
    this._uv[vm] = [(this._uv[v1][0] + this._uv[v2][0]) / 2, (this._uv[v1][1] + this._uv[v2][1]) / 2]

    for (const t of trigs) {
      this._splitTriangle(v1, v2, vm, t, maxEpsilon)
    }
  }

  private _splitTriangle(v1, v2, vm, t, epsilon = Infinity) {
    const tvs = this._trigs[t]

    let v3
    let winding = false
    if (tvs[0] === v1 && tvs[1] === v2) {
      v3 = tvs[2]
      winding = true
    } else if (tvs[1] === v1 && tvs[2] === v2) {
      v3 = tvs[0]
      winding = true
    } else if (tvs[2] === v1 && tvs[0] === v2) {
      v3 = tvs[1]
      winding = true
    } else if (tvs[1] === v1 && tvs[0] === v2) {
      v3 = tvs[2]
      winding = false
    } else if (tvs[2] === v1 && tvs[1] === v2) {
      v3 = tvs[0]
      winding = false
    } else if (tvs[0] === v1 && tvs[2] === v2) {
      v3 = tvs[1]
      winding = false
    } else {
      throw new Error('Data structure mishap: could not fetch 3rd vertex used in triangle')
    }

    const t2 = this._trigs.length

    if (winding) {
      this._trigs[t] = [v1, vm, v3]
      this._trigs[t2] = [vm, v2, v3]
    } else {
      this._trigs[t] = [vm, v1, v3]
      this._trigs[t2] = [v2, vm, v3]
    }

    const s1 = this._vertToSeg[v1] && this._vertToSeg[v1][v2]
    const s2 = this._vertToSeg[v2] && this._vertToSeg[v2][v3]
    const s3 = this._vertToSeg[v3] && this._vertToSeg[v3][v1]

    function filterTrig(i) {
      return i !== t
    }

    if (s1 !== undefined) {
      this._segTrigs[s1] = this._segTrigs[s1].filter(filterTrig)
    }
    if (s2 !== undefined) {
      this._segTrigs[s2] = this._segTrigs[s2].filter(filterTrig)
    }
    if (s3 !== undefined) {
      this._segTrigs[s3] = this._segTrigs[s3].filter(filterTrig)
    }

    this._segment(v1, vm, t, epsilon)
    this._segment(vm, v3, t, epsilon)
    this._segment(v3, v1, t, epsilon)

    this._segment(v2, vm, t2, epsilon)
    this._segment(vm, v3, t2, epsilon)
    this._segment(v3, v2, t2, epsilon)
  }
}