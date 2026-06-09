import type { A2uiStoreWithActions } from './types';
/**
 * 创建A2UI Store
 * 使用zustand/vanilla实现，不依赖React
 */
export declare const createA2uiStore: () => import("zustand/vanilla").StoreApi<A2uiStoreWithActions>;
/**
 * 默认store实例
 */
export declare const a2uiStore: import("zustand/vanilla").StoreApi<A2uiStoreWithActions>;
/**
 * 初始化A2UI Store
 * 创建一个新的store实例
 * @returns 返回新创建的store实例
 */
export declare const init: () => import("zustand/vanilla").StoreApi<A2uiStoreWithActions>;
/**
 * 获取store状态
 */
export declare const getStoreState: () => A2uiStoreWithActions;
/**
 * 订阅store变化
 */
export declare const subscribeToStore: (listener: (state: A2uiStoreWithActions, prevState: A2uiStoreWithActions) => void) => () => void;
//# sourceMappingURL=index.d.ts.map