"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToStore = exports.getStoreState = exports.init = exports.a2uiStore = exports.createA2uiStore = void 0;
const vanilla_1 = require("zustand/vanilla");
/**
 * 初始状态
 */
const initialState = {
    surfaceMap: {},
    hydrateNodeMap: {},
    errorMap: {}
};
/**
 * 创建A2UI Store
 * 使用zustand/vanilla实现，不依赖React
 */
const createA2uiStore = () => {
    return (0, vanilla_1.createStore)((set, get) => ({
        ...initialState,
        // Surface操作
        addSurface: (surface) => {
            set((state) => ({
                surfaceMap: {
                    ...state.surfaceMap,
                    [surface.surfaceId]: surface
                }
            }));
        },
        updateSurface: (surfaceId, updates) => {
            set((state) => {
                const surface = state.surfaceMap[surfaceId];
                if (!surface)
                    return state;
                return {
                    surfaceMap: {
                        ...state.surfaceMap,
                        [surfaceId]: { ...surface, ...updates }
                    }
                };
            });
        },
        deleteSurface: (surfaceId) => {
            set((state) => {
                const { [surfaceId]: _, ...rest } = state.surfaceMap;
                return { surfaceMap: rest };
            });
        },
        getSurface: (surfaceId) => {
            return get().surfaceMap[surfaceId];
        },
        // HydrateNode操作
        addHydrateNode: (node) => {
            set((state) => ({
                hydrateNodeMap: {
                    ...state.hydrateNodeMap,
                    [node.componentId]: node
                }
            }));
        },
        updateHydrateNode: (componentId, updates) => {
            set((state) => {
                const node = state.hydrateNodeMap[componentId];
                if (!node)
                    return state;
                return {
                    hydrateNodeMap: {
                        ...state.hydrateNodeMap,
                        [componentId]: { ...node, ...updates }
                    }
                };
            });
        },
        deleteHydrateNode: (componentId) => {
            set((state) => {
                const { [componentId]: _, ...rest } = state.hydrateNodeMap;
                return { hydrateNodeMap: rest };
            });
        },
        getHydrateNode: (componentId) => {
            return get().hydrateNodeMap[componentId];
        },
        // Error操作
        addError: (errorId, error) => {
            set((state) => ({
                errorMap: {
                    ...state.errorMap,
                    [errorId]: { ...error, timestamp: Date.now() }
                }
            }));
        },
        deleteError: (errorId) => {
            set((state) => {
                const { [errorId]: _, ...rest } = state.errorMap;
                return { errorMap: rest };
            });
        },
        getError: (errorId) => {
            return get().errorMap[errorId];
        },
        clearErrors: () => {
            set({ errorMap: {} });
        },
        // 重置store
        reset: () => {
            set(initialState);
        }
    }));
};
exports.createA2uiStore = createA2uiStore;
/**
 * 默认store实例
 */
exports.a2uiStore = (0, exports.createA2uiStore)();
/**
 * 初始化A2UI Store
 * 创建一个新的store实例
 * @returns 返回新创建的store实例
 */
const init = () => {
    return (0, exports.createA2uiStore)();
};
exports.init = init;
/**
 * 获取store状态
 */
const getStoreState = () => exports.a2uiStore.getState();
exports.getStoreState = getStoreState;
/**
 * 订阅store变化
 */
exports.subscribeToStore = exports.a2uiStore.subscribe;
//# sourceMappingURL=index.js.map