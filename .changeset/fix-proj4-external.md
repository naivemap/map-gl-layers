---
'@naivemap/maplibre-gl-image-layer': patch
'@naivemap/mapbox-gl-image-layer': patch
---

修复 UMD 构建将 proj4 打包进产物导致自定义投影（如 EPSG:27700）报错 "Could not parse to valid json" 的问题。将 proj4 标记为 external，使库使用用户通过 `proj4.defs()` 注册的全局 proj4 实例。
