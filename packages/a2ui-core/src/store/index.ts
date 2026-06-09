import { createStore } from 'zustand/vanilla'
import type { A2uiStore, A2uiStoreActions, A2uiStoreWithActions, Surface, HydrateNode, A2uiError } from './types'

/**
 * 初始状态
 */
const initialState: A2uiStore = {
  surfaceMap: {},
  hydrateNodeMap: {},
  errorMap: {}
}

/**
 * 创建A2UI Store
 * 使用zustand/vanilla实现，不依赖React
 */
export const createA2uiStore = () => {
  return createStore<A2uiStoreWithActions>((set, get) => ({
    ...initialState,

    // Surface操作
    addSurface: (surface: Surface) => {
      set((state) => ({
        surfaceMap: {
          ...state.surfaceMap,
          [surface.surfaceId]: surface
        }
      }))
    },

    updateSurface: (surfaceId: string, updates: Partial<Surface>) => {
      set((state) => {
        const surface = state.surfaceMap[surfaceId]
        if (!surface) return state

        return {
          surfaceMap: {
            ...state.surfaceMap,
            [surfaceId]: { ...surface, ...updates }
          }
        }
      })
    },

    deleteSurface: (surfaceId: string) => {
      set((state) => {
        const { [surfaceId]: _, ...rest } = state.surfaceMap
        return { surfaceMap: rest }
      })
    },

    getSurface: (surfaceId: string) => {
      return get().surfaceMap[surfaceId]
    },

    // HydrateNode操作
    addHydrateNode: (node: HydrateNode) => {
      set((state) => ({
        hydrateNodeMap: {
          ...state.hydrateNodeMap,
          [node.componentId]: node
        }
      }))
    },

    updateHydrateNode: (componentId: string, updates: Partial<HydrateNode>) => {
      set((state) => {
        const node = state.hydrateNodeMap[componentId]
        if (!node) return state

        return {
          hydrateNodeMap: {
            ...state.hydrateNodeMap,
            [componentId]: { ...node, ...updates }
          }
        }
      })
    },

    deleteHydrateNode: (componentId: string) => {
      set((state) => {
        const { [componentId]: _, ...rest } = state.hydrateNodeMap
        return { hydrateNodeMap: rest }
      })
    },

    getHydrateNode: (componentId: string) => {
      return get().hydrateNodeMap[componentId]
    },

    // Error操作
    addError: (errorId: string, error: A2uiError) => {
      set((state) => ({
        errorMap: {
          ...state.errorMap,
          [errorId]: { ...error, timestamp: Date.now() }
        }
      }))
    },

    deleteError: (errorId: string) => {
      set((state) => {
        const { [errorId]: _, ...rest } = state.errorMap
        return { errorMap: rest }
      })
    },

    getError: (errorId: string) => {
      return get().errorMap[errorId]
    },

    clearErrors: () => {
      set({ errorMap: {} })
    },

    // 重置store
    reset: () => {
      set(initialState)
    }
  }))
}

/**
 * 默认store实例
 */
export const a2uiStore = createA2uiStore()

/**
 * 初始化A2UI Store
 * 创建一个新的store实例
 * @returns 返回新创建的store实例
 */
export const init = () => {
  return createA2uiStore()
}

/**
 * 获取store状态
 */
export const getStoreState = () => a2uiStore.getState()

/**
 * 订阅store变化
 */
export const subscribeToStore = a2uiStore.subscribe
