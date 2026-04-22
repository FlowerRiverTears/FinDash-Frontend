/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module 'element-plus' {
  const ElementPlus: any
  export default ElementPlus
  export const ElMessage: any
  export const ElMessageBox: any
}

declare module 'element-plus/es/locale/lang/zh-cn' {
  const zhCn: any
  export default zhCn
}

declare module '@element-plus/icons-vue' {
  export const User: any
  export const Lock: any
  export const TrendCharts: any
  export const DataAnalysis: any
  export const Menu: any
  export const Wallet: any
  export const SwitchButton: any
  export const Fold: any
  export const Expand: any
  export const ArrowDown: any
  export const Plus: any
  export const Top: any
  export const Bottom: any
  export const Histogram: any
  export const PieChart: any
  export const List: any
  export const ArrowRight: any
  export const Edit: any
  export const Delete: any
  export const Search: any
}

declare module 'echarts' {
  const echarts: any
  export default echarts
}

declare module 'vue-echarts' {
  const VueECharts: any
  export default VueECharts
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
