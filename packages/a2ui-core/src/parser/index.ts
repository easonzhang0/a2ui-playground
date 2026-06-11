import { Surface, HydrateNode, RenderMap, RenderFunction, ErrorType } from '../store';

export type { RenderMap, RenderFunction };

export interface A2UIMessage {
  beginRendering?: BeginRendering;
  surfaceUpdate?: SurfaceUpdate;
  dataModelUpdate?: DataModelUpdate;
  deleteSurface?: DeleteSurface;
}

export interface BeginRendering {
  surfaceId: string;
  catalogId?: string;
  root: string;
  styles?: Record<string, any>;
}

export interface SurfaceUpdate {
  surfaceId: string;
  components: Component[];
}

export interface Component {
  id: string;
  weight?: number;
  component: Record<string, any>;
}

export interface DataModelUpdate {
  surfaceId: string;
  path?: string;
  contents: DataEntry[];
}

export interface DataEntry {
  key: string;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueMap?: MapEntry[];
}

export interface MapEntry {
  key: string;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
}

export interface DeleteSurface {
  surfaceId: string;
}

export interface StoreApi {
  getState: () => {
    renderMap: RenderMap | null;
    addError: (error: { type: ErrorType; content: string }) => void;
  };
}

export interface ComponentTree {
  root: HydrateNode;
  nodes: Record<string, HydrateNode>;
}

export class A2UIParser {
  private static instance: A2UIParser;
  private store: StoreApi | null = null;

  static getInstance(): A2UIParser {
    if (!A2UIParser.instance) {
      A2UIParser.instance = new A2UIParser();
    }
    return A2UIParser.instance;
  }

  setStore(store: StoreApi): void {
    this.store = store;
  }

  private renderComponent(componentData: Record<string, any>): any {
    if (!this.store) {
      return componentData;
    }

    const state = this.store.getState();
    const renderMap = state.renderMap;
    if (!renderMap) {
      return componentData;
    }

    const componentName = Object.keys(componentData)[0];
    const componentProps = componentData[componentName];

    if (renderMap[componentName]) {
      return renderMap[componentName](componentProps);
    } else {
      // 组件未注册，添加错误信息
      state.addError({
        type: ErrorType.PARE_ERROR,
        content: `Component "${componentName}" is not registered in renderMap`
      });
      return componentData;
    }
  }

  parseMessage(message: A2UIMessage): {
    surface?: Surface;
    hydrateNodes?: HydrateNode[];
    dataModelUpdate?: DataModelUpdate;
    deleteSurface?: DeleteSurface;
  } {
    if (message.beginRendering) {
      return this.parseBeginRendering(message.beginRendering);
    }
    if (message.surfaceUpdate) {
      return this.parseSurfaceUpdate(message.surfaceUpdate);
    }
    if (message.dataModelUpdate) {
      return this.parseDataModelUpdate(message.dataModelUpdate);
    }
    if (message.deleteSurface) {
      return this.parseDeleteSurface(message.deleteSurface);
    }
    throw new Error('Invalid A2UI message: no action specified');
  }

  parseBeginRendering(beginRendering: BeginRendering): {
    surface: Surface;
  } {
    const tempRootNode: HydrateNode = {
      componentId: beginRendering.root,
      _vnode: {},
      ownerSurfaceId: beginRendering.surfaceId,
      protocal: JSON.stringify({ id: beginRendering.root, component: {} })
    };

    const surface: Surface = {
      surfaceId: beginRendering.surfaceId,
      beginrender: true,
      rootNode: tempRootNode
    };
    return { surface };
  }

  parseSurfaceUpdate(surfaceUpdate: SurfaceUpdate): {
    surface: Surface;
    hydrateNodes: HydrateNode[];
  } {
    const hydrateNodes: HydrateNode[] = surfaceUpdate.components.map(component => ({
      componentId: component.id,
      _vnode: this.renderComponent(component.component),
      ownerSurfaceId: surfaceUpdate.surfaceId,
      protocal: JSON.stringify(component)
    }));

    const rootHydrateNode = hydrateNodes.find(node => node.componentId === surfaceUpdate.components[0].id);

    if (!rootHydrateNode) {
      throw new Error('Root component not found in surfaceUpdate');
    }

    const surface: Surface = {
      surfaceId: surfaceUpdate.surfaceId,
      beginrender: false,
      rootNode: rootHydrateNode
    };

    return { surface, hydrateNodes };
  }

  parseDataModelUpdate(dataModelUpdate: DataModelUpdate): {
    dataModelUpdate: DataModelUpdate;
  } {
    return { dataModelUpdate };
  }

  parseDeleteSurface(deleteSurface: DeleteSurface): {
    deleteSurface: DeleteSurface;
  } {
    return { deleteSurface };
  }

  parseJSONL(jsonl: string): A2UIMessage[] {
    return jsonl.split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));
  }

  stringifyJSONL(messages: A2UIMessage[]): string {
    return messages.map(message => JSON.stringify(message)).join('\n');
  }

  treeBuild(hydrateNodes: HydrateNode[]): ComponentTree {
    if (hydrateNodes.length === 0) {
      throw new Error('No hydrate nodes provided for tree building');
    }

    // 简单实现：返回第一个节点作为根节点
    // 实际项目中需要根据父子关系构建完整的树结构
    const root = hydrateNodes[0];
    const nodes: Record<string, HydrateNode> = {};
    
    hydrateNodes.forEach(node => {
      nodes[node.componentId] = node;
    });

    return {
      root,
      nodes
    };
  }
}

export const a2uiParser = A2UIParser.getInstance();
