# Guide

This repository provides custom layer implementations for both MapLibre GL JS and Mapbox GL JS.

## Architecture

This monorepo follows a three-tier architecture to maximize code reuse:

### Tier 1: Core Runtimes (Engine-agnostic)

- **[@naivemap/echarts-layer-core](./api/echarts-layer-core/)** - ECharts rendering logic (lines, scatter charts) without map dependency
- **[@naivemap/image-layer-core](./api/image-layer-core/)** - Image rendering with projection support (proj4js) without map dependency

### Tier 2: Adaptor Helpers

- **[@naivemap/map-gl-layer-adaptor](./api/map-gl-layer-adaptor/)** - Shared primitives to bridge MapLibre GL JS and Mapbox GL JS lifecycle hooks into core runtime contracts

### Tier 3: Product Packages (Host-specific)

- **[@naivemap/maplibre-gl-echarts-layer](./api/maplibre-gl-echarts-layer/)** - MapLibre GL JS wrapper
- **[@naivemap/maplibre-gl-image-layer](./api/maplibre-gl-image-layer/)** - MapLibre GL JS wrapper
- **[@naivemap/mapbox-gl-echarts-layer](./api/mapbox-gl-echarts-layer/)** - Mapbox GL JS wrapper
- **[@naivemap/mapbox-gl-image-layer](./api/mapbox-gl-image-layer/)** - Mapbox GL JS wrapper

## Quick Start

### [MapLibre ECharsLayer](/api/maplibre-gl-echarts-layer/)

#### Install

> **Note**: Most users only need to install the product packages for their map library. The core and adaptor packages are internal dependencies that are automatically bundled.

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

#### Usage

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

#### Usage

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

#### Usage

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

#### Usage

```ts
import ImageLayer from '@naivemap/mapbox-gl-image-layer'

const layer = new ImageLayer('image-layer', option)
map.addLayer(layer)
```
