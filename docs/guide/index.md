# Guide

This repository provides custom layer implementations for both MapLibre GL JS and Mapbox GL JS.

## Introduction

MapLibre wrappers:

- EChartsLayer ([@naivemap/maplibre-gl-echarts-layer](https://www.npmjs.com/package/@naivemap/maplibre-gl-echarts-layer))
- ImageLayer ([@naivemap/maplibre-gl-image-layer](https://www.npmjs.com/package/@naivemap/maplibre-gl-image-layer))

Mapbox wrappers:

- EChartsLayer ([@naivemap/mapbox-gl-echarts-layer](https://www.npmjs.com/package/@naivemap/mapbox-gl-echarts-layer))
- ImageLayer ([@naivemap/mapbox-gl-image-layer](https://www.npmjs.com/package/@naivemap/mapbox-gl-image-layer))

All four wrappers reuse the same rendering core, while exposing host-specific custom layer interfaces.

## Getting Started

### [MapLibre EChartsLayer](/api/maplibre-gl-echarts-layer/)

#### Install

::: code-group

```sh [pnpm]
$ pnpm add @naivemap/maplibre-gl-echarts-layer echarts
```

```sh [npm]
$ npm install @naivemap/maplibre-gl-echarts-layer echarts
```

```sh [yarn]
$ yarn add @naivemap/maplibre-gl-echarts-layer echarts
```

:::

### Usage

```ts
import EChartsLayer from '@naivemap/maplibre-gl-echarts-layer'

const layer = new EChartsLayer('echarts-layer', option)
map.addLayer(layer)
```

### [MapLibre ImageLayer](/api/maplibre-gl-image-layer/)

#### Install

::: code-group

```sh [pnpm]
$ pnpm add @naivemap/maplibre-gl-image-layer proj4
```

```sh [npm]
$ npm install @naivemap/maplibre-gl-image-layer proj4
```

```sh [yarn]
$ yarn add @naivemap/maplibre-gl-image-layer proj4
```

:::

### Usage

```ts
import ImageLayer from '@naivemap/maplibre-gl-image-layer'

const layer = new ImageLayer('image-layer', option)
map.addLayer(layer)
```

### [Mapbox EChartsLayer](/api/mapbox-gl-echarts-layer/)

#### Install

::: code-group

```sh [pnpm]
$ pnpm add @naivemap/mapbox-gl-echarts-layer echarts
```

```sh [npm]
$ npm install @naivemap/mapbox-gl-echarts-layer echarts
```

```sh [yarn]
$ yarn add @naivemap/mapbox-gl-echarts-layer echarts
```

:::

### Usage

```ts
import EChartsLayer from '@naivemap/mapbox-gl-echarts-layer'

const layer = new EChartsLayer('echarts-layer', option)
map.addLayer(layer)
```

### [Mapbox ImageLayer](/api/mapbox-gl-image-layer/)

#### Install

::: code-group

```sh [pnpm]
$ pnpm add @naivemap/mapbox-gl-image-layer proj4
```

```sh [npm]
$ npm install @naivemap/mapbox-gl-image-layer proj4
```

```sh [yarn]
$ yarn add @naivemap/mapbox-gl-image-layer proj4
```

:::

### Usage

```ts
import ImageLayer from '@naivemap/mapbox-gl-image-layer'

const layer = new ImageLayer('image-layer', option)
map.addLayer(layer)
```
