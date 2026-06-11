import { createA2uiStore, a2uiStore, RenderMap } from './store';
import { A2UIParser, a2uiParser, A2UIMessage, BeginRendering, SurfaceUpdate, DataModelUpdate, DeleteSurface } from './parser';

export * from './store';
export * from './parser';

export function init(renderMap?: RenderMap) {
  const store = createA2uiStore();
  
  if (renderMap) {
    store.getState().setRenderMap(renderMap);
  }
  
  a2uiParser.setStore(store);
  
  return store;
}

export { a2uiStore, a2uiParser, A2UIParser };
