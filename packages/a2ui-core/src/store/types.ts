/**
 * A2UI Store 类型定义
 */

/**
 * 错误类型枚举
 */
export enum ErrorType {
  PARSE_ERROR = 'PARSE_ERROR',
  RENDER_ERROR = 'RENDER_ERROR',
  PROTOCOL_ERROR = 'PROTOCOL_ERROR',
  COMPONENT_ERROR = 'COMPONENT_ERROR'
}

/**
 * 错误信息接口
 */
export interface A2uiError {
  type: ErrorType
  content: string
  timestamp?: number
}

/**
 * Hydrate节点接口
 * 用于管理组件节点信息
 */
export interface HydrateNode {
  /** 组件ID */
  componentId: string
  /** React元素（不依赖具体类型） */
  _vnode: unknown
  /** 所属Surface ID */
  ownerSurfaceId: string
  /** 原始协议（JSONL格式） */
  protocol: string
}

/**
 * Surface接口
 * 用于管理渲染表面
 */
export interface Surface {
  /** Surface ID */
  surfaceId: string
  /** 是否开始渲染 */
  beginRender: boolean
  /** 根节点 */
  rootNode: HydrateNode | null
}

/**
 * A2UI Store接口
 */
export interface A2uiStore {
  /** Surface映射表 */
  surfaceMap: Record<string, Surface>
  /** Hydrate节点映射表 */
  hydrateNodeMap: Record<string, HydrateNode>
  /** 错误映射表 */
  errorMap: Record<string, A2uiError>
}

/**
 * Store操作接口
 */
export interface A2uiStoreActions {
  // Surface操作
  addSurface: (surface: Surface) => void
  updateSurface: (surfaceId: string, updates: Partial<Surface>) => void
  deleteSurface: (surfaceId: string) => void
  getSurface: (surfaceId: string) => Surface | undefined

  // HydrateNode操作
  addHydrateNode: (node: HydrateNode) => void
  updateHydrateNode: (componentId: string, updates: Partial<HydrateNode>) => void
  deleteHydrateNode: (componentId: string) => void
  getHydrateNode: (componentId: string) => HydrateNode | undefined

  // Error操作
  addError: (errorId: string, error: A2uiError) => void
  deleteError: (errorId: string) => void
  getError: (errorId: string) => A2uiError | undefined
  clearErrors: () => void

  // 重置store
  reset: () => void
}

/**
 * 完整的Store类型（包含状态和操作）
 */
export type A2uiStoreWithActions = A2uiStore & A2uiStoreActions
