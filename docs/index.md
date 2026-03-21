---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Custom layers'
  text: 'for MapLibre GL JS'
  tagline:
  image:
    src: /logo.svg
    alt: maplibre-gl-layers
  actions:
    - theme: brand
      text: Get started
      link: /guide
    - theme: alt
      text: API References
      link: /api

features:
  - icon: 📊
    title: EChartsLayer
    link: ./api/echarts-layer/
  - icon: 🖼️
    title: ImageLayer
    link: ./api/image-layer 
  - icon: 🧭
    title: Mapbox EChartsLayer
    link: ./api/mapbox-echarts-layer
  - icon: 🛰️
    title: Mapbox ImageLayer
    link: ./api/mapbox-image-layer
  - icon: ✨
    title: One More Thing
    link: https://github.com/naivemap/maplibre-gl-layers
---
