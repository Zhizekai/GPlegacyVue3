/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_MAP_CODE: string // 自定义环境变量
  readonly VITE_HI:string
  readonly VITE_AMAP_WEB_API_CODE:any
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

