import fs from 'fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ReflectionKind } from 'typedoc'
import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import apiJSON1 from '../../api/maplibre-gl-echarts-layer/api.json'
import apiJSON2 from '../../api/maplibre-gl-image-layer/api.json'
import apiJSON3 from '../../api/mapbox-gl-echarts-layer/api.json'
import apiJSON4 from '../../api/mapbox-gl-image-layer/api.json'
import { pascalToKebab, singularToPlural } from './util'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-Hans-CN',
  title: 'Map GL layers',
  // description: '自定义图层集',
  base: '/map-gl-layers/',
  head: [['link', { rel: 'icon', href: '/map-gl-layers/logo.svg' }]],
  cleanUrls: true,
  rewrites: {
    '(.*)/README.md': '(.*)/index.md'
  },
  lastUpdated: true,
  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true
    },
    math: true
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: {
      light: '/logo.svg',
      dark: '/logo.svg'
    },
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'API References', link: '/api' },
      { text: 'Examples', link: '/examples' }
    ],
    sidebar: {
      // '/api': sidebarApi(),
      api: [
        {
          text: 'MapLibreEChartsLayer',
          link: '/api/maplibre-gl-echarts-layer',
          items: sidebarApi('maplibre-gl-echarts-layer', apiJSON1)
        },
        {
          text: 'MapLibreImageLayer',
          link: '/api/maplibre-gl-image-layer',
          items: sidebarApi('maplibre-gl-image-layer', apiJSON2)
        },
        {
          text: 'MapboxEChartsLayer',
          link: '/api/mapbox-gl-echarts-layer',
          items: sidebarApi('mapbox-gl-echarts-layer', apiJSON3)
        },
        {
          text: 'MapboxImageLayer',
          link: '/api/mapbox-gl-image-layer',
          items: sidebarApi('mapbox-gl-image-layer', apiJSON4)
        }
      ],
      '/examples': [
        {
          text: 'Examples',
          link: '/examples',
          items: sidebarExamples()
        }
      ]
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/naivemap/map-gl-layers'
      }
    ],
    editLink: {
      pattern: 'https://github.com/naivemap/map-gl-layers/edit/main/docs/:path'
      // text: '在 GitHub 上编辑此页面'
    },
    footer: {
      // message: '基于 MIT 许可发布',
      copyright: `Copyright © 2025-${new Date().getFullYear()} naivemap`
    },
    // docFooter: {
    //   prev: '上一篇',
    //   next: '下一篇'
    // },
    outline: {
      // label: '目录',
      level: [2, 3]
    },
    lastUpdated: {
      // text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },
    // langMenuLabel: '多语言',
    // returnToTopLabel: '回到顶部',
    // sidebarMenuLabel: '菜单',
    // darkModeSwitchLabel: '主题',
    // lightModeSwitchTitle: '切换到浅色模式',
    // darkModeSwitchTitle: '切换到深色模式',
    // skipToContentLabel: '跳转到内容',
    // notFound: {
    //   title: '找不到页面',
    //   quote: '抱歉，我们无法找到您需要的页面。',
    //   linkLabel: '返回首页',
    //   linkText: '返回首页'
    // },
    search: {
      provider: 'local',
      options: {
        // translations: {
        //   button: {
        //     buttonText: '搜索文档',
        //     buttonAriaLabel: '搜索文档'
        //   },
        //   modal: {
        //     displayDetails: '显示匹配详情',
        //     resetButtonTitle: '清除查询条件',
        //     backButtonTitle: '关闭搜索',
        //     noResultsText: '无法找到相关结果',
        //     footer: {
        //       selectText: '选择',
        //       navigateText: '切换',
        //       closeText: '取消'
        //     }
        //   }
        // }
      }
    }
  }
})

type ApiReflection = {
  kind: number
  name: string
}

type ApiDoc = {
  children?: ApiReflection[]
}

/**
 * 生成 API 侧边栏
 */
function sidebarApi(pkg: string, api: ApiDoc): DefaultTheme.SidebarItem[] {
  const children = Array.isArray(api?.children) ? api.children : []
  if (children.length === 0) return []
  /**
   * 按类型分组 Kinds of reflection:
   * URL_ADDRESS   * https://typedoc.org/api/enums/Models.ReflectionKind.html
   */
  const groups = children.reduce((acc, item) => {
    const key = ReflectionKind[item.kind] ?? 'Unknown'
    if (!acc.has(key)) acc.set(key, [])
    acc.get(key)!.push(item)
    return acc
  }, new Map<string, any[]>())

  const res: DefaultTheme.SidebarItem[] = []
  for (const [key, value] of groups) {
    const path = singularToPlural(pascalToKebab(key))
    res.push({
      text: key,
      items: value.map((item) => ({
        text: item.name,
        link: `/api/${pkg}/${path}/${item.name}`
      }))
    })
  }
  return res
}

/**
 * 生成示例侧边栏
 */
function sidebarExamples(): DefaultTheme.SidebarItem[] {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  const folder = resolve(__dirname, '../../public/demos')
  const files = fs.readdirSync(folder).filter((f) => f.endsWith('html'))

  const res: DefaultTheme.SidebarItem[] = []
  files.forEach((file) => {
    const htmlContent = fs.readFileSync(resolve(folder, file), 'utf-8')
    const htmlContentLines = htmlContent.split('\n')
    const title = htmlContentLines
      .find((l) => l.includes('<title'))
      ?.replace('<title>', '')
      .replace('</title>', '')
      .trim()!
    const name = file.replace('.html', '')
    res.push({ text: title, link: `/examples/${name}` })
  })
  return res
}
