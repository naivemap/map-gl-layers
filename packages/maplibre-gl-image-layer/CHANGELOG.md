# @naivemap/maplibre-gl-image-layer

## 0.2.1

### Patch Changes

- ee03d44: 修复 UMD 构建将 proj4 打包进产物导致自定义投影（如 EPSG:27700）报错 "Could not parse to valid json" 的问题。将 proj4 标记为 external，使库使用用户通过 `proj4.defs()` 注册的全局 proj4 实例。
- Updated dependencies [752566a]
- Updated dependencies [12bebf6]
  - @naivemap/map-gl-layer-adaptor@0.2.1
  - @naivemap/image-layer-core@0.2.1

## 0.2.0

### Minor Changes

- 9cbf2be: Use .es/.umd builds; update docs demos paths
- 8250cc9: Refactor build configs and enhance docs
- a2d36bf: Refactoring to adapt to Mapbox and MapLibre

### Patch Changes

- Updated dependencies [9cbf2be]
- Updated dependencies [8250cc9]
  - @naivemap/map-gl-layer-adaptor@0.2.0
  - @naivemap/image-layer-core@0.2.0

## 0.2.0-alpha.2

### Minor Changes

- 8250cc9: Refactor build configs and enhance docs

### Patch Changes

- Updated dependencies [8250cc9]
  - @naivemap/map-gl-layer-adaptor@0.2.0-alpha.1
  - @naivemap/image-layer-core@0.2.0-alpha.1

## 0.2.0-alpha.1

### Minor Changes

- 9cbf2be: Use .es/.umd builds; update docs demos paths

### Patch Changes

- Updated dependencies [9cbf2be]
  - @naivemap/map-gl-layer-adaptor@0.2.0-alpha.0
  - @naivemap/image-layer-core@0.2.0-alpha.0

## 0.2.0-alpha.0

### Minor Changes

- a2d36bf: Refactoring to adapt to Mapbox and MapLibre

## 0.1.0
