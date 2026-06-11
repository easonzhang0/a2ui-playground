import { createStore } from 'zustand/vanilla';

// 类型定义
export enum ErrorType {
  PARE_ERROR = 'PARE_ERROR',
}

export interface Error {
  type: ErrorType;
  content: string;
}

export interface HydrateNode {
  componentId: string;
  _vnode: any;
  ownerSurfaceId: string;
  protocal: string;
}

export interface Surface {
  surfaceId: string;
  beginrender: boolean;
  rootNode: HydrateNode;
}

export interface RenderFunction {
  (props: any): any;
}

export interface RenderMap {
  [componentName: string]: RenderFunction;
}

export interface A2uiStoreState {
  surfaceMap: Record<string, Surface>;
  hydrateNodeMap: Record<string, HydrateNode>;
  errorMap: Record<string, Error>;
  renderMap: RenderMap | null;
  
  resetStore: () => void;
  
  addSurface: (surface: Surface) => void;
  updateSurface: (surfaceId: string, updates: Partial<Surface>) => void;
  removeSurface: (surfaceId: string) => void;
  getSurface: (surfaceId: string) => Surface | undefined;
  
  addHydrateNode: (node: HydrateNode) => void;
  updateHydrateNode: (componentId: string, updates: Partial<HydrateNode>) => void;
  removeHydrateNode: (componentId: string) => void;
  getHydrateNode: (componentId: string) => HydrateNode | undefined;
  
  addError: (error: Error) => void;
  removeError: (errorId: string) => void;
  getErrors: () => Error[];
  
  setRenderMap: (renderMap: RenderMap) => void;
  getRenderMap: () => RenderMap | null;
  
  clear: () => void;
}

export const createA2uiStore = () => createStore<A2uiStoreState>((set, get) => ({
  surfaceMap: {},
  hydrateNodeMap: {},
  errorMap: {},
  renderMap: null,
  
  resetStore: () => set({
    surfaceMap: {},
    hydrateNodeMap: {},
    errorMap: {},
    renderMap: null
  }),
  
  addSurface: (surface) => set((state) => ({
    surfaceMap: {
      ...state.surfaceMap,
      [surface.surfaceId]: surface
    }
  })),
  
  updateSurface: (surfaceId, updates) => set((state) => ({
    surfaceMap: {
      ...state.surfaceMap,
      [surfaceId]: {
        ...state.surfaceMap[surfaceId],
        ...updates
      }
    }
  })),
  
  removeSurface: (surfaceId) => set((state) => {
    const newHydrateNodeMap = { ...state.hydrateNodeMap };
    Object.entries(newHydrateNodeMap).forEach(([componentId, node]) => {
      if (node.ownerSurfaceId === surfaceId) {
        delete newHydrateNodeMap[componentId];
      }
    });
    
    const newSurfaceMap = { ...state.surfaceMap };
    delete newSurfaceMap[surfaceId];
    
    return {
      surfaceMap: newSurfaceMap,
      hydrateNodeMap: newHydrateNodeMap
    };
  }),
  
  getSurface: (surfaceId) => get().surfaceMap[surfaceId],
  
  addHydrateNode: (node) => set((state) => ({
    hydrateNodeMap: {
      ...state.hydrateNodeMap,
      [node.componentId]: node
    }
  })),
  
  updateHydrateNode: (componentId, updates) => set((state) => {
    const newHydrateNodeMap = {
      ...state.hydrateNodeMap,
      [componentId]: {
        ...state.hydrateNodeMap[componentId],
        ...updates
      }
    };
    
    const newSurfaceMap = { ...state.surfaceMap };
    Object.entries(newSurfaceMap).forEach(([surfaceId, surface]) => {
      if (surface.rootNode.componentId === componentId) {
        newSurfaceMap[surfaceId] = {
          ...surface,
          rootNode: newHydrateNodeMap[componentId]
        };
      }
    });
    
    return {
      hydrateNodeMap: newHydrateNodeMap,
      surfaceMap: newSurfaceMap
    };
  }),
  
  removeHydrateNode: (componentId) => set((state) => {
    const newHydrateNodeMap = { ...state.hydrateNodeMap };
    delete newHydrateNodeMap[componentId];
    return { hydrateNodeMap: newHydrateNodeMap };
  }),
  
  getHydrateNode: (componentId) => get().hydrateNodeMap[componentId],
  
  addError: (error) => set((state) => ({
    errorMap: {
      ...state.errorMap,
      [Date.now().toString()]: error
    }
  })),
  
  removeError: (errorId) => set((state) => {
    const newErrorMap = { ...state.errorMap };
    delete newErrorMap[errorId];
    return { errorMap: newErrorMap };
  }),
  
  getErrors: () => Object.values(get().errorMap),
  
  setRenderMap: (renderMap) => set({ renderMap }),
  
  getRenderMap: () => get().renderMap,
  
  clear: () => set({
    surfaceMap: {},
    hydrateNodeMap: {},
    errorMap: {},
    renderMap: null
  })
}));

export const a2uiStore = createA2uiStore();
